












// import { NextResponse } from 'next/server';
// import Stripe from 'stripe';
// import { getConnection } from '@/lib/db';

// const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

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
//       if (!stripe) {
//         throw new Error('Stripe is not initialized. Check STRIPE_SECRET_KEY environment variable.');
//       }
//       event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
//       console.log(`✅ Webhook verified: ${event.type}`);
//     } catch (err) {
//       console.error('❌ Webhook signature verification failed:', err.message);
//       return NextResponse.json(
//         { error: 'Webhook signature verification failed' },
//         { status: 400 }
//       );
//     }

//     switch (event.type) {
//       case 'account.updated':
//         await handleAccountUpdated(event.data.object);
//         break;
        
//       case 'transfer.created':
//         console.log('Transfer created:', event.data.object.id);
//         break;
        
//       case 'transfer.paid':
//         await handleTransferPaid(event.data.object);
//         break;
        
//       case 'transfer.failed':
//         await handleTransferFailed(event.data.object);
//         break;
        
//       default:
//         console.log(`Unhandled event type: ${event.type}`);
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

// async function handleTransferPaid(transfer) {
//   const connection = await getConnection();
  
//   try {
//     await connection.beginTransaction();
    
//     if (transfer.metadata?.booking_id) {
//       const amount = (transfer.amount / 100).toFixed(2);
//       await connection.execute(
//         `INSERT INTO booking_status_history (booking_id, status, notes, created_at) 
//          VALUES (?, 'transfer_completed', ?, NOW())`,
//         [transfer.metadata.booking_id, `💰 £${amount} transferred to provider`]
//       );
//       console.log(`✅ Transfer ${transfer.id} paid for booking ${transfer.metadata.booking_id}`);
//     }
    
//     await connection.commit();
//   } catch (error) {
//     await connection.rollback();
//     console.error('❌ handleTransferPaid error:', error);
//   } finally {
//     connection.release();
//   }
// }

// async function handleTransferFailed(transfer) {
//   const connection = await getConnection();
  
//   try {
//     await connection.beginTransaction();
    
//     if (transfer.metadata?.booking_id) {
//       await connection.execute(
//         `INSERT INTO booking_status_history (booking_id, status, notes, created_at) 
//          VALUES (?, 'transfer_failed', ?, NOW())`,
//         [transfer.metadata.booking_id, `❌ Transfer failed: ${transfer.failure_message || 'Unknown error'}`]
//       );
//       console.log(`❌ Transfer ${transfer.id} failed for booking ${transfer.metadata.booking_id}`);
//     }
    
//     await connection.commit();
//   } catch (error) {
//     await connection.rollback();
//     console.error('❌ handleTransferFailed error:', error);
//   } finally {
//     connection.release();
//   }
// }

// async function handleAccountUpdated(account) {
//   const connection = await getConnection();

//   try {
//     await connection.beginTransaction();
//     console.log('🔍 Looking for provider with stripe_account_id:', account.id);

//     let provider = null;

//     const [byStripeId] = await connection.execute(
//       'SELECT id FROM service_providers WHERE stripe_account_id = ?',
//       [account.id]
//     );
//     if (byStripeId.length > 0) provider = byStripeId[0];

//     if (!provider && account.metadata?.provider_id) {
//       const [byMeta] = await connection.execute(
//         'SELECT id FROM service_providers WHERE id = ?',
//         [account.metadata.provider_id]
//       );
//       if (byMeta.length > 0) provider = byMeta[0];
//     }

//     if (!provider && account.email) {
//       const [byEmail] = await connection.execute(
//         'SELECT id FROM service_providers WHERE email = ?',
//         [account.email]
//       );
//       if (byEmail.length > 0) provider = byEmail[0];
//     }

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

//     const chargesEnabled = account.charges_enabled || false;
//     const payoutsEnabled = account.payouts_enabled || false;
//     const detailsSubmitted = account.details_submitted || false;
//     const cardPayments = account.capabilities?.card_payments;
//     const transfers = account.capabilities?.transfers;

//     console.log('📊 Account status:', {
//       chargesEnabled,
//       payoutsEnabled,
//       detailsSubmitted,
//       cardPayments,
//       transfers,
//     });

