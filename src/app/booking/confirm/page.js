// // app/booking/confirm/page.js - Booking Confirmation Page
// // ✅ WorkOnTap green theme — consistent with all other pages
// // ✅ All Jiffy references removed — pure WorkOnTap branding
// // ✅ Modern account creation with email/password and social options
// // ✅ Booking summary preview
// // ✅ Mobile menu toggle included
// // ✅ Progress tracker with all steps complete
// // ✅ Fully responsive

// 'use client';

// import Link from 'next/link';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Header from '@/components/Header';

// export default function BookingConfirmPage() {
//   const router = useRouter();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [phone, setPhone] = useState('');
//   const [acceptTerms, setAcceptTerms] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   const toggleMobileMenu = () => {
//     setMobileMenuOpen(!mobileMenuOpen);
//   };

//   // Service data (would come from context/state in real app)
//   const bookingData = {
//     serviceName: 'Appliance Install',
//     icon: '🔌',
//     price: 180,
//     location: '123 B Avenue Southwest, Calgary AB',
//     date: 'February 16, 2026',
//     times: ['afternoon'],
//     jobDescription: 'Whirlpool dishwasher (model WDF540PADM) is not draining. Makes humming sound but water stays at bottom.',
//     photos: 2
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // In a real app, this would create an account and submit the booking
//     router.push('/booking/success');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50/50 font-sans antialiased">
//       {/* ===== HEADER – WorkOnTap green theme with mobile toggle ===== */}
//      <Header/>

//       {/* ===== BREADCRUMBS ===== */}
//       <div className="bg-white border-b border-gray-200 py-3">
//         <div className="container mx-auto px-4">
//           <div className="flex items-center text-sm text-gray-600">
//             <Link href="/" className="hover:text-green-700 transition">Home</Link>
//             <span className="mx-2">›</span>
//             <Link href="/services" className="hover:text-green-700 transition">Services</Link>
//             <span className="mx-2">›</span>
//             <Link href="/services/appliance-install" className="hover:text-green-700 transition">Appliance Install</Link>
//             <span className="mx-2">›</span>
//             <Link href="/booking/schedule" className="hover:text-green-700 transition">Schedule</Link>
//             <span className="mx-2">›</span>
//             <Link href="/booking/details" className="hover:text-green-700 transition">Details</Link>
//             <span className="mx-2">›</span>
//             <span className="text-gray-900 font-medium">Confirm & Pay</span>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-4 py-8 md:py-12">
//         <div className="max-w-6xl mx-auto">
          
//           {/* ===== PROGRESS TRACKER – All steps complete ===== */}
//           <div className="mb-10 md:mb-12">
//             <div className="flex items-center justify-between mb-3">
//               <span className="text-sm md:text-base font-bold text-green-700 bg-green-100 px-4 py-1.5 rounded-full">STEP 3 OF 3</span>
//               <span className="text-sm text-gray-500 font-medium">Almost done!</span>
//             </div>
//             <div className="relative">
//               <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
//                 <div className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full" style={{width: '100%'}}></div>
//               </div>
//               <div className="flex justify-between mt-2">
//                 <div className="flex flex-col items-start">
//                   <div className="flex items-center">
//                     <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
//                     <span className="ml-2 text-sm font-semibold text-green-700">Schedule</span>
//                   </div>
//                 </div>
//                 <div className="flex flex-col items-center">
//                   <div className="flex items-center">
//                     <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
//                     <span className="ml-2 text-sm font-semibold text-green-700">Details</span>
//                   </div>
//                 </div>
//                 <div className="flex flex-col items-end">
//                   <div className="flex items-center">
//                     <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
//                     <span className="ml-2 text-sm font-semibold text-green-700">Confirm</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
//             {/* ===== LEFT COLUMN - Account Creation Form ===== */}
//             <div className="lg:col-span-2">
//               <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
//                 <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
//                   <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
//                     <span className="mr-3 text-2xl">✨</span>
//                     Create your account to get started!
//                   </h2>
//                   <p className="text-green-100 text-sm mt-1 ml-1">
//                     You're one step away from connecting with trusted pros
//                   </p>
//                 </div>
                
