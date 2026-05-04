// ==========================================
// verify-email-pending/page.jsx
// ==========================================
'use client';
/* eslint-disable react/no-unescaped-entities */
import React, { Suspense, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, RefreshCw, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email address';
  const [isVerified, setIsVerified] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkStatus = useCallback(async (isManual = false) => {
    if (!email || email === 'your email address' || isVerified) return;
    
    if (isManual) setChecking(true);
    try {
      const res = await fetch(`/api/provider/check-verification?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success && data.verified) {
        setIsVerified(true);
        setTimeout(() => {
          router.push(`/provider/login?email=${encodeURIComponent(email)}`);
        }, 3000);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    } finally {
      if (isManual) setChecking(false);
    }
  }, [email, isVerified, router]);

  useEffect(() => {
    const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [checkStatus]);

  if (isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <Link href="/" className="text-xl font-bold text-green-700 mb-8 inline-block">WorkOnTap</Link>
          <div className="bg-white rounded-3xl shadow-xl border border-green-100 p-10 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Email Verified!</h2>
            <p className="text-gray-600 mb-8">
              Great news! Your email has been successfully verified. You can now access your provider dashboard.
            </p>
            <div className="space-y-4">
              <Link 
                href={`/provider/login?email=${encodeURIComponent(email)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-100 active:scale-95"
              >
                Go to Login <ArrowRight className="h-5 w-5" />
              </Link>
              <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Redirecting in 3 seconds...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="text-xl font-bold text-green-700 mb-8 inline-block">WorkOnTap</Link>
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail className="h-8 w-8 text-green-600 animate-bounce" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Check your inbox</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed max-w-xs mx-auto">
            We've sent a verification link to <span className="font-bold text-gray-900 break-all">{email}</span>. Click the link to activate your account.
          </p>
          
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-8 text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
              <RefreshCw className="h-12 w-12 text-amber-600" />
            </div>
            <p className="text-xs font-bold text-amber-800 mb-1 uppercase tracking-wider">📌 Didn't receive it?</p>
            <p className="text-sm text-amber-700 leading-snug">Check your spam or junk folder. The email comes from <span className="font-semibold">no-reply@workontap.com</span></p>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => checkStatus(true)}
              disabled={checking}
              className="inline-flex items-center justify-center gap-2 text-sm text-green-600 hover:text-green-700 font-bold transition-all py-2 rounded-xl hover:bg-green-50"
            >
              <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} /> 
              {checking ? 'Checking status...' : 'Already verified? Check now'}
            </button>
            
            <div className="h-px bg-gray-100 w-full my-2" />
            
            <Link href="/provider/signup"
              className="text-sm text-gray-400 hover:text-gray-600 font-medium transition">
              Try again with different email
            </Link>
          </div>
        </div>
        
        <p className="mt-8 text-sm text-gray-400">
          Waiting for verification... the page will refresh automatically.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPending() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-700 border-t-transparent"></div>
          <p className="text-gray-500 font-medium">Loading verification status...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}