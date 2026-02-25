'use client';
/* eslint-disable react/no-unescaped-entities */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Step3Stripe({ initialData, onNext, onBack, providerId, providerEmail }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stripeStatus, setStripeStatus] = useState(initialData.stripeOnboardingComplete ? 'completed' : 'pending');

  // Check for Stripe return
  useEffect(() => {
    const checkStripeReturn = async () => {
      const params = new URLSearchParams(window.location.search);
      const stripeComplete = params.get('stripe_complete');
      const accountId = params.get('account_id');
      
      if (stripeComplete === 'true' && accountId) {
        setLoading(true);
        try {
          // Verify with backend
          const res = await fetch('/api/provider/onboarding/stripe-complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountId })
          });
          
          const data = await res.json();
          
          if (data.success) {
            setStripeStatus('completed');
            // Auto-redirect to next step after 2 seconds
            setTimeout(() => {
              onNext({ stripeOnboardingComplete: true });
            }, 2000);
          } else {
            setError(data.message || 'Stripe verification failed');
          }
        } catch (err) {
          setError('Failed to verify Stripe status');
        } finally {
          setLoading(false);
        }
      }
    };

    checkStripeReturn();
  }, [onNext]);

  const handleStripeConnect = async () => {
    setLoading(true);
    setError('');

    try {
      const refreshUrl = `${window.location.origin}/provider/onboarding?step=3`;
      const returnUrl = `${window.location.origin}/api/provider/onboarding/stripe-return`;

      const res = await fetch('/api/provider/onboarding/create-stripe-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshUrl, returnUrl })
      });

      const data = await res.json();

      if (data.success && data.onboardingUrl) {
        // Redirect to Stripe
        window.location.href = data.onboardingUrl;
      } else {
        setError(data.message || 'Failed to create Stripe account');
      }
    } catch (err) {
      console.error('Stripe connection error:', err);
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Set Up Payments</h2>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Why Stripe?</strong> We use Stripe Connect to securely handle your payments. 
          You'll need to connect your bank account to receive payouts for completed jobs.
        </p>
      </div>

      {stripeStatus === 'completed' ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Stripe Connected Successfully!</h3>
          <p className="text-gray-600 mb-4">Your payment account is set up.</p>
          <p className="text-sm text-gray-500">Redirecting to review page...</p>
        </div>
      ) : (
        <div className="border-2 border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Connect with Stripe</h3>
              <p className="text-sm text-gray-600 mt-1">
                Account: <span className="font-medium">{providerEmail}</span>
              </p>
            </div>
            <div className="bg-indigo-50 px-3 py-1 rounded-full">
              <span className="text-xs font-medium text-indigo-600">Secure</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-700 mb-3">What happens next:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                You'll be redirected to Stripe's secure platform
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Enter your bank account details for payouts
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Return automatically to complete your onboarding
              </li>
            </ul>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg mb-4">
              <p className="font-medium mb-1">Error:</p>
              <p className="text-sm">{error}</p>
              {error.includes('card_payments') && (
                <p className="text-sm mt-2 text-gray-600">
                  This is a Stripe requirement for Canadian accounts. Both payment processing and transfer capabilities are needed together.
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleStripeConnect}
            disabled={loading}
            className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 
                       disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? 'Connecting...' : 'Connect with Stripe'}
          </button>

          <p className="text-xs text-gray-500 text-center mt-4">
            You'll be redirected to Stripe's secure platform. Your information is encrypted and secure.
          </p>
        </div>
      )}

      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          disabled={stripeStatus === 'completed'}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
      </div>
    </div>
  );
}