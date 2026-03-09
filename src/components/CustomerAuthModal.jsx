
















// 'use client';

// import Link from 'next/link';
// import { useState } from 'react';
// import { useAuth } from 'src/context/AuthContext';

// export default function CustomerAuthModal({ isOpen, onClose, defaultMode = 'login' }) {
//   const { login, checkAuth } = useAuth();

//   const [authMode, setAuthMode] = useState(defaultMode);
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [hearAbout, setHearAbout] = useState('');
//   const [receiveOffers, setReceiveOffers] = useState(false);

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [showLoginPassword, setShowLoginPassword] = useState(false);

//   const [submitting, setSubmitting] = useState(false);
//   const [authError, setAuthError] = useState('');
//   const [forgotEmail, setForgotEmail] = useState('');
//   const [forgotStatus, setForgotStatus] = useState('idle'); // 'idle' | 'loading' | 'sent'
//   const [forgotError, setForgotError] = useState('');

//   if (!isOpen) return null;

//   const resetForm = () => {
//     setFirstName(''); setLastName(''); setEmail(''); setPhone('');
//     setPassword(''); setConfirmPassword(''); setHearAbout('');
//     setReceiveOffers(false); setAuthError('');
//     setShowPassword(false); setShowConfirmPassword(false); setShowLoginPassword(false);
//     setForgotEmail(''); setForgotStatus('idle'); setForgotError('');
//   };

//   const handleClose = () => {
//     resetForm();
//     onClose();
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setAuthError('');

//     if (password !== confirmPassword) {
//       setAuthError('Passwords do not match');
//       setSubmitting(false);
//       return;
//     }
//     if (password.length < 8) {
//       setAuthError('Password must be at least 8 characters');
//       setSubmitting(false);
//       return;
//     }
//     // validate phone contains only digits, spaces, +, -, parentheses
//     const phonePattern = /^[0-9()\-\s+]+$/;
//     if (!phonePattern.test(phone)) {
//       setAuthError('Phone number contains invalid characters');
//       setSubmitting(false);
//       return;
//     }

//     try {
//       const res = await fetch('/api/auth/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           first_name: firstName,
//           last_name: lastName,
//           email,
//           phone,
//           password,
//           hear_about: hearAbout,
//           receive_offers: receiveOffers
//         })
//       });

//       const data = await res.json();

//       if (data.success) {
//         // ✅ Cookie is set automatically by the server
//         login(data.user);
//         resetForm();
//         onClose();
//       } else {
//         setAuthError(data.message || 'Signup failed. Please try again.');
//       }
//     } catch {
//       setAuthError('Failed to create account. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setAuthError('');

//     try {
//       const res = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password })
//       });

//       const data = await res.json();

//       if (data.success) {
//         // ✅ Cookie is set automatically by the server
//         login(data.user);
//         resetForm();
//         onClose();
//       } else {
//         setAuthError(data.message || 'Login failed. Please try again.');
//       }
//     } catch {
//       setAuthError('Login failed. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleForgotPassword = async (e) => {
//     e.preventDefault();
//     setForgotError('');
//     setForgotStatus('loading');
//     try {
//       const res = await fetch('/api/auth/forgot-password', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email: forgotEmail })
//       });
//       const data = await res.json();
//       if (data.success) {
//         setForgotStatus('sent');
//       } else {
//         setForgotError(data.message || 'Something went wrong. Please try again.');
//         setForgotStatus('idle');
//       }
//     } catch {
//       setForgotError('Network error. Please try again.');
//       setForgotStatus('idle');
//     }
//   };

//   const EyeIcon = () => (
//     <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//     </svg>
//   );

//   const EyeOffIcon = () => (
//     <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//     </svg>
//   );

//   return (
//     <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
//       <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">

