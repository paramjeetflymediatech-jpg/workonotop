


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Phone, User, Lock, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function InputField({ label, name, type = 'text', icon: Icon, placeholder, value, onChange, onBlur, error, rightElement, maxLength }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
          }`}
        />
        {rightElement}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">⚠️ {error}</p>}
    </div>
  );
}

function PasswordStrength({ password }) {
  if (!password) return null;

  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'Includes Alphabets', pass: /[a-zA-Z]/.test(password) },
    { label: 'Special Character', pass: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const passed = checks.filter(c => c.pass).length;
  const strength = passed <= 1 ? 'Weak' : passed === 2 ? 'Fair' : 'Strong';
  const color = passed <= 1 ? 'bg-red-400' : passed === 2 ? 'bg-yellow-400' : 'bg-green-500';
  const textColor = passed <= 1 ? 'text-red-500' : passed === 2 ? 'text-yellow-600' : 'text-green-600';

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${(passed / 4) * 100}%` }} />
        </div>
        <span className={`text-xs font-semibold ${textColor}`}>{strength}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <p key={c.label} className={`text-xs flex items-center gap-1 ${c.pass ? 'text-green-600' : 'text-gray-400'}`}>
            {c.pass ? '✓' : '○'} {c.label}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function ProviderSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if ((name === 'firstName' || name === 'lastName') && value !== '') {
      if (!/^[a-zA-Z\s]*$/.test(value)) return;
    }

    if (name === 'phone' && value !== '') {
      if (!/^[0-9+\-\s()]*$/.test(value)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        if (value.trim().length < 2) return 'Minimum 2 characters required';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Only letters are allowed';
        return '';

      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        if (value.trim().length < 2) return 'Minimum 2 characters required';
        if (!/^[a-zA-Z\s]+$/.test(value)) return 'Only letters are allowed';
        return '';

      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address';
        return '';

      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        const digitsOnly = value.replace(/\D/g, '');
        if (digitsOnly.length < 10) return 'Phone must have at least 10 digits';
        return '';

      case 'password':
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!value) return 'Password is required';
        if (!passwordRegex.test(value)) return '8+ characters, alphabets and special chars required';
        return '';

      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';

      default:
        return '';
    }
  };

  const validate = () => {
    const fields = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'];
    const newErrors = {};
    fields.forEach(field => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });
    const allTouched = {};
    fields.forEach(f => allTouched[f] = true);
    setTouched(allTouched);
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstErrorField = document.querySelector('.border-red-300');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/provider/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/provider/verify-email-pending?email=${encodeURIComponent(formData.email)}`);
      } else {
        setErrors({ submit: data.message });
      }
    } catch {
      setErrors({ submit: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex">

        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gradient-to-br from-green-700 to-teal-700 p-12 text-white">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">WorkOnTap</h1>
            <p className="mt-2 text-green-200 text-sm">Pro Dashboard</p>
          </div>
          <div className="space-y-6">
            {[
              { icon: '💼', title: 'Start earning today', desc: 'Connect with customers in your area' },
              { icon: '💳', title: 'Secure payments', desc: 'Get paid fast with Stripe integration' },
              { icon: '⭐', title: 'Build your business', desc: 'Grow your reputation with ratings' },
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
          <p className="text-green-300 text-sm">© 2025 WorkOnTap. All rights reserved.</p>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">

            <div className="lg:hidden mb-8 text-center">
              <h1 className="text-2xl font-bold text-green-700">WorkOnTap</h1>
              <p className="text-gray-500 text-sm mt-1">Pro Registration</p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Join as a Service Pro</h2>
              <p className="text-gray-500 mt-1">Start earning with flexible, high-paying jobs near you</p>
            </div>

            {errors.submit && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
                <span className="text-red-500 mt-0.5">❌</span>
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit} noValidate>

              {/* Name row */}
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="First Name" name="firstName" icon={User} placeholder="John"
                  value={formData.firstName} onChange={handleChange} onBlur={handleBlur}
                  error={errors.firstName}
                  maxLength={15}
                />
                <InputField
                  label="Last Name" name="lastName" icon={User} placeholder="Doe"
                  value={formData.lastName} onChange={handleChange} onBlur={handleBlur}
                  error={errors.lastName}
                  maxLength={15}
                />
              </div>

              {/* Email */}
              <InputField
                label="Email Address" name="email" type="email" icon={Mail}
                placeholder="john@example.com" value={formData.email}
                onChange={handleChange} onBlur={handleBlur} error={errors.email}
                maxLength={30}
              />

              {/* Phone */}
              <InputField
                label="Phone Number" name="phone" type="tel" icon={Phone}
                placeholder="+1 (555) 000-0000" value={formData.phone}
                onChange={handleChange} onBlur={handleBlur} error={errors.phone}
                maxLength={15}
              />

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    maxLength={40}
                    className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">⚠️ {errors.password}</p>}
                <PasswordStrength password={formData.password} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    maxLength={40}
                    className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' :
                      formData.confirmPassword && formData.confirmPassword === formData.password ? 'border-green-400 bg-green-50' : 'border-gray-200'
                    }`}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">⚠️ {errors.confirmPassword}</p>
                )}
                {!errors.confirmPassword && formData.confirmPassword && formData.confirmPassword === formData.password && (
                  <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">✓ Passwords match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-green-200 mt-2"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <>Create Account <ArrowRight className="h-4 w-4" /></>
                }
              </button>

              <p className="text-center mt-4 text-sm text-gray-500">
                Already a Pro?{' '}
                <Link href="/provider/login" className="text-green-600 hover:text-green-700 font-semibold">
                  Sign in
                </Link>
              </p>

            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}