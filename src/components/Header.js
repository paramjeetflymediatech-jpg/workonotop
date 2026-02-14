// src/components/Header.js
'use client';

import Link from 'next/link';
import { useState } from 'react';
import ProLoginModal from './ProLoginModal';
import ProSignupModal from './ProSignupModal';

export default function Header() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              <Link href="/help" className="hover:text-green-100 transition duration-200 border-b-2 border-transparent hover:border-white pb-1">
                Help Center
              </Link>
            </div>
            
            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-5">
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
                <Link 
                  href="/help" 
                  className="text-white hover:bg-green-700 px-4 py-3 rounded-lg transition font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Help Center
                </Link>
                <div className="border-t border-green-600/30 my-2"></div>
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
              </div>
            </div>
          )}
        </nav>
      </header>

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