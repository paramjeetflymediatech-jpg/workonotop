// ==========================================
// verify-email-pending/page.jsx
// ==========================================
'use client';
/* eslint-disable react/no-unescaped-entities */
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Mail, RefreshCw } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email address';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="text-xl font-bold text-green-700 mb-8 inline-block">WorkOnTap</Link>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed max-w-xs mx-auto">
            We've sent a verification link to <span className="font-semibold text-gray-900 break-all">{email}</span>. Click the link to activate your account.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs font-semibold text-amber-700 mb-1">📌 Didn't receive it?</p>
            <p className="text-sm text-amber-700">Check your spam or junk folder. The email comes from no-reply@workontap.com</p>
          </div>
          <Link href="/provider/signup"
            className="inline-flex items-center gap-2 text-sm text-green-600 hover:text-green-700 font-medium transition">
            <RefreshCw className="h-4 w-4" /> Try again with different email
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPending() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}