//         {/* Header */}
//         <div className="bg-gradient-to-r from-green-800 to-green-700 px-4 sm:px-6 py-4 sm:py-5 sticky top-0">
//           <div className="flex items-center justify-between">
//             <div>
//               <h2 className="text-xl sm:text-2xl font-bold text-white">
//                 {authMode === 'signup' ? 'Create Account' : authMode === 'forgot' ? 'Forgot Password' : 'Welcome Back'}
//               </h2>
//               <p className="text-green-100 text-xs sm:text-sm mt-0.5">
//                 {authMode === 'signup'
//                   ? 'Join WorkOnTap to book trusted pros'
//                   : authMode === 'forgot'
//                     ? 'We\'ll send a reset link to your email'
//                     : 'Log in to manage your bookings'}
//               </p>
//             </div>
//             <button
//               onClick={handleClose}
//               className="text-white/80 hover:text-white transition p-1 ml-2"
//             >
//               <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         </div>

//         <div className="p-4 sm:p-6">
//           {/* Error */}
//           {authError && (
//             <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-xs sm:text-sm">
//               <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//               </svg>
//               <span>{authError}</span>
//             </div>
//           )}

//           {/* Tab switcher — hide when in forgot mode */}
//           {authMode !== 'forgot' && (
//             <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 mb-5">
//               <button
//                 type="button"
//                 onClick={() => { setAuthMode('login'); setAuthError(''); }}
//                 className={`flex-1 py-2 text-sm font-semibold transition ${authMode === 'login'
//                   ? 'bg-green-700 text-white'
//                   : 'bg-white text-gray-600 hover:bg-gray-50'
//                   }`}
//               >
//                 Log In
//               </button>
//               <button
//                 type="button"
//                 onClick={() => { setAuthMode('signup'); setAuthError(''); }}
//                 className={`flex-1 py-2 text-sm font-semibold transition ${authMode === 'signup'
//                   ? 'bg-green-700 text-white'
//                   : 'bg-white text-gray-600 hover:bg-gray-50'
//                   }`}
//               >
//                 Sign Up
//               </button>
//             </div>
//           )}

//           {/* LOGIN FORM */}
//           {authMode === 'login' && (
//             <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
//               <div>
//                 <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="email" required value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="you@email.com"
//                   className="w-full p-2.5 sm:p-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
//                   Password <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <input
//                     type={showLoginPassword ? 'text' : 'password'}
//                     required value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Your password"
//                     className="w-full p-2.5 sm:p-3 pr-10 sm:pr-12 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
//                   />
//                   <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}
//                     className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
//                     {showLoginPassword ? <EyeIcon /> : <EyeOffIcon />}
//                   </button>
//                 </div>
//               </div>

//               <button type="submit" disabled={submitting}
//                 className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:from-green-800 hover:to-green-700 transition disabled:opacity-50 mt-2">
//                 {submitting ? 'Logging in...' : 'Log In'}
//               </button>

//               <div className="text-center">
//                 <button
//                   type="button"
//                   onClick={() => { setAuthMode('forgot'); setAuthError(''); setForgotEmail(email); }}
//                   className="text-sm text-green-700 hover:underline font-medium"
//                 >
//                   Forgot your password?
//                 </button>
//               </div>
//             </form>
//           )}

//           {/* FORGOT PASSWORD */}
//           {authMode === 'forgot' && (
//             <div>
//               {forgotStatus === 'sent' ? (
//                 <div className="text-center py-4">
//                   <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                     </svg>
//                   </div>
//                   <h3 className="font-bold text-gray-900 mb-1">Check your inbox</h3>
//                   <p className="text-sm text-gray-500 mb-5">
//                     If an account exists for <strong>{forgotEmail}</strong>, a reset link has been sent.
//                   </p>
//                   <button
//                     type="button"
//                     onClick={() => { setAuthMode('login'); setForgotStatus('idle'); setForgotEmail(''); }}
//                     className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:from-green-800 hover:to-green-700 transition"
//                   >
//                     Back to Log In
//                   </button>
//                 </div>
//               ) : (
//                 <form onSubmit={handleForgotPassword} className="space-y-4">
//                   {forgotError && (
//                     <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
//                       <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                       </svg>
//                       {forgotError}
//                     </div>
//                   )}
//                   <div>
//                     <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
//                       Email Address <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="email" required value={forgotEmail}
//                       onChange={e => setForgotEmail(e.target.value)}
//                       placeholder="you@email.com"
//                       className="w-full p-2.5 sm:p-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
//                     />
//                   </div>
//                   <button
//                     type="submit"
//                     disabled={forgotStatus === 'loading'}
//                     className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:from-green-800 hover:to-green-700 transition disabled:opacity-50"
//                   >
//                     {forgotStatus === 'loading' ? 'Sending...' : 'Send Reset Link'}
//                   </button>
//                   <div className="text-center">
//                     <button
//                       type="button"
//                       onClick={() => { setAuthMode('login'); setForgotError(''); setForgotStatus('idle'); }}
//                       className="text-sm text-gray-500 hover:text-gray-700"
//                     >
//                       ← Back to Log In
//                     </button>
//                   </div>
//                 </form>
//               )}
//             </div>
//           )}

