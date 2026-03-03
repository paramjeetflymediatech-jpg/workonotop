


// import { NextResponse } from 'next/server'
// import Stripe from 'stripe'
// import { getConnection } from '@/lib/db'
// import { verifyToken } from '@/lib/jwt'

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// // Helper function to calculate pro-rated amount based on actual minutes worked
// function calculateFinalAmount(basePrice, standardMinutes, actualMinutes, overtimeRate = 0) {
//   const maxOvertimeHours = 2
//   const maxOvertimeMins = maxOvertimeHours * 60
  
//   // If job took less time than estimated
//   if (actualMinutes < standardMinutes) {
//     const percentageWorked = actualMinutes / standardMinutes
//     return Math.round((basePrice * percentageWorked) * 100) / 100
//   }
  
//   // If job took more time (overtime) - capped at 2 hours
//   if (actualMinutes > standardMinutes && overtimeRate > 0) {
//     const overtimeMins = Math.min(actualMinutes - standardMinutes, maxOvertimeMins)
//     const overtimeHours = overtimeMins / 60
//     const overtimeCost = overtimeRate * overtimeHours
//     return basePrice + overtimeCost
//   }
  
//   // Exact time
//   return basePrice
// }

// export async function POST(request, { params }) {
//   const token = request.cookies.get('customer_token')?.value
//   if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  
//   const decoded = verifyToken(token)
//   if (!decoded) return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })

//   const { id } = await params
//   const { action, dispute_reason } = await request.json()

//   if (!['approve', 'dispute'].includes(action)) {
//     return NextResponse.json({ success: false, message: 'action must be approve or dispute' }, { status: 400 })
//   }

//   const connection = await getConnection()
//   await connection.query('START TRANSACTION')

//   try {
//     const [[booking]] = await connection.execute(
//       `SELECT b.*, sp.stripe_account_id, sp.name as provider_name, 
//               sp.stripe_onboarding_complete,
//               s.duration_minutes as standard_duration
//        FROM bookings b
//        LEFT JOIN service_providers sp ON b.provider_id = sp.id
//        LEFT JOIN services s ON b.service_id = s.id
//        WHERE b.id = ? AND b.user_id = ?`,
//       [id, decoded.id]
//     )

//     if (!booking) {
//       await connection.query('ROLLBACK')
//       return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 })
//     }

//     if (booking.status !== 'awaiting_approval') {
//       await connection.query('ROLLBACK')
//       return NextResponse.json({ success: false, message: `Booking status is '${booking.status}', not awaiting_approval` }, { status: 400 })
//     }

//     // DISPUTE
//     if (action === 'dispute') {
//       if (!dispute_reason) {
//         await connection.query('ROLLBACK')
//         return NextResponse.json({ success: false, message: 'Dispute reason is required' }, { status: 400 })
//       }
//       await connection.execute(
//         `UPDATE bookings SET status = 'disputed', updated_at = NOW() WHERE id = ?`, [id]
//       )
//       await connection.execute(
//         `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'disputed', ?)`,
//         [id, `Customer disputed: ${dispute_reason}`]
//       )
//       await connection.query('COMMIT')
//       return NextResponse.json({ success: true, message: 'Dispute raised. Admin will review within 24 hours.' })
//     }

//     // APPROVE - Calculate pro-rated amount based on actual minutes worked
//     if (action === 'approve') {
//       if (!booking.payment_intent_id) {
//         await connection.query('ROLLBACK')
//         return NextResponse.json({ success: false, message: 'No payment intent found' }, { status: 400 })
//       }

//       // Get actual minutes worked from timer
//       const actualMinutes = booking.actual_duration_minutes || 0
//       const standardMinutes = booking.standard_duration_minutes || booking.standard_duration || 60
//       const basePrice = parseFloat(booking.service_price)
//       const overtimeRate = parseFloat(booking.additional_price || 0)
      
