// app/provider/forgot-password/page.jsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ProviderForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const res = await fetch('/api/provider/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setSuccess(true)
        setSubmittedEmail(email)
        setEmail('')
      } else {
        setError(data.message || 'Something went wrong')
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-600">
              WorkOnTap
            </span>
          </Link>
          <p className="text-gray-500 mt-2 text-sm">Provider Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-emerald-100 text-sm">
              No worries! Enter your email and we&apos;ll send you reset instructions.
            </p>
          </div>

          {/* Body */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Check your email</h2>
                <p className="text-gray-500 text-sm mb-6">
                  We&apos;ve sent a password reset link to:<br />
                  <strong className="text-gray-700">{submittedEmail}</strong>
                </p>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
                  <p className="text-xs text-blue-700 font-medium mb-2">📧 Didn&apos;t receive the email?</p>
                  <ul className="text-xs text-blue-600 space-y-1 list-disc pl-4">
                    <li>Check your spam/junk folder</li>
                    <li>Make sure you entered the correct email</li>
                    <li>Wait a few minutes and try again</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => setSuccess(false)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition"
                  >
                    Try another email
                  </button>
                  <Link
                    href="/provider/login"
                    className="block text-center text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Back to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <span>⚠️</span>
                      {error}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Instructions'
                  )}
                </button>

                {/* Back to Login */}
                <div className="text-center">
                  <Link
                    href="/provider/login"
                    className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8">
          © {new Date().getFullYear()} WorkOnTap. All rights reserved.
        </p>
      </div>
    </div>
  )
}