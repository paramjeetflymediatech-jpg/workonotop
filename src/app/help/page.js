'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useState } from 'react'

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    {
      question: "How do I book a service?",
      answer: "Simply search for the service you need, select a date and time, and confirm your booking. You'll receive instant confirmation and can track your booking status in 'My Bookings'."
    },
    {
      question: "How do I find the right service?",
      answer: "Use our search bar at the top of the page. Type what you need (e.g., 'fix leaking tap') and we'll show you relevant services. You can also browse by categories."
    },
    {
      question: "What areas do you serve?",
      answer: "We currently serve Calgary and surrounding areas. We're expanding to more cities soon!"
    },
    {
      question: "How are service providers vetted?",
      answer: "All our pros undergo background checks, license verification, and are fully insured. You can see their ratings and read reviews before booking."
    },
    {
      question: "What if I need to cancel?",
      answer: "Free cancellation up to 24 hours before the scheduled time. Cancel anytime from your 'My Bookings' page."
    },
    {
      question: "How do I pay?",
      answer: "Pay securely through our platform after the job is completed. We accept all major credit cards and digital wallets."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Simple Header */}
      <div className="bg-gradient-to-b from-green-50 to-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            How can we help you?
          </h1>
          <p className="text-gray-600 text-lg">
            Search our help center or browse common questions
          </p>
        </div>
      </div>

      {/* Quick Links Grid - 4 buttons */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/help/booking"
            className="bg-gray-50 hover:bg-green-50 border border-gray-200 rounded-xl p-4 text-center transition group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition">📖</div>
            <div className="font-medium text-gray-700">Booking Guide</div>
          </Link>
          
          <Link
            href="/help/payment"
            className="bg-gray-50 hover:bg-green-50 border border-gray-200 rounded-xl p-4 text-center transition group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition">💰</div>
            <div className="font-medium text-gray-700">Payment Help</div>
          </Link>
          
          <Link
            href="/help/safety"
            className="bg-gray-50 hover:bg-green-50 border border-gray-200 rounded-xl p-4 text-center transition group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition">🛡️</div>
            <div className="font-medium text-gray-700">Safety & Trust</div>
          </Link>
          
          <Link
            href="/help/report"
            className="bg-gray-50 hover:bg-green-50 border border-gray-200 rounded-xl p-4 text-center transition group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition">⚠️</div>
            <div className="font-medium text-gray-700">Report an Issue</div>
          </Link>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full text-left px-5 py-4 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <span className="text-green-600 text-xl">
                  {openFaq === index ? '−' : '+'}
                </span>
              </button>
              
              {openFaq === index && (
                <div className="px-5 pb-4 text-gray-600 border-t border-gray-100 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

     
      </div>

      <Footer />
    </div>
  )
}