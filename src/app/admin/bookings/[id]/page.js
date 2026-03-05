// 'use client'
// import React, { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAdminTheme } from '../../layout'

// export default function BookingDetailsPage({ params }) {
//   const router = useRouter()
//   const { isDarkMode } = useAdminTheme()
//   const [booking, setBooking] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [updating, setUpdating] = useState(false)
//   const [toast, setToast] = useState('')
//   const [tradespeople, setTradespeople] = useState([])
//   const [selectedProvider, setSelectedProvider] = useState('')

//   const [commissionPct, setCommissionPct] = useState('')
//   const [savingCommission, setSavingCommission] = useState(false)

//   const unwrappedParams = React.use(params)
//   const bookingId = unwrappedParams.id

//   useEffect(() => {
//     fetchBooking()
//     loadTradespeople()
//   }, [bookingId])

//   const fetchBooking = async () => {
//     try {
//       const res = await fetch(`/api/bookings/${bookingId}`)
//       const data = await res.json()
//       if (data.success) {
//         setBooking(data.data)
//         setSelectedProvider(data.data.provider_id || '')
//         if (data.data.commission_percent != null) {
//           setCommissionPct(String(data.data.commission_percent))
//         }
//       } else {
//         notify('error', 'Booking not found')
//       }
//     } catch {
//       notify('error', 'Failed to load booking')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const loadTradespeople = async () => {
//     try {
//       const res = await fetch('/api/provider?status=active')
//       const data = await res.json()
//       if (data.success) setTradespeople(data.data || [])
//     } catch {
//       console.error('Error loading tradespeople')
//     }
//   }

//   const notify = (type, message) => {
//     setToast({ type, message })
//     setTimeout(() => setToast(''), 3000)
//   }

//   const updateBooking = async (body, successMsg) => {
//     setUpdating(true)
//     try {
//       const res = await fetch(`/api/bookings?id=${booking.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body)
//       })
//       const data = await res.json()
//       if (data.success) {
//         notify('success', successMsg)
//         fetchBooking()
//       } else {
//         notify('error', data.message || 'Failed to update')
//       }
//     } catch {
//       notify('error', 'Request failed')
//     } finally {
//       setUpdating(false)
//     }
//   }

//   const saveCommission = async () => {
//     const pct = parseFloat(commissionPct)
//     if (isNaN(pct) || pct < 0 || pct > 100) {
//       notify('error', 'Enter a valid percentage (0–100)')
//       return
//     }
//     setSavingCommission(true)
//     try {
//       const res = await fetch(`/api/bookings?id=${booking.id}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ commission_percent: pct })
//       })
//       const data = await res.json()
//       if (data.success) {
//         notify('success', `Commission set to ${pct}%. Job is now visible to providers.`)
//         fetchBooking()
//       } else {
//         notify('error', data.message || 'Failed to set commission')
//       }
//     } catch {
//       notify('error', 'Request failed')
//     } finally {
//       setSavingCommission(false)
//     }
//   }

//   // ✅ FIXED: Check commission before assigning provider
//   const assignProvider = async () => {
//     if (!selectedProvider) {
//       notify('error', 'Please select a provider')
//       return
//     }

//     // ✅ Check if commission is set
//     if (booking.commission_percent === null || booking.commission_percent === undefined) {
//       notify('error', '⚠️ Please set commission first before assigning provider. Provider will only see jobs with commission set.')
//       return
//     }

//     await updateBooking({ provider_id: selectedProvider, status: 'matching' }, 'Provider assigned successfully')
//   }

//   const basePrice = booking ? parseFloat(booking.service_price) : 0
//   const additionalPrice = booking ? parseFloat(booking.additional_price || 0) : 0
//   const duration = booking?.service_duration || 60

//   const formatDuration = (minutes) => {
//     if (minutes < 60) return `${minutes} minutes`
//     const hours = Math.floor(minutes / 60)
//     const mins = minutes % 60
//     return mins > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ${mins} min` : `${hours} hour${hours > 1 ? 's' : ''}`
//   }

//   const calculateCommissionBreakdown = () => {
//     if (!booking) return null
//     const pct = parseFloat(commissionPct)
//     if (isNaN(pct) || commissionPct === '') {
//       if (booking.commission_percent != null) {
//         const savedPct = parseFloat(booking.commission_percent)
//         const commissionAmount = basePrice * (savedPct / 100)
//         const providerBaseAmount = basePrice - commissionAmount
//         return { pct: savedPct, commissionAmount, providerBaseAmount, additionalPrice, totalProviderAmount: providerBaseAmount, isLive: true }
//       }
//       return null
//     }
//     const commissionAmount = basePrice * (pct / 100)
//     const providerBaseAmount = basePrice - commissionAmount
//     return { pct, commissionAmount, providerBaseAmount, additionalPrice, totalProviderAmount: providerBaseAmount, isLive: false }
//   }

//   const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
//   const formatDateTime = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

//   const statusColors = {
//     pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
//     matching: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
//     confirmed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
//     in_progress: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
//     awaiting_approval: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
//     completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
//     disputed: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
//     cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
//   }

//   const paymentStatusColors = {
//     pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
//     authorized: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
//     paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
//     failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
//     refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
//   }

//   const card = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//   const labelCls = isDarkMode ? 'text-slate-400' : 'text-gray-500'
//   const valueCls = isDarkMode ? 'text-white' : 'text-gray-900'
//   const breakdown = calculateCommissionBreakdown()
//   const commissionSet = booking?.commission_percent != null

