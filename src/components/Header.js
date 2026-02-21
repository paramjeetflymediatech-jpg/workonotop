




// 'use client';

// import Link from 'next/link';
// import { useState } from 'react';
// import { useAuth } from 'src/context/AuthContext';
// import ProLoginModal from './ProLoginModal';
// import ProSignupModal from './ProSignupModal';

// export default function Header() {
//   const { 
//     user, 
//     userType,
//     logout, 
//     login,
//     isProvider,
//     getDashboardLink,
//     getUserDisplayName,
//     getUserInitials 
//   } = useAuth();

//   const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
//   const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

//   const handleLogout = () => {
//     logout(true);
//     setShowLogoutConfirm(false);
//   };

//   // Handle successful provider login/signup - NOW UPDATES UI WITHOUT REFRESH
//   const handleProviderAuth = (userData, type) => {
//     // Use the login function from AuthContext to update the UI immediately
//     login(userData, type);

//     // Close modals
//     setIsLoginModalOpen(false);
//     setIsSignupModalOpen(false);
//   };

//   return (
//     <>
//       <header className="bg-white text-gray-900 shadow-md sticky top-0 z-50 border-b border-gray-200">
//         <nav className="container mx-auto px-4 lg:px-6 py-4">
//           <div className="flex items-center justify-between flex-wrap">
//             {/* Logo */}
//             <Link href="/" className="text-2xl lg:text-3xl font-extrabold tracking-tight text-green-700 hover:text-green-800 transition">
//               WorkOnTap
//             </Link>

//             {/* Desktop Navigation */}
//             <div className="hidden md:flex items-center space-x-5 lg:space-x-7 text-sm lg:text-base font-medium">
//               {/* Only show Explore Services if user is not a provider */}
//               {(!user || !isProvider()) && (
//                 <Link href="/services" className="text-gray-700 hover:text-green-700 transition duration-200 border-b-2 border-transparent hover:border-green-700 pb-1">
//                   Explore Services
//                 </Link>
//               )}
//               {user && (
//                 <Link 
//                   href={getDashboardLink()} 
//                   className="text-gray-700 hover:text-green-700 transition duration-200 border-b-2 border-transparent hover:border-green-700 pb-1"
//                 >
//                   {isProvider() ? 'Dashboard' : 'My Bookings'}
//                 </Link>
//               )}
//               <Link href="/help" className="text-gray-700 hover:text-green-700 transition duration-200 border-b-2 border-transparent hover:border-green-700 pb-1">
//                 Help Center
//               </Link>
//             </div>

//             {/* Desktop Auth Buttons */}
//             <div className="hidden md:flex items-center space-x-3 lg:space-x-5">
//               {user ? (
//                 // Logged in - Show user info and logout
//                 <div className="flex items-center space-x-4">
//                   <Link href={getDashboardLink()} className="flex items-center space-x-2 hover:opacity-80 transition">
//                     <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
//                       {getUserInitials()}
//                     </div>
//                     <span className="text-sm font-medium text-gray-900">
//                       {getUserDisplayName()}
//                     </span>
//                   </Link>
//                   <button
//                     onClick={() => setShowLogoutConfirm(true)}
//                     className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md hover:shadow-lg flex items-center space-x-1"
//                   >
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                     </svg>
//                     <span>Logout</span>
//                   </button>
//                 </div>
//               ) : (
//                 // Not logged in - Show login/signup buttons
//                 <>
//                   <button
//                     onClick={() => setIsLoginModalOpen(true)}
//                     className="text-sm lg:text-base font-medium text-gray-700 hover:text-green-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
//                   >
//                     Pro Login
//                   </button>
//                   <button
//                     onClick={() => setIsSignupModalOpen(true)}
//                     className="bg-green-700 text-white px-5 py-2 rounded-full text-sm lg:text-base font-semibold shadow-md hover:shadow-lg hover:bg-green-800 transition duration-200"
//                   >
//                     Become a Pro
//                   </button>
//                 </>
//               )}
//             </div>