//     const isComplete = detailsSubmitted && chargesEnabled;

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
//          VALUES (?, ?, 'verified', 1, NOW())
//          ON DUPLICATE KEY UPDATE
//            stripe_account_id    = VALUES(stripe_account_id),
//            account_status       = 'verified',
//            onboarding_completed = 1,
//            updated_at           = NOW()`,
//         [provider.id, account.id]
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

    switch (event.type) {
      case 'account.updated':
        await handleAccountUpdated(event.data.object);
        break;
        
      case 'transfer.created':
        console.log('Transfer created:', event.data.object.id);
        break;
        
      case 'transfer.paid':
        await handleTransferPaid(event.data.object);
        break;
        
      case 'transfer.failed':
        await handleTransferFailed(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
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

async function handleTransferPaid(transfer) {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    if (transfer.metadata?.booking_id) {
      const bookingId = transfer.metadata.booking_id;
      const amount = (transfer.amount / 100).toFixed(2);
      
      // Update provider_payouts status to 'paid'
      await connection.execute(
        `UPDATE provider_payouts 
         SET status = 'paid', paid_at = NOW() 
         WHERE stripe_transfer_id = ? OR booking_id = ?`,
        [transfer.id, bookingId]
      );
      
      // Update service_providers balances (move from pending to available)
      await connection.execute(
        `UPDATE service_providers sp
         JOIN provider_payouts pp ON pp.provider_id = sp.id
         SET sp.available_balance = sp.available_balance + pp.amount,
             sp.pending_balance = sp.pending_balance - pp.amount
         WHERE pp.stripe_transfer_id = ?`,
        [transfer.id]
      );
      
      // Add to status history
      await connection.execute(
        `INSERT INTO booking_status_history (booking_id, status, notes, created_at) 
         VALUES (?, 'transfer_completed', ?, NOW())`,
        [bookingId, `💰 £${amount} transferred to provider and settled`]
      );
      
      console.log(`✅ Transfer ${transfer.id} paid - Payout updated to 'paid' for booking ${bookingId}`);
    }
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('❌ handleTransferPaid error:', error);
  } finally {
    connection.release();
  }
}

async function handleTransferFailed(transfer) {
  const connection = await getConnection();
  
  try {
    await connection.beginTransaction();
    
    if (transfer.metadata?.booking_id) {
      const bookingId = transfer.metadata.booking_id;
      
      // Update provider_payouts status to 'failed'
      await connection.execute(
        `UPDATE provider_payouts 
         SET status = 'failed' 
         WHERE stripe_transfer_id = ? OR booking_id = ?`,
        [transfer.id, bookingId]
      );
      
      // Add to status history
      await connection.execute(
        `INSERT INTO booking_status_history (booking_id, status, notes, created_at) 
         VALUES (?, 'transfer_failed', ?, NOW())`,
        [bookingId, `❌ Transfer failed: ${transfer.failure_message || 'Unknown error'}`]
      );
      
      console.log(`❌ Transfer ${transfer.id} failed for booking ${bookingId}`);
    }
    
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error('❌ handleTransferFailed error:', error);
  } finally {
    connection.release();
  }
}

async function handleAccountUpdated(account) {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();
    console.log('🔍 Looking for provider with stripe_account_id:', account.id);

    let provider = null;

    const [byStripeId] = await connection.execute(
      'SELECT id FROM service_providers WHERE stripe_account_id = ?',
      [account.id]
    );
    if (byStripeId.length > 0) provider = byStripeId[0];

    if (!provider && account.metadata?.provider_id) {
      const [byMeta] = await connection.execute(
        'SELECT id FROM service_providers WHERE id = ?',
        [account.metadata.provider_id]
      );
      if (byMeta.length > 0) provider = byMeta[0];
    }

    if (!provider && account.email) {
      const [byEmail] = await connection.execute(
        'SELECT id FROM service_providers WHERE email = ?',
        [account.email]
      );
      if (byEmail.length > 0) provider = byEmail[0];
    }

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

    const isComplete = detailsSubmitted && chargesEnabled;

    if (isComplete) {
      await connection.execute(
        `UPDATE service_providers 
         SET stripe_onboarding_complete = 1,
             onboarding_step = 4,
             updated_at = NOW()
         WHERE id = ?`,
        [provider.id]
      );

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
      await connection.execute(
        `INSERT INTO provider_bank_accounts 
         (provider_id, stripe_account_id, account_status, onboarding_completed, updated_at)
         VALUES (?, ?, 'pending', 0, NOW())
         ON DUPLICATE KEY UPDATE
           stripe_account_id = VALUES(stripe_account_id),
           updated_at        = NOW()`,
        [provider.id, account.id]
      );

      console.log(`⏳ Stripe onboarding still PENDING for provider ${provider.id}`);
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