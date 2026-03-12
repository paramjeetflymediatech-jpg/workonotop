

// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import Header from '@/components/Header';
// import Footer from '@/components/Footer';
// import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
// import { loadStripe } from '@stripe/stripe-js';

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// function PaymentForm({ bookingData, onSuccess }) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [processing, setProcessing] = useState(false);
//   const [error, setError] = useState(null);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!stripe || !elements) return;

//     setProcessing(true);
//     setError(null);

//     try {
//       const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
//         elements,
//         confirmParams: {
//           return_url: `${window.location.origin}/booking/success/${bookingData.booking_id}`,
//         },
//         redirect: 'if_required',
//       });

//       if (confirmError) {
//         setError(confirmError.message);
//         setProcessing(false);
//         return;
//       }

//       if (paymentIntent && (paymentIntent.status === 'requires_capture' || paymentIntent.status === 'succeeded')) {
//         onSuccess(paymentIntent);
//       }

//     } catch (err) {
//       setError('Payment failed. Please try again.');
//       setProcessing(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
//       <PaymentElement />

//       {error && (
//         <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
//           {error}
//         </div>
//       )}

//       <button
//         type="submit"
//         disabled={!stripe || processing}
//         className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:from-green-800 hover:to-green-700 transition disabled:opacity-50"
//       >
//         {processing ? 'Processing...' : 'Authorize Payment'}
//       </button>

//       <p className="text-[10px] sm:text-xs text-center text-gray-500 px-2">
//         🔒 Your card will be AUTHORIZED now, but ONLY CHARGED for actual time worked after job completion.
//       </p>
//     </form>
//   );
// }

// export default function PaymentPage() {
//   const router = useRouter();
//   const [bookingData, setBookingData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [clientSecret, setClientSecret] = useState(null);

//   useEffect(() => {
//     const booking = sessionStorage.getItem('lastBooking');

//     if (booking) {
//       const parsed = JSON.parse(booking);
//       setBookingData(parsed);
//       setClientSecret(parsed.client_secret);
//     } else {
//       router.push('/services');
//     }

//     setLoading(false);
//   }, [router]);

//   const handlePaymentSuccess = (paymentIntent) => {
//     router.push(`/booking/success/${bookingData.booking_id}`);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center px-4">
//         <div className="flex flex-col items-center gap-3">
//           <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-4 border-green-500 border-t-transparent"></div>
//           <p className="text-sm sm:text-base text-gray-600">Loading payment details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!bookingData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center px-4">
//         <div className="text-center">
//           <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Booking not found</h2>
//           <Link href="/services" className="text-green-700 hover:underline text-sm sm:text-base">
//             Browse services
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const basePrice = parseFloat(bookingData.service_price);
//   const hourlyRate = parseFloat(bookingData.overtime_rate || bookingData.additional_price || 0);
//   const standardDuration = bookingData.standard_duration || 60;
//   const maxOvertimeHours = 2;
//   const maxOvertimeCost = hourlyRate * maxOvertimeHours;
//   const totalAuthorized = basePrice + maxOvertimeCost;

//   return (
//     <div className="min-h-screen bg-gray-50/50 font-sans antialiased">
//       <Header />

//       <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
//         <div className="max-w-2xl mx-auto">
//           {/* Progress Bar */}
//           <div className="mb-4 sm:mb-6 md:mb-8">
//             <div className="flex items-center justify-between mb-2 sm:mb-3">
//               <span className="text-[10px] sm:text-xs font-bold text-green-700 bg-green-100 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full">
//                 STEP 4 OF 4
//               </span>
//               <span className="text-[10px] sm:text-xs text-gray-500 font-medium">Authorize payment</span>
//             </div>
//             <div className="h-1.5 sm:h-2 md:h-2.5 bg-gray-200 rounded-full overflow-hidden">
//               <div className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full" style={{ width: '100%' }}></div>
//             </div>
//           </div>

//           {/* Main Card */}
//           <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
//             {/* Header */}
//             <div className="bg-gradient-to-r from-green-800 to-green-700 px-4 sm:px-6 py-4 sm:py-6 md:py-8 text-center">
//               <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 backdrop-blur-sm">
//                 <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                 </svg>
//               </div>
//               <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">Authorize Payment</h1>
//               <p className="text-green-100 text-xs sm:text-sm px-2">
//                 Your card will be authorized now, but only charged for actual time worked
//               </p>
//             </div>

//             {/* Content */}
//             <div className="p-4 sm:p-5 md:p-6">
//               {/* Booking Summary */}
//               <div className="mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
//                 <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 sm:mb-3">Booking Summary</h3>
//                 <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
//                   <div className="flex justify-between gap-2">
//                     <span className="text-gray-600">Service:</span>
//                     <span className="font-medium text-right break-words max-w-[60%]">{bookingData.service_name}</span>
//                   </div>
//                   <div className="flex justify-between gap-2">
//                     <span className="text-gray-600">Date:</span>
//                     <span className="font-medium text-right">
//                       {new Date(bookingData.job_date).toLocaleDateString('en-US', {
//                         month: 'short',
//                         day: 'numeric',
//                         year: 'numeric'
//                       })}
//                     </span>
//                   </div>

