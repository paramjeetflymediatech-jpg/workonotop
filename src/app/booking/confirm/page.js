














// // app/booking/confirm/page.js - COMPLETE FIXED VERSION WITH COOKIE AUTH
// 'use client';

// import Link from 'next/link';
// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Header from '@/components/Header';
// import Footer from '@/components/Footer';
// import CustomerAuthModal from '@/components/CustomerAuthModal';
// import { useAuth } from 'src/context/AuthContext';

// export default function BookingConfirmPage() {
//   const router = useRouter();
//   const { user, login } = useAuth();
//   const [scheduleData, setScheduleData] = useState(null);
//   const [detailsData, setDetailsData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const [showAuthModal, setShowAuthModal] = useState(false);
//   const [authMode, setAuthMode] = useState('signup');
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);

//   const [firstName, setFirstName] = useState('');
//   const [lastName, setLastName] = useState('');
//   const [email, setEmail] = useState('');
//   const [phone, setPhone] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [hearAbout, setHearAbout] = useState('');
//   const [receiveOffers, setReceiveOffers] = useState(false);
//   const [acceptTerms, setAcceptTerms] = useState(false);

//   // Show password states
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [showLoginPassword, setShowLoginPassword] = useState(false);

//   const [address, setAddress] = useState('');

//   const [submitting, setSubmitting] = useState(false);
//   const [authError, setAuthError] = useState('');

//   useEffect(() => {
//     const savedSchedule = sessionStorage.getItem('bookingSchedule');
//     const savedDetails = sessionStorage.getItem('bookingDetails');

//     if (savedSchedule && savedDetails) {
//       setScheduleData(JSON.parse(savedSchedule));
//       const details = JSON.parse(savedDetails);
//       setDetailsData(details);

//       if (details.address) {
//         setAddress(details.address);
//       }
//     } else {
//       router.push('/services');
//     }

//     // Check if user is already logged in via context
//     if (user) {
//       setCurrentUser(user);
//       setIsAuthenticated(true);
//       setFirstName(user.first_name);
//       setLastName(user.last_name);
//       setEmail(user.email);
//       setPhone(user.phone || '');
//     }

//     setLoading(false);
//   }, [router, user]);

//   // Signup handler with cookie auth
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

//     try {
//       const res = await fetch('/api/auth/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           first_name: firstName,
//           last_name: lastName,
//           email: email,
//           phone: phone,
//           password: password,
//           hear_about: hearAbout,
//           receive_offers: receiveOffers
//         })
//       });

//       const data = await res.json();

//       if (data.success) {
//         // Cookie is set automatically by the server
//         login(data.user);
//         setCurrentUser(data.user);
//         setIsAuthenticated(true);
//         setShowAuthModal(false);
//       } else {
//         setAuthError(data.message);
//       }
//     } catch (error) {
//       setAuthError('Failed to create account. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Login handler with cookie auth
//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setAuthError('');

//     try {
//       const res = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           email: email,
//           password: password
//         })
//       });

//       const data = await res.json();

//       if (data.success) {
//         // Cookie is set automatically by the server
//         login(data.user);
//         setCurrentUser(data.user);
//         setIsAuthenticated(true);
//         setFirstName(data.user.first_name);
//         setLastName(data.user.last_name);
//         setEmail(data.user.email);
//         setPhone(data.user.phone || '');
//         setShowAuthModal(false);
//       } else {
//         setAuthError(data.message);
//       }
//     } catch (error) {
//       setAuthError('Login failed. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Logout handler
//   const handleLogout = async () => {
//     try {
//       await fetch('/api/auth/logout', { method: 'POST' });
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
    
//     setIsAuthenticated(false);
//     setCurrentUser(null);
//     setFirstName('');
//     setLastName('');
//     setEmail('');
//     setPhone('');
//     setPassword('');
//   };

//   // Submit booking
//   const handleSubmitBooking = async (e) => {
//     e.preventDefault();

//     if (!isAuthenticated) {
//       setShowAuthModal(true);
//       return;
//     }

//     setSubmitting(true);

