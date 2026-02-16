// 'use client'
// import React, { useState, useEffect } from 'react'  // ✅ Add React here

// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { useAdminTheme } from '../../layout'

// export default function BookingDetailsPage({ params }) {
//   const router = useRouter()
//   const { isDarkMode } = useAdminTheme()
//   const [booking, setBooking] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [updating, setUpdating] = useState(false)
//   const [showMessage, setShowMessage] = useState('')

//   // ✅ FIX: Unwrap params with React.use() for client component
//   const unwrappedParams = React.use(params)
//   const bookingId = unwrappedParams.id

//   useEffect(() => {
//     fetchBooking()
//   }, [bookingId])

//   const fetchBooking = async () => {
//     try {
//       const res = await fetch(`/api/bookings/${bookingId}`)
//       const data = await res.json()
//       if (data.success) {
//         setBooking(data.data)
//       } else {
//         showNotification('error', 'Booking not found')
//       }
//     } catch (error) {
//       showNotification('error', 'Failed to load booking')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const showNotification = (type, message) => {
//     setShowMessage({ type, message })
//     setTimeout(() => setShowMessage(''), 3000)
//   }

//   const updateStatus = async (newStatus) => {
//     setUpdating(true)
//     try {
//       const res = await fetch(`/api/bookings?id=${booking.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: newStatus })
//       })
//       const data = await res.json()
//       if (data.success) {
//         showNotification('success', `Status updated to ${newStatus}`)
//         fetchBooking()
//       } else {
//         showNotification('error', 'Failed to update status')
//       }
//     } catch (error) {
//       showNotification('error', 'Failed to update status')
//     } finally {
//       setUpdating(false)
//     }
//   }

//   const formatDate = (dateStr) => {
//     return new Date(dateStr).toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     })
//   }

