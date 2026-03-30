import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { getMobileSession } from '@/lib/mobile-auth';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(request) {
  try {
    console.log('='.repeat(60));
    console.log('🚀 STRIPE COMPLETE API CALLED');
    console.log('='.repeat(60));

    // 1. Check Mobile Session (via Authorization Header + DB)
    let decoded = await getMobileSession(request);
    let providerId = decoded?.providerId;

    // 2. Fallback to Web Session (via Cookies)
    if (!decoded) {
      const token = request.cookies.get('provider_token')?.value;
      if (token) {
        decoded = verifyToken(token);
        if (decoded && decoded.type === 'provider') {
          providerId = decoded.providerId;
        }
      }
    }

    if (!decoded || !providerId) {
      console.log('❌ Not authenticated');
      return NextResponse.json(
        { success: false, message: 'Not authenticated or session expired' },
        { status: 401 }
      );
    }

    const body = await request.json();
    let accountId = body.accountId;

    // Fallback: If accountId not in body, try fetching from provider_bank_accounts
    if (!accountId) {
      const rows = await execute(
        'SELECT stripe_account_id FROM provider_bank_accounts WHERE provider_id = ?',
        [providerId]
      );
      accountId = rows[0]?.stripe_account_id;
    }

    if (!accountId) {
      console.log('❌ No stripe account found for provider:', providerId);
      return NextResponse.json(
        { success: false, message: 'Stripe account ID missing' },
        { status: 400 }
      );
    }

    let isComplete = false;
    try {
      if (!stripe) {
        throw new Error('Stripe is not initialized. Check STRIPE_SECRET_KEY.');
      }
      const account = await stripe.accounts.retrieve(accountId);

      console.log('📊 Stripe account status:', {
        id: account.id,
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
      });

      // Relaxation match with stripe-return logic
      isComplete = account.details_submitted && account.charges_enabled;
    } catch (stripeError) {
      console.error('❌ Stripe retrieve error:', stripeError.message);
      // Even if stripe fails, we'll try to use the accountId provided
    }

    // 1. Update service_providers
    // Advance to step 4 (Review) which is the standard flow after Stripe
    await execute(
      `UPDATE service_providers 
       SET stripe_account_id = ?,
           stripe_onboarding_complete = ?,
           onboarding_step = 4,
           updated_at = NOW()
       WHERE id = ?`,
      [accountId, isComplete ? 1 : 0, providerId]
    );

    // 2. Update provider_bank_accounts (Sync with stripe-return logic)
    await execute(
      `INSERT INTO provider_bank_accounts 
       (provider_id, stripe_account_id, account_status, onboarding_completed, updated_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         stripe_account_id = VALUES(stripe_account_id),
         account_status    = VALUES(account_status),
         onboarding_completed = VALUES(onboarding_completed),
         updated_at        = NOW()`,
      [
        providerId,
        accountId,
        isComplete ? 'verified' : 'pending',
        isComplete ? 1 : 0,
      ]
    );

    console.log(`✅ Stripe onboarding ${isComplete ? 'completed' : 'updated'} for provider:`, providerId);
    console.log('='.repeat(60));

    return NextResponse.json({
      success: true,
      message: isComplete ? 'Payment method connected successfully.' : 'Stripe account linked. Please complete verification steps.',
      isComplete: isComplete,
      step: 4
    });

  } catch (error) {
    console.error('❌ Error processing stripe completion:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}