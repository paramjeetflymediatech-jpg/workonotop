'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DataDeletionPage() {
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const getWordCount = (text) => {
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate word count
    const wordCount = getWordCount(reason);
    if (wordCount > 500) {
      setError('Reason for deletion cannot exceed 500 words.');
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/auth/data-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reason }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
        setEmail('');
        setReason('');
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError('Failed to submit request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium mb-8"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Homepage
        </Link>

        <div className="relative">
          {/* Mobile-only Background Blur overlay */}
          <div className="md:hidden fixed inset-0 bg-white/40 backdrop-blur-xl -z-10 pointer-events-none" />

          {/* Dynamic Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-20 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-100 rounded-full blur-[100px] opacity-60 animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-50 rounded-full blur-[100px] opacity-60 animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative z-10">
            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Deletion Request</h1>
              <p className="text-gray-500 mb-8">
                Submit a request to permanently delete your account and associated data.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-800">Important</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      This action is permanent and cannot be undone. Once processed, all your personal data, job history, and account settings will be permanently removed from our platform.
                    </p>
                  </div>
                </div>
              </div>

              {message && (
                <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-8">
                  {message}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 mb-8">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="reason" className="block text-sm font-semibold text-gray-700">
                      Reason for Deletion
                    </label>
                    <span className={`text-xs font-medium ${getWordCount(reason) > 500 ? 'text-red-500' : 'text-gray-400'}`}>
                      {getWordCount(reason)} / 500 words
                    </span>
                  </div>
                  <textarea
                    id="reason"
                    rows={4}
                    placeholder="Please let us know why you'd like to delete your data..."
                    className={`w-full px-4 py-3 rounded-xl border transition-all outline-none resize-none ${
                      getWordCount(reason) > 500 ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-green-500'
                    }`}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? 'Submitting...' : 'Submit Deletion Request'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
