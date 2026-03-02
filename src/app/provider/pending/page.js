'use client';
/* eslint-disable react/no-unescaped-entities */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, CheckCircle, RefreshCw, Mail, AlertCircle } from 'lucide-react';

export default function ProviderPending() {
  const router = useRouter();
  const [provider, setProvider] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!provider?.submitted_at) return;
    const update = () => {
      const diff = new Date(provider.submitted_at).getTime() + 24 * 3600000 - Date.now();
      if (diff > 0) {
        const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000);
        setTimeLeft(`${h}h ${m}m`);
      } else setTimeLeft('Any time now');
    };
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, [provider?.submitted_at]);

  const checkStatus = async () => {
    if (checking) return;
    setChecking(true);
    try {
      const res = await fetch('/api/provider/me');
      const data = await res.json();
      if (data.success && data.provider) {
        setProvider(data.provider);
        if (data.provider.status === 'active') router.push('/provider/dashboard');
      } else router.push('/provider/login');
    } catch {} finally { setChecking(false); }
  };

  const stripeConnected = provider?.stripe_onboarding_complete === 1 || provider?.stripe_onboarding_complete === true;

  const steps = [
    { label: 'Email Verified', desc: 'Your email has been confirmed', done: true },
    { label: 'Profile Completed', desc: 'Your information has been saved', done: true },
    { label: 'Documents Uploaded', desc: 'Documents submitted for review', done: true },
    {
      label: 'Payment Setup',
      desc: stripeConnected
        ? 'Stripe account connected & verified'
        : 'Stripe skipped — admin will contact you if needed',
      done: stripeConnected,
      skipped: !stripeConnected,
    },
    { label: 'Admin Review', desc: "Application under review — we'll notify you soon", done: false, current: true },
  ];

  const StepIcon = ({ step }) => {
    if (step.done) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (step.current) return <Clock className="h-4 w-4 text-amber-600 animate-pulse" />;
    if (step.skipped) return <AlertCircle className="h-4 w-4 text-orange-400" />;
    return <div className="w-2 h-2 rounded-full bg-gray-300" />;
  };

  const stepBg = (s) => {
    if (s.done) return 'bg-green-100';
    if (s.current) return 'bg-amber-100';
    if (s.skipped) return 'bg-orange-50 border border-orange-200';
    return 'bg-gray-100';
  };

  const stepTextColor = (s) => {
    if (s.current) return 'text-amber-800';
    if (s.done) return 'text-gray-800';
    if (s.skipped) return 'text-orange-500';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">Application Under Review</p>
                <p className="text-sm text-amber-700">Usually takes 24–48 hours to process</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Application Progress</h3>
              <div className="space-y-3">
                {steps.map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${stepBg(s)}`}>
                      <StepIcon step={s} />
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${stepTextColor(s)}`}>{s.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-xs font-medium text-green-700 mb-1">⏰ Expected Review</p>
                <p className="text-xl font-bold text-green-700">{timeLeft || '24–48h'}</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-medium text-blue-700 mb-1">📬 Notification</p>
                <p className="text-sm text-blue-700 font-medium">Email & dashboard</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={checkStatus} disabled={checking}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition disabled:opacity-60">
                <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
                {checking ? 'Checking...' : 'Refresh Status'}
              </button>
              <Link href="/provider/support"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition">
                <Mail className="h-4 w-4" /> Support
              </Link>
            </div>

            <p className="text-xs text-center text-gray-400">
              Questions? Email <a href="mailto:support@workontap.com" className="text-green-600">support@workontap.com</a>
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to homepage</Link>
        </div>
      </div>
    </div>
  );
}