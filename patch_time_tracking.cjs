const fs = require('fs');
let code = fs.readFileSync('src/app/api/provider/jobs/time-tracking/route.js', 'utf8');

if (!code.includes("import { notifyUser }")) {
    code = code.replace("import { sendEmail } from '@/lib/email'", "import { sendEmail } from '@/lib/email'\nimport { notifyUser } from '@/lib/push'");
}

const oldSmsLogic = `if (booking.customer_phone) {
              sendSMS(booking.customer_phone, 'Your invoice is ready. Please approve and pay.').catch(console.error);
            }`;

const newSmsLogic = `if (booking.customer_phone) {
              sendSMS(booking.customer_phone, 'Your invoice is ready. Please approve and pay.').catch(console.error);
            }
            if (booking.user_id) {
              notifyUser(booking.user_id, 'customer', 'Invoice Ready', 'Your invoice is ready. Please approve and pay.', { booking_id }).catch(console.error);
            }`;

code = code.replace(oldSmsLogic, newSmsLogic);

fs.writeFileSync('src/app/api/provider/jobs/time-tracking/route.js', code);
console.log('PATCHED TIME TRACKING ROUTE');
