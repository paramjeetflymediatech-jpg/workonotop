







// 'use client'

// import { useState, useEffect } from 'react'
// import { useAuth } from 'src/context/AuthContext'
// import { useRouter, useParams } from 'next/navigation'
// import Link from 'next/link'
// import Header from '@/components/Header'
// import ChatBox from '@/components/ChatBox'
// import {
//   Calendar, MapPin, User, ArrowLeft, CreditCard,
//   AlertCircle, Image as ImageIcon, Clock as TimerIcon
// } from 'lucide-react'

// function Toast({ message, type, onClose }) {
//   useEffect(() => {
//     if (!message) return
//     const timer = setTimeout(onClose, 4000)
//     return () => clearTimeout(timer)
//   }, [message, onClose])

//   if (!message) return null

//   return (
//     <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl text-white text-sm max-w-sm animate-slideIn ${
//       type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
//     }`}>
//       {message}
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
//     if (!user) {
//       router.push('/')
//       return
//     }
//     loadBookingDetails()
//   }, [user, bookingId])

//   const loadBookingDetails = async () => {
//     try {
//       setLoading(true)
//       setError('')
      
//       const res = await fetch(`/api/customer/booking-details?bookingId=${bookingId}`)
//       const data = await res.json()
      
//       if (!res.ok) {
//         throw new Error(data.message || `HTTP error! status: ${res.status}`)
//       }
      
//       if (data.success && data.data && data.data.length > 0) {
//         const bookingData = data.data[0]
//         setBooking(bookingData)
//       } else {
//         setError(data.message || 'Booking not found')
//       }
//     } catch (err) {
//       console.error('Error loading booking:', err)
//       setError(err.message || 'Failed to load booking details')
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
//         setToast({ message: data.message, type: 'success' })
//         setTimeout(() => router.push('/my-bookings'), 2000)
//       } else {
//         setToast({ message: data.message || 'Failed to approve', type: 'error' })
//       }
//     } catch (err) {
//       setToast({ message: 'Something went wrong', type: 'error' })
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
//         setDisputeReason('')
//         setToast({ message: data.message, type: 'warning' })
//         loadBookingDetails()
//       } else {
//         setToast({ message: data.message || 'Failed to raise dispute', type: 'error' })
//       }
//     } catch {
//       setToast({ message: 'Something went wrong', type: 'error' })
//     } finally {
//       setActionLoading(false)
//     }
//   }

//   // Helper functions
//   const formatDate = (date) => {
//     if (!date) return 'N/A'
//     return new Date(date).toLocaleDateString('en-US', { 
//       weekday: 'short', 
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric' 
//     })
//   }

//   const formatTime = (date) => {
//     if (!date) return 'N/A'
//     return new Date(date).toLocaleTimeString('en-US', { 
//       hour: '2-digit', 
//       minute: '2-digit' 
//     })
//   }

//   const formatDuration = (minutes) => {
//     if (!minutes) return '0 min'
//     if (minutes < 60) return `${minutes} min`
//     const hours = Math.floor(minutes / 60)
//     const mins = minutes % 60
//     return mins ? `${hours}h ${mins}m` : `${hours}h`
//   }

//   const formatCurrency = (amount) => {
//     return `$${parseFloat(amount || 0).toFixed(2)}`
//   }

//   const formatTimeSlot = (slot) => {
//     if (!slot) return 'N/A'
//     const slots = { 
//       morning: '8:00 AM - 12:00 PM', 
//       afternoon: '12:00 PM - 5:00 PM', 
//       evening: '5:00 PM - 9:00 PM' 
//     }
//     if (Array.isArray(slot)) {
//       return slot.map(s => slots[s] || s).join(', ')
//     }
//     return slots[slot] || slot
//   }

//   const getStatusColor = (status) => {
//     const colors = {
//       pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
//       awaiting_approval: 'bg-amber-50 text-amber-700 border-amber-200',
//       completed: 'bg-green-50 text-green-700 border-green-200',
//       disputed: 'bg-red-50 text-red-700 border-red-200',
//       cancelled: 'bg-gray-50 text-gray-700 border-gray-200'
//     }
//     return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200'
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
//             <div className="bg-white rounded-2xl p-8 text-center border">
//               <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
//               <p className="text-gray-500 mb-6">{error || 'Booking does not exist'}</p>
//               <Link href="/customer/my-bookings" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl">
//                 <ArrowLeft className="w-4 h-4" /> Back to My Bookings
//               </Link>
//             </div>
//           </div>
//         </div>
//       </>
//     )
//   }

//   // ========== FIXED CALCULATION SECTION ==========
//   const actualMinutes = booking.actual_duration_minutes || 0
//   const standardMinutes = booking.service_duration || booking.standard_duration_minutes || 60
//   const basePrice = parseFloat(booking.service_price) || 0
//   const overtimeRate = parseFloat(booking.additional_price) || 0
//   const overtimeMinutes = booking.overtime_minutes || 0
//   const overtimeEarnings = parseFloat(booking.overtime_earnings) || 0
  
//   // Calculate final amount with pro-ration
//   const calculateFinalAmount = () => {
//     // Case 1: Overtime - job took longer than standard
//     if (actualMinutes > standardMinutes && overtimeEarnings > 0) {
//       return basePrice + overtimeEarnings
//     }
    
//     // Case 2: Pro-rated - job took less time than standard
//     if (actualMinutes > 0 && actualMinutes < standardMinutes) {
//       const percentage = actualMinutes / standardMinutes
//       return Math.round((basePrice * percentage) * 100) / 100
//     }
    
//     // Case 3: Standard time or no actual time yet
//     return basePrice
//   }

//   const finalAmount = calculateFinalAmount()
  
//   // Determine if overtime or pro-rated
//   const isOvertime = actualMinutes > standardMinutes
//   const isProrated = actualMinutes > 0 && actualMinutes < standardMinutes && finalAmount < basePrice
//   // ========== END OF FIXED SECTION ==========

//   return (
//     <>
//       <Header />
      
//       {/* Toast notification */}
//       {toast.message && (
//         <Toast 
//           message={toast.message} 
//           type={toast.type} 
//           onClose={() => setToast({ message: '', type: '' })} 
//         />
//       )}

//       {/* Main content */}
//       <div className="min-h-screen bg-gray-50 py-6 md:py-8">
//         <div className="max-w-5xl mx-auto px-4">

//           {/* Header */}
//           <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
//             <Link href="/my-bookings" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
//               <ArrowLeft className="w-4 h-4" />
//               <span className="text-sm font-medium">Back to Bookings</span>
//             </Link>
//             <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
//               {booking.status?.replace('_', ' ').toUpperCase()}
//             </span>
//           </div>

//           {/* Title */}
//           <div className="mb-6">
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{booking.service_name}</h1>
//             <p className="text-sm text-gray-500">Booking #{booking.booking_number}</p>
//           </div>

//           {/* Approval Section */}
//           {booking.status === 'awaiting_approval' && (
//             <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-lg p-6 mb-6">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">🎉</div>
//                 <div>
//                   <h2 className="text-lg font-bold text-gray-900">Job Completed!</h2>
//                   <p className="text-sm text-gray-500">Review the work and approve payment or raise a dispute.</p>
//                 </div>
//               </div>

//               {/* Time Summary */}
//               {booking.end_time && (
//                 <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Started:</span>
//                     <span className="font-medium">{formatDate(booking.start_time)} at {formatTime(booking.start_time)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Completed:</span>
//                     <span className="font-medium">{formatDate(booking.end_time)} at {formatTime(booking.end_time)}</span>
//                   </div>
//                   <div className="flex justify-between pt-2 border-t">
//                     <span className="text-gray-500">Duration:</span>
//                     <span className={`font-bold ${isOvertime ? 'text-purple-600' : isProrated ? 'text-amber-600' : 'text-green-700'}`}>
//                       {formatDuration(actualMinutes)}
//                       <span className="text-xs text-gray-400 ml-2">(standard: {formatDuration(standardMinutes)})</span>
//                     </span>
//                   </div>
//                 </div>
//               )}

