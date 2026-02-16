

// // src/components/Header.js
// 'use client';

// import Link from 'next/link';
// import { useState } from 'react';
// import { useAuth } from 'src/context/AuthContext';
// import ProLoginModal from './ProLoginModal';
// import ProSignupModal from './ProSignupModal';


// export default function Header() {
//   const { user, logout } = useAuth();
//   const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
//   const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

//   const handleLogout = () => {
//     logout();
//     setShowLogoutConfirm(false);
//   };

//   return (
//     <>
//       <header className="bg-gradient-to-r from-green-800 to-green-700 text-white shadow-md sticky top-0 z-50">
//         <nav className="container mx-auto px-4 lg:px-6 py-4">
//           <div className="flex items-center justify-between flex-wrap">
//             {/* Logo */}
//             <Link href="/" className="text-2xl lg:text-3xl font-extrabold tracking-tight drop-shadow-sm">
//               WorkOnTap
//             </Link>

//             {/* Desktop Navigation */}
//             <div className="hidden md:flex items-center space-x-5 lg:space-x-7 text-sm lg:text-base font-medium">
//               <Link href="/services" className="hover:text-green-100 transition duration-200 border-b-2 border-transparent hover:border-white pb-1">
//                 Explore Services
//               </Link>
//               <Link href="/help" className="hover:text-green-100 transition duration-200 border-b-2 border-transparent hover:border-white pb-1">
//                 Help Center
//               </Link>
//             </div>

//             {/* Desktop Auth Buttons */}
//             <div className="hidden md:flex items-center space-x-3 lg:space-x-5">
//               {user ? (
//                 // Logged in - Show user info and logout
//                 <div className="flex items-center space-x-4">
//                   <div className="flex items-center space-x-2">
//                     <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
//                       {user.first_name?.[0]}{user.last_name?.[0]}
//                     </div>
//                     <span className="text-sm font-medium">{user.first_name} {user.last_name}</span>
//                   </div>
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
//                     className="text-sm lg:text-base font-medium hover:text-green-100 px-3 py-2 rounded-lg hover:bg-green-700/50 transition"
//                   >
//                     Pro Login
//                   </button>
//                   <button
//                     onClick={() => setIsSignupModalOpen(true)}
//                     className="bg-white text-green-800 px-5 py-2 rounded-full text-sm lg:text-base font-semibold shadow-md hover:shadow-lg hover:bg-green-50 transition duration-200"
//                   >
//                     Become a Pro
//                   </button>
//                 </>
//               )}
//             </div>

//             {/* Mobile Menu Button */}
//             <button 
//               className="block md:hidden text-2xl focus:outline-none p-2 hover:bg-green-700 rounded-lg transition"
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               aria-label="Toggle menu"
//             >
//               {mobileMenuOpen ? '✕' : '☰'}
//             </button>
//           </div>

//           {/* Mobile Menu */}
//           {mobileMenuOpen && (
//             <div className="md:hidden mt-4 pt-4 border-t border-green-600/30 animate-fadeIn">
//               <div className="flex flex-col space-y-3 pb-3">
//                 <Link 
//                   href="/services" 
//                   className="text-white hover:bg-green-700 px-4 py-3 rounded-lg transition font-medium"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Explore Services
//                 </Link>
//                 <Link 
//                   href="/help" 
//                   className="text-white hover:bg-green-700 px-4 py-3 rounded-lg transition font-medium"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   Help Center
//                 </Link>
//                 <div className="border-t border-green-600/30 my-2"></div>

//                 {user ? (
//                   // Mobile - Logged in
//                   <>
//                     <div className="px-4 py-3 text-white flex items-center space-x-3">
//                       <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
//                         {user.first_name?.[0]}{user.last_name?.[0]}
//                       </div>
//                       <div>
//                         <p className="font-medium">{user.first_name} {user.last_name}</p>
//                         <p className="text-xs text-green-200">{user.email}</p>
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
//                       className="text-white hover:bg-green-700 px-4 py-3 rounded-lg transition font-medium text-left"
//                     >
//                       Pro Login
//                     </button>
//                     <button
//                       onClick={() => {
//                         setMobileMenuOpen(false);
//                         setIsSignupModalOpen(true);
//                       }}
//                       className="bg-white text-green-800 px-4 py-3 rounded-lg font-semibold hover:bg-green-50 transition text-center"
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
//                 Are you sure you want to logout? You'll need to login again to access your account.
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

