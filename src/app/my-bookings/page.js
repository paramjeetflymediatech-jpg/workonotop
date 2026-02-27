// 'use client'

// import { useState, useEffect } from 'react'
// import { useAuth } from 'src/context/AuthContext'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { X, MessageCircle, Calendar, Clock } from 'lucide-react'
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
//                   <div className="p-5 flex items-start justify-between gap-4">
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2 mb-1 flex-wrap">
//                         <h3 className="font-bold text-gray-900 text-base">{booking.service_name}</h3>
//                         <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusColor(booking.status)}`}>
//                           {booking.status}
//                         </span>
//                       </div>
//                       <p className="text-sm text-gray-500 mb-2">
//                         Provider: <span className="font-medium text-gray-700">{booking.provider_name}</span>
//                       </p>
//                       <div className="flex items-center gap-4 text-xs text-gray-400">
//                         <span className="flex items-center gap-1">
//                           <Calendar className="w-3.5 h-3.5" />
//                           {new Date(booking.job_date).toLocaleDateString()}
//                         </span>
//                         {booking.job_time_slot && (
//                           <span className="flex items-center gap-1">
//                             <Clock className="w-3.5 h-3.5" />
//                             {booking.job_time_slot}
//                           </span>
//                         )}
//                       </div>
//                     </div>

//                     {(booking.status === 'confirmed' || booking.status === 'in_progress') && (
//                       <button
//                         onClick={() => openChat(booking)}
//                         className="flex-shrink-0 flex items-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm"
//                       >
//                         <MessageCircle className="w-4 h-4" />
//                         Chat
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Chat Modal — same logic as before, just better styled */}
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
import { X, MessageCircle, Calendar, Clock, Eye } from 'lucide-react'
import Header from '@/components/Header'
import ChatBox from '@/components/ChatBox'

export default function MyBookings() {
  const { user } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showChat, setShowChat] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadBookings()
  }, [user])

  const loadBookings = async () => {
    try {
      const res = await fetch(`/api/customer/bookings?user_id=${user.id}`)
      const data = await res.json()
      if (data.success) {
        setBookings(data.data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const openChat = (booking) => {
    setSelectedBooking(booking)
    setShowChat(true)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':   return 'bg-blue-50 text-blue-600 border-blue-100'
      case 'in_progress': return 'bg-violet-50 text-violet-600 border-violet-100'
      case 'completed':   return 'bg-green-50 text-green-600 border-green-100'
      case 'cancelled':   return 'bg-red-50 text-red-500 border-red-100'
      default:            return 'bg-gray-50 text-gray-500 border-gray-100'
    }
  }

  const formatTimeSlot = (slot) => {
    const slots = {
      'morning': '8:00 AM - 12:00 PM',
      'afternoon': '12:00 PM - 5:00 PM',
      'evening': '5:00 PM - 9:00 PM'
    }
    return slots[slot] || slot
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-[3px] border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No bookings found</p>
              <Link href="/services" className="inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-green-700 transition">
                Browse Services
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5">
                    {/* Top row with status */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    {/* Service name and provider */}
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{booking.service_name}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      Provider: <span className="font-medium text-gray-700">{booking.provider_name || 'Not assigned'}</span>
                    </p>

                    {/* Date and time */}
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(booking.job_date).toLocaleDateString()}
                      </span>
                      {booking.job_time_slot && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTimeSlot(booking.job_time_slot)}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/my-bookings/${booking.id}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </Link>

                      {(booking.status === 'confirmed' || booking.status === 'in_progress') && (
                        <button
                          onClick={() => openChat(booking)}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chat
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chat Modal */}
        {showChat && selectedBooking && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden"
              style={{ height: '560px' }}
            >
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {selectedBooking.provider_name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{selectedBooking.provider_name}</h3>
                  <p className="text-xs text-gray-500 truncate">{selectedBooking.service_name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowChat(false)
                    setSelectedBooking(null)
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition flex-shrink-0"
                >
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