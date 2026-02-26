// app/booking/success/[id]/page.jsx - UPDATED (No progress bar, updated payment message)
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
  const { user, login } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      const data = await res.json();
      
      if (data.success) {
        setBooking(data.data);
        
        // Update auth context if user exists in localStorage
        if (!user) {
          const savedUser = localStorage.getItem('workontap_user');
          if (savedUser) {
            login(JSON.parse(savedUser), 'customer');
          }
        }
      } else {
        setError(data.message || 'Booking not found');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get payment status display
  const getPaymentStatusDisplay = () => {
    if (!booking) return null;
    
    switch(booking.payment_status) {
      case 'authorized':
        return (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <div className="text-left">
                <p className="text-sm font-medium text-blue-700">
                  ✓ Payment Authorized
                </p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Your card has been verified. Payment will be released after job completion.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'paid':
        return (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="text-left">
                <p className="text-sm font-medium text-green-700">
                  ✓ Payment Completed
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  Your payment has been processed successfully after job completion.
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'pending':
        return (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <div className="text-left">
                <p className="text-sm font-medium text-yellow-700">
                  ⏳ Payment Pending
                </p>
                <p className="text-xs text-yellow-600 mt-0.5">
                  Please complete your payment to confirm the booking.
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Format time slot for display
  const formatTimeSlot = (slot) => {
    if (!slot) return '';
    
    if (Array.isArray(slot)) {
      return slot.map(s => {
        switch(s) {
          case 'morning': return '🌅 Morning (8am-12pm)';
          case 'afternoon': return '☀️ Afternoon (12pm-4pm)';
          case 'evening': return '🌙 Evening (4pm-8pm)';
          default: return s;
        }
      }).join(', ');
    }
    
    switch(slot) {
      case 'morning': return '🌅 Morning (8am-12pm)';
      case 'afternoon': return '☀️ Afternoon (12pm-4pm)';
      case 'evening': return '🌙 Evening (4pm-8pm)';
      default: return slot;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans antialiased">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The booking you\'re looking for doesn\'t exist.'}</p>
            <Link 
              href="/" 
              className="inline-block bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate total
  const totalAmount = (parseFloat(booking.service_price) + parseFloat(booking.additional_price || 0)).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans antialiased">
      <Header/>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-8 text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                Booking Confirmed!
              </h1>
              <p className="text-green-100 text-lg">
                Your job request has been submitted successfully
              </p>
            </div>

            <div className="p-6 md:p-8">
              
              {/* Booking Number */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">Booking Number</p>
                <p className="text-2xl font-bold text-green-700 bg-green-50 px-4 py-2 rounded-lg inline-block border border-green-200">
                  {booking.booking_number}
                </p>
              </div>

              {/* Payment Status - Updated Message */}
              {booking.payment_status === 'authorized' && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <div className="text-left">
                      <p className="text-sm font-medium text-blue-700">
                        ✓ Payment Authorized
                      </p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        Your card has been verified. Payment will be released after the job is completed.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Booking Details
                </h3>
                
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Service</span>
                    <span className="font-semibold text-gray-900">{booking.service_name}</span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Date</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(booking.job_date).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Time</span>
                    <span className="font-semibold text-gray-900">
                      {formatTimeSlot(booking.job_time_slot)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 font-medium">Total Amount</span>
                    <span className="font-bold text-green-700 text-xl">
                      ${totalAmount}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Your Information
                  </h4>
                  <p className="text-sm text-gray-700">
                    {booking.customer_first_name} {booking.customer_last_name}
                  </p>
                  <p className="text-sm text-gray-600">{booking.customer_email}</p>
                  {booking.customer_phone && (
                    <p className="text-sm text-gray-600">{booking.customer_phone}</p>
                  )}
                </div>

                {/* Job Location */}
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Service Location
                  </h4>
                  <p className="text-sm text-gray-700">{booking.address_line1}</p>
                  {booking.address_line2 && (
                    <p className="text-sm text-gray-600">{booking.address_line2}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    {booking.city}{booking.postal_code ? `, ${booking.postal_code}` : ''}
                  </p>
                </div>

                {/* What's Next */}
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    What&apos;s Next?
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-600 font-bold mr-2">1.</span>
                      <span>We&apos;re matching you with trusted pros in your area</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 font-bold mr-2">2.</span>
                      <span>You&apos;ll get notifications when pros are interested</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 font-bold mr-2">3.</span>
                      <span>Review and choose the best pro for your job</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 font-bold mr-2">4.</span>
                      <span>Payment will be released after job completion</span>
                    </li>
                  </ul>
                </div>

                {/* Photos if any */}
                {booking.photos && booking.photos.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      Your Photos ({booking.photos.length})
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {booking.photos.slice(0, 3).map((photo, index) => (
                        <img 
                          key={index}
                          src={photo} 
                          alt={`Job photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border border-gray-200"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/" 
                  className="px-8 py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl font-semibold hover:from-green-800 hover:to-green-700 transition shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Return Home
                </Link>
                <Link 
                  href="/my-bookings" 
                  className="px-8 py-3 border-2 border-green-700 text-green-700 rounded-xl font-semibold hover:bg-green-50 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View My Bookings
                </Link>
              </div>

              {/* Need Help? */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-400">
                  Need help? <Link href="/contact" className="text-green-700 hover:underline">Contact Support</Link>
                </p>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-600">Protected by WorkOnTap Guarantee</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}