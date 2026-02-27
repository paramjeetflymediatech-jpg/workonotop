// app/booking/payment/page.jsx - UPDATED with hourly rate instead of fixed additional
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function PaymentForm({ bookingData, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/success/${bookingData.booking_id}`,
        },
        redirect: 'if_required',
      });

      if (confirmError) {
        setError(confirmError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent && (paymentIntent.status === 'requires_capture' || paymentIntent.status === 'succeeded')) {
        onSuccess(paymentIntent);
      }

    } catch (err) {
      setError('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-green-800 hover:to-green-700 transition disabled:opacity-50"
      >
        {processing ? 'Processing...' : 'Pay & Confirm Booking'}
      </button>

      <p className="text-xs text-center text-gray-500">
        🔒 Your payment info is secure. Funds will be held until job completion.
      </p>
    </form>
  );
}

export default function PaymentPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState(null);

  useEffect(() => {
    const booking = sessionStorage.getItem('lastBooking');

    if (booking) {
      const parsed = JSON.parse(booking);
      setBookingData(parsed);
      setClientSecret(parsed.client_secret);
    } else {
      router.push('/services');
    }

    setLoading(false);
  }, [router]);

  const handlePaymentSuccess = (paymentIntent) => {
    router.push(`/booking/success/${bookingData.booking_id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking not found</h2>
          <Link href="/services" className="text-green-700 hover:underline">Browse services</Link>
        </div>
      </div>
    );
  }

  const basePrice = parseFloat(bookingData.service_price);
  // For demo, let's say additional price represents $10/hour rate
  const hourlyRate = parseFloat(bookingData.additional_price || 0);

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans antialiased">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-green-700 bg-green-100 px-4 py-1.5 rounded-full">
                STEP 4 OF 4
              </span>
              <span className="text-sm text-gray-500 font-medium">Secure payment</span>
            </div>
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-600 to-green-500 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          {/* Payment card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Complete Payment</h1>
              <p className="text-green-100 text-sm">
                Enter your card details to confirm booking
              </p>
            </div>

            <div className="p-6">
              {/* Booking summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium">{bookingData.service_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">
                      {new Date(bookingData.job_date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Price breakdown - UPDATED */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Base price:</span>
                      <span className="font-bold text-gray-900">${basePrice.toFixed(2)}</span>
                    </div>

                    {hourlyRate > 0 && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-800">
                              ⏱️ Additional time may be required
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              If the job takes longer than estimated, you&apos;ll be charged <span className="font-bold">${hourlyRate.toFixed(2)}/hour</span> for extra time. You&apos;ll approve any additional hours before they&apos;re worked.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-3 mt-3 border-t border-gray-300">
                      <span className="font-bold text-gray-900">Amount to pay now:</span>
                      <span className="font-bold text-green-700 text-xl">
                        ${basePrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {hourlyRate > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-xs text-yellow-800 flex items-start">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>
                          <strong>Note:</strong> You&apos;re only paying the base price of ${basePrice.toFixed(2)} now. If additional hours are needed, you&apos;ll be notified and can approve them before any extra charges apply.
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment form */}
              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm
                    bookingData={bookingData}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Payment not required or already processed</p>
                  <Link
                    href={`/booking/success/${bookingData.booking_id}`}
                    className="inline-block bg-green-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-800 transition"
                  >
                    Continue to Booking
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}