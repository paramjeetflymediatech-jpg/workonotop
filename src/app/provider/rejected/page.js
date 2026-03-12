

// ==========================================
// rejected/page.jsx
// ==========================================
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { XCircle, Mail, Home, ArrowLeft } from 'lucide-react';

export default function RejectedPage() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'No specific reason provided.';
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    fetch('/api/provider/me').then(r => r.json()).then(d => { if (d.success) setProvider(d.provider); });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/provider/logout', { method: 'POST' });
    window.location.href = '/provider/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <XCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Application Not Approved</h1>
            <p className="text-red-200 text-sm mt-1">WorkOnTap Pro Portal</p>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <p className="text-gray-600 text-sm text-center">
                Hi <span className="font-semibold text-gray-800">{provider?.name || 'there'}</span>, your application was reviewed but not approved at this time.
              </p>
            </div>

            {/* Reason */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2">Reason for Rejection</p>
              <p className="text-sm text-red-800 bg-white border border-red-100 rounded-lg p-3 leading-relaxed">{reason}</p>
            </div>

            {/* Support note */}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-start gap-3">
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">
                If you believe this is an error or have questions, please reach out to{' '}
                <a href="mailto:support@workontap.com" className="text-green-600 font-medium">support@workontap.com</a>
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 pt-1">
              <button onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl transition text-sm">
                <ArrowLeft className="h-4 w-4" /> Back to Login
              </button>
              <Link href="/"
                className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition text-sm">
                <Home className="h-4 w-4" /> Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

