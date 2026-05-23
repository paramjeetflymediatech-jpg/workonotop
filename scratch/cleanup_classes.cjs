const fs = require('fs');
let data = fs.readFileSync('src/app/admin/providers/page.js', 'utf8');

// Remove max-width constraints that go with truncate
data = data.replace(/max-w-\[150px\] xl:max-w-\[200px\]/g, '');
data = data.replace(/max-w-\[120px\] xl:max-w-\[150px\]/g, '');

// Remove truncate
data = data.replace(/ truncate /g, ' ');
data = data.replace(/ truncate`/g, '`');
data = data.replace(/ truncate"/g, '"');
data = data.replace(/className="truncate"/g, '');

// Remove whitespace-nowrap
data = data.replace(/ whitespace-nowrap /g, ' ');
data = data.replace(/ whitespace-nowrap`/g, '`');
data = data.replace(/ whitespace-nowrap"/g, '"');

fs.writeFileSync('src/app/admin/providers/page.js', data);
console.log('Successfully replaced classes.');
