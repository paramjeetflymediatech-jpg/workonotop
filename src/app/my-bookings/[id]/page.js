









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
//     return `£${parseFloat(amount || 0).toFixed(2)}`
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











'use client'

import { useState, useEffect } from 'react'
import { useAuth } from 'src/context/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import ChatBox from '@/components/ChatBox'
import {
  Calendar, MapPin, User, ArrowLeft, CreditCard,
  AlertCircle, Image as ImageIcon, Clock as TimerIcon
} from 'lucide-react'

function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [message, onClose])

  if (!message) return null

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl text-white text-sm max-w-sm animate-slideIn ${
      type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    }`}>
      {message}
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
    if (!user) {
      router.push('/')
      return
    }
    loadBookingDetails()
  }, [user, bookingId])

  const loadBookingDetails = async () => {
    try {
      setLoading(true)
      setError('')
      
      const res = await fetch(`/api/customer/booking-details?bookingId=${bookingId}`)
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.message || `HTTP error! status: ${res.status}`)
      }
      
      if (data.success && data.data && data.data.length > 0) {
        const bookingData = data.data[0]
        setBooking(bookingData)
      } else {
        setError(data.message || 'Booking not found')
      }
    } catch (err) {
      console.error('Error loading booking:', err)
      setError(err.message || 'Failed to load booking details')
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
        setToast({ message: data.message, type: 'success' })
        setTimeout(() => router.push('/my-bookings'), 2000)
      } else {
        setToast({ message: data.message || 'Failed to approve', type: 'error' })
      }
    } catch (err) {
      setToast({ message: 'Something went wrong', type: 'error' })
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
        setDisputeReason('')
        setToast({ message: data.message, type: 'warning' })
        loadBookingDetails()
      } else {
        setToast({ message: data.message || 'Failed to raise dispute', type: 'error' })
      }
    } catch {
      setToast({ message: 'Something went wrong', type: 'error' })
    } finally {
      setActionLoading(false)
    }
  }

  // Helper functions
  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins ? `${hours}h ${mins}m` : `${hours}h`
  }

  const formatCurrency = (amount) => {
    return `£${parseFloat(amount || 0).toFixed(2)}`
  }

  const formatTimeSlot = (slot) => {
    if (!slot) return 'N/A'
    const slots = { 
      morning: '8:00 AM - 12:00 PM', 
      afternoon: '12:00 PM - 5:00 PM', 
      evening: '5:00 PM - 9:00 PM' 
    }
    if (Array.isArray(slot)) {
      return slot.map(s => slots[s] || s).join(', ')
    }
    return slots[slot] || slot
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      awaiting_approval: 'bg-amber-50 text-amber-700 border-amber-200',
      completed: 'bg-green-50 text-green-700 border-green-200',
      disputed: 'bg-red-50 text-red-700 border-red-200',
      cancelled: 'bg-gray-50 text-gray-700 border-gray-200'
    }
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200'
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
            <div className="bg-white rounded-2xl p-8 text-center border">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
              <p className="text-gray-500 mb-6">{error || 'Booking does not exist'}</p>
              <Link href="/customer/my-bookings" className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl">
                <ArrowLeft className="w-4 h-4" /> Back to My Bookings
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  // ========== FIXED CALCULATION SECTION ==========
  const actualMinutes = booking.actual_duration_minutes || 0
  const standardMinutes = booking.service_duration || booking.standard_duration_minutes || 60
  const basePrice = parseFloat(booking.service_price) || 0
  const overtimeRate = parseFloat(booking.additional_price) || 0
  const overtimeMinutes = booking.overtime_minutes || 0
  const overtimeEarnings = parseFloat(booking.overtime_earnings) || 0
  
  // Calculate final amount with pro-ration
  const calculateFinalAmount = () => {
    // Case 1: Overtime - job took longer than standard
    if (actualMinutes > standardMinutes && overtimeEarnings > 0) {
      return basePrice + overtimeEarnings
    }
    
    // Case 2: Pro-rated - job took less time than standard
    if (actualMinutes > 0 && actualMinutes < standardMinutes) {
      const percentage = actualMinutes / standardMinutes
      return Math.round((basePrice * percentage) * 100) / 100
    }
    
    // Case 3: Standard time or no actual time yet
    return basePrice
  }

  const finalAmount = calculateFinalAmount()
  
  // Determine if overtime or pro-rated
  const isOvertime = actualMinutes > standardMinutes
  const isProrated = actualMinutes > 0 && actualMinutes < standardMinutes && finalAmount < basePrice
  // ========== END OF FIXED SECTION ==========

  return (
    <>
      <Header />
      
      {/* Toast notification */}
      {toast.message && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ message: '', type: '' })} 
        />
      )}

      {/* Main content */}
      <div className="min-h-screen bg-gray-50 py-6 md:py-8">
        <div className="max-w-5xl mx-auto px-4">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link href="/my-bookings" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Bookings</span>
            </Link>
            <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
              {booking.status?.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{booking.service_name}</h1>
            <p className="text-sm text-gray-500">Booking #{booking.booking_number}</p>
          </div>

          {/* Approval Section */}
          {booking.status === 'awaiting_approval' && (
            <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">🎉</div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Job Completed!</h2>
                  <p className="text-sm text-gray-500">Review the work and approve payment or raise a dispute.</p>
                </div>
              </div>

              {/* Time Summary */}
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
                    <span className={`font-bold ${isOvertime ? 'text-purple-600' : isProrated ? 'text-amber-600' : 'text-green-700'}`}>
                      {formatDuration(actualMinutes)}
                      <span className="text-xs text-gray-400 ml-2">(standard: {formatDuration(standardMinutes)})</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Price Calculation */}
              <div className={`rounded-xl p-4 mb-5 ${
                isOvertime ? 'bg-purple-50 border-purple-200' : 
                isProrated ? 'bg-amber-50 border-amber-200' : 
                'bg-green-50 border-green-200'
              }`}>
                <div className="flex justify-between items-center mb-3">
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
                
                {/* Breakdown */}
                <div className="text-xs border-t pt-2 space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Base price ({standardMinutes}min):</span>
                    <span>{formatCurrency(basePrice)}</span>
                  </div>
                  
                  {isOvertime && overtimeEarnings > 0 && (
                    <div className="flex justify-between text-purple-600">
                      <span>Overtime ({overtimeMinutes}min at {formatCurrency(overtimeRate)}/hr):</span>
                      <span>+{formatCurrency(overtimeEarnings)}</span>
                    </div>
                  )}
                  
                  {isProrated && (
                    <div className="flex justify-between text-amber-600">
                      <span>Pro-rated ({actualMinutes}min of {standardMinutes}min):</span>
                      <span>-{formatCurrency(basePrice - finalAmount)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between font-bold pt-1 mt-1 border-t">
                    <span>You pay:</span>
                    <span className={isOvertime ? 'text-purple-700' : isProrated ? 'text-amber-700' : 'text-green-700'}>
                      {formatCurrency(finalAmount)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {isOvertime 
                    ? `⏰ Overtime: ${overtimeMinutes}min at ${formatCurrency(overtimeRate)}/hour`
                    : isProrated
                    ? `⏱️ Paying for ${actualMinutes}min worked (${Math.round((actualMinutes/standardMinutes)*100)}% of standard)`
                    : '✅ Payment matches standard rate'
                  }
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={actionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold disabled:opacity-50"
                >
                  {actionLoading ? 'Processing...' : `✅ Approve & Pay ${formatCurrency(finalAmount)}`}
                </button>
                <button
                  onClick={() => setShowDisputeModal(true)}
                  disabled={actionLoading}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border-2 border-red-200 py-4 rounded-xl font-bold disabled:opacity-50"
                >
                  ⚠️ Dispute
                </button>
              </div>

              <p className="text-xs text-center text-gray-400 mt-3">
                Auto-approval in 12 hours if no action taken
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            {['details', booking.photos?.length > 0 && 'photos', booking.provider_id && 'chat'].filter(Boolean).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 capitalize ${
                  activeTab === tab ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Provider */}
              {booking.provider_name && (
                <div className="bg-white rounded-2xl p-6 border">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" /> Provider
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                      {booking.provider_name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{booking.provider_name}</h3>
                    </div>
                  </div>
                </div>
              )}

              {/* Job Details */}
              <div className="bg-white rounded-2xl p-6 border">
                <h2 className="text-lg font-bold mb-4">Job Details</h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Calendar className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Date & Time</p>
                      <p className="text-sm text-gray-600">{formatDate(booking.job_date)}</p>
                      <p className="text-sm text-gray-600">{formatTimeSlot(booking.job_time_slot)}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-gray-600">{booking.address_line1}</p>
                      {booking.address_line2 && <p className="text-sm text-gray-600">{booking.address_line2}</p>}
                      <p className="text-sm text-gray-600">{booking.city}</p>
                    </div>
                  </div>
                  {booking.job_description && (
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Description</p>
                        <p className="text-sm text-gray-600">{booking.job_description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white rounded-2xl p-6 border">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" /> Payment Details
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Price ({standardMinutes}min):</span>
                    <span className="font-medium">{formatCurrency(basePrice)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Actual time worked:</span>
                    <span className={`font-medium ${isOvertime ? 'text-purple-600' : isProrated ? 'text-amber-600' : 'text-green-600'}`}>
                      {formatDuration(actualMinutes)}
                    </span>
                  </div>
                  
                  {isOvertime && overtimeEarnings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Overtime ({overtimeMinutes}min):</span>
                      <span className="font-medium text-purple-600">+{formatCurrency(overtimeEarnings)}</span>
                    </div>
                  )}
                  
                  {isProrated && (
                    <div className="flex justify-between text-sm text-amber-600">
                      <span>Pro-rated adjustment:</span>
                      <span className="font-medium">-{formatCurrency(basePrice - finalAmount)}</span>
                    </div>
                  )}
                  
                  <div className="border-t pt-3 mt-3">
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
                    <span className="font-semibold text-amber-600">
                      {booking.payment_status?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && booking.photos?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-green-600" /> Photos
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {booking.photos.map((photo, index) => (
                  photo && (
                    <div key={index} className="cursor-pointer" onClick={() => setSelectedImage(photo)}>
                      <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-40 object-cover rounded-xl border" />
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold mb-2">Confirm Payment</h3>
            <div className={`rounded-xl p-4 mb-4 ${
              isOvertime ? 'bg-purple-50 border-purple-200' : 
              isProrated ? 'bg-amber-50 border-amber-200' : 
              'bg-green-50 border-green-200'
            }`}>
              <div className="flex justify-between mb-2">
                <span>Base price:</span>
                <span className="font-bold">{formatCurrency(basePrice)}</span>
              </div>
              
              {/* Fixed: Added pro-rated discount section */}
              {isProrated && (
                <div className="flex justify-between mb-2 text-amber-600">
                  <span>Pro-rated discount ({actualMinutes}min of {standardMinutes}min):</span>
                  <span className="font-bold">-{formatCurrency(basePrice - finalAmount)}</span>
                </div>
              )}
              
              {isOvertime && overtimeEarnings > 0 && (
                <div className="flex justify-between mb-2 text-purple-600">
                  <span>Overtime ({overtimeMinutes}min):</span>
                  <span className="font-bold">+{formatCurrency(overtimeEarnings)}</span>
                </div>
              )}
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="font-bold">Total:</span>
                  <span className={`text-xl font-bold ${
                    isOvertime ? 'text-purple-700' : isProrated ? 'text-amber-700' : 'text-green-700'
                  }`}>
                    {formatCurrency(finalAmount)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="flex-1 py-2.5 border rounded-xl"
              >
                Cancel
              </button>
              <button 
                onClick={handleApprove} 
                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-bold"
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-2">Raise a Dispute</h3>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Describe the issue..."
              rows={4}
              className="w-full border rounded-xl p-3 text-sm mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleDispute}
                disabled={actionLoading || !disputeReason.trim()}
                className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold disabled:opacity-50"
              >
                {actionLoading ? 'Submitting...' : 'Submit'}
              </button>
              <button
                onClick={() => { setShowDisputeModal(false); setDisputeReason('') }}
                className="flex-1 bg-gray-100 py-3 rounded-xl font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Full size" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
          <button 
            onClick={() => setSelectedImage(null)} 
            className="absolute top-4 right-4 bg-white/20 text-white w-10 h-10 rounded-full hover:bg-white/30"
          >
            ✕
          </button>
        </div>
      )}
    </>
  )
}