//   const getStatusLabel = (s) => {
//     const labels = {
//       in_progress: 'In Progress',
//       awaiting_approval: 'Awaiting Approval',
//       disputed: 'Disputed',
//     }
//     return labels[s] || s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
//       </div>
//     )
//   }

//   if (!booking) {
//     return (
//       <div className="p-6 text-center">
//         <p className="text-gray-600">Booking not found</p>
//         <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm">Go Back</button>
//       </div>
//     )
//   }

//   return (
//     <div className="p-4 sm:p-6">
//       {toast && (
//         <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2
//           ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
//           {toast.type === 'success' ? '✓' : '✕'} {toast.message}
//         </div>
//       )}

//       <div className="mb-6 flex items-center gap-4 flex-wrap">
//         <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//           </svg>
//         </button>
//         <div>
//           <h1 className={`text-2xl font-bold ${valueCls}`}>Booking Details</h1>
//           <p className={`text-sm font-mono ${labelCls}`}>{booking.booking_number}</p>
//         </div>
//         <span className={`ml-auto px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColors[booking.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
//           {getStatusLabel(booking.status)}
//         </span>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* LEFT COLUMN */}
//         <div className="lg:col-span-2 space-y-5">
//           <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//             <SectionTitle icon="👤" label="Customer Information" valueCls={valueCls} />
//             <Grid2>
//               <Field label="Name" value={`${booking.customer_first_name} ${booking.customer_last_name}`} labelCls={labelCls} valueCls={valueCls} />
//               <Field label="Email" value={booking.customer_email} labelCls={labelCls} valueCls={valueCls} />
//               <Field label="Phone" value={booking.customer_phone || '—'} labelCls={labelCls} valueCls={valueCls} />
//               <Field label="User ID" value={booking.user_id || 'Guest'} labelCls={labelCls} valueCls={valueCls} />
//             </Grid2>
//           </div>

//           <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//             <SectionTitle icon="🔧" label="Service & Pricing" valueCls={valueCls} />
//             <Grid2>
//               <Field label="Service" value={booking.service_name} labelCls={labelCls} valueCls={valueCls} />
//               <Field label="Category" value={booking.category_name} labelCls={labelCls} valueCls={valueCls} />
//               <Field label="Base Price" value={`$${basePrice.toFixed(2)}`} labelCls={labelCls} valueCls={valueCls} />
//               <Field label="Overtime Rate" value={additionalPrice > 0 ? `$${additionalPrice.toFixed(2)}/hr` : 'Not set'} labelCls={labelCls} valueCls={valueCls} />
//             </Grid2>
//             <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
//               <div className="flex items-center gap-2">
//                 <span className="text-lg">⏱️</span>
//                 <div>
//                   <p className={`text-xs ${labelCls}`}>Service Duration</p>
//                   <p className={`text-base font-semibold ${valueCls}`}>{formatDuration(duration)}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* PAYMENT INFORMATION */}
//           <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//             <SectionTitle icon="💳" label="Payment Information" valueCls={valueCls} />
//             <div className="space-y-3">
//               <div className="flex items-center justify-between">
//                 <span className={`text-sm ${labelCls}`}>Payment Status</span>
//                 <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${paymentStatusColors[booking.payment_status] || 'bg-gray-100 text-gray-800'}`}>
//                   {booking.payment_status?.toUpperCase() || 'PENDING'}
//                 </span>
//               </div>

//               {(booking.service_price > 0 || booking.additional_price > 0 || booking.final_provider_amount > 0) && (
//                 <div className={`rounded-lg p-3 space-y-2 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
//                   <div className="flex justify-between text-sm">
//                     <span className={labelCls}>Service Price</span>
//                     <span className={`font-semibold ${valueCls}`}>${parseFloat(booking.service_price || 0).toFixed(2)}</span>
//                   </div>
//                   {booking.additional_price > 0 && (
//                     <div className="flex justify-between text-sm">
//                       <span className={labelCls}>Overtime Rate</span>
//                       <span className={`font-semibold ${valueCls}`}>${parseFloat(booking.additional_price || 0).toFixed(2)}/hr</span>
//                     </div>
//                   )}
//                   {booking.overtime_hours > 0 && (
//                     <div className="flex justify-between text-sm">
//                       <span className={labelCls}>Overtime Hours</span>
//                       <span className={`font-semibold ${valueCls}`}>{booking.overtime_hours} hrs</span>
//                     </div>
//                   )}
//                   {booking.overtime_earnings > 0 && (
//                     <div className="flex justify-between text-sm">
//                       <span className={labelCls}>Overtime Earnings</span>
//                       <span className={`font-semibold ${valueCls}`}>${parseFloat(booking.overtime_earnings).toFixed(2)}</span>
//                     </div>
//                   )}
//                   {booking.final_provider_amount > 0 && (
//                     <div className={`flex justify-between text-sm pt-2 mt-2 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
//                       <span className={`font-semibold ${labelCls}`}>Provider Earns</span>
//                       <span className="font-bold text-green-600">${parseFloat(booking.final_provider_amount).toFixed(2)}</span>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {booking.payment_intent_id && (
//                 <div>
//                   <p className={`text-xs ${labelCls} mb-1`}>Stripe Payment Intent ID</p>
//                   <p className={`text-xs font-mono ${valueCls} break-all bg-gray-50 dark:bg-slate-800 p-2 rounded-lg`}>
//                     {booking.payment_intent_id}
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//             <SectionTitle icon="📅" label="Schedule" valueCls={valueCls} />
//             <Grid2>
//               <Field label="Date" value={formatDate(booking.job_date)} labelCls={labelCls} valueCls={valueCls} />
//               <div>
//                 <p className={`text-xs mb-1 ${labelCls}`}>Time Slots</p>
//                 <div className="flex flex-wrap gap-1">
//                   {(Array.isArray(booking.job_time_slot) ? booking.job_time_slot : [booking.job_time_slot]).map((s, i) => (
//                     <span key={i} className="px-2 py-1 bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 rounded-lg text-xs font-medium capitalize">{s}</span>
//                   ))}
//                 </div>
//               </div>
//             </Grid2>
//           </div>

