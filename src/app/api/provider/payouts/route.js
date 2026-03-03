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

    // Get provider balance
    const providers = await execute(
      `SELECT 
        stripe_onboarding_complete,
        COALESCE(total_earnings, 0) as total_earnings,
        COALESCE(available_balance, 0) as available_balance,
        COALESCE(pending_balance, 0) as pending_balance,
        COALESCE(lifetime_balance, 0) as lifetime_balance
       FROM service_providers 
       WHERE id = ?`,
      [decoded.providerId]
    )

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
      `SELECT service_name, final_provider_amount as amount, end_time
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
          available_balance: parseFloat(provider.available_balance || 0),
          pending_balance: parseFloat(provider.pending_balance || 0),
          total_earnings: parseFloat(provider.total_earnings || 0),
          lifetime_balance: parseFloat(provider.lifetime_balance || 0)
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