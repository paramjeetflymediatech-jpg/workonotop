


// 'use client';

// import Link from 'next/link';
// import { useState, useRef, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from 'src/context/AuthContext';
// import CustomerAuthModal from '../components/CustomerAuthModal';
// import { ChevronDown, Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react';

// export default function Header() {
//   const router = useRouter();
//   const {
//     user, userType, logout, isProvider, isCustomer,
//     getDashboardLink, getUserDisplayName, getUserInitials
//   } = useAuth();

//   const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
//   const [customerModalMode, setCustomerModalMode] = useState('login');
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
//   const [proDropdownOpen, setProDropdownOpen] = useState(false);
//   const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
//   const proRef = useRef(null);
//   const loginRef = useRef(null);

//   // Close dropdowns on outside click
//   useEffect(() => {
//     const handler = (e) => {
//       if (proRef.current && !proRef.current.contains(e.target)) setProDropdownOpen(false);
//       if (loginRef.current && !loginRef.current.contains(e.target)) setLoginDropdownOpen(false);
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const openCustomerModal = (mode = 'login') => {
//     setCustomerModalMode(mode);
//     setIsCustomerModalOpen(true);
//     setMobileMenuOpen(false);
//     setLoginDropdownOpen(false);
//   };

//   const goToProLogin = () => { router.push('/provider/login'); setMobileMenuOpen(false); setProDropdownOpen(false); };
//   const goToProSignup = () => { router.push('/provider/signup'); setMobileMenuOpen(false); setProDropdownOpen(false); };
//   const handleLogout = () => { logout(true); setShowLogoutConfirm(false); };

//   return (
//     <>
//       <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
//         <nav className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">

//           {/* Logo */}
//           <Link href="/" className="text-2xl font-extrabold text-green-700 hover:text-green-800 transition tracking-tight flex-shrink-0">
//             WorkOnTap
//           </Link>

//           {/* Desktop Nav Links */}
//           <div className="hidden md:flex items-center gap-6 text-sm font-medium">
//             {(!user || !isProvider()) && (
//               <Link href="/services" className="text-gray-600 hover:text-green-700 transition">
//                 Explore Services
//               </Link>
//             )}
//             {user && (
//               <Link href={getDashboardLink()} className="text-gray-600 hover:text-green-700 transition">
//                 {isProvider() ? 'Dashboard' : 'My Bookings'}
//               </Link>
//             )}
//             <Link href="/help" className="text-gray-600 hover:text-green-700 transition">
//               Help Center
//             </Link>
//           </div>

//           {/* Desktop Auth */}
//           <div className="hidden md:flex items-center gap-2">
//             {user ? (
//               // ── Logged in ──
//               <div className="flex items-center gap-3">
//                 <Link href={getDashboardLink()} className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition">
//                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${isProvider() ? 'bg-blue-600' : 'bg-green-600'}`}>
//                     {getUserInitials()}
//                   </div>
//                   <div className="flex flex-col leading-none">
//                     <span className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</span>
//                     <span className={`text-xs font-medium ${isProvider() ? 'text-blue-500' : 'text-green-600'}`}>
//                       {isProvider() ? 'Pro Account' : 'Customer'}
//                     </span>
//                   </div>
//                 </Link>
//                 <Link href={'/profile'}>Profile</Link>
//                 <button
//                   onClick={() => setShowLogoutConfirm(true)}
//                   className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
//                 >
//                   <LogOut className="h-4 w-4" />
//                   Logout
//                 </button>
//               </div>
//             ) : (
//               // ── Not logged in ──
//               <div className="flex items-center gap-2">

//                 {/* Log In dropdown (customer) */}
//                 <div className="relative" ref={loginRef}>
//                   <button
//                     onClick={() => { setLoginDropdownOpen(p => !p); setProDropdownOpen(false); }}
//                     className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-green-700 px-3 py-2 rounded-xl hover:bg-gray-50 transition"
//                   >
//                     Log In <ChevronDown className={`h-3.5 w-3.5 transition-transform ${loginDropdownOpen ? 'rotate-180' : ''}`} />
//                   </button>
//                   {loginDropdownOpen && (
//                     <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
//                       <div className="p-1.5">
//                         <button onClick={() => openCustomerModal('login')}
//                           className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl transition text-left">
//                           <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                             <User className="h-4 w-4 text-green-600" />
//                           </div>
//                           <div>
//                             <p className="font-semibold">Customer Login</p>
//                             <p className="text-xs text-gray-400">Book services</p>
//                           </div>
//                         </button>
//                         <button onClick={goToProLogin}
//                           className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition text-left">
//                           <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                             <LayoutDashboard className="h-4 w-4 text-blue-600" />
//                           </div>
//                           <div>
//                             <p className="font-semibold">Pro Login</p>
//                             <p className="text-xs text-gray-400">Manage your jobs</p>
//                           </div>
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Sign Up dropdown */}
//                 <div className="relative" ref={proRef}>
//                   <button
//                     onClick={() => { setProDropdownOpen(p => !p); setLoginDropdownOpen(false); }}
//                     className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm shadow-green-200"
//                   >
//                     Sign Up <ChevronDown className={`h-3.5 w-3.5 transition-transform ${proDropdownOpen ? 'rotate-180' : ''}`} />
//                   </button>
//                   {proDropdownOpen && (
//                     <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
//                       <div className="p-1.5">
//                         <button onClick={() => openCustomerModal('signup')}
//                           className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl transition text-left">
//                           <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                             <User className="h-4 w-4 text-green-600" />
//                           </div>
//                           <div>
//                             <p className="font-semibold">Customer Sign Up</p>
//                             <p className="text-xs text-gray-400">Book services near you</p>
//                           </div>
//                         </button>
//                         <button onClick={goToProSignup}
//                           className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition text-left">
//                           <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
//                             <LayoutDashboard className="h-4 w-4 text-purple-600" />
//                           </div>
//                           <div>
//                             <p className="font-semibold">Become a Pro</p>
//                             <p className="text-xs text-gray-400">Start earning today</p>
//                           </div>
//                         </button>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//               </div>
//             )}
//           </div>

