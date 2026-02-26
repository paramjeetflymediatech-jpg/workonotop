import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getConnection } from '@/lib/db';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(request) {
  console.log('\n' + '='.repeat(100));
  console.log('🚀 STRIPE WEBHOOK CALLED at:', new Date().toISOString());
  console.log('='.repeat(100));

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
      if (!stripe) {
        throw new Error('Stripe is not initialized. Check STRIPE_SECRET_KEY environment variable.');
      }
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log(`✅ Webhook verified: ${event.type}`);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    if (event.type === 'account.updated') {
      await handleAccountUpdated(event.data.object);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleAccountUpdated(account) {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();
    console.log('🔍 Looking for provider with stripe_account_id:', account.id);

    // ── Find provider by multiple fallback methods ──────────────────────────

    let provider = null;

    // Method 1: By stripe_account_id on service_providers
    const [byStripeId] = await connection.execute(
      'SELECT id FROM service_providers WHERE stripe_account_id = ?',
      [account.id]
    );
    if (byStripeId.length > 0) provider = byStripeId[0];

    // Method 2: By metadata.provider_id
    if (!provider && account.metadata?.provider_id) {
      const [byMeta] = await connection.execute(
        'SELECT id FROM service_providers WHERE id = ?',
        [account.metadata.provider_id]
      );
      if (byMeta.length > 0) provider = byMeta[0];
    }

    // Method 3: By email
    if (!provider && account.email) {
      const [byEmail] = await connection.execute(
        'SELECT id FROM service_providers WHERE email = ?',
        [account.email]
      );
      if (byEmail.length > 0) provider = byEmail[0];
    }

    // Method 4: Via provider_bank_accounts table
    if (!provider) {
      const [bankRows] = await connection.execute(
        'SELECT provider_id FROM provider_bank_accounts WHERE stripe_account_id = ?',
        [account.id]
      );
      if (bankRows.length > 0) {
        const [byBank] = await connection.execute(
          'SELECT id FROM service_providers WHERE id = ?',
          [bankRows[0].provider_id]
        );
        if (byBank.length > 0) provider = byBank[0];
      }
    }

    if (!provider) {
      console.log('❌ No provider found for account:', account.id);
      await connection.rollback();
      return;
    }

    console.log('✅ Found provider ID:', provider.id);

    // ── Determine onboarding status ─────────────────────────────────────────

    const chargesEnabled = account.charges_enabled || false;
    const payoutsEnabled = account.payouts_enabled || false;
    const detailsSubmitted = account.details_submitted || false;
    const cardPayments = account.capabilities?.card_payments;
    const transfers = account.capabilities?.transfers;

    console.log('📊 Account status:', {
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
      cardPayments,
      transfers,
    });

    // ✅ FIX: Relaxed condition — details_submitted + charges_enabled is the
    //   true signal that the provider has completed Stripe onboarding.
    //   Capabilities may lag in sandbox; payouts_enabled can vary by region.
    const isComplete = detailsSubmitted && chargesEnabled;

    if (isComplete) {
      // Mark onboarding complete on service_providers
      await connection.execute(
        `UPDATE service_providers 
         SET stripe_onboarding_complete = 1,
             onboarding_step = 4,
             updated_at = NOW()
         WHERE id = ?`,
        [provider.id]
      );

      // Upsert provider_bank_accounts
      await connection.execute(
        `INSERT INTO provider_bank_accounts 
         (provider_id, stripe_account_id, account_status, onboarding_completed, updated_at)
         VALUES (?, ?, 'verified', 1, NOW())
         ON DUPLICATE KEY UPDATE
           stripe_account_id    = VALUES(stripe_account_id),
           account_status       = 'verified',
           onboarding_completed = 1,
           updated_at           = NOW()`,
        [provider.id, account.id]
      );

      console.log(`✅ Stripe onboarding COMPLETED for provider ${provider.id}`);
    } else {
      // Still update the stripe_account_id linkage even if not yet complete
      await connection.execute(
        `INSERT INTO provider_bank_accounts 
         (provider_id, stripe_account_id, account_status, onboarding_completed, updated_at)
         VALUES (?, ?, 'pending', 0, NOW())
         ON DUPLICATE KEY UPDATE
           stripe_account_id = VALUES(stripe_account_id),
           updated_at        = NOW()`,
        [provider.id, account.id]
      );

      console.log(
        `⏳ Stripe onboarding still PENDING for provider ${provider.id}`
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('❌ handleAccountUpdated error:', error);
  } finally {
    connection.release();
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Stripe webhook endpoint is ready',
    timestamp: new Date().toISOString(),
  });
}




















// import { NextResponse } from 'next/server';
// import Stripe from 'stripe';
// import { getConnection } from '@/lib/db';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export async function POST(request) {
//   console.log('\n' + '='.repeat(100));
//   console.log('🚀 STRIPE WEBHOOK CALLED at:', new Date().toISOString());
//   console.log('='.repeat(100));

//   try {
//     const body = await request.text();
//     const signature = request.headers.get('stripe-signature');

//     if (!signature) {
//       return NextResponse.json(
//         { error: 'Missing stripe-signature header' },
//         { status: 400 }
//       );
//     }

//     const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
//       console.log(`✅ Webhook verified: ${event.type}`);
//     } catch (err) {
//       console.error('❌ Webhook signature verification failed:', err.message);
//       return NextResponse.json(
//         { error: 'Webhook signature verification failed' },
//         { status: 400 }
//       );
//     }

//     if (event.type === 'account.updated') {
//       await handleAccountUpdated(event.data.object);
//     }

//     return NextResponse.json({ received: true });
//   } catch (error) {
//     console.error('❌ Webhook error:', error);
//     return NextResponse.json(
//       { error: 'Webhook handler failed' },
//       { status: 500 }
//     );
//   }
// }

// async function handleAccountUpdated(account) {
//   const connection = await getConnection();

//   try {
//     await connection.beginTransaction();
//     console.log('🔍 Looking for provider with stripe_account_id:', account.id);

//     let provider = null;

//     // Method 1: By stripe_account_id on service_providers
//     const [byStripeId] = await connection.execute(
//       'SELECT id FROM service_providers WHERE stripe_account_id = ?',
//       [account.id]
//     );
//     if (byStripeId.length > 0) provider = byStripeId[0];

//     // Method 2: By metadata.provider_id
//     if (!provider && account.metadata?.provider_id) {
//       const [byMeta] = await connection.execute(
//         'SELECT id FROM service_providers WHERE id = ?',
//         [account.metadata.provider_id]
//       );
//       if (byMeta.length > 0) provider = byMeta[0];
//     }

//     // Method 3: By email
//     if (!provider && account.email) {
//       const [byEmail] = await connection.execute(
//         'SELECT id FROM service_providers WHERE email = ?',
//         [account.email]
//       );
//       if (byEmail.length > 0) provider = byEmail[0];
//     }

//     // Method 4: Via provider_bank_accounts table
//     if (!provider) {
//       const [bankRows] = await connection.execute(
//         'SELECT provider_id FROM provider_bank_accounts WHERE stripe_account_id = ?',
//         [account.id]
//       );
//       if (bankRows.length > 0) {
//         const [byBank] = await connection.execute(
//           'SELECT id FROM service_providers WHERE id = ?',
//           [bankRows[0].provider_id]
//         );
//         if (byBank.length > 0) provider = byBank[0];
//       }
//     }

//     if (!provider) {
//       console.log('❌ No provider found for account:', account.id);
//       await connection.rollback();
//       return;
//     }

//     console.log('✅ Found provider ID:', provider.id);

//     const chargesEnabled   = account.charges_enabled   || false;
//     const payoutsEnabled   = account.payouts_enabled   || false;
//     const detailsSubmitted = account.details_submitted || false;

//     console.log('📊 Account status:', {
//       chargesEnabled,
//       payoutsEnabled,
//       detailsSubmitted,
//     });



//     console.log('🏦 External accounts:', account.external_accounts?.data?.length);
// console.log('📋 Full account:', JSON.stringify({
//   details_submitted: account.details_submitted,
//   charges_enabled: account.charges_enabled,
//   external_accounts_count: account.external_accounts?.data?.length,
//   requirements: account.requirements?.currently_due,
// }));

//     // ✅ FIX: CA sandbox mein charges_enabled kabhi true nahi hota test mode mein
//     // details_submitted = provider ne form complete kar liya — yahi kaafi hai
// const isComplete = detailsSubmitted || (account.external_accounts?.data?.length > 0);

//     const bankStatus = chargesEnabled ? 'verified' : (detailsSubmitted ? 'pending_verification' : 'pending');

//     if (isComplete) {
//       await connection.execute(
//         `UPDATE service_providers
//          SET stripe_onboarding_complete = 1,
//              onboarding_step = 4,
//              updated_at = NOW()
//          WHERE id = ?`,
//         [provider.id]
//       );

//       await connection.execute(
//         `INSERT INTO provider_bank_accounts
//          (provider_id, stripe_account_id, account_status, onboarding_completed, updated_at)
//          VALUES (?, ?, ?, 1, NOW())
//          ON DUPLICATE KEY UPDATE
//            stripe_account_id    = VALUES(stripe_account_id),
//            account_status       = VALUES(account_status),
//            onboarding_completed = 1,
//            updated_at           = NOW()`,
//         [provider.id, account.id, bankStatus]
//       );

//       console.log(`✅ Stripe onboarding COMPLETED for provider ${provider.id}`);
//     } else {
//       await connection.execute(
//         `INSERT INTO provider_bank_accounts
//          (provider_id, stripe_account_id, account_status, onboarding_completed, updated_at)
//          VALUES (?, ?, 'pending', 0, NOW())
//          ON DUPLICATE KEY UPDATE
//            stripe_account_id = VALUES(stripe_account_id),
//            updated_at        = NOW()`,
//         [provider.id, account.id]
//       );

//       console.log(`⏳ Stripe onboarding still PENDING for provider ${provider.id}`);
//     }

//     await connection.commit();
//   } catch (error) {
//     await connection.rollback();
//     console.error('❌ handleAccountUpdated error:', error);
//   } finally {
//     connection.release();
//   }
// }

// export async function GET() {
//   return NextResponse.json({
//     message: 'Stripe webhook endpoint is ready',
//     timestamp: new Date().toISOString(),
//   });
// }