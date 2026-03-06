












// import { NextResponse } from 'next/server'
// import Stripe from 'stripe'
// import { getConnection } from '@/lib/db'
// import { verifyToken } from '@/lib/jwt'
// import { sendEmail } from '@/lib/email'

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

// // Receipt email HTML generator using your email layout
// function getReceiptEmailHtml(data, isCustomer = true) {
//   const { 
//     bookingNumber, 
//     serviceName, 
//     customerName, 
//     providerName, 
//     finalAmount,
//     providerAmount,
//     actualMinutes,
//     standardMinutes,
//     isProrated,
//     isOvertime,
//     jobDate
//   } = data

//   const role = isCustomer ? 'Customer' : 'Provider'
//   const recipientName = isCustomer ? customerName : providerName
//   const amount = isCustomer ? finalAmount : providerAmount
//   const amountLabel = isCustomer ? 'Total Paid' : 'Your Earnings'
  
//   const percentageWorked = Math.round((actualMinutes / standardMinutes) * 100)
//   const formattedDate = jobDate ? new Date(jobDate).toLocaleDateString() : new Date().toLocaleDateString()

//   const body = `
//     <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#0f172a;">Hi ${recipientName},</p>
//     <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
//       ${isCustomer 
//         ? `Thank you for your payment. Your booking with <strong>${providerName}</strong> has been completed successfully.` 
//         : `Payment has been processed for your service <strong>"${serviceName}"</strong> provided to ${customerName}.`}
//     </p>

//     <!-- Booking Details Box -->
//     <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:24px;">
//       <tr>
//         <td style="padding:20px;">
//           <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0f172a;">Booking Details</p>
//           <p style="margin:0 0 8px;font-size:14px;color:#334155;"><strong>Booking #:</strong> ${bookingNumber}</p>
//           <p style="margin:0 0 8px;font-size:14px;color:#334155;"><strong>Service:</strong> ${serviceName}</p>
//           <p style="margin:0 0 8px;font-size:14px;color:#334155;"><strong>Date:</strong> ${formattedDate}</p>
//           <p style="margin:0 0 8px;font-size:14px;color:#334155;"><strong>Duration:</strong> ${actualMinutes} minutes 
//             ${isProrated ? `(${percentageWorked}% of standard ${standardMinutes}min)` : ''}
//             ${isOvertime ? '(includes overtime)' : ''}
//           </p>
//         </td>
//       </tr>
//     </table>

//     <!-- Amount Box -->
//     <table width="100%" cellpadding="0" cellspacing="0" style="background:${isCustomer ? '#f0fdf4' : '#eff6ff'};border:1px solid ${isCustomer ? '#bbf7d0' : '#bae6fd'};border-radius:12px;margin-bottom:24px;">
//       <tr>
//         <td style="padding:20px;text-align:center;">
//           <p style="margin:0 0 5px;font-size:14px;color:#64748b;">${amountLabel}</p>
//           <p style="margin:0;font-size:36px;font-weight:bold;color:${isCustomer ? '#16a34a' : '#2563eb'};">$${amount.toFixed(2)}</p>
//         </td>
//       </tr>
//     </table>

//     ${!isCustomer ? `
//     <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;border-radius:8px;margin-bottom:24px;">
//       <tr>
//         <td style="padding:15px;">
//           <p style="margin:0;font-size:14px;color:#475569;"><strong>Customer:</strong> ${customerName}</p>
//         </td>
//       </tr>
//     </table>
//     ` : ''}

//     <p style="margin:24px 0 0;font-size:14px;color:#64748b;">
//       This receipt is for your records. Thank you for using WorkOnTap!
//     </p>
//     <p style="margin:8px 0 0;font-size:14px;color:#64748b;">
//       Best regards,<br>
//       The WorkOnTap Team
//     </p>
//   `;

//   return `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//   <title>Payment Receipt</title>
// </head>
// <body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">

