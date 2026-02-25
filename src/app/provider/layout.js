'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Briefcase, DollarSign, User, LogOut, Menu, X } from 'lucide-react';

export default function ProviderLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const publicPaths = [
    '/provider/login', 
    '/provider/signup', 
    '/provider/verify-email', 
    '/provider/verify-email-pending', 
    '/provider/onboarding', 
    '/provider/pending',
    '/provider/rejected'  // 👈 ADDED rejected page
  ];

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    try {
      // Allow public paths without auth
      if (publicPaths.includes(pathname)) {
        setLoading(false);
        return;
      }

      const res = await fetch('/api/provider/me');
      const data = await res.json();

      if (!data.success || !data.provider) {
        router.push('/provider/login');
        return;
      }

      setProvider(data.provider);

      // 🔴 IMPORTANT: Check if rejected first
      if (data.provider.status === 'rejected') {
        console.log('🚫 Provider is rejected, redirecting to rejected page');
        router.push('/provider/rejected');
        return;
      }

      // ✅ Your existing redirect logic
      if (!data.provider.email_verified) {
        router.push('/provider/verify-email-pending');
      } 
      else if (data.provider.status === 'active' && data.provider.onboarding_completed) {
        if (pathname !== '/provider/dashboard') router.push('/provider/dashboard');
      } 
      else if (data.provider.onboarding_completed === 1 && data.provider.status !== 'active') {
        if (pathname !== '/provider/pending') router.push('/provider/pending');
      } 
      else if (data.provider.onboarding_completed === 0) {
        if (pathname !== '/provider/onboarding') router.push('/provider/onboarding');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      if (!publicPaths.includes(pathname)) router.push('/provider/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  // Don't show navbar on public pages
  if (publicPaths.includes(pathname)) {
    return children;
  }

  const navItems = [
    { href: '/provider/dashboard', label: 'Dashboard', icon: Home },
    { href: '/provider/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/provider/earnings', label: 'Earnings', icon: DollarSign },
    { href: '/provider/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/provider/dashboard" className="flex items-center">
                <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  WorkOnTap
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
              
              <div className="h-6 w-px bg-slate-200 mx-2" />
              
              <span className="text-sm text-slate-600">{provider?.name}</span>
              
              <button
                onClick={async () => {
                  await fetch('/api/provider/logout', { method: 'POST' });
                  router.push('/provider/login');
                }}
                className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
              
              <div className="border-t border-slate-200 my-2 pt-2">
                <div className="px-3 py-2 text-sm text-slate-600">
                  Signed in as <span className="font-medium">{provider?.name}</span>
                </div>
                <button
                  onClick={async () => {
                    await fetch('/api/provider/logout', { method: 'POST' });
                    router.push('/provider/login');
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}