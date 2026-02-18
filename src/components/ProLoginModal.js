'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProForgotPasswordModal from './ProForgotPasswordModal';

export default function ProLoginModal({ isOpen, onClose, onSwitchToSignup, onLoginSuccess }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/provider/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        })
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('providerToken', data.token);
        localStorage.setItem('provider', JSON.stringify(data.provider));
        onLoginSuccess?.(data.provider, 'provider');
        onClose();
        router.push('/provider/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // FIX: Don't call onClose() here — just open the forgot modal
  // The login modal stays mounted in the background
  const handleForgotPassword = (e) => {
    e.preventDefault();
    setError('');
    setShowForgotPassword(true);
  };

  return (
    <>
      {/* Hide login modal visually when forgot password is open, but keep it mounted */}
      <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${showForgotPassword ? 'invisible' : 'visible'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="bg-green-700 px-6 py-8 text-center">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔧</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Login to your Pro Account!</h2>
            <p className="text-green-100 text-sm">Access your dashboard and manage jobs</p>
          </div>

          {/* Form */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none"
                  placeholder="pro@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-green-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-green-800 transition disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login to Dashboard'}
              </button>

              <p className="text-center text-gray-600">
                New to WorkOnTap?{' '}
                <button type="button" onClick={onSwitchToSignup} className="text-green-700 hover:underline font-medium">
                  Become a Pro
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* FIX: onSwitchToLogin just closes forgot modal — login modal is still mounted */}
      <ProForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onSwitchToLogin={() => setShowForgotPassword(false)}
      />
    </>
  );
}