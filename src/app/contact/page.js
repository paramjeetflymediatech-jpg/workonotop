'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => { 
    e.preventDefault()
    // Add your form submission logic here
    console.log('Form submitted:', formData)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h1>
          <p className="text-gray-600 mb-6">We&apos;ll get back to you within 24 hours.</p>
          <Link href="/" className="text-green-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="bg-gradient-to-r from-green-800 to-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-green-100">We&apos;re here to help 24/7</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 max-w-4xl mx-auto">

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="text-2xl">📧</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <a href="mailto:support@workontap.com" className="text-green-600 hover:underline">
                    support@workontap.com
                  </a>
                  <p className="text-sm text-gray-500">24/7 Support</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-2xl">📞</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Phone</h3>
                  <a href="tel:1-800-WORKONTAP" className="text-green-600 hover:underline">
                    1-800-WORKONTAP
                  </a>
                  <p className="text-sm text-gray-500">Mon-Fri, 9am-6pm</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-2xl">📍</div>
                <div>
                  <h3 className="font-semibold text-gray-900">Office</h3>
                  <p className="text-gray-600">123 4th Street SW</p>
                  <p className="text-gray-600">Calgary, AB T2P 1K4</p>
                </div>
              </div>
            </div>

            {/* Chat Link */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700"
              >
                <span className="text-xl">💬</span>
                Chat with us now
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8 rounded-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Send a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}