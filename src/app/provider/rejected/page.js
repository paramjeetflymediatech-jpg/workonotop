// app/provider/rejected/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function RejectedPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'No specific reason provided';
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    fetchProviderData();
  }, []);

  const fetchProviderData = async () => {
    try {
      const res = await fetch('/api/provider/me');
      const data = await res.json();
      if (data.success) {
        setProvider(data.provider);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/provider/logout', { method: 'POST' });
    window.location.href = '/provider/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Application Rejected</h1>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Hi <span className="font-semibold">{provider?.name || 'there'}</span>,
            </p>
            <p className="text-gray-600">
              Your application to join WorkOnTap was not approved at this time.
            </p>
          </div>

          {/* Reason Box */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-medium text-red-800 mb-2">📋 Rejection Reason:</p>
            <p className="text-sm text-red-700 bg-white p-3 rounded-lg border border-red-100">
              {reason}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition"
            >
              ← Back to Login
            </button>
            <Link
              href="/"
              className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition text-center"
            >
              Go to Homepage
            </Link>
          </div>

          <p className="text-xs text-center text-gray-500">
            Need help? Contact <a href="mailto:support@workontap.com" className="text-teal-600">support@workontap.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}