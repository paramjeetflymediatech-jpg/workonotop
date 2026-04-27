'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAdminTheme } from '../app/admin/layout'

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { isDarkMode, toggleTheme } = useAdminTheme()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [openDisputeCount, setOpenDisputeCount] = useState(0)

  useEffect(() => {
    setIsMounted(true)
    const savedCollapsed = localStorage.getItem('sidebarCollapsed')
    if (savedCollapsed) {
      setIsCollapsed(savedCollapsed === 'true')
    }

    const handleToggleMobile = () => {
      setIsMobileOpen(prev => !prev)
    }
    window.addEventListener('toggleMobileSidebar', handleToggleMobile)

    // Fetch open dispute count for badge
    fetch('/api/admin/disputes')
      .then(r => r.json())
      .then(d => {
        if (d.success) setOpenDisputeCount(d.data.summary.open_count || 0)
      })
      .catch(() => { })

    return () => {
      window.removeEventListener('toggleMobileSidebar', handleToggleMobile)
    }
  }, [])

  const handleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', newState.toString())
    window.dispatchEvent(new Event('sidebarCollapsed'))
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }


  const menuItems = [
    {
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: '/admin',
      badge: null
    },
    {
      name: 'Job Requests',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      path: '/admin/jobs',
      badge: null
    },
    {
      name: 'Users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      path: '/admin/users',
      badge: null
    },
    {
      name: 'Providers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      path: '/admin/providers',
      badge: null
    },
    {
      name: 'Categories',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      path: '/admin/categories',
      badge: null
    },
    {
      name: 'Services',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      path: '/admin/services',
      badge: null
    },
    {
      name: 'Reviews',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      path: '/admin/reviews',
      badge: null
    },
    {
      name: 'Analytics',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      path: '/admin/analytics',
      badge: null
    },
    {
      name: 'Earnings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      path: '/admin/payouts',
      badge: null
    },
    // ── Disputes ──────────────────────────────────────────────────────────────
    {
      name: 'Disputes',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      ),
      path: '/admin/disputes',
      badge: openDisputeCount > 0 ? String(openDisputeCount) : null,
      badgeRed: true
    },
    {
      name: 'Deletion Requests',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      path: '/admin/deletion-requests',
      badge: null
    },
    {
      name: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      path: '/admin/settings',
      badge: null
    }
  ]

  if (!isMounted) {
    return null
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[90]"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar - DO NOT REMOVE flex-col, it fixes logout button visibility/overlap on smaller screens */}
      <div
        className={`fixed left-0 top-0 h-screen border-r z-[95] overflow-hidden flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          width: isCollapsed ? '80px' : '256px',
          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
          borderColor: isDarkMode ? '#1e293b' : '#e2e8f0',
        }}
      >
        {/* Logo Section with Collapse Button */}
        <div
          className="flex items-center h-20 border-b"
          style={{
            borderBottomColor: isDarkMode ? '#1e293b' : '#e2e8f0',
            paddingLeft: isCollapsed ? '0' : '20px',
            paddingRight: isCollapsed ? '0' : '20px',
            justifyContent: isCollapsed ? 'center' : 'space-between'
          }}
        >
          {!isCollapsed ? (
            <div className="flex-1 min-w-0">
              <Link href="/admin">
                <Image src={isDarkMode ? "/logo2.png" : "/logo.png"} alt="Logo" width={140} height={45} className="object-contain" />
              </Link>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <Link href="/admin">
                <Image src={isDarkMode ? "/logo2.png" : "/logo.png"} alt="Logo" width={32} height={32} className="object-contain" />
              </Link>
            </div>
          )}

          {!isCollapsed && (
            <button onClick={handleCollapse} className="hidden lg:block p-2 rounded-lg transition-colors flex-shrink-0 ml-2"
              style={{ color: isDarkMode ? '#94a3b8' : '#475569', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDarkMode ? '#1e293b' : '#f1f5f9'; e.currentTarget.style.color = isDarkMode ? '#ffffff' : '#0f172a' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#475569' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}

          {isCollapsed && (
            <button onClick={handleCollapse} className="hidden lg:block p-2 rounded-lg transition-colors flex-shrink-0 absolute right-2"
              style={{ color: isDarkMode ? '#94a3b8' : '#475569', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDarkMode ? '#1e293b' : '#f1f5f9'; e.currentTarget.style.color = isDarkMode ? '#ffffff' : '#0f172a' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#475569' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation Menu - Using flex flex-col and flex-1 to push footer to bottom naturally */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin overflow-x-hidden" style={{
          scrollbarColor: isDarkMode ? '#475569 #1e293b' : '#94a3b8 #f1f5f9',
          paddingLeft: isCollapsed ? '8px' : '16px',
          paddingRight: isCollapsed ? '8px' : '16px'
        }}>
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.path ||
                (item.path !== '/admin' && pathname?.startsWith(item.path + '/'))
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className="w-full flex items-center rounded-lg transition-all duration-200 no-underline"
                  style={{
                    background: isActive ? 'linear-gradient(to right, #15843E, #06b6d4)' : 'transparent',
                    color: isActive ? '#ffffff' : isDarkMode ? '#94a3b8' : '#475569',
                    padding: isCollapsed ? '12px' : '12px 16px',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    gap: isCollapsed ? '0' : '12px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = isDarkMode ? '#1e293b' : '#f1f5f9'
                      e.currentTarget.style.color = isDarkMode ? '#ffffff' : '#0f172a'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#475569'
                    }
                  }}
                >
                  <span style={{ color: isActive ? '#ffffff' : 'inherit', position: 'relative' }}>
                    {item.icon}
                    {/* Red dot on icon when collapsed */}
                    {isCollapsed && item.badge && item.badgeRed && (
                      <span style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        width: '8px', height: '8px', borderRadius: '50%',
                        backgroundColor: '#ef4444', display: 'block'
                      }} />
                    )}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left font-medium truncate">{item.name}</span>
                      {item.badge && (
                        <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 font-bold
                          ${item.badgeRed
                            ? 'bg-red-500 text-white'
                            : 'bg-teal-500/20 text-teal-600'
                          }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Bottom Section - Now part of flexbox flow (mt-auto) */}
        <div className="mt-auto border-t pb-safe" style={{
          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
          borderTopColor: isDarkMode ? '#1e293b' : '#e2e8f0',
          padding: isCollapsed ? '16px 8px' : '16px'
        }}>
          <button onClick={handleLogout} className="w-full flex items-center rounded-lg transition-all duration-200"
            style={{
              color: isDarkMode ? '#94a3b8' : '#475569',
              background: 'transparent',
              padding: isCollapsed ? '12px' : '12px 16px', // Restored padding
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              gap: isCollapsed ? '0' : '12px'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = isDarkMode ? '#1e293b' : '#f1f5f9'; e.currentTarget.style.color = isDarkMode ? '#ffffff' : '#0f172a' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#475569' }}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span className="flex-1 text-left font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </>
  )
}