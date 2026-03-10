





// 'use client'

// import { useState, useEffect } from 'react'
// import { useAuth } from 'src/context/AuthContext'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { X, MessageCircle, Calendar, Clock, Eye } from 'lucide-react'
// import Header from '@/components/Header'
// import ChatBox from '@/components/ChatBox'

// export default function MyBookings() {
//   const { user } = useAuth()
//   const router = useRouter()
//   const [bookings, setBookings] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [selectedBooking, setSelectedBooking] = useState(null)
//   const [showChat, setShowChat] = useState(false)

//   useEffect(() => {
//     if (!user) {
//       router.push('/')
//       return
//     }
//     loadBookings()
//   }, [user])

//   const loadBookings = async () => {
//     try {
//       const res = await fetch(`/api/customer/bookings?user_id=${user.id}`)
//       const data = await res.json()
//       if (data.success) {
//         setBookings(data.data || [])
//       }
//     } catch (error) {
//       console.error('Error:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const openChat = (booking) => {
//     setSelectedBooking(booking)
//     setShowChat(true)
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'confirmed':   return 'bg-blue-50 text-blue-600 border-blue-100'
//       case 'in_progress': return 'bg-violet-50 text-violet-600 border-violet-100'
//       case 'completed':   return 'bg-green-50 text-green-600 border-green-100'
//       case 'cancelled':   return 'bg-red-50 text-red-500 border-red-100'
//       default:            return 'bg-gray-50 text-gray-500 border-gray-100'
//     }
//   }

//   const formatTimeSlot = (slot) => {
//     const slots = {
//       'morning': '8:00 AM - 12:00 PM',
//       'afternoon': '12:00 PM - 5:00 PM',
//       'evening': '5:00 PM - 9:00 PM'
//     }
//     return slots[slot] || slot
//   }

//   if (loading) {
//     return (
//       <>
//         <Header />
//         <div className="min-h-screen flex items-center justify-center">
//           <div className="w-8 h-8 border-[3px] border-green-500 border-t-transparent rounded-full animate-spin" />
//         </div>
//       </>
//     )
//   }

//   return (
//     <>
//       <Header />
//       <div className="min-h-screen bg-gray-50 py-8">
//         <div className="max-w-3xl mx-auto px-4">
//           <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

//           {bookings.length === 0 ? (
//             <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
//               <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-4" />
//               <p className="text-gray-500 mb-4">No bookings found</p>
//               <Link href="/services" className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition">
//                 Browse Services
//               </Link>
//             </div>
//           ) : (
//             <div className="space-y-3">
//               {bookings.map((booking) => (
//                 <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//                   <div className="p-5">
//                     {/* Top row with status */}
//                     <div className="flex items-center justify-between mb-2">
//                       <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusColor(booking.status)}`}>
//                         {booking.status}
//                       </span>
//                     </div>

//                     {/* Service name and provider */}
//                     <h3 className="font-bold text-gray-900 text-lg mb-1">{booking.service_name}</h3>
//                     <p className="text-sm text-gray-500 mb-3">
//                       Provider: <span className="font-medium text-gray-700">{booking.provider_name || 'Not assigned'}</span>
//                     </p>

//                     {/* Date and time */}
//                     <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
//                       <span className="flex items-center gap-1">
//                         <Calendar className="w-3.5 h-3.5" />
//                         {new Date(booking.job_date).toLocaleDateString()}
//                       </span>
//                       {booking.job_time_slot && (
//                         <span className="flex items-center gap-1">
//                           <Clock className="w-3.5 h-3.5" />
//                           {formatTimeSlot(booking.job_time_slot)}
//                         </span>
//                       )}
//                     </div>

//                     {/* Action buttons */}
//                     <div className="flex items-center gap-2">
//                       <Link
//                         href={`/my-bookings/${booking.id}`}
//                         className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
//                       >
//                         <Eye className="w-4 h-4" />
//                         View Details
//                       </Link>

//                       {(booking.status === 'confirmed' || booking.status === 'in_progress') && (
//                         <button
//                           onClick={() => openChat(booking)}
//                           className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
//                         >
//                           <MessageCircle className="w-4 h-4" />
//                           Chat
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Chat Modal */}
//         {showChat && selectedBooking && (
//           <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
//             <div
//               className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden"
//               style={{ height: '560px' }}
//             >
//               <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
//                 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
//                   {selectedBooking.provider_name?.[0]?.toUpperCase()}
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <h3 className="font-bold text-gray-900 text-sm truncate">{selectedBooking.provider_name}</h3>
//                   <p className="text-xs text-gray-500 truncate">{selectedBooking.service_name}</p>
//                 </div>
//                 <button
//                   onClick={() => {
//                     setShowChat(false)
//                     setSelectedBooking(null)
//                   }}
//                   className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition flex-shrink-0"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>

//               <div className="flex-1 min-h-0">
//                 <ChatBox bookingId={selectedBooking.id} currentUserType="customer" />
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   )
// }




'use client'

import { useState, useEffect } from 'react'
import { useAuth } from 'src/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { X, MessageCircle, Calendar, Clock, Eye, ChevronRight, Package } from 'lucide-react'
import Header from '@/components/Header'
import ChatBox from '@/components/ChatBox'

