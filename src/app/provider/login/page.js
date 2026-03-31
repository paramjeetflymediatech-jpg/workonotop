


'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProviderLogin() {
  const router = useRouter();

  useEffect(() => {
    const initGoogle = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (typeof window !== 'undefined' && window.google && clientId) {
        if (window.google_initialized) {
          renderBtn();
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: 'popup',
          use_fedcm_for_prompt: true,
          callback: async (response) => {
            setLoading(true);
            try {
              const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: response.credential, role: 'provider' })
              });
              const data = await res.json();
              if (data.success) {
                router.push('/provider/dashboard');
                router.refresh();
              } else {
                setError(data.message || 'Google login failed');
              }
            } catch (err) {
              setError('Failed to login with Google');
            } finally {
              setLoading(false);
            }
          }
        });
        window.google_initialized = true;
        renderBtn();
      }
    };

    const renderBtn = () => {
      const container = document.getElementById('google-button-container');
      if (container && window.google) {
        container.innerHTML = '';
        window.google.accounts.id.renderButton(container, {
          theme: "outline",
          size: "large",
          width: Math.max(200, Math.min(400, container.offsetWidth || 340)),
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left"
        });
      }
    };

    initGoogle();
  }, [router]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = () => {
    if (typeof window === 'undefined' || !window.google) {
      alert("Google Sign-In is still loading. Please try again in 1 second.");
      return;
    }
    if (loading) return;

    // Failsafe: Initialize if not already initialized
    if (!window.google_initialized) {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (clientId && clientId !== 'your-google-client-id') {
        window.google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: 'popup',
          use_fedcm_for_prompt: true,
          callback: async (response) => {
            setLoading(true);
            try {
              const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: response.credential, role: 'provider' })
              });
              const data = await res.json();
              if (data.success) {
                router.push('/provider/dashboard');
                router.refresh();
              } else {
                setError(data.message || 'Google login failed');
              }
            } catch (err) {
              setError('Failed to login with Google');
            } finally {
              setLoading(false);
            }
          }
        });
        window.google_initialized = true;
      }
    }

    try {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          console.log("GSI Prompt not displayed:", notification.getNotDisplayedReason());
        }
      });
    } catch (err) {
      console.error("Google Prompt Error:", err);
    }
  };

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
          router.push(`/provider/verify-email-pending?email=${encodeURIComponent(email)}`);
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
    <>
      <Header />
      <div className="w-full max-w-[100vw] min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 flex overflow-x-hidden">
        {/* Left panel - branding */}
        <div className="hidden lg:flex flex-col justify-center w-2/5 bg-gradient-to-br from-green-700 to-teal-700 p-12 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>


          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <span className="text-2xl font-black">Provider Login</span>
            </div>
            <div className="space-y-8">
              <h2 className="text-3xl font-black leading-tight">Grow your business <br />on your terms.</h2>
              <div className="space-y-6">
                {[
                  { icon: '💼', title: 'Manage your jobs', desc: 'Accept, track, and complete jobs easily' },
                  { icon: '💳', title: 'Get paid fast', desc: 'Stripe-powered instant payouts' },
                  { icon: '⭐', title: 'Build your reputation', desc: 'Ratings that grow your business' },
                ].map((f) => (
                  <div key={f.title} className="flex gap-4 items-start group">
                    <span className="text-2xl bg-white/10 p-3 rounded-2xl group-hover:bg-white/20 transition-colors uppercase">{f.icon}</span>
                    <div>
                      <p className="font-bold text-white text-lg">{f.title}</p>
                      <p className="text-blue-100/80 text-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* <p className="relative z-10 text-blue-200/50 text-xs font-bold uppercase tracking-widest leading-none">© 2025 WorkOnTap Professional</p> */}
        </div>

        {/* Right panel - form */}
        <div className="flex-1 w-full max-w-[100vw] flex flex-col items-center justify-center py-12 px-4 sm:px-8 md:px-12 lg:px-20 relative">
          {/* Background decorations for mobile only */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 lg:hidden">
            <div className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 w-64 h-64 bg-blue-50 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -translate-x-1/3 translate-y-1/3 w-64 h-64 bg-indigo-50 rounded-full blur-3xl"></div>
          </div>

          <div className="w-full max-w-md relative z-10 py-10 lg:py-0">
            <div className="lg:hidden mb-8 text-center animate-fadeIn">
              <p className="text-gray-500 font-bold mt-1 uppercase tracking-widest text-xs">Professional Account</p>
            </div>
            {/* Mobile logo */}
            {/* <div className="lg:hidden mb-10 text-center animate-fadeInUp">
              <Link href="/">
                <h1 className="text-3xl font-black text-blue-700 tracking-tight italic">WorkOnTap <span className="text-blue-500 font-medium">Pro</span></h1>
              </Link>
            </div> */}

            <div className="mb-8 text-center lg:text-left space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight leading-tight font-outfit">Welcome back.</h2>
              <p className="text-gray-500 font-medium text-sm sm:text-base">Sign in to your professional dashboard</p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-4 p-4 bg-red-50 border border-red-100 rounded-2xl animate-shake shadow-sm shadow-red-50">
                <span className="text-red-500 mt-0.5">⚠️</span>
                <p className="text-sm text-red-700 font-bold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 ml-1">Work Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 sm:py-4 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm sm:text-base bg-gray-50/50 hover:bg-white focus:bg-white transition-all outline-none font-medium"
                    placeholder="pro@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="block text-sm font-bold text-gray-700">Password</label>
                  <Link href="/provider/forgot-password" title="Reset your password" className="text-xs sm:text-sm text-green-600 hover:text-green-700 font-bold transition-colors">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 sm:py-4 border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm sm:text-base bg-gray-50/50 hover:bg-white focus:bg-white transition-all outline-none font-medium"
                    placeholder="••••••••"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 sm:py-4 bg-green-700 hover:bg-green-800 text-white font-black rounded-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-xl shadow-green-100 active:scale-[0.98] text-base"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="h-5 w-5" /></>
                )}
              </button>

              <div className="relative my-8 sm:my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
                  <span className="bg-white px-4 text-gray-400 font-black tracking-widest leading-none">Or continue with</span>
                </div>
              </div>

              <div className="flex justify-center w-full">
                <div id="google-button-container" className="w-full min-h-[44px] flex justify-center" />
              </div>
            </form>

            <p className="text-center mt-10 text-sm text-gray-500 font-medium">
              Don&apos;t have an account?{' '}
              <Link href="/provider/signup" className="text-green-600 hover:text-green-700 font-black underline decoration-2 underline-offset-4">
                Register as a Pro
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />

    </>
  );
}