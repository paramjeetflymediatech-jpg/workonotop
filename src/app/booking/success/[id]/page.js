// // app/booking/success/[id]/page.jsx - UPDATED with hourly rate display (no addition)
// 'use client';

// import Link from 'next/link';
// import { useState, useEffect, use } from 'react';
// import { useRouter } from 'next/navigation';
// import Header from '@/components/Header';
// import { useAuth } from 'src/context/AuthContext';

// export default function BookingSuccessPage({ params }) {
//   const unwrappedParams = use(params);
//   const bookingId = unwrappedParams.id;
  
//   const router = useRouter();
//   const { user } = useAuth();
//   const [booking, setBooking] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (bookingId) {
//       fetchBooking();
//     }
//   }, [bookingId]);

//   const fetchBooking = async () => {
//     try {
//       const res = await fetch(`/api/bookings/${bookingId}`);
//       const data = await res.json();
      
//       if (data.success) {
//         setBooking(data.data);
//       } else {
//         setError(data.message || 'Booking not found');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       setError('Failed to load booking details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Format time slot for display
//   const formatTimeSlot = (slot) => {
//     if (!slot) return '';
    
//     if (Array.isArray(slot)) {
//       return slot.map(s => {
//         switch(s) {
//           case 'morning': return '🌅 Morning (8am-12pm)';
//           case 'afternoon': return '☀️ Afternoon (12pm-4pm)';
//           case 'evening': return '🌙 Evening (4pm-8pm)';
//           default: return s;
//         }
//       }).join(', ');
//     }
    
//     switch(slot) {
//       case 'morning': return '🌅 Morning (8am-12pm)';
//       case 'afternoon': return '☀️ Afternoon (12pm-4pm)';
//       case 'evening': return '🌙 Evening (4pm-8pm)';
//       default: return slot;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading your booking details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !booking) {
//     return (
//       <div className="min-h-screen bg-gray-50 font-sans antialiased">
//         <Header />
//         <div className="container mx-auto px-4 py-16">
//           <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
//             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//               </svg>
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
//             <p className="text-gray-600 mb-6">{error || 'The booking you\'re looking for doesn\'t exist.'}</p>
//             <Link 
//               href="/" 
//               className="inline-block bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition"
//             >
//               Return Home
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const basePrice = parseFloat(booking.service_price);
//   const hourlyRate = parseFloat(booking.additional_price || 0);

//   return (
//     <div className="min-h-screen bg-gray-50/50 font-sans antialiased">
//       <Header/>

//       <div className="container mx-auto px-4 py-16 md:py-24">
//         <div className="max-w-2xl mx-auto">
          
//           {/* Success Card */}
//           <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//             <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-8 text-center">
//               <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
//                 <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
//                 Booking Confirmed!
//               </h1>
//               <p className="text-green-100 text-lg">
//                 Your job request has been submitted successfully
//               </p>
//             </div>

//             <div className="p-6 md:p-8">
              
//               {/* Booking Number */}
//               <div className="text-center mb-6">
//                 <p className="text-sm text-gray-500 mb-1">Booking Number</p>
//                 <p className="text-2xl font-bold text-green-700 bg-green-50 px-4 py-2 rounded-lg inline-block border border-green-200">
//                   {booking.booking_number}
//                 </p>
//               </div>

//               {/* Booking Details */}
//               <div className="space-y-4">
//                 <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
//                   <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
//                   </svg>
//                   Booking Details
//                 </h3>
                
//                 <div className="bg-gray-50 rounded-xl p-4 space-y-3">
//                   <div className="flex justify-between py-2 border-b border-gray-200">
//                     <span className="text-gray-600">Service</span>
//                     <span className="font-semibold text-gray-900">{booking.service_name}</span>
//                   </div>
                  
//                   <div className="flex justify-between py-2 border-b border-gray-200">
//                     <span className="text-gray-600">Date</span>
//                     <span className="font-semibold text-gray-900">
//                       {new Date(booking.job_date).toLocaleDateString('en-US', { 
//                         month: 'long', 
//                         day: 'numeric', 
//                         year: 'numeric' 
//                       })}
//                     </span>
//                   </div>
                  