//   <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
//     <tr>
//       <td align="center">
//         <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

//           <!-- Logo Bar -->
//           <tr>
//             <td align="center" style="padding-bottom:20px;">
//               <span style="font-size:22px;font-weight:700;color:#0f766e;letter-spacing:-0.5px;">Work<span style="color:#0891b2;">On</span>Tap</span>
//             </td>
//           </tr>

//           <!-- Card -->
//           <tr>
//             <td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

//               <!-- Header Banner -->
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr>
//                   <td style="background:${isCustomer ? 'linear-gradient(135deg, #0f766e, #0891b2)' : 'linear-gradient(135deg, #7e22ce, #9333ea)'};padding:40px 32px;text-align:center;">
//                     <div style="font-size:48px;margin-bottom:12px;">${isCustomer ? '🧾' : '💰'}</div>
//                     <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.3px;">
//                       ${isCustomer ? 'Payment Receipt' : 'Payment Received'}
//                     </h1>
//                   </td>
//                 </tr>
//               </table>

//               <!-- Body -->
//               <table width="100%" cellpadding="0" cellspacing="0">
//                 <tr>
//                   <td style="padding:40px 40px 32px;">
//                     ${body}
//                   </td>
//                 </tr>
//               </table>

//             </td>
//           </tr>

//           <!-- Footer -->
//           <tr>
//             <td style="padding:24px 0;text-align:center;">
//               <p style="margin:0 0 4px;font-size:13px;color:#94a3b8;">© ${new Date().getFullYear()} WorkOnTap · Calgary, Alberta, Canada</p>
//               <p style="margin:0;font-size:12px;color:#cbd5e1;">This receipt was sent to you because you have a booking on WorkOnTap.</p>
//             </td>
//           </tr>

//         </table>
//       </td>
//     </tr>
//   </table>

// </body>
// </html>`;
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
//     // Get service duration from services table or booking, with sensible fallback
//     const [[booking]] = await connection.execute(
//       `SELECT b.*, 
//               sp.stripe_account_id, 
//               sp.name as provider_name,
//               sp.email as provider_email,
//               sp.stripe_onboarding_complete,
//               s.duration_minutes as service_duration,
//               COALESCE(s.duration_minutes, b.standard_duration_minutes, 60) as standard_minutes
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

//       // Get actual minutes worked from booking
//       const actualMinutes = parseInt(booking.actual_duration_minutes || 0, 10)
//       // Determine standard minutes
//       const standardMinutes = parseInt(
//         booking.standard_minutes || booking.service_duration || booking.standard_duration_minutes || booking.duration_minutes || 60,
//         10
//       )
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

//       console.log('💰 Payment:', {
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

//         // Capture the payment with calculated amount
//         if (paymentIntent.status === 'requires_capture') {
//           console.log(`🔄 Capturing $${finalAmount} from authorized $${paymentIntent.amount/100}`)
          
//           await stripe.paymentIntents.capture(booking.payment_intent_id, {
//             amount_to_capture: totalCents
//           })
          
//           console.log(`✅ Captured $${finalAmount}`)
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

//         let transferId = null

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
            
//             transferId = transfer.id
//             console.log('✅ Transfer created:', transfer.id)
            
//             let paymentNote = ''
//             if (actualMinutes < standardMinutes) {
//               paymentNote = `💰 Pro-rated: $${providerAmount} sent to ${booking.provider_name} (worked ${actualMinutes}min of ${standardMinutes}min)`
//             } else if (actualMinutes > standardMinutes) {
//               paymentNote = `💰 Overtime: $${providerAmount} sent to ${booking.provider_name} (${actualMinutes}min total)`
//             } else {
//               paymentNote = `💰 $${providerAmount} sent to ${booking.provider_name}`
//             }
            
//             await connection.execute(
//               `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'payment_sent', ?)`,
//               [id, paymentNote]
//             )
            