//           {/* SIGNUP FORM */}
//           {authMode === 'signup' && (
//             <form onSubmit={handleSignup} className="space-y-3 sm:space-y-4">
//               <div className="grid grid-cols-2 gap-2 sm:gap-3">
//                 <div>
//                   <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
//                     First Name <span className="text-red-500">*</span>
//                   </label>
//                   <input type="text" required value={firstName}
//                     onChange={(e) => setFirstName(e.target.value)}
//                     className="w-full p-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none" />
//                 </div>
//                 <div>
//                   <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
//                     Last Name <span className="text-red-500">*</span>
//                   </label>
//                   <input type="text" required value={lastName}
//                     onChange={(e) => setLastName(e.target.value)}
//                     className="w-full p-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none" />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <input type="email" required value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="you@email.com"
//                   className="w-full p-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none" />
//               </div>

//               <div>
//                 <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
//                   Phone <span className="text-red-500">*</span>
//                 </label>
//                 <input type="tel" required value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   placeholder="+1 (403) 000-0000"
//                   className="w-full p-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none" />
//               </div>

//               <div>
//                 <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
//                   Password <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <input type={showPassword ? 'text' : 'password'} required minLength={8}
//                     value={password} onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Min. 8 characters"
//                     className="w-full p-2.5 pr-10 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none" />
//                   <button type="button" onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
//                     {showPassword ? <EyeIcon /> : <EyeOffIcon />}
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
//                   Confirm Password <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <input type={showConfirmPassword ? 'text' : 'password'} required
//                     value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
//                     placeholder="Repeat password"
//                     className="w-full p-2.5 pr-10 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none" />
//                   <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
//                     {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
//                   How did you hear about us?
//                 </label>
//                 <input type="text" value={hearAbout}
//                   onChange={(e) => setHearAbout(e.target.value)}
//                   placeholder="e.g. social media, from a friend..."
//                   className="w-full p-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none" />
//               </div>

//               <label className="flex items-start gap-2 cursor-pointer">
//                 <input type="checkbox" checked={receiveOffers}
//                   onChange={(e) => setReceiveOffers(e.target.checked)}
//                   className="mt-0.5 w-4 h-4 text-green-600 border-2 border-gray-300 rounded" />
//                 <span className="text-xs text-gray-600">
//                   Yes! I&apos;d like to receive news and special offers from WorkOnTap.
//                 </span>
//               </label>

//               <button type="submit" disabled={submitting}
//                 className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:from-green-800 hover:to-green-700 transition disabled:opacity-50">
//                 {submitting ? 'Creating account...' : 'Create Account'}
//               </button>

//               <p className="text-xs text-center text-gray-500">
//                 By signing up you agree to WorkOnTap&apos;s{' '}
//                 <Link href="/terms" className="text-green-700 hover:underline">Terms</Link> &{' '}
//                 <Link href="/privacy" className="text-green-700 hover:underline">Privacy Policy</Link>
//               </p>
//             </form>
//           )}

//           {/* Trust badges */}
//           <div className="mt-5 pt-4 border-t border-gray-200">
//             <div className="grid grid-cols-2 gap-3">
//               <div className="text-center bg-gray-50 rounded-xl p-3">
//                 <div className="text-xl mb-1">🛡️</div>
//                 <div className="text-[10px] sm:text-xs text-gray-600 font-medium">Homeowner Protection Promise</div>
//               </div>
//               <div className="text-center bg-gray-50 rounded-xl p-3">
//                 <div className="text-xl mb-1">⚡</div>
//                 <div className="text-[10px] sm:text-xs text-gray-600 font-medium">Confirmed appointments in minutes</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }























