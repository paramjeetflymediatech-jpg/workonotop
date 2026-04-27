




'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Search, ArrowLeft, ChevronRight } from 'lucide-react'
import ChatBox from '@/components/ChatBox'

export default function ProviderChats() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeBooking, setActiveBooking] = useState(null)
  const [view, setView] = useState('list') // 'list' or 'chat'
  const [search, setSearch] = useState('')
  const [isDesktop, setIsDesktop] = useState(false)
  const didInit = useRef(false)

  // Detect screen size
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    loadBookings()
    const t = setInterval(refreshBookings, 10000)
    return () => clearInterval(t)
  }, [])

  const loadBookings = async () => {
    try {
      const res = await fetch('/api/provider/bookings?status=confirmed,in_progress')
      const data = await res.json()
      if (data.success) {
        const list = data.bookings || []
        setBookings(list)
        if (!didInit.current && list.length > 0) {
          didInit.current = true
          setActiveBooking(list[0])
        }
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  // Silent refresh — never resets UI state
  const refreshBookings = async () => {
    try {
      const res = await fetch('/api/provider/bookings?status=confirmed,in_progress')
      const data = await res.json()
      if (data.success) setBookings(data.bookings || [])
    } catch (e) { console.error(e) }
  }

  const openChat = (booking) => {
    setActiveBooking(booking)
    setView('chat')
  }

  const filtered = bookings.filter(b =>
    b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.service_name?.toLowerCase().includes(search.toLowerCase())
  )

  const statusBadge = (status) => {
    if (status === 'confirmed') return 'bg-blue-50 text-blue-600 border-blue-100'
    if (status === 'in_progress') return 'bg-violet-50 text-violet-600 border-violet-100'
    return 'bg-gray-50 text-gray-500 border-gray-100'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-[3px] border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (bookings.length === 0) return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 7rem)' }}>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-green-600" />
        <h1 className="text-xl font-bold text-gray-900">Messages</h1>
      </div>
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3">
        <MessageSquare className="w-10 h-10 text-gray-200" />
        <p className="font-semibold text-gray-600">No active conversations</p>
        <p className="text-sm text-gray-400">Accept a job to start chatting</p>
      </div>
    </div>
  )

  // On desktop: show both panels. On mobile: show one at a time.
  const showList = isDesktop || view === 'list'
  const showChat = isDesktop || view === 'chat'

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 7rem)' }}>

      {/* Top bar */}
      <div className="flex items-center gap-3 mb-4 flex-shrink-0">
        {!isDesktop && view === 'chat' ? (
          // Mobile chat view — back button + booking name
          <>
            <button
              onClick={() => setView('list')}
              className="flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            {activeBooking && (
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{activeBooking.customer_name}</p>
                <p className="text-xs text-gray-500 truncate">{activeBooking.service_name}</p>
              </div>
            )}
            {activeBooking && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex-shrink-0 ${statusBadge(activeBooking.status)}`}>
                {activeBooking.status}
              </span>
            )}
          </>
        ) : (
          // List view or desktop — show title
          <>
            <MessageSquare className="w-5 h-5 text-green-600" />
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {bookings.length}
            </span>
          </>
        )}
      </div>

      {/* Main panel */}
      <div
        className="flex-1 min-h-0 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        style={{ display: 'flex' }}
      >

        {/* ── BOOKING LIST ── */}
        {showList && (
          <div
            style={{ width: isDesktop ? '288px' : '100%', flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: isDesktop ? '1px solid #f1f5f9' : 'none' }}
          >
            {/* Search */}
            <div style={{ padding: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: '#9ca3af' }} />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search bookings…"
                  style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 14, color: '#374151', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
              {filtered.map(booking => {
                const isActive = activeBooking?.id === booking.id
                return (
                  <button
                    key={booking.id}
                    onClick={() => openChat(booking)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '12px', borderRadius: 12, marginBottom: 4,
                      background: isActive ? '#f0fdf4' : 'transparent',
                      border: isActive ? '1px solid #bbf7d0' : '1px solid transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12
                    }}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                      background: isActive ? '#22c55e' : 'linear-gradient(135deg, #a78bfa, #6366f1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: 15
                    }}>
                      {booking.customer_name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: isActive ? '#15803d' : '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {booking.customer_name}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 99, border: '1px solid', flexShrink: 0,
                          ...(booking.status === 'confirmed' ? { background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' } :
                            booking.status === 'in_progress' ? { background: '#f5f3ff', color: '#15843E', borderColor: '#ddd6fe' } :
                              { background: '#f9fafb', color: '#6b7280', borderColor: '#e5e7eb' })
                        }}>
                          {booking.status === 'in_progress' ? 'active' : booking.status}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '2px 0 0' }}>
                        {booking.service_name}
                      </p>
                      <p style={{ fontSize: 11, color: '#9ca3af', margin: '2px 0 0' }}>
                        {new Date(booking.job_date).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight style={{ width: 16, height: 16, color: '#d1d5db', flexShrink: 0 }} />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── CHAT AREA ── */}
        {showChat && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            {activeBooking ? (
              <>
                {/* Desktop chat header */}
                {isDesktop && (
                  <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #a78bfa, #6366f1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontWeight: 700, fontSize: 14
                    }}>
                      {activeBooking.customer_name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: '#111827', margin: 0 }}>{activeBooking.customer_name}</p>
                      <p style={{ fontSize: 12, color: '#6b7280', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activeBooking.service_name}</p>
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 99, border: '1px solid', flexShrink: 0,
                      ...(activeBooking.status === 'confirmed' ? { background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' } :
                        activeBooking.status === 'in_progress' ? { background: '#f5f3ff', color: '#15843E', borderColor: '#ddd6fe' } :
                          { background: '#f9fafb', color: '#6b7280', borderColor: '#e5e7eb' })
                    }}>
                      {activeBooking.status}
                    </span>
                  </div>
                )}
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ChatBox bookingId={activeBooking.id} currentUserType="provider" />
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <MessageSquare style={{ width: 40, height: 40, color: '#e5e7eb' }} />
                <p style={{ color: '#9ca3af', fontSize: 14 }}>Select a booking to start chatting</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}