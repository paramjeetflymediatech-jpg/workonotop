// 'use client'

// import { useState, useEffect } from 'react'
// import { useAuth } from 'src/context/AuthContext'
// import { useRouter, useParams } from 'next/navigation'
// import Link from 'next/link'
// import Header from '@/components/Header'
// import ChatBox from '@/components/ChatBox'
// import {
//   Calendar, Clock, MapPin, User, Phone, Mail,
//   Star, MessageCircle, ArrowLeft, CreditCard,
//   CheckCircle, XCircle, AlertCircle, Image as ImageIcon
// } from 'lucide-react'

// function Toast({ message, type, onClose }) {
//   useEffect(() => {
//     if (!message) return
//     const timer = setTimeout(onClose, 4000)
//     return () => clearTimeout(timer)
//   }, [message, onClose])

//   if (!message) return null

//   const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
//   const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'

//   return (
//     <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-medium max-w-sm animate-slideIn ${bgColor}`}>
//       <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-base">{icon}</span>
//       <span>{message}</span>
//       <button onClick={onClose} className="ml-auto text-white/70 hover:text-white">✕</button>
//     </div>
//   )
// }

// function ConfirmModal({ isOpen, onClose, onConfirm, title, message, amount, duration, overtime }) {
//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
//       <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
//         <div className="p-6 text-center">
//           <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <span className="text-2xl">💰</span>
//           </div>
//           <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
//           <p className="text-sm text-gray-500 mb-3">{message}</p>
//           {duration && (
//             <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full inline-block mb-2">
//               ⏱️ Worked: {duration}
//             </p>
//           )}
//           {overtime > 0 && (
//             <p className="text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full inline-block mb-2">
//               ⏰ Overtime: {overtime} min
//             </p>
//           )}
//           {amount && (
//             <div className="bg-green-50 border border-green-100 rounded-xl p-3 mt-2">
//               <p className="text-xs text-gray-500 mb-1">Amount to be charged</p>
//               <p className="text-2xl font-extrabold text-green-700">{amount}</p>
//             </div>
//           )}
//         </div>
//         <div className="flex gap-3 px-6 pb-6">
//           <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition">
//             Cancel
//           </button>
//           <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition">
//             Confirm & Pay
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default function BookingDetails() {
//   const { user } = useAuth()
//   const router = useRouter()
//   const params = useParams()
//   const bookingId = params.id

//   const [booking, setBooking] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState('')
//   const [activeTab, setActiveTab] = useState('details')
//   const [selectedImage, setSelectedImage] = useState(null)

//   const [actionLoading, setActionLoading] = useState(false)
//   const [showDisputeModal, setShowDisputeModal] = useState(false)
//   const [showConfirmModal, setShowConfirmModal] = useState(false)
//   const [disputeReason, setDisputeReason] = useState('')
//   const [toast, setToast] = useState({ message: '', type: '' })

//   useEffect(() => {
//     if (!user) { router.push('/'); return }
//     loadBookingDetails()
//   }, [user, bookingId])

//   const loadBookingDetails = async () => {
//     try {
//       const res = await fetch(`/api/customer/booking-details?bookingId=${bookingId}`)
//       const data = await res.json()
//       if (data.success) {
//         setBooking(data.booking)
//       } else {
//         setError(data.message)
//       }
//     } catch {
//       setError('Failed to load booking details')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleApprove = async () => {
//     setActionLoading(true)
//     try {
//       const res = await fetch(`/api/customer/bookings/${bookingId}/approve`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ action: 'approve' })
//       })
//       const data = await res.json()
//       if (data.success) {
//         setToast({ 
//           message: data.message || '✅ Payment released successfully!', 
//           type: 'success' 
//         })
//         setTimeout(() => router.push('/my-bookings'), 2000)
//       } else {
//         setToast({ 
//           message: data.message || 'Failed to approve', 
//           type: 'error' 
//         })
//       }
//     } catch {
//       setToast({ 
//         message: 'Something went wrong. Try again.', 
//         type: 'error' 
//       })
//     } finally {
//       setActionLoading(false)
//       setShowConfirmModal(false)
//     }
//   }

//   const handleDispute = async () => {
//     if (!disputeReason.trim()) return
//     setActionLoading(true)
//     try {
//       const res = await fetch(`/api/customer/bookings/${bookingId}/approve`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ action: 'dispute', dispute_reason: disputeReason })
//       })
//       const data = await res.json()
//       if (data.success) {
//         setShowDisputeModal(false)
//         setToast({ 
//           message: data.message || '⚠️ Dispute raised. Admin will review within 24 hours.', 
//           type: 'warning' 
//         })
//         loadBookingDetails()
//       } else {
//         setToast({ 
//           message: data.message || 'Failed to raise dispute', 
//           type: 'error' 
//         })
//       }
//     } catch {
//       setToast({ 
//         message: 'Something went wrong. Try again.', 
//         type: 'error' 
//       })
//     } finally {
//       setActionLoading(false)
//     }
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
//       case 'matching': return 'bg-orange-50 text-orange-700 border-orange-200'
//       case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200'
//       case 'in_progress': return 'bg-purple-50 text-purple-700 border-purple-200'
//       case 'awaiting_approval': return 'bg-amber-50 text-amber-700 border-amber-200'
//       case 'completed': return 'bg-green-50 text-green-700 border-green-200'
//       case 'cancelled': return 'bg-red-50 text-red-700 border-red-200'
//       case 'disputed': return 'bg-red-50 text-red-700 border-red-200'
//       default: return 'bg-gray-50 text-gray-700 border-gray-200'
//     }
//   }

//   const formatDate = (date) => {
//     if (!date) return 'N/A'
//     return new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
//   }

//   const formatTime = (date) => {
//     if (!date) return 'N/A'
//     return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
//   }

//   const formatDuration = (minutes) => {
//     if (!minutes) return ''
//     if (minutes < 60) return `${minutes} min`
//     const hours = Math.floor(minutes / 60)
//     const mins = minutes % 60
//     return mins ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`
//   }

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(amount || 0)
//   }

//   const formatTimeSlot = (slot) => {
//     const slots = { 'morning': '8:00 AM - 12:00 PM', 'afternoon': '12:00 PM - 5:00 PM', 'evening': '5:00 PM - 9:00 PM' }
//     return slots[slot] || slot
//   }

//   const calculateFinalAmount = () => {
//     if (!booking?.timeline?.actual_duration_minutes || !booking?.service?.duration) return null
    
//     const actual = booking.timeline.actual_duration_minutes
//     const standard = booking.service.duration
//     const basePrice = booking.pricing?.base_price || 0
//     const overtimeRate = booking.pricing?.overtime_rate || 0
    
//     if (actual < standard) {
//       const percentage = actual / standard
//       return basePrice * percentage
//     } else if (actual > standard) {
//       const overtimeMins = actual - standard
//       const overtimeEarnings = (overtimeRate / 60) * overtimeMins
//       return basePrice + overtimeEarnings
//     }
//     return basePrice
//   }

//   if (loading) {
//     return (
//       <>
//         <Header />
//         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//           <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
//         </div>
//       </>
//     )
//   }

//   if (error || !booking) {
//     return (
//       <>
//         <Header />
//         <div className="min-h-screen bg-gray-50 py-8">
//           <div className="max-w-3xl mx-auto px-4">
//             <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
//               <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
//               <p className="text-gray-500 mb-6">{error || 'Booking does not exist'}</p>
//               <Link href="/customer/my-bookings" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition">
//                 <ArrowLeft className="w-4 h-4" /> Back to My Bookings
//               </Link>
//             </div>
//           </div>
//         </div>
//       </>
//     )
//   }

//   const canChat = booking.status === 'confirmed' || booking.status === 'in_progress'
//   const hasPhotos = (booking.photos?.booking_photos?.length > 0) || (booking.photos?.job_photos?.length > 0)
//   const isAwaitingApproval = booking.status === 'awaiting_approval'
  
//   const actualMinutes = booking.timeline?.actual_duration_minutes
//   const standardMinutes = booking.service?.duration
//   const finalAmount = calculateFinalAmount()
//   const overtimeMinutes = actualMinutes > standardMinutes ? actualMinutes - standardMinutes : 0
//   const isProrated = actualMinutes < standardMinutes
//   const isOvertime = actualMinutes > standardMinutes

//   return (
//     <>
//       <Header />
//       <Toast 
//         message={toast.message} 
//         type={toast.type} 
//         onClose={() => setToast({ message: '', type: '' })} 
//       />

//       <ConfirmModal
//         isOpen={showConfirmModal}
//         onClose={() => setShowConfirmModal(false)}
//         onConfirm={handleApprove}
//         title="Confirm Payment"
//         message={
//           isProrated 
//             ? `Provider worked ${actualMinutes}min of ${standardMinutes}min. You'll be charged only for time worked.`
//             : isOvertime
//             ? `Provider worked ${actualMinutes}min (${standardMinutes}min + ${overtimeMinutes}min overtime). Overtime rate: ${formatCurrency(booking.pricing?.overtime_rate || 0)}/hour.`
//             : 'Release payment to provider?'
//         }
//         amount={formatCurrency(finalAmount || booking.pricing?.base_price || 0)}
//         duration={actualMinutes ? formatDuration(actualMinutes) : null}
//         overtime={overtimeMinutes}
//       />

//       <div className="min-h-screen bg-gray-50 py-6 md:py-8">
//         <div className="max-w-5xl mx-auto px-4">

//           <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
//             <Link href="/customer/my-bookings" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition group">
//               <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
//               <span className="text-sm font-medium">Back to Bookings</span>
//             </Link>
//             <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
//               {booking.status?.replace('_', ' ').toUpperCase()}
//             </span>
//           </div>

//           <div className="mb-6">
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{booking.service?.name || 'Service'}</h1>
//             <p className="text-sm text-gray-500">Booking #{booking.booking_number}</p>
//           </div>

//           {isAwaitingApproval && (
//             <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-lg p-6 mb-6">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">🎉</div>
//                 <div>
//                   <h2 className="text-lg font-bold text-gray-900">Job Completed by Provider!</h2>
//                   <p className="text-sm text-gray-500">Please review the work and approve payment or raise a dispute.</p>
//                 </div>
//               </div>

//               {booking.timeline?.end_time && (
//                 <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Started:</span>
//                     <span className="font-medium">{formatDate(booking.timeline.start_time)} at {formatTime(booking.timeline.start_time)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Completed:</span>
//                     <span className="font-medium">{formatDate(booking.timeline.end_time)} at {formatTime(booking.timeline.end_time)}</span>
//                   </div>
//                   {actualMinutes > 0 && (
//                     <div className="flex justify-between">
//                       <span className="text-gray-500">Total Duration:</span>
//                       <span className={`font-bold ${isOvertime ? 'text-purple-600' : isProrated ? 'text-amber-600' : 'text-green-700'}`}>
//                         {formatDuration(actualMinutes)}
//                         {standardMinutes && (
//                           <span className="text-xs text-gray-400 ml-2">(estimated: {formatDuration(standardMinutes)})</span>
//                         )}
//                       </span>
//                     </div>
//                   )}
//                   {isOvertime && (
//                     <div className="mt-2 pt-2 border-t border-gray-200">
//                       <div className="flex justify-between text-purple-700">
//                         <span className="font-medium">⏱️ Overtime:</span>
//                         <span className="font-bold">{overtimeMinutes} min</span>
//                       </div>
//                       <div className="flex justify-between text-purple-700 text-xs">
//                         <span>Overtime rate:</span>
//                         <span className="font-semibold">{formatCurrency(booking.pricing?.overtime_rate || 0)}/hour</span>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               <div className={`rounded-xl p-4 mb-5 ${
//                 isOvertime ? 'bg-purple-50 border border-purple-200' : 
//                 isProrated ? 'bg-amber-50 border border-amber-200' : 
//                 'bg-green-50 border border-green-200'
//               }`}>
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm font-medium text-gray-700">
//                     {isOvertime ? 'Amount to be charged (with overtime):' : 
//                      isProrated ? 'Amount to be charged (pro-rated):' : 
//                      'Amount to be charged:'}
//                   </span>
//                   <span className={`text-xl font-bold ${
//                     isOvertime ? 'text-purple-700' : 
//                     isProrated ? 'text-amber-700' : 
//                     'text-green-700'
//                   }`}>
//                     {formatCurrency(finalAmount || booking.pricing?.base_price || 0)}
//                   </span>
//                 </div>
//                 {isOvertime && (
//                   <p className="text-xs text-purple-600 mt-1">
//                     ⏰ Includes {overtimeMinutes}min overtime (+{formatCurrency(finalAmount - booking.pricing?.base_price)})
//                   </p>
//                 )}
//                 {isProrated && (
//                   <p className="text-xs text-amber-600 mt-1">
//                     ⏱️ You're only paying for {actualMinutes}min worked
//                   </p>
//                 )}
//                 {!isOvertime && !isProrated && (
//                   <p className="text-xs text-gray-500 mt-1">Payment was held securely. It will be released upon your approval.</p>
//                 )}
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setShowConfirmModal(true)}
//                   disabled={actionLoading}
//                   className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-base transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
//                 >
//                   {actionLoading ? (
//                     <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   ) : (
//                     <>✅ Approve & Pay</>
//                   )}
//                 </button>
//                 <button
//                   onClick={() => setShowDisputeModal(true)}
//                   disabled={actionLoading}
//                   className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 py-4 rounded-xl font-bold text-base transition active:scale-95 disabled:opacity-50"
//                 >
//                   ⚠️ Dispute
//                 </button>
//               </div>

