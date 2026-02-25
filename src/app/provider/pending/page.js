'use client';
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProviderPending() {
  const router = useRouter();
  const [provider, setProvider] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkStatus();
    
    // Refresh status every 30 seconds
    const interval = setInterval(() => {
      checkStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate time until expected review (24 hours from submission)
  useEffect(() => {
    if (provider?.submitted_at) {
      const updateTimer = () => {
        const submitted = new Date(provider.submitted_at);
        const reviewDeadline = new Date(submitted.getTime() + 24 * 60 * 60 * 1000);
        const now = new Date();
        const diff = reviewDeadline - now;
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${minutes}m`);
        } else {
          setTimeLeft('Any time now');
        }
      };
      
      updateTimer();
      const timer = setInterval(updateTimer, 60000);
      return () => clearInterval(timer);
    }
  }, [provider?.submitted_at]);

  const checkStatus = async () => {
    if (checking) return;
    
    setChecking(true);
    try {
      const res = await fetch('/api/provider/me');
      const data = await res.json();
      
      if (data.success && data.provider) {
        setProvider(data.provider);
        
        // If approved, go to dashboard
        if (data.provider.status === 'active') {
          router.push('/provider/dashboard');
        }
      } else {
        router.push('/provider/login');
      }
    } catch (error) {
      console.error('Error checking status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleManualCheck = () => {
    checkStatus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-24 w-24 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <svg className="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Application Under Review
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for completing your onboarding!
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          {/* Status Banner */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong className="font-medium">Review in progress:</strong> Our admin team is reviewing your application. This usually takes 24-48 hours.
                </p>
              </div>
            </div>
          </div>

          {/* Status Cards */}
          <div className="p-6 space-y-6">
            {/* Progress Steps */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Application Status</h2>
              
              <div className="space-y-3">
                {/* Step 1: Email Verified */}
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Email Verified</p>
                    <p className="text-xs text-gray-500">Your email has been confirmed</p>
                  </div>
                </div>

                {/* Step 2: Profile Completed */}
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Profile Completed</p>
                    <p className="text-xs text-gray-500">Your information has been saved</p>
                  </div>
                </div>

                {/* Step 3: Documents Uploaded */}
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Documents Uploaded</p>
                    <p className="text-xs text-gray-500">Your documents are being reviewed</p>
                  </div>
                </div>

                {/* Step 4: Stripe Connected */}
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Payment Connected</p>
                    <p className="text-xs text-gray-500">Stripe account verified</p>
                  </div>
                </div>

                {/* Step 5: Admin Review - Current */}
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Admin Review</p>
                    <p className="text-xs text-gray-500">Your application is being reviewed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {/* Time Estimate */}
              <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
                <h3 className="text-sm font-medium text-teal-800 mb-2">⏰ Expected Review Time</h3>
                <p className="text-2xl font-bold text-teal-600">{timeLeft || '24-48 hours'}</p>
                <p className="text-xs text-teal-600 mt-1">until decision</p>
              </div>

              {/* What's Next */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="text-sm font-medium text-blue-800 mb-2">📋 What's Next?</h3>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• Admin reviews your documents</li>
                  <li>• You'll receive an email notification</li>
                  <li>• Once approved, you can start accepting jobs</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleManualCheck}
                disabled={checking}
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
              >
                {checking ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Checking...
                  </>
                ) : (
                  'Refresh Status'
                )}
              </button>
              
              <Link
                href="/provider/support"
                className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Contact Support
              </Link>
            </div>

            {/* Note */}
            <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
              <p>You'll receive an email once your account is approved.</p>
              <p className="mt-1">Need help? Email us at support@workontap.com</p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-teal-600 hover:text-teal-500">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}