//     const bookingPayload = {
//       service_id: scheduleData.service_id,
//       service_name: scheduleData.service_name,
//       service_price: scheduleData.service_price,
//       additional_price: scheduleData.additional_price || 0,
//       first_name: firstName,
//       last_name: lastName,
//       email: email,
//       phone: phone,
//       job_date: scheduleData.job_date,
//       job_time_slot: scheduleData.job_time_slot,
//       timing_constraints: scheduleData.timing_constraints || '',
//       job_description: detailsData.job_description,
//       instructions: detailsData.instructions || '',
//       parking_access: detailsData.parking_access || false,
//       elevator_access: detailsData.elevator_access || false,
//       has_pets: detailsData.has_pets || false,
//       address_line1: address,
//       address_line2: '',
//       city: 'Calgary',
//       postal_code: '',
//       photos: detailsData.photos || [],
//       user_id: currentUser?.id
//     };

//     try {
//       const res = await fetch('/api/bookings', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(bookingPayload)
//       });

//       const data = await res.json();
      
//       if (data.success) {
//         // Store booking data with client secret
//         const bookingData = {
//           ...bookingPayload,
//           booking_id: data.booking_id,
//           booking_number: data.booking_number,
//           client_secret: data.client_secret
//         };
        
//         sessionStorage.setItem('lastBooking', JSON.stringify(bookingData));
        
//         // Clear old data
//         sessionStorage.removeItem('bookingSchedule');
//         sessionStorage.removeItem('bookingDetails');
        
//         // Redirect to payment page
//         router.push('/booking/payment');
//       } else {
//         alert('Something went wrong. Please try again.');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Something went wrong. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading || !scheduleData || !detailsData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-green-500 border-t-transparent"></div>
//       </div>
//     );
//   }

//   const formatDate = (dateStr) => {
//     const [year, month, day] = dateStr.split('-');
//     const date = new Date(year, month - 1, day);
//     return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
//   };

//   return (
//     <div className="min-h-screen bg-gray-50/50 font-sans antialiased">
//       <Header />

//       {/* Breadcrumb */}
//       <div className="bg-white border-b border-gray-200 py-2 sm:py-3">
//         <div className="container mx-auto px-3 sm:px-4">
//           <div className="flex items-center text-xs sm:text-sm text-gray-600 overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide">
//             <Link href="/" className="hover:text-green-700 transition flex-shrink-0">Home</Link>
//             <span className="mx-1 sm:mx-2 flex-shrink-0">›</span>
//             <Link href="/services" className="hover:text-green-700 transition flex-shrink-0">Services</Link>
//             <span className="mx-1 sm:mx-2 flex-shrink-0">›</span>
//             <Link href={`/services/${scheduleData.service_id}`} className="hover:text-green-700 transition flex-shrink-0 truncate max-w-[80px] sm:max-w-none">
//               {scheduleData.service_name}
//             </Link>
//             <span className="mx-1 sm:mx-2 flex-shrink-0">›</span>
//             <Link href="/booking/schedule" className="hover:text-green-700 transition flex-shrink-0">Schedule</Link>
//             <span className="mx-1 sm:mx-2 flex-shrink-0">›</span>
//             <Link href="/booking/details" className="hover:text-green-700 transition flex-shrink-0">Details</Link>
//             <span className="mx-1 sm:mx-2 flex-shrink-0">›</span>
//             <span className="text-gray-900 font-medium flex-shrink-0">Confirm</span>
//           </div>
//         </div>
//       </div>

//       <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
//         <div className="max-w-6xl mx-auto">