//                   <div className="pt-2 border-t border-gray-200">
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-600">Estimated duration:</span>
//                       <span className="font-bold text-gray-900">{standardDuration} min</span>
//                     </div>
//                     <div className="flex justify-between gap-2">
//                       <span className="text-gray-600">Base rate:</span>
//                       <span className="font-bold text-gray-900">${basePrice.toFixed(2)}</span>
//                     </div>

//                     {hourlyRate > 0 && (
//                       <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
//                         <div className="flex items-start gap-1.5 sm:gap-2">
//                           <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
//                             <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
//                           </svg>
//                           <div className="flex-1">
//                             <p className="text-xs sm:text-sm font-medium text-blue-800">
//                               ⏱️ Overtime: ${hourlyRate.toFixed(2)}/hr (max 2hr)
//                             </p>
//                             <p className="text-[10px] sm:text-xs text-blue-700 mt-0.5 sm:mt-1">
//                               • If job takes MORE time: Overtime charged at ${hourlyRate.toFixed(2)}/hour (capped at 2 hours)
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     <div className="flex justify-between pt-2 sm:pt-3 mt-2 border-t border-gray-300">
//                       <span className="font-bold text-gray-900 text-xs sm:text-sm">Amount authorized:</span>
//                       <span className="font-bold text-green-700 text-base sm:text-lg md:text-xl">
//                         ${totalAuthorized.toFixed(2)}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Authorization Notice */}
//                   <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg">
//                     <div className="flex items-start gap-1.5 sm:gap-2">
//                       <span className="text-amber-600 text-base sm:text-lg">💰</span>
//                       <div>
//                         <p className="text-[10px] sm:text-xs font-medium text-amber-800">
//                           ⚡ No money will be charged now!
//                         </p>
//                         <p className="text-[8px] sm:text-[10px] text-amber-700 mt-0.5 sm:mt-1">
//                           Your card is authorized for <span className="font-bold">${totalAuthorized.toFixed(2)}</span> 
//                           (${basePrice.toFixed(2)} base + up to {maxOvertimeHours}hr OT)
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Payment Element */}
//               {clientSecret ? (
//                 <Elements stripe={stripePromise} options={{ clientSecret }}>
//                   <PaymentForm
//                     bookingData={bookingData}
//                     onSuccess={handlePaymentSuccess}
//                   />
//                 </Elements>
//               ) : (
//                 <div className="text-center py-4 sm:py-6 md:py-8">
//                   <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">Payment not required</p>
//                   <Link
//                     href={`/booking/success/${bookingData.booking_id}`}
//                     className="inline-block bg-green-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base hover:bg-green-800 transition"
//                   >
//                     Continue to Booking
//                   </Link>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <Footer />
//     </div>
//   );
// }




