//             {/* Mobile Menu Button */}
//             <button
//               className="block md:hidden text-2xl text-gray-700 focus:outline-none p-2 hover:bg-gray-100 rounded-lg transition"
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               aria-label="Toggle menu"
//             >
//               {mobileMenuOpen ? '✕' : '☰'}
//             </button>
//           </div>

//           {/* Mobile Menu */}
//           {mobileMenuOpen && (
//             <div className="md:hidden mt-4 pt-4 border-t border-gray-200 animate-fadeIn">
//               <div className="flex flex-col space-y-3 pb-3">
//                 {/* Only show Explore Services if user is not a provider */}
//                 {(!user || !isProvider()) && (
//                   <Link
//                     href="/services"
//                     className="text-gray-700 hover:bg-gray-100 hover:text-green-700 px-4 py-3 rounded-lg transition font-medium"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     Explore Services
//                   </Link>
//                 )}
//                 {user && (
//                   <Link
//                     href={getDashboardLink()}
//                     className="text-gray-700 hover:bg-gray-100 hover:text-green-700 px-4 py-3 rounded-lg transition font-medium"
//                     onClick={() => setMobileMenuOpen(false)}
//                   >
//                     {isProvider() ? 'Dashboard' : 'My Bookings'}
//                   </Link>
//                 )}
//                 <Link
//                   href="/help"
//                   className="text-gray-700 hover:bg-gray-100 hover:text-green-700 px-4 py-3 rounded-lg transition font-medium"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Help Center
//                 </Link>
//                 <div className="border-t border-gray-200 my-2"></div>

