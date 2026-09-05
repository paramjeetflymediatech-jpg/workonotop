const fs = require('fs');

let code = fs.readFileSync('src/app/admin/jobs/page.js', 'utf8');

// 1. Add invoicesList state
const regex1 = /const \[currentInvoice, setCurrentInvoice\] = useState\(null\)/;
const replacement1 = `const [currentInvoice, setCurrentInvoice] = useState(null)
  const [invoicesList, setInvoicesList] = useState([])`;

if (code.match(regex1)) {
  code = code.replace(regex1, replacement1);
}

// 2. Update viewInvoice function
const regex2 = /const viewInvoice = async \([\s\S]*?\} catch \{/s;
const replacement2 = `const viewInvoice = async (bookingId) => {
    try {
      const res = await fetch(\`/api/admin/invoices?booking_id=\${bookingId}\`)
      const data = await res.json()
      if (data.success && data.data.length > 0) {
        setInvoicesList(data.data)
        // Prefer customer invoice initially, or just first one
        const custInv = data.data.find(i => i.invoice_type === 'customer') || data.data[0]
        setCurrentInvoice(custInv)
        setShowInvoiceModal(true)
      } else {
        showMessage('error', 'No invoice found for this booking')
      }
    } catch {`;

if (code.match(regex2)) {
  code = code.replace(regex2, replacement2);
}

// 3. Update the modal UI to show tabs if invoicesList.length > 1
const regex3 = /<h2 className=\{`text-lg font-bold[\s\S]*?<\/h2>/;
const replacement3 = `<h2 className={\`text-lg font-bold \${isDarkMode ? 'text-white' : 'text-slate-900'}\`}>{currentInvoice.invoice_number}</h2>
                
                {invoicesList.length > 1 && (
                  <div className="flex gap-2 mt-3">
                    {invoicesList.map(inv => (
                      <button 
                        key={inv.id}
                        onClick={() => setCurrentInvoice(inv)}
                        className={\`px-3 py-1 text-xs font-semibold rounded-lg transition \${currentInvoice.id === inv.id ? 'bg-teal-600 text-white' : (isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300')}\`}
                      >
                        {inv.invoice_type === 'customer' ? '📄 Customer Invoice' : '📄 Provider Invoice'}
                      </button>
                    ))}
                  </div>
                )}`;

if (code.match(regex3)) {
  code = code.replace(regex3, replacement3);
}

fs.writeFileSync('src/app/admin/jobs/page.js', code);
console.log('Patched jobs page to support multiple invoices');
