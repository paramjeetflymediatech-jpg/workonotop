// import { NextResponse } from 'next/server';
// import Stripe from 'stripe';
// import { execute } from '@/lib/db';
// import { verifyToken } from '@/lib/jwt';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export async function GET(request) {
//   console.log('\n' + '='.repeat(80));
//   console.log('🚀 STRIPE RETURN CALLED');
//   console.log('='.repeat(80));

//   try {
//     const token = request.cookies.get('provider_token')?.value;

//     if (!token) {
//       return NextResponse.redirect(new URL('/provider/login', request.url));
//     }

//     const decoded = verifyToken(token);
//     if (!decoded || decoded.type !== 'provider') {
//       return NextResponse.redirect(new URL('/provider/login', request.url));
//     }

//     const providerId = decoded.providerId;

//     // Get account ID from DB (more reliable than query param)
//     const rows = await execute(
//       'SELECT stripe_account_id FROM provider_bank_accounts WHERE provider_id = ?',
//       [providerId]
//     );

//     const accountId = rows[0]?.stripe_account_id;

//     if (!accountId) {
//       console.log('❌ No stripe account found for provider:', providerId);
//       return NextResponse.redirect(
//         new URL('/provider/onboarding?step=3&error=no_account', request.url)
//       );
//     }

//     try {
//       const account = await stripe.accounts.retrieve(accountId);

//       console.log('📊 Stripe account on return:', {
//         id: account.id,
//         details_submitted: account.details_submitted,
//         charges_enabled: account.charges_enabled,
//         payouts_enabled: account.payouts_enabled,
//       });

//       // ✅ FIX: Relaxed condition — details_submitted + charges_enabled is enough
//       // The webhook (account.updated) will finalize the full verification
//       const isComplete =
//         account.details_submitted && account.charges_enabled;

//       // Update service_providers — always advance to step 4 on return
//       await execute(
//         `UPDATE service_providers 
//          SET stripe_account_id = ?,
//              stripe_onboarding_complete = ?,
//              onboarding_step = 4,
//              updated_at = NOW()
//          WHERE id = ?`,
//         [accountId, isComplete ? 1 : 0, providerId]
//       );

//       // Update provider_bank_accounts
//       await execute(
//         `INSERT INTO provider_bank_accounts 
//          (provider_id, stripe_account_id, account_status, onboarding_completed, updated_at)
//          VALUES (?, ?, ?, ?, NOW())
//          ON DUPLICATE KEY UPDATE
//            stripe_account_id = VALUES(stripe_account_id),
//            account_status    = VALUES(account_status),
//            onboarding_completed = VALUES(onboarding_completed),
//            updated_at        = NOW()`,
//         [
//           providerId,
//           accountId,
//           isComplete ? 'verified' : 'pending',
//           isComplete ? 1 : 0,
//         ]
//       );

//       console.log(
//         `✅ Provider ${providerId} returned from Stripe. isComplete: ${isComplete}`
//       );

//       // ✅ FIX: Always redirect to step 4 — never send back to step 3
//       return NextResponse.redirect(
//         new URL(
//           `/provider/onboarding?step=4${isComplete ? '&stripe_complete=true' : ''}`,
//           request.url
//         )
//       );
//     } catch (stripeError) {
//       console.error('❌ Stripe retrieve error:', stripeError.message);
//       return NextResponse.redirect(
//         new URL('/provider/onboarding?step=3&error=stripe_error', request.url)
//       );
//     }
//   } catch (error) {
//     console.error('❌ Stripe return handler error:', error);
//     return NextResponse.redirect(
//       new URL('/provider/onboarding?step=3&error=server_error', request.url)
//     );
//   }
// }

















import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function GET(request) {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 STRIPE RETURN CALLED');
  console.log('='.repeat(80));

  try {
    const token = request.cookies.get('provider_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/provider/login', process.env.NEXT_PUBLIC_APP_URL));
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== 'provider') {
      return NextResponse.redirect(new URL('/provider/login', process.env.NEXT_PUBLIC_APP_URL));
    }

    const providerId = decoded.providerId;

    // Get account ID from DB (more reliable than query param)
    const rows = await execute(
      'SELECT stripe_account_id FROM provider_bank_accounts WHERE provider_id = ?',
      [providerId]
    );

    const accountId = rows[0]?.stripe_account_id;

    if (!accountId) {
      console.log('❌ No stripe account found for provider:', providerId);
      return NextResponse.redirect(
        new URL('/provider/onboarding?step=3&error=no_account', process.env.NEXT_PUBLIC_APP_URL)
      );
    }

    try {
      if (!stripe) {
        throw new Error('Stripe is not initialized. Check STRIPE_SECRET_KEY.');
      }
      const account = await stripe.accounts.retrieve(accountId);

      console.log('📊 Stripe account on return:', {
        id: account.id,
        details_submitted: account.details_submitted,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
      });

      // ✅ FIX: Relaxed condition — details_submitted + charges_enabled is enough
      // The webhook (account.updated) will finalize the full verification
      const isComplete =
        account.details_submitted && account.charges_enabled;

      // Update service_providers — always advance to step 4 on return
      await execute(
        `UPDATE service_providers 
         SET stripe_account_id = ?,
             stripe_onboarding_complete = ?,
             onboarding_step = 4,
             updated_at = NOW()
         WHERE id = ?`,
        [accountId, isComplete ? 1 : 0, providerId]
      );

      // Update provider_bank_accounts
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

      console.log(
        `✅ Provider ${providerId} returned from Stripe. isComplete: ${isComplete}`
      );

      // ✅ FIX: Always redirect to step 4 using environment variable
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      return NextResponse.redirect(
        new URL(
          `/provider/onboarding?step=4${isComplete ? '&stripe_complete=true' : ''}`,
          baseUrl
        )
      );
    } catch (stripeError) {
      console.error('❌ Stripe retrieve error:', stripeError.message);
      return NextResponse.redirect(
        new URL('/provider/onboarding?step=3&error=stripe_error', process.env.NEXT_PUBLIC_APP_URL)
      );
    }
  } catch (error) {
    console.error('❌ Stripe return handler error:', error);
    return NextResponse.redirect(
      new URL('/provider/onboarding?step=3&error=server_error', process.env.NEXT_PUBLIC_APP_URL)
    );
  }
}