//                 {user ? (
//                   // Mobile - Logged in
//                   <>
//                     <div className="px-4 py-3 text-gray-900 flex items-center space-x-3 bg-gray-50 rounded-lg">
//                       <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
//                         {getUserInitials()}
//                       </div>
//                       <div>
//                         <p className="font-medium">{getUserDisplayName()}</p>
//                         <p className="text-xs text-gray-600">{user.email}</p>
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => {
//                         setMobileMenuOpen(false);
//                         setShowLogoutConfirm(true);
//                       }}
//                       className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition text-center flex items-center justify-center space-x-2"
//                     >
//                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                       </svg>
//                       <span>Logout</span>
//                     </button>
//                   </>
//                 ) : (
//                   // Mobile - Not logged in
//                   <>
//                     <button
//                       onClick={() => {
//                         setMobileMenuOpen(false);
//                         setIsLoginModalOpen(true);
//                       }}
//                       className="text-gray-700 hover:bg-gray-100 hover:text-green-700 px-4 py-3 rounded-lg transition font-medium text-left border border-gray-300"
//                     >
//                       Pro Login
//                     </button>
//                     <button
//                       onClick={() => {
//                         setMobileMenuOpen(false);
//                         setIsSignupModalOpen(true);
//                       }}
//                       className="bg-green-700 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-800 transition text-center shadow-md hover:shadow-lg"
//                     >
//                       Become a Pro
//                     </button>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}
//         </nav>
//       </header>

//       {/* Logout Confirmation Modal */}
//       {showLogoutConfirm && (
//         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
//           <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
//             <div className="text-center mb-6">
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//                 </svg>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-2">Logout Confirmation</h3>
//               <p className="text-gray-600">
//                 Are you sure you want to logout? You&apos;ll need to login again to access your account.
//               </p>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={handleLogout}
//                 className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition shadow-lg hover:shadow-xl"
//               >
//                 Yes, Logout
//               </button>
//               <button
//                 onClick={() => setShowLogoutConfirm(false)}
//                 className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modals with success handlers */}
//       <ProLoginModal
//         isOpen={isLoginModalOpen}
//         onClose={() => setIsLoginModalOpen(false)}
//         onSwitchToSignup={() => {
//           setIsLoginModalOpen(false);
//           setIsSignupModalOpen(true);
//         }}
//         onLoginSuccess={handleProviderAuth}
//       />
//       <ProSignupModal
//         isOpen={isSignupModalOpen}
//         onClose={() => setIsSignupModalOpen(false)}
//         onSwitchToLogin={() => {
//           setIsSignupModalOpen(false);
//           setIsLoginModalOpen(true);
//         }}
//         onSignupSuccess={handleProviderAuth}
//       />
//     </>
//   );
// }
















'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from 'src/context/AuthContext'; // ✅ adjust path if needed
import ProLoginModal from './ProLoginModal';
import ProSignupModal from './ProSignupModal';
import CustomerAuthModal from './CustomerAuthModal';

export default function Header() {
  const {
    user,
    userType,
    logout,
    login,
    isProvider,
    isCustomer,
    getDashboardLink,
    getUserDisplayName,
    getUserInitials
  } = useAuth();

  const [isProLoginModalOpen, setIsProLoginModalOpen] = useState(false);
  const [isProSignupModalOpen, setIsProSignupModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerModalMode, setCustomerModalMode] = useState('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout(true);
    setShowLogoutConfirm(false);
  };

  const openCustomerModal = (mode = 'login') => {
    setCustomerModalMode(mode);
    setIsCustomerModalOpen(true);
    setMobileMenuOpen(false);
  };

  // Handle successful provider login/signup
  const handleProviderAuth = (userData, type) => {
    login(userData, type);
    setIsProLoginModalOpen(false);
    setIsProSignupModalOpen(false);
  };

  return (
    <>
      <header className="bg-white text-gray-900 shadow-md sticky top-0 z-50 border-b border-gray-200">
        <nav className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap">
            {/* Logo */}
            <Link href="/" className="text-2xl lg:text-3xl font-extrabold tracking-tight text-green-700 hover:text-green-800 transition">
              WorkOnTap
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-5 lg:space-x-7 text-sm lg:text-base font-medium">
              {(!user || !isProvider()) && (
                <Link href="/services" className="text-gray-700 hover:text-green-700 transition duration-200 border-b-2 border-transparent hover:border-green-700 pb-1">
                  Explore Services
                </Link>
              )}
              {user && (
                <Link
                  href={getDashboardLink()}
                  className="text-gray-700 hover:text-green-700 transition duration-200 border-b-2 border-transparent hover:border-green-700 pb-1"
                >
                  {isProvider() ? 'Dashboard' : 'My Bookings'}
                </Link>
              )}
              <Link href="/help" className="text-gray-700 hover:text-green-700 transition duration-200 border-b-2 border-transparent hover:border-green-700 pb-1">
                Help Center
              </Link>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              {user ? (
                // Logged in - Show user info and logout
                <div className="flex items-center space-x-3">
                  {/* User badge */}
                  <Link href={getDashboardLink()} className="flex items-center space-x-2 hover:opacity-80 transition">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${isProvider() ? 'bg-blue-600' : 'bg-green-600'}`}>
                      {getUserInitials()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 leading-none">
                        {getUserDisplayName()}
                      </span>
                      <span className={`text-xs font-medium ${isProvider() ? 'text-blue-600' : 'text-green-600'}`}>
                        {isProvider() ? 'Pro Account' : 'Customer'}
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                // Not logged in — show both customer + pro options
                <div className="flex items-center space-x-2">
                  {/* Customer login */}
                  <button
                    onClick={() => openCustomerModal('login')}
                    className="text-sm font-medium text-gray-700 hover:text-green-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => openCustomerModal('signup')}
                    className="text-sm font-semibold text-green-700 border-2 border-green-600 px-4 py-2 rounded-full hover:bg-green-50 transition"
                  >
                    Sign Up
                  </button>

                  {/* Divider */}
                  <div className="w-px h-6 bg-gray-300 mx-1"></div>

                  {/* Pro options */}
                  <button
                    onClick={() => setIsProLoginModalOpen(true)}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 px-2 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    Pro Login
                  </button>
                  <button
                    onClick={() => setIsProSignupModalOpen(true)}
                    className="bg-green-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow hover:bg-green-800 transition"
                  >
                    Become a Pro
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="block md:hidden text-2xl text-gray-700 focus:outline-none p-2 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2 pb-3">
                {(!user || !isProvider()) && (
                  <Link href="/services"
                    className="text-gray-700 hover:bg-gray-100 hover:text-green-700 px-4 py-3 rounded-lg transition font-medium"
                    onClick={() => setMobileMenuOpen(false)}>
                    Explore Services
                  </Link>
                )}
                {user && (
                  <Link href={getDashboardLink()}
                    className="text-gray-700 hover:bg-gray-100 hover:text-green-700 px-4 py-3 rounded-lg transition font-medium"
                    onClick={() => setMobileMenuOpen(false)}>
                    {isProvider() ? 'Dashboard' : 'My Bookings'}
                  </Link>
                )}
                <Link href="/help"
                  className="text-gray-700 hover:bg-gray-100 hover:text-green-700 px-4 py-3 rounded-lg transition font-medium"
                  onClick={() => setMobileMenuOpen(false)}>
                  Help Center
                </Link>

                <div className="border-t border-gray-200 my-1 pt-1"></div>

                {user ? (
                  // Mobile - Logged in
                  <>
                    <div className="px-4 py-3 flex items-center space-x-3 bg-gray-50 rounded-xl">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${isProvider() ? 'bg-blue-600' : 'bg-green-600'}`}>
                        {getUserInitials()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{getUserDisplayName()}</p>
                        <p className={`text-xs font-medium ${isProvider() ? 'text-blue-600' : 'text-green-600'}`}>
                          {isProvider() ? 'Pro Account' : 'Customer'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setMobileMenuOpen(false); setShowLogoutConfirm(true); }}
                      className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl font-semibold transition flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  // Mobile - Not logged in
                  <>
                    {/* Customer section */}
                    <div className="bg-green-50 rounded-xl p-3 space-y-2">
                      <button onClick={() => openCustomerModal('login')}
                        className="w-full text-green-700 border-2 border-green-600 px-4 py-2.5 rounded-lg font-semibold hover:bg-green-100 transition text-sm">
                        Log In
                      </button>
                      <button onClick={() => openCustomerModal('signup')}
                        className="w-full bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-green-800 transition text-sm">
                        Sign Up
                      </button>
                    </div>

                    {/* Pro section */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-1">For Professionals</p>
                      <button onClick={() => { setMobileMenuOpen(false); setIsProLoginModalOpen(true); }}
                        className="w-full text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition text-sm">
                        Pro Login
                      </button>
                      <button onClick={() => { setMobileMenuOpen(false); setIsProSignupModalOpen(true); }}
                        className="w-full bg-gray-800 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-900 transition text-sm">
                        Become a Pro
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Logout?</h3>
              <p className="text-sm text-gray-600">You&apos;ll need to log in again to access your account.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-semibold transition">
                Yes, Logout
              </button>
              <button onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-xl font-semibold transition">
                Cancel
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

      {/* Pro Modals */}
      <ProLoginModal
        isOpen={isProLoginModalOpen}
        onClose={() => setIsProLoginModalOpen(false)}
        onSwitchToSignup={() => { setIsProLoginModalOpen(false); setIsProSignupModalOpen(true); }}
        onLoginSuccess={handleProviderAuth}
      />
      <ProSignupModal
        isOpen={isProSignupModalOpen}
        onClose={() => setIsProSignupModalOpen(false)}
        onSwitchToLogin={() => { setIsProSignupModalOpen(false); setIsProLoginModalOpen(true); }}
        onSignupSuccess={handleProviderAuth}
      />
    </>
  );
}