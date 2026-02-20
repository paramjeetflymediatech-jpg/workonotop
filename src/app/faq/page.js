'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "How do I book a service?",
      answer: "Simply search for the service you need, select a date and time, and confirm your booking. You'll receive instant confirmation and can track your booking status in 'My Bookings'."
    },
    {
      question: "How do I pay?",
      answer: "Payments are processed AFTER the job is completed. You only pay when you're satisfied with the work. We accept all major credit cards, digital wallets, and bank transfers."
    },
    {
      question: "Are the tradespeople verified?",
      answer: "Yes! All our pros undergo background checks, license verification, and are fully insured. You can see their ratings and read reviews from other customers before booking."
    },
    {
      question: "What if I need to cancel?",
      answer: "Free cancellation up to 24 hours before the scheduled time. You can cancel anytime from your 'My Bookings' page."
    },
    {
      question: "What areas do you serve?",
      answer: "We currently serve Calgary and surrounding areas. We're expanding to more cities soon!"
    },
    {
      question: "How is the price calculated?",
      answer: "You're charged based on the actual time worked. Standard rate applies for the first X minutes, and overtime rate applies if the job takes longer."
    },
    {
      question: "What if I'm not satisfied?",
      answer: "We have a 100% satisfaction guarantee. If you're not happy with the work, contact us within 48 hours and we'll make it right."
    },
    {
      question: "How do I become a pro?",
      answer: "Visit our 'Become a Pro' page and sign up. We'll guide you through the verification process."
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="bg-gradient-to-r from-green-800 to-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-green-100">Find answers to common questions</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        
        {/* FAQ List */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left px-5 py-4 flex justify-between items-center hover:bg-gray-50 transition"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <span className="text-green-600 text-xl">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              
              {openIndex === index && (
                <div className="px-5 pb-4 text-gray-600 border-t border-gray-100 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Need Help */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Still have questions?{' '}
            <Link href="/contact" className="text-green-600 font-medium hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}