//                   <div className="flex justify-between py-2 border-b border-gray-200">
//                     <span className="text-gray-600">Time</span>
//                     <span className="font-semibold text-gray-900">
//                       {formatTimeSlot(booking.job_time_slot)}
//                     </span>
//                   </div>
                  
//                   {/* Price breakdown - UPDATED: hourly rate instead of addition */}
//                   <div className="py-2 border-b border-gray-200">
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-600">Base price</span>
//                       <span className="font-bold text-gray-900">${basePrice.toFixed(2)}</span>
//                     </div>
                    
//                     {hourlyRate > 0 && (
//                       <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                         <div className="flex items-start gap-2">
//                           <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
//                             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
//                           </svg>
//                           <div className="flex-1">
//                             <p className="text-sm font-medium text-blue-800">
//                               ⏱️ Overtime Rate
//                             </p>
//                             <p className="text-xs text-blue-700 mt-1">
//                               If the job takes longer than estimated, you&apos;ll be charged <span className="font-bold">${hourlyRate.toFixed(2)}/hour</span> for extra time. You&apos;ll approve any additional hours before they&apos;re worked.
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
                  
//                   <div className="flex justify-between py-2">
//                     <span className="text-gray-600 font-medium">Paid today</span>
//                     <span className="font-bold text-green-700 text-xl">
//                       ${basePrice.toFixed(2)}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Customer Info */}
//                 <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
//                   <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
//                     <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//                     </svg>
//                     Your Information
//                   </h4>
//                   <p className="text-sm text-gray-700">
//                     {booking.customer_first_name} {booking.customer_last_name}
//                   </p>
//                   <p className="text-sm text-gray-600">{booking.customer_email}</p>
//                   {booking.customer_phone && (
//                     <p className="text-sm text-gray-600">{booking.customer_phone}</p>
//                   )}
//                 </div>

//                 {/* Job Location */}
//                 <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
//                   <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
//                     <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                     </svg>
//                     Service Location
//                   </h4>
//                   <p className="text-sm text-gray-700">{booking.address_line1}</p>
//                   {booking.address_line2 && (
//                     <p className="text-sm text-gray-600">{booking.address_line2}</p>
//                   )}
//                   <p className="text-sm text-gray-600">
//                     {booking.city}{booking.postal_code ? `, ${booking.postal_code}` : ''}
//                   </p>
//                 </div>

//                 {/* What's Next */}
//                 <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
//                   <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
//                     <svg className="w-5 h-5 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                     </svg>
//                     What&apos;s Next?
//                   </h4>
//                   <ul className="text-sm text-gray-700 space-y-2">
//                     <li className="flex items-start">
//                       <span className="text-green-600 font-bold mr-2">1.</span>
//                       <span>We&apos;re matching you with trusted pros in your area</span>
//                     </li>
//                     <li className="flex items-start">
//                       <span className="text-green-600 font-bold mr-2">2.</span>
//                       <span>You&apos;ll get notifications when pros are interested</span>
//                     </li>
//                     <li className="flex items-start">
//                       <span className="text-green-600 font-bold mr-2">3.</span>
//                       <span>Review and choose the best pro for your job</span>
//                     </li>
//                     <li className="flex items-start">
//                       <span className="text-green-600 font-bold mr-2">4.</span>
//                       <span>Payment will be released after job completion</span>
//                     </li>
//                   </ul>
//                 </div>

//                 {/* Photos if any */}
//                 {booking.photos && booking.photos.length > 0 && (
//                   <div>
//                     <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
//                       <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
//                       </svg>
//                       Your Photos ({booking.photos.length})
//                     </h4>
//                     <div className="grid grid-cols-3 gap-2">
//                       {booking.photos.slice(0, 3).map((photo, index) => (
//                         <img 
//                           key={index}
//                           src={photo} 
//                           alt={`Job photo ${index + 1}`}
//                           className="w-full h-20 object-cover rounded-lg border border-gray-200"
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Action Buttons */}
//               <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
//                 <Link 
//                   href="/" 
//                   className="px-8 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl font-semibold hover:from-green-800 hover:to-green-700 transition shadow-lg flex items-center justify-center gap-2"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//                   </svg>
//                   Return Home
//                 </Link>
//                 <Link 
//                   href="/my-bookings" 
//                   className="px-8 py-3 border-2 border-green-700 text-green-700 rounded-xl font-semibold hover:bg-green-50 transition flex items-center justify-center gap-2"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                   </svg>
//                   View My Bookings
//                 </Link>
//               </div>

