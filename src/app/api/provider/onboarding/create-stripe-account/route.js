import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { execute } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  console.log('\n' + '='.repeat(80));
  console.log('🚀 CREATE STRIPE ACCOUNT CALLED');
  console.log('='.repeat(80));

  try {
    const token = request.cookies.get('provider_token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.type !== 'provider') {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const providerId = decoded.providerId;
    const body = await request.json();
    const refreshUrl =
      body.refreshUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL}/provider/onboarding?step=3`;
    const returnUrl =
      body.returnUrl ||
      `${process.env.NEXT_PUBLIC_APP_URL}/api/provider/onboarding/stripe-return`;

    // Get provider details
    const providers = await execute(
      `SELECT email, name, phone, city, location FROM service_providers WHERE id = ?`,
      [providerId]
    );

    if (providers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Provider not found' },
        { status: 404 }
      );
    }

    const provider = providers[0];

    // Check for existing Stripe account
    const existingAccounts = await execute(
      'SELECT stripe_account_id FROM provider_bank_accounts WHERE provider_id = ?',
      [providerId]
    );

    if (existingAccounts.length > 0 && existingAccounts[0].stripe_account_id) {
      try {
        if (!stripe) {
          throw new Error('Stripe is not initialized.');
        }
        const account = await stripe.accounts.retrieve(
          existingAccounts[0].stripe_account_id
        );
        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: refreshUrl,
          return_url: returnUrl,
          type: 'account_onboarding',
        });
        console.log('✅ Reusing existing Stripe account:', account.id);
        return NextResponse.json({
          success: true,
          accountId: account.id,
          onboardingUrl: accountLink.url,
        });
      } catch (stripeError) {
        console.error('Error retrieving existing account:', stripeError.message);
        // Fall through to create a new account
      }
    }

    // Create new Stripe Express account
    // ✅ FIX: country changed to 'GB' to match UK platform (was 'CA')
    if (!stripe) {
      throw new Error('Stripe is not initialized.');
    }
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'GB',
      email: provider.email,
      business_type: 'individual',
      business_profile: {
        name: provider.name,
        product_description: 'Home services provider',
        mcc: '1520',
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        provider_id: providerId.toString(),
        environment: process.env.NODE_ENV || 'development',
      },
    });

    console.log('✅ Stripe account created:', account.id);

    // Save stripe_account_id to service_providers
    await execute(
      `UPDATE service_providers 
       SET stripe_account_id = ?, updated_at = NOW()
       WHERE id = ?`,
      [account.id, providerId]
    );

    // Insert into provider_bank_accounts
    await execute(
      `INSERT INTO provider_bank_accounts 
       (provider_id, stripe_account_id, account_status, onboarding_completed, created_at, updated_at)
       VALUES (?, ?, 'pending', 0, NOW(), NOW())`,
      [providerId, account.id]
    );

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      success: true,
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error('❌ Stripe account creation error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}



















// // app/api/provider/onboarding/create-stripe-account/route.js - FIXED FOR CANADA
// import { NextResponse } from 'next/server';
// import Stripe from 'stripe';
// import { execute } from '@/lib/db';
// import { verifyToken } from '@/lib/jwt';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export async function POST(request) {
//   console.log('\n' + '='.repeat(80));
//   console.log('🚀 CREATE STRIPE ACCOUNT CALLED');
//   console.log('='.repeat(80));

//   try {
//     const token = request.cookies.get('provider_token')?.value;
//     if (!token) {
//       return NextResponse.json(
//         { success: false, message: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const decoded = verifyToken(token);
//     if (!decoded || decoded.type !== 'provider') {
//       return NextResponse.json(
//         { success: false, message: 'Invalid token' },
//         { status: 401 }
//       );
//     }

//     const providerId = decoded.providerId;
//     const body = await request.json();
//     const refreshUrl =
//       body.refreshUrl ||
//       `${process.env.NEXT_PUBLIC_APP_URL}/provider/onboarding?step=3`;
//     const returnUrl =
//       body.returnUrl ||
//       `${process.env.NEXT_PUBLIC_APP_URL}/api/provider/onboarding/stripe-return`;

//     // Get provider details
//     const providers = await execute(
//       `SELECT email, name, phone, city, location FROM service_providers WHERE id = ?`,
//       [providerId]
//     );

//     if (providers.length === 0) {
//       return NextResponse.json(
//         { success: false, message: 'Provider not found' },
//         { status: 404 }
//       );
//     }

//     const provider = providers[0];

//     // Check for existing Stripe account
//     const existingAccounts = await execute(
//       'SELECT stripe_account_id FROM provider_bank_accounts WHERE provider_id = ?',
//       [providerId]
//     );

//     if (existingAccounts.length > 0 && existingAccounts[0].stripe_account_id) {
//       try {
//         const account = await stripe.accounts.retrieve(
//           existingAccounts[0].stripe_account_id
//         );
//         const accountLink = await stripe.accountLinks.create({
//           account: account.id,
//           refresh_url: refreshUrl,
//           return_url: returnUrl,
//           type: 'account_onboarding',
//         });
//         console.log('✅ Reusing existing Stripe account:', account.id);
//         return NextResponse.json({
//           success: true,
//           accountId: account.id,
//           onboardingUrl: accountLink.url,
//         });
//       } catch (stripeError) {
//         console.error('Error retrieving existing account:', stripeError.message);
//         // Fall through to create a new account
//       }
//     }

//     // ✅ FIXED: Use 'CA' for Canadian platform
//     const account = await stripe.accounts.create({
//       type: 'express',
//       country: 'CA',  // ← SET TO 'CA' FOR CANADA
//       email: provider.email,
//       business_type: 'individual',
//       business_profile: {
//         name: provider.name,
//         product_description: 'Home services provider',
//         mcc: '1520', // General contractors
//       },
//       capabilities: {
//         card_payments: { requested: true },
//         transfers: { requested: true },
//       },
//       metadata: {
//         provider_id: providerId.toString(),
//         environment: process.env.NODE_ENV || 'development',
//       },
//     });

//     console.log('✅ Stripe account created:', account.id);

//     // Save stripe_account_id to service_providers
//     await execute(
//       `UPDATE service_providers
//        SET stripe_account_id = ?, updated_at = NOW()
//        WHERE id = ?`,
//       [account.id, providerId]
//     );

//     // Insert into provider_bank_accounts
//     await execute(
//       `INSERT INTO provider_bank_accounts
//        (provider_id, stripe_account_id, account_status, onboarding_completed, created_at, updated_at)
//        VALUES (?, ?, 'pending', 0, NOW(), NOW())`,
//       [providerId, account.id]
//     );

//     // Create onboarding link
//     const accountLink = await stripe.accountLinks.create({
//       account: account.id,
//       refresh_url: refreshUrl,
//       return_url: returnUrl,
//       type: 'account_onboarding',
//     });

//     return NextResponse.json({
//       success: true,
//       accountId: account.id,
//       onboardingUrl: accountLink.url,
//     });
//   } catch (error) {
//     console.error('❌ Stripe account creation error:', error);
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500 }
//     );
//   }
// }