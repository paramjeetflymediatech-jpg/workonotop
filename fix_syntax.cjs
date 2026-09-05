const fs = require('fs');

let code1 = fs.readFileSync('src/app/api/provider/available-jobs/[id]/route.js', 'utf8');
code1 = code1.replace('// -----------------------\n)', '// -----------------------');
fs.writeFileSync('src/app/api/provider/available-jobs/[id]/route.js', code1);

let code2 = fs.readFileSync('src/app/api/provider/available-jobs/route.js', 'utf8');
code2 = code2.replace('// -----------------------\n)', '// -----------------------');
code2 = code2.replace("import { notifyUser } from '@/lib/push'\nimport { sendEmail } from '@/lib/email'\nimport { notifyUser } from '@/lib/push'", "import { notifyUser } from '@/lib/push'\nimport { sendEmail } from '@/lib/email'");
fs.writeFileSync('src/app/api/provider/available-jobs/route.js', code2);

console.log('FIXED SYNTAX ERRORS');