//                 <div className="p-6 md:p-8">
//                   <form onSubmit={handleSubmit}>
//                     {/* Name row */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           First name <span className="text-green-600">*</span>
//                         </label>
//                         <input
//                           type="text"
//                           value={firstName}
//                           onChange={(e) => setFirstName(e.target.value)}
//                           className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
//                           placeholder="John"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-semibold text-gray-700 mb-2">
//                           Last name <span className="text-green-600">*</span>
//                         </label>
//                         <input
//                           type="text"
//                           value={lastName}
//                           onChange={(e) => setLastName(e.target.value)}
//                           className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
//                           placeholder="Doe"
//                           required
//                         />
//                       </div>
//                     </div>

//                     {/* Email */}
//                     <div className="mb-4">
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         Email address <span className="text-green-600">*</span>
//                       </label>
//                       <input
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
//                         placeholder="you@example.com"
//                         required
//                       />
//                     </div>

//                     {/* Phone */}
//                     <div className="mb-4">
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         Phone number <span className="text-green-600">*</span>
//                       </label>
//                       <input
//                         type="tel"
//                         value={phone}
//                         onChange={(e) => setPhone(e.target.value)}
//                         className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
//                         placeholder="(403) 555-0123"
//                         required
//                       />
//                       <p className="text-xs text-gray-500 mt-2 flex items-center">
//                         <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                         </svg>
//                         Pros will use this to contact you about your job
//                       </p>
//                     </div>

//                     {/* Password */}
//                     <div className="mb-4">
//                       <label className="block text-sm font-semibold text-gray-700 mb-2">
//                         Password <span className="text-green-600">*</span>
//                       </label>
//                       <div className="relative">
//                         <input
//                           type={showPassword ? "text" : "password"}
//                           value={password}
//                           onChange={(e) => setPassword(e.target.value)}
//                           className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none pr-12"
//                           placeholder="Create a password"
//                           required
//                           minLength={8}
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowPassword(!showPassword)}
//                           className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
//                         >
//                           {showPassword ? (
//                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                             </svg>
//                           ) : (
//                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//                             </svg>
//                           )}
//                         </button>
//                       </div>
//                       <p className="text-xs text-gray-500 mt-2">
//                         Must be at least 8 characters
//                       </p>
//                     </div>

//                     {/* Terms and conditions */}
//                     <div className="mb-6">
//                       <div className="flex items-start">
//                         <div className="flex items-center h-5">
//                           <input
//                             id="terms"
//                             type="checkbox"
//                             checked={acceptTerms}
//                             onChange={(e) => setAcceptTerms(e.target.checked)}
//                             className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
//                             required
//                           />
//                         </div>
//                         <div className="ml-3 text-sm">
//                           <label htmlFor="terms" className="text-gray-600">
//                             I agree to WorkOnTap's{' '}
//                             <Link href="/terms" className="text-green-700 hover:text-green-800 font-medium underline">
//                               Terms of Service
//                             </Link>{' '}
//                             and{' '}
//                             <Link href="/privacy" className="text-green-700 hover:text-green-800 font-medium underline">
//                               Privacy Policy
//                             </Link>
//                           </label>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Submit button */}
//                     <button
//                       type="submit"
//                       disabled={!acceptTerms || !firstName || !lastName || !email || !phone || !password || password.length < 8}
//                       className={`
//                         w-full py-4 rounded-xl font-bold text-lg shadow-lg
//                         flex items-center justify-center transition-all duration-300
//                         ${acceptTerms && firstName && lastName && email && phone && password && password.length >= 8
//                           ? 'bg-gradient-to-r from-green-700 to-green-600 text-white hover:from-green-800 hover:to-green-700 hover:scale-[1.02] shadow-green-200' 
//                           : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                         }
//                       `}
//                     >
//                       Confirm & Find a Pro
//                       <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
//                       </svg>
//                     </button>
//                   </form>

//                   {/* Divider */}
//                   <div className="relative my-8">
//                     <div className="absolute inset-0 flex items-center">
//                       <div className="w-full border-t border-gray-300"></div>
//                     </div>
//                     <div className="relative flex justify-center text-sm">
//                       <span className="px-4 bg-white text-gray-500">Or continue with</span>
//                     </div>
//                   </div>

//                   {/* Social login options */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <button className="flex items-center justify-center p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition">
//                       <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
//                         <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
//                         <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
//                         <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
//                         <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
//                       </svg>
//                       Google
//                     </button>
//                     <button className="flex items-center justify-center p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition">
//                       <svg className="w-5 h-5 mr-2 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
//                         <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
//                       </svg>
//                       Facebook
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* ===== RIGHT COLUMN - Booking Summary & Protection Promise ===== */}
//             <div className="lg:col-span-1">
//               <div className="sticky top-24 space-y-6">
                