//   const formatTime = (dateStr) => {
//     return new Date(dateStr).toLocaleTimeString('en-US', {
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   const getStatusColor = (status) => {
//     const colors = {
//       'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
//       'matching': 'bg-orange-100 text-orange-800 border-orange-200',
//       'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
//       'in_progress': 'bg-purple-100 text-purple-800 border-purple-200',
//       'completed': 'bg-green-100 text-green-800 border-green-200',
//       'cancelled': 'bg-red-100 text-red-800 border-red-200'
//     }
//     return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
//       </div>
//     )
//   }

//   if (!booking) {
//     return (
//       <div className="p-6 text-center">
//         <p className="text-gray-600">Booking not found</p>
//         <button
//           onClick={() => router.back()}
//           className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm"
//         >
//           Go Back
//         </button>
//       </div>
//     )
//   }

//   return (
//     <div className="p-4 sm:p-6">
//       {/* Notification */}
//       {showMessage && (
//         <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm ${
//           showMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
//         }`}>
//           {showMessage.message}
//         </div>
//       )}

//       {/* Header with back button */}
//       <div className="mb-6 flex items-center gap-4">
//         <button
//           onClick={() => router.back()}
//           className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//           </svg>
//         </button>
//         <div>
//           <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//             Booking Details
//           </h1>
//           <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//             {booking.booking_number}
//           </p>
//         </div>
//         <span className={`ml-auto px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
//           {booking.status === 'in_progress' ? 'In Progress' : booking.status?.replace('_', ' ')}
//         </span>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Main Content - Left Column */}
//         <div className="lg:col-span-2 space-y-6">
          
//           {/* Customer Information Card */}
//           <div className={`rounded-xl shadow-sm border p-5 ${
//             isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//           }`}>
//             <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//               <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//               </svg>
//               Customer Information
//             </h2>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Name</p>
//                 <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   {booking.customer_first_name} {booking.customer_last_name}
//                 </p>
//               </div>
//               <div>
//                 <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Email</p>
//                 <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{booking.customer_email}</p>
//               </div>
//               <div>
//                 <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Phone</p>
//                 <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{booking.customer_phone || 'Not provided'}</p>
//               </div>
//               <div>
//                 <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>User ID</p>
//                 <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{booking.user_id || 'Guest'}</p>
//               </div>
//             </div>
//           </div>

//           {/* Service Details Card */}
//           <div className={`rounded-xl shadow-sm border p-5 ${
//             isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//           }`}>
//             <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//               <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//               </svg>
//               Service Details
//             </h2>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Service</p>
//                 <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{booking.service_name}</p>
//               </div>
//               <div>
//                 <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Category</p>
//                 <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{booking.category_name}</p>
//               </div>
//               <div>
//                 <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Base Price</p>
//                 <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${parseFloat(booking.service_price).toFixed(2)}</p>
//               </div>
//               <div>
//                 <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Additional Price</p>
//                 <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${parseFloat(booking.additional_price || 0).toFixed(2)}</p>
//               </div>
//               <div className="col-span-2">
//                 <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Amount</p>
//                 <p className={`text-lg font-bold text-teal-600`}>
//                   ${(parseFloat(booking.service_price) + parseFloat(booking.additional_price || 0)).toFixed(2)}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Schedule Card */}
//           <div className={`rounded-xl shadow-sm border p-5 ${
//             isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//           }`}>
//             <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//               <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//               </svg>
//               Schedule
//             </h2>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Date</p>
//                 <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(booking.job_date)}</p>
//               </div>
//               <div>
//                 <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Time Slots</p>
//                 <div className="flex flex-wrap gap-1 mt-1">
//                   {Array.isArray(booking.job_time_slot) ? (
//                     booking.job_time_slot.map((slot, idx) => (
//                       <span key={idx} className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs">
//                         {slot}
//                       </span>
//                     ))
//                   ) : (
//                     <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs">
//                       {booking.job_time_slot}
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>
//             {booking.timing_constraints && (
//               <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
//                 <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Timing Constraints</p>
//                 <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{booking.timing_constraints}</p>
//               </div>
//             )}
//           </div>

//           {/* Location Card */}
//           <div className={`rounded-xl shadow-sm border p-5 ${
//             isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//           }`}>
//             <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//               <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//               </svg>
//               Location & Access
//             </h2>
//             <div className="space-y-3">
//               <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg border border-teal-200 dark:border-teal-800">
//                 <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   {booking.address_line1}
//                 </p>
//                 {booking.address_line2 && (
//                   <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
//                     {booking.address_line2}
//                   </p>
//                 )}
//                 <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//                   {booking.city || 'Calgary'}{booking.postal_code ? `, ${booking.postal_code}` : ''}
//                 </p>
//               </div>
              
//               <div className="grid grid-cols-3 gap-2">
//                 <div className={`p-2 rounded-lg border ${
//                   booking.parking_access 
//                     ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
//                     : isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
//                 }`}>
//                   <p className={`text-xs text-center ${
//                     booking.parking_access 
//                       ? 'text-green-700 dark:text-green-400' 
//                       : isDarkMode ? 'text-slate-400' : 'text-gray-500'
//                   }`}>
//                     🅿️ Parking
//                   </p>
//                 </div>
//                 <div className={`p-2 rounded-lg border ${
//                   booking.elevator_access 
//                     ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
//                     : isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
//                 }`}>
//                   <p className={`text-xs text-center ${
//                     booking.elevator_access 
//                       ? 'text-green-700 dark:text-green-400' 
//                       : isDarkMode ? 'text-slate-400' : 'text-gray-500'
//                   }`}>
//                     🛗 Elevator
//                   </p>
//                 </div>
//                 <div className={`p-2 rounded-lg border ${
//                   booking.has_pets 
//                     ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' 
//                     : isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
//                 }`}>
//                   <p className={`text-xs text-center ${
//                     booking.has_pets 
//                       ? 'text-yellow-700 dark:text-yellow-400' 
//                       : isDarkMode ? 'text-slate-400' : 'text-gray-500'
//                   }`}>
//                     🐕 Pets
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Job Description Card */}
//           {booking.job_description && (
//             <div className={`rounded-xl shadow-sm border p-5 ${
//               isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//             }`}>
//               <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                 Job Description
//               </h2>
//               <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
//                 {booking.job_description}
//               </p>
//             </div>
//           )}

