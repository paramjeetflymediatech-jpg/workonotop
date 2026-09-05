const fs = require('fs');
const filePath = 'src/app/api/customer/bookings/[id]/approve/route.js';
let code = fs.readFileSync(filePath, 'utf8');

const newReceiptHtml = `// ── Receipt email ─────────────────────────────────────────────────────────────
function receiptHtml({ bookingNumber, serviceName, customerName, providerName, amount, isCustomer, jobDate }) {
  const label = isCustomer ? 'Total Paid' : 'Your Earnings'
  const color = '#0f766e'
  const banner = 'linear-gradient(135deg,#0f766e,#0891b2)'
  const icon = isCustomer ? '🧾' : '💰'
  const title = isCustomer ? 'Payment Receipt' : 'Payment Received'
  const intro = isCustomer
    ? \`Thank you for your payment. Your booking with <strong>\${providerName}</strong> has been completed.\`
    : \`Payment processed for <strong>\${serviceName}</strong> provided to \${customerName}.\`

  return \`<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td align="center" style="padding-bottom:20px;">
        <span style="font-size:22px;font-weight:700;color:#0f766e;letter-spacing:-0.5px;">Work<span style="color:#0891b2;">On</span>Tap</span>
      </td></tr>
      <tr><td style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="background:\${banner};padding:40px 32px;text-align:center;">
            <div style="font-size:48px;margin-bottom:12px;">\${icon}</div>
            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.3px;">\${title}</h1>
          </td></tr>
          <tr><td style="padding:40px;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#0f172a;">Hi \${isCustomer ? customerName : providerName},</p>
            <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">\${intro}</p>
            
            <!-- Details Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:24px;">
              <tr><td style="padding:16px 20px;">
                <p style="margin:0 0 6px;font-size:14px;color:#334155;"><strong>Booking #:</strong> \${bookingNumber}</p>
                <p style="margin:0 0 6px;font-size:14px;color:#334155;"><strong>Service:</strong> \${serviceName}</p>
                <p style="margin:0;font-size:14px;color:#334155;"><strong>Date:</strong> \${jobDate ? new Date(jobDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
              </td></tr>
            </table>

            <!-- Total Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;margin-bottom:24px;">
              <tr><td style="padding:20px;text-align:center;">
                <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#166534;text-transform:uppercase;letter-spacing:0.5px;">\${label}</p>
                <p style="margin:0;font-size:32px;font-weight:800;color:\${color};">$\${parseFloat(amount).toFixed(2)}</p>
              </td></tr>
            </table>

            <p style="margin:0 0 4px;font-size:14px;color:#64748b;">Thank you for using WorkOnTap!</p>
            <p style="margin:0;font-size:14px;color:#64748b;">The WorkOnTap Team</p>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:24px 0;text-align:center;">
        <p style="margin:0;font-size:13px;color:#94a3b8;">© \${new Date().getFullYear()} WorkOnTap · Canada</p>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>\`
}`;

const searchRegex = /\/\/ ── Receipt email ─────────────────────────────────────────────────────────────[\s\S]*?© \$\{new Date\(\)\.getFullYear\(\)\} WorkOnTap · Canada<\/p>\n  <\/td><\/tr>\n<\/table><\/body><\/html>`\n}/;
code = code.replace(searchRegex, newReceiptHtml);

fs.writeFileSync(filePath, code);
console.log('PATCHED EMAIL HTML');
