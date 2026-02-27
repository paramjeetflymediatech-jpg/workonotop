


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function ProviderLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/provider/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        router.push('/provider/dashboard');
        router.refresh();
      } else {
        if (data.isRejected) {
          router.push(`/provider/rejected?reason=${encodeURIComponent(data.rejection_reason || '')}`);
        } else if (data.requiresVerification) {
          router.push('/provider/verify-email-pending');
        } else {
          setError(data.message || 'Login failed');
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gradient-to-br from-green-700 to-teal-700 p-12 text-white">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WorkOnTap</h1>
          <p className="mt-2 text-green-200 text-sm">Pro Dashboard</p>
        </div>
        <div>
          <div className="space-y-6">
            {[
              { icon: '💼', title: 'Manage your jobs', desc: 'Accept, track, and complete jobs easily' },
              { icon: '💳', title: 'Get paid fast', desc: 'Stripe-powered instant payouts' },
              { icon: '⭐', title: 'Build your reputation', desc: 'Ratings that grow your business' },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 items-start">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="font-semibold text-white">{f.title}</p>
                  <p className="text-green-200 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-green-300 text-sm">© 2025 WorkOnTap. All rights reserved.</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-2xl font-bold text-green-700">WorkOnTap</h1>
            <p className="text-gray-500 text-sm mt-1">Pro Portal</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1">Sign in to your provider account</p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <span className="text-red-500 mt-0.5">⚠</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white transition"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link href="/provider/forgot-password" className="text-xs text-green-600 hover:text-green-700 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white transition"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-green-200"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-gray-500">
            Don&apos;t have an account?{' '}
            <Link href="/provider/signup" className="text-green-600 hover:text-green-700 font-semibold">
              Register as a Pro
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}