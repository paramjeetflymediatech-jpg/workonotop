const fs = require('fs');

let code = fs.readFileSync('src/app/api/admin/invoices/generate/route.js', 'utf8');

const regex1 = /\/\/ Calculate commission and provider earnings.*?const providerEarnings = [^\n]+/s;

const replace1 = `// Calculate commission and provider earnings
    const commissionPercent = parseFloat(booking.commission_percent || 0)
    const commissionAmount = Math.round((totalAmount * commissionPercent / 100) * 100) / 100
    const providerEarnings = Math.round((totalAmount - commissionAmount) * 100) / 100
    
    // Detailed tracking requested by user
    const finalProviderAmount = providerEarnings
    const totalOvertimeCharged = overtimeAmount * wCount
    const overtimeEarnings = Math.round((totalOvertimeCharged - (totalOvertimeCharged * commissionPercent / 100)) * 100) / 100
    
    // Timer details
    const jobTimerStatus = booking.timer_status || booking.status || 'completed'
    const startTime = booking.start_time ? new Date(booking.start_time) : null
    const endTime = booking.end_time ? new Date(booking.end_time) : new Date()`;

if(code.match(regex1)) {
    code = code.replace(regex1, replace1);
    console.log('Replaced calc block');
} else {
    console.log('Failed to match calc block');
}

const regex2 = /const result = await execute\([\s\S]*?\]\n    \)/s;

const replace2 = `// Generate Customer Invoice
    const customerInvoiceNumber = \`INV-\${new Date().getFullYear()}-\${String(booking_id).padStart(5, '0')}-C\`
    const resultCustomer = await execute(
      \`INSERT INTO invoices (
        invoice_number, booking_id, user_id, provider_id, invoice_type,
        base_amount, overtime_minutes, overtime_rate, overtime_amount,
        total_amount, commission_percent, commission_amount, provider_earnings,
        final_provider_amount, overtime_earnings, job_timer_status, start_time, end_time,
        service_name, service_duration, actual_duration,
        job_date, completion_date, status
      ) VALUES (?, ?, ?, ?, 'customer', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')\`,
      [
        customerInvoiceNumber,
        booking.id,
        booking.user_id,
        booking.provider_id,
        baseAmount,
        overtimeMinutes,
        overtimeRatePerHour,
        overtimeAmount,
        totalAmount,
        commissionPercent,
        commissionAmount,
        providerEarnings,
        finalProviderAmount,
        overtimeEarnings,
        jobTimerStatus,
        startTime,
        endTime,
        booking.service_name,
        standardDuration,
        actualDuration,
        booking.job_date,
        booking.end_time || new Date()
      ]
    )

    // Generate Provider Invoice
    const providerInvoiceNumber = \`INV-\${new Date().getFullYear()}-\${String(booking_id).padStart(5, '0')}-P\`
    const resultProvider = await execute(
      \`INSERT INTO invoices (
        invoice_number, booking_id, user_id, provider_id, invoice_type,
        base_amount, overtime_minutes, overtime_rate, overtime_amount,
        total_amount, commission_percent, commission_amount, provider_earnings,
        final_provider_amount, overtime_earnings, job_timer_status, start_time, end_time,
        service_name, service_duration, actual_duration,
        job_date, completion_date, status
      ) VALUES (?, ?, ?, ?, 'provider', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')\`,
      [
        providerInvoiceNumber,
        booking.id,
        booking.user_id,
        booking.provider_id,
        baseAmount,
        overtimeMinutes,
        overtimeRatePerHour,
        overtimeAmount,
        totalAmount,
        commissionPercent,
        commissionAmount,
        providerEarnings,
        finalProviderAmount,
        overtimeEarnings,
        jobTimerStatus,
        startTime,
        endTime,
        booking.service_name,
        standardDuration,
        actualDuration,
        booking.job_date,
        booking.end_time || new Date()
      ]
    )`;

if(code.match(regex2)) {
    code = code.replace(regex2, replace2);
    console.log('Replaced insert block');
} else {
    console.log('Failed to match insert block');
}

fs.writeFileSync('src/app/api/admin/invoices/generate/route.js', code);
console.log('Done');
