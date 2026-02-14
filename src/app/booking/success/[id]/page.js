// app/booking/success/[id]/page.js
'use client';

import Link from 'next/link';
import { useState, useEffect, use } from 'react'; // 👈 use import karo
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function BookingSuccessPage({ params }) {
  // 👇 Params ko unwrap karo using React.use()
  const unwrappedParams = use(params);
  const bookingId = unwrappedParams.id;
  
  const router = useRouter();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]); // 👈 ab bookingId use karo

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`); // 👈 bookingId use karo
      const data = await res.json();
      if (data.success) {
        setBooking(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking not found</h2>
          <Link href="/" className="text-green-700 hover:underline">Go home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans antialiased">
      <Header/>

      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Booking Confirmed!
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              Your job request has been submitted. We&apos;re matching you with trusted pros now.
            </p>
            
            <div className="bg-green-50 rounded-xl p-6 mb-8 border border-green-200">
              <p className="text-sm text-gray-700 mb-2">Booking Number</p>
              <p className="text-2xl font-bold text-green-800">{booking.booking_number}</p>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Service</span>
                <span className="font-semibold text-gray-900">{booking.service_name}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Date</span>
                <span className="font-semibold text-gray-900">
                  {new Date(booking.job_date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Time</span>
                <span className="font-semibold text-gray-900 capitalize">{booking.job_time_slot}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Total</span>
                <span className="font-bold text-green-700">${parseFloat(booking.service_price).toFixed(2)}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="px-8 py-3 bg-green-700 text-white rounded-xl font-semibold hover:bg-green-800 transition shadow-lg">
                Return Home
              </Link>
              <Link href="/my-bookings" className="px-8 py-3 border-2 border-green-700 text-green-700 rounded-xl font-semibold hover:bg-green-50 transition">
                View My Bookings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}