//           } catch (transferErr) {
//             console.error('❌ Transfer failed:', transferErr)
//             await connection.execute(
//               `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'payment_pending', ?)`,
//               [id, `⚠️ MANUAL: Pay ${booking.provider_name} $${providerAmount} (worked ${actualMinutes}min)`]
//             )
//           }
//         } else {
//           await connection.execute(
//             `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'payment_pending', ?)`,
//             [id, `💰 Pay ${booking.provider_name} $${providerAmount} manually (worked ${actualMinutes}min)`]
//           )
//         }

//         // ========== NEW CODE: Record payout in provider_payouts table ==========
//         if (providerAmount > 0 && booking.provider_id) {
//           await connection.execute(
//             `INSERT INTO provider_payouts 
//              (provider_id, amount, status, stripe_transfer_id, booking_id, notes, created_at)
//              VALUES (?, ?, 'pending', ?, ?, ?, NOW())`,
//             [booking.provider_id, providerAmount, transferId, id, 
//              `Payment for booking #${booking.booking_number}`]
//           );

//           // Update provider balances
//           await connection.execute(
//             `UPDATE service_providers 
//              SET total_earnings = total_earnings + ?,
//                  available_balance = available_balance + ?,
//                  lifetime_balance = lifetime_balance + ?
//              WHERE id = ?`,
//             [providerAmount, providerAmount, providerAmount, booking.provider_id]
//           );
          
//           console.log(`✅ Payout recorded for provider ${booking.provider_id}: $${providerAmount}`);
//         }
//         // ========== END OF NEW CODE ==========

//         await connection.execute(
//           `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'completed', ?)`,
//           [id, `✅ Customer approved. Final payment: $${finalAmount} for ${actualMinutes}min work`]
//         )

//         await connection.query('COMMIT')

//         // ===== SEND EMAIL RECEIPTS =====
//         try {
//           // Get customer details from users table
//           const [users] = await connection.execute(
//             `SELECT email, first_name, last_name FROM users WHERE id = ?`,
//             [booking.user_id]
//           )
          
//           const customer = users[0]
//           const customerEmail = customer?.email
//           const customerName = `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim() || 'Customer'

//           const receiptData = {
//             bookingNumber: booking.booking_number,
//             serviceName: booking.service_name,
//             customerName: customerName,
//             providerName: booking.provider_name || 'Provider',
//             finalAmount: finalAmount,
//             providerAmount: providerAmount,
//             actualMinutes: actualMinutes,
//             standardMinutes: standardMinutes,
//             isProrated: actualMinutes < standardMinutes,
//             isOvertime: actualMinutes > standardMinutes,
//             jobDate: booking.job_date || new Date().toISOString()
//           }

//           // Send to customer
//           if (customerEmail) {
//             await sendEmail({
//               to: customerEmail,
//               subject: `🧾 Your WorkOnTap Receipt - Booking #${booking.booking_number}`,
//               html: getReceiptEmailHtml(receiptData, true),
//               text: `Thank you for your payment of $${finalAmount.toFixed(2)} for booking #${booking.booking_number}`
//             })
//             console.log(`✅ Receipt email sent to customer: ${customerEmail}`)
//           }

//           // Send to provider
//           if (booking.provider_email) {
//             await sendEmail({
//               to: booking.provider_email,
//               subject: `💰 Payment Received - WorkOnTap Booking #${booking.booking_number}`,
//               html: getReceiptEmailHtml(receiptData, false),
//               text: `Payment of $${providerAmount.toFixed(2)} has been processed for booking #${booking.booking_number}`
//             })
//             console.log(`✅ Receipt email sent to provider: ${booking.provider_email}`)
//           }
//         } catch (emailErr) {
//           console.error('❌ Email error:', emailErr)
//           // Don't fail the transaction if emails fail
//         }