//           {/* Progress Bar - Step 3 of 3 */}
//           <div className="mb-6 sm:mb-8 md:mb-12">
//             <div className="flex items-center justify-between mb-2 sm:mb-3">
//               <span className="text-xs sm:text-sm md:text-base font-bold text-green-700 bg-green-100 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">
//                 STEP 3 OF 3
//               </span>
//               <span className="text-xs sm:text-sm text-gray-500 font-medium">Almost done!</span>
//             </div>
//             <div className="relative">
//               <div className="h-2 sm:h-2.5 bg-gray-200 rounded-full overflow-hidden">
//                 <div className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full" style={{ width: '100%' }}></div>
//               </div>
//               <div className="flex justify-between mt-1 sm:mt-2">
//                 <div className="flex flex-col items-start">
//                   <div className="flex items-center">
//                     <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">✓</div>
//                     <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs md:text-sm font-semibold text-green-700">Schedule</span>
//                   </div>
//                 </div>
//                 <div className="flex flex-col items-center">
//                   <div className="flex items-center">
//                     <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">✓</div>
//                     <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs md:text-sm font-semibold text-green-700">Details</span>
//                   </div>
//                 </div>
//                 <div className="flex flex-col items-end">
//                   <div className="flex items-center">
//                     <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">3</div>
//                     <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs md:text-sm font-semibold text-green-700">Confirm</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-12">

//             {/* Main Content */}
//             <div className="lg:col-span-2">
//               <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
//                 <div className="bg-gradient-to-r from-green-800 to-green-700 px-4 sm:px-6 py-4 sm:py-5">
//                   <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center">
//                     <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">✨</span>
//                     {isAuthenticated ? 'Confirm Your Booking' : 'Create an account to continue'}
//                   </h2>
//                   <p className="text-green-100 text-xs sm:text-sm mt-1 ml-1 break-words">
//                     {isAuthenticated
//                       ? `You're logged in as ${currentUser?.email}`
//                       : "You're one step away from connecting with trusted pros"}
//                   </p>
//                 </div>

//                 <div className="p-4 sm:p-6 md:p-8">
//                   {isAuthenticated ? (
//                     <div>
//                       {/* User Info */}
//                       <div className="bg-green-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-green-200 mb-4 sm:mb-6">
//                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                           <div className="flex items-center">
//                             <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-700 rounded-full flex items-center justify-center text-white text-base sm:text-xl font-bold flex-shrink-0">
//                               {firstName?.[0]}{lastName?.[0]}
//                             </div>
//                             <div className="ml-3 sm:ml-4 min-w-0 flex-1">
//                               <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{firstName} {lastName}</p>
//                               <p className="text-xs sm:text-sm text-gray-600 truncate">{email}</p>
//                               <p className="text-xs sm:text-sm text-gray-600">{phone}</p>
//                             </div>
//                           </div>
//                           <button
//                             onClick={handleLogout}
//                             className="text-xs sm:text-sm text-green-700 hover:text-green-800 font-medium underline self-start sm:self-center"
//                           >
//                             Not you?
//                           </button>
//                         </div>
//                       </div>

//                       {/* Address */}
//                       <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
//                         <div className="flex items-start">
//                           <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                             <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                           </svg>
//                           <div className="flex-1 min-w-0">
//                             <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Service Address</h4>
//                             <p className="text-xs sm:text-sm text-gray-700 break-words">{address}</p>
//                             <Link href="/booking/details" className="text-xs text-blue-700 hover:text-blue-800 font-medium mt-2 inline-flex items-center">
//                               <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                                 <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                               </svg>
//                               Edit address
//                             </Link>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Terms */}
//                       <div className="mb-4 sm:mb-6">
//                         <div className="flex items-start">
//                           <div className="flex items-center h-5">
//                             <input
//                               id="terms"
//                               type="checkbox"
//                               checked={acceptTerms}
//                               onChange={(e) => setAcceptTerms(e.target.checked)}
//                               className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
//                               required
//                             />
//                           </div>
//                           <div className="ml-2 sm:ml-3 text-xs sm:text-sm">
//                             <label htmlFor="terms" className="text-gray-600">
//                               I agree to WorkOnTap&apos;s{' '}
//                               <Link href="/terms" className="text-green-700 hover:text-green-800 font-medium underline">
//                                 Terms of Service
//                               </Link>{' '}
//                               and{' '}
//                               <Link href="/privacy" className="text-green-700 hover:text-green-800 font-medium underline">
//                                 Privacy Policy
//                               </Link>
//                             </label>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Submit Button */}
//                       <button
//                         onClick={handleSubmitBooking}
//                         disabled={submitting || !acceptTerms}
//                         className={`
//                           w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg shadow-lg
//                           flex items-center justify-center transition-all duration-300
//                           ${submitting || !acceptTerms
//                             ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                             : 'bg-gradient-to-r from-green-700 to-green-600 text-white hover:from-green-800 hover:to-green-700 hover:scale-[1.02] shadow-green-200'
//                           }
//                         `}
//                       >
//                         {submitting ? 'Processing...' : 'Confirm & Find a Pro'}
//                         <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
//                         </svg>
//                       </button>
//                     </div>
//                   ) : (
//                     // Not Authenticated - Show Signup/Login Options
//                     <div className="text-center py-4 sm:py-6 md:py-8">
//                       <div className="mb-6 sm:mb-8">
//                         <span className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 block">🔐</span>
//                         <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Ready to book?</h3>
//                         <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Create an account or log in to continue</p>
//                       </div>

