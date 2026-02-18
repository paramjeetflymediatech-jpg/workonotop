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

  // Enhanced phone validation
  const validatePhone = (phone) => {
    // Remove all non-digits
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Check if it's a valid North American phone number (10 digits)
    if (digitsOnly.length === 10) return true;
    
    // Check if it's a valid Canadian/US number with country code
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) return true;
    
    return false;
  };

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const validate = () => {
    const newErrors = {};
    
    // First Name
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    else if (formData.firstName.length < 2) newErrors.firstName = 'First name must be at least 2 characters';
    
    // Last Name
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    else if (formData.lastName.length < 2) newErrors.lastName = 'Last name must be at least 2 characters';
    
    // Email
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    
    // Phone - Enhanced validation for unique constraint
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else {
      const digitsOnly = formData.phone.replace(/\D/g, '');
      if (digitsOnly.length === 0) {
        newErrors.phone = 'Phone number is required';
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = 'Please enter a valid 10-digit phone number';
      }
    }
    
    // Password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    }
    
    // Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Terms
    if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms and conditions';
    
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
      // Clean phone number before sending (remove formatting)
      const cleanPhone = formData.phone.replace(/\D/g, '');
      
      const res = await fetch('/api/provider/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: cleanPhone, // Send clean phone number
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
        // Handle specific error messages from the API
        if (data.message?.toLowerCase().includes('email')) {
          setApiError('This email is already registered. Please use a different email or login.');
        } else if (data.message?.toLowerCase().includes('phone')) {
          setApiError('This phone number is already registered. Please use a different number or login.');
        } else {
          setApiError(data.message || 'Signup failed. Please try again.');
        }
      }
    } catch (error) {
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle phone input with formatting
  const handlePhoneChange = (e) => {
    const rawValue = e.target.value;
    const formatted = formatPhoneNumber(rawValue);
    setFormData({...formData, phone: formatted});
    setErrors({...errors, phone: null});
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
                  maxLength={50}
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
                  maxLength={50}
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
                maxLength={255}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone - Now with formatting */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Cell Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                className={`w-full px-3 py-2.5 rounded-lg border-2 ${
                  errors.phone ? 'border-red-500' : 'border-gray-200'
                } focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition`}
                placeholder="(403) 555-0123"
                maxLength={14} // (XXX) XXX-XXXX = 14 chars
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                Format: (XXX) XXX-XXXX • Must be unique
              </p>
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
                  maxLength={50}
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
                  maxLength={50}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Password Requirements Hint */}
            {formData.password && formData.password.length > 0 && (
              <div className="text-xs space-y-1 bg-gray-50 p-2 rounded-lg">
                <p className="text-gray-600 font-medium mb-1">Password requirements:</p>
                <div className="grid grid-cols-2 gap-1">
                  <span className={formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                    ✓ At least 8 characters
                  </span>
                  <span className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                    ✓ One uppercase letter
                  </span>
                  <span className={/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                    ✓ One lowercase letter
                  </span>
                  <span className={/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}>
                    ✓ One number
                  </span>
                </div>
              </div>
            )}

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
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-green-700 hover:underline font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeTerms && (
              <p className="text-red-500 text-xs -mt-2">{errors.agreeTerms}</p>
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