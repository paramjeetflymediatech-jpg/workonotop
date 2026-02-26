// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { Eye, EyeOff, Mail, Phone, User, Lock, CheckCircle } from 'lucide-react';

// export default function ProviderSignup() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//     if (errors[e.target.name]) {
//       setErrors({ ...errors, [e.target.name]: '' });
//     }
//   };

//   const validate = () => {
//     const newErrors = {};
    
//     if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
//     else if (formData.firstName.length < 2) newErrors.firstName = 'Minimum 2 characters';

//     if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
//     else if (formData.lastName.length < 2) newErrors.lastName = 'Minimum 2 characters';

//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!formData.email) newErrors.email = 'Email is required';
//     else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email format';

//     const phoneRegex = /^[0-9+\-\s()]{10,20}$/;
//     if (!formData.phone) newErrors.phone = 'Phone number is required';
//     else if (!phoneRegex.test(formData.phone)) newErrors.phone = 'Invalid phone format';

//     if (!formData.password) newErrors.password = 'Password is required';
//     else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';
//     else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
//       newErrors.password = 'Must contain uppercase, lowercase & number';
//     }

//     if (formData.password !== formData.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }

//     return newErrors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const newErrors = validate();
    
//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch('/api/provider/signup', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData)
//       });

//       const data = await res.json();
//       if (data.success) {
//         router.push('/provider/verify-email-pending');
//       } else {
//         setErrors({ submit: data.message });
//       }
//     } catch (error) {
//       setErrors({ submit: 'Something went wrong' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="flex justify-center">
//           <div className="h-16 w-16 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200">
//             <CheckCircle className="h-8 w-8 text-white" />
//           </div>
//         </div>
//         <h2 className="mt-6 text-center text-3xl font-bold bg-gradient-to-r from-slate-800 to-teal-800 bg-clip-text text-transparent">
//           Become a Provider
//         </h2>
//         <p className="mt-2 text-center text-sm text-slate-600">
//           Join WorkOnTap and start your journey today
//         </p>
//       </div>

//       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
//         <div className="bg-white/80 backdrop-blur-lg py-8 px-4 shadow-xl rounded-2xl sm:px-8 border border-slate-100">
//           <form className="space-y-5" onSubmit={handleSubmit}>
//             {/* Name Row */}
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                   First Name
//                 </label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                   <input
//                     name="firstName"
//                     type="text"
//                     value={formData.firstName}
//                     onChange={handleChange}
//                     className={`pl-10 w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
//                       errors.firstName ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                     }`}
//                     placeholder="John"
//                   />
//                 </div>
//                 {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-1">
//                   Last Name
//                 </label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                   <input
//                     name="lastName"
//                     type="text"
//                     value={formData.lastName}
//                     onChange={handleChange}
//                     className={`pl-10 w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
//                       errors.lastName ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                     }`}
//                     placeholder="Doe"
//                   />
//                 </div>
//                 {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
//               </div>
//             </div>

//             {/* Email */}
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                 <input
//                   name="email"
//                   type="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   className={`pl-10 w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
//                     errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   }`}
//                   placeholder="john@example.com"
//                 />
//               </div>
//               {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
//             </div>

//             {/* Phone */}
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Phone Number
//               </label>
//               <div className="relative">
//                 <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                 <input
//                   name="phone"
//                   type="tel"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   className={`pl-10 w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
//                     errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   }`}
//                   placeholder="+1 (123) 456-7890"
//                 />
//               </div>
//               {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
//             </div>

//             {/* Password */}
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                 <input
//                   name="password"
//                   type={showPassword ? 'text' : 'password'}
//                   value={formData.password}
//                   onChange={handleChange}
//                   className={`pl-10 w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
//                     errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   }`}
//                   placeholder="••••••••"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4 text-slate-400" />
//                   ) : (
//                     <Eye className="h-4 w-4 text-slate-400" />
//                   )}
//                 </button>
//               </div>
//               {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
//             </div>

//             {/* Confirm Password */}
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Confirm Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                 <input
//                   name="confirmPassword"
//                   type={showConfirmPassword ? 'text' : 'password'}
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   className={`pl-10 w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition ${
//                     errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   }`}
//                   placeholder="••••••••"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2"
//                 >
//                   {showConfirmPassword ? (
//                     <EyeOff className="h-4 w-4 text-slate-400" />
//                   ) : (
//                     <Eye className="h-4 w-4 text-slate-400" />
//                   )}
//                 </button>
//               </div>
//               {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
//             </div>

//             {errors.submit && (
//               <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
//                 <p className="text-sm text-red-600">{errors.submit}</p>
//               </div>
//             )}

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium rounded-xl hover:from-teal-700 hover:to-cyan-700 focus:ring-4 focus:ring-teal-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Creating Account...' : 'Create Account'}
//             </button>
//           </form>

//           <div className="mt-6 text-center">
//             <p className="text-sm text-slate-600">
//               Already have an account?{' '}
//               <Link href="/provider/login" className="font-medium text-teal-600 hover:text-teal-700">
//                 Sign in
//               </Link>
//             </p>
//           </div>
//         </div>

//         {/* Benefits Card */}
//         <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
//           <h3 className="text-sm font-semibold text-teal-800 mb-2">✨ Why join WorkOnTap?</h3>
//           <div className="grid grid-cols-2 gap-2 text-xs text-teal-700">
//             <div className="flex items-center">
//               <CheckCircle className="h-3 w-3 mr-1 text-teal-500" />
//               Set your own rates
//             </div>
//             <div className="flex items-center">
//               <CheckCircle className="h-3 w-3 mr-1 text-teal-500" />
//               Flexible schedule
//             </div>
//             <div className="flex items-center">
//               <CheckCircle className="h-3 w-3 mr-1 text-teal-500" />
//               Secure payments
//             </div>
//             <div className="flex items-center">
//               <CheckCircle className="h-3 w-3 mr-1 text-teal-500" />
//                 24/7 support
//             </div>
//           </div>
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-green-700">WorkOnTap</Link>
          <h2 className="mt-4 text-xl font-bold text-gray-900">Join as a Service Pro</h2>
          <p className="mt-1 text-gray-500 text-sm">Start earning with flexible, high-paying jobs near you</p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[['💰', 'Set your rates'], ['🕐', 'Flexible hours'], ['🔒', 'Secure payments'], ['📱', '24/7 support']].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
              <span className="text-base">{icon}</span>
              <span className="text-xs font-medium text-green-800">{text}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
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

            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}

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
          </form>

          <p className="text-center mt-5 text-sm text-gray-500">
            Already a Pro?{' '}
            <Link href="/provider/login" className="text-green-600 hover:text-green-700 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}