//           {/* Mobile Menu Toggle */}
//           <button
//             className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
//             onClick={() => setMobileMenuOpen(p => !p)}
//           >
//             {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
//           </button>
//         </nav>

//         {/* ── Mobile Menu ── */}
//         {mobileMenuOpen && (
//           <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
//             {(!user || !isProvider()) && (
//               <Link href="/services" onClick={() => setMobileMenuOpen(false)}
//                 className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-700 rounded-xl transition">
//                 Explore Services
//               </Link>
//             )}
//             {user && (
//               <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}
//                 className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-700 rounded-xl transition">
//                 {isProvider() ? 'Dashboard' : 'My Bookings'}
//               </Link>
//             )}
//             <Link href="/help" onClick={() => setMobileMenuOpen(false)}
//               className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-700 rounded-xl transition">
//               Help Center
//             </Link>

//             <div className="border-t border-gray-100 pt-3 mt-1">
//               {user ? (
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl">
//                     <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isProvider() ? 'bg-blue-600' : 'bg-green-600'}`}>
//                       {getUserInitials()}
//                     </div>
//                     <div>
//                       <p className="font-semibold text-sm text-gray-900">{getUserDisplayName()}</p>
//                       <p className={`text-xs font-medium ${isProvider() ? 'text-blue-500' : 'text-green-600'}`}>
//                         {isProvider() ? 'Pro Account' : 'Customer'}
//                       </p>
//                     </div>
//                   </div>
//                   <button onClick={() => { setMobileMenuOpen(false); setShowLogoutConfirm(true); }}
//                     className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-xl transition">
//                     <LogOut className="h-4 w-4" /> Logout
//                   </button>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   {/* Customer */}
//                   <div className="bg-green-50 border border-green-100 rounded-2xl p-3 space-y-2">
//                     <p className="text-xs font-semibold text-green-700 uppercase tracking-wider px-1">For Customers</p>
//                     <div className="grid grid-cols-2 gap-2">
//                       <button onClick={() => openCustomerModal('login')}
//                         className="py-2.5 text-sm font-semibold text-green-700 border-2 border-green-600 rounded-xl hover:bg-green-100 transition">
//                         Log In
//                       </button>
//                       <button onClick={() => openCustomerModal('signup')}
//                         className="py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition">
//                         Sign Up
//                       </button>
//                     </div>
//                   </div>
//                   {/* Pro */}
//                   <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 space-y-2">
//                     <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-1">For Professionals</p>
//                     <div className="grid grid-cols-2 gap-2">
//                       <button onClick={goToProLogin}
//                         className="py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-100 transition">
//                         Pro Login
//                       </button>
//                       <button onClick={goToProSignup}
//                         className="py-2.5 text-sm font-semibold text-white bg-gray-800 hover:bg-gray-900 rounded-xl transition">
//                         Become a Pro
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </header>

