const fs = require('fs');
let code = fs.readFileSync('src/app/api/bookings/route.js', 'utf8');

// Add email import
code = code.replace("import { notifyUser } from '@/lib/push'", "import { notifyUser } from '@/lib/push'\nimport { sendEmail } from '@/lib/email'");

// Client email
const oldClientNotify = "notifyUser(authenticatedUserId, 'Booking Confirmed!', `Your booking #${bookingNumber} for ${service_name} has been created.`, { bookingId, bookingNumber, type: 'booking_created' }, execute, 'customer')\n          .catch(err => console.error('[Push] Notification Error:', err));";
const newClientNotify = `${oldClientNotify}\n      if (email) { sendEmail({ to: email, subject: 'Booking Confirmed!', text: \`Hi \${first_name}, your booking #\${bookingNumber} for \${service_name} has been created.\` }).catch(console.error); }`;
code = code.replace(oldClientNotify, newClientNotify);

// Blast logic: add email to query
code = code.replace(
  "SELECT id, phone, service_areas, skills FROM service_providers WHERE status = 'active'",
  "SELECT id, phone, email, service_areas, skills FROM service_providers WHERE status = 'active'"
);

// Blast logic: send email to pro
const oldProNotify = "notifyUser(p.id, 'New Job Available!', `Tap to view details for ${service_name} in ${city || jobCluster}`, { \n              bookingId, \n              type: 'job_blast',\n              service_name,\n              estimated_hours: standardDuration / 60,\n              area: city || jobCluster,\n              date_time: `${displayDate} • ${job_time_slot}`,\n              earnings: earningsAmount\n            }, execute, 'provider').catch(() => {});";

const newProNotify = `notifyUser(p.id, 'New Job Available!', \`Tap to view details for \${service_name} in \${city || jobCluster}\`, { 
              bookingId, 
              type: 'job_blast',
              service_name,
              estimated_hours: standardDuration / 60,
              area: city || jobCluster,
              date_time: \`\${displayDate} • \${job_time_slot}\`,
              earnings: earningsAmount
            }, execute, 'provider').catch(() => {});
            
            if (p.email) {
              sendEmail({ to: p.email, subject: 'New Job Available!', text: \`A new \${service_name} job is available in \${city || jobCluster}.\` }).catch(console.error);
            }`;

code = code.replace(oldProNotify, newProNotify);

fs.writeFileSync('src/app/api/bookings/route.js', code);
console.log('PATCHED BOOKINGS ROUTE');
