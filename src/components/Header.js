'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'src/context/AuthContext';
import CustomerAuthModal from './CustomerAuthModal';

export default function Header() {
  const router = useRouter();
  const {
    user,
    userType,
    logout,
    isProvider,
    isCustomer,
    getDashboardLink,
    getUserDisplayName,
    getUserInitials
  } = useAuth();

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

  // Provider links - page par jayenge, modal nahi
  const goToProLogin = () => {
    router.push('/provider/login');
    setMobileMenuOpen(false);
  };

  const goToProSignup = () => {
    router.push('/provider/signup');
    setMobileMenuOpen(false);
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
                  {/* Customer login - Modal */}
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

                  {/* 🔴 FIX: Pro options - Page par jayenge (modal nahi) */}
                  <button
                    onClick={goToProLogin}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 px-2 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    Pro Login
                  </button>
                  <button
                    onClick={goToProSignup}
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
                    {/* Customer section - Modal */}
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

                    {/* 🔴 FIX: Pro section - Page par jayenge */}
                    <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-1">For Professionals</p>
                      <button onClick={goToProLogin}
                        className="w-full text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition text-sm">
                        Pro Login
                      </button>
                      <button onClick={goToProSignup}
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

      {/* Customer Auth Modal - Sirf customer ke liye */}
      <CustomerAuthModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        defaultMode={customerModalMode}
      />
    </>
  );
}