//                       <div className="space-y-3 sm:space-y-4 max-w-sm mx-auto">
//                         <button
//                           onClick={() => {
//                             setAuthMode('signup');
//                             setShowAuthModal(true);
//                           }}
//                           className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg shadow-lg hover:from-green-800 hover:to-green-700 transition transform hover:scale-[1.02]"
//                         >
//                           Sign Up
//                         </button>

//                         <button
//                           onClick={() => {
//                             setAuthMode('login');
//                             setShowAuthModal(true);
//                           }}
//                           className="w-full border-2 border-green-700 text-green-700 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:bg-green-50 transition"
//                         >
//                           Log In
//                         </button>

//                         <p className="text-xs text-gray-500 mt-3 sm:mt-4 px-2">
//                           By continuing, you agree to WorkOnTap&apos;s{' '}
//                           <Link href="/terms" className="text-green-700 hover:underline">
//                             Terms
//                           </Link>{' '}
//                           and{' '}
//                           <Link href="/privacy" className="text-green-700 hover:underline">
//                             Privacy Policy
//                           </Link>
//                         </p>
//                       </div>

//                       <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
//                         <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-600">
//                           <span className="text-green-700 text-sm sm:text-base">🛡️</span>
//                           You&apos;re Protected with WorkOnTap
//                         </div>
//                         <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto px-2">
//                           We&apos;re proud to back every job with our Homeowner Protection Promise so you can be confident you&apos;re getting a high level of service every time.
//                           <Link href="/guarantee" className="text-green-700 ml-1 hover:underline whitespace-nowrap">
//                             Learn More
//                           </Link>
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Sidebar - Booking Summary */}
//             <div className="lg:col-span-1">
//               <div className="sticky top-24 space-y-4 sm:space-y-6">
//                 <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-green-100 overflow-hidden shadow-xl">
//                   <div className="bg-gradient-to-r from-green-800 to-green-700 px-4 sm:px-6 py-4 sm:py-5">
//                     <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
//                       <span className="mr-2">📋</span>
//                       Your booking
//                     </h3>
//                   </div>

//                   <div className="p-4 sm:p-6">
//                     <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
//                       <div className="bg-green-100 rounded-lg sm:rounded-xl p-2 sm:p-3 flex-shrink-0">
//                         <span className="text-xl sm:text-2xl">🔧</span>
//                       </div>
//                       <div className="min-w-0 flex-1">
//                         <h4 className="font-bold text-gray-900 text-sm sm:text-base break-words">{scheduleData.service_name}</h4>
//                       </div>
//                     </div>

//                     {/* Date */}
//                     <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
//                       <div className="flex items-center mb-2">
//                         <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
//                         </svg>
//                         <span className="font-semibold text-gray-800 text-xs sm:text-sm">{formatDate(scheduleData.job_date)}</span>
//                       </div>

