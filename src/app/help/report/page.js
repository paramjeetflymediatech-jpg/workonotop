'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from 'src/context/AuthContext'

export default function ReportIssue() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    bookingId: '',
    issueType: '',
    description: ''
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would send to your API
    console.log('Report:', formData)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted</h1>
          <p className="text-gray-600 mb-6">We'll look into this and get back to you within 24 hours.</p>
          <Link href="/help" className="text-green-700 hover:underline">
            ← Back to Help Center
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="bg-gradient-to-b from-green-50 to-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <Link href="/help" className="text-green-700 hover:underline mb-2 inline-block">
            ← Back to Help Center
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Report an Issue</h1>
          <p className="text-gray-600 mt-1">We're here to help resolve any problems</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {!user ? (
          <div className="bg-yellow-50 rounded-xl p-8 text-center border border-yellow-200">
            <span className="text-4xl mb-4 block">🔒</span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Please sign in</h2>
            <p className="text-gray-600 mb-4">You need to be logged in to report an issue.</p>
            <Link href="/login" className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800">
              Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking ID (optional)
              </label>
              <input
                type="text"
                placeholder="e.g., BK1771388460292419"
                value={formData.bookingId}
                onChange={(e) => setFormData({...formData, bookingId: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">If you have a specific booking, enter its ID</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issue Type
              </label>
              <select
                value={formData.issueType}
                onChange={(e) => setFormData({...formData, issueType: e.target.value})}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select issue type</option>
                <option value="pro-no-show">Pro didn't show up</option>
                <option value="poor-work">Poor quality work</option>
                <option value="billing">Billing issue</option>
                <option value="safety">Safety concern</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Please describe the issue in detail..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition"
            >
              Submit Report
            </button>
          </form>
        )}
      </div>

      <Footer />
    </div>
  )
}