//           <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//             <SectionTitle icon="📍" label="Location & Access" valueCls={valueCls} />
//             <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 mb-3">
//               <p className={`text-sm font-medium ${valueCls}`}>{booking.address_line1}</p>
//             </div>
//             <div className="grid grid-cols-3 gap-2">
//               {[
//                 { label: '🅿️ Parking', active: booking.parking_access },
//                 { label: '🛗 Elevator', active: booking.elevator_access },
//                 { label: '🐕 Pets', active: booking.has_pets },
//               ].map(({ label, active }) => (
//                 <div key={label} className={`p-2 rounded-lg border text-center text-xs
//                   ${active
//                     ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
//                     : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-gray-50 border-gray-200 text-gray-400'
//                   }`}>
//                   {label} {active ? '✓' : '✗'}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* JOB DESCRIPTION & NOTES */}
//           {(booking.description || booking.special_instructions || booking.additional_notes) && (
//             <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//               <SectionTitle icon="📝" label="Job Description & Notes" valueCls={valueCls} />
//               {booking.description && (
//                 <div className="mb-3">
//                   <p className={`text-xs mb-1 ${labelCls}`}>Description</p>
//                   <p className={`text-sm ${valueCls} leading-relaxed`}>{booking.description}</p>
//                 </div>
//               )}
//               {booking.special_instructions && (
//                 <div className="mb-3">
//                   <p className={`text-xs mb-1 ${labelCls}`}>Special Instructions</p>
//                   <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-amber-900/20 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'} text-sm`}>
//                     {booking.special_instructions}
//                   </div>
//                 </div>
//               )}
//               {booking.additional_notes && (
//                 <div>
//                   <p className={`text-xs mb-1 ${labelCls}`}>Additional Notes</p>
//                   <p className={`text-sm ${valueCls} leading-relaxed`}>{booking.additional_notes}</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* BEFORE / AFTER PHOTOS */}
//           {(booking.before_photos?.length > 0 || booking.after_photos?.length > 0) && (
//             <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//               <SectionTitle icon="📷" label="Before & After Photos" valueCls={valueCls} />
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//                 {/* BEFORE */}
//                 <div>
//                   <div className="flex items-center gap-2 mb-3">
//                     <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
//                     <p className={`text-xs font-bold uppercase tracking-wider ${labelCls}`}>Before ({booking.before_photos?.length || 0})</p>
//                   </div>
//                   {booking.before_photos?.length > 0 ? (
//                     <div className="grid grid-cols-2 gap-2">
//                       {booking.before_photos.map((p, i) => (
//                         <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
//                           className="block aspect-square rounded-xl overflow-hidden border border-orange-200 dark:border-orange-800 hover:opacity-90 transition shadow-sm">
//                           <img src={p.url} alt={`Before ${i + 1}`} className="w-full h-full object-cover" />
//                         </a>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className={`flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-gray-200 text-gray-400'} text-xs`}>
//                       No before photos yet
//                     </div>
//                   )}
//                 </div>
//                 {/* AFTER */}
//                 <div>
//                   <div className="flex items-center gap-2 mb-3">
//                     <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
//                     <p className={`text-xs font-bold uppercase tracking-wider ${labelCls}`}>After ({booking.after_photos?.length || 0})</p>
//                   </div>
//                   {booking.after_photos?.length > 0 ? (
//                     <div className="grid grid-cols-2 gap-2">
//                       {booking.after_photos.map((p, i) => (
//                         <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
//                           className="block aspect-square rounded-xl overflow-hidden border border-green-200 dark:border-green-800 hover:opacity-90 transition shadow-sm">
//                           <img src={p.url} alt={`After ${i + 1}`} className="w-full h-full object-cover" />
//                         </a>
//                       ))}
//                     </div>
//                   ) : (
//                     <div className={`flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-gray-200 text-gray-400'} text-xs`}>
//                       No after photos yet
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* CUSTOMER UPLOAD PHOTOS */}
//           {booking.photos?.length > 0 && (
//             <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//               <SectionTitle icon="🖼️" label={`Customer Photos (${booking.photos.length})`} valueCls={valueCls} />
//               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                 {booking.photos.map((url, i) => (
//                   <a key={i} href={url} target="_blank" rel="noopener noreferrer"
//                     className="block aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 hover:opacity-90 transition shadow-sm">
//                     <img src={url} alt={`Customer photo ${i + 1}`} className="w-full h-full object-cover" />
//                   </a>
//                 ))}
//               </div>
//             </div>
//           )}

//         </div>

//         {/* RIGHT SIDEBAR */}
//         <div className="space-y-5">

//           {/* COMMISSION CARD */}
//           <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//             <div className="flex items-center gap-2 mb-3">
//               <span className="text-lg">💰</span>
//               <h2 className={`text-base font-semibold ${valueCls}`}>Commission</h2>
//               {commissionSet && (
//                 <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium">
//                   <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Live
//                 </span>
//               )}
//             </div>