//               {/* Price Calculation */}
//               <div className={`rounded-xl p-4 mb-5 ${
//                 isOvertime ? 'bg-purple-50 border-purple-200' : 
//                 isProrated ? 'bg-amber-50 border-amber-200' : 
//                 'bg-green-50 border-green-200'
//               }`}>
//                 <div className="flex justify-between items-center mb-3">
//                   <span className="text-sm font-medium text-gray-700">
//                     {isOvertime ? 'Final amount (with overtime):' : 
//                      isProrated ? 'Final amount (pro-rated):' : 
//                      'Final amount:'}
//                   </span>
//                   <span className={`text-xl font-bold ${
//                     isOvertime ? 'text-purple-700' : 
//                     isProrated ? 'text-amber-700' : 
//                     'text-green-700'
//                   }`}>
//                     {formatCurrency(finalAmount)}
//                   </span>
//                 </div>
                
//                 {/* Breakdown */}
//                 <div className="text-xs border-t pt-2 space-y-1">
//                   <div className="flex justify-between text-gray-600">
//                     <span>Base price ({standardMinutes}min):</span>
//                     <span>{formatCurrency(basePrice)}</span>
//                   </div>
                  
//                   {isOvertime && overtimeEarnings > 0 && (
//                     <div className="flex justify-between text-purple-600">
//                       <span>Overtime ({overtimeMinutes}min at {formatCurrency(overtimeRate)}/hr):</span>
//                       <span>+{formatCurrency(overtimeEarnings)}</span>
//                     </div>
//                   )}
                  
//                   {isProrated && (
//                     <div className="flex justify-between text-amber-600">
//                       <span>Pro-rated ({actualMinutes}min of {standardMinutes}min):</span>
//                       <span>-{formatCurrency(basePrice - finalAmount)}</span>
//                     </div>
//                   )}
                  
//                   <div className="flex justify-between font-bold pt-1 mt-1 border-t">
//                     <span>You pay:</span>
//                     <span className={isOvertime ? 'text-purple-700' : isProrated ? 'text-amber-700' : 'text-green-700'}>
//                       {formatCurrency(finalAmount)}
//                     </span>
//                   </div>
//                 </div>

//                 <p className="text-xs text-gray-500 mt-2">
//                   {isOvertime 
//                     ? `⏰ Overtime: ${overtimeMinutes}min at ${formatCurrency(overtimeRate)}/hour`
//                     : isProrated
//                     ? `⏱️ Paying for ${actualMinutes}min worked (${Math.round((actualMinutes/standardMinutes)*100)}% of standard)`
//                     : '✅ Payment matches standard rate'
//                   }
//                 </p>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setShowConfirmModal(true)}
//                   disabled={actionLoading}
//                   className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold disabled:opacity-50"
//                 >
//                   {actionLoading ? 'Processing...' : `✅ Approve & Pay ${formatCurrency(finalAmount)}`}
//                 </button>
//                 <button
//                   onClick={() => setShowDisputeModal(true)}
//                   disabled={actionLoading}
//                   className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 py-4 rounded-xl font-bold disabled:opacity-50"
//                 >
//                   ⚠️ Dispute
//                 </button>
//               </div>

//               <p className="text-xs text-center text-gray-400 mt-3">
//                 Auto-approval in 12 hours if no action taken
//               </p>
//             </div>
//           )}

//           {/* Tabs */}
//           <div className="flex gap-2 mb-6 border-b">
//             {['details', booking.photos?.length > 0 && 'photos', booking.provider_id && 'chat'].filter(Boolean).map(tab => (
//               <button
//                 key={tab}
//                 onClick={() => setActiveTab(tab)}
//                 className={`px-4 py-2 text-sm font-medium border-b-2 capitalize ${
//                   activeTab === tab ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'
//                 }`}
//               >
//                 {tab}
//               </button>
//             ))}
//           </div>

//           {/* Details Tab */}
//           {activeTab === 'details' && (
//             <div className="space-y-6">
//               {/* Provider */}
//               {booking.provider_name && (
//                 <div className="bg-white rounded-2xl p-6 border">
//                   <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
//                     <User className="w-5 h-5 text-green-600" /> Provider
//                   </h2>
//                   <div className="flex items-center gap-4">
//                     <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold">
//                       {booking.provider_name[0]?.toUpperCase()}
//                     </div>
//                     <div>
//                       <h3 className="font-bold text-lg">{booking.provider_name}</h3>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Job Details */}
//               <div className="bg-white rounded-2xl p-6 border">
//                 <h2 className="text-lg font-bold mb-4">Job Details</h2>
//                 <div className="space-y-4">
//                   <div className="flex gap-3">
//                     <Calendar className="w-5 h-5 text-green-600 flex-shrink-0" />
//                     <div>
//                       <p className="text-sm font-medium">Date & Time</p>
//                       <p className="text-sm text-gray-600">{formatDate(booking.job_date)}</p>
//                       <p className="text-sm text-gray-600">{formatTimeSlot(booking.job_time_slot)}</p>
//                     </div>
//                   </div>
//                   <div className="flex gap-3">
//                     <MapPin className="w-5 h-5 text-green-600 flex-shrink-0" />
//                     <div>
//                       <p className="text-sm font-medium">Location</p>
//                       <p className="text-sm text-gray-600">{booking.address_line1}</p>
//                       {booking.address_line2 && <p className="text-sm text-gray-600">{booking.address_line2}</p>}
//                       <p className="text-sm text-gray-600">{booking.city}</p>
//                     </div>
//                   </div>
//                   {booking.job_description && (
//                     <div className="flex gap-3">
//                       <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
//                       <div>
//                         <p className="text-sm font-medium">Description</p>
//                         <p className="text-sm text-gray-600">{booking.job_description}</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Payment Details */}
//               <div className="bg-white rounded-2xl p-6 border">
//                 <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
//                   <CreditCard className="w-5 h-5 text-green-600" /> Payment Details
//                 </h2>
//                 <div className="space-y-3">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Base Price ({standardMinutes}min):</span>
//                     <span className="font-medium">{formatCurrency(basePrice)}</span>
//                   </div>
                  
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Actual time worked:</span>
//                     <span className={`font-medium ${isOvertime ? 'text-purple-600' : isProrated ? 'text-amber-600' : 'text-green-600'}`}>
//                       {formatDuration(actualMinutes)}
//                     </span>
//                   </div>
                  
//                   {isOvertime && overtimeEarnings > 0 && (
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Overtime ({overtimeMinutes}min):</span>
//                       <span className="font-medium text-purple-600">+{formatCurrency(overtimeEarnings)}</span>
//                     </div>
//                   )}
                  
//                   {isProrated && (
//                     <div className="flex justify-between text-sm text-amber-600">
//                       <span>Pro-rated adjustment:</span>
//                       <span className="font-medium">-{formatCurrency(basePrice - finalAmount)}</span>
//                     </div>
//                   )}
                  
//                   <div className="border-t pt-3 mt-3">
//                     <div className="flex justify-between">
//                       <span className="font-bold">Total</span>
//                       <span className={`font-bold text-lg ${
//                         isOvertime ? 'text-purple-600' : isProrated ? 'text-amber-600' : 'text-green-600'
//                       }`}>
//                         {formatCurrency(finalAmount)}
//                       </span>
//                     </div>
//                   </div>
                  
