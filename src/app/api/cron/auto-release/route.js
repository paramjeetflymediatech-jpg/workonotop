// app/api/cron/auto-release/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { execute, getConnection } from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock')

export async function GET(request) {
  const authHeader = request.headers.get('authorization')
  const secretQuery = request.nextUrl.searchParams.get('secret')
  
  // Allow if in dev, if header matches, or if query parameter matches
  const isAuthorized = 
    process.env.NODE_ENV === 'development' || 
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    (secretQuery && secretQuery === process.env.CRON_SECRET)

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find all bookings awaiting_approval for more than 2 minutes with no customer response
  const expiredBookings = await execute(`
    SELECT b.*, sp.stripe_account_id 
    FROM bookings b
    LEFT JOIN service_providers sp ON b.provider_id = sp.id
    WHERE b.status = 'awaiting_approval'
      AND b.updated_at < DATE_SUB(NOW(), INTERVAL 2 MINUTE)
      AND b.payment_intent_id IS NOT NULL
  `)

  console.log(`Auto-release: Found ${expiredBookings.length} expired bookings`)

  const results = []

  for (const booking of expiredBookings) {
    const connection = await getConnection()
    try {
      await connection.query('START TRANSACTION')

      // Capture payment
      try {
        await stripe.paymentIntents.capture(booking.payment_intent_id)
      } catch (err) {
        if (!err.message.includes('already been captured')) throw err
      }

      // Transfer to provider
      const providerAmount = parseFloat(booking.final_provider_amount || booking.provider_amount || 0)
      const providerAmountCents = Math.round(providerAmount * 100)

      if (providerAmountCents > 0 && booking.stripe_account_id) {
        await stripe.transfers.create({
          amount: providerAmountCents,
          currency: 'gbp',
          destination: booking.stripe_account_id,
          transfer_group: `booking_${booking.id}`,
          metadata: {
            booking_id: booking.id.toString(),
            booking_number: booking.booking_number,
            auto_release: 'true'
          }
        })
      }

      await connection.execute(
        `UPDATE bookings SET status = 'completed', payment_status = 'paid', updated_at = NOW() WHERE id = ?`,
        [booking.id]
      )
      await connection.execute(
        `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'completed', 'Auto-released after 2 minutes - no customer response')`,
        [booking.id]
      )

      await connection.query('COMMIT')
      results.push({ booking_id: booking.id, status: 'released' })
      console.log(`✅ Auto-released booking ${booking.id}`)

    } catch (err) {
      await connection.query('ROLLBACK')
      results.push({ booking_id: booking.id, status: 'failed', error: err.message })
      console.error(`❌ Failed booking ${booking.id}:`, err.message)
    } finally {
      connection.release()
    }
  }

  return NextResponse.json({ success: true, processed: expiredBookings.length, results })
}