//               <p className="text-xs text-center text-gray-400 mt-3">
//                 If no action is taken within 12 hours, payment will be automatically released.
//               </p>
//             </div>
//           )}

//           {booking.status === 'disputed' && (
//             <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-6">
//               <div className="flex items-center gap-3">
//                 <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
//                 <div>
//                   <h3 className="font-bold text-red-700">Dispute Under Review</h3>
//                   <p className="text-sm text-red-600 mt-1">Our admin team will review your dispute and contact you within 24 hours.</p>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="flex gap-1 md:gap-2 mb-6 border-b border-gray-200 overflow-x-auto pb-1">
//             {['details', hasPhotos && 'photos', canChat && 'chat'].filter(Boolean).map(tab => (
//               <button key={tab} onClick={() => setActiveTab(tab)}
//                 className={`px-4 py-2 text-sm font-medium transition border-b-2 whitespace-nowrap capitalize ${
//                   activeTab === tab ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}>
//                 {tab === 'chat' ? `Chat ${booking.message_count ? `(${booking.message_count})` : ''}` : tab.charAt(0).toUpperCase() + tab.slice(1)}
//               </button>
//             ))}
//           </div>

//           {activeTab === 'details' && (
//             <div className="space-y-6">
//               {booking.provider && (
//                 <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
//                   <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//                     <User className="w-5 h-5 text-green-600" /> Service Provider
//                   </h2>
//                   <div className="flex flex-col sm:flex-row items-start gap-4">
//                     <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
//                       {booking.provider.name?.[0]?.toUpperCase() || 'P'}
//                     </div>
//                     <div className="flex-1">
//                       <h3 className="font-bold text-gray-900 text-lg">{booking.provider.name || 'Provider'}</h3>
//                       {booking.provider.rating > 0 && (
//                         <div className="flex items-center gap-1 mt-1">
//                           <Star className="w-4 h-4 text-yellow-400 fill-current" />
//                           <span className="text-sm font-medium">{booking.provider.rating.toFixed(1)}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
//                 <h2 className="text-lg font-bold text-gray-900 mb-4">Job Details</h2>
//                 <div className="space-y-4">
//                   <div className="flex items-start gap-3">
//                     <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="text-sm font-medium text-gray-900">Date & Time</p>
//                       <p className="text-sm text-gray-600">{formatDate(booking.job?.date)}</p>
//                       <p className="text-sm text-gray-600">{formatTimeSlot(booking.job?.time_slot)}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="text-sm font-medium text-gray-900">Location</p>
//                       <p className="text-sm text-gray-600">{booking.location?.address_line1}</p>
//                       {booking.location?.address_line2 && <p className="text-sm text-gray-600">{booking.location.address_line2}</p>}
//                       <p className="text-sm text-gray-600">{booking.location?.city}, {booking.location?.postal_code}</p>
//                     </div>
//                   </div>
//                   {booking.job?.description && (
//                     <div className="flex items-start gap-3">
//                       <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
//                       <div>
//                         <p className="text-sm font-medium text-gray-900">Description</p>
//                         <p className="text-sm text-gray-600 whitespace-pre-line">{booking.job.description}</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
//                 <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//                   <CreditCard className="w-5 h-5 text-green-600" /> Payment Details
//                 </h2>
//                 <div className="space-y-3">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Base Price</span>
//                     <span className="font-medium">{formatCurrency(booking.pricing?.base_price || 0)}</span>
//                   </div>
//                   {booking.pricing?.overtime_minutes > 0 && (
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Overtime ({booking.pricing.overtime_minutes} min)</span>
//                       <span className="font-medium text-purple-600">+{formatCurrency(booking.pricing.overtime_earnings)}</span>
//                     </div>
//                   )}
//                   {isProrated && (
//                     <div className="flex justify-between text-sm text-amber-600">
//                       <span className="text-gray-600">Pro-rated adjustment</span>
//                       <span className="font-medium">-{formatCurrency((booking.pricing?.base_price || 0) - (finalAmount || 0))}</span>
//                     </div>
//                   )}
//                   <div className="border-t border-gray-200 pt-3 mt-3">
//                     <div className="flex justify-between">
//                       <span className="font-bold">Total</span>
//                       <span className="font-bold text-green-600 text-lg">
//                         {formatCurrency(finalAmount || booking.pricing?.total || 0)}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="flex justify-between text-sm pt-1">
//                     <span className="text-gray-500">Payment Status</span>
//                     <span className={`font-semibold ${booking.payment?.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
//                       {booking.payment?.status?.toUpperCase() || 'PENDING'}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {booking.status_history?.length > 0 && (
//                 <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
//                   <h2 className="text-lg font-bold text-gray-900 mb-4">Status Timeline</h2>
//                   <div className="space-y-4">
//                     {booking.status_history.map((history, index) => {
//                       let displayNotes = history.notes
//                       if (displayNotes?.includes('Commission set to') || 
//                           displayNotes?.includes('Admin:') ||
//                           displayNotes?.includes('MANUAL') ||
//                           displayNotes?.includes('transfer')) {
//                         displayNotes = ''
//                       }
//                       return (
//                         <div key={index} className="flex gap-3">
//                           <div className="relative">
//                             <div className="w-2 h-2 mt-2 rounded-full bg-green-600"></div>
//                             {index < booking.status_history.length - 1 && (
//                               <div className="absolute top-4 left-1 w-0.5 h-12 bg-gray-200"></div>
//                             )}
//                           </div>
//                           <div className="flex-1 pb-4">
//                             <p className="text-sm font-semibold text-gray-900">{history.status?.replace(/_/g, ' ').toUpperCase()}</p>
//                             {displayNotes && displayNotes !== 'Booking created' && (
//                               <p className="text-xs text-gray-500 mt-1">{displayNotes}</p>
//                             )}
//                             <p className="text-xs text-gray-400 mt-1">{formatDate(history.created_at)} at {formatTime(history.created_at)}</p>
//                           </div>
//                         </div>
//                       )
//                     })}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'photos' && hasPhotos && (
//             <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
//               <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
//                 <ImageIcon className="w-5 h-5 text-green-600" /> Job Photos
//               </h2>
//               {booking.photos?.booking_photos?.length > 0 && (
//                 <div className="mb-6">
//                   <h3 className="text-sm font-semibold text-gray-700 mb-3">Booking Photos</h3>
//                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                     {booking.photos.booking_photos.map((photo, index) => (
//                       <div key={index} className="relative group cursor-pointer" onClick={() => setSelectedImage(photo.photo_url)}>
//                         <img src={photo.photo_url} alt={`Photo ${index + 1}`} className="w-full h-40 object-cover rounded-xl border border-gray-200" />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//               {booking.photos?.job_photos?.length > 0 && (
//                 <div>
//                   <h3 className="text-sm font-semibold text-gray-700 mb-3">Work Photos (Before / After)</h3>
//                   <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                     {booking.photos.job_photos.map((photo, index) => (
//                       <div key={index} className="relative group cursor-pointer" onClick={() => setSelectedImage(photo.photo_url)}>
//                         <img src={photo.photo_url} alt={`${photo.photo_type}`} className="w-full h-40 object-cover rounded-xl border border-gray-200" />
//                         <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">{photo.photo_type}</div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {activeTab === 'chat' && canChat && booking.provider && (
//             <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
//               <div className="h-[500px]">
//                 <ChatBox bookingId={booking.id} currentUserType="customer" />
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {showDisputeModal && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
//             <h3 className="text-lg font-bold text-gray-900 mb-2">Raise a Dispute</h3>
//             <p className="text-sm text-gray-500 mb-4">Please explain the issue with the completed work. Admin will review within 24 hours.</p>
//             <textarea
//               value={disputeReason}
//               onChange={(e) => setDisputeReason(e.target.value)}
//               placeholder="Describe the issue (e.g., work not finished, damage caused...)"
//               rows={4}
//               className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300 mb-4"
//             />
//             <div className="flex gap-3">
//               <button
//                 onClick={handleDispute}
//                 disabled={actionLoading || !disputeReason.trim()}
//                 className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
//               >
//                 {actionLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Submit Dispute'}
//               </button>
//               <button
//                 onClick={() => { setShowDisputeModal(false); setDisputeReason('') }}
//                 className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {selectedImage && (
//         <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
//           <img src={selectedImage} alt="Full size" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
//           <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center">✕</button>
//         </div>
//       )}

//       <style jsx>{`
//         @keyframes slideIn {
//           from {
//             transform: translateX(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateX(0);
//             opacity: 1;
//           }
//         }
//         .animate-slideIn {
//           animation: slideIn 0.3s ease-out;
//         }
//       `}</style>
//     </>
//   )
// }



























'use client'

import { useState, useEffect } from 'react'
import { useAuth } from 'src/context/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import ChatBox from '@/components/ChatBox'
import {
  Calendar, Clock, MapPin, User, Phone, Mail,
  Star, MessageCircle, ArrowLeft, CreditCard,
  CheckCircle, XCircle, AlertCircle, Image as ImageIcon, Clock as TimerIcon
} from 'lucide-react'

function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-medium max-w-sm animate-slideIn ${bgColor}`}>
      <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white/20 text-base">{icon}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-auto text-white/70 hover:text-white">✕</button>
    </div>
  )
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message, amount, duration, overtime, isProrated, isOvertime, standardMinutes, actualMinutes, basePrice }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💰</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500 mb-3">{message}</p>
          
          {/* Time breakdown */}
          <div className="bg-gray-50 rounded-xl p-3 mb-3 text-left">
            <div className="flex items-center gap-2 mb-2">
              <TimerIcon className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-semibold text-gray-700">Time Breakdown</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated:</span>
                <span className="font-medium">{standardMinutes} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Actual worked:</span>
                <span className={`font-bold ${isOvertime ? 'text-purple-600' : isProrated ? 'text-amber-600' : 'text-green-600'}`}>
                  {actualMinutes} min
                </span>
              </div>
              {isProrated && (
                <div className="flex justify-between text-amber-600">
                  <span>Pro-rated discount:</span>
                  <span>-${(basePrice - parseFloat(amount.replace('$', ''))).toFixed(2)}</span>
                </div>
              )}
              {isOvertime && overtime > 0 && (
                <div className="flex justify-between text-purple-600">
                  <span>Overtime ({overtime} min):</span>
                  <span>+${(parseFloat(amount.replace('$', '')) - basePrice).toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {duration && (
            <p className="text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full inline-block mb-2">
              ⏱️ Worked: {duration}
            </p>
          )}
          
          {amount && (
            <div className={`rounded-xl p-3 mt-2 ${
              isOvertime ? 'bg-purple-50 border border-purple-200' : 
              isProrated ? 'bg-amber-50 border border-amber-200' : 
              'bg-green-50 border border-green-200'
            }`}>
              <p className="text-xs text-gray-500 mb-1">Final amount to charge</p>
              <p className={`text-2xl font-extrabold ${
                isOvertime ? 'text-purple-700' : 
                isProrated ? 'text-amber-700' : 
                'text-green-700'
              }`}>
                {amount}
              </p>
              {isProrated && (
                <p className="text-xs text-amber-600 mt-1">
                  You&apos;re only paying for {actualMinutes}min worked
                </p>
              )}
              {isOvertime && (
                <p className="text-xs text-purple-600 mt-1">
                  Includes {overtime}min overtime
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition">
            Confirm & Pay
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BookingDetails() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('details')
  const [selectedImage, setSelectedImage] = useState(null)

  const [actionLoading, setActionLoading] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [toast, setToast] = useState({ message: '', type: '' })

  useEffect(() => {
    if (!user) { router.push('/'); return }
    loadBookingDetails()
  }, [user, bookingId])

  const loadBookingDetails = async () => {
    try {
      const res = await fetch(`/api/customer/booking-details?bookingId=${bookingId}`)
      const data = await res.json()
      if (data.success) {
        setBooking(data.booking)
      } else {
        setError(data.message)
      }
    } catch {
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      const res = await fetch(`/api/customer/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      })
      const data = await res.json()
      if (data.success) {
        setToast({ 
          message: data.message || '✅ Payment released successfully!', 
          type: 'success' 
        })
        setTimeout(() => router.push('/my-bookings'), 2000)
      } else {
        setToast({ 
          message: data.message || 'Failed to approve', 
          type: 'error' 
        })
      }
    } catch {
      setToast({ 
        message: 'Something went wrong. Try again.', 
        type: 'error' 
      })
    } finally {
      setActionLoading(false)
      setShowConfirmModal(false)
    }
  }

  const handleDispute = async () => {
    if (!disputeReason.trim()) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/customer/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dispute', dispute_reason: disputeReason })
      })
      const data = await res.json()
      if (data.success) {
        setShowDisputeModal(false)
        setToast({ 
          message: data.message || '⚠️ Dispute raised. Admin will review within 24 hours.', 
          type: 'warning' 
        })
        loadBookingDetails()
      } else {
        setToast({ 
          message: data.message || 'Failed to raise dispute', 
          type: 'error' 
        })
      }
    } catch {
      setToast({ 
        message: 'Something went wrong. Try again.', 
        type: 'error' 
      })
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'matching': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'in_progress': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'awaiting_approval': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'completed': return 'bg-green-50 text-green-700 border-green-200'
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200'
      case 'disputed': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
  }

  const formatTime = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (minutes) => {
    if (!minutes) return ''
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 }).format(amount || 0)
  }

  const formatTimeSlot = (slot) => {
    const slots = { 'morning': '8:00 AM - 12:00 PM', 'afternoon': '12:00 PM - 5:00 PM', 'evening': '5:00 PM - 9:00 PM' }
    return slots[slot] || slot
  }

  const calculateFinalAmount = () => {
    if (!booking?.timeline?.actual_duration_minutes) return booking?.pricing?.base_price || 0
    
    const actual = booking.timeline.actual_duration_minutes
    const standard = booking.service?.duration || 60
    const basePrice = booking.pricing?.base_price || 0
    const overtimeRate = booking.pricing?.overtime_rate || 0
    
    // Pro-rated if less time
    if (actual < standard) {
      const percentage = actual / standard
      return Math.round((basePrice * percentage) * 100) / 100
    }
    
    // Overtime if more time
    if (actual > standard && overtimeRate > 0) {
      const overtimeMins = actual - standard
      const overtimeCost = (overtimeRate / 60) * overtimeMins
      return basePrice + overtimeCost
    }
    
    return basePrice
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    )
  }

  if (error || !booking) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
              <p className="text-gray-500 mb-6">{error || 'Booking does not exist'}</p>
              <Link href="/customer/my-bookings" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition">
                <ArrowLeft className="w-4 h-4" /> Back to My Bookings
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  const canChat = booking.status === 'confirmed' || booking.status === 'in_progress'
  const hasPhotos = (booking.photos?.booking_photos?.length > 0) || (booking.photos?.job_photos?.length > 0)
  const isAwaitingApproval = booking.status === 'awaiting_approval'
  
  const actualMinutes = booking.timeline?.actual_duration_minutes || 0
  const standardMinutes = booking.service?.duration || 60
  const basePrice = booking.pricing?.base_price || 0
  const overtimeRate = booking.pricing?.overtime_rate || 0
  const finalAmount = calculateFinalAmount()
  const overtimeMinutes = actualMinutes > standardMinutes ? actualMinutes - standardMinutes : 0
  const isProrated = actualMinutes < standardMinutes && actualMinutes > 0
  const isOvertime = actualMinutes > standardMinutes

  return (
    <>
      <Header />
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: '' })} 
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleApprove}
        title="Confirm Payment"
        message={
          isProrated 
            ? `Provider worked ${actualMinutes}min of ${standardMinutes}min. You'll be charged only for time worked.`
            : isOvertime
            ? `Provider worked ${actualMinutes}min (${standardMinutes}min + ${overtimeMinutes}min overtime). Overtime rate: ${formatCurrency(overtimeRate)}/hour.`
            : 'Release payment to provider?'
        }
        amount={formatCurrency(finalAmount)}
        duration={actualMinutes ? formatDuration(actualMinutes) : null}
        overtime={overtimeMinutes}
        isProrated={isProrated}
        isOvertime={isOvertime}
        standardMinutes={standardMinutes}
        actualMinutes={actualMinutes}
        basePrice={basePrice}
      />

      <div className="min-h-screen bg-gray-50 py-6 md:py-8">
        <div className="max-w-5xl mx-auto px-4">

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link href="/customer/my-bookings" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
              <span className="text-sm font-medium">Back to Bookings</span>
            </Link>
            <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
              {booking.status?.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{booking.service?.name || 'Service'}</h1>
            <p className="text-sm text-gray-500">Booking #{booking.booking_number}</p>
          </div>

          {isAwaitingApproval && (
            <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">🎉</div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Job Completed by Provider!</h2>
                  <p className="text-sm text-gray-500">Please review the work and approve payment or raise a dispute.</p>
                </div>
              </div>

              {booking.timeline?.end_time && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Started:</span>
                    <span className="font-medium">{formatDate(booking.timeline.start_time)} at {formatTime(booking.timeline.start_time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Completed:</span>
                    <span className="font-medium">{formatDate(booking.timeline.end_time)} at {formatTime(booking.timeline.end_time)}</span>
                  </div>
                  {actualMinutes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Duration:</span>
                      <span className={`font-bold ${isOvertime ? 'text-purple-600' : isProrated ? 'text-amber-600' : 'text-green-700'}`}>
                        {formatDuration(actualMinutes)}
                        {standardMinutes && (
                          <span className="text-xs text-gray-400 ml-2">(estimated: {formatDuration(standardMinutes)})</span>
                        )}
                      </span>
                    </div>
                  )}
                  {isOvertime && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex justify-between text-purple-700">
                        <span className="font-medium">⏱️ Overtime:</span>
                        <span className="font-bold">{overtimeMinutes} min</span>
                      </div>
                      <div className="flex justify-between text-purple-700 text-xs">
                        <span>Overtime rate:</span>
                        <span className="font-semibold">{formatCurrency(overtimeRate)}/hour</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className={`rounded-xl p-4 mb-5 ${
                isOvertime ? 'bg-purple-50 border border-purple-200' : 
                isProrated ? 'bg-amber-50 border border-amber-200' : 
                'bg-green-50 border border-green-200'
              }`}>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {isOvertime ? 'Final amount (with overtime):' : 
                     isProrated ? 'Final amount (pro-rated):' : 
                     'Final amount:'}
                  </span>
                  <span className={`text-xl font-bold ${
                    isOvertime ? 'text-purple-700' : 
                    isProrated ? 'text-amber-700' : 
                    'text-green-700'
                  }`}>
                    {formatCurrency(finalAmount)}
                  </span>
                </div>
                
                {/* Time breakdown */}
                <div className="mt-3 text-xs border-t pt-2 border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Base price ({standardMinutes}min):</span>
                    <span>{formatCurrency(basePrice)}</span>
                  </div>
                  {isProrated && (
                    <div className="flex justify-between text-amber-600">
                      <span>Pro-rated ({actualMinutes}min):</span>
                      <span>-{formatCurrency(basePrice - finalAmount)}</span>
                    </div>
                  )}
                  {isOvertime && (
                    <div className="flex justify-between text-purple-600">
                      <span>Overtime ({overtimeMinutes}min):</span>
                      <span>+{formatCurrency(finalAmount - basePrice)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold mt-1 pt-1 border-t border-gray-200">
                    <span>You pay:</span>
                    <span className={isOvertime ? 'text-purple-700' : isProrated ? 'text-amber-700' : 'text-green-700'}>
                      {formatCurrency(finalAmount)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {isProrated 
                    ? `⏱️ You're only paying for ${actualMinutes}min worked (${Math.round((actualMinutes/standardMinutes)*100)}% of estimated time)`
                    : isOvertime
                    ? `⏰ Includes ${overtimeMinutes}min overtime at ${formatCurrency(overtimeRate)}/hour`
                    : '✅ Payment was held securely. Final amount matches estimate.'
                  }
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-base transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>✅ Approve & Pay {formatCurrency(finalAmount)}</>
                  )}
                </button>
                <button
                  onClick={() => setShowDisputeModal(true)}
                  disabled={actionLoading}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 py-4 rounded-xl font-bold text-base transition active:scale-95 disabled:opacity-50"
                >
                  ⚠️ Dispute
                </button>
              </div>

              <p className="text-xs text-center text-gray-400 mt-3">
                If no action is taken within 12 hours, payment will be automatically released.
              </p>
            </div>
          )}

          {booking.status === 'disputed' && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-700">Dispute Under Review</h3>
                  <p className="text-sm text-red-600 mt-1">Our admin team will review your dispute and contact you within 24 hours.</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-1 md:gap-2 mb-6 border-b border-gray-200 overflow-x-auto pb-1">
            {['details', hasPhotos && 'photos', canChat && 'chat'].filter(Boolean).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition border-b-2 whitespace-nowrap capitalize ${
                  activeTab === tab ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {tab === 'chat' ? `Chat ${booking.message_count ? `(${booking.message_count})` : ''}` : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'details' && (
            <div className="space-y-6">
              {booking.provider && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" /> Service Provider
                  </h2>
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {booking.provider.name?.[0]?.toUpperCase() || 'P'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{booking.provider.name || 'Provider'}</h3>
                      {booking.provider.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{booking.provider.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Job Details</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Date & Time</p>
                      <p className="text-sm text-gray-600">{formatDate(booking.job?.date)}</p>
                      <p className="text-sm text-gray-600">{formatTimeSlot(booking.job?.time_slot)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">{booking.location?.address_line1}</p>
                      {booking.location?.address_line2 && <p className="text-sm text-gray-600">{booking.location.address_line2}</p>}
                      <p className="text-sm text-gray-600">{booking.location?.city}, {booking.location?.postal_code}</p>
                    </div>
                  </div>
                  {booking.job?.description && (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Description</p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{booking.job.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" /> Payment Details
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Price ({standardMinutes}min)</span>
                    <span className="font-medium">{formatCurrency(basePrice)}</span>
                  </div>
                  
                  {actualMinutes > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Actual time worked:</span>
                      <span className={`font-medium ${
                        isOvertime ? 'text-purple-600' : isProrated ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {formatDuration(actualMinutes)}
                      </span>
                    </div>
                  )}
                  
                  {isProrated && (
                    <div className="flex justify-between text-sm text-amber-600">
                      <span>Pro-rated adjustment ({actualMinutes}min)</span>
                      <span className="font-medium">-{formatCurrency(basePrice - finalAmount)}</span>
                    </div>
                  )}
                  
                  {isOvertime && overtimeMinutes > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Overtime ({overtimeMinutes} min)</span>
                      <span className="font-medium text-purple-600">+{formatCurrency(finalAmount - basePrice)}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className={`font-bold text-lg ${
                        isOvertime ? 'text-purple-600' : isProrated ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(finalAmount)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm pt-1">
                    <span className="text-gray-500">Payment Status</span>
                    <span className={`font-semibold ${booking.payment?.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                      {booking.payment?.status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>

                  {/* Info message about pro-rated payment */}
                  {booking.status === 'awaiting_approval' && (
                    <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-700">
                        <span className="font-bold">ℹ️ How payment works:</span> You&apos;ll only be charged for actual time worked.
                        {isProrated 
                          ? ` Since job took ${actualMinutes}min (less than estimated), you pay ${Math.round((actualMinutes/standardMinutes)*100)}% of base price.`
                          : isOvertime
                          ? ` Overtime rate: ${formatCurrency(overtimeRate)}/hour.`
                          : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {booking.status_history?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Status Timeline</h2>
                  <div className="space-y-4">
                    {booking.status_history.map((history, index) => {
                      let displayNotes = history.notes
                      if (displayNotes?.includes('Commission set to') || 
                          displayNotes?.includes('Admin:') ||
                          displayNotes?.includes('MANUAL') ||
                          displayNotes?.includes('transfer')) {
                        displayNotes = ''
                      }
                      return (
                        <div key={index} className="flex gap-3">
                          <div className="relative">
                            <div className="w-2 h-2 mt-2 rounded-full bg-green-600"></div>
                            {index < booking.status_history.length - 1 && (
                              <div className="absolute top-4 left-1 w-0.5 h-12 bg-gray-200"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="text-sm font-semibold text-gray-900">{history.status?.replace(/_/g, ' ').toUpperCase()}</p>
                            {displayNotes && displayNotes !== 'Booking created' && (
                              <p className="text-xs text-gray-500 mt-1">{displayNotes}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">{formatDate(history.created_at)} at {formatTime(history.created_at)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'photos' && hasPhotos && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-green-600" /> Job Photos
              </h2>
              {booking.photos?.booking_photos?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Booking Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {booking.photos.booking_photos.map((photo, index) => (
                      <div key={index} className="relative group cursor-pointer" onClick={() => setSelectedImage(photo.photo_url)}>
                        <img src={photo.photo_url} alt={`Photo ${index + 1}`} className="w-full h-40 object-cover rounded-xl border border-gray-200" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {booking.photos?.job_photos?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Work Photos (Before / After)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {booking.photos.job_photos.map((photo, index) => (
                      <div key={index} className="relative group cursor-pointer" onClick={() => setSelectedImage(photo.photo_url)}>
                        <img src={photo.photo_url} alt={`${photo.photo_type}`} className="w-full h-40 object-cover rounded-xl border border-gray-200" />
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">{photo.photo_type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && canChat && booking.provider && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="h-[500px]">
                <ChatBox bookingId={booking.id} currentUserType="customer" />
              </div>
            </div>
          )}
        </div>
      </div>

      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Raise a Dispute</h3>
            <p className="text-sm text-gray-500 mb-4">Please explain the issue with the completed work. Admin will review within 24 hours.</p>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Describe the issue (e.g., work not finished, damage caused...)"
              rows={4}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-300 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDispute}
                disabled={actionLoading || !disputeReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Submit Dispute'}
              </button>
              <button
                onClick={() => { setShowDisputeModal(false); setDisputeReason('') }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Full size" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
          <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center">✕</button>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  )
}