'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from 'src/context/AuthContext';

// ── Phone validation helper ───────────────────────────────────────────────────
// Strips formatting chars, checks digit count is 10-15 (E.164 standard)
function validatePhone(raw) {
  const digits = raw.replace(/[\s()\-+]/g, '')
  if (!/^\d+$/.test(digits))       return 'Phone number contains invalid characters'
  if (digits.length < 10)          return 'Phone number is too short (min 10 digits)'
  if (digits.length > 15)          return 'Phone number is too long (max 15 digits)'
  return null // valid
}

export default function CustomerAuthModal({ isOpen, onClose, defaultMode = 'login' }) {
  const { login } = useAuth();

  const [authMode, setAuthMode] = useState(defaultMode);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hearAbout, setHearAbout] = useState('');
  const [receiveOffers, setReceiveOffers] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('idle');
  const [forgotError, setForgotError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setPhoneError('');
    setPassword(''); setConfirmPassword(''); setHearAbout('');
    setReceiveOffers(false); setAuthError('');
    setShowPassword(false); setShowConfirmPassword(false); setShowLoginPassword(false);
    setForgotEmail(''); setForgotStatus('idle'); setForgotError('');
  };

  const handleClose = () => { resetForm(); onClose(); };

  // Live phone input — only allow valid chars, cap at 16 chars (e.g. +1 (403) 000-0000)
  const handlePhoneChange = (e) => {
    const val = e.target.value
    // block if more than 16 raw chars (prevents endless typing)
    if (val.replace(/[\s()\-+]/g, '').length > 15) return
    setPhone(val)
    if (phoneError) setPhoneError(validatePhone(val) || '')
  }

  const handlePhoneBlur = () => {
    if (phone) setPhoneError(validatePhone(phone) || '')
  }

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError('');

    // Password checks
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match'); return;
    }
    if (password.length < 8) {
      setAuthError('Password must be at least 8 characters'); return;
    }

    // Phone check
    const phoneErr = validatePhone(phone)
    if (phoneErr) { setPhoneError(phoneErr); return; }

    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName, last_name: lastName,
          email, phone, password,
          hear_about: hearAbout, receive_offers: receiveOffers
        })
      });
      const data = await res.json();
      if (data.success) { login(data.user); resetForm(); onClose(); }
      else setAuthError(data.message || 'Signup failed. Please try again.');
    } catch {
      setAuthError('Failed to create account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true); setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) { login(data.user); resetForm(); onClose(); }
      else setAuthError(data.message || 'Login failed. Please try again.');
    } catch {
      setAuthError('Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault(); setForgotError(''); setForgotStatus('loading');
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (data.success) setForgotStatus('sent');
      else { setForgotError(data.message || 'Something went wrong.'); setForgotStatus('idle'); }
    } catch {
      setForgotError('Network error. Please try again.'); setForgotStatus('idle');
    }
  };

  const EyeIcon = () => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
  const EyeOffIcon = () => (
    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );

  return (
    <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-green-800 to-green-700 px-4 sm:px-6 py-4 sm:py-5 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {authMode === 'signup' ? 'Create Account' : authMode === 'forgot' ? 'Forgot Password' : 'Welcome Back'}
              </h2>
              <p className="text-green-100 text-xs sm:text-sm mt-0.5">
                {authMode === 'signup'
                  ? 'Join WorkOnTap to book trusted pros'
                  : authMode === 'forgot'
                    ? "We'll send a reset link to your email"
                    : 'Log in to manage your bookings'}
              </p>
            </div>
            <button onClick={handleClose} className="text-white/80 hover:text-white transition p-1 ml-2">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">

          {/* Error banner */}
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-xs sm:text-sm">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          {/* Tab switcher */}
          {authMode !== 'forgot' && (
            <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 mb-5">
              <button type="button" onClick={() => { setAuthMode('login'); setAuthError(''); }}
                className={`flex-1 py-2 text-sm font-semibold transition ${authMode === 'login' ? 'bg-green-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                Log In
              </button>
              <button type="button" onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                className={`flex-1 py-2 text-sm font-semibold transition ${authMode === 'signup' ? 'bg-green-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                Sign Up
              </button>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {authMode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full p-2.5 sm:p-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none" />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type={showLoginPassword ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)} placeholder="Your password"
                    className="w-full p-2.5 sm:p-3 pr-10 sm:pr-12 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none" />
                  <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showLoginPassword ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:from-green-800 hover:to-green-700 transition disabled:opacity-50 mt-2">
                {submitting ? 'Logging in...' : 'Log In'}
              </button>
              <div className="text-center">
                <button type="button" onClick={() => { setAuthMode('forgot'); setAuthError(''); setForgotEmail(email); }}
                  className="text-sm text-green-700 hover:underline font-medium">
                  Forgot your password?
                </button>
              </div>
            </form>
          )}

          {/* ── FORGOT PASSWORD ── */}
          {authMode === 'forgot' && (
            <div>
              {forgotStatus === 'sent' ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">Check your inbox</h3>
                  <p className="text-sm text-gray-500 mb-5">
                    If an account exists for <strong>{forgotEmail}</strong>, a reset link has been sent.
                  </p>
                  <button type="button" onClick={() => { setAuthMode('login'); setForgotStatus('idle'); setForgotEmail(''); }}
                    className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:from-green-800 hover:to-green-700 transition">
                    Back to Log In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {forgotError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700 text-sm">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {forgotError}
                    </div>
                  )}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full p-2.5 sm:p-3 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none" />
                  </div>
                  <button type="submit" disabled={forgotStatus === 'loading'}
                    className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:from-green-800 hover:to-green-700 transition disabled:opacity-50">
                    {forgotStatus === 'loading' ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <div className="text-center">
                    <button type="button" onClick={() => { setAuthMode('login'); setForgotError(''); setForgotStatus('idle'); }}
                      className="text-sm text-gray-500 hover:text-gray-700">
                      ← Back to Log In
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ── SIGNUP FORM ── */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                    className="w-full p-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none" />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                    className="w-full p-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full p-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none" />
              </div>

              {/* ── Phone field with validation ── */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  placeholder="+1 (403) 000-0000"
                  maxLength={17}
                  className={`w-full p-2.5 text-sm border-2 rounded-xl focus:ring-2 transition outline-none
                    ${phoneError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100 bg-red-50'
                      : 'border-gray-200 focus:border-green-500 focus:ring-green-200'}`}
                />
                {phoneError && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {phoneError}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-400">Format: +1 (403) 000-0000 · 10–15 digits</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} required minLength={8}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full p-2.5 pr-10 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type={showConfirmPassword ? 'text' : 'password'} required
                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full p-2.5 pr-10 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeIcon /> : <EyeOffIcon />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  How did you hear about us?
                </label>
                <input type="text" value={hearAbout} onChange={e => setHearAbout(e.target.value)}
                  placeholder="e.g. social media, from a friend..."
                  className="w-full p-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none" />
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={receiveOffers} onChange={e => setReceiveOffers(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-green-600 border-2 border-gray-300 rounded flex-shrink-0" />
                <span className="text-xs text-gray-600">
                  Yes! I&apos;d like to receive news and special offers from WorkOnTap.
                </span>
              </label>

              <button type="submit" disabled={submitting}
                className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:from-green-800 hover:to-green-700 transition disabled:opacity-50">
                {submitting ? 'Creating account...' : 'Create Account'}
              </button>

              <p className="text-xs text-center text-gray-500">
                By signing up you agree to WorkOnTap&apos;s{' '}
                <Link href="/terms" className="text-green-700 hover:underline">Terms</Link> &{' '}
                <Link href="/privacy" className="text-green-700 hover:underline">Privacy Policy</Link>
              </p>
            </form>
          )}

          {/* Trust badges */}
          <div className="mt-5 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center bg-gray-50 rounded-xl p-3">
                <div className="text-xl mb-1">🛡️</div>
                <div className="text-[10px] sm:text-xs text-gray-600 font-medium">Homeowner Protection Promise</div>
              </div>
              <div className="text-center bg-gray-50 rounded-xl p-3">
                <div className="text-xl mb-1">⚡</div>
                <div className="text-[10px] sm:text-xs text-gray-600 font-medium">Confirmed appointments in minutes</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}