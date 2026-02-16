'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProSignupModal({ isOpen, onClose, onSwitchToLogin, onSignupSuccess }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'Required';
    if (!formData.lastName) newErrors.lastName = 'Required';
    if (!formData.email) newErrors.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone) newErrors.phone = 'Required';
    if (!formData.password) newErrors.password = 'Required';
    else if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeTerms) newErrors.agreeTerms = 'Required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch('/api/provider/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        })
      });

      const data = await res.json();

      if (data.success) {
        // Store token and provider data
        localStorage.setItem('providerToken', data.token);
        localStorage.setItem('provider', JSON.stringify(data.provider));
        
        // Call the success callback with user data and type
        onSignupSuccess?.(data.provider, 'provider');
        
        onClose();
        router.push('/provider/dashboard');
      } else {
        setApiError(data.message || 'Signup failed. Please try again.');
      }
    } catch (error) {
      setApiError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-8 text-center sticky top-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <span className="text-3xl">🛠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            It&apos;s free to join the WorkOnTap platform
          </h2>
          <p className="text-green-100 text-sm">
            Become a WorkOnTap Professional and grow your business
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          {/* API Error Message */}
          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData({...formData, firstName: e.target.value});
                    setErrors({...errors, firstName: null});
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg border-2 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-200'
                  } focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData({...formData, lastName: e.target.value});
                    setErrors({...errors, lastName: null});
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg border-2 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-200'
                  } focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({...formData, email: e.target.value});
                  setErrors({...errors, email: null});
                }}
                className={`w-full px-3 py-2.5 rounded-lg border-2 ${
                  errors.email ? 'border-red-500' : 'border-gray-200'
                } focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition`}
                placeholder="pro@example.com"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Cell Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({...formData, phone: e.target.value});
                  setErrors({...errors, phone: null});
                }}
                className={`w-full px-3 py-2.5 rounded-lg border-2 ${
                  errors.phone ? 'border-red-500' : 'border-gray-200'
                } focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition`}
                placeholder="(403) 555-0123"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({...formData, password: e.target.value});
                    setErrors({...errors, password: null});
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg border-2 ${
                    errors.password ? 'border-red-500' : 'border-gray-200'
                  } focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Confirm <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({...formData, confirmPassword: e.target.value});
                    setErrors({...errors, confirmPassword: null});
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg border-2 ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-200'
                  } focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="agreeTerms"
                checked={formData.agreeTerms}
                onChange={(e) => {
                  setFormData({...formData, agreeTerms: e.target.checked});
                  setErrors({...errors, agreeTerms: null});
                }}
                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5"
              />
              <label htmlFor="agreeTerms" className="ml-2 text-xs text-gray-600">
                By signing up, you agree to WorkOnTap&apos;s{' '}
                <Link href="/terms" className="text-green-700 hover:underline font-medium">
                  Terms and Conditions
                </Link>
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="text-red-500 text-xs -mt-2">You must agree to terms</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-3.5 rounded-xl font-bold text-lg shadow-lg hover:from-green-800 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                  Creating Account...
                </>
              ) : (
                'Sign Me Up!'
              )}
            </button>

            {/* Login Link */}
            <p className="text-center text-gray-600 text-sm">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-green-700 hover:underline font-medium"
              >
                Log in
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}