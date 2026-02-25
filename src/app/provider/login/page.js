// 'use client';
/* eslint-disable react/no-unescaped-entities */

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

// export default function ProviderLogin() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const res = await fetch('/api/provider/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });

//       const data = await res.json();

//       if (data.success) {
//         if (data.provider.status === 'active' && data.provider.onboarding_completed) {
//           router.push('/provider/dashboard');
//         } else if (data.provider.onboarding_completed) {
//           router.push('/provider/pending');
//         } else {
//           router.push('/provider/onboarding');
//         }
//       } else {
//         setError(data.message);
//         if (data.requiresVerification) {
//           setTimeout(() => router.push('/provider/verify-email-pending'), 2000);
//         }
//       }
//     } catch (error) {
//       setError('Login failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="flex justify-center">
//           <div className="h-16 w-16 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200">
//             <LogIn className="h-8 w-8 text-white" />
//           </div>
//         </div>
//         <h2 className="mt-6 text-center text-3xl font-bold bg-gradient-to-r from-slate-800 to-teal-800 bg-clip-text text-transparent">
//           Welcome Back
//         </h2>
//         <p className="mt-2 text-center text-sm text-slate-600">
//           Sign in to your WorkOnTap account
//         </p>
//       </div>

//       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="bg-white/80 backdrop-blur-lg py-8 px-4 shadow-xl rounded-2xl sm:px-8 border border-slate-100">
//           <form className="space-y-5" onSubmit={handleSubmit}>
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                 <input
//                   type="email"
//                   required
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   className="pl-10 w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
//                   placeholder="john@example.com"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   required
//                   value={formData.password}
//                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                   className="pl-10 w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
//                   placeholder="••••••••"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4 text-slate-400" />
//                   ) : (
//                     <Eye className="h-4 w-4 text-slate-400" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {error && (
//               <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
//                 <p className="text-sm text-red-600">{error}</p>
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium rounded-xl hover:from-teal-700 hover:to-cyan-700 focus:ring-4 focus:ring-teal-200 transition disabled:opacity-50"
//             >
//               {loading ? 'Signing in...' : 'Sign in'}
//             </button>

//             <div className="flex items-center justify-between text-sm">
//               <Link href="/provider/forgot-password" className="text-teal-600 hover:text-teal-700">
//                 Forgot password?
//               </Link>
//               <Link href="/provider/signup" className="text-slate-600 hover:text-slate-700">
//                 Create account
//               </Link>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }







// app/provider/login/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProviderLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/provider/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success) {
        router.push('/provider/dashboard');
        router.refresh();
      } else {
        // 🔴 Check if rejected
        if (data.isRejected) {
          router.push(`/provider/rejected?reason=${encodeURIComponent(data.rejection_reason || '')}`);
        } else if (data.requiresVerification) {
          router.push('/provider/verify-email-pending');
        } else {
          setError(data.message || 'Login failed');
        }
      }
    } catch (error) {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Provider Login</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/provider/signup" className="text-teal-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}