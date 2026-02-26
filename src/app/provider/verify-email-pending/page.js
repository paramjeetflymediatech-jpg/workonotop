// 'use client';
// /* eslint-disable react/no-unescaped-entities */

// import Link from 'next/link';
// import { Mail, RefreshCw } from 'lucide-react';

// export default function VerifyEmailPending() {
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col justify-center py-12 px-4">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="bg-white/80 backdrop-blur-lg py-8 px-4 shadow-xl rounded-2xl sm:px-8 border border-slate-100 text-center">
//           <div className="h-20 w-20 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
//             <Mail className="h-10 w-10 text-teal-600" />
//           </div>
          
//           <h2 className="text-2xl font-bold text-slate-800 mb-2">Check Your Email</h2>
//           <p className="text-slate-600 mb-6">
//             We've sent a verification link to your email address. Please click the link to verify your account.
//           </p>
          
//           <div className="space-y-4">
//             <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
//               <p className="text-sm text-slate-600">
//                 Didn't receive the email? Check your spam folder or
//               </p>
//             </div>
            
//             <Link
//               href="/provider/signup"
//               className="inline-flex items-center justify-center text-teal-600 hover:text-teal-700 font-medium"
//             >
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Try again
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
















// ==========================================
// verify-email-pending/page.jsx
// ==========================================
'use client';
/* eslint-disable react/no-unescaped-entities */
import Link from 'next/link';
import { Mail, RefreshCw } from 'lucide-react';

export default function VerifyEmailPending() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="text-xl font-bold text-green-700 mb-8 inline-block">WorkOnTap</Link>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-xs mx-auto">
            We've sent a verification link to your email address. Click the link to activate your account.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-amber-700 mb-1">📌 Didn't receive it?</p>
            <p className="text-sm text-amber-700">Check your spam or junk folder. The email comes from no-reply@workontap.com</p>
          </div>
          <Link href="/provider/signup"
            className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium transition">
            <RefreshCw className="h-4 w-4" /> Try again with different email
          </Link>
        </div>
      </div>
    </div>
  );
}