//           {/* Photos */}
//           {booking.photos && booking.photos.length > 0 && (
//             <div className={`rounded-xl shadow-sm border p-5 ${
//               isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//             }`}>
//               <h2 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                 Photos ({booking.photos.length})
//               </h2>
//               <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
//                 {booking.photos.map((photo, index) => (
//                   <div key={index} className="relative group aspect-square">
//                     <img
//                       src={photo}
//                       alt={`Job photo ${index + 1}`}
//                       className="w-full h-full object-cover rounded-lg cursor-pointer"
//                       onClick={() => window.open(photo, '_blank')}
//                     />
//                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
//                       <span className="text-white text-xs">View</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Right Sidebar */}
//         <div className="space-y-6">
          
//           {/* Provider Card */}
//           <div className={`rounded-xl shadow-sm border p-5 ${
//             isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//           }`}>
//             <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//               <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//               </svg>
//               Provider
//             </h2>
//             {booking.provider_name ? (
//               <div>
//                 <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   {booking.provider_name}
//                 </p>
//                 {booking.provider_rating && (
//                   <p className="text-xs text-yellow-600 mt-1">⭐ {booking.provider_rating}</p>
//                 )}
//               </div>
//             ) : (
//               <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
//                 No provider assigned yet
//               </p>
//             )}
//           </div>

//           {/* Status Timeline Card */}
//           <div className={`rounded-xl shadow-sm border p-5 ${
//             isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//           }`}>
//             <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//               Status Timeline
//             </h2>
//             <div className="space-y-3">
//               {booking.status_history && booking.status_history.length > 0 ? (
//                 booking.status_history.map((item, index) => (
//                   <div key={index} className="relative pl-4 pb-3 border-l-2 border-teal-500 last:pb-0">
//                     <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-teal-500"></div>
//                     <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       {item.status.replace('_', ' ')}
//                     </p>
//                     <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
//                       {new Date(item.created_at).toLocaleString()}
//                     </p>
//                     {item.notes && (
//                       <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
//                         {item.notes}
//                       </p>
//                     )}
//                   </div>
//                 ))
//               ) : (
//                 <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
//                   No status history
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Update Status Card */}
//           <div className={`rounded-xl shadow-sm border p-5 ${
//             isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//           }`}>
//             <h2 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//               Update Status
//             </h2>
//             <div className="flex flex-wrap gap-2">
//               {['pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
//                 <button
//                   key={status}
//                   onClick={() => updateStatus(status)}
//                   disabled={booking.status === status || updating}
//                   className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
//                     booking.status === status
//                       ? 'bg-teal-500 text-white cursor-default'
//                       : isDarkMode
//                         ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
//                         : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                   } ${updating ? 'opacity-50 cursor-wait' : ''}`}
//                 >
//                   {status === 'in_progress' ? 'In Progress' : status.replace('_', ' ')}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Quick Info Card */}
//           <div className={`rounded-xl shadow-sm border p-5 ${
//             isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//           }`}>
//             <div className="space-y-2">
//               <div className="flex justify-between text-sm">
//                 <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>Booking ID</span>
//                 <span className={`font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   #{booking.id}
//                 </span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>Created</span>
//                 <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
//                   {formatTime(booking.created_at)}
//                 </span>
//               </div>
//               <div className="flex justify-between text-sm">
//                 <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>Last Updated</span>
//                 <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
//                   {formatTime(booking.updated_at)}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }



'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdminTheme } from '../../layout'

