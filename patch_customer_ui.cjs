const fs = require('fs');

let code = fs.readFileSync('src/app/my-bookings/[id]/page.js', 'utf8');

// Replace the Confirm Payment Modal
const oldModal = `            <div className="rounded-xl p-4 mb-4 bg-gray-50 border border-gray-200">
              <div className="flex justify-between text-sm mb-2"><span>Job Total:</span><span className="font-medium">{fmt(customerTotal)}</span></div>
              <div className="flex justify-between text-sm mb-2 text-green-700"><span>Already Paid (Base):</span><span>-{fmt(originalBasePrice)}</span></div>
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-bold text-teal-700">Balance to Pay Now:</span>
                <span className="font-bold text-teal-700">{fmt(customerTotal - originalBasePrice)}</span>
              </div>
            </div>`;

const newModal = `            <div className="rounded-xl p-4 mb-4 bg-gray-50 border border-gray-200">
              <div className="flex justify-between text-sm mb-2">
                <span>Job Total (Base + Overtime):</span>
                <span className="font-bold text-gray-900">{fmt(customerTotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Base price ({standardMinutes}min):</span>
                <span>{fmt(basePrice)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-3">
                <span>Overtime ({overtimeMins}min at {fmt(overtimeRate)}/hr):</span>
                <span>+{fmt(overtimeCost)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2 text-red-600 font-bold border-t pt-3">
                <span>Already Paid (Base Price):</span>
                <span>-{fmt(originalBasePrice)}</span>
              </div>
              <div className="border-t pt-3 mt-1 flex justify-between">
                <span className="font-bold text-teal-700 text-base">Remaining Balance (You Pay Now):</span>
                <span className="font-bold text-teal-700 text-lg">{fmt(customerTotal - originalBasePrice)}</span>
              </div>
            </div>`;

code = code.replace(oldModal, newModal);

// Replace the Job Completed block
const oldJobCompleted = `              <div className="rounded-xl p-4 mb-5 bg-gray-50 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">{isOvertime ? 'Job Total (Base + Overtime):' : 'Final amount:'}</span>
                  <span className="text-xl font-bold text-gray-900">{fmt(customerTotal)}</span>
                </div>
                <div className="text-xs border-t pt-2 space-y-1">
                  <div className="flex justify-between text-gray-600"><span>Base price ({standardMinutes}min):</span><span>{fmt(basePrice)}</span></div>
                  {isOvertime && (
                    <>
                      <div className="flex justify-between text-gray-600"><span>Overtime ({overtimeMins}min at {fmt(overtimeRate)}/hr):</span><span>+{fmt(overtimeCost)}</span></div>
                      <div className="flex justify-between font-bold pt-1 border-t text-green-700"><span>Already Paid (Base Price):</span><span>-{fmt(originalBasePrice)}</span></div>
                      <div className="flex justify-between font-bold pt-1 border-t text-purple-700"><span>Remaining Balance (You Pay Now):</span><span>{fmt(customerTotal - originalBasePrice)}</span></div>
                    </>
                  )}
                  {!isOvertime && (
                    <div className="flex justify-between font-bold pt-1 border-t"><span>You pay:</span><span className="text-gray-900">{fmt(customerTotal)}</span></div>
                  )}
                </div>
              </div>`;

const newJobCompleted = `              <div className="rounded-xl p-4 mb-5 bg-gray-50 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">Job Total (Base + Overtime):</span>
                  <span className="text-xl font-bold text-gray-900">{fmt(customerTotal)}</span>
                </div>
                <div className="text-xs border-t pt-3 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <div>
                      <span>Base price ({standardMinutes}min):</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">Base Service (x{wCount} worker{wCount > 1 ? 's' : ''})</p>
                    </div>
                    <span>{fmt(basePrice)}</span>
                  </div>
                  
                  <div className="flex justify-between text-gray-600">
                    <div>
                      <span>Overtime ({overtimeMins}min at {fmt(overtimeRate)}/hr):</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">Actual Overtime (x{wCount} worker{wCount > 1 ? 's' : ''})</p>
                    </div>
                    <span>+{fmt(overtimeCost)}</span>
                  </div>
                  
                  <div className="flex justify-between font-bold pt-2 mt-2 border-t text-red-600">
                    <span>Already Paid (Base Price):</span>
                    <span>-{fmt(originalBasePrice)}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 mt-1 border-t text-teal-700 text-sm">
                    <span>Remaining Balance (You Pay Now):</span>
                    <span>{fmt(customerTotal - originalBasePrice)}</span>
                  </div>
                </div>
              </div>`;

code = code.replace(oldJobCompleted, newJobCompleted);

fs.writeFileSync('src/app/my-bookings/[id]/page.js', code);
console.log('Patched customer UI successfully');