//                 {/* Booking Summary Card */}
//                 <div className="bg-white rounded-2xl border-2 border-green-100 overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
//                   <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
//                     <h3 className="text-xl font-bold text-white flex items-center">
//                       <span className="mr-2">📋</span>
//                       Your booking
//                     </h3>
//                   </div>
                  
//                   <div className="p-6">
//                     {/* Service */}
//                     <div className="flex items-start space-x-3 mb-4 pb-4 border-b border-gray-200">
//                       <div className="bg-green-100 rounded-xl p-3">
//                         <span className="text-2xl">{bookingData.icon}</span>
//                       </div>
//                       <div>
//                         <h4 className="font-bold text-gray-900">{bookingData.serviceName}</h4>
//                         <p className="text-sm text-gray-600 flex items-center mt-1">
//                           <svg className="w-4 h-4 text-green-700 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                             <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                           </svg>
//                           {bookingData.location}
//                         </p>
//                       </div>
//                     </div>

//                     {/* Date & Time */}
//                     <div className="mb-4 pb-4 border-b border-gray-200">
//                       <div className="flex items-center mb-2">
//                         <svg className="w-5 h-5 text-green-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
//                         </svg>
//                         <span className="font-semibold text-gray-800">{bookingData.date}</span>
//                       </div>
//                       <div className="flex gap-2 ml-7">
//                         {bookingData.times.map(time => (
//                           <span key={time} className="px-3 py-1 bg-green-700 text-white text-xs font-medium rounded-full capitalize">
//                             {time === 'morning' && '🌅 '}
//                             {time === 'afternoon' && '☀️ '}
//                             {time === 'evening' && '🌙 '}
//                             {time}
//                           </span>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Job Details Preview */}
//                     <div className="mb-4 pb-4 border-b border-gray-200">
//                       <div className="flex items-start">
//                         <svg className="w-5 h-5 text-green-700 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//                         </svg>
//                         <div>
//                           <p className="text-sm text-gray-700 line-clamp-2">
//                             {bookingData.jobDescription}
//                           </p>
//                           <div className="flex items-center mt-1">
//                             <span className="text-xs text-gray-500">{bookingData.photos} photo{bookingData.photos > 1 ? 's' : ''} uploaded</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Pricing */}
//                     <div className="mb-2">
//                       <div className="flex justify-between items-center">
//                         <span className="text-gray-700">Service price</span>
//                         <span className="font-bold text-gray-900">${bookingData.price}</span>
//                       </div>
//                       <div className="flex justify-between items-center mt-1 text-sm text-gray-600">
//                         <span>+ additional appliance (if needed)</span>
//                         <span>+$90</span>
//                       </div>
//                     </div>

//                     <Link href="/booking/schedule" className="text-xs text-green-700 hover:text-green-800 font-medium mt-2 inline-flex items-center">
//                       <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.038-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
//                       </svg>
//                       Edit booking details
//                     </Link>
//                   </div>
//                 </div>

//                 {/* Protection Promise Card */}
//                 <div className="bg-gradient-to-br from-green-800 to-green-700 rounded-2xl p-6 text-white shadow-lg">
//                   <div className="flex items-start space-x-4">
//                     <div className="text-4xl">🛡️</div>
//                     <div>
//                       <h4 className="font-bold text-xl mb-2">You're Protected with WorkOnTap</h4>
//                       <p className="text-green-100 text-sm mb-4 leading-relaxed">
//                         We back every job with our Homeowner Protection Promise. 
//                         All pros are licensed, background-checked, and well-rated. 
//                         If your experience isn't perfect, we'll make it right.
//                       </p>
//                       <Link 
//                         href="/guarantee" 
//                         className="inline-flex items-center bg-white text-green-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-50 transition shadow-md"
//                       >
//                         Learn more about our guarantee
//                         <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                         </svg>
//                       </Link>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Trust badges */}
//                 <div className="bg-white rounded-2xl border border-gray-200 p-5">
//                   <div className="flex items-center justify-around">
//                     <div className="text-center">
//                       <div className="text-2xl mb-1">✓</div>
//                       <div className="text-xs font-semibold text-gray-800">Free quotes</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-2xl mb-1">🔒</div>
//                       <div className="text-xs font-semibold text-gray-800">Secure payment</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-2xl mb-1">⭐</div>
//                       <div className="text-xs font-semibold text-gray-800">4.8 ★ rating</div>
//                     </div>
//                     <div className="text-center">
//                       <div className="text-2xl mb-1">↩️</div>
//                       <div className="text-xs font-semibold text-gray-800">Free cancellation</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ===== SIMPLE FOOTER ===== */}
//       <footer className="bg-white border-t border-gray-200 mt-16 py-8">
//         <div className="container mx-auto px-4">
//           <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
//             <div className="flex items-center space-x-4">
//               <Link href="/" className="text-green-800 font-extrabold text-lg">WorkOnTap</Link>
//               <span>© 2026</span>
//             </div>
//             <div className="flex space-x-6 mt-4 md:mt-0">
//               <Link href="/terms" className="hover:text-green-700 transition">Terms</Link>
//               <Link href="/privacy" className="hover:text-green-700 transition">Privacy</Link>
//               <Link href="/guarantee" className="hover:text-green-700 transition">Guarantee</Link>
//               <Link href="/help" className="hover:text-green-700 transition">Help</Link>
//             </div>
//           </div>
//         </div>
//       </footer>