//                   <div className="flex justify-between text-sm pt-1">
//                     <span className="text-gray-500">Payment Status</span>
//                     <span className="font-semibold text-amber-600">
//                       {booking.payment_status?.toUpperCase() || 'PENDING'}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Photos Tab */}
//           {activeTab === 'photos' && booking.photos?.length > 0 && (
//             <div className="bg-white rounded-2xl p-6 border">
//               <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
//                 <ImageIcon className="w-5 h-5 text-green-600" /> Photos
//               </h2>
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 {booking.photos.map((photo, index) => (
//                   photo && (
//                     <div key={index} className="cursor-pointer" onClick={() => setSelectedImage(photo)}>
//                       <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-40 object-cover rounded-xl border" />
//                     </div>
//                   )
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Confirm Modal */}
//       {showConfirmModal && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl w-full max-w-sm p-6">
//             <h3 className="text-lg font-bold mb-2">Confirm Payment</h3>
//             <div className={`rounded-xl p-4 mb-4 ${
//               isOvertime ? 'bg-purple-50 border-purple-200' : 
//               isProrated ? 'bg-amber-50 border-amber-200' : 
//               'bg-green-50 border-green-200'
//             }`}>
//               <div className="flex justify-between mb-2">
//                 <span>Base price:</span>
//                 <span className="font-bold">{formatCurrency(basePrice)}</span>
//               </div>
              
//               {/* Fixed: Added pro-rated discount section */}
//               {isProrated && (
//                 <div className="flex justify-between mb-2 text-amber-600">
//                   <span>Pro-rated discount ({actualMinutes}min of {standardMinutes}min):</span>
//                   <span className="font-bold">-{formatCurrency(basePrice - finalAmount)}</span>
//                 </div>
//               )}
              
//               {isOvertime && overtimeEarnings > 0 && (
//                 <div className="flex justify-between mb-2 text-purple-600">
//                   <span>Overtime ({overtimeMinutes}min):</span>
//                   <span className="font-bold">+{formatCurrency(overtimeEarnings)}</span>
//                 </div>
//               )}
              
//               <div className="border-t pt-2 mt-2">
//                 <div className="flex justify-between">
//                   <span className="font-bold">Total:</span>
//                   <span className={`text-xl font-bold ${
//                     isOvertime ? 'text-purple-700' : isProrated ? 'text-amber-700' : 'text-green-700'
//                   }`}>
//                     {formatCurrency(finalAmount)}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <div className="flex gap-3">
//               <button 
//                 onClick={() => setShowConfirmModal(false)} 
//                 className="flex-1 py-2.5 border rounded-xl"
//               >
//                 Cancel
//               </button>
//               <button 
//                 onClick={handleApprove} 
//                 className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold"
//                 disabled={actionLoading}
//               >
//                 {actionLoading ? 'Processing...' : 'Confirm'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Dispute Modal */}
//       {showDisputeModal && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl w-full max-w-md p-6">
//             <h3 className="text-lg font-bold mb-2">Raise a Dispute</h3>
//             <textarea
//               value={disputeReason}
//               onChange={(e) => setDisputeReason(e.target.value)}
//               placeholder="Describe the issue..."
//               rows={4}
//               className="w-full border rounded-xl p-3 text-sm mb-4"
//             />
//             <div className="flex gap-3">
//               <button
//                 onClick={handleDispute}
//                 disabled={actionLoading || !disputeReason.trim()}
//                 className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
//               >
//                 {actionLoading ? 'Submitting...' : 'Submit'}
//               </button>
//               <button
//                 onClick={() => { setShowDisputeModal(false); setDisputeReason('') }}
//                 className="flex-1 bg-gray-100 py-3 rounded-xl font-bold"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Image Modal */}
//       {selectedImage && (
//         <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
//           <img src={selectedImage} alt="Full size" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
//           <button 
//             onClick={() => setSelectedImage(null)} 
//             className="absolute top-4 right-4 bg-white/20 text-white w-10 h-10 rounded-full hover:bg-white/30"
//           >
//             ✕
//           </button>
//         </div>
//       )}
//     </>
//   )
// }







// 'use client'

// import { useState, useEffect } from 'react'
// import { useAuth } from 'src/context/AuthContext'
// import { useRouter, useParams } from 'next/navigation'
// import Link from 'next/link'
// import Header from '@/components/Header'
// import {
//   Calendar, MapPin, User, ArrowLeft, CreditCard,
//   AlertCircle, Clock, CheckCircle, Image as ImageIcon
// } from 'lucide-react'

// // ── Toast ────────────────────────────────────────────────────────────────────
// function Toast({ message, type, onClose }) {
//   useEffect(() => {
//     if (!message) return
//     const t = setTimeout(onClose, 4000)
//     return () => clearTimeout(t)
//   }, [message, onClose])
//   if (!message) return null
//   return (
//     <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl text-white text-sm max-w-sm
//       ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
//       {message}
//     </div>
//   )
// }

// // ── Lightbox ─────────────────────────────────────────────────────────────────
// function Lightbox({ src, onClose }) {
//   if (!src) return null
//   return (
//     <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
//       <button className="absolute top-4 right-6 text-white text-4xl font-light" onClick={onClose}>×</button>
//       <img src={src} alt="Full size" className="max-w-full max-h-[90vh] object-contain rounded-xl"
//         onClick={e => e.stopPropagation()} />
//     </div>
//   )
// }

// // ── Photo grid ───────────────────────────────────────────────────────────────
// function PhotoGrid({ photos, onOpen }) {
//   const [errors, setErrors] = useState({})
//   if (!photos?.length) return null

//   const getPhotoSrc = (url) => {
//     if (!url) return null
//     if (url.startsWith('http')) return url
//     return `${process.env.NEXT_PUBLIC_API_URL || ''}${url}`
//   }

//   return (
//     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//       {photos.map((photo, i) => {
//         const src = getPhotoSrc(typeof photo === 'string' ? photo : photo?.url)
//         if (!src) return null
//         return (
//           <div key={i} onClick={() => onOpen(src)}
//             className="aspect-square rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition shadow-sm">
//             {errors[i]
//               ? <div className="w-full h-full bg-gray-100 flex items-center justify-center text-2xl">🖼️</div>
//               : <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover"
//                   onError={() => setErrors(p => ({ ...p, [i]: true }))} />
//             }
//           </div>
//         )
//       })}
//     </div>
//   )
// }

// // ── Pro-rate calculation (mirrors backend calcFinalAmount) ────────────────────
// function calcFinalAmount(basePrice, standardMins, actualMins, overtimeRate = 0) {
//   if (actualMins <= 0) return basePrice

//   // Job took LESS time → pro-rate the charge
//   if (actualMins < standardMins) {
//     const percentageWorked = actualMins / standardMins
//     return Math.round((basePrice * percentageWorked) * 100) / 100
//   }

//   // Job took MORE time → add overtime (capped at 2hrs = 120 mins)
//   if (actualMins > standardMins && overtimeRate > 0) {
//     const overtimeMins = Math.min(actualMins - standardMins, 120)
//     return Math.round((basePrice + (overtimeRate * overtimeMins / 60)) * 100) / 100
//   }

//   // Exact time → full base price
//   return basePrice
// }

// // ── Main page ─────────────────────────────────────────────────────────────────
// export default function CustomerBookingDetails() {
//   const { user } = useAuth()
//   const router = useRouter()
//   const params = useParams()
//   const bookingId = params.id

//   const [booking, setBooking]           = useState(null)
//   const [loading, setLoading]           = useState(true)
//   const [error, setError]               = useState('')
//   const [activeTab, setActiveTab]       = useState('details')
//   const [lightbox, setLightbox]         = useState(null)
//   const [actionLoading, setActionLoading] = useState(false)
//   const [showDisputeModal, setShowDisputeModal] = useState(false)
//   const [showConfirmModal, setShowConfirmModal] = useState(false)
//   const [disputeReason, setDisputeReason] = useState('')
//   const [toast, setToast]               = useState({ message: '', type: '' })

//   useEffect(() => {
//     if (!user) { router.push('/'); return }
//     loadBooking()
//   }, [user, bookingId])

//   const loadBooking = async () => {
//     try {
//       setLoading(true)
//       setError('')
//       const res  = await fetch(`/api/customer/booking-details?bookingId=${bookingId}`)
//       const data = await res.json()
//       if (data.success && data.data?.length > 0) {
//         setBooking(data.data[0])
//       } else {
//         setError(data.message || 'Booking not found')
//       }
//     } catch (err) {
//       setError(err.message || 'Failed to load booking')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const notify = (message, type = 'success') => setToast({ message, type })

//   const handleApprove = async () => {
//     setActionLoading(true)
//     try {
//       const res  = await fetch(`/api/customer/bookings/${bookingId}/approve`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ action: 'approve' })
//       })
//       const data = await res.json()
//       if (data.success) {
//         notify(data.message)
//         setTimeout(() => router.push('/my-bookings'), 2000)
//       } else {
//         notify(data.message || 'Failed to approve', 'error')
//       }
//     } catch { notify('Something went wrong', 'error') }
//     finally { setActionLoading(false); setShowConfirmModal(false) }
//   }

//   const handleDispute = async () => {
//     if (!disputeReason.trim()) return
//     setActionLoading(true)
//     try {
//       const res  = await fetch(`/api/customer/bookings/${bookingId}/approve`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ action: 'dispute', dispute_reason: disputeReason })
//       })
//       const data = await res.json()
//       if (data.success) {
//         setShowDisputeModal(false)
//         setDisputeReason('')
//         notify(data.message, 'warning')
//         loadBooking()
//       } else {
//         notify(data.message || 'Failed to raise dispute', 'error')
//       }
//     } catch { notify('Something went wrong', 'error') }
//     finally { setActionLoading(false) }
//   }

//   // ── Helpers ──────────────────────────────────────────────────────────────
//   const fmt = (n) => `$${parseFloat(n || 0).toFixed(2)}`

//   const formatDate = (d) => {
//     if (!d) return 'N/A'
//     return new Date(d).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
//   }
//   const formatTime = (d) => {
//     if (!d) return 'N/A'
//     return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
//   }
//   const formatDuration = (m) => {
//     if (!m) return '0 min'
//     if (m < 60) return `${m} min`
//     const h = Math.floor(m / 60), rem = m % 60
//     return rem ? `${h}h ${rem}m` : `${h}h`
//   }
//   const formatSlot = (slot) => {
//     const map = { morning: '8:00 AM – 12:00 PM', afternoon: '12:00 PM – 5:00 PM', evening: '5:00 PM – 9:00 PM' }
//     if (Array.isArray(slot)) return slot.map(s => map[s] || s).join(', ')
//     return map[slot] || slot || 'N/A'
//   }
//   const statusColor = (s) => ({
//     pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
//     confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
//     in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
//     awaiting_approval: 'bg-amber-50 text-amber-700 border-amber-200',
//     completed: 'bg-green-50 text-green-700 border-green-200',
//     disputed: 'bg-red-50 text-red-700 border-red-200',
//     cancelled: 'bg-gray-50 text-gray-700 border-gray-200',
//   }[s] || 'bg-gray-50 text-gray-700 border-gray-200')

//   // ── Loading / Error states ────────────────────────────────────────────────
//   if (loading) return (
//     <>
//       <Header />
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
//       </div>
//     </>
//   )

//   if (error || !booking) return (
//     <>
//       <Header />
//       <div className="min-h-screen bg-gray-50 py-8">
//         <div className="max-w-3xl mx-auto px-4">
//           <div className="bg-white rounded-2xl p-8 text-center border">
//             <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
//             <p className="text-gray-500 mb-6">{error || 'Booking does not exist'}</p>
//             <Link href="/my-bookings" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl">
//               <ArrowLeft className="w-4 h-4" /> Back to My Bookings
//             </Link>
//           </div>
//         </div>
//       </div>
//     </>
//   )

//   // ── Payment calculation (pro-rated, matches backend) ──────────────────────
//   const basePrice      = parseFloat(booking.service_price || 0)
//   const overtimeRate   = parseFloat(booking.additional_price || 0)
//   const actualMinutes  = parseInt(booking.actual_duration_minutes || 0)
//   const standardMinutes = parseInt(booking.standard_duration_minutes || booking.service_duration || 60)

//   // Use same logic as backend calcFinalAmount
//   const customerTotal  = calcFinalAmount(basePrice, standardMinutes, actualMinutes, overtimeRate)

//   // Derived display flags
//   const isProrated     = actualMinutes > 0 && actualMinutes < standardMinutes
//   const isOvertime     = actualMinutes > standardMinutes && overtimeRate > 0
//   const overtimeMins   = isOvertime ? Math.min(actualMinutes - standardMinutes, 120) : 0
//   const overtimeCost   = isOvertime ? Math.round((overtimeRate * overtimeMins / 60) * 100) / 100 : 0
//   const percentWorked  = standardMinutes > 0 ? Math.round((actualMinutes / standardMinutes) * 100) : 100

//   const authorizedAmount = booking.authorized_amount

//   // All photos combined for photos tab
//   const allPhotos = [
//     ...(booking.before_photos || []),
//     ...(booking.after_photos  || []),
//     ...(booking.photos        || []).map(url => ({ url })),
//   ]

//   // Tabs: show photos tab only if there are photos
//   const tabs = ['details', ...(allPhotos.length > 0 ? ['photos'] : [])]

//   return (
//     <>
//       <Header />
//       <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
//       <Lightbox src={lightbox} onClose={() => setLightbox(null)} />

//       <div className="min-h-screen bg-gray-50 py-6 md:py-8">
//         <div className="max-w-3xl mx-auto px-4">

//           {/* Header */}
//           <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
//             <Link href="/my-bookings" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
//               <ArrowLeft className="w-4 h-4" />
//               <span className="text-sm font-medium">Back to Bookings</span>
//             </Link>
//             <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${statusColor(booking.status)}`}>
//               {(booking.status || '').replace(/_/g, ' ').toUpperCase()}
//             </span>
//           </div>

//           <div className="mb-6">
//             <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{booking.service_name}</h1>
//             <p className="text-sm text-gray-500">Booking #{booking.booking_number}</p>
//           </div>

//           {/* ── Awaiting Approval banner ── */}
//           {booking.status === 'awaiting_approval' && (
//             <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-lg p-6 mb-6">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">🎉</div>
//                 <div>
//                   <h2 className="text-lg font-bold text-gray-900">Job Completed!</h2>
//                   <p className="text-sm text-gray-500">Review the work and approve payment or raise a dispute.</p>
//                 </div>
//               </div>

//               {/* Time summary */}
//               {booking.end_time && (
//                 <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Started:</span>
//                     <span className="font-medium">{formatDate(booking.start_time)} at {formatTime(booking.start_time)}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-gray-500">Completed:</span>
//                     <span className="font-medium">{formatDate(booking.end_time)} at {formatTime(booking.end_time)}</span>
//                   </div>
//                   <div className="flex justify-between pt-2 border-t">
//                     <span className="text-gray-500">Duration:</span>
//                     <span className={`font-bold ${isOvertime ? 'text-purple-600' : isProrated ? 'text-blue-600' : 'text-green-700'}`}>
//                       {formatDuration(actualMinutes)}
//                       <span className="text-xs text-gray-400 ml-2">(standard: {formatDuration(standardMinutes)})</span>
//                     </span>
//                   </div>
//                 </div>
//               )}

//               {/* Amount box */}
//               <div className={`rounded-xl p-4 mb-5 border ${
//                 isOvertime  ? 'bg-purple-50 border-purple-200' :
//                 isProrated  ? 'bg-blue-50 border-blue-200' :
//                               'bg-green-50 border-green-200'
//               }`}>
//                 <div className="flex justify-between items-center mb-3">
//                   <span className="text-sm font-medium text-gray-700">
//                     {isOvertime ? 'Final amount (with overtime):' :
//                      isProrated ? 'Final amount (pro-rated):' :
//                                   'Final amount:'}
//                   </span>
//                   <span className={`text-xl font-bold ${
//                     isOvertime ? 'text-purple-700' : isProrated ? 'text-blue-700' : 'text-green-700'
//                   }`}>
//                     {fmt(customerTotal)}
//                   </span>
//                 </div>
//                 <div className="text-xs border-t pt-2 space-y-1">
//                   <div className="flex justify-between text-gray-600">
//                     <span>Base price ({standardMinutes}min):</span>
//                     <span>{fmt(basePrice)}</span>
//                   </div>
//                   {isProrated && (
//                     <div className="flex justify-between text-blue-600">
//                       <span>Pro-rated ({actualMinutes}min worked = {percentWorked}% of standard):</span>
//                       <span>{fmt(customerTotal)}</span>
//                     </div>
//                   )}
//                   {isOvertime && (
//                     <div className="flex justify-between text-purple-600">
//                       <span>Overtime ({overtimeMins}min at {fmt(overtimeRate)}/hr):</span>
//                       <span>+{fmt(overtimeCost)}</span>
//                     </div>
//                   )}
//                   <div className="flex justify-between font-bold pt-1 border-t">
//                     <span>You pay:</span>
//                     <span className={
//                       isOvertime ? 'text-purple-700' : isProrated ? 'text-blue-700' : 'text-green-700'
//                     }>{fmt(customerTotal)}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Action buttons */}
//               <div className="flex gap-3">
//                 <button onClick={() => setShowConfirmModal(true)} disabled={actionLoading}
//                   className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold disabled:opacity-50">
//                   {actionLoading ? 'Processing...' : `✅ Approve & Pay ${fmt(customerTotal)}`}
//                 </button>
//                 <button onClick={() => setShowDisputeModal(true)} disabled={actionLoading}
//                   className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 py-4 rounded-xl font-bold disabled:opacity-50">
//                   ⚠️ Dispute
//                 </button>
//               </div>
//               <p className="text-xs text-center text-gray-400 mt-3">Auto-approval in 12 hours if no action taken</p>
//             </div>
//           )}

//           {/* ── Tabs ── */}
//           <div className="flex gap-2 mb-6 border-b">
//             {tabs.map(tab => (
//               <button key={tab} onClick={() => setActiveTab(tab)}
//                 className={`px-4 py-2 text-sm font-medium border-b-2 capitalize transition
//                   ${activeTab === tab ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
//                 {tab}
//                 {tab === 'photos' && <span className="ml-1 text-xs bg-gray-100 text-gray-500 rounded-full px-1.5">{allPhotos.length}</span>}
//               </button>
//             ))}
//           </div>

//           {/* ── Details tab ── */}
//           {activeTab === 'details' && (
//             <div className="space-y-5">

//               {/* Provider */}
//               {booking.provider_name && (
//                 <div className="bg-white rounded-2xl p-6 border">
//                   <h2 className="text-base font-bold mb-4 flex items-center gap-2">
//                     <User className="w-5 h-5 text-green-600" /> Provider
//                   </h2>
//                   <div className="flex items-center gap-4">
//                     <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
//                       {booking.provider_name[0]?.toUpperCase()}
//                     </div>
//                     <div>
//                       <h3 className="font-bold text-lg">{booking.provider_name}</h3>
//                       {booking.provider_rating > 0 && (
//                         <p className="text-sm text-gray-500">⭐ {parseFloat(booking.provider_rating).toFixed(1)} rating</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Job Details */}
//               <div className="bg-white rounded-2xl p-6 border">
//                 <h2 className="text-base font-bold mb-4">Job Details</h2>
//                 <div className="space-y-4">
//                   <div className="flex gap-3">
//                     <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="text-sm font-medium">Date & Time</p>
//                       <p className="text-sm text-gray-600">{formatDate(booking.job_date)}</p>
//                       <p className="text-sm text-gray-600">{formatSlot(booking.job_time_slot)}</p>
//                     </div>
//                   </div>
//                   <div className="flex gap-3">
//                     <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
//                     <div>
//                       <p className="text-sm font-medium">Location</p>
//                       <p className="text-sm text-gray-600">{booking.address_line1}</p>
//                       {booking.address_line2 && <p className="text-sm text-gray-600">{booking.address_line2}</p>}
//                       {booking.city && <p className="text-sm text-gray-600">{booking.city}</p>}
//                     </div>
//                   </div>
//                   {booking.job_description && (
//                     <div className="flex gap-3">
//                       <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
//                       <div>
//                         <p className="text-sm font-medium">Description</p>
//                         <p className="text-sm text-gray-600">{booking.job_description}</p>
//                       </div>
//                     </div>
//                   )}
//                   {booking.timing_constraints && (
//                     <div className="flex gap-3">
//                       <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
//                       <div>
//                         <p className="text-sm font-medium">Timing Note</p>
//                         <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-2 mt-1">{booking.timing_constraints}</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Access info */}
//               {(booking.parking_access || booking.elevator_access || booking.has_pets) && (
//                 <div className="bg-white rounded-2xl p-6 border">
//                   <h2 className="text-base font-bold mb-3">Access Information</h2>
//                   <div className="flex flex-wrap gap-2">
//                     {booking.parking_access  && <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">🅿️ Parking Available</span>}
//                     {booking.elevator_access && <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">🛗 Elevator Access</span>}
//                     {booking.has_pets        && <span className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">🐕 Pets on Premises</span>}
//                   </div>
//                 </div>
//               )}

//               {/* Payment */}
//               <div className="bg-white rounded-2xl p-6 border">
//                 <h2 className="text-base font-bold mb-4 flex items-center gap-2">
//                   <CreditCard className="w-5 h-5 text-green-600" /> Payment Details
//                 </h2>
//                 <div className="space-y-3">
//                   <div className="flex justify-between text-sm">
//                     <span className="text-gray-600">Base Price ({standardMinutes}min):</span>
//                     <span className="font-medium">{fmt(basePrice)}</span>
//                   </div>
//                   {isProrated && (
//                     <div className="flex justify-between text-sm text-blue-600">
//                       <span>Pro-rated ({actualMinutes}min = {percentWorked}% of standard):</span>
//                       <span className="font-medium">{fmt(customerTotal)}</span>
//                     </div>
//                   )}
//                   {isOvertime && (
//                     <div className="flex justify-between text-sm">
//                       <span className="text-gray-600">Overtime ({overtimeMins}min at {fmt(overtimeRate)}/hr):</span>
//                       <span className="font-medium text-purple-600">+{fmt(overtimeCost)}</span>
//                     </div>
//                   )}
//                   {authorizedAmount && (
//                     <div className="flex justify-between text-sm text-gray-400">
//                       <span>Amount held on card:</span>
//                       <span>{fmt(authorizedAmount)}</span>
//                     </div>
//                   )}
//                   <div className="border-t pt-3">
//                     <div className="flex justify-between">
//                       <span className="font-bold">Total</span>
//                       <span className={`font-bold text-lg ${
//                         isOvertime ? 'text-purple-600' : isProrated ? 'text-blue-600' : 'text-green-600'
//                       }`}>
//                         {fmt(customerTotal)}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="flex justify-between text-sm pt-1">
//                     <span className="text-gray-500">Payment Status</span>
//                     <span className={`font-semibold text-xs px-2 py-1 rounded-full
//                       ${booking.payment_status === 'paid' ? 'bg-green-50 text-green-700' :
//                         booking.payment_status === 'authorized' ? 'bg-blue-50 text-blue-700' :
//                         'bg-yellow-50 text-yellow-700'}`}>
//                       {(booking.payment_status || 'pending').toUpperCase()}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Status Timeline */}
//               {booking.status_history?.length > 0 && (
//                 <div className="bg-white rounded-2xl p-6 border">
//                   <h2 className="text-base font-bold mb-4 flex items-center gap-2">
//                     <CheckCircle className="w-5 h-5 text-green-600" /> Status Timeline
//                   </h2>
//                   <div className="space-y-3">
//                     {booking.status_history.map((item, i) => (
//                       <div key={i} className="relative pl-4 pb-3 border-l-2 border-green-500 last:pb-0">
//                         <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-green-500" />
//                         <p className="text-xs font-semibold text-gray-800 capitalize">{(item.status || '').replace(/_/g, ' ')}</p>
//                         {item.notes && <p className="text-xs text-gray-500 italic mt-0.5">{item.notes}</p>}
//                         <p className="text-[10px] text-gray-400 mt-0.5">{new Date(item.created_at).toLocaleString()}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ── Photos tab ── */}
//           {activeTab === 'photos' && (
//             <div className="space-y-5">

//               {/* Before photos */}
//               {booking.before_photos?.length > 0 && (
//                 <div className="bg-white rounded-2xl p-6 border">
//                   <h2 className="text-base font-bold mb-4 flex items-center gap-2">
//                     <ImageIcon className="w-5 h-5 text-orange-500" />
//                     Before Photos
//                     <span className="text-xs bg-orange-100 text-orange-600 rounded-full px-2 py-0.5 ml-1">{booking.before_photos.length}</span>
//                   </h2>
//                   <PhotoGrid photos={booking.before_photos} onOpen={setLightbox} />
//                 </div>
//               )}

//               {/* After photos */}
//               {booking.after_photos?.length > 0 && (
//                 <div className="bg-white rounded-2xl p-6 border">
//                   <h2 className="text-base font-bold mb-4 flex items-center gap-2">
//                     <ImageIcon className="w-5 h-5 text-green-500" />
//                     After Photos
//                     <span className="text-xs bg-green-100 text-green-600 rounded-full px-2 py-0.5 ml-1">{booking.after_photos.length}</span>
//                   </h2>
//                   <PhotoGrid photos={booking.after_photos} onOpen={setLightbox} />
//                 </div>
//               )}

//               {/* Customer upload photos */}
//               {booking.photos?.length > 0 && (
//                 <div className="bg-white rounded-2xl p-6 border">
//                   <h2 className="text-base font-bold mb-4 flex items-center gap-2">
//                     <ImageIcon className="w-5 h-5 text-blue-500" />
//                     Your Uploaded Photos
//                     <span className="text-xs bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 ml-1">{booking.photos.length}</span>
//                   </h2>
//                   <PhotoGrid photos={booking.photos} onOpen={setLightbox} />
//                 </div>
//               )}

//               {allPhotos.length === 0 && (
//                 <div className="bg-white rounded-2xl p-12 border text-center">
//                   <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
//                   <p className="text-gray-400 text-sm">No photos yet</p>
//                 </div>
//               )}
//             </div>
//           )}

//         </div>
//       </div>

//       {/* ── Confirm Modal ── */}
//       {showConfirmModal && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl w-full max-w-sm p-6">
//             <h3 className="text-lg font-bold mb-4">Confirm Payment</h3>
//             <div className={`rounded-xl p-4 mb-4 border ${
//               isOvertime ? 'bg-purple-50 border-purple-200' :
//               isProrated ? 'bg-blue-50 border-blue-200' :
//                            'bg-green-50 border-green-200'
//             }`}>
//               <div className="flex justify-between text-sm mb-2">
//                 <span>Base price ({standardMinutes}min):</span>
//                 <span className="font-medium">{fmt(basePrice)}</span>
//               </div>
//               {isProrated && (
//                 <div className="flex justify-between text-sm mb-2 text-blue-600">
//                   <span>Pro-rated ({actualMinutes}min = {percentWorked}%):</span>
//                   <span className="font-medium">{fmt(customerTotal)}</span>
//                 </div>
//               )}
//               {isOvertime && (
//                 <div className="flex justify-between text-sm mb-2 text-purple-600">
//                   <span>Overtime ({overtimeMins}min):</span>
//                   <span className="font-medium">+{fmt(overtimeCost)}</span>
//                 </div>
//               )}
//               <div className="border-t pt-2 mt-2 flex justify-between">
//                 <span className="font-bold">Total:</span>
//                 <span className={`text-xl font-bold ${
//                   isOvertime ? 'text-purple-700' : isProrated ? 'text-blue-700' : 'text-green-700'
//                 }`}>{fmt(customerTotal)}</span>
//               </div>
//             </div>
//             <div className="flex gap-3">
//               <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-2.5 border rounded-xl text-sm font-medium">Cancel</button>
//               <button onClick={handleApprove} disabled={actionLoading} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm disabled:opacity-50">
//                 {actionLoading ? 'Processing...' : 'Confirm'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── Dispute Modal ── */}
//       {showDisputeModal && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl w-full max-w-md p-6">
//             <h3 className="text-lg font-bold mb-2">Raise a Dispute</h3>
//             <p className="text-sm text-gray-500 mb-4">Describe the issue clearly so we can help resolve it.</p>
//             <textarea value={disputeReason} onChange={e => setDisputeReason(e.target.value)}
//               placeholder="Describe the issue..." rows={4}
//               className="w-full border rounded-xl p-3 text-sm mb-4 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
//             <div className="flex gap-3">
//               <button onClick={handleDispute} disabled={actionLoading || !disputeReason.trim()}
//                 className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50">
//                 {actionLoading ? 'Submitting...' : 'Submit Dispute'}
//               </button>
//               <button onClick={() => { setShowDisputeModal(false); setDisputeReason('') }}
//                 className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-sm">
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }








'use client'

import { useState, useEffect } from 'react'
import { useAuth } from 'src/context/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import {
  Calendar, MapPin, User, ArrowLeft, CreditCard,
  AlertCircle, Clock, CheckCircle, Image as ImageIcon
} from 'lucide-react'

// ── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [message, onClose])
  if (!message) return null
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl text-white text-sm max-w-sm
      ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
      {message}
    </div>
  )
}

// ── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }) {
  if (!src) return null
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <button className="absolute top-4 right-6 text-white text-4xl font-light" onClick={onClose}>×</button>
      <img src={src} alt="Full size" className="max-w-full max-h-[90vh] object-contain rounded-xl"
        onClick={e => e.stopPropagation()} />
    </div>
  )
}

// ── Photo grid ───────────────────────────────────────────────────────────────
function PhotoGrid({ photos, onOpen }) {
  const [errors, setErrors] = useState({})
  if (!photos?.length) return null

  const getPhotoSrc = (url) => {
    if (!url) return null
    if (url.startsWith('http')) return url
    return `${process.env.NEXT_PUBLIC_API_URL || ''}${url}`
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {photos.map((photo, i) => {
        const src = getPhotoSrc(typeof photo === 'string' ? photo : photo?.url)
        if (!src) return null
        return (
          <div key={i} onClick={() => onOpen(src)}
            className="aspect-square rounded-xl overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition shadow-sm">
            {errors[i]
              ? <div className="w-full h-full bg-gray-100 flex items-center justify-center text-2xl">🖼️</div>
              : <img src={src} alt={`Photo ${i + 1}`} className="w-full h-full object-cover"
                  onError={() => setErrors(p => ({ ...p, [i]: true }))} />
            }
          </div>
        )
      })}
    </div>
  )
}

