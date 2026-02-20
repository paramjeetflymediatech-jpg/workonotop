'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useState } from 'react'

export default function PaymentHelp() {
  const [showExample, setShowExample] = useState(false)

  const methods = [
    { icon: "💳", name: "Credit/Debit Cards", desc: "Visa, Mastercard, American Express" },
    { icon: "📱", name: "Digital Wallets", desc: "Apple Pay, Google Pay" },
    { icon: "🏦", name: "Bank Transfer", desc: "Direct from your bank account" }
  ]

  // Example invoice data
  const exampleInvoice = {
    service: "AC Installation",
    provider: "imran pro",
    date: "Feb 18, 2026",
    standardDuration: "1 minute",
    actualDuration: "17 minutes",
    overtime: "16 minutes",
    basePrice: "$40.00",
    overtimeRate: "$90.00/hr",
    overtimeAmount: "$24.00",
    total: "$64.00",
    status: "paid"
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="bg-gradient-to-b from-green-50 to-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <Link href="/help" className="text-green-700 hover:underline mb-2 inline-block">
            ← Back to Help Center
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Payment Help</h1>
          <p className="text-gray-600 mt-1">Everything you need to know about payments</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* How Payment Works - Main Info */}
        <div className="bg-green-50 rounded-xl p-6 border border-green-200 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">💰 How Payment Works</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">1.</span>
              <p className="text-gray-700"><span className="font-semibold">Provider completes the work</span> - Time is tracked automatically</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">2.</span>
              <p className="text-gray-700"><span className="font-semibold">Invoice is generated</span> - Shows exact time worked and amount</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">3.</span>
              <p className="text-gray-700"><span className="font-semibold">You review and pay</span> - Only pay when you're satisfied</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-600 font-bold">4.</span>
              <p className="text-gray-700"><span className="font-semibold">Provider gets paid</span> - After you confirm payment</p>
            </div>
          </div>
        </div>

        {/* Example Invoice - Click to show */}
        <button
          onClick={() => setShowExample(!showExample)}
          className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl p-4 mb-8 text-left transition"
        >
          <div className="flex justify-between items-center">
            <div>
              <span className="font-semibold text-gray-900">📄 View Example Invoice</span>
              <p className="text-sm text-gray-500 mt-1">See how your payment is calculated</p>
            </div>
            <span className="text-green-600 text-xl">{showExample ? '−' : '+'}</span>
          </div>
        </button>

        {showExample && (
          <div className="bg-white border-2 border-green-200 rounded-xl p-6 mb-8 shadow-lg">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-green-600">📋</span> 
              Sample Invoice - AC Installation
            </h3>
            
            {/* Provider & Service Info */}
            <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-500">Provider</p>
                <p className="font-medium">{exampleInvoice.provider}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium">{exampleInvoice.date}</p>
              </div>
            </div>

            {/* Time Breakdown */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-50 p-2 rounded text-center">
                <p className="text-xs text-gray-500">Standard</p>
                <p className="font-bold text-gray-900">{exampleInvoice.standardDuration}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded text-center">
                <p className="text-xs text-gray-500">Actual</p>
                <p className="font-bold text-gray-900">{exampleInvoice.actualDuration}</p>
              </div>
              <div className="bg-purple-50 p-2 rounded text-center">
                <p className="text-xs text-purple-600">Overtime</p>
                <p className="font-bold text-purple-600">{exampleInvoice.overtime}</p>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base price:</span>
                <span className="font-medium">{exampleInvoice.basePrice}</span>
              </div>
              <div className="flex justify-between text-sm text-purple-600">
                <span>Overtime (16 min @ $90/hr):</span>
                <span className="font-medium">+{exampleInvoice.overtimeAmount}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                <span>Total amount:</span>
                <span className="text-green-600 text-lg">{exampleInvoice.total}</span>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3 text-sm text-green-700 text-center">
              ✓ You only pay after the work is done and you're satisfied
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Accepted Payment Methods</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {methods.map((method, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
              <div className="text-4xl mb-2">{method.icon}</div>
              <h3 className="font-semibold text-gray-900">{method.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{method.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-green-600">⏱️</span>
              When do I pay?
            </h3>
            <p className="text-gray-600">
              Payment is processed <span className="font-semibold">AFTER the job is completed</span>. 
              You only pay for the actual time worked, as shown in your invoice.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-green-600">🔒</span>
              Is it secure?
            </h3>
            <p className="text-gray-600">
              Yes! All payments are encrypted and processed securely through our payment partners. 
              We never store your full card details.
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-green-600">📧</span>
              Can I get a receipt?
            </h3>
            <p className="text-gray-600">
              Absolutely! After payment, you'll receive an email receipt and can view it anytime 
              in <span className="font-semibold">'My Bookings'</span> under each completed job.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-green-600">💰</span>
              How is the amount calculated?
            </h3>
            <p className="text-gray-600 mb-2">
              You're charged based on the actual time worked:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
              <li>Standard rate for the first X minutes (as shown in service)</li>
              <li>Overtime rate applies if job takes longer</li>
              <li>Final amount is shown in your invoice before payment</li>
            </ul>
          </div>
        </div>

        {/* Note about invoices */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Invoices are generated automatically</h3>
              <p className="text-gray-700 text-sm">
                Once a job is completed, an invoice is created with the exact time worked and amount due. 
                You can view it in 'My Bookings' before making payment.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}