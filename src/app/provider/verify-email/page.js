'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/provider/verify-email?token=${token}`);
        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setMessage('Email verified successfully!');
          const redirectUrl = data.email 
            ? `/provider/login?email=${encodeURIComponent(data.email)}` 
            : '/provider/login';
          setTimeout(() => router.push(redirectUrl), 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Verification failed');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col justify-center py-12 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-lg py-8 px-4 shadow-xl rounded-2xl sm:px-8 border border-slate-100 text-center">
          {status === 'verifying' && (
            <>
              <Loader className="h-16 w-16 text-teal-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Verifying your email...</h2>
              <p className="text-slate-600">Please wait a moment</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Email Verified!</h2>
              <p className="text-slate-600 mb-4">{message}</p>
              <p className="text-sm text-slate-500">Redirecting to login...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Verification Failed</h2>
              <p className="text-slate-600 mb-4">{message}</p>
              <Link href="/provider/signup" className="text-teal-600 hover:text-teal-700 font-medium">
                Back to Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}