//         // Create success message based on timing
//         let successMessage = ''
//         if (actualMinutes < standardMinutes) {
//           successMessage = `✅ Payment released! You were charged $${finalAmount} for ${actualMinutes}min (pro-rated from $${basePrice} for ${standardMinutes}min). Receipt sent to your email.`
//         } else if (actualMinutes > standardMinutes) {
//           successMessage = `✅ Payment released! You were charged $${finalAmount} for ${actualMinutes}min (includes overtime). Receipt sent to your email.`
//         } else {
//           successMessage = `✅ Payment released successfully! Receipt sent to your email.`
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























// app/api/customer/bookings/[id]/approve/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { withConnection } from '@/lib/db'
import { verifyToken } from '@/lib/jwt'
import { sendEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// ── Helper: calculate final customer charge ───────────────────────────────────
function calcFinalAmount(basePrice, standardMins, actualMins, overtimeRate = 0) {
  if (actualMins <= 0) return basePrice
  // Overtime
  if (actualMins > standardMins && overtimeRate > 0) {
    const overtimeMins = Math.min(actualMins - standardMins, 120) // cap 2hr
    return basePrice + (overtimeRate * overtimeMins / 60)
  }
  // Standard or less → charge full base (no pro-rating for customer)
  return basePrice
}

// ── Receipt email ─────────────────────────────────────────────────────────────
function receiptHtml({ bookingNumber, serviceName, customerName, providerName, amount, isCustomer, jobDate }) {
  const role   = isCustomer ? 'Customer' : 'Provider'
  const label  = isCustomer ? 'Total Paid' : 'Your Earnings'
  const color  = isCustomer ? '#16a34a' : '#2563eb'
  const banner = isCustomer ? 'linear-gradient(135deg,#0f766e,#0891b2)' : 'linear-gradient(135deg,#7e22ce,#9333ea)'
  const icon   = isCustomer ? '🧾' : '💰'
  const title  = isCustomer ? 'Payment Receipt' : 'Payment Received'
  const intro  = isCustomer
    ? `Thank you for your payment. Your booking with <strong>${providerName}</strong> has been completed.`
    : `Payment processed for <strong>${serviceName}</strong> provided to ${customerName}.`

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td align="center" style="padding-bottom:20px;">
        <span style="font-size:22px;font-weight:700;color:#0f766e;">Work<span style="color:#0891b2;">On</span>Tap</span>
      </td></tr>
      <tr><td style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="background:${banner};padding:40px 32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">${icon}</div>
            <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;">${title}</h1>
          </td></tr>
          <tr><td style="padding:40px;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#0f172a;">Hi ${isCustomer ? customerName : providerName},</p>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">${intro}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:24px;">
              <tr><td style="padding:20px;">
                <p style="margin:0 0 8px;font-size:14px;color:#334155;"><strong>Booking #:</strong> ${bookingNumber}</p>
                <p style="margin:0 0 8px;font-size:14px;color:#334155;"><strong>Service:</strong> ${serviceName}</p>
                <p style="margin:0;font-size:14px;color:#334155;"><strong>Date:</strong> ${jobDate ? new Date(jobDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
              </td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;margin-bottom:24px;">
              <tr><td style="padding:20px;text-align:center;">
                <p style="margin:0 0 5px;font-size:14px;color:#64748b;">${label}</p>
                <p style="margin:0;font-size:36px;font-weight:bold;color:${color};">$${parseFloat(amount).toFixed(2)}</p>
              </td></tr>
            </table>
            <p style="margin:0;font-size:14px;color:#64748b;">Thank you for using WorkOnTap!<br>The WorkOnTap Team</p>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:24px 0;text-align:center;">
        <p style="margin:0;font-size:13px;color:#94a3b8;">© ${new Date().getFullYear()} WorkOnTap · Calgary, Alberta, Canada</p>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`
}

// ── Dispute notification email for admin ──────────────────────────────────────
function disputeAdminHtml({ bookingNumber, serviceName, customerName, providerName, reason, bookingId }) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f0f4f8;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
      <tr><td style="background:linear-gradient(135deg,#dc2626,#b91c1c);padding:32px;text-align:center;">
        <div style="font-size:48px;margin-bottom:12px;">⚠️</div>
        <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">New Dispute Raised</h1>
      </td></tr>
      <tr><td style="padding:32px;">
        <p style="margin:0 0 20px;font-size:15px;color:#475569;">A customer has raised a dispute. <strong>Funds are held in escrow</strong> and will not be released until you resolve this.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin-bottom:20px;">
          <tr><td style="padding:20px;">
            <p style="margin:0 0 8px;font-size:14px;color:#991b1b;"><strong>Booking #:</strong> ${bookingNumber}</p>
            <p style="margin:0 0 8px;font-size:14px;color:#991b1b;"><strong>Service:</strong> ${serviceName}</p>
            <p style="margin:0 0 8px;font-size:14px;color:#991b1b;"><strong>Customer:</strong> ${customerName}</p>
            <p style="margin:0 0 8px;font-size:14px;color:#991b1b;"><strong>Provider:</strong> ${providerName}</p>
            <p style="margin:0;font-size:14px;color:#991b1b;"><strong>Booking ID:</strong> #${bookingId}</p>
          </td></tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;margin-bottom:20px;">
          <tr><td style="padding:20px;">
            <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#92400e;">Dispute Reason:</p>
            <p style="margin:0;font-size:14px;color:#78350f;">${reason}</p>
          </td></tr>
        </table>
        <p style="margin:0;font-size:14px;color:#64748b;">Please review this dispute in the admin dashboard and take appropriate action within 24 hours.</p>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`
}

// ── POST handler ──────────────────────────────────────────────────────────────
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

  try {
    return await withConnection(async (connection) => {
      await connection.query('START TRANSACTION')

      try {
        // ── Fetch booking ──────────────────────────────────────────────────
        const [[booking]] = await connection.execute(`
          SELECT 
            b.*,
            sp.stripe_account_id,
            sp.name            AS provider_name,
            sp.email           AS provider_email,
            sp.stripe_onboarding_complete,
            COALESCE(s.duration_minutes, b.standard_duration_minutes, 60) AS standard_mins
          FROM bookings b
          LEFT JOIN service_providers sp ON b.provider_id = sp.id
          LEFT JOIN services          s  ON b.service_id  = s.id
          WHERE b.id = ? AND b.user_id = ?
        `, [id, decoded.id])

        if (!booking) {
          await connection.query('ROLLBACK')
          return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 })
        }

        if (booking.status !== 'awaiting_approval') {
          await connection.query('ROLLBACK')
          return NextResponse.json({
            success: false,
            message: `Booking status is '${booking.status}', expected 'awaiting_approval'`
          }, { status: 400 })
        }

        // ── Get customer info ──────────────────────────────────────────────
        const [[customer]] = await connection.execute(
          `SELECT email, first_name, last_name FROM users WHERE id = ?`,
          [booking.user_id]
        )
        const customerName  = customer ? `${customer.first_name} ${customer.last_name}`.trim() : 'Customer'
        const customerEmail = customer?.email

        // ════════════════════════════════════════════════════════════════════
        // DISPUTE ACTION
        // ════════════════════════════════════════════════════════════════════
        if (action === 'dispute') {
          if (!dispute_reason?.trim()) {
            await connection.query('ROLLBACK')
            return NextResponse.json({ success: false, message: 'Dispute reason is required' }, { status: 400 })
          }

          // 1. Update booking status → disputed
          //    payment_status stays 'authorized' → funds remain HELD in Stripe
          await connection.execute(
            `UPDATE bookings SET status = 'disputed', updated_at = NOW() WHERE id = ?`,
            [id]
          )

          // 2. Log in booking_status_history
          await connection.execute(
            `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'disputed', ?)`,
            [id, `Customer disputed: ${dispute_reason}`]
          )

          // 3. Create dispute ticket in disputes table
          await connection.execute(
            `INSERT INTO disputes 
             (booking_id, raised_by_user_id, reason, status, created_at)
             VALUES (?, ?, ?, 'open', NOW())`,
            [id, decoded.id, dispute_reason]
          )

          await connection.query('COMMIT')

          // 4. Send admin alert email (non-blocking)
          const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL
          if (adminEmail) {
            sendEmail({
              to: adminEmail,
              subject: `⚠️ Dispute Raised — Booking #${booking.booking_number}`,
              html: disputeAdminHtml({
                bookingNumber: booking.booking_number,
                serviceName:   booking.service_name,
                customerName,
                providerName:  booking.provider_name || 'Provider',
                reason:        dispute_reason,
                bookingId:     id
              }),
              text: `Dispute raised for booking #${booking.booking_number}. Reason: ${dispute_reason}`
            }).catch(e => console.error('Admin email error:', e))
          }

          return NextResponse.json({
            success: true,
            message: '⚠️ Dispute raised. Our team will review within 24 hours. Funds are held securely.'
          })
        }

        // ════════════════════════════════════════════════════════════════════
        // APPROVE ACTION
        // ════════════════════════════════════════════════════════════════════
        if (action === 'approve') {
          if (!booking.payment_intent_id) {
            await connection.query('ROLLBACK')
            return NextResponse.json({ success: false, message: 'No payment intent found' }, { status: 400 })
          }

          const basePrice      = parseFloat(booking.service_price)
          const overtimeRate   = parseFloat(booking.additional_price || 0)
          const actualMins     = parseInt(booking.actual_duration_minutes || 0)
          const standardMins   = parseInt(booking.standard_mins || 60)
          const commissionPct  = parseFloat(booking.commission_percent || 0)

          const finalAmount    = calcFinalAmount(basePrice, standardMins, actualMins, overtimeRate)
          const providerAmount = parseFloat((finalAmount * (1 - commissionPct / 100)).toFixed(2))
          const totalCents     = Math.round(finalAmount * 100)
          const providerCents  = Math.round(providerAmount * 100)

          // ── Stripe capture ───────────────────────────────────────────────
          let latestCharge = null
          try {
            const pi = await stripe.paymentIntents.retrieve(booking.payment_intent_id)

            if (pi.status === 'requires_capture') {
              const captured = await stripe.paymentIntents.capture(booking.payment_intent_id, {
                amount_to_capture: totalCents
              })
              latestCharge = captured.latest_charge
              console.log(`✅ Captured $${finalAmount} for booking #${id}`)
            } else if (pi.status === 'succeeded') {
              latestCharge = pi.latest_charge
              console.log(`ℹ️ Payment already captured for booking #${id}`)
            } else {
              await connection.query('ROLLBACK')
              return NextResponse.json({
                success: false,
                message: `Cannot capture payment — status: ${pi.status}`
              }, { status: 400 })
            }
          } catch (stripeErr) {
            if (stripeErr.message?.includes('already been captured')) {
              console.log('Payment already captured, continuing...')
            } else {
              await connection.query('ROLLBACK')
              return NextResponse.json({
                success: false,
                message: 'Payment capture failed: ' + stripeErr.message
              }, { status: 400 })
            }
          }

          // ── Update booking ───────────────────────────────────────────────
          await connection.execute(
            `UPDATE bookings 
             SET status = 'completed',
                 payment_status = 'paid',
                 final_provider_amount = ?,
                 updated_at = NOW()
             WHERE id = ?`,
            [providerAmount, id]
          )

          await connection.execute(
            `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'completed', ?)`,
            [id, `✅ Customer approved. Charged: $${finalAmount.toFixed(2)} | Provider: $${providerAmount.toFixed(2)}`]
          )

          // ── Transfer to provider ─────────────────────────────────────────
          let transferId = null
          const hasStripe = booking.stripe_account_id && booking.stripe_onboarding_complete === 1

          if (hasStripe && providerCents > 0 && latestCharge) {
            try {
              const transfer = await stripe.transfers.create({
                amount:             providerCents,
                currency:           'gbp',
                destination:        booking.stripe_account_id,
                source_transaction: latestCharge,
                metadata: {
                  booking_id:     String(id),
                  booking_number: booking.booking_number,
                  provider_id:    String(booking.provider_id)
                },
                description: `Payment for booking #${booking.booking_number}`
              })
              transferId = transfer.id
              console.log(`✅ Transfer ${transfer.id} → ${booking.provider_name}`)
            } catch (transferErr) {
              console.error('Transfer failed (non-fatal):', transferErr.message)
              await connection.execute(
                `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'payment_pending', ?)`,
                [id, `⚠️ Manual payout needed: $${providerAmount.toFixed(2)} → ${booking.provider_name}`]
              )
            }
          } else {
            await connection.execute(
              `INSERT INTO booking_status_history (booking_id, status, notes) VALUES (?, 'payment_pending', ?)`,
              [id, `💰 Pay ${booking.provider_name} $${providerAmount.toFixed(2)} manually`]
            )
          }

          // ── Record payout ────────────────────────────────────────────────
          if (booking.provider_id && providerAmount > 0) {
            try {
              await connection.execute(
                `INSERT INTO provider_payouts 
                 (provider_id, amount, status, stripe_transfer_id, booking_id, notes, created_at)
                 VALUES (?, ?, 'pending', ?, ?, ?, NOW())`,
                [booking.provider_id, providerAmount, transferId, id,
                  `Payment for booking #${booking.booking_number}`]
              )
              await connection.execute(
                `UPDATE service_providers 
                 SET total_earnings    = total_earnings    + ?,
                     available_balance = available_balance + ?,
                     lifetime_balance  = lifetime_balance  + ?
                 WHERE id = ?`,
                [providerAmount, providerAmount, providerAmount, booking.provider_id]
              )
            } catch (payoutErr) {
              console.error('Payout record error (non-fatal):', payoutErr.message)
            }
          }

          await connection.query('COMMIT')

          // ── Send receipt emails ──────────────────────────────────────────
          const emailData = {
            bookingNumber: booking.booking_number,
            serviceName:   booking.service_name,
            customerName,
            providerName:  booking.provider_name || 'Provider',
            jobDate:       booking.job_date
          }

          if (customerEmail) {
            sendEmail({
              to:      customerEmail,
              subject: `🧾 Your WorkOnTap Receipt — Booking #${booking.booking_number}`,
              html:    receiptHtml({ ...emailData, amount: finalAmount,    isCustomer: true }),
              text:    `Payment of $${finalAmount.toFixed(2)} received. Booking #${booking.booking_number}`
            }).catch(e => console.error('Customer email error:', e))
          }

          if (booking.provider_email) {
            sendEmail({
              to:      booking.provider_email,
              subject: `💰 Payment Received — Booking #${booking.booking_number}`,
              html:    receiptHtml({ ...emailData, amount: providerAmount, isCustomer: false }),
              text:    `Payment of $${providerAmount.toFixed(2)} processed. Booking #${booking.booking_number}`
            }).catch(e => console.error('Provider email error:', e))
          }

          return NextResponse.json({
            success: true,
            message: `✅ Payment released! You were charged $${finalAmount.toFixed(2)}. Receipt sent to your email.`,
            data: {
              total_charged:    finalAmount,
              provider_received: providerAmount,
              admin_commission: parseFloat((finalAmount - providerAmount).toFixed(2)),
            }
          })
        }

      } catch (err) {
        await connection.query('ROLLBACK')
        throw err
      }
    })
  } catch (error) {
    console.error('Approve route error:', error)
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}