//                       <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
//                         {scheduleData.job_time_slot?.map((time) => (
//                           <span key={time} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-700 text-white text-xs font-medium rounded-full capitalize flex items-center">
//                             <span className="mr-1 text-xs sm:text-sm">
//                               {time === 'morning' && '🌅'}
//                               {time === 'afternoon' && '☀️'}
//                               {time === 'evening' && '🌙'}
//                             </span>
//                             <span className="text-[10px] sm:text-xs">{time}</span>
//                           </span>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Location */}
//                     <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
//                       <div className="flex items-start">
//                         <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                         </svg>
//                         <div className="min-w-0 flex-1">
//                           <p className="text-xs sm:text-sm text-gray-700 font-medium mb-1">Service Location</p>
//                           <p className="text-xs text-gray-600 break-words">{address}</p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Description */}
//                     <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
//                       <div className="flex items-start">
//                         <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
//                         </svg>
//                         <div className="min-w-0 flex-1">
//                           <p className="text-xs sm:text-sm text-gray-700 line-clamp-2 break-words">
//                             {detailsData.job_description}
//                           </p>
//                           <div className="flex items-center mt-1">
//                             <span className="text-xs text-gray-500">{detailsData.photos.length} photo{detailsData.photos.length !== 1 ? 's' : ''} uploaded</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Price */}
//                     <div className="mb-2">
//                       <div className="flex justify-between items-center text-sm sm:text-base">
//                         <span className="text-gray-700">Service price</span>
//                         <span className="font-bold text-gray-900">${parseFloat(scheduleData.service_price).toFixed(2)}</span>
//                       </div>
//                       {scheduleData.additional_price > 0 && (
//                         <div className="flex justify-between items-center mt-1 text-xs sm:text-sm text-gray-600">
//                           <span>Additional (if needed)</span>
//                           <span>+${parseFloat(scheduleData.additional_price).toFixed(2)}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Protection Badge */}
//                 <div className="bg-gradient-to-br from-green-800 to-green-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
//                   <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
//                     <div className="text-3xl sm:text-4xl flex-shrink-0">🛡️</div>
//                     <div className="flex-1 min-w-0">
//                       <h4 className="font-bold text-base sm:text-lg md:text-xl mb-1 sm:mb-2">You&apos;re Protected with WorkOnTap</h4>
//                       <p className="text-green-100 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
//                         We back every job with our Homeowner Protection Promise. All pros are licensed, background-checked, and well-rated.
//                       </p>
//                       <Link href="/guarantee" className="inline-flex items-center bg-white text-green-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold hover:bg-green-50 transition shadow-md">
//                         Learn more
//                         <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                         </svg>
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Auth Modal */}
//       {showAuthModal && (
//         <CustomerAuthModal
//           isOpen={showAuthModal}
//           onClose={() => setShowAuthModal(false)}
//           defaultMode={authMode}
//         />
//       )}

//       {/* Add custom animation for mobile modal */}
//       <style jsx>{`
//         @keyframes slide-up {
//           from {
//             transform: translateY(100%);
//           }
//           to {
//             transform: translateY(0);
//           }
//         }
//         .animate-slide-up {
//           animation: slide-up 0.3s ease-out;
//         }
//         @media (min-width: 640px) {
//           .animate-slide-up {
//             animation: none;
//           }
//         }
//         /* Hide scrollbar for breadcrumb */
//         .scrollbar-hide::-webkit-scrollbar {
//           display: none;
//         }
//         .scrollbar-hide {
//           -ms-overflow-style: none;
//           scrollbar-width: none;
//         }
//       `}</style>

//       <Footer />
//     </div>
//   );
// }















// app/booking/confirm/page.js - FIXED VERSION (No duplicate bookings)
'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CustomerAuthModal from '@/components/CustomerAuthModal';
import { useAuth } from 'src/context/AuthContext';

