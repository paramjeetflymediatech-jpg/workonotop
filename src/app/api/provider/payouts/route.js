import { NextResponse } from 'next/server'
import { execute } from '@/lib/db'
import { verifyToken } from '@/lib/jwt'

export async function GET(request) {
  try {
    // ✅ Cookie-based auth - bilkul aapke jobs API jaisa
    const token = request.cookies.get('provider_token')?.value
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    
    const decoded = verifyToken(token)
    if (!decoded || decoded.type !== 'provider') {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 })
    }

    const providers = await execute(
      `SELECT 
        stripe_onboarding_complete,
        COALESCE(total_earnings, 0) as static_total_earnings,
        COALESCE(available_balance, 0) as static_available_balance,
        COALESCE(pending_balance, 0) as static_pending_balance,
        COALESCE(lifetime_balance, 0) as static_lifetime_balance
       FROM service_providers 
       WHERE id = ?`,
      [decoded.providerId]
    )

    // Calculate balances dynamically from completed bookings
    const [bookingStats] = await execute(
      `SELECT 
        SUM(
          CASE 
            WHEN final_provider_amount > 0 THEN final_provider_amount
            WHEN provider_amount > 0 THEN provider_amount
            WHEN service_price > 0 THEN service_price - (service_price * (COALESCE(commission_percent, 20) / 100))
            ELSE 0
          END
        ) as calculated_earnings
       FROM bookings 
       WHERE provider_id = ? AND status = 'completed'`,
      [decoded.providerId]
    )

    const dynamicEarnings = parseFloat(bookingStats?.calculated_earnings || 0);

    // Get payout history
    const payouts = await execute(
      `SELECT amount, status, created_at
       FROM provider_payouts 
       WHERE provider_id = ? 
       ORDER BY created_at DESC`,
      [decoded.providerId]
    )

    // Get recent completed jobs
    const recentJobs = await execute(
      `SELECT service_name, 
        CASE 
          WHEN final_provider_amount > 0 THEN final_provider_amount
          WHEN provider_amount > 0 THEN provider_amount
          WHEN service_price > 0 THEN service_price - (service_price * (COALESCE(commission_percent, 20) / 100))
          ELSE 0
        END as amount,
        end_time
       FROM bookings 
       WHERE provider_id = ? AND status = 'completed'
       ORDER BY end_time DESC
       LIMIT 5`,
      [decoded.providerId]
    )

    const provider = providers[0] || {}

    return NextResponse.json({
      success: true,
      data: {
        provider: {
          stripe_onboarding: provider.stripe_onboarding_complete ? 'complete' : 'incomplete'
        },
        balances: {
          available_balance: dynamicEarnings, // Use dynamic earnings for now
          pending_balance: parseFloat(provider.static_pending_balance || 0),
          total_earnings: dynamicEarnings,
          lifetime_balance: dynamicEarnings
        },
        payouts: payouts.map(p => ({
          amount: parseFloat(p.amount),
          status: p.status,
          created_at: p.created_at
        })),
        recent_jobs: recentJobs.map(j => ({
          service_name: j.service_name,
          amount: parseFloat(j.amount || 0),
          end_time: j.end_time
        }))
      }
    })

  } catch (error) {
    console.error('Payouts error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to load payouts' 
    }, { status: 500 })
  }
}