//       // Calculate final amount based on actual time
//       const finalAmount = calculateFinalAmount(basePrice, standardMinutes, actualMinutes, overtimeRate)
      
//       // Calculate provider amount (after commission)
//       const commissionPercent = parseFloat(booking.commission_percent || 0)
//       const providerAmount = finalAmount * (1 - (commissionPercent / 100))
      
//       const totalCents = Math.round(finalAmount * 100)
//       const providerCents = Math.round(providerAmount * 100)
//       const commissionAmount = finalAmount - providerAmount
      
//       // Get provider's Stripe account
//       const providerStripeAccountId = booking.stripe_account_id
//       const hasProviderAccount = !!providerStripeAccountId && booking.stripe_onboarding_complete === 1

//       console.log('💰 Pro-rated Payment:', {
//         booking: id,
//         actual_minutes: actualMinutes,
//         standard_minutes: standardMinutes,
//         base_price: basePrice,
//         final_amount: finalAmount,
//         provider_gets: providerAmount,
//         commission: commissionAmount,
//         is_prorated: actualMinutes < standardMinutes,
//         is_overtime: actualMinutes > standardMinutes
//       })

//       try {
//         const paymentIntent = await stripe.paymentIntents.retrieve(booking.payment_intent_id)

//         // ⚡ FIX: Don't update amount, directly capture with amount_to_capture
//         if (paymentIntent.status === 'requires_capture') {
//           console.log(`🔄 Capturing £${finalAmount} from authorized £${paymentIntent.amount/100}`)
          
//           await stripe.paymentIntents.capture(booking.payment_intent_id, {
//             amount_to_capture: totalCents
//           })
          
//           console.log(`✅ Captured £${finalAmount}`)
//         }

//         // Update booking with final amounts
//         await connection.execute(
//           `UPDATE bookings 
//            SET status = 'completed', 
//                payment_status = 'paid',
//                final_provider_amount = ?,
//                updated_at = NOW() 
//            WHERE id = ?`,
//           [providerAmount, id]
//         )

//         // Transfer to provider if they have Stripe account
//         if (hasProviderAccount && providerStripeAccountId && providerCents > 0) {
//           try {
//             const transfer = await stripe.transfers.create({
//               amount: providerCents,
//               currency: 'gbp',
//               destination: providerStripeAccountId,
//               source_transaction: paymentIntent.latest_charge,
//               metadata: {
//                 booking_id: id,
//                 booking_number: booking.booking_number,
//                 provider_id: booking.provider_id,
//                 provider_name: booking.provider_name,
//                 actual_minutes: actualMinutes.toString()
//               },
//               description: `Payment for booking #${booking.booking_number} to ${booking.provider_name}`
//             })
            
//             console.log('✅ Transfer created:', transfer.id)
            
//             let paymentNote = ''
//             if (actualMinutes < standardMinutes) {
//               paymentNote = `💰 Pro-rated: £${providerAmount} sent to ${booking.provider_name} (worked ${actualMinutes}min of ${standardMinutes}min)`
//             } else if (actualMinutes > standardMinutes) {
//               paymentNote = `💰 Overtime: £${providerAmount} sent to ${booking.provider_name} (${actualMinutes}min total)`
//             } else {
//               paymentNote = `💰 £${providerAmount} sent to ${booking.provider_name}`
//             }
            
//             await connection.execute(
//               `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'payment_sent', ?)`,
//               [id, paymentNote]
//             )
            
//           } catch (transferErr) {
//             console.error('❌ Transfer failed:', transferErr)
//             await connection.execute(
//               `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'payment_pending', ?)`,
//               [id, `⚠️ MANUAL: Pay ${booking.provider_name} £${providerAmount} (worked ${actualMinutes}min)`]
//             )
//           }
//         } else {
//           await connection.execute(
//             `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'payment_pending', ?)`,
//             [id, `💰 Pay ${booking.provider_name} £${providerAmount} manually (worked ${actualMinutes}min)`]
//           )
//         }