'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// ✅ Payment success ke baad booking create hoti hai
function PaymentForm({ pendingBookingData, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const bookingCreatedRef = useRef(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || bookingCreatedRef.current) return;

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Stripe payment authorize karo
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/success/pending`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message);
        setProcessing(false);
        return;
      }

      // Step 2: Payment succeed hone ke baad hi booking DB mein save karo
      if (paymentIntent && (paymentIntent.status === 'requires_capture' || paymentIntent.status === 'succeeded')) {
        bookingCreatedRef.current = true;

        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...pendingBookingData,
            payment_intent_id: paymentIntent.id,
          }),
        });

        const data = await res.json();

        if (data.success) {
          sessionStorage.setItem('lastBooking', JSON.stringify({
            ...pendingBookingData,
            booking_id: data.booking_id,
            booking_number: data.booking_number,
          }));
          sessionStorage.removeItem('pendingBooking');
          onSuccess(data.booking_id);
        } else {
          // Payment hua lekin booking nahi bani — support se contact karo
          setError('Payment authorized but booking creation failed. Please contact support with your payment reference: ' + paymentIntent.id);
          bookingCreatedRef.current = false;
          setProcessing(false);
        }
      }
    } catch (err) {
      console.error('Payment/Booking error:', err);
      setError('Something went wrong. Please try again.');
      bookingCreatedRef.current = false;
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <PaymentElement />

      {error && (
        <div className="p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs sm:text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:from-green-800 hover:to-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Authorizing & Confirming Booking...
          </>
        ) : (
          'Authorize Payment & Confirm Booking'
        )}
      </button>

      <p className="text-[10px] sm:text-xs text-center text-gray-500 px-2">
        🔒 Your booking is confirmed only after successful payment authorization.
      </p>
    </form>
  );
}

export default function PaymentPage() {
  const router = useRouter();
  const [pendingBookingData, setPendingBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState(null);
  const [fetchingIntent, setFetchingIntent] = useState(false);
  const [intentError, setIntentError] = useState(null);

  useEffect(() => {
    const pending = sessionStorage.getItem('pendingBooking');
    if (pending) {
      const parsed = JSON.parse(pending);
      setPendingBookingData(parsed);
      createPaymentIntent(parsed);
    } else {
      router.push('/services');
    }
    setLoading(false);
  }, [router]);

  // ✅ Sirf Stripe payment intent create karo — NO booking in DB yet
  const createPaymentIntent = async (bookingData) => {
    setFetchingIntent(true);
    setIntentError(null);
    try {
      const res = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: bookingData.service_id,
          service_price: bookingData.service_price,
          additional_price: bookingData.additional_price || 0,
          service_name: bookingData.service_name,
        }),
      });
      const data = await res.json();
      if (data.success && data.client_secret) {
        setClientSecret(data.client_secret);
      } else {
        setIntentError('Could not initialize payment. Please go back and try again.');
      }
    } catch (err) {
      console.error('Payment intent error:', err);
      setIntentError('Could not initialize payment. Please go back and try again.');
    } finally {
      setFetchingIntent(false);
    }
  };

  const handlePaymentSuccess = (bookingId) => {
    router.push(`/booking/success/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 sm:h-16 w-12 sm:w-16 border-4 border-green-500 border-t-transparent"></div>
          <p className="text-sm sm:text-base text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!pendingBookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Booking not found</h2>
          <Link href="/services" className="text-green-700 hover:underline text-sm sm:text-base">Browse services</Link>
        </div>
      </div>
    );
  }

  const basePrice = parseFloat(pendingBookingData.service_price);
  const hourlyRate = parseFloat(pendingBookingData.additional_price || 0);
  const maxOvertimeCost = hourlyRate * 2;
  const totalAuthorized = basePrice + maxOvertimeCost;

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans antialiased">
      <Header />

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-2xl mx-auto">

          {/* Progress Bar - Step 4 of 4 */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <span className="text-[10px] sm:text-xs font-bold text-green-700 bg-green-100 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full">
                STEP 4 OF 4
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 font-medium">Authorize & Confirm</span>
            </div>
            <div className="h-1.5 sm:h-2 md:h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-800 to-green-700 px-4 sm:px-6 py-4 sm:py-6 md:py-8 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 backdrop-blur-sm">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">Authorize & Confirm Booking</h1>
              <p className="text-green-100 text-xs sm:text-sm px-2">
                Your booking is confirmed only after successful payment authorization
              </p>
            </div>

            <div className="p-4 sm:p-5 md:p-6">
              {/* Booking Summary */}
              <div className="mb-4 sm:mb-5 md:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-2 sm:mb-3">Booking Summary</h3>
                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium text-right break-words max-w-[60%]">{pendingBookingData.service_name}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-right">
                      {new Date(pendingBookingData.job_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium text-right max-w-[60%]">{pendingBookingData.address_line1}</span>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between gap-2">
                      <span className="text-gray-600">Base rate:</span>
                      <span className="font-bold text-gray-900">${basePrice.toFixed(2)}</span>
                    </div>

                    {hourlyRate > 0 && (
                      <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs sm:text-sm font-medium text-blue-800">
                          ⏱️ Overtime: ${hourlyRate.toFixed(2)}/hr (max 2hr = ${maxOvertimeCost.toFixed(2)})
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between pt-2 sm:pt-3 mt-2 border-t border-gray-300">
                      <span className="font-bold text-gray-900 text-xs sm:text-sm">Amount authorized:</span>
                      <span className="font-bold text-green-700 text-base sm:text-lg md:text-xl">${totalAuthorized.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-1.5 sm:gap-2">
                      <span className="text-amber-600 text-base sm:text-lg">💰</span>
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-amber-800">⚡ No money charged now!</p>
                        <p className="text-[8px] sm:text-[10px] text-amber-700 mt-0.5 sm:mt-1">
                          Card authorized for <span className="font-bold">${totalAuthorized.toFixed(2)}</span>. Charged only after job completion.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Element */}
              {fetchingIntent ? (
                <div className="flex flex-col items-center py-8 gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent"></div>
                  <p className="text-sm text-gray-500">Setting up payment...</p>
                </div>
              ) : intentError ? (
                <div className="text-center py-6">
                  <p className="text-red-600 text-sm mb-4">{intentError}</p>
                  <button
                    onClick={() => router.push('/booking/confirm')}
                    className="inline-block bg-gray-200 text-gray-800 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-300 transition"
                  >← Go Back</button>
                </div>
              ) : clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm
                    pendingBookingData={pendingBookingData}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}