const fs = require('fs');
let code = fs.readFileSync('src/app/api/customer/bookings/[id]/approve/route.js', 'utf8');
code = code.replace("sp.stripe_onboarding_complete,", "sp.stripe_onboarding_complete,\n            u.phone AS customer_phone,");
code = code.replace("LEFT JOIN services          s  ON b.service_id  = s.id", "LEFT JOIN services          s  ON b.service_id  = s.id\n          LEFT JOIN users             u  ON b.user_id     = u.id");
code = code.replace("import { logActivity } from '@/lib/logger'", "import { logActivity } from '@/lib/logger'\nimport { sendSMS } from '@/lib/sms'");
// Add SMS sending on payment failure line 405
code = code.replace("return NextResponse.json({ success: true, checkout_url: session.url, message: 'Auto-payment failed. Please pay manually.' })", "if (booking.customer_phone) { sendSMS(booking.customer_phone, 'Payment failed. Please update your payment method to complete the transaction.').catch(console.error); }\n                return NextResponse.json({ success: true, checkout_url: session.url, message: 'Auto-payment failed. Please pay manually.' })");

fs.writeFileSync('src/app/api/customer/bookings/[id]/approve/route.js', code);
console.log('PATCHED APPROVE ROUTE');