//         await connection.execute(
//           `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'completed', ?)`,
//           [id, `✅ Customer approved. Final payment: £${finalAmount} for ${actualMinutes}min work`]
//         )

//         await connection.query('COMMIT')

//         // Create success message based on timing
//         let successMessage = ''
//         if (actualMinutes < standardMinutes) {
//           successMessage = `✅ Payment released! You were charged £${finalAmount} for ${actualMinutes}min (pro-rated from £${basePrice} for ${standardMinutes}min)`
//         } else if (actualMinutes > standardMinutes) {
//           successMessage = `✅ Payment released! You were charged £${finalAmount} for ${actualMinutes}min (includes overtime)`
//         } else {
//           successMessage = `✅ Payment released successfully!`
//         }

//         return NextResponse.json({
//           success: true,
//           message: successMessage,
//           data: {
//             total_charged: finalAmount,
//             provider_received: providerAmount,
//             admin_commission: commissionAmount,
//             provider_name: booking.provider_name,
//             actual_minutes: actualMinutes,
//             standard_minutes: standardMinutes,
//             is_prorated: actualMinutes < standardMinutes,
//             is_overtime: actualMinutes > standardMinutes
//           }
//         })

//       } catch (stripeErr) {
//         console.error('❌ Stripe error:', stripeErr)
        
//         if (stripeErr.message.includes('already been captured')) {
//           await connection.execute(
//             `UPDATE bookings SET status = 'completed', payment_status = 'paid', updated_at = NOW() WHERE id = ?`,
//             [id]
//           )
//           await connection.query('COMMIT')
//           return NextResponse.json({
//             success: true,
//             message: 'Booking completed (payment already captured)'
//           })
//         }
        
//         await connection.query('ROLLBACK')
//         return NextResponse.json({
//           success: false,
//           message: 'Payment failed: ' + stripeErr.message
//         }, { status: 400 })
//       }
//     }

//   } catch (error) {
//     await connection.query('ROLLBACK')
//     console.error('Error:', error)
//     return NextResponse.json({ success: false, message: error.message }, { status: 500 })
//   } finally {
//     connection.release()
//   }
// }








import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getConnection } from '@/lib/db'
import { verifyToken } from '@/lib/jwt'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Helper function to calculate pro-rated amount based on actual minutes worked
function calculateFinalAmount(basePrice, standardMinutes, actualMinutes, overtimeRate = 0) {
  const maxOvertimeHours = 2
  const maxOvertimeMins = maxOvertimeHours * 60
  
  // If job took less time than estimated
  if (actualMinutes < standardMinutes) {
    const percentageWorked = actualMinutes / standardMinutes
    return Math.round((basePrice * percentageWorked) * 100) / 100
  }
  
  // If job took more time (overtime) - capped at 2 hours
  if (actualMinutes > standardMinutes && overtimeRate > 0) {
    const overtimeMins = Math.min(actualMinutes - standardMinutes, maxOvertimeMins)
    const overtimeHours = overtimeMins / 60
    const overtimeCost = overtimeRate * overtimeHours
    return basePrice + overtimeCost
  }
  
  // Exact time
  return basePrice
}

