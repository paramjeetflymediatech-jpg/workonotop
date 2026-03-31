'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { Mail, ArrowLeft, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';

function ForgotPasswordContent() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md text-center space-y-6 animate-fadeIn">
        <div className="flex justify-center">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Check your email.</h2>
        <p className="text-gray-500 font-medium">We have sent a password reset link to <span className="text-gray-900 font-bold">{email}</span></p>
        <Link href="/login" className="inline-flex items-center gap-2 text-green-700 font-black hover:text-green-800 transition-all hover:-translate-x-1 decoration-2 underline-offset-4 underline">
          <ArrowLeft className="h-4 w-4" /> Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md relative z-10">
      <div className="mb-8 text-center lg:text-left space-y-2">
        <Link href="/login" className="inline-flex items-center gap-2 text-green-700 text-sm font-bold mb-4 hover:gap-3 transition-all">
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Link>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight">Reset password.</h2>
        <p className="text-gray-500 font-medium">Enter your email and we&apos;ll send you a recovery link</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl animate-shake flex items-start gap-3">
          <span className="text-red-500 font-bold mt-0.5">⚠️</span>
          <p className="text-sm text-red-700 font-bold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 ml-1">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 text-base bg-gray-50/50 hover:bg-white focus:bg-white transition-all font-medium"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 bg-green-700 hover:bg-green-800 text-white font-black rounded-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-xl shadow-green-100 active:scale-[0.98] text-lg"
        >
          {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <>Send Reset Link <ArrowRight className="h-5 w-5" /></>}
        </button>
      </form>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex">
        {/* Left panel - branding (Hidden on mobile) */}
        <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gradient-to-br from-green-800 to-teal-800 p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

          <div className="relative z-10">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-black tracking-tight italic">WorkOnTap</h1>
            </Link>
          </div>

          <div className="relative z-10">
            <div className="space-y-6">
               <h2 className="text-4xl font-black leading-tight">Don&apos;t worry, it <br />happens to the best of us.</h2>
               <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10 max-w-md">
                 <p className="text-green-50 font-medium leading-relaxed italic">&quot;A simple reset and you&apos;ll be back to booking top quality services in no time. We protect your account with bank-level security.&quot;</p>
               </div>
            </div>
          </div>
          <p className="relative z-10 text-green-200/50 text-xs font-bold uppercase tracking-widest leading-none">© 2025 WorkOnTap Technologies</p>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 md:p-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-green-50 rounded-full blur-3xl lg:hidden"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-teal-50 rounded-full blur-3xl lg:hidden"></div>

          <Suspense fallback={<div className="animate-pulse">Loading...</div>}>
            <ForgotPasswordContent />
          </Suspense>
        </div>
      </div>
      <Footer />
    </>
  );
}
