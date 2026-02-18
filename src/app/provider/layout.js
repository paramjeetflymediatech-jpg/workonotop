'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from 'src/context/AuthContext'
import Image from 'next/image'

export default function ProviderLayout({ children }) {
  const router   = useRouter()
  const pathname = usePathname()
  const { user, loading, logout } = useAuth()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [cityChecked, setCityChecked]   = useState(false)
  const [hasCity, setHasCity]           = useState(false)

  // ── Load saved avatar ─────────────────────────────────────────────────────
  useEffect(() => {
    const img = localStorage.getItem('providerProfileImage')
    if (img) setProfileImage(img)
  }, [user])

  // ── Auth guard ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) router.push('/')
  }, [loading, user, router])

  // ── City guard — check provider city from API ─────────────────────────────
  useEffect(() => {
    if (!user) return
    const isProfilePage = pathname === '/provider/profile'
    if (isProfilePage) { setCityChecked(true); return }   // always allow profile

    const token = localStorage.getItem('providerToken')
    fetch('/api/provider/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        const city = data?.data?.city?.trim()
        if (city) {
          setHasCity(true)
        } else {
          setHasCity(false)
          router.replace('/provider/profile')
        }
      })
      .catch(() => setHasCity(false))
      .finally(() => setCityChecked(true))
  }, [user, pathname])

  const handleLogout = () => {
    setIsMobileOpen(false)
    logout(true)
  }

  const menuItems = [
    { name: 'Dashboard',      href: '/provider/dashboard',      icon: '📊' },
    { name: 'Available Jobs', href: '/provider/available-jobs', icon: '🗂️' },
    { name: 'My Jobs',        href: '/provider/jobs',           icon: '📋' },
    // { name: 'Schedule',       href: '/provider/schedule',       icon: '📅' },
    // { name: 'Earnings',       href: '/provider/earnings',       icon: '💰' },
    // { name: 'Messages',       href: '/provider/messages',       icon: '💬' },
    { name: 'Profile',        href: '/provider/profile',        icon: '👤' },
  ]

  if (loading || !cityChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" />
      </div>
    )
  }

  if (!user) return null

  const isProfilePage = pathname === '/provider/profile'
  const avatarLetter  = user?.name?.charAt(0)?.toUpperCase() || 'P'

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 fixed top-0 left-0 right-0 z-40 flex items-center justify-between shadow-sm">
        <button onClick={() => setIsMobileOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-xl transition" aria-label="Open menu">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <span className="text-lg font-bold text-gray-900">WorkOnTap</span>

        <Link href="/provider/profile" className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-green-500">
          {profileImage
            ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">{avatarLetter}</div>
          }
        </Link>
      </div>

      {/* ── Mobile overlay ── */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full bg-white z-50 transition-transform duration-300 ease-in-out
        w-72 lg:w-64 lg:translate-x-0 border-r border-gray-100
        ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'}
      `}>
        <div className="h-full flex flex-col overflow-hidden">

          {/* Logo */}
          <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">WorkOnTap</h1>
              <p className="text-xs text-gray-400 mt-0.5">Provider Portal</p>
            </div>
            <button onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Provider card */}
          <Link href="/provider/profile" onClick={() => setIsMobileOpen(false)}
            className="mx-3 mt-3 p-3 rounded-xl hover:bg-gray-50 transition flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-green-100 group-hover:ring-green-300 transition">
              {profileImage
                ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-green-600 flex items-center justify-center text-white font-bold">{avatarLetter}</div>
              }
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900 truncate text-sm">{user?.name || 'Provider'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* City missing warning in sidebar */}
          {!hasCity && !isProfilePage && (
            <div className="mx-3 mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-700 font-medium">⚠️ Set your city to access all features</p>
            </div>
          )}

          {/* Nav */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              const isLocked = !hasCity && item.href !== '/provider/profile'

              return (
                <Link key={item.name} href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium relative
                    ${isActive
                      ? 'bg-green-600 text-white shadow-sm shadow-green-200'
                      : isLocked
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  `}>
                  <span className="text-base">{item.icon}</span>
                  <span className="flex-1">{item.name}</span>
                  {isLocked && !isActive && (
                    <svg className="w-3.5 h-3.5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                    </svg>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="px-3 pb-4 pt-2 border-t border-gray-100">
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 rounded-xl hover:bg-red-50 transition text-sm font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

        </div>
      </aside>

      {/* ── Main ── */}
      <main className="lg:ml-64 min-h-screen">
        <div className="pt-[60px] lg:pt-0">

          {/* City gate — full screen block if not on profile and no city */}
          {!hasCity && !isProfilePage ? (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📍</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">City Required</h2>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  Please set your city in your profile so we can show you available jobs in your area and unlock all dashboard features.
                </p>
                <Link href="/provider/profile"
                  className="inline-block w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition text-sm">
                  Go to Profile → Set City
                </Link>
              </div>
            </div>
          ) : children}

        </div>
      </main>

    </div>
  )
}