//               {/* Need Help? */}
//               <div className="mt-6 text-center">
//                 <p className="text-xs text-gray-400">
//                   Need help? <Link href="/contact" className="text-green-700 hover:underline">Contact Support</Link>
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Trust Badge */}
//           <div className="mt-6 text-center">
//             <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
//               <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//               </svg>
//               <span className="text-sm text-gray-600">Protected by WorkOnTap Guarantee</span>
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }




































// app/booking/success/[id]/page.jsx
'use client';

import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from 'src/context/AuthContext';

export default function BookingSuccessPage({ params }) {
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams.id;

  const router = useRouter();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (bookingId) fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      const data = await res.json();
      if (data.success) {
        setBooking(data.data);
      } else {
        setError(data.message || 'Booking not found');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSlot = (slot) => {
    if (!slot) return '';
    const map = {
      morning: '🌅 Morning (8am–12pm)',
      afternoon: '☀️ Afternoon (12pm–4pm)',
      evening: '🌙 Evening (4pm–8pm)',
    };
    if (Array.isArray(slot)) return slot.map((s) => map[s] || s).join(', ');
    return map[slot] || slot;
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f4f0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full border-4 border-green-700 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm tracking-wide">Loading your receipt…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#f5f4f0] font-sans">
        <Header />
        <div className="container mx-auto px-4 py-20 max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-500 text-sm mb-6">{error || "This booking doesn't exist."}</p>
            <Link href="/" className="bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-green-800 transition">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Price calculations ───────────────────────────────────────────────────────
  const basePrice   = parseFloat(booking.service_price   || 0);
  const hourlyRate  = parseFloat(booking.additional_price || 0);
  // Max 2 hours hold (matches payment page logic: base + 2×hourly)
  const overtimeHoldHours  = 2;
  const overtimeHoldAmount = hourlyRate * overtimeHoldHours;
  const totalAuthorized    = basePrice + overtimeHoldAmount;

  return (
    <div className="min-h-screen bg-[#f5f4f0] font-sans antialiased">
      <Header />

      <div className="container mx-auto px-4 py-10 md:py-16 max-w-2xl">

        {/* ── Success banner ────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-green-800 via-green-700 to-green-600 rounded-2xl px-6 py-10 text-center mb-6 shadow-xl relative overflow-hidden">
          {/* decorative rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-64 h-64 rounded-full border border-white/10" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 rounded-full border border-white/5" />
          </div>

          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-1">
              Booking Confirmed!
            </h1>
            <p className="text-green-100 text-base">Your job request has been submitted successfully</p>

            {/* Booking number pill */}
            <div className="mt-5 inline-block bg-white/15 backdrop-blur border border-white/25 rounded-full px-5 py-2">
              <span className="text-xs text-green-100 uppercase tracking-widest block mb-0.5">Booking Number</span>
              <span className="text-white font-bold text-lg tracking-wider">{booking.booking_number}</span>
            </div>
          </div>
        </div>

        {/* ── Invoice card ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">

          {/* Invoice header strip */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Invoice Summary</span>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(booking.job_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <div className="px-6 py-6 space-y-5">

            {/* ── Service details rows ─────────────────────────────────────── */}
            <div className="space-y-3">
              {[
                { label: 'Service',  value: booking.service_name },
                { label: 'Date',     value: new Date(booking.job_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) },
                { label: 'Time',     value: formatTimeSlot(booking.job_time_slot) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start py-2 border-b border-dashed border-gray-100">
                  <span className="text-sm text-gray-500 min-w-[90px]">{label}</span>
                  <span className="text-sm font-semibold text-gray-800 text-right">{value}</span>
                </div>
              ))}
            </div>

            {/* ── Price breakdown (invoice-style) ─────────────────────────── */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              
              {/* Header */}
              <div className="bg-gray-100 px-4 py-2.5">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Payment Breakdown</span>
              </div>

              <div className="px-4 py-3 space-y-1">

                {/* Base price row */}
                <div className="flex justify-between items-center py-2.5 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Base Service Price</p>
                    <p className="text-xs text-gray-400">Flat rate for {booking.service_name}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">${basePrice.toFixed(2)}</span>
                </div>

                {/* Overtime hold row */}
                {hourlyRate > 0 && (
                  <div className="flex justify-between items-center py-2.5 border-b border-gray-200">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium text-gray-700">Overtime Hold</p>
                      </div>
                      <p className="text-xs text-gray-400">
                        ${hourlyRate.toFixed(2)}/hr × {overtimeHoldHours} hrs (max hold)
                      </p>
                    </div>
                    <span className="text-sm font-bold text-amber-600">+${overtimeHoldAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* Authorized total */}
                <div className="flex justify-between items-center pt-3 pb-1">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Total Authorized</p>
                    <p className="text-xs text-gray-400">Card hold — not charged yet</p>
                  </div>
                  <span className="text-xl font-extrabold text-green-700">${totalAuthorized.toFixed(2)}</span>
                </div>
              </div>

              {/* Important notice */}
              <div className="bg-amber-50 border-t border-amber-100 px-4 py-3 flex gap-3 items-start">
                <div className="text-lg leading-none mt-0.5">💳</div>
                <div>
                  <p className="text-xs font-semibold text-amber-800">No money charged yet!</p>
                  <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                    Your card is authorized for <span className="font-bold">${totalAuthorized.toFixed(2)}</span>. 
                    You only pay <span className="font-bold">${basePrice.toFixed(2)}</span> (base) + actual overtime used.
                    Final charge happens after job completion.
                  </p>
                </div>
              </div>
            </div>

            {/* Overtime rate info box */}
            {hourlyRate > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 items-start">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-blue-800">⏱️ Overtime Rate: ${hourlyRate.toFixed(2)}/hour</p>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    If the job runs longer than estimated, you'll be billed at <strong>${hourlyRate.toFixed(2)}/hr</strong> for extra time. 
                    You must approve any additional hours <em>before</em> they are worked.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Info cards row ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

          {/* Customer info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-800">Your Information</h4>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p className="font-semibold text-gray-800">{booking.customer_first_name} {booking.customer_last_name}</p>
              <p>{booking.customer_email}</p>
              {booking.customer_phone && <p>{booking.customer_phone}</p>}
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-800">Service Location</h4>
            </div>
            <div className="space-y-0.5 text-sm text-gray-600">
              <p>{booking.address_line1}</p>
              {booking.address_line2 && <p>{booking.address_line2}</p>}
              <p>{booking.city}{booking.postal_code ? `, ${booking.postal_code}` : ''}</p>
            </div>
          </div>
        </div>

        {/* ── What's next ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-gray-800">What happens next?</h4>
          </div>

          <div className="space-y-3">
            {[
              { step: '1', text: "We're matching you with trusted pros in your area" },
              { step: '2', text: "You'll get notified when pros show interest in your job" },
              { step: '3', text: 'Review profiles and choose the best pro for your job' },
              { step: '4', text: 'Payment is released only after job is completed & approved' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {step}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Photos ───────────────────────────────────────────────────────── */}
        {booking.photos && booking.photos.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-gray-800">Attached Photos ({booking.photos.length})</h4>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {booking.photos.slice(0, 6).map((photo, i) => (
                <div 
                  key={i} 
                  className="relative group cursor-pointer overflow-hidden rounded-xl border border-gray-100"
                  onClick={() => setSelectedImage(photo)}
                >
                  <img 
                    src={photo} 
                    alt={`Photo ${i + 1}`} 
                    className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Action buttons ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white py-3.5 rounded-xl font-semibold text-sm transition shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return Home
          </Link>
          <Link
            href="/my-bookings"
            className="flex-1 flex items-center justify-center gap-2 border-2 border-green-700 text-green-700 hover:bg-green-50 py-3.5 rounded-xl font-semibold text-sm transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View My Bookings
          </Link>
        </div>

        {/* ── Trust badge + support ─────────────────────────────────────────── */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-gray-600 font-medium">Protected by WorkOnTap Guarantee</span>
          </div>
          <p className="text-xs text-gray-400">
            Need help?{' '}
            <Link href="/contact" className="text-green-700 hover:underline font-medium">
              Contact Support
            </Link>
          </p>
        </div>

      </div>

      {/* ── Photo Lightbox ────────────────────────────────────────────────── */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-10 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors group"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            <img 
              src={selectedImage} 
              alt="Full size" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}