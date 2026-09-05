const fs = require('fs');

let code = fs.readFileSync('src/app/api/admin/invoices/[id]/preview/route.js', 'utf8');

const regex = /<div class="payment-summary">[\s\S]*?<\/div>\s*<\/div>\s*<div class="footer">/s;

const replacement = `<div class="payment-summary">
      <div class="summary-title">
        \${invoice.invoice_type === 'provider' ? 'Provider Payout Summary' : 'Payment Summary'}
        <span class="status-badge \${(invoice.status || '').toLowerCase()}">\${displayStatus}</span>
      </div>

      \${invoice.invoice_type === 'provider' ? \`
      <!-- PROVIDER INVOICE VIEW -->
      <div class="job-total-row">
        <div class="title">Total Payout (Base + Overtime)</div>
        <div class="amount">\$\${(Number(invoice.final_provider_amount || invoice.provider_earnings)).toFixed(2)}</div>
      </div>

      <div class="line-item">
        <div>
          <p class="line-title">Base Payout</p>
          <p class="line-desc">Base service (x\${workerCount} worker\${workerCount > 1 ? 's' : ''})</p>
        </div>
        <div class="line-amount">
          \$\${Number(invoice.final_provider_amount - invoice.overtime_earnings).toFixed(2)}
        </div>
      </div>

      \${invoice.overtime_minutes > 0 ? \`
      <div class="line-item">
        <div>
          <p class="line-title">Overtime Payout (\${invoice.overtime_minutes}min)</p>
          <p class="line-desc">Actual Overtime (x\${workerCount} worker\${workerCount > 1 ? 's' : ''})</p>
        </div>
        <div class="line-amount">
          +\$\${Number(invoice.overtime_earnings).toFixed(2)}
        </div>
      </div>
      \` : ''}

      <div class="final-row" style="border-top: 2px solid #e2e8f0; margin-top: 10px; padding-top: 20px;">
        <div>
          <p class="title">Final Provider Payout</p>
        </div>
        <div class="final-amount">
          \$\${(Number(invoice.final_provider_amount || invoice.provider_earnings)).toFixed(2)}
        </div>
      </div>
      \` : \`
      <!-- CUSTOMER INVOICE VIEW -->
      <div class="job-total-row">
        <div class="title">Job Total (Base + Overtime)</div>
        <div class="amount">\$\${jobTotal.toFixed(2)}</div>
      </div>

      <div class="line-item">
        <div>
          <p class="line-title">Base price (\${invoice.service_duration}min)</p>
          <p class="line-desc">Base Service (x\${workerCount} worker\${workerCount > 1 ? 's' : ''})</p>
        </div>
        <div class="line-amount">
          \$\${baseSubtotal.toFixed(2)}
        </div>
      </div>

      <div class="line-item">
        <div>
          <p class="line-title">Overtime (\${invoice.overtime_minutes}min at \$\${overtimeRateTotal.toFixed(2)}/hr)</p>
          <p class="line-desc">Actual Overtime (x\${workerCount} worker\${workerCount > 1 ? 's' : ''})</p>
        </div>
        <div class="line-amount">
          +\$\${overtimeSubtotal.toFixed(2)}
        </div>
      </div>

      <div class="paid-row">
        <div class="title">Already Paid (Base Price)</div>
        <div class="amount">-\$\${alreadyPaid.toFixed(2)}</div>
      </div>

      <div class="final-row">
        <div>
          <p class="title">Remaining Balance (You Pay Now)</p>
        </div>
        <div class="final-amount">
          \$\${remainingBalance.toFixed(2)}
        </div>
      </div>
      \`}
    </div>

    <div class="footer">`;

if (code.match(regex)) {
  code = code.replace(regex, replacement);
  fs.writeFileSync('src/app/api/admin/invoices/[id]/preview/route.js', code);
  console.log('Replaced preview correctly');
} else {
  console.log('Did not match preview HTML');
}