//             {commissionSet ? (
//               <div>
//                 <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
//                   <div className="flex items-center justify-between mb-3">
//                     <span className={`text-sm ${labelCls}`}>Commission Rate</span>
//                     <span className="text-2xl font-bold text-green-600">{booking.commission_percent}%</span>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 <p className={`text-xs mb-4 ${labelCls}`}>
//                   Commission is on base price only. Overtime is added at final billing.
//                 </p>
//                 <div className="flex gap-2 mb-3">
//                   <div className="relative flex-1">
//                     <input
//                       type="number" min="0" max="100" step="0.5"
//                       value={commissionPct}
//                       onChange={(e) => setCommissionPct(e.target.value)}
//                       placeholder="e.g. 30"
//                       className={`w-full pl-3 pr-8 py-2.5 rounded-xl border text-sm
//                         ${isDarkMode ? 'bg-slate-800 text-white border-slate-700 focus:border-teal-500' : 'bg-white text-gray-900 border-gray-300 focus:border-teal-500'}
//                         focus:ring-2 focus:ring-teal-200 outline-none transition`}
//                     />
//                     <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium ${labelCls}`}>%</span>
//                   </div>
//                   <button
//                     onClick={saveCommission}
//                     disabled={savingCommission || commissionPct === ''}
//                     className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-50"
//                   >
//                     {savingCommission ? '…' : 'Save'}
//                   </button>
//                 </div>

//                 {/* ✅ WARNING MESSAGE - Commission not set */}
//                 {!commissionSet && (
//                   <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
//                     <div className="flex items-start gap-2">
//                       <span className="text-amber-600 text-lg">⚠️</span>
//                       <div>
//                         <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
//                           Commission not set
//                         </p>
//                         <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
//                           Job is hidden from providers. Set commission first to make it visible.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Provider Assignment */}
//           <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//             <div className="flex items-center gap-2 mb-4">
//               <span className="text-lg">👷</span>
//               <h2 className={`text-base font-semibold ${valueCls}`}>Provider Assignment</h2>
//             </div>
//             {booking.provider_name ? (
//               <>
//                 <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-xl border border-teal-200 dark:border-teal-800 mb-3">
//                   <div className="flex items-center gap-3 mb-2">
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold">
//                       {booking.provider_name?.charAt(0).toUpperCase()}
//                     </div>
//                     <div>
//                       <p className={`text-sm font-semibold ${valueCls}`}>{booking.provider_name}</p>
//                       <p className={`text-xs mt-0.5 ${labelCls}`}>{booking.accepted_at ? `Accepted ${formatDateTime(booking.accepted_at)}` : 'Manually assigned'}</p>
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-1 gap-1.5 mt-2 pt-2 border-t border-teal-200 dark:border-teal-800">
//                     {booking.provider_email && (
//                       <div className="flex items-center gap-2">
//                         <span className="text-xs">📧</span>
//                         <span className={`text-xs ${labelCls} truncate`}>{booking.provider_email}</span>
//                       </div>
//                     )}
//                     {booking.provider_phone && (
//                       <div className="flex items-center gap-2">
//                         <span className="text-xs">📱</span>
//                         <span className={`text-xs ${labelCls}`}>{booking.provider_phone}</span>
//                       </div>
//                     )}
//                     {booking.provider_rating > 0 && (
//                       <div className="flex items-center gap-2">
//                         <span className="text-xs">⭐</span>
//                         <span className={`text-xs font-semibold ${valueCls}`}>{parseFloat(booking.provider_rating).toFixed(1)} rating</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <div className="space-y-3">
//                 <p className={`text-xs ${labelCls}`}>
//                   Providers can self-assign once commission is set, or manually assign below.
//                 </p>

//                 {/* ✅ Commission warning in provider assignment card */}
//                 {!commissionSet && (
//                   <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
//                     <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
//                       <span className="text-amber-600">⚠️</span>
//                       Set commission first before assigning provider
//                     </p>
//                   </div>
//                 )}

//                 <select
//                   value={selectedProvider}
//                   onChange={(e) => setSelectedProvider(e.target.value)}
//                   disabled={updating}
//                   className={`w-full px-3 py-2.5 rounded-xl border text-sm
//                     ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-gray-300'}
//                     focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition`}
//                 >
//                   <option value="">Select a provider</option>
//                   {tradespeople.map(p => (
//                     <option key={p.id} value={p.id}>{p.name}</option>
//                   ))}
//                 </select>

//                 <button
//                   onClick={assignProvider}
//                   disabled={!selectedProvider || updating || !commissionSet}
//                   className={`w-full py-2.5 rounded-xl text-sm font-semibold transition 
//                     ${!commissionSet
//                       ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                       : 'bg-teal-600 text-white hover:bg-teal-700'
//                     }`}
//                 >
//                   {!commissionSet ? 'Set Commission First' : (updating ? 'Assigning…' : 'Manually Assign Provider')}
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Status Timeline */}
//           <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//             <h2 className={`text-base font-semibold mb-4 ${valueCls}`}>Status Timeline</h2>
//             {booking.status_history?.length > 0 ? (
//               <div className="space-y-3">
//                 {booking.status_history.map((item, i) => (
//                   <div key={i} className="relative pl-4 pb-3 border-l-2 border-teal-500 last:pb-0">
//                     <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-teal-500" />
//                     <p className={`text-xs font-semibold capitalize ${valueCls}`}>{getStatusLabel(item.status)}</p>
//                     <p className={`text-[10px] mt-0.5 ${labelCls}`}>{new Date(item.created_at).toLocaleString()}</p>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className={`text-sm ${labelCls}`}>No history yet</p>
//             )}
//           </div>

