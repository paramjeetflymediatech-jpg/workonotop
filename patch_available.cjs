const fs = require('fs');

// Patch available-jobs/[id]/route.js
let code = fs.readFileSync('src/app/api/provider/available-jobs/[id]/route.js', 'utf8');
code = code.replace("import { verifyToken } from '@/lib/jwt'", "import { verifyToken } from '@/lib/jwt'\nimport { notifyUser } from '@/lib/push'\nimport { sendEmail } from '@/lib/email'");

const notificationLogic = `
      // Log Activity
      logActivity({
        actor_id: decoded.providerId,
        actor_type: 'provider',
        actor_name: decoded.name || 'Provider',
        action: 'JOB_ACCEPTED',
        entity_type: 'booking',
        entity_id: id,
        details: { service_name: job.service_name }
      })

      // ---- NOTIFICATIONS ----
      try {
        const titleClient = 'Pro Accepted Your Job!';
        const bodyClient = \`\${decoded.name || 'A professional'} has accepted your \${job.service_name} job.\`;
        
        if (job.user_id) {
          await notifyUser(job.user_id, 'customer', titleClient, bodyClient, { booking_id: id }).catch(console.error);
        }
        if (job.customer_email) {
          await sendEmail({ to: job.customer_email, subject: titleClient, text: bodyClient }).catch(console.error);
        }

        const titlePro = 'Job Accepted';
        const bodyPro = \`You have successfully accepted the \${job.service_name} job.\`;
        await notifyUser(decoded.providerId, 'provider', titlePro, bodyPro, { booking_id: id }).catch(console.error);
        
        // Let's get pro email to send it there too
        const [proData] = await connection.execute('SELECT email FROM service_providers WHERE id = ?', [decoded.providerId]);
        if (proData && proData[0] && proData[0].email) {
          await sendEmail({ to: proData[0].email, subject: titlePro, text: bodyPro }).catch(console.error);
        }
      } catch (notifErr) {
        console.error('Failed to send accept job notifications:', notifErr);
      }
      // -----------------------
`;
code = code.replace(/(\/\/ Log Activity[\s\S]*?entity_id: id,\s*details: \{ service_name: job.service_name \}\s*\})/, notificationLogic);
fs.writeFileSync('src/app/api/provider/available-jobs/[id]/route.js', code);


// Also check available-jobs/route.js just in case it has POST accept logic
try {
  let code2 = fs.readFileSync('src/app/api/provider/available-jobs/route.js', 'utf8');
  if (code2.includes("UPDATE bookings SET provider_id = ?, status = 'confirmed'")) {
     code2 = code2.replace("import { verifyToken } from '@/lib/jwt'", "import { verifyToken } from '@/lib/jwt'\nimport { notifyUser } from '@/lib/push'\nimport { sendEmail } from '@/lib/email'");
     code2 = code2.replace(/(\/\/ Log Activity[\s\S]*?entity_id: bookingId,\s*details: \{ service_name: job.service_name \}\s*\})/, notificationLogic.replace(/booking_id: id/g, 'booking_id: bookingId').replace(/id/g, 'bookingId'));
     fs.writeFileSync('src/app/api/provider/available-jobs/route.js', code2);
  }
} catch (e) {}

console.log('PATCHED AVAILABLE JOBS');