export default function BookingDetailsPage({ params }) {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [showMessage, setShowMessage] = useState('')
  const [tradespeople, setTradespeople] = useState([])
  const [selectedProvider, setSelectedProvider] = useState('')

  // Unwrap params with React.use() for client component
  const unwrappedParams = React.use(params)
  const bookingId = unwrappedParams.id

  useEffect(() => {
    fetchBooking()
    loadTradespeople()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`)
      const data = await res.json()
      if (data.success) {
        setBooking(data.data)
        setSelectedProvider(data.data.provider_id || '')
      } else {
        showNotification('error', 'Booking not found')
      }
    } catch (error) {
      showNotification('error', 'Failed to load booking')
    } finally {
      setLoading(false)
    }
  }

  const loadTradespeople = async () => {
    try {
      const res = await fetch('/api/provider?status=active')
      const data = await res.json()
      if (data.success) {
        setTradespeople(data.data || [])
      }
    } catch (error) {
      console.error('Error loading tradespeople:', error)
    }
  }

  const showNotification = (type, message) => {
    setShowMessage({ type, message })
    setTimeout(() => setShowMessage(''), 3000)
  }

  const updateStatus = async (newStatus) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/bookings?id=${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        showNotification('success', `Status updated to ${newStatus.replace('_', ' ')}`)
        fetchBooking()
      } else {
        showNotification('error', 'Failed to update status')
      }
    } catch (error) {
      showNotification('error', 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const assignProvider = async () => {
    if (!selectedProvider) {
      showNotification('error', 'Please select a provider')
      return
    }

    setUpdating(true)
    try {
      const res = await fetch(`/api/bookings?id=${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          provider_id: selectedProvider,
          status: 'matching'
        })
      })
      const data = await res.json()
      if (data.success) {
        showNotification('success', 'Provider assigned successfully')
        fetchBooking()
      } else {
        showNotification('error', data.message || 'Failed to assign provider')
      }
    } catch (error) {
      showNotification('error', 'Failed to assign provider')
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'matching': 'bg-orange-100 text-orange-800 border-orange-200',
      'confirmed': 'bg-blue-100 text-blue-800 border-blue-200',
      'in_progress': 'bg-purple-100 text-purple-800 border-purple-200',
      'completed': 'bg-green-100 text-green-800 border-green-200',
      'cancelled': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Booking not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Notification */}
      {showMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-sm ${
          showMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {showMessage.message}
        </div>
      )}

      {/* Header with back button */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Booking Details
          </h1>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            {booking.booking_number}
          </p>
        </div>
        <span className={`ml-auto px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
          {booking.status === 'in_progress' ? 'In Progress' : booking.status?.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer Information Card */}
          <div className={`rounded-xl shadow-sm border p-5 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Name</p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {booking.customer_first_name} {booking.customer_last_name}
                </p>
              </div>
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Email</p>
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{booking.customer_email}</p>
              </div>
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Phone</p>
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{booking.customer_phone || 'Not provided'}</p>
              </div>
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>User ID</p>
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{booking.user_id || 'Guest'}</p>
              </div>
            </div>
          </div>

          {/* Service Details Card */}
          <div className={`rounded-xl shadow-sm border p-5 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Service Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Service</p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{booking.service_name}</p>
              </div>
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Category</p>
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{booking.category_name}</p>
              </div>
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Base Price</p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${parseFloat(booking.service_price).toFixed(2)}</p>
              </div>
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Additional Price</p>
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${parseFloat(booking.additional_price || 0).toFixed(2)}</p>
              </div>
              <div className="col-span-2">
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Amount</p>
                <p className={`text-lg font-bold text-teal-600`}>
                  ${(parseFloat(booking.service_price) + parseFloat(booking.additional_price || 0)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Schedule Card */}
          <div className={`rounded-xl shadow-sm border p-5 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Schedule
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Date</p>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatDate(booking.job_date)}</p>
              </div>
              <div>
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Time Slots</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Array.isArray(booking.job_time_slot) ? (
                    booking.job_time_slot.map((slot, idx) => (
                      <span key={idx} className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs">
                        {slot}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded text-xs">
                      {booking.job_time_slot}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {booking.timing_constraints && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Timing Constraints</p>
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{booking.timing_constraints}</p>
              </div>
            )}
          </div>

          {/* Location Card */}
          <div className={`rounded-xl shadow-sm border p-5 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Location & Access
            </h2>
            <div className="space-y-3">
              <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg border border-teal-200 dark:border-teal-800">
                <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {booking.address_line1}
                </p>
                {booking.address_line2 && (
                  <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    {booking.address_line2}
                  </p>
                )}
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  {booking.city || 'Calgary'}{booking.postal_code ? `, ${booking.postal_code}` : ''}
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className={`p-2 rounded-lg border ${
                  booking.parking_access 
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                    : isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-xs text-center ${
                    booking.parking_access 
                      ? 'text-green-700 dark:text-green-400' 
                      : isDarkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    🅿️ Parking
                  </p>
                </div>
                <div className={`p-2 rounded-lg border ${
                  booking.elevator_access 
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                    : isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-xs text-center ${
                    booking.elevator_access 
                      ? 'text-green-700 dark:text-green-400' 
                      : isDarkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    🛗 Elevator
                  </p>
                </div>
                <div className={`p-2 rounded-lg border ${
                  booking.has_pets 
                    ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' 
                    : isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`text-xs text-center ${
                    booking.has_pets 
                      ? 'text-yellow-700 dark:text-yellow-400' 
                      : isDarkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    🐕 Pets
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description Card */}
          {booking.job_description && (
            <div className={`rounded-xl shadow-sm border p-5 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Job Description
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                {booking.job_description}
              </p>
            </div>
          )}

          {/* Photos */}
          {booking.photos && booking.photos.length > 0 && (
            <div className={`rounded-xl shadow-sm border p-5 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Photos ({booking.photos.length})
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {booking.photos.map((photo, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={photo}
                      alt={`Job photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg cursor-pointer"
                      onClick={() => window.open(photo, '_blank')}
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <span className="text-white text-xs">View</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          
          {/* Provider Assignment Card - Enhanced */}
          <div className={`rounded-xl shadow-sm border p-5 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Provider Assignment
            </h2>
            
            {booking.provider_name ? (
              <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {booking.provider_name}
                  </p>
                  {booking.provider_rating && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      ⭐ {booking.provider_rating}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Assigned Provider</p>
              </div>
            ) : (
              <div className="space-y-3">
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-slate-800 text-white border-slate-700' 
                      : 'bg-white text-gray-900 border-gray-300'
                  } focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition`}
                  disabled={updating}
                >
                  <option value="">Select a provider</option>
                  {tradespeople.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} {provider.rating ? `(⭐ ${provider.rating})` : ''} - {provider.specialty || 'General'}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={assignProvider}
                    disabled={!selectedProvider || updating}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-50"
                  >
                    {updating ? 'Assigning...' : 'Assign Provider'}
                  </button>
                  <button
                    onClick={() => {
                      if (tradespeople.length > 0) {
                        setSelectedProvider(tradespeople[0].id)
                      }
                    }}
                    className="px-4 py-2 border border-teal-600 text-teal-600 rounded-lg text-sm font-semibold hover:bg-teal-50 transition"
                  >
                    Quick Assign
                  </button>
                </div>

                {tradespeople.length === 0 && (
                  <p className="text-xs text-red-500 mt-2">
                    No active provider found. Please add provider first.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Provider Info Card (if assigned) */}
          {booking.provider_name && (
            <div className={`rounded-xl shadow-sm border p-5 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Provider Information
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Name</span>
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {booking.provider_name}
                  </span>
                </div>
                {booking.provider_phone && (
                  <div className="flex justify-between">
                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Phone</span>
                    <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {booking.provider_phone}
                    </span>
                  </div>
                )}
                {booking.provider_email && (
                  <div className="flex justify-between">
                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Email</span>
                    <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {booking.provider_email}
                    </span>
                  </div>
                )}
                {booking.provider_rating && (
                  <div className="flex justify-between">
                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Rating</span>
                    <span className="text-sm font-medium text-yellow-600">⭐ {booking.provider_rating}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Timeline Card */}
          <div className={`rounded-xl shadow-sm border p-5 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Status Timeline
            </h2>
            <div className="space-y-3">
              {booking.status_history && booking.status_history.length > 0 ? (
                booking.status_history.map((item, index) => (
                  <div key={index} className="relative pl-4 pb-3 border-l-2 border-teal-500 last:pb-0">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-teal-500"></div>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {item.status.replace('_', ' ')}
                    </p>
                    <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                    {item.notes && (
                      <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        {item.notes}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  No status history
                </p>
              )}
            </div>
          </div>

          {/* Update Status Card */}
          <div className={`rounded-xl shadow-sm border p-5 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Update Status
            </h2>
            <div className="flex flex-wrap gap-2">
              {['pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={booking.status === status || updating}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    booking.status === status
                      ? 'bg-teal-500 text-white cursor-default'
                      : isDarkMode
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${updating ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {status === 'in_progress' ? 'In Progress' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Info Card */}
          <div className={`rounded-xl shadow-sm border p-5 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>Booking ID</span>
                <span className={`font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  #{booking.id}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>Created</span>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {formatTime(booking.created_at)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>Last Updated</span>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {formatTime(booking.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}