// ── Final amount calculation ──────────────────────────────────────────────────
// Customer always pays full base price. Overtime adds extra. No pro-rating.
function calcFinalAmount(basePrice, standardMins, actualMins, overtimeRate = 0) {
  if (actualMins <= 0) return basePrice
  if (actualMins > standardMins && overtimeRate > 0) {
    const overtimeMins = Math.min(actualMins - standardMins, 120)
    return Math.round((basePrice + (overtimeRate * overtimeMins / 60)) * 100) / 100
  }
  return basePrice
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CustomerBookingDetails() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id

  const [booking, setBooking]           = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [activeTab, setActiveTab]       = useState('details')
  const [lightbox, setLightbox]         = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [toast, setToast]               = useState({ message: '', type: '' })

  useEffect(() => {
    if (!user) { router.push('/'); return }
    loadBooking()
  }, [user, bookingId])

  const loadBooking = async () => {
    try {
      setLoading(true)
      setError('')
      const res  = await fetch(`/api/customer/booking-details?bookingId=${bookingId}`)
      const data = await res.json()
      if (data.success && data.data?.length > 0) {
        setBooking(data.data[0])
      } else {
        setError(data.message || 'Booking not found')
      }
    } catch (err) {
      setError(err.message || 'Failed to load booking')
    } finally {
      setLoading(false)
    }
  }

  const notify = (message, type = 'success') => setToast({ message, type })

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      const res  = await fetch(`/api/customer/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      })
      const data = await res.json()
      if (data.success) {
        notify(data.message)
        setTimeout(() => router.push('/my-bookings'), 2000)
      } else {
        notify(data.message || 'Failed to approve', 'error')
      }
    } catch { notify('Something went wrong', 'error') }
    finally { setActionLoading(false); setShowConfirmModal(false) }
  }

  const handleDispute = async () => {
    if (!disputeReason.trim()) return
    setActionLoading(true)
    try {
      const res  = await fetch(`/api/customer/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dispute', dispute_reason: disputeReason })
      })
      const data = await res.json()
      if (data.success) {
        setShowDisputeModal(false)
        setDisputeReason('')
        notify(data.message, 'warning')
        loadBooking()
      } else {
        notify(data.message || 'Failed to raise dispute', 'error')
      }
    } catch { notify('Something went wrong', 'error') }
    finally { setActionLoading(false) }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const fmt = (n) => `$${parseFloat(n || 0).toFixed(2)}`

  const formatDate = (d) => {
    if (!d) return 'N/A'
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
  }
  const formatTime = (d) => {
    if (!d) return 'N/A'
    return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }
  const formatDuration = (m) => {
    if (!m) return '0 min'
    if (m < 60) return `${m} min`
    const h = Math.floor(m / 60), rem = m % 60
    return rem ? `${h}h ${rem}m` : `${h}h`
  }
  const formatSlot = (slot) => {
    const map = { morning: '8:00 AM – 12:00 PM', afternoon: '12:00 PM – 5:00 PM', evening: '5:00 PM – 9:00 PM' }
    if (Array.isArray(slot)) return slot.map(s => map[s] || s).join(', ')
    return map[slot] || slot || 'N/A'
  }
  const statusColor = (s) => ({
    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
    awaiting_approval: 'bg-amber-50 text-amber-700 border-amber-200',
    completed: 'bg-green-50 text-green-700 border-green-200',
    disputed: 'bg-red-50 text-red-700 border-red-200',
    cancelled: 'bg-gray-50 text-gray-700 border-gray-200',
  }[s] || 'bg-gray-50 text-gray-700 border-gray-200')

  // ── Loading / Error states ────────────────────────────────────────────────
  if (loading) return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  )

  if (error || !booking) return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 text-center border">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-500 mb-6">{error || 'Booking does not exist'}</p>
            <Link href="/my-bookings" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl">
              <ArrowLeft className="w-4 h-4" /> Back to My Bookings
            </Link>
          </div>
        </div>
      </div>
    </>
  )

  // ── Payment calculation ───────────────────────────────────────────────────
  const basePrice       = parseFloat(booking.service_price || 0)
  const overtimeRate    = parseFloat(booking.additional_price || 0)
  const actualMinutes   = parseInt(booking.actual_duration_minutes || 0)
  const standardMinutes = parseInt(booking.standard_duration_minutes || 60)  // from booking table only

  const customerTotal   = calcFinalAmount(basePrice, standardMinutes, actualMinutes, overtimeRate)

  const isProrated      = false  // no pro-rating ever
  const isOvertime      = actualMinutes > standardMinutes && overtimeRate > 0
  const overtimeMins    = isOvertime ? Math.min(actualMinutes - standardMinutes, 120) : 0
  const overtimeCost    = isOvertime ? Math.round((overtimeRate * overtimeMins / 60) * 100) / 100 : 0

  const authorizedAmount = booking.authorized_amount

  const allPhotos = [
    ...(booking.before_photos || []),
    ...(booking.after_photos  || []),
    ...(booking.photos        || []).map(url => ({ url })),
  ]

  const tabs = ['details', ...(allPhotos.length > 0 ? ['photos'] : [])]

  return (
    <>
      <Header />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />

      <div className="min-h-screen bg-gray-50 py-6 md:py-8">
        <div className="max-w-3xl mx-auto px-4">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link href="/my-bookings" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Bookings</span>
            </Link>
            <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${statusColor(booking.status)}`}>
              {(booking.status || '').replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{booking.service_name}</h1>
            <p className="text-sm text-gray-500">Booking #{booking.booking_number}</p>
          </div>

          {/* ── Awaiting Approval banner ── */}
          {booking.status === 'awaiting_approval' && (
            <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">🎉</div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Job Completed!</h2>
                  <p className="text-sm text-gray-500">Review the work and approve payment or raise a dispute.</p>
                </div>
              </div>

              {/* Time summary */}
              {booking.end_time && (
                <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Started:</span>
                    <span className="font-medium">{formatDate(booking.start_time)} at {formatTime(booking.start_time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Completed:</span>
                    <span className="font-medium">{formatDate(booking.end_time)} at {formatTime(booking.end_time)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-500">Duration:</span>
                    <span className={`font-bold ${isOvertime ? 'text-purple-600' : 'text-green-700'}`}>
                      {formatDuration(actualMinutes)}
                      <span className="text-xs text-gray-400 ml-2">(standard: {formatDuration(standardMinutes)})</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Amount box */}
              <div className={`rounded-xl p-4 mb-5 border ${
                isOvertime ? 'bg-purple-50 border-purple-200' : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    {isOvertime ? 'Final amount (with overtime):' : 'Final amount:'}
                  </span>
                  <span className={`text-xl font-bold ${isOvertime ? 'text-purple-700' : 'text-green-700'}`}>
                    {fmt(customerTotal)}
                  </span>
                </div>
                <div className="text-xs border-t pt-2 space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Base price ({standardMinutes}min):</span>
                    <span>{fmt(basePrice)}</span>
                  </div>
                  {isOvertime && (
                    <div className="flex justify-between text-purple-600">
                      <span>Overtime ({overtimeMins}min at {fmt(overtimeRate)}/hr):</span>
                      <span>+{fmt(overtimeCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-1 border-t">
                    <span>You pay:</span>
                    <span className={isOvertime ? 'text-purple-700' : 'text-green-700'}>{fmt(customerTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button onClick={() => setShowConfirmModal(true)} disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold disabled:opacity-50">
                  {actionLoading ? 'Processing...' : `✅ Approve & Pay ${fmt(customerTotal)}`}
                </button>
                <button onClick={() => setShowDisputeModal(true)} disabled={actionLoading}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 py-4 rounded-xl font-bold disabled:opacity-50">
                  ⚠️ Dispute
                </button>
              </div>
              <p className="text-xs text-center text-gray-400 mt-3">Auto-approval in 12 hours if no action taken</p>
            </div>
          )}

          {/* ── Tabs ── */}
          <div className="flex gap-2 mb-6 border-b">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 capitalize transition
                  ${activeTab === tab ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab}
                {tab === 'photos' && <span className="ml-1 text-xs bg-gray-100 text-gray-500 rounded-full px-1.5">{allPhotos.length}</span>}
              </button>
            ))}
          </div>

          {/* ── Details tab ── */}
          {activeTab === 'details' && (
            <div className="space-y-5">

              {/* Provider */}
              {booking.provider_name && (
                <div className="bg-white rounded-2xl p-6 border">
                  <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" /> Provider
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {booking.provider_name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{booking.provider_name}</h3>
                      {booking.provider_rating > 0 && (
                        <p className="text-sm text-gray-500">⭐ {parseFloat(booking.provider_rating).toFixed(1)} rating</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Job Details */}
              <div className="bg-white rounded-2xl p-6 border">
                <h2 className="text-base font-bold mb-4">Job Details</h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Date & Time</p>
                      <p className="text-sm text-gray-600">{formatDate(booking.job_date)}</p>
                      <p className="text-sm text-gray-600">{formatSlot(booking.job_time_slot)}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-gray-600">{booking.address_line1}</p>
                      {booking.address_line2 && <p className="text-sm text-gray-600">{booking.address_line2}</p>}
                      {booking.city && <p className="text-sm text-gray-600">{booking.city}</p>}
                    </div>
                  </div>
                  {booking.job_description && (
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Description</p>
                        <p className="text-sm text-gray-600">{booking.job_description}</p>
                      </div>
                    </div>
                  )}
                  {booking.timing_constraints && (
                    <div className="flex gap-3">
                      <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Timing Note</p>
                        <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-2 mt-1">{booking.timing_constraints}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Access info */}
              {(booking.parking_access || booking.elevator_access || booking.has_pets) && (
                <div className="bg-white rounded-2xl p-6 border">
                  <h2 className="text-base font-bold mb-3">Access Information</h2>
                  <div className="flex flex-wrap gap-2">
                    {booking.parking_access  && <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">🅿️ Parking Available</span>}
                    {booking.elevator_access && <span className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium">🛗 Elevator Access</span>}
                    {booking.has_pets        && <span className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">🐕 Pets on Premises</span>}
                  </div>
                </div>
              )}

              {/* Payment */}
              <div className="bg-white rounded-2xl p-6 border">
                <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" /> Payment Details
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Price ({standardMinutes}min):</span>
                    <span className="font-medium">{fmt(basePrice)}</span>
                  </div>
                  {isOvertime && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Overtime ({overtimeMins}min at {fmt(overtimeRate)}/hr):</span>
                      <span className="font-medium text-purple-600">+{fmt(overtimeCost)}</span>
                    </div>
                  )}
                  {authorizedAmount && (
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Amount held on card:</span>
                      <span>{fmt(authorizedAmount)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className={`font-bold text-lg ${isOvertime ? 'text-purple-600' : 'text-green-600'}`}>
                        {fmt(customerTotal)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm pt-1">
                    <span className="text-gray-500">Payment Status</span>
                    <span className={`font-semibold text-xs px-2 py-1 rounded-full
                      ${booking.payment_status === 'paid' ? 'bg-green-50 text-green-700' :
                        booking.payment_status === 'authorized' ? 'bg-blue-50 text-blue-700' :
                        'bg-yellow-50 text-yellow-700'}`}>
                      {(booking.payment_status || 'pending').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              {booking.status_history?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border">
                  <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" /> Status Timeline
                  </h2>
                  <div className="space-y-3">
                    {booking.status_history.map((item, i) => (
                      <div key={i} className="relative pl-4 pb-3 border-l-2 border-green-500 last:pb-0">
                        <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-green-500" />
                        <p className="text-xs font-semibold text-gray-800 capitalize">{(item.status || '').replace(/_/g, ' ')}</p>
                        {item.notes && <p className="text-xs text-gray-500 italic mt-0.5">{item.notes}</p>}
                        <p className="text-[10px] text-gray-400 mt-0.5">{new Date(item.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Photos tab ── */}
          {activeTab === 'photos' && (
            <div className="space-y-5">
              {booking.before_photos?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border">
                  <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-orange-500" />
                    Before Photos
                    <span className="text-xs bg-orange-100 text-orange-600 rounded-full px-2 py-0.5 ml-1">{booking.before_photos.length}</span>
                  </h2>
                  <PhotoGrid photos={booking.before_photos} onOpen={setLightbox} />
                </div>
              )}
              {booking.after_photos?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border">
                  <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-green-500" />
                    After Photos
                    <span className="text-xs bg-green-100 text-green-600 rounded-full px-2 py-0.5 ml-1">{booking.after_photos.length}</span>
                  </h2>
                  <PhotoGrid photos={booking.after_photos} onOpen={setLightbox} />
                </div>
              )}
              {booking.photos?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border">
                  <h2 className="text-base font-bold mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-500" />
                    Your Uploaded Photos
                    <span className="text-xs bg-blue-100 text-blue-600 rounded-full px-2 py-0.5 ml-1">{booking.photos.length}</span>
                  </h2>
                  <PhotoGrid photos={booking.photos} onOpen={setLightbox} />
                </div>
              )}
              {allPhotos.length === 0 && (
                <div className="bg-white rounded-2xl p-12 border text-center">
                  <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">No photos yet</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Confirm Modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-4">Confirm Payment</h3>
            <div className={`rounded-xl p-4 mb-4 border ${isOvertime ? 'bg-purple-50 border-purple-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex justify-between text-sm mb-2">
                <span>Base price ({standardMinutes}min):</span>
                <span className="font-medium">{fmt(basePrice)}</span>
              </div>
              {isOvertime && (
                <div className="flex justify-between text-sm mb-2 text-purple-600">
                  <span>Overtime ({overtimeMins}min):</span>
                  <span className="font-medium">+{fmt(overtimeCost)}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between">
                <span className="font-bold">Total:</span>
                <span className={`text-xl font-bold ${isOvertime ? 'text-purple-700' : 'text-green-700'}`}>{fmt(customerTotal)}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-2.5 border rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={handleApprove} disabled={actionLoading} className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm disabled:opacity-50">
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Dispute Modal ── */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-2">Raise a Dispute</h3>
            <p className="text-sm text-gray-500 mb-4">Describe the issue clearly so we can help resolve it.</p>
            <textarea value={disputeReason} onChange={e => setDisputeReason(e.target.value)}
              placeholder="Describe the issue..." rows={4}
              className="w-full border rounded-xl p-3 text-sm mb-4 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100" />
            <div className="flex gap-3">
              <button onClick={handleDispute} disabled={actionLoading || !disputeReason.trim()}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold text-sm disabled:opacity-50">
                {actionLoading ? 'Submitting...' : 'Submit Dispute'}
              </button>
              <button onClick={() => { setShowDisputeModal(false); setDisputeReason('') }}
                className="flex-1 bg-gray-100 py-3 rounded-xl font-bold text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}