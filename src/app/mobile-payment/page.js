'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function MobilePaymentForm({ onSuccess }) {
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
        redirect: 'if_required', // Important: Don't redirect, handle response here
      });

      if (confirmError) {
        setError(confirmError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent && (paymentIntent.status === 'requires_capture' || paymentIntent.status === 'succeeded')) {
        // Send success message to React Native WebView
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            status: 'success',
            paymentIntentId: paymentIntent.id
          }));
        }
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Something went wrong. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-[#115e59] text-white py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 mt-4"
      >
        {processing ? 'Processing...' : 'Authorize Payment'}
      </button>
      <p className="text-xs text-center text-gray-500 mt-2">
        🔒 Your card is securely authorized now. You will be charged after job completion.
      </p>
    </form>
  );
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const clientSecret = searchParams.get('clientSecret');
  const amount = searchParams.get('amount');
  const [success, setSuccess] = useState(false);

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 text-center">
        <p className="text-gray-600">Invalid payment session</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Authorized!</h2>
        <p className="text-gray-500 text-sm">Returning to app...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 font-sans antialiased pb-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="mb-4 flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
          <span className="text-sm font-semibold text-gray-700">Total Authorization</span>
          <span className="text-xl font-bold text-[#115e59]">${parseFloat(amount || 0).toFixed(2)}</span>
        </div>
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <MobilePaymentForm onSuccess={() => setSuccess(true)} />
        </Elements>
      </div>
    </div>
  );
}

export default function MobilePaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#115e59] border-t-transparent"></div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