export async function POST(request, { params }) {
  const token = request.cookies.get('customer_token')?.value
  if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  
  const decoded = verifyToken(token)
  if (!decoded) return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })

  const { id } = await params
  const { action, dispute_reason } = await request.json()

  if (!['approve', 'dispute'].includes(action)) {
    return NextResponse.json({ success: false, message: 'action must be approve or dispute' }, { status: 400 })
  }

  const connection = await getConnection()
  await connection.query('START TRANSACTION')

  try {
    // Get service duration from services table or booking, with sensible fallback
    // Prefer service duration, then booking.standard_duration_minutes, then 60
    const [[booking]] = await connection.execute(
      `SELECT b.*, 
              sp.stripe_account_id, 
              sp.name as provider_name, 
              sp.stripe_onboarding_complete,
              s.duration_minutes as service_duration,
              COALESCE(s.duration_minutes, b.standard_duration_minutes, 60) as standard_minutes
       FROM bookings b
       LEFT JOIN service_providers sp ON b.provider_id = sp.id
       LEFT JOIN services s ON b.service_id = s.id
       WHERE b.id = ? AND b.user_id = ?`,
      [id, decoded.id]
    )

    if (!booking) {
      await connection.query('ROLLBACK')
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 })
    }

    if (booking.status !== 'awaiting_approval') {
      await connection.query('ROLLBACK')
      return NextResponse.json({ success: false, message: `Booking status is '${booking.status}', not awaiting_approval` }, { status: 400 })
    }

    // DISPUTE
    if (action === 'dispute') {
      if (!dispute_reason) {
        await connection.query('ROLLBACK')
        return NextResponse.json({ success: false, message: 'Dispute reason is required' }, { status: 400 })
      }
      await connection.execute(
        `UPDATE bookings SET status = 'disputed', updated_at = NOW() WHERE id = ?`, [id]
      )
      await connection.execute(
        `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'disputed', ?)`,
        [id, `Customer disputed: ${dispute_reason}`]
      )
      await connection.query('COMMIT')
      return NextResponse.json({ success: true, message: 'Dispute raised. Admin will review within 24 hours.' })
    }

    // APPROVE - Calculate pro-rated amount based on actual minutes worked
    if (action === 'approve') {
      if (!booking.payment_intent_id) {
        await connection.query('ROLLBACK')
        return NextResponse.json({ success: false, message: 'No payment intent found' }, { status: 400 })
      }

      // Get actual minutes worked from booking
      const actualMinutes = parseInt(booking.actual_duration_minutes || 0, 10)
      // Determine standard minutes: prefer the SQL-coalesced `standard_minutes`,
      // fall back to any other duration fields if present, then 60
      const standardMinutes = parseInt(
        booking.standard_minutes || booking.service_duration || booking.standard_duration_minutes || booking.duration_minutes || 60,
        10
      )
      const basePrice = parseFloat(booking.service_price)
      const overtimeRate = parseFloat(booking.additional_price || 0)
      
      // Calculate final amount based on actual time
      const finalAmount = calculateFinalAmount(basePrice, standardMinutes, actualMinutes, overtimeRate)
      
      // Calculate provider amount (after commission)
      const commissionPercent = parseFloat(booking.commission_percent || 0)
      const providerAmount = finalAmount * (1 - (commissionPercent / 100))
      
      const totalCents = Math.round(finalAmount * 100)
      const providerCents = Math.round(providerAmount * 100)
      const commissionAmount = finalAmount - providerAmount
      
      // Get provider's Stripe account
      const providerStripeAccountId = booking.stripe_account_id
      const hasProviderAccount = !!providerStripeAccountId && booking.stripe_onboarding_complete === 1

      console.log('💰 Pro-rated Payment:', {
        booking: id,
        actual_minutes: actualMinutes,
        standard_minutes: standardMinutes,
        base_price: basePrice,
        final_amount: finalAmount,
        provider_gets: providerAmount,
        commission: commissionAmount,
        is_prorated: actualMinutes < standardMinutes,
        is_overtime: actualMinutes > standardMinutes
      })

      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.payment_intent_id)

        // Capture the payment with calculated amount
        if (paymentIntent.status === 'requires_capture') {
          console.log(`🔄 Capturing £${finalAmount} from authorized £${paymentIntent.amount/100}`)
          
          await stripe.paymentIntents.capture(booking.payment_intent_id, {
            amount_to_capture: totalCents
          })
          
          console.log(`✅ Captured £${finalAmount}`)
        }

        // Update booking with final amounts
        await connection.execute(
          `UPDATE bookings 
           SET status = 'completed', 
               payment_status = 'paid',
               final_provider_amount = ?,
               updated_at = NOW() 
           WHERE id = ?`,
          [providerAmount, id]
        )

        // Transfer to provider if they have Stripe account
        if (hasProviderAccount && providerStripeAccountId && providerCents > 0) {
          try {
            const transfer = await stripe.transfers.create({
              amount: providerCents,
              currency: 'gbp',
              destination: providerStripeAccountId,
              source_transaction: paymentIntent.latest_charge,
              metadata: {
                booking_id: id,
                booking_number: booking.booking_number,
                provider_id: booking.provider_id,
                provider_name: booking.provider_name,
                actual_minutes: actualMinutes.toString()
              },
              description: `Payment for booking #${booking.booking_number} to ${booking.provider_name}`
            })
            
            console.log('✅ Transfer created:', transfer.id)
            
            let paymentNote = ''
            if (actualMinutes < standardMinutes) {
              paymentNote = `💰 Pro-rated: £${providerAmount} sent to ${booking.provider_name} (worked ${actualMinutes}min of ${standardMinutes}min)`
            } else if (actualMinutes > standardMinutes) {
              paymentNote = `💰 Overtime: £${providerAmount} sent to ${booking.provider_name} (${actualMinutes}min total)`
            } else {
              paymentNote = `💰 £${providerAmount} sent to ${booking.provider_name}`
            }
            
            await connection.execute(
              `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'payment_sent', ?)`,
              [id, paymentNote]
            )
            
          } catch (transferErr) {
            console.error('❌ Transfer failed:', transferErr)
            await connection.execute(
              `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'payment_pending', ?)`,
              [id, `⚠️ MANUAL: Pay ${booking.provider_name} £${providerAmount} (worked ${actualMinutes}min)`]
            )
          }
        } else {
          await connection.execute(
            `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'payment_pending', ?)`,
            [id, `💰 Pay ${booking.provider_name} £${providerAmount} manually (worked ${actualMinutes}min)`]
          )
        }

        await connection.execute(
          `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'completed', ?)`,
          [id, `✅ Customer approved. Final payment: £${finalAmount} for ${actualMinutes}min work`]
        )

        await connection.query('COMMIT')

        // Create success message based on timing
        let successMessage = ''
        if (actualMinutes < standardMinutes) {
          successMessage = `✅ Payment released! You were charged £${finalAmount} for ${actualMinutes}min (pro-rated from £${basePrice} for ${standardMinutes}min)`
        } else if (actualMinutes > standardMinutes) {
          successMessage = `✅ Payment released! You were charged £${finalAmount} for ${actualMinutes}min (includes overtime)`
        } else {
          successMessage = `✅ Payment released successfully!`
        }

        return NextResponse.json({
          success: true,
          message: successMessage,
          data: {
            total_charged: finalAmount,
            provider_received: providerAmount,
            admin_commission: commissionAmount,
            provider_name: booking.provider_name,
            actual_minutes: actualMinutes,
            standard_minutes: standardMinutes,
            is_prorated: actualMinutes < standardMinutes,
            is_overtime: actualMinutes > standardMinutes
          }
        })

      } catch (stripeErr) {
        console.error('❌ Stripe error:', stripeErr)
        
        if (stripeErr.message.includes('already been captured')) {
          await connection.execute(
            `UPDATE bookings SET status = 'completed', payment_status = 'paid', updated_at = NOW() WHERE id = ?`,
            [id]
          )
          await connection.query('COMMIT')
          return NextResponse.json({
            success: true,
            message: 'Booking completed (payment already captured)'
          })
        }
        
        await connection.query('ROLLBACK')
        return NextResponse.json({
          success: false,
          message: 'Payment failed: ' + stripeErr.message
        }, { status: 400 })
      }
    }

  } catch (error) {
    await connection.query('ROLLBACK')
    console.error('Error:', error)
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  } finally {
    connection.release()
  }
}