//           {/* Update Status */}
//           <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//             <h2 className={`text-base font-semibold mb-3 ${valueCls}`}>Update Status</h2>
//             <div className="flex flex-wrap gap-2">
//               {['pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((s) => (
//                 <button
//                   key={s}
//                   onClick={() => updateBooking({ status: s }, `Status → ${getStatusLabel(s)}`)}
//                   disabled={booking.status === s || updating}
//                   className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
//                     ${booking.status === s
//                       ? 'bg-teal-500 text-white cursor-default'
//                       : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
//                     ${updating ? 'opacity-50 cursor-wait' : ''}`}
//                 >
//                   {getStatusLabel(s)}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// function SectionTitle({ icon, label, valueCls }) {
//   return (
//     <h2 className={`text-base font-semibold mb-4 flex items-center gap-2 ${valueCls}`}>
//       <span>{icon}</span> {label}
//     </h2>
//   )
// }

// function Grid2({ children }) {
//   return <div className="grid grid-cols-2 gap-4">{children}</div>
// }

// function Field({ label, value, labelCls, valueCls }) {
//   return (
//     <div>
//       <p className={`text-xs mb-0.5 ${labelCls}`}>{label}</p>
//       <p className={`text-sm font-medium ${valueCls}`}>{value}</p>
//     </div>
//   )
// }







'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminTheme } from '../../layout'

