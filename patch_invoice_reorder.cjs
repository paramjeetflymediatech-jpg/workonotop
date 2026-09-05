const fs = require('fs');
let code = fs.readFileSync('src/app/api/admin/invoices/[id]/preview/route.js', 'utf8');

const regex = /<!-- CUSTOMER INVOICE VIEW -->[\s\S]*?<\/div>\s*`\}/;

const replacement = `<!-- CUSTOMER INVOICE VIEW -->
      <div class="line-item">
        <div>
          <p class="line-title">Base price (\${invoice.service_duration}min)</p>
          <p class="line-desc">Base Service (x\${workerCount} worker\${workerCount > 1 ? 's' : ''})</p>
        </div>
        <div class="line-amount">
          \$\${baseSubtotal.toFixed(2)}
        </div>
      </div>

      \${invoice.overtime_minutes > 0 ? \`
      <div class="line-item">
        <div>
          <p class="line-title">Overtime (\${invoice.overtime_minutes}min at \$\${overtimeRateTotal.toFixed(2)}/hr)</p>
          <p class="line-desc">Actual Overtime (x\${workerCount} worker\${workerCount > 1 ? 's' : ''})</p>
        </div>
        <div class="line-amount">
          +\$\${overtimeSubtotal.toFixed(2)}
        </div>
      </div>
      \` : ''}

      <div class="paid-row">
        <div class="title">Already Paid (Base Price)</div>
        <div class="amount">-\$\${alreadyPaid.toFixed(2)}</div>
      </div>

      <div class="final-row" style="border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 10px;">
        <div>
          <p class="title" style="color: #6d28d9;">Remaining Balance (You Pay Now)</p>
        </div>
        <div class="final-amount" style="color: #6d28d9;">
          \$\${remainingBalance.toFixed(2)}
        </div>
      </div>

      <div class="job-total-row" style="background: none; border: none; padding: 0;">
        <div class="title" style="font-size: 16px; color: #1e293b;">Job Total (Base + Overtime)</div>
        <div class="amount" style="font-size: 24px;">\$\${jobTotal.toFixed(2)}</div>
      </div>
      \`}`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/app/api/admin/invoices/[id]/preview/route.js', code);
  console.log('Reordered customer invoice view successfully');
} else {
  console.log('Regex did not match');
}
