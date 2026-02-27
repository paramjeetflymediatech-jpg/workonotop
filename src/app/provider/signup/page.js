



// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { Eye, EyeOff, Mail, Phone, User, Lock, ArrowRight } from 'lucide-react';

// // ✅ FIX: Moved outside ProviderSignup so it doesn't re-create on every render
// function InputField({ label, name, type = 'text', icon: Icon, placeholder, value, onChange, error, rightElement }) {
//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
//       <div className="relative">
//         <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//         <input
//           name={name}
//           type={type}
//           value={value}
//           onChange={onChange}
//           placeholder={placeholder}
//           className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition ${
//             error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
//           }`}
//         />
//         {rightElement}
//       </div>
//       {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
//     </div>
//   );
// }

// export default function ProviderSignup() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: ''
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const handleChange = (e) => {
//     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
//     if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
//   };

//   const validate = () => {
//     const e = {};
//     if (!formData.firstName.trim() || formData.firstName.length < 2) e.firstName = 'Minimum 2 characters';
//     if (!formData.lastName.trim() || formData.lastName.length < 2) e.lastName = 'Minimum 2 characters';
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email format';
//     if (!/^[0-9+\-\s()]{10,20}$/.test(formData.phone)) e.phone = 'Invalid phone format';
//     if (!formData.password || formData.password.length < 6) e.password = 'Minimum 6 characters';
//     else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) e.password = 'Must include uppercase, lowercase & number';
//     if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
//     return e;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const newErrors = validate();
//     if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
//     setLoading(true);
//     try {
//       const res = await fetch('/api/provider/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });
//       const data = await res.json();
//       if (data.success) router.push('/provider/verify-email-pending');
//       else setErrors({ submit: data.message });
//     } catch {
//       setErrors({ submit: 'Something went wrong' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 py-10 px-4">
//       <div className="max-w-lg mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <Link href="/" className="text-2xl font-bold text-green-700">WorkOnTap</Link>
//           <h2 className="mt-4 text-xl font-bold text-gray-900">Join as a Service Pro</h2>
//           <p className="mt-1 text-gray-500 text-sm">Start earning with flexible, high-paying jobs near you</p>
//         </div>

//         {/* Benefits */}
//         <div className="grid grid-cols-2 gap-3 mb-6">
//           {[['💰', 'Set your rates'], ['🕐', 'Flexible hours'], ['🔒', 'Secure payments'], ['📱', '24/7 support']].map(([icon, text]) => (
//             <div key={text} className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
//               <span className="text-base">{icon}</span>
//               <span className="text-xs font-medium text-green-800">{text}</span>
//             </div>
//           ))}
//         </div>

//         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
//           <form className="space-y-4" onSubmit={handleSubmit}>
//             <div className="grid grid-cols-2 gap-4">
//               <InputField
//                 label="First Name" name="firstName" icon={User} placeholder="John"
//                 value={formData.firstName} onChange={handleChange} error={errors.firstName}
//               />
//               <InputField
//                 label="Last Name" name="lastName" icon={User} placeholder="Doe"
//                 value={formData.lastName} onChange={handleChange} error={errors.lastName}
//               />
//             </div>

//             <InputField
//               label="Email Address" name="email" type="email" icon={Mail}
//               placeholder="john@example.com" value={formData.email}
//               onChange={handleChange} error={errors.email}
//             />

//             <InputField
//               label="Phone Number" name="phone" type="tel" icon={Phone}
//               placeholder="+1 (555) 000-0000" value={formData.phone}
//               onChange={handleChange} error={errors.phone}
//             />

//             {/* Password */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <input
//                   name="password"
//                   type={showPassword ? 'text' : 'password'}
//                   value={formData.password}
//                   onChange={handleChange}
//                   placeholder="••••••••"
//                   className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition ${
//                     errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
//                   }`}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(p => !p)}
//                   className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                 </button>
//               </div>
//               {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
//             </div>

//             {/* Confirm Password */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
//               <div className="relative">
//                 <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                 <input
//                   name="confirmPassword"
//                   type={showConfirmPassword ? 'text' : 'password'}
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   placeholder="••••••••"
//                   className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition ${
//                     errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
//                   }`}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowConfirmPassword(p => !p)}
//                   className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 >
//                   {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                 </button>
//               </div>
//               {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword}</p>}
//             </div>

//             {errors.submit && (
//               <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
//                 <p className="text-sm text-red-600">{errors.submit}</p>
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm shadow-green-200 mt-2"
//             >
//               {loading
//                 ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 : <>Create Account <ArrowRight className="h-4 w-4" /></>
//               }
//             </button>
//           </form>

//           <p className="text-center mt-5 text-sm text-gray-500">
//             Already a Pro?{' '}
//             <Link href="/provider/login" className="text-green-600 hover:text-green-700 font-semibold">Sign in</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }













'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Phone, User, Lock, ArrowRight } from 'lucide-react';

// ✅ FIX: Moved outside ProviderSignup so it doesn't re-create on every render
function InputField({ label, name, type = 'text', icon: Icon, placeholder, value, onChange, error, rightElement }) {
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
          placeholder={placeholder}
          className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition ${
            error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
          }`}
        />
        {rightElement}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
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

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!formData.firstName.trim() || formData.firstName.length < 2) e.firstName = 'Minimum 2 characters';
    if (!formData.lastName.trim() || formData.lastName.length < 2) e.lastName = 'Minimum 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email format';
    if (!/^[0-9+\-\s()]{10,20}$/.test(formData.phone)) e.phone = 'Invalid phone format';
    if (!formData.password || formData.password.length < 6) e.password = 'Minimum 6 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) e.password = 'Must include uppercase, lowercase & number';
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/provider/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) router.push('/provider/verify-email-pending');
      else setErrors({ submit: data.message });
    } catch {
      setErrors({ submit: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 flex">
      {/* Left panel - branding (same as login) */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gradient-to-br from-green-700 to-teal-700 p-12 text-white">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WorkOnTap</h1>
          <p className="mt-2 text-green-200 text-sm">Pro Dashboard</p>
        </div>
        <div>
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
        </div>
        <p className="text-green-300 text-sm">© 2025 WorkOnTap. All rights reserved.</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-2xl font-bold text-green-700">WorkOnTap</h1>
            <p className="text-gray-500 text-sm mt-1">Pro Registration</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Join as a Service Pro</h2>
            <p className="text-gray-500 mt-1">Start earning with flexible, high-paying jobs near you</p>
          </div>

          {errors.submit && (
            <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="First Name" name="firstName" icon={User} placeholder="John"
                value={formData.firstName} onChange={handleChange} error={errors.firstName}
              />
              <InputField
                label="Last Name" name="lastName" icon={User} placeholder="Doe"
                value={formData.lastName} onChange={handleChange} error={errors.lastName}
              />
            </div>

            <InputField
              label="Email Address" name="email" type="email" icon={Mail}
              placeholder="john@example.com" value={formData.email}
              onChange={handleChange} error={errors.email}
            />

            <InputField
              label="Phone Number" name="phone" type="tel" icon={Phone}
              placeholder="+1 (555) 000-0000" value={formData.phone}
              onChange={handleChange} error={errors.phone}
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
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>}
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
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm transition ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword}</p>}
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
  );
}