//       {/* Modals */}
//       <ProLoginModal 
//         isOpen={isLoginModalOpen}
//         onClose={() => setIsLoginModalOpen(false)}
//         onSwitchToSignup={() => {
//           setIsLoginModalOpen(false);
//           setIsSignupModalOpen(true);
//         }}
//       />
//       <ProSignupModal 
//         isOpen={isSignupModalOpen}
//         onClose={() => setIsSignupModalOpen(false)}
//         onSwitchToLogin={() => {
//           setIsSignupModalOpen(false);
//           setIsLoginModalOpen(true);
//         }}
//       />
//     </>
//   );
// }


// src/components/Header.js
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from 'src/context/AuthContext';
import ProLoginModal from './ProLoginModal';
import ProSignupModal from './ProSignupModal';

export default function Header() {
  const { user, logout } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <header className="bg-gradient-to-r from-green-800 to-green-700 text-white shadow-md sticky top-0 z-50">
        <nav className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap">
            {/* Logo */}
            <Link href="/" className="text-2xl lg:text-3xl font-extrabold tracking-tight drop-shadow-sm">
              WorkOnTap
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-5 lg:space-x-7 text-sm lg:text-base font-medium">
              <Link href="/services" className="hover:text-green-100 transition duration-200 border-b-2 border-transparent hover:border-white pb-1">
                Explore Services
              </Link>
              {user && (
                <Link href="/my-bookings" className="hover:text-green-100 transition duration-200 border-b-2 border-transparent hover:border-white pb-1">
                  My Bookings
                </Link>
              )}
              <Link href="/help" className="hover:text-green-100 transition duration-200 border-b-2 border-transparent hover:border-white pb-1">
                Help Center
              </Link>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-5">
              {user ? (
                // Logged in - Show user info and logout
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.first_name?.[0]}{user.last_name?.[0]}
                    </div>
                    <span className="text-sm font-medium">{user.first_name} {user.last_name}</span>
                  </div>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md hover:shadow-lg flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                // Not logged in - Show login/signup buttons
                <>
                  <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="text-sm lg:text-base font-medium hover:text-green-100 px-3 py-2 rounded-lg hover:bg-green-700/50 transition"
                  >
                    Pro Login
                  </button>
                  <button
                    onClick={() => setIsSignupModalOpen(true)}
                    className="bg-white text-green-800 px-5 py-2 rounded-full text-sm lg:text-base font-semibold shadow-md hover:shadow-lg hover:bg-green-50 transition duration-200"
                  >
                    Become a Pro
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="block md:hidden text-2xl focus:outline-none p-2 hover:bg-green-700 rounded-lg transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-green-600/30 animate-fadeIn">
              <div className="flex flex-col space-y-3 pb-3">
                <Link
                  href="/services"
                  className="text-white hover:bg-green-700 px-4 py-3 rounded-lg transition font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Explore Services
                </Link>
                {user && (
                  <Link
                    href="/my-bookings"
                    className="text-white hover:bg-green-700 px-4 py-3 rounded-lg transition font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                )}
                <Link
                  href="/help"
                  className="text-white hover:bg-green-700 px-4 py-3 rounded-lg transition font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Help Center
                </Link>
                <div className="border-t border-green-600/30 my-2"></div>

                {user ? (
                  // Mobile - Logged in
                  <>
                    <div className="px-4 py-3 text-white flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-green-200">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition text-center flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  // Mobile - Not logged in
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsLoginModalOpen(true);
                      }}
                      className="text-white hover:bg-green-700 px-4 py-3 rounded-lg transition font-medium text-left"
                    >
                      Pro Login
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setIsSignupModalOpen(true);
                      }}
                      className="bg-white text-green-800 px-4 py-3 rounded-lg font-semibold hover:bg-green-50 transition text-center"
                    >
                      Become a Pro
                    </button>
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Logout Confirmation</h3>
              <p className="text-gray-600">
                Are you sure you want to logout? You&apos;ll need to login again to access your account.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition shadow-lg hover:shadow-xl"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <ProLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginModalOpen(false);
          setIsSignupModalOpen(true);
        }}
      />
      <ProSignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupModalOpen(false);
          setIsLoginModalOpen(true);
        }}
      />
    </>
  );
}