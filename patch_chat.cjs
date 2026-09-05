const fs = require('fs');
let code = fs.readFileSync('src/app/api/chat/route.js', 'utf8');

// Add imports
code = code.replace(
    "import { verifyToken } from '@/lib/jwt';",
    "import { verifyToken } from '@/lib/jwt';\nimport { sendEmail } from '@/lib/email';\nimport { notifyUser } from '@/lib/push';"
);

// Add logic after `newMessage.sender_name = sender_name;`
const newLogic = `
      newMessage.sender_name = sender_name;

      // ---- NOTIFICATIONS ----
      try {
        const [bookingRes] = await connection.execute(
          'SELECT b.user_id, b.provider_id, b.customer_email, sp.email as provider_email FROM bookings b LEFT JOIN service_providers sp ON b.provider_id = sp.id WHERE b.id = ?',
          [bookingId]
        );
        const booking = bookingRes[0];

        if (booking) {
          const title = 'New Message';
          const msgBody = \`\${sender_name}: \${message}\`;

          if (senderType === 'customer' && booking.provider_id) {
            // Notify Pro
            if (booking.provider_email) {
              await sendEmail({ to: booking.provider_email, subject: title, text: msgBody }).catch(console.error);
            }
            await notifyUser(booking.provider_id, 'provider', title, msgBody, { booking_id: bookingId }).catch(console.error);
          } else if (senderType === 'provider' && booking.user_id) {
            // Notify Client
            if (booking.customer_email) {
              await sendEmail({ to: booking.customer_email, subject: title, text: msgBody }).catch(console.error);
            }
            await notifyUser(booking.user_id, 'customer', title, msgBody, { booking_id: bookingId }).catch(console.error);
          }
        }
      } catch (notifErr) {
        console.error('Failed to send chat push/email:', notifErr);
      }
      // -----------------------
`;

code = code.replace(/newMessage\.sender_name = sender_name;/, newLogic);

fs.writeFileSync('src/app/api/chat/route.js', code);
console.log('PATCHED CHAT ROUTE');