//       {/* ── Logout Confirm Modal ── */}
//       {showLogoutConfirm && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
//           <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
//             <div className="text-center mb-5">
//               <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                 <LogOut className="w-7 h-7 text-red-600" />
//               </div>
//               <h3 className="text-lg font-bold text-gray-900 mb-1">Sign out?</h3>
//               <p className="text-sm text-gray-500">You&apos;ll need to log in again to access your account.</p>
//             </div>
//             <div className="flex gap-3">
//               <button onClick={() => setShowLogoutConfirm(false)}
//                 className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition text-sm">
//                 Cancel
//               </button>
//               <button onClick={handleLogout}
//                 className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition text-sm">
//                 Yes, Sign Out
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Customer Auth Modal */}
//       <CustomerAuthModal
//         isOpen={isCustomerModalOpen}
//         onClose={() => setIsCustomerModalOpen(false)}
//         defaultMode={customerModalMode}
//       />
//     </>
//   );
// }






























'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import CustomerAuthModal from '../components/CustomerAuthModal';
import { ChevronDown, Menu, X, LogOut, LayoutDashboard, User } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const {
    user, userType, logout, isProvider, isCustomer,
    getDashboardLink, getUserDisplayName, getUserInitials
  } = useAuth();

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerModalMode, setCustomerModalMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [proDropdownOpen, setProDropdownOpen] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const proRef = useRef(null);
  const loginRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (proRef.current && !proRef.current.contains(e.target)) setProDropdownOpen(false);
      if (loginRef.current && !loginRef.current.contains(e.target)) setLoginDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openCustomerModal = (mode = 'login') => {
    setCustomerModalMode(mode);
    setIsCustomerModalOpen(true);
    setMobileMenuOpen(false);
    setLoginDropdownOpen(false);
  };

  const goToProLogin = () => { router.push('/provider/login'); setMobileMenuOpen(false); setProDropdownOpen(false); };
  const goToProSignup = () => { router.push('/provider/signup'); setMobileMenuOpen(false); setProDropdownOpen(false); };
  const handleLogout = () => { logout(true); setShowLogoutConfirm(false); };

  return (
    <>
      <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <nav className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="text-2xl font-extrabold text-green-700 hover:text-green-800 transition tracking-tight flex-shrink-0">
            WorkOnTap
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {(!user || !isProvider()) && (
              <Link href="/services" className="text-gray-600 hover:text-green-700 transition">
                Explore Services
              </Link>
            )}
            {user && (
              <Link href={getDashboardLink()} className="text-gray-600 hover:text-green-700 transition">
                {isProvider() ? 'Dashboard' : 'My Bookings'}
              </Link>
            )}
            <Link href="/help" className="text-gray-600 hover:text-green-700 transition">
              Help Center
            </Link>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Avatar + name → links to profile (customers) or dashboard (providers) */}
                <Link
                  href={isProvider() ? getDashboardLink() : '/profile'}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${isProvider() ? 'bg-blue-600' : 'bg-green-600'}`}>
                    {getUserInitials()}
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</span>
                    <span className={`text-xs font-medium ${isProvider() ? 'text-blue-500' : 'text-green-600'}`}>
                      {isProvider() ? 'Pro Account' : 'Customer'}
                    </span>
                  </div>
                </Link>

                {/* Logout */}
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">

                {/* Log In dropdown */}
                <div className="relative" ref={loginRef}>
                  <button
                    onClick={() => { setLoginDropdownOpen(p => !p); setProDropdownOpen(false); }}
                    className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-green-700 px-3 py-2 rounded-xl hover:bg-gray-50 transition"
                  >
                    Log In <ChevronDown className={`h-3.5 w-3.5 transition-transform ${loginDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {loginDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      <div className="p-1.5">
                        <button onClick={() => openCustomerModal('login')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl transition text-left">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Customer Login</p>
                            <p className="text-xs text-gray-400">Book services</p>
                          </div>
                        </button>
                        <button onClick={goToProLogin}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition text-left">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <LayoutDashboard className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Pro Login</p>
                            <p className="text-xs text-gray-400">Manage your jobs</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Sign Up dropdown */}
                <div className="relative" ref={proRef}>
                  <button
                    onClick={() => { setProDropdownOpen(p => !p); setLoginDropdownOpen(false); }}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition shadow-sm shadow-green-200"
                  >
                    Sign Up <ChevronDown className={`h-3.5 w-3.5 transition-transform ${proDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {proDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      <div className="p-1.5">
                        <button onClick={() => openCustomerModal('signup')}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-xl transition text-left">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Customer Sign Up</p>
                            <p className="text-xs text-gray-400">Book services near you</p>
                          </div>
                        </button>
                        <button onClick={goToProSignup}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition text-left">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <LayoutDashboard className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-semibold">Become a Pro</p>
                            <p className="text-xs text-gray-400">Start earning today</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition"
            onClick={() => setMobileMenuOpen(p => !p)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* ── Mobile Menu ── */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-2">
            {(!user || !isProvider()) && (
              <Link href="/services" onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-700 rounded-xl transition">
                Explore Services
              </Link>
            )}
            {user && (
              <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-700 rounded-xl transition">
                {isProvider() ? 'Dashboard' : 'My Bookings'}
              </Link>
            )}
            <Link href="/help" onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-green-700 rounded-xl transition">
              Help Center
            </Link>

            <div className="border-t border-gray-100 pt-3 mt-1">
              {user ? (
                <div className="space-y-2">
                  {/* Mobile: avatar card links to profile */}
                  <Link
                    href={isProvider() ? getDashboardLink() : '/profile'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${isProvider() ? 'bg-blue-600' : 'bg-green-600'}`}>
                      {getUserInitials()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{getUserDisplayName()}</p>
                      <p className={`text-xs font-medium ${isProvider() ? 'text-blue-500' : 'text-green-600'}`}>
                        {isProvider() ? 'Pro Account' : 'View Profile →'}
                      </p>
                    </div>
                  </Link>
                  <button onClick={() => { setMobileMenuOpen(false); setShowLogoutConfirm(true); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-xl transition">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-100 rounded-2xl p-3 space-y-2">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wider px-1">For Customers</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => openCustomerModal('login')}
                        className="py-2.5 text-sm font-semibold text-green-700 border-2 border-green-600 rounded-xl hover:bg-green-100 transition">
                        Log In
                      </button>
                      <button onClick={() => openCustomerModal('signup')}
                        className="py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition">
                        Sign Up
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-1">For Professionals</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={goToProLogin}
                        className="py-2.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-100 transition">
                        Pro Login
                      </button>
                      <button onClick={goToProSignup}
                        className="py-2.5 text-sm font-semibold text-white bg-gray-800 hover:bg-gray-900 rounded-xl transition">
                        Become a Pro
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── Logout Confirm Modal ── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Sign out?</h3>
              <p className="text-sm text-gray-500">You&apos;ll need to log in again to access your account.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition text-sm">
                Cancel
              </button>
              <button onClick={handleLogout}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition text-sm">
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Auth Modal */}
      <CustomerAuthModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        defaultMode={customerModalMode}
      />
    </>
  );
}