//       {/* Animation styles */}
//       <style jsx>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//       `}</style>
//     </div>
//   );
// }








// app/booking/confirm/page.js
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function BookingConfirmPage() {
  const router = useRouter();
  const [scheduleData, setScheduleData] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [address, setAddress] = useState('123 8 Avenue Southwest, Suite 504, Calgary AB');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedSchedule = sessionStorage.getItem('bookingSchedule');
    const savedDetails = sessionStorage.getItem('bookingDetails');
    
    if (savedSchedule && savedDetails) {
      setScheduleData(JSON.parse(savedSchedule));
      setDetailsData(JSON.parse(savedDetails));
    } else {
      router.push('/services');
    }
    setLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const bookingPayload = {
      service_id: scheduleData.service_id,
      service_name: scheduleData.service_name,
      service_price: scheduleData.service_price,
      additional_price: scheduleData.additional_price || 0,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      job_date: scheduleData.job_date,
      job_time_slot: scheduleData.job_time_slot,
      timing_constraints: scheduleData.timing_constraints,
      job_description: detailsData.job_description,
      instructions: detailsData.instructions,
      parking_access: detailsData.parking_access,
      elevator_access: detailsData.elevator_access,
      has_pets: detailsData.has_pets,
      address_line1: address,
      city: 'Calgary',
      photos: detailsData.photos || []
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });

      const data = await res.json();
      if (data.success) {
        sessionStorage.clear();
        router.push(`/booking/success/${data.booking_id}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !scheduleData || !detailsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans antialiased">
      <Header/>

      <div className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-green-700 transition">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/services" className="hover:text-green-700 transition">Services</Link>
            <span className="mx-2">›</span>
            <Link href={`/services/${scheduleData.service_id}`} className="hover:text-green-700 transition">{scheduleData.service_name}</Link>
            <span className="mx-2">›</span>
            <Link href="/booking/schedule" className="hover:text-green-700 transition">Schedule</Link>
            <span className="mx-2">›</span>
            <Link href="/booking/details" className="hover:text-green-700 transition">Details</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-medium">Confirm & Pay</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Progress Tracker */}
          <div className="mb-10 md:mb-12">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm md:text-base font-bold text-green-700 bg-green-100 px-4 py-1.5 rounded-full">STEP 3 OF 3</span>
              <span className="text-sm text-gray-500 font-medium">Almost done!</span>
            </div>
            <div className="relative">
              <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full" style={{width: '100%'}}></div>
              </div>
              <div className="flex justify-between mt-2">
                <div className="flex flex-col items-start">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                    <span className="ml-2 text-sm font-semibold text-green-700">Schedule</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                    <span className="ml-2 text-sm font-semibold text-green-700">Details</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                    <span className="ml-2 text-sm font-semibold text-green-700">Confirm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Left Column - Account Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
                  <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
                    <span className="mr-3 text-2xl">✨</span>
                    Create your account to get started!
                  </h2>
                  <p className="text-green-100 text-sm mt-1 ml-1">
                    You're one step away from connecting with trusted pros
                  </p>
                </div>
                
                <div className="p-6 md:p-8">
                  <form onSubmit={handleSubmit}>
                    {/* Name row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          First name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
                          placeholder="John"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Last name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    {/* Phone */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
                        placeholder="(403) 555-0123"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Pros will use this to contact you about your job
                      </p>
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none pr-12"
                          placeholder="Create a password"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Must be at least 8 characters
                      </p>
                    </div>

                    {/* Address */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Service address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition outline-none"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Your address is kept private until you accept a pro
                      </p>
                    </div>

                    {/* Terms */}
                    <div className="mb-6">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="terms"
                            type="checkbox"
                            checked={acceptTerms}
                            onChange={(e) => setAcceptTerms(e.target.checked)}
                            className="w-5 h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                            required
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="terms" className="text-gray-600">
                            I agree to WorkOnTap's{' '}
                            <Link href="/terms" className="text-green-700 hover:text-green-800 font-medium underline">
                              Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-green-700 hover:text-green-800 font-medium underline">
                              Privacy Policy
                            </Link>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={submitting || !acceptTerms || !firstName || !lastName || !email || !phone || !password || password.length < 8}
                      className={`
                        w-full py-4 rounded-xl font-bold text-lg shadow-lg
                        flex items-center justify-center transition-all duration-300
                        ${submitting || !acceptTerms || !firstName || !lastName || !email || !phone || !password || password.length < 8
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-700 to-green-600 text-white hover:from-green-800 hover:to-green-700 hover:scale-[1.02] shadow-green-200'
                        }
                      `}
                    >
                      {submitting ? 'Processing...' : 'Confirm & Find a Pro'}
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                
                <div className="bg-white rounded-2xl border-2 border-green-100 overflow-hidden shadow-xl">
                  <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
                    <h3 className="text-xl font-bold text-white flex items-center">
                      <span className="mr-2">📋</span>
                      Your booking
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start space-x-3 mb-4 pb-4 border-b border-gray-200">
                      <div className="bg-green-100 rounded-xl p-3">
                        <span className="text-2xl">🔌</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{scheduleData.service_name}</h4>
                      </div>
                    </div>

                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center mb-2">
                        <svg className="w-5 h-5 text-green-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold text-gray-800">{formatDate(scheduleData.job_date)}</span>
                      </div>
                      <div className="flex gap-2 ml-7">
                        <span className="px-3 py-1 bg-green-700 text-white text-xs font-medium rounded-full capitalize">
                          {scheduleData.job_time_slot === 'morning' && '🌅 '}
                          {scheduleData.job_time_slot === 'afternoon' && '☀️ '}
                          {scheduleData.job_time_slot === 'evening' && '🌙 '}
                          {scheduleData.job_time_slot}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-green-700 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {detailsData.job_description}
                          </p>
                          <div className="flex items-center mt-1">
                            <span className="text-xs text-gray-500">{detailsData.photos.length} photo{detailsData.photos.length !== 1 ? 's' : ''} uploaded</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Service price</span>
                        <span className="font-bold text-gray-900">${parseFloat(scheduleData.service_price).toFixed(2)}</span>
                      </div>
                      {scheduleData.additional_price > 0 && (
                        <div className="flex justify-between items-center mt-1 text-sm text-gray-600">
                          <span>Additional (if needed)</span>
                          <span>+${parseFloat(scheduleData.additional_price).toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <Link href="/booking/schedule" className="text-xs text-green-700 hover:text-green-800 font-medium mt-2 inline-flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.038-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      Edit booking details
                    </Link>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-800 to-green-700 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">🛡️</div>
                    <div>
                      <h4 className="font-bold text-xl mb-2">You're Protected with WorkOnTap</h4>
                      <p className="text-green-100 text-sm mb-4 leading-relaxed">
                        We back every job with our Homeowner Protection Promise. 
                        All pros are licensed, background-checked, and well-rated. 
                        If your experience isn't perfect, we'll make it right.
                      </p>
                      <Link href="/guarantee" className="inline-flex items-center bg-white text-green-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-50 transition shadow-md">
                        Learn more
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex items-center justify-around">
                    <div className="text-center">
                      <div className="text-2xl mb-1">✓</div>
                      <div className="text-xs font-semibold text-gray-800">Free quotes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">🔒</div>
                      <div className="text-xs font-semibold text-gray-800">Secure payment</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">⭐</div>
                      <div className="text-xs font-semibold text-gray-800">4.8 ★ rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl mb-1">↩️</div>
                      <div className="text-xs font-semibold text-gray-800">Free cancellation</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 mt-16 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-green-800 font-extrabold text-lg">WorkOnTap</Link>
              <span>© 2026</span>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/terms" className="hover:text-green-700 transition">Terms</Link>
              <Link href="/privacy" className="hover:text-green-700 transition">Privacy</Link>
              <Link href="/guarantee" className="hover:text-green-700 transition">Guarantee</Link>
              <Link href="/help" className="hover:text-green-700 transition">Help</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}