export default function BookingDetailsPage({ params }) {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [toast, setToast] = useState(null)
  const [tradespeople, setTradespeople] = useState([])
  const [selectedProvider, setSelectedProvider] = useState('')
  const [commissionPct, setCommissionPct] = useState('')
  const [savingCommission, setSavingCommission] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  const unwrappedParams = React.use(params)
  const bookingId = unwrappedParams.id

  useEffect(() => { fetchBooking(); loadTradespeople() }, [bookingId])

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`)
      const data = await res.json()
      if (data.success) {
        setBooking(data.data)
        setSelectedProvider(data.data.provider_id || '')
        if (data.data.commission_percent != null) setCommissionPct(String(data.data.commission_percent))
      } else notify('error', 'Booking not found')
    } catch { notify('error', 'Failed to load booking') }
    finally { setLoading(false) }
  }

  const loadTradespeople = async () => {
    try {
      const res = await fetch('/api/provider?status=active')
      const data = await res.json()
      if (data.success) setTradespeople(data.data || [])
    } catch {}
  }

  const notify = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  const updateBooking = async (body, successMsg) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/bookings?id=${booking.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.success) { notify('success', successMsg); fetchBooking() }
      else notify('error', data.message || 'Failed to update')
    } catch { notify('error', 'Request failed') }
    finally { setUpdating(false) }
  }

  const saveCommission = async () => {
    const pct = parseFloat(commissionPct)
    if (isNaN(pct) || pct < 0 || pct > 100) { notify('error', 'Enter a valid percentage (0–100)'); return }
    setSavingCommission(true)
    try {
      const res = await fetch(`/api/bookings?id=${booking.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commission_percent: pct })
      })
      const data = await res.json()
      if (data.success) { notify('success', `Commission set to ${pct}%`); fetchBooking() }
      else notify('error', data.message || 'Failed to set commission')
    } catch { notify('error', 'Request failed') }
    finally { setSavingCommission(false) }
  }

  const assignProvider = async () => {
    if (!selectedProvider) { notify('error', 'Please select a provider'); return }
    if (booking.commission_percent == null) { notify('error', '⚠️ Set commission first before assigning provider'); return }
    await updateBooking({ provider_id: selectedProvider, status: 'matching' }, 'Provider assigned successfully')
  }

  const fmt = (n) => parseFloat(n || 0).toFixed(2)
  const basePrice = booking ? parseFloat(booking.service_price) : 0
  const additionalPrice = booking ? parseFloat(booking.additional_price || 0) : 0
  const commissionSet = booking?.commission_percent != null
  const getPhotoSrc = (url) => url?.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL || ''}${url}`

  const formatDuration = (m) => {
    if (!m) return '—'
    if (m < 60) return `${m} min`
    const h = Math.floor(m / 60), rem = m % 60
    return rem > 0 ? `${h}h ${rem}m` : `${h}h`
  }
  const formatDate = (d) => { try { return new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) } catch { return '—' } }
  const formatDateTime = (d) => { try { return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return '—' } }
  const getStatusLabel = (s) => ({ in_progress: 'In Progress', awaiting_approval: 'Awaiting Approval', not_started: 'Not Started' }[s] || (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))

  const card  = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
  const lbl   = isDarkMode ? 'text-slate-400' : 'text-gray-500'
  const val   = isDarkMode ? 'text-white' : 'text-gray-900'
  const muted = isDarkMode ? 'bg-slate-800' : 'bg-gray-50'
  const divCls = isDarkMode ? 'border-slate-700' : 'border-gray-100'

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200', matching: 'bg-orange-100 text-orange-800 border-orange-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200', in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
    awaiting_approval: 'bg-amber-100 text-amber-800 border-amber-200', completed: 'bg-green-100 text-green-800 border-green-200',
    disputed: 'bg-red-100 text-red-800 border-red-200', cancelled: 'bg-red-100 text-red-800 border-red-200',
  }
  const payColors = { pending: 'bg-yellow-100 text-yellow-800', authorized: 'bg-blue-100 text-blue-800', paid: 'bg-green-100 text-green-800', failed: 'bg-red-100 text-red-800', refunded: 'bg-purple-100 text-purple-800' }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" /></div>
  if (!booking) return <div className="p-6 text-center"><p className="text-gray-500 mb-4">Booking not found</p><button onClick={() => router.back()} className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm">Go Back</button></div>

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-6 text-white text-4xl font-light" onClick={() => setLightbox(null)}>×</button>
          <img src={lightbox} alt="Full size" className="max-w-full max-h-full object-contain rounded-xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-start gap-4 flex-wrap">
        <button onClick={() => router.back()} className={`p-2 rounded-lg transition ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <div className="flex-1">
          <h1 className={`text-2xl font-bold ${val}`}>Booking Details</h1>
          <p className={`text-xs font-mono mt-0.5 ${lbl}`}>{booking.booking_number}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColors[booking.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>{getStatusLabel(booking.status)}</span>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${payColors[booking.payment_status] || 'bg-gray-100 text-gray-800'}`}>{(booking.payment_status || 'pending').toUpperCase()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Customer */}
          <Card card={card} icon="👤" title="Customer Information" val={val}>
            <Grid2>
              <Field label="Full Name" value={`${booking.customer_first_name} ${booking.customer_last_name}`} lbl={lbl} val={val} />
              <Field label="Email" value={booking.customer_email} lbl={lbl} val={val} />
              <Field label="Phone" value={booking.customer_phone || '—'} lbl={lbl} val={val} />
              <Field label="User ID" value={`#${booking.user_id || 'Guest'}`} lbl={lbl} val={val} />
            </Grid2>
          </Card>

          {/* Service & Pricing */}
          <Card card={card} icon="🔧" title="Service & Pricing" val={val}>
            <Grid2>
              <Field label="Service" value={booking.service_name} lbl={lbl} val={val} />
              <Field label="Category" value={booking.category_name || '—'} lbl={lbl} val={val} />
              <Field label="Base Price" value={`$${fmt(booking.service_price)}`} lbl={lbl} val={val} />
              <Field label="Overtime Rate" value={additionalPrice > 0 ? `$${fmt(additionalPrice)}/hr` : 'Not set'} lbl={lbl} val={val} />
              <Field label="Standard Duration" value={formatDuration(booking.standard_duration_minutes || booking.service_duration)} lbl={lbl} val={val} />
              <Field label="Authorized Amount" value={booking.authorized_amount ? `$${fmt(booking.authorized_amount)}` : '—'} lbl={lbl} val={val} />
            </Grid2>
          </Card>

          {/* Job Description */}
          {(booking.job_description || booking.timing_constraints || booking.instructions) && (
            <Card card={card} icon="📝" title="Job Description & Instructions" val={val}>
              <div className="space-y-3">
                {booking.job_description && (
                  <div>
                    <p className={`text-xs font-medium mb-1 ${lbl}`}>Description</p>
                    <div className={`p-3 rounded-xl border ${divCls} ${muted} text-sm ${val} leading-relaxed`}>{booking.job_description}</div>
                  </div>
                )}
                {booking.timing_constraints && (
                  <div>
                    <p className={`text-xs font-medium mb-1 ${lbl}`}>Timing Constraints</p>
                    <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-800 dark:text-amber-300 flex gap-2">
                      <span>⏰</span><span>{booking.timing_constraints}</span>
                    </div>
                  </div>
                )}
                {booking.instructions && (
                  <div>
                    <p className={`text-xs font-medium mb-1 ${lbl}`}>Special Instructions</p>
                    <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-800 dark:text-blue-300 flex gap-2">
                      <span>📌</span><span>{booking.instructions}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Payment */}
          <Card card={card} icon="💳" title="Payment Information" val={val}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${lbl}`}>Payment Status</span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${payColors[booking.payment_status] || 'bg-gray-100 text-gray-800'}`}>{(booking.payment_status || 'pending').toUpperCase()}</span>
              </div>
              <div className={`rounded-xl border ${divCls} ${muted} p-4 space-y-2`}>
                <Row label="Service Base Price" value={`$${fmt(booking.service_price)}`} lbl={lbl} valCls={val} />
                {commissionSet && <>
                  <Row label={`Platform Commission (${booking.commission_percent}%)`} value={`-$${fmt(booking.service_price * booking.commission_percent / 100)}`} lbl={lbl} valCls="text-red-500" />
                  <Row label="Provider Base Amount" value={`$${fmt(booking.provider_amount)}`} lbl={lbl} valCls={val} />
                </>}
                {booking.overtime_minutes > 0 && <Row label={`Overtime (${booking.overtime_minutes} min)`} value={`+$${fmt(booking.overtime_earnings)}`} lbl={lbl} valCls="text-orange-500" />}
                {booking.actual_duration_minutes > 0 && <Row label="Actual Duration" value={formatDuration(booking.actual_duration_minutes)} lbl={lbl} valCls={val} />}
                {booking.final_provider_amount > 0 && (
                  <div className={`pt-2 mt-1 border-t ${divCls} flex justify-between`}>
                    <span className={`text-sm font-semibold ${val}`}>Provider Earns (Final)</span>
                    <span className="text-sm font-bold text-green-600">${fmt(booking.final_provider_amount)}</span>
                  </div>
                )}
                {booking.authorized_amount > 0 && (
                  <div className={`pt-2 border-t ${divCls} flex justify-between`}>
                    <span className={`text-sm font-semibold ${val}`}>Customer Charged</span>
                    <span className={`text-sm font-bold ${val}`}>${fmt(booking.authorized_amount)}</span>
                  </div>
                )}
              </div>
              {booking.payment_intent_id && (
                <div>
                  <p className={`text-xs mb-1.5 ${lbl}`}>Stripe Payment Intent ID</p>
                  <div className={`p-2.5 rounded-lg font-mono text-xs ${muted} ${val} break-all border ${divCls}`}>{booking.payment_intent_id}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Schedule */}
          <Card card={card} icon="📅" title="Schedule" val={val}>
            <Grid2>
              <Field label="Job Date" value={formatDate(booking.job_date)} lbl={lbl} val={val} />
              <div>
                <p className={`text-xs mb-1 ${lbl}`}>Time Slots</p>
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(booking.job_time_slot) ? booking.job_time_slot : [booking.job_time_slot]).filter(Boolean).map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 rounded-lg text-xs font-medium capitalize">{s}</span>
                  ))}
                </div>
              </div>
            </Grid2>
            <div className={`mt-4 pt-4 border-t ${divCls} grid grid-cols-2 sm:grid-cols-4 gap-3`}>
              <SmallField label="Accepted At" value={formatDateTime(booking.accepted_at)} lbl={lbl} val={val} />
              <SmallField label="Start Time" value={formatDateTime(booking.start_time)} lbl={lbl} val={val} />
              <SmallField label="End Time" value={formatDateTime(booking.end_time)} lbl={lbl} val={val} />
              <SmallField label="Timer Status" value={getStatusLabel(booking.job_timer_status)} lbl={lbl} val={val} />
            </div>
          </Card>

          {/* Location */}
          <Card card={card} icon="📍" title="Location & Access" val={val}>
            <div className={`p-3 rounded-xl border ${divCls} bg-teal-50 dark:bg-teal-900/20 mb-4`}>
              <p className={`text-sm font-medium ${val}`}>{[booking.address_line1, booking.address_line2, booking.city, booking.postal_code].filter(Boolean).join(', ')}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[['🅿️ Parking', booking.parking_access], ['🛗 Elevator', booking.elevator_access], ['🐕 Pets', booking.has_pets]].map(([label, active]) => (
                <div key={label} className={`p-2.5 rounded-xl border text-center text-xs font-medium
                  ${active ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                           : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                  {label} {active ? '✓' : '✗'}
                </div>
              ))}
            </div>
          </Card>

          {/* ── PHOTOS ── */}
          <Card card={card} icon="📷" title="Job Photos" val={val}>
            <div className="space-y-5">
              {/* Upload status badges */}
              <div className="flex gap-2">
                {[['Before Photos', booking.before_photos_uploaded], ['After Photos', booking.after_photos_uploaded]].map(([label, done]) => (
                  <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    ${done ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                    {done ? '✓' : '○'} {label}
                  </div>
                ))}
              </div>

              {/* Before photos */}
              <PhotoSection
                label="BEFORE" count={booking.before_photos?.length || 0}
                color="orange" photos={booking.before_photos || []}
                getPhotoSrc={getPhotoSrc} setLightbox={setLightbox} isDarkMode={isDarkMode}
              />

              {/* After photos */}
              <PhotoSection
                label="AFTER" count={booking.after_photos?.length || 0}
                color="green" photos={booking.after_photos || []}
                getPhotoSrc={getPhotoSrc} setLightbox={setLightbox} isDarkMode={isDarkMode}
              />

              {/* Customer upload photos */}
              {booking.photos?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>
                      CUSTOMER UPLOADS ({booking.photos.length})
                    </span>
                    <div className={`flex-1 h-px ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {booking.photos.map((url, i) => (
                      <PhotoThumb key={i} src={getPhotoSrc(url)} alt={`Upload ${i+1}`} onClick={() => setLightbox(getPhotoSrc(url))} isDarkMode={isDarkMode} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

        </div>

        {/* ── SIDEBAR ── */}
        <div className="space-y-5">

          {/* Commission */}
          <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💰</span>
              <h2 className={`text-base font-semibold ${val}`}>Commission</h2>
              {commissionSet && <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Live</span>}
            </div>
            {commissionSet ? (
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${lbl}`}>Commission Rate</span>
                  <span className="text-2xl font-bold text-green-600">{booking.commission_percent}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${lbl}`}>Platform earns</span>
                  <span className="text-sm font-semibold text-green-600">${fmt(booking.service_price * booking.commission_percent / 100)}</span>
                </div>
              </div>
            ) : (
              <div>
                <p className={`text-xs mb-3 ${lbl}`}>Set commission to make this job visible to providers.</p>
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <input type="number" min="0" max="100" step="0.5" value={commissionPct}
                      onChange={e => setCommissionPct(e.target.value)} placeholder="e.g. 20"
                      className={`w-full pl-3 pr-8 py-2.5 rounded-xl border text-sm outline-none transition
                        ${isDarkMode ? 'bg-slate-800 text-white border-slate-700 focus:border-teal-500' : 'bg-white text-gray-900 border-gray-300 focus:border-teal-500'}
                        focus:ring-2 focus:ring-teal-200`} />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${lbl}`}>%</span>
                  </div>
                  <button onClick={saveCommission} disabled={savingCommission || commissionPct === ''}
                    className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-50">
                    {savingCommission ? '…' : 'Save'}
                  </button>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-2">
                  <span className="text-amber-600">⚠️</span>
                  <div>
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">Commission not set</p>
                    <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">Job is hidden from providers.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Provider Assignment */}
          <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">👷</span>
              <h2 className={`text-base font-semibold ${val}`}>Provider Assignment</h2>
            </div>
            {booking.provider_name ? (
              <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-xl border border-teal-200 dark:border-teal-800 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                    {booking.provider_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${val}`}>{booking.provider_name}</p>
                    <p className={`text-xs ${lbl}`}>{booking.accepted_at ? `Accepted ${formatDateTime(booking.accepted_at)}` : 'Manually assigned'}</p>
                  </div>
                </div>
                <div className={`pt-2 border-t border-teal-200 dark:border-teal-800 space-y-1`}>
                  {booking.provider_email && <p className={`text-xs ${lbl}`}>📧 {booking.provider_email}</p>}
                  {booking.provider_phone && <p className={`text-xs ${lbl}`}>📱 {booking.provider_phone}</p>}
                  {booking.provider_rating > 0 && <p className={`text-xs ${lbl}`}>⭐ {parseFloat(booking.provider_rating).toFixed(1)} rating</p>}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className={`text-xs ${lbl}`}>Providers can self-assign once commission is set, or assign manually.</p>
                {!commissionSet && (
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1"><span>⚠️</span> Set commission first</p>
                  </div>
                )}
                <select value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)} disabled={updating}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition
                    ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-gray-300'}
                    focus:border-teal-500 focus:ring-2 focus:ring-teal-200`}>
                  <option value="">Select a provider</option>
                  {tradespeople.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <button onClick={assignProvider} disabled={!selectedProvider || updating || !commissionSet}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition
                    ${!commissionSet ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500' : 'bg-teal-600 text-white hover:bg-teal-700'}`}>
                  {!commissionSet ? 'Set Commission First' : (updating ? 'Assigning…' : 'Assign Provider')}
                </button>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
            <h2 className={`text-base font-semibold mb-4 ${val}`}>Status Timeline</h2>
            {booking.status_history?.length > 0 ? (
              <div className="space-y-3">
                {booking.status_history.map((item, i) => (
                  <div key={i} className="relative pl-4 pb-3 border-l-2 border-teal-500 last:pb-0">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-teal-500" />
                    <p className={`text-xs font-semibold ${val}`}>{getStatusLabel(item.status)}</p>
                    {item.notes && <p className={`text-xs italic mt-0.5 ${lbl}`}>{item.notes}</p>}
                    <p className={`text-[10px] mt-0.5 ${lbl}`}>{new Date(item.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : <p className={`text-sm ${lbl}`}>No history yet</p>}
          </div>

          {/* Update Status */}
          <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
            <h2 className={`text-base font-semibold mb-3 ${val}`}>Update Status</h2>
            <div className="flex flex-wrap gap-2">
              {['pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(s => (
                <button key={s} onClick={() => updateBooking({ status: s }, `Status → ${getStatusLabel(s)}`)}
                  disabled={booking.status === s || updating}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                    ${booking.status === s ? 'bg-teal-500 text-white cursor-default'
                      : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    ${updating ? 'opacity-50 cursor-wait' : ''}`}>
                  {getStatusLabel(s)}
                </button>
              ))}
            </div>
          </div>

          {/* Meta */}
          <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
            <h2 className={`text-base font-semibold mb-3 ${val}`}>Booking Meta</h2>
            <div className="space-y-2">
              <Field label="Booking ID" value={`#${booking.id}`} lbl={lbl} val={val} />
              <Field label="Service ID" value={`#${booking.service_id}`} lbl={lbl} val={val} />
              <Field label="Created" value={formatDateTime(booking.created_at)} lbl={lbl} val={val} />
              <Field label="Last Updated" value={formatDateTime(booking.updated_at)} lbl={lbl} val={val} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Sub-components ──

function Card({ card, icon, title, val, children }) {
  return (
    <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
      <h2 className={`text-base font-semibold mb-4 flex items-center gap-2 ${val}`}><span>{icon}</span> {title}</h2>
      {children}
    </div>
  )
}
function Grid2({ children }) { return <div className="grid grid-cols-2 gap-4">{children}</div> }
function Field({ label, value, lbl, val }) {
  return <div><p className={`text-xs mb-0.5 ${lbl}`}>{label}</p><p className={`text-sm font-medium ${val}`}>{value || '—'}</p></div>
}
function SmallField({ label, value, lbl, val }) {
  return <div><p className={`text-[10px] uppercase tracking-wide mb-0.5 ${lbl}`}>{label}</p><p className={`text-xs font-medium ${val}`}>{value || '—'}</p></div>
}
function Row({ label, value, lbl, valCls }) {
  return <div className="flex justify-between items-center"><span className={`text-sm ${lbl}`}>{label}</span><span className={`text-sm font-semibold ${valCls}`}>{value}</span></div>
}

function PhotoSection({ label, count, color, photos, getPhotoSrc, setLightbox, isDarkMode }) {
  const colorMap = {
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    green:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  }
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorMap[color]}`}>{label} ({count})</span>
        <div className={`flex-1 h-px ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
      </div>
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((p, i) => (
            <PhotoThumb key={i} src={getPhotoSrc(p.url || p)} alt={`${label} ${i+1}`}
              uploadedAt={p.uploaded_at} onClick={() => setLightbox(getPhotoSrc(p.url || p))} isDarkMode={isDarkMode} />
          ))}
        </div>
      ) : (
        <div className={`flex items-center justify-center h-20 rounded-xl border-2 border-dashed text-xs ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-gray-200 text-gray-400'}`}>
          No {label.toLowerCase()} photos uploaded
        </div>
      )}
    </div>
  )
}

function PhotoThumb({ src, alt, onClick, uploadedAt, isDarkMode }) {
  const [error, setError] = useState(false)
  return (
    <div onClick={onClick}
      className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-teal-400 transition-all ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
      {error
        ? <div className="w-full h-full flex items-center justify-center text-2xl">🖼️</div>
        : <img src={src} alt={alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" onError={() => setError(true)} />
      }
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center">
        <span className="opacity-0 group-hover:opacity-100 text-white text-xl">🔍</span>
      </div>
      {uploadedAt && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1.5 py-1 truncate">
          {new Date(uploadedAt).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}