export default function MyBookings() {
  const { user } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [navigatingId, setNavigatingId] = useState(null) // ← loader for navigation

  useEffect(() => {
    if (!user) { router.push('/'); return }
    loadBookings()
  }, [user])

  const loadBookings = async () => {
    try {
      const res = await fetch(`/api/customer/bookings?user_id=${user.id}`)
      const data = await res.json()
      if (data.success) setBookings(data.data || [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (e, bookingId) => {
    e.preventDefault()
    setNavigatingId(bookingId)
    setTimeout(() => router.push(`/my-bookings/${bookingId}`), 400)
  }

  const openChat = (booking) => { setSelectedBooking(booking); setShowChat(true) }

  const statusConfig = {
    pending:           { label: 'Pending',            cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    matching:          { label: 'Finding Provider',   cls: 'bg-orange-50 text-orange-700 border-orange-200' },
    confirmed:         { label: 'Confirmed',          cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    in_progress:       { label: 'In Progress',        cls: 'bg-violet-50 text-violet-700 border-violet-200' },
    awaiting_approval: { label: 'Needs Your Approval',cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    completed:         { label: 'Completed',          cls: 'bg-green-50 text-green-700 border-green-200' },
    cancelled:         { label: 'Cancelled',          cls: 'bg-red-50 text-red-500 border-red-200' },
    disputed:          { label: 'Disputed',           cls: 'bg-red-50 text-red-700 border-red-200' },
  }

  const getStatus = (s) => statusConfig[s] || { label: s, cls: 'bg-gray-50 text-gray-500 border-gray-200' }

  const formatSlot = (slot) => {
    const map = { morning: '8:00 AM – 12:00 PM', afternoon: '12:00 PM – 5:00 PM', evening: '5:00 PM – 9:00 PM' }
    if (Array.isArray(slot)) return map[slot[0]] || slot[0]
    return map[slot] || slot
  }

  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
    catch { return '—' }
  }

  const statusDot = {
    pending:           'bg-yellow-400',
    matching:          'bg-orange-400',
    confirmed:         'bg-blue-400',
    in_progress:       'bg-violet-500 animate-pulse',
    awaiting_approval: 'bg-amber-400 animate-pulse',
    completed:         'bg-green-500',
    cancelled:         'bg-red-400',
    disputed:          'bg-red-600',
  }

  // ── Full page loader ──────────────────────────────────────────────────────
  if (loading) return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-green-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading your bookings…</p>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Header />

      {/* ── Navigation overlay loader ── */}
      {navigatingId && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-gray-600">Loading booking details…</p>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
              {bookings.length > 0 && (
                <p className="text-sm text-gray-400 mt-0.5">{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>

          {/* Empty state */}
          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="font-semibold text-gray-700 mb-1">No bookings yet</h3>
              <p className="text-gray-400 text-sm mb-6">Your bookings will appear here once you book a service.</p>
              <Link href="/services" className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition">
                Browse Services
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => {
                const st = getStatus(booking.status)
                const isNavigating = navigatingId === booking.id
                const canChat = booking.status === 'confirmed' || booking.status === 'in_progress'
                const needsApproval = booking.status === 'awaiting_approval'

                return (
                  <div key={booking.id}
                    className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-200
                      ${needsApproval ? 'border-amber-300 ring-1 ring-amber-200' : 'border-gray-100'}
                      ${isNavigating ? 'opacity-60 scale-[0.99]' : 'hover:shadow-md hover:border-gray-200'}`}>

                    {/* Approval banner */}
                    {needsApproval && (
                      <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center gap-2">
                        <span className="text-amber-600 text-sm">🎉</span>
                        <span className="text-xs font-semibold text-amber-700">Job completed — your approval needed</span>
                        <ChevronRight className="w-3.5 h-3.5 text-amber-500 ml-auto" />
                      </div>
                    )}

                    <div className="p-5">
                      {/* Status row */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[booking.status] || 'bg-gray-300'}`} />
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${st.cls}`}>
                          {st.label}
                        </span>
                        {booking.booking_number && (
                          <span className="ml-auto text-[10px] text-gray-300 font-mono">{booking.booking_number}</span>
                        )}
                      </div>

                      {/* Service name */}
                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{booking.service_name}</h3>

                      {/* Provider */}
                      <div className="flex items-center gap-1.5 mb-4">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                          {(booking.provider_name || 'P')[0].toUpperCase()}
                        </div>
                        <p className="text-sm text-gray-500">
                          {booking.provider_name
                            ? <span className="font-medium text-gray-700">{booking.provider_name}</span>
                            : <span className="italic text-gray-400">Provider not assigned yet</span>
                          }
                        </p>
                      </div>

                      {/* Date & time */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-4">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(booking.job_date)}
                        </span>
                        {booking.job_time_slot && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {formatSlot(booking.job_time_slot)}
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleViewDetails(e, booking.id)}
                          disabled={!!navigatingId}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition
                            ${needsApproval
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            } disabled:opacity-60`}
                        >
                          {isNavigating
                            ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Loading…</>
                            : needsApproval
                            ? <><span>🎉</span> Review & Approve</>
                            : <><Eye className="w-4 h-4" /> View Details</>
                          }
                        </button>

                        {canChat && (
                          <button
                            onClick={() => openChat(booking)}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
                          >
                            <MessageCircle className="w-4 h-4" /> Chat
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Chat Modal */}
        {showChat && selectedBooking && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden" style={{ height: '560px' }}>
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {selectedBooking.provider_name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{selectedBooking.provider_name}</h3>
                  <p className="text-xs text-gray-500 truncate">{selectedBooking.service_name}</p>
                </div>
                <button onClick={() => { setShowChat(false); setSelectedBooking(null) }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <ChatBox bookingId={selectedBooking.id} currentUserType="customer" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}