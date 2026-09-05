const fs = require('fs');

// 1. Fix preview/route.js
let previewCode = fs.readFileSync('src/app/api/admin/invoices/[id]/preview/route.js', 'utf8');
previewCode = previewCode.replace('b.worker_count,', 'b.worker_count,\n        b.submitted_headcount,');
previewCode = previewCode.replace('const workerCount = parseInt(booking.worker_count || 1);', 'const workerCount = parseInt(booking.submitted_headcount || booking.worker_count || 1);');
fs.writeFileSync('src/app/api/admin/invoices/[id]/preview/route.js', previewCode);

// 2. Fix generate/route.js
let genCode = fs.readFileSync('src/app/api/admin/invoices/generate/route.js', 'utf8');
genCode = genCode.replace('const actualDuration = parseInt(booking.actual_duration_minutes || 0)', 'const actualDuration = parseInt(booking.submitted_duration_minutes || booking.actual_duration_minutes || 0)');
genCode = genCode.replace('const wCount = parseInt(booking.worker_count || 1)', 'const wCount = parseInt(booking.submitted_headcount || booking.worker_count || 1)');
fs.writeFileSync('src/app/api/admin/invoices/generate/route.js', genCode);

// 3. Fix approve/route.js so future approvals update the core columns
let approveCode = fs.readFileSync('src/app/api/customer/bookings/[id]/approve/route.js', 'utf8');
approveCode = approveCode.replace(
  `                 final_provider_amount = ?,`,
  `                 final_provider_amount = ?,
                 actual_duration_minutes = COALESCE(submitted_duration_minutes, actual_duration_minutes),
                 worker_count = COALESCE(submitted_headcount, worker_count),`
);
fs.writeFileSync('src/app/api/customer/bookings/[id]/approve/route.js', approveCode);

console.log('Fixed route logic.');