export default function BookingConfirmPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const [scheduleData, setScheduleData] = useState(null);
  const [detailsData, setDetailsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // ✅ FIX: Add a ref to track if submission is in progress
  const isSubmittingRef = useRef(false);
  // ✅ FIX: Add a ref to track if booking was already created
  const bookingCreatedRef = useRef(false);

  useEffect(() => {
    const savedSchedule = sessionStorage.getItem('bookingSchedule');
    const savedDetails = sessionStorage.getItem('bookingDetails');

    if (savedSchedule && savedDetails) {
      setScheduleData(JSON.parse(savedSchedule));
      const details = JSON.parse(savedDetails);
      setDetailsData(details);

      if (details.address) {
        setAddress(details.address);
      }
    } else {
      router.push('/services');
    }

    // Check if user is already logged in via context
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setEmail(user.email);
      setPhone(user.phone || '');
    }

    setLoading(false);
  }, [router, user]);

  // Submit booking - FIXED with duplicate prevention
  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // ✅ FIX: Prevent multiple submissions
    if (isSubmittingRef.current || bookingCreatedRef.current) {
      console.log('Submission already in progress or completed');
      return;
    }

    setSubmitting(true);
    isSubmittingRef.current = true;

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
      timing_constraints: scheduleData.timing_constraints || '',
      job_description: detailsData.job_description,
      instructions: detailsData.instructions || '',
      parking_access: detailsData.parking_access || false,
      elevator_access: detailsData.elevator_access || false,
      has_pets: detailsData.has_pets || false,
      address_line1: address,
      address_line2: '',
      city: 'Calgary',
      postal_code: '',
      photos: detailsData.photos || [],
      user_id: currentUser?.id
    };

    try {
      console.log('Creating booking...', bookingPayload);
      
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });

      const data = await res.json();
      
      if (data.success) {
        // ✅ FIX: Mark as created to prevent duplicate
        bookingCreatedRef.current = true;
        
        // Store booking data with client secret
        const bookingData = {
          ...bookingPayload,
          booking_id: data.booking_id,
          booking_number: data.booking_number,
          client_secret: data.client_secret
        };
        
        sessionStorage.setItem('lastBooking', JSON.stringify(bookingData));
        
        // Clear old data
        sessionStorage.removeItem('bookingSchedule');
        sessionStorage.removeItem('bookingDetails');
        
        console.log('Booking created successfully:', data.booking_number);
        
        // Redirect to payment page
        router.push('/booking/payment');
      } else {
        alert('Something went wrong. Please try again.');
        // ✅ FIX: Reset ref on error
        isSubmittingRef.current = false;
        bookingCreatedRef.current = false;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
      // ✅ FIX: Reset ref on error
      isSubmittingRef.current = false;
      bookingCreatedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  };

  // Signup handler
  const handleSignup = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          password: password,
        })
      });

      const data = await res.json();

      if (data.success) {
        login(data.user);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setShowAuthModal(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.success) {
        login(data.user);
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        setFirstName(data.user.first_name);
        setLastName(data.user.last_name);
        setEmail(data.user.email);
        setPhone(data.user.phone || '');
        setShowAuthModal(false);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert('Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !scheduleData || !detailsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
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
      <Header />

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Progress Bar - Step 3 of 3 */}
          <div className="mb-6 sm:mb-8 md:mb-12">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-xs sm:text-sm md:text-base font-bold text-green-700 bg-green-100 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">
                STEP 3 OF 3
              </span>
              <span className="text-xs sm:text-sm text-gray-500 font-medium">Almost done!</span>
            </div>
            <div className="relative">
              <div className="h-2 sm:h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full" style={{ width: '100%' }}></div>
              </div>
              <div className="flex justify-between mt-1 sm:mt-2">
                <div className="flex flex-col items-start">
                  <div className="flex items-center">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">✓</div>
                    <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs md:text-sm font-semibold text-green-700">Schedule</span>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">✓</div>
                    <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs md:text-sm font-semibold text-green-700">Details</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-600 rounded-full flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">3</div>
                    <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs md:text-sm font-semibold text-green-700">Confirm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-800 to-green-700 px-4 sm:px-6 py-4 sm:py-5">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white flex items-center">
                    <span className="mr-2 sm:mr-3 text-xl sm:text-2xl">✨</span>
                    {isAuthenticated ? 'Confirm Your Booking' : 'Create an account to continue'}
                  </h2>
                </div>

                <div className="p-4 sm:p-6 md:p-8">
                  {isAuthenticated ? (
                    <div>
                      {/* User Info */}
                      <div className="bg-green-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 border-green-200 mb-4 sm:mb-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-700 rounded-full flex items-center justify-center text-white text-base sm:text-xl font-bold">
                              {firstName?.[0]}{lastName?.[0]}
                            </div>
                            <div className="ml-3 sm:ml-4">
                              <p className="font-bold text-gray-900 text-sm sm:text-base">{firstName} {lastName}</p>
                              <p className="text-xs sm:text-sm text-gray-600">{email}</p>
                              <p className="text-xs sm:text-sm text-gray-600">{phone}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
                        <div className="flex items-start">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">Service Address</h4>
                            <p className="text-xs sm:text-sm text-gray-700">{address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="mb-4 sm:mb-6">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="terms"
                              type="checkbox"
                              checked={acceptTerms}
                              onChange={(e) => setAcceptTerms(e.target.checked)}
                              className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500"
                              required
                            />
                          </div>
                          <div className="ml-2 sm:ml-3 text-xs sm:text-sm">
                            <label htmlFor="terms" className="text-gray-600">
                              I agree to WorkOnTap&apos;s{' '}
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

                      {/* Submit Button - FIXED: Only one submission possible */}
                      <button
                        onClick={handleSubmitBooking}
                        disabled={submitting || !acceptTerms}
                        className={`
                          w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg shadow-lg
                          flex items-center justify-center transition-all duration-300
                          ${submitting || !acceptTerms
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-700 to-green-600 text-white hover:from-green-800 hover:to-green-700 hover:scale-[1.02]'
                          }
                        `}
                      >
                        {submitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            Confirm & Find a Pro
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    // Not Authenticated - Show Signup/Login Options
                    <div className="text-center py-4 sm:py-6 md:py-8">
                      <div className="mb-6 sm:mb-8">
                        <span className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 block">🔐</span>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Ready to book?</h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Create an account or log in to continue</p>
                      </div>

                      <div className="space-y-3 sm:space-y-4 max-w-sm mx-auto">
                        <button
                          onClick={() => {
                            setAuthMode('signup');
                            setShowAuthModal(true);
                          }}
                          className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg shadow-lg hover:from-green-800 hover:to-green-700 transition"
                        >
                          Sign Up
                        </button>

                        <button
                          onClick={() => {
                            setAuthMode('login');
                            setShowAuthModal(true);
                          }}
                          className="w-full border-2 border-green-700 text-green-700 py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg hover:bg-green-50 transition"
                        >
                          Log In
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar - Booking Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-green-100 overflow-hidden shadow-xl">
                  <div className="bg-gradient-to-r from-green-800 to-green-700 px-4 sm:px-6 py-4 sm:py-5">
                    <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
                      <span className="mr-2">📋</span>
                      Your booking
                    </h3>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="flex items-start space-x-2 sm:space-x-3 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
                      <div className="bg-green-100 rounded-lg sm:rounded-xl p-2 sm:p-3">
                        <span className="text-xl sm:text-2xl">🔧</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm sm:text-base">{scheduleData.service_name}</h4>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold text-gray-800 text-xs sm:text-sm">{formatDate(scheduleData.job_date)}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 sm:gap-2 mt-2">
                        {scheduleData.job_time_slot?.map((time) => (
                          <span key={time} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-700 text-white text-xs font-medium rounded-full capitalize">
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Location */}
                    <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-200">
                      <div className="flex items-start">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-700 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-700 font-medium mb-1">Service Location</p>
                          <p className="text-xs text-gray-600">{address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-2">
                      <div className="flex justify-between items-center text-sm sm:text-base">
                        <span className="text-gray-700">Service price</span>
                        <span className="font-bold text-gray-900">${parseFloat(scheduleData.service_price).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Protection Badge */}
                <div className="bg-gradient-to-br from-green-800 to-green-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl sm:text-4xl">🛡️</div>
                    <div>
                      <h4 className="font-bold text-base sm:text-lg mb-2">You&apos;re Protected</h4>
                      <p className="text-green-100 text-xs sm:text-sm">
                        We back every job with our Homeowner Protection Promise.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <CustomerAuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode={authMode}
        />
      )}

      <Footer />
    </div>
  );
}