const fs = require('fs');
let code = fs.readFileSync('src/app/api/customer/bookings/[id]/approve/route.js', 'utf8');

// Ensure notifyUser is imported
if (!code.includes("import { notifyUser }")) {
    code = code.replace("import { sendEmail } from '@/lib/email'", "import { sendEmail } from '@/lib/email'\nimport { notifyUser } from '@/lib/push'");
}

const notificationsBlock = `
            logActivity({
              actor_id: decoded.id, actor_type: 'customer', actor_name: booking.customer_first_name,
              action: 'INVOICE_APPROVED', entity_type: 'booking', entity_id: id,
              details: { amount: totalCharge }
            })

            // ---- NOTIFICATIONS ----
            try {
              // 1. Client: Payment receipt
              const receiptTitle = 'Payment Receipt';
              const receiptBody = \`Your payment of $\${totalCharge.toFixed(2)} for \${booking.service_name} was successful.\`;
              if (booking.user_id) await notifyUser(booking.user_id, 'customer', receiptTitle, receiptBody, { booking_id: id }).catch(console.error);

              // 2. Client: Rate your pro
              const rateTitle = 'Rate your pro';
              const rateBody = \`Please take a moment to rate \${booking.provider_name || 'your pro'}.\`;
              if (booking.user_id) await notifyUser(booking.user_id, 'customer', rateTitle, rateBody, { booking_id: id }).catch(console.error);
              if (booking.customer_email) await sendEmail({ to: booking.customer_email, subject: rateTitle, text: rateBody }).catch(console.error);

              // 3. Pro: Client approved invoice
              if (booking.provider_id) {
                const proTitle = 'Invoice Approved';
                const proBody = 'The client has approved and paid the invoice.';
                await notifyUser(booking.provider_id, 'provider', proTitle, proBody, { booking_id: id }).catch(console.error);
                if (booking.provider_email) await sendEmail({ to: booking.provider_email, subject: proTitle, text: proBody }).catch(console.error);
              }
            } catch (notifErr) {
              console.error('Failed to send approve notifications:', notifErr);
            }
            // -----------------------
`;

// There should be a logActivity for INVOICE_APPROVED in the code
code = code.replace(/logActivity\(\{\s*actor_id: decoded\.id,\s*actor_type: 'customer',[\s\S]*?details: \{ amount: totalCharge \}\s*\}\)/, notificationsBlock);

fs.writeFileSync('src/app/api/customer/bookings/[id]/approve/route.js', code);
console.log('PATCHED APPROVE ROUTE (2)');
