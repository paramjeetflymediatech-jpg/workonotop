// // app/provider/rejected/page.jsx
// 'use client';

// import { useState, useEffect } from 'react';
// import Link from 'next/link';
// import { useSearchParams } from 'next/navigation';

// export default function RejectedPage() {
//   const searchParams = useSearchParams();
//   const reason = searchParams.get('reason') || 'No specific reason provided';
//   const [provider, setProvider] = useState(null);

//   useEffect(() => {
//     fetchProviderData();
//   }, []);

//   const fetchProviderData = async () => {
//     try {
//       const res = await fetch('/api/provider/me');
//       const data = await res.json();
//       if (data.success) {
//         setProvider(data.provider);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     }
//   };

//   const handleLogout = async () => {
//     await fetch('/api/provider/logout', { method: 'POST' });
//     window.location.href = '/provider/login';
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-red-600 to-red-500 p-6 text-center">
//           <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
//             <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//             </svg>
//           </div>
//           <h1 className="text-2xl font-bold text-white">Application Rejected</h1>
//         </div>

//         {/* Body */}
//         <div className="p-6 space-y-6">
//           <div className="text-center">
//             <p className="text-gray-600 mb-2">
//               Hi <span className="font-semibold">{provider?.name || 'there'}</span>,
//             </p>
//             <p className="text-gray-600">
//               Your application to join WorkOnTap was not approved at this time.
//             </p>
//           </div>

//           {/* Reason Box */}
//           <div className="bg-red-50 border border-red-200 rounded-xl p-4">
//             <p className="text-sm font-medium text-red-800 mb-2">📋 Rejection Reason:</p>
//             <p className="text-sm text-red-700 bg-white p-3 rounded-lg border border-red-100">
//               {reason}
//             </p>
//           </div>

//           {/* Actions */}
//           <div className="flex flex-col gap-3 pt-4">
//             <button
//               onClick={handleLogout}
//               className="w-full py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition"
//             >
//               ← Back to Login
//             </button>
//             <Link
//               href="/"
//               className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition text-center"
//             >
//               Go to Homepage
//             </Link>
//           </div>

//           <p className="text-xs text-center text-gray-500">
//             Need help? Contact <a href="mailto:support@workontap.com" className="text-teal-600">support@workontap.com</a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
















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


// ==========================================
// verify-email-pending/page.jsx
// ==========================================
// 'use client';
// /* eslint-disable react/no-unescaped-entities */
// import Link from 'next/link';
// import { Mail, RefreshCw } from 'lucide-react';
// 
// export default function VerifyEmailPending() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-md">
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
//           <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
//             <Mail className="h-8 w-8 text-green-600" />
//           </div>
//           <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
//           <p className="text-gray-500 text-sm mb-6 leading-relaxed">
//             We've sent a verification link to your email. Click the link to verify your account and continue.
//           </p>
//           <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-5 text-sm text-gray-500">
//             Didn't receive it? Check your spam folder.
//           </div>
//           <Link href="/provider/signup"
//             className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium">
//             <RefreshCw className="h-4 w-4" /> Try again with a different email
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }


// ==========================================
// verify-email/page.jsx
// ==========================================
// 'use client';
// import { useEffect, useState } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import Link from 'next/link';
// import { CheckCircle, XCircle, Loader } from 'lucide-react';
// 
// export default function VerifyEmail() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const token = searchParams.get('token');
//   const [status, setStatus] = useState('verifying');
//   const [message, setMessage] = useState('');
// 
//   useEffect(() => {
//     if (!token) { setStatus('error'); setMessage('No verification token provided'); return; }
//     fetch(`/api/provider/verify-email?token=${token}`)
//       .then(r => r.json())
//       .then(data => {
//         if (data.success) {
//           setStatus('success'); setMessage('Email verified successfully!');
//           setTimeout(() => router.push('/provider/login'), 3000);
//         } else {
//           setStatus('error'); setMessage(data.message || 'Verification failed');
//         }
//       })
//       .catch(() => { setStatus('error'); setMessage('Verification failed'); });
//   }, [token, router]);
// 
//   const states = {
//     verifying: { icon: <Loader className="h-10 w-10 text-green-600 animate-spin" />, title: 'Verifying your email...', sub: 'Please wait a moment', bg: 'bg-green-50' },
//     success: { icon: <CheckCircle className="h-10 w-10 text-green-600" />, title: 'Email Verified!', sub: 'Redirecting to login...', bg: 'bg-green-50' },
//     error: { icon: <XCircle className="h-10 w-10 text-red-500" />, title: 'Verification Failed', sub: message, bg: 'bg-red-50' },
//   };
//   const s = states[status];
// 
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-sm">
//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
//           <div className={`w-16 h-16 ${s.bg} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
//             {s.icon}
//           </div>
//           <h2 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h2>
//           <p className="text-gray-500 text-sm">{s.sub}</p>
//           {status === 'error' && (
//             <Link href="/provider/signup" className="mt-5 inline-flex text-green-600 hover:text-green-700 text-sm font-medium">
//               ← Back to Sign Up
//             </Link>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }