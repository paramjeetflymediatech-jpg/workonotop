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
//   const [toast, setToast] = useState(null)
//   const [tradespeople, setTradespeople] = useState([])
//   const [selectedProvider, setSelectedProvider] = useState('')
//   const [commissionPct, setCommissionPct] = useState('')
//   const [savingCommission, setSavingCommission] = useState(false)
//   const [lightbox, setLightbox] = useState(null)

//   const unwrappedParams = React.use(params)
//   const bookingId = unwrappedParams.id

//   useEffect(() => { fetchBooking(); loadTradespeople() }, [bookingId])

//   const fetchBooking = async () => {
//     try {
//       const res = await fetch(`/api/bookings/${bookingId}`)
//       const data = await res.json()
//       if (data.success) {
//         setBooking(data.data)
//         setSelectedProvider(data.data.provider_id || '')
//         if (data.data.commission_percent != null) setCommissionPct(String(data.data.commission_percent))
//       } else notify('error', 'Booking not found')
//     } catch { notify('error', 'Failed to load booking') }
//     finally { setLoading(false) }
//   }

//   const loadTradespeople = async () => {
//     try {
//       const res = await fetch('/api/provider?status=active')
//       const data = await res.json()
//       if (data.success) setTradespeople(data.data || [])
//     } catch {}
//   }

//   const notify = (type, message) => {
//     setToast({ type, message })
//     setTimeout(() => setToast(null), 3500)
//   }

//   const updateBooking = async (body, successMsg) => {
//     setUpdating(true)
//     try {
//       const res = await fetch(`/api/bookings?id=${booking.id}`, {
//         method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
//       })
//       const data = await res.json()
//       if (data.success) { notify('success', successMsg); fetchBooking() }
//       else notify('error', data.message || 'Failed to update')
//     } catch { notify('error', 'Request failed') }
//     finally { setUpdating(false) }
//   }

//   const saveCommission = async () => {
//     const pct = parseFloat(commissionPct)
//     if (isNaN(pct) || pct < 0 || pct > 100) { notify('error', 'Enter a valid percentage (0–100)'); return }
//     setSavingCommission(true)
//     try {
//       const res = await fetch(`/api/bookings?id=${booking.id}`, {
//         method: 'PUT', headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ commission_percent: pct })
//       })
//       const data = await res.json()
//       if (data.success) { notify('success', `Commission set to ${pct}%`); fetchBooking() }
//       else notify('error', data.message || 'Failed to set commission')
//     } catch { notify('error', 'Request failed') }
//     finally { setSavingCommission(false) }
//   }

//   const assignProvider = async () => {
//     if (!selectedProvider) { notify('error', 'Please select a provider'); return }
//     if (booking.commission_percent == null) { notify('error', '⚠️ Set commission first before assigning provider'); return }
//     await updateBooking({ provider_id: selectedProvider, status: 'matching' }, 'Provider assigned & status set to Matching')
//   }

//   const fmt = (n) => parseFloat(n || 0).toFixed(2)
//   const basePrice = booking ? parseFloat(booking.service_price) : 0
//   const additionalPrice = booking ? parseFloat(booking.additional_price || 0) : 0
//   const commissionSet = booking?.commission_percent != null
//   const getPhotoSrc = (url) => url?.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL || ''}${url}`

//   const formatDuration = (m) => {
//     if (!m) return '—'
//     if (m < 60) return `${m} min`
//     const h = Math.floor(m / 60), rem = m % 60
//     return rem > 0 ? `${h}h ${rem}m` : `${h}h`
//   }
//   const formatDate = (d) => { try { return new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) } catch { return '—' } }
//   const formatDateTime = (d) => { try { return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return '—' } }
//   const getStatusLabel = (s) => ({ in_progress: 'In Progress', awaiting_approval: 'Awaiting Approval', not_started: 'Not Started' }[s] || (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))

//   const card  = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//   const lbl   = isDarkMode ? 'text-slate-400' : 'text-gray-500'
//   const val   = isDarkMode ? 'text-white' : 'text-gray-900'
//   const muted = isDarkMode ? 'bg-slate-800' : 'bg-gray-50'
//   const divCls = isDarkMode ? 'border-slate-700' : 'border-gray-100'

//   const statusColors = {
//     pending: 'bg-yellow-100 text-yellow-800 border-yellow-200', matching: 'bg-orange-100 text-orange-800 border-orange-200',
//     confirmed: 'bg-blue-100 text-blue-800 border-blue-200', in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
//     awaiting_approval: 'bg-amber-100 text-amber-800 border-amber-200', completed: 'bg-green-100 text-green-800 border-green-200',
//     disputed: 'bg-red-100 text-red-800 border-red-200', cancelled: 'bg-red-100 text-red-800 border-red-200',
//   }
//   const payColors = { pending: 'bg-yellow-100 text-yellow-800', authorized: 'bg-blue-100 text-blue-800', paid: 'bg-green-100 text-green-800', failed: 'bg-red-100 text-red-800', refunded: 'bg-purple-100 text-purple-800' }

//   if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" /></div>
//   if (!booking) return <div className="p-6 text-center"><p className="text-gray-500 mb-4">Booking not found</p><button onClick={() => router.back()} className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm">Go Back</button></div>

//   return (
//     <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">

//       {toast && (
//         <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
//           {toast.type === 'success' ? '✓' : '✕'} {toast.message}
//         </div>
//       )}

//       {lightbox && (
//         <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
//           <button className="absolute top-4 right-6 text-white text-4xl font-light" onClick={() => setLightbox(null)}>×</button>
//           <img src={lightbox} alt="Full size" className="max-w-full max-h-full object-contain rounded-xl" onClick={e => e.stopPropagation()} />
//         </div>
//       )}

//       {/* Header */}
//       <div className="mb-6 flex items-start gap-4 flex-wrap">
//         <button onClick={() => router.back()} className={`p-2 rounded-lg transition ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
//         </button>
//         <div className="flex-1">
//           <h1 className={`text-2xl font-bold ${val}`}>Booking Details</h1>
//           <p className={`text-xs font-mono mt-0.5 ${lbl}`}>{booking.booking_number}</p>
//         </div>
//         <div className="flex items-center gap-2 flex-wrap">
//           <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColors[booking.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>{getStatusLabel(booking.status)}</span>
//           <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${payColors[booking.payment_status] || 'bg-gray-100 text-gray-800'}`}>{(booking.payment_status || 'pending').toUpperCase()}</span>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-5">

//           {/* Customer */}
//           <Card card={card} icon="👤" title="Customer Information" val={val}>
//             <Grid2>
//               <Field label="Full Name" value={`${booking.customer_first_name} ${booking.customer_last_name}`} lbl={lbl} val={val} />
//               <Field label="Email" value={booking.customer_email} lbl={lbl} val={val} />
//               <Field label="Phone" value={booking.customer_phone || '—'} lbl={lbl} val={val} />
//               <Field label="User ID" value={`#${booking.user_id || 'Guest'}`} lbl={lbl} val={val} />
//             </Grid2>
//           </Card>

//           {/* Service & Pricing */}
//           <Card card={card} icon="🔧" title="Service & Pricing" val={val}>
//             <Grid2>
//               <Field label="Service" value={booking.service_name} lbl={lbl} val={val} />
//               <Field label="Category" value={booking.category_name || '—'} lbl={lbl} val={val} />
//               <Field label="Base Price" value={`$${fmt(booking.service_price)}`} lbl={lbl} val={val} />
//               <Field label="Overtime Rate" value={additionalPrice > 0 ? `$${fmt(additionalPrice)}/hr` : 'Not set'} lbl={lbl} val={val} />
//               <Field label="Standard Duration" value={formatDuration(booking.standard_duration_minutes || booking.service_duration)} lbl={lbl} val={val} />
//               <Field label="Authorized Amount" value={booking.authorized_amount ? `$${fmt(booking.authorized_amount)}` : '—'} lbl={lbl} val={val} />
//             </Grid2>
//           </Card>

//           {/* Job Description */}
//           {(booking.job_description || booking.timing_constraints || booking.instructions) && (
//             <Card card={card} icon="📝" title="Job Description & Instructions" val={val}>
//               <div className="space-y-3">
//                 {booking.job_description && (
//                   <div>
//                     <p className={`text-xs font-medium mb-1 ${lbl}`}>Description</p>
//                     <div className={`p-3 rounded-xl border ${divCls} ${muted} text-sm ${val} leading-relaxed`}>{booking.job_description}</div>
//                   </div>
//                 )}
//                 {booking.timing_constraints && (
//                   <div>
//                     <p className={`text-xs font-medium mb-1 ${lbl}`}>Timing Constraints</p>
//                     <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-800 dark:text-amber-300 flex gap-2">
//                       <span>⏰</span><span>{booking.timing_constraints}</span>
//                     </div>
//                   </div>
//                 )}
//                 {booking.instructions && (
//                   <div>
//                     <p className={`text-xs font-medium mb-1 ${lbl}`}>Special Instructions</p>
//                     <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-800 dark:text-blue-300 flex gap-2">
//                       <span>📌</span><span>{booking.instructions}</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </Card>
//           )}

//           {/* Payment */}
//           <Card card={card} icon="💳" title="Payment Information" val={val}>
//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <span className={`text-sm ${lbl}`}>Payment Status</span>
//                 <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${payColors[booking.payment_status] || 'bg-gray-100 text-gray-800'}`}>{(booking.payment_status || 'pending').toUpperCase()}</span>
//               </div>
//               <div className={`rounded-xl border ${divCls} ${muted} p-4 space-y-2`}>
//                 <Row label="Service Base Price" value={`$${fmt(booking.service_price)}`} lbl={lbl} valCls={val} />
//                 {commissionSet && <>
//                   <Row label={`Platform Commission (${booking.commission_percent}%)`} value={`-$${fmt(booking.service_price * booking.commission_percent / 100)}`} lbl={lbl} valCls="text-red-500" />
//                   <Row label="Provider Base Amount" value={`$${fmt(booking.provider_amount)}`} lbl={lbl} valCls={val} />
//                 </>}
//                 {booking.overtime_minutes > 0 && <Row label={`Overtime (${booking.overtime_minutes} min)`} value={`+$${fmt(booking.overtime_earnings)}`} lbl={lbl} valCls="text-orange-500" />}
//                 {booking.actual_duration_minutes > 0 && <Row label="Actual Duration" value={formatDuration(booking.actual_duration_minutes)} lbl={lbl} valCls={val} />}
//                 {booking.final_provider_amount > 0 && (
//                   <div className={`pt-2 mt-1 border-t ${divCls} flex justify-between`}>
//                     <span className={`text-sm font-semibold ${val}`}>Provider Earns (Final)</span>
//                     <span className="text-sm font-bold text-green-600">${fmt(booking.final_provider_amount)}</span>
//                   </div>
//                 )}
//                 {booking.authorized_amount > 0 && (
//                   <div className={`pt-2 border-t ${divCls} flex justify-between`}>
//                     <span className={`text-sm font-semibold ${val}`}>Customer Charged</span>
//                     <span className={`text-sm font-bold ${val}`}>${fmt(booking.authorized_amount)}</span>
//                   </div>
//                 )}
//               </div>
//               {booking.payment_intent_id && (
//                 <div>
//                   <p className={`text-xs mb-1.5 ${lbl}`}>Stripe Payment Intent ID</p>
//                   <div className={`p-2.5 rounded-lg font-mono text-xs ${muted} ${val} break-all border ${divCls}`}>{booking.payment_intent_id}</div>
//                 </div>
//               )}
//             </div>
//           </Card>

//           {/* Schedule */}
//           <Card card={card} icon="📅" title="Schedule" val={val}>
//             <Grid2>
//               <Field label="Job Date" value={formatDate(booking.job_date)} lbl={lbl} val={val} />
//               <div>
//                 <p className={`text-xs mb-1 ${lbl}`}>Time Slots</p>
//                 <div className="flex flex-wrap gap-1">
//                   {(Array.isArray(booking.job_time_slot) ? booking.job_time_slot : [booking.job_time_slot]).filter(Boolean).map((s, i) => (
//                     <span key={i} className="px-2 py-1 bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 rounded-lg text-xs font-medium capitalize">{s}</span>
//                   ))}
//                 </div>
//               </div>
//             </Grid2>
//             <div className={`mt-4 pt-4 border-t ${divCls} grid grid-cols-2 sm:grid-cols-4 gap-3`}>
//               <SmallField label="Accepted At" value={formatDateTime(booking.accepted_at)} lbl={lbl} val={val} />
//               <SmallField label="Start Time" value={formatDateTime(booking.start_time)} lbl={lbl} val={val} />
//               <SmallField label="End Time" value={formatDateTime(booking.end_time)} lbl={lbl} val={val} />
//               <SmallField label="Timer Status" value={getStatusLabel(booking.job_timer_status)} lbl={lbl} val={val} />
//             </div>
//           </Card>

//           {/* Location */}
//           <Card card={card} icon="📍" title="Location & Access" val={val}>
//             <div className={`p-3 rounded-xl border ${divCls} bg-teal-50 dark:bg-teal-900/20 mb-4`}>
//               <p className={`text-sm font-medium ${val}`}>{[booking.address_line1, booking.address_line2, booking.city, booking.postal_code].filter(Boolean).join(', ')}</p>
//             </div>
//             <div className="grid grid-cols-3 gap-2">
//               {[['🅿️ Parking', booking.parking_access], ['🛗 Elevator', booking.elevator_access], ['🐕 Pets', booking.has_pets]].map(([label, active]) => (
//                 <div key={label} className={`p-2.5 rounded-xl border text-center text-xs font-medium
//                   ${active ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
//                            : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
//                   {label} {active ? '✓' : '✗'}
//                 </div>
//               ))}
//             </div>
//           </Card>

//           {/* Photos */}
//           <Card card={card} icon="📷" title="Job Photos" val={val}>
//             <div className="space-y-5">
//               <div className="flex gap-2">
//                 {[['Before Photos', booking.before_photos_uploaded], ['After Photos', booking.after_photos_uploaded]].map(([label, done]) => (
//                   <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
//                     ${done ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500'}`}>
//                     {done ? '✓' : '○'} {label}
//                   </div>
//                 ))}
//               </div>
//               <PhotoSection label="BEFORE" count={booking.before_photos?.length || 0} color="orange" photos={booking.before_photos || []} getPhotoSrc={getPhotoSrc} setLightbox={setLightbox} isDarkMode={isDarkMode} />
//               <PhotoSection label="AFTER" count={booking.after_photos?.length || 0} color="green" photos={booking.after_photos || []} getPhotoSrc={getPhotoSrc} setLightbox={setLightbox} isDarkMode={isDarkMode} />
//               {booking.photos?.length > 0 && (
//                 <div>
//                   <div className="flex items-center gap-2 mb-3">
//                     <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>CUSTOMER UPLOADS ({booking.photos.length})</span>
//                     <div className={`flex-1 h-px ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
//                   </div>
//                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//                     {booking.photos.map((url, i) => (
//                       <PhotoThumb key={i} src={getPhotoSrc(url)} alt={`Upload ${i+1}`} onClick={() => setLightbox(getPhotoSrc(url))} isDarkMode={isDarkMode} />
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </Card>

//         </div>

//         {/* SIDEBAR */}
//         <div className="space-y-5">

//           {/* Commission */}
//           <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//             <div className="flex items-center gap-2 mb-3">
//               <span className="text-lg">💰</span>
//               <h2 className={`text-base font-semibold ${val}`}>Commission</h2>
//               {commissionSet && <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Live</span>}
//             </div>
//             {commissionSet ? (
//               <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className={`text-sm ${lbl}`}>Commission Rate</span>
//                   <span className="text-2xl font-bold text-green-600">{booking.commission_percent}%</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className={`text-xs ${lbl}`}>Platform earns</span>
//                   <span className="text-sm font-semibold text-green-600">${fmt(booking.service_price * booking.commission_percent / 100)}</span>
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 <p className={`text-xs mb-3 ${lbl}`}>Set commission to make this job visible to providers.</p>
//                 <div className="flex gap-2 mb-3">
//                   <div className="relative flex-1">
//                     <input type="number" min="0" max="100" step="0.5" value={commissionPct}
//                       onChange={e => setCommissionPct(e.target.value)} placeholder="e.g. 20"
//                       className={`w-full pl-3 pr-8 py-2.5 rounded-xl border text-sm outline-none transition
//                         ${isDarkMode ? 'bg-slate-800 text-white border-slate-700 focus:border-teal-500' : 'bg-white text-gray-900 border-gray-300 focus:border-teal-500'}
//                         focus:ring-2 focus:ring-teal-200`} />
//                     <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${lbl}`}>%</span>
//                   </div>
//                   <button onClick={saveCommission} disabled={savingCommission || commissionPct === ''}
//                     className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-50">
//                     {savingCommission ? '…' : 'Save'}
//                   </button>
//                 </div>
//                 <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex gap-2">
//                   <span className="text-amber-600">⚠️</span>
//                   <div>
//                     <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">Commission not set</p>
//                     <p className="text-xs text-amber-700 dark:text-amber-500 mt-0.5">Job is hidden from providers.</p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Provider Assignment */}
//           <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//             <div className="flex items-center gap-2 mb-4">
//               <span className="text-lg">👷</span>
//               <h2 className={`text-base font-semibold ${val}`}>Provider Assignment</h2>
//             </div>
//             {booking.provider_name ? (
//               <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-xl border border-teal-200 dark:border-teal-800 space-y-2">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
//                     {booking.provider_name?.charAt(0).toUpperCase()}
//                   </div>
//                   <div>
//                     <p className={`text-sm font-semibold ${val}`}>{booking.provider_name}</p>
//                     <p className={`text-xs ${lbl}`}>{booking.accepted_at ? `Accepted ${formatDateTime(booking.accepted_at)}` : 'Manually assigned'}</p>
//                   </div>
//                 </div>
//                 <div className={`pt-2 border-t border-teal-200 dark:border-teal-800 space-y-1`}>
//                   {booking.provider_email && <p className={`text-xs ${lbl}`}>📧 {booking.provider_email}</p>}
//                   {booking.provider_phone && <p className={`text-xs ${lbl}`}>📱 {booking.provider_phone}</p>}
//                   {booking.provider_rating > 0 && <p className={`text-xs ${lbl}`}>⭐ {parseFloat(booking.provider_rating).toFixed(1)} rating</p>}
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 <p className={`text-xs ${lbl}`}>Providers can self-assign once commission is set, or assign manually.</p>
//                 {!commissionSet && (
//                   <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
//                     <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1"><span>⚠️</span> Set commission first</p>
//                   </div>
//                 )}
//                 <select value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)} disabled={updating}
//                   className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition
//                     ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-gray-300'}
//                     focus:border-teal-500 focus:ring-2 focus:ring-teal-200`}>
//                   <option value="">Select a provider</option>
//                   {tradespeople.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
//                 </select>
//                 <button onClick={assignProvider} disabled={!selectedProvider || updating || !commissionSet}
//                   className={`w-full py-2.5 rounded-xl text-sm font-semibold transition
//                     ${!commissionSet ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500' : 'bg-teal-600 text-white hover:bg-teal-700'}`}>
//                   {!commissionSet ? 'Set Commission First' : (updating ? 'Assigning…' : 'Assign Provider')}
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Status Timeline */}
//           <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//             <h2 className={`text-base font-semibold mb-4 ${val}`}>Status Timeline</h2>
//             {booking.status_history?.length > 0 ? (
//               <div className="space-y-3">
//                 {booking.status_history.map((item, i) => (
//                   <div key={i} className="relative pl-4 pb-3 border-l-2 border-teal-500 last:pb-0">
//                     <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-teal-500" />
//                     <p className={`text-xs font-semibold ${val}`}>{getStatusLabel(item.status)}</p>
//                     {item.notes && <p className={`text-xs italic mt-0.5 ${lbl}`}>{item.notes}</p>}
//                     <p className={`text-[10px] mt-0.5 ${lbl}`}>{new Date(item.created_at).toLocaleString()}</p>
//                   </div>
//                 ))}
//               </div>
//             ) : <p className={`text-sm ${lbl}`}>No history yet</p>}
//           </div>

//           {/* Update Status — only shown when disputed */}
//           <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//             <h2 className={`text-base font-semibold mb-3 ${val}`}>Update Status</h2>
//             {booking.status !== 'disputed' ? (
//               <p className={`text-sm ${lbl}`}>Status changes can only be made when a booking is under dispute.</p>
//             ) : (
//               <div className="flex flex-wrap gap-2">
//                 {['pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(s => (
//                   <button key={s} onClick={() => updateBooking({ status: s }, `Status → ${getStatusLabel(s)}`)}
//                     disabled={updating}
//                     className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
//                       ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
//                       ${updating ? 'opacity-50 cursor-wait' : ''}`}>
//                     {getStatusLabel(s)}
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Meta */}
//           <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//             <h2 className={`text-base font-semibold mb-3 ${val}`}>Booking Meta</h2>
//             <div className="space-y-2">
//               <Field label="Booking ID" value={`#${booking.id}`} lbl={lbl} val={val} />
//               <Field label="Service ID" value={`#${booking.service_id}`} lbl={lbl} val={val} />
//               <Field label="Created" value={formatDateTime(booking.created_at)} lbl={lbl} val={val} />
//               <Field label="Last Updated" value={formatDateTime(booking.updated_at)} lbl={lbl} val={val} />
//             </div>
//           </div>

//         </div>
//       </div>
//     </div>
//   )
// }

// // Sub-components

// function Card({ card, icon, title, val, children }) {
//   return (
//     <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
//       <h2 className={`text-base font-semibold mb-4 flex items-center gap-2 ${val}`}><span>{icon}</span> {title}</h2>
//       {children}
//     </div>
//   )
// }
// function Grid2({ children }) { return <div className="grid grid-cols-2 gap-4">{children}</div> }
// function Field({ label, value, lbl, val }) {
//   return <div><p className={`text-xs mb-0.5 ${lbl}`}>{label}</p><p className={`text-sm font-medium ${val}`}>{value || '—'}</p></div>
// }
// function SmallField({ label, value, lbl, val }) {
//   return <div><p className={`text-[10px] uppercase tracking-wide mb-0.5 ${lbl}`}>{label}</p><p className={`text-xs font-medium ${val}`}>{value || '—'}</p></div>
// }
// function Row({ label, value, lbl, valCls }) {
//   return <div className="flex justify-between items-center"><span className={`text-sm ${lbl}`}>{label}</span><span className={`text-sm font-semibold ${valCls}`}>{value}</span></div>
// }

// function PhotoSection({ label, count, color, photos, getPhotoSrc, setLightbox, isDarkMode }) {
//   const colorMap = {
//     orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
//     green:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
//   }
//   return (
//     <div>
//       <div className="flex items-center gap-2 mb-3">
//         <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorMap[color]}`}>{label} ({count})</span>
//         <div className={`flex-1 h-px ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`} />
//       </div>
//       {photos.length > 0 ? (
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
//           {photos.map((p, i) => (
//             <PhotoThumb key={i} src={getPhotoSrc(p.url || p)} alt={`${label} ${i+1}`}
//               uploadedAt={p.uploaded_at} onClick={() => setLightbox(getPhotoSrc(p.url || p))} isDarkMode={isDarkMode} />
//           ))}
//         </div>
//       ) : (
//         <div className={`flex items-center justify-center h-20 rounded-xl border-2 border-dashed text-xs ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-gray-200 text-gray-400'}`}>
//           No {label.toLowerCase()} photos uploaded
//         </div>
//       )}
//     </div>
//   )
// }

// function PhotoThumb({ src, alt, onClick, uploadedAt, isDarkMode }) {
//   const [error, setError] = useState(false)
//   return (
//     <div onClick={onClick}
//       className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-teal-400 transition-all ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
//       {error
//         ? <div className="w-full h-full flex items-center justify-center text-2xl">🖼️</div>
//         : <img src={src} alt={alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" onError={() => setError(true)} />
//       }
//       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center">
//         <span className="opacity-0 group-hover:opacity-100 text-white text-xl">🔍</span>
//       </div>
//       {uploadedAt && (
//         <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1.5 py-1 truncate">
//           {new Date(uploadedAt).toLocaleDateString()}
//         </div>
//       )}
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
  const [showReassignModal, setShowReassignModal] = useState(false)

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
        if (data.data.commission_percent != null) setCommissionPct(String(data.data.commission_percent))
      } else {
        notify('error', 'Booking not found')
      }
    } catch {
      notify('error', 'Failed to load booking')
    } finally { 
      setLoading(false) 
    }
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
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.success) { 
        notify('success', successMsg)
        fetchBooking()
      } else {
        notify('error', data.message || 'Failed to update')
      }
    } catch { 
      notify('error', 'Request failed') 
    } finally { 
      setUpdating(false) 
    }
  }

  const saveCommission = async () => {
    const pct = parseFloat(commissionPct)
    if (isNaN(pct) || pct < 0 || pct > 100) { 
      notify('error', 'Enter a valid percentage (0–100)')
      return 
    }
    setSavingCommission(true)
    try {
      const res = await fetch(`/api/bookings?id=${booking.id}`, {
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commission_percent: pct })
      })
      const data = await res.json()
      if (data.success) { 
        notify('success', `Commission set to ${pct}%`)
        fetchBooking()
      } else {
        notify('error', data.message || 'Failed to set commission')
      }
    } catch { 
      notify('error', 'Request failed') 
    } finally { 
      setSavingCommission(false) 
    }
  }

  const assignProvider = async () => {
    if (!selectedProvider) { 
      notify('error', 'Please select a provider')
      return 
    }
    if (booking.commission_percent == null) { 
      notify('error', '⚠️ Set commission first before assigning provider')
      return 
    }
    await updateBooking({ 
      provider_id: selectedProvider, 
      status: 'matching' 
    }, 'Provider assigned & status set to Matching')
  }

  // NEW: Reassign provider on dispute
  const reassignProvider = async () => {
    if (!selectedProvider) {
      notify('error', 'Please select a provider')
      return
    }
    
    setUpdating(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}/reassign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_provider_id: selectedProvider,
          old_provider_id: booking.provider_id
        })
      })
      
      const data = await res.json()
      if (data.success) {
        notify('success', 'Provider reassigned successfully')
        setShowReassignModal(false)
        fetchBooking()
      } else {
        notify('error', data.message)
      }
    } catch {
      notify('error', 'Failed to reassign')
    } finally {
      setUpdating(false)
    }
  }

  // NEW: Restart booking
  const restartBooking = async () => {
    if (!confirm('Restart booking? This will remove the current provider.')) return
    
    setUpdating(true)
    try {
      const res = await fetch(`/api/bookings/${booking.id}/restart`, {
        method: 'POST'
      })
      
      const data = await res.json()
      if (data.success) {
        notify('success', 'Booking restarted')
        fetchBooking()
      } else {
        notify('error', data.message)
      }
    } catch {
      notify('error', 'Failed to restart')
    } finally {
      setUpdating(false)
    }
  }

  const fmt = (n) => parseFloat(n || 0).toFixed(2)
  const commissionSet = booking?.commission_percent != null
  
  const getPhotoSrc = (url) => url?.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL || ''}${url}`

  const formatDateTime = (d) => { 
    try { 
      return new Date(d).toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }) 
    } catch { return '—' } 
  }
  
  const getStatusLabel = (s) => {
    const map = {
      in_progress: 'In Progress',
      awaiting_approval: 'Awaiting Approval',
      not_started: 'Not Started'
    }
    return map[s] || (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  const card = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
  const lbl = isDarkMode ? 'text-slate-400' : 'text-gray-500'
  const val = isDarkMode ? 'text-white' : 'text-gray-900'
  const muted = isDarkMode ? 'bg-slate-800' : 'bg-gray-50'
  const divCls = isDarkMode ? 'border-slate-700' : 'border-gray-100'

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    matching: 'bg-orange-100 text-orange-800 border-orange-200',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
    awaiting_approval: 'bg-amber-100 text-amber-800 border-amber-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    disputed: 'bg-red-100 text-red-800 border-red-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  }
  
  const payColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    authorized: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-purple-100 text-purple-800'
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
    </div>
  )
  
  if (!booking) return (
    <div className="p-6 text-center">
      <p className="text-gray-500 mb-4">Booking not found</p>
      <button onClick={() => router.back()} className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm">
        Go Back
      </button>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-6 text-white text-4xl font-light" onClick={() => setLightbox(null)}>×</button>
          <img src={lightbox} alt="Full size" className="max-w-full max-h-full object-contain rounded-xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Reassign Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowReassignModal(false)}>
          <div className={`max-w-md w-full rounded-xl p-6 ${card}`} onClick={e => e.stopPropagation()}>
            <h3 className={`text-lg font-semibold mb-4 ${val}`}>Reassign Provider</h3>
            
            <div className="mb-4">
              <p className={`text-sm mb-2 ${lbl}`}>Current: {booking.provider_name || 'None'}</p>
              <select 
                value={selectedProvider}
                onChange={e => setSelectedProvider(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition
                  ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-gray-300'}`}
              >
                <option value="">Select new provider</option>
                {tradespeople.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={reassignProvider}
                disabled={!selectedProvider || updating}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
              >
                {updating ? '...' : 'Confirm'}
              </button>
              <button
                onClick={() => setShowReassignModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-start gap-4 flex-wrap">
        <button onClick={() => router.back()} className={`p-2 rounded-lg transition ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className={`text-2xl font-bold ${val}`}>Booking Details</h1>
          <p className={`text-xs font-mono mt-0.5 ${lbl}`}>{booking.booking_number}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
            statusColors[booking.status] || 'bg-gray-100 text-gray-800 border-gray-200'
          }`}>
            {getStatusLabel(booking.status)}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
            payColors[booking.payment_status] || 'bg-gray-100 text-gray-800'
          }`}>
            {(booking.payment_status || 'pending').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer Info */}
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
              <Field label="Overtime Rate" value={booking.additional_price > 0 ? `$${fmt(booking.additional_price)}/hr` : 'Not set'} lbl={lbl} val={val} />
              <Field label="Standard Duration" value={booking.service_duration ? `${booking.service_duration} min` : '—'} lbl={lbl} val={val} />
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
                    <div className={`p-3 break-all rounded-xl border ${divCls} ${muted} text-sm ${val} leading-relaxed`}>{booking.job_description}</div>
                  </div>
                )}
                {booking.timing_constraints && (
                  <div>
                    <p className={`text-xs font-medium mb-1 ${lbl}`}>Timing Constraints</p>
                    <div className="p-3 rounded-xl break-all border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-800 dark:text-amber-300 flex gap-2">
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

          {/* Payment Information */}
          <Card card={card} icon="💳" title="Payment Information" val={val}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${lbl}`}>Payment Status</span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  payColors[booking.payment_status] || 'bg-gray-100 text-gray-800'
                }`}>
                  {(booking.payment_status || 'pending').toUpperCase()}
                </span>
              </div>
              <div className={`rounded-xl border ${divCls} ${muted} p-4 space-y-2`}>
                <Row label="Service Base Price" value={`$${fmt(booking.service_price)}`} lbl={lbl} valCls={val} />
                {commissionSet && (
                  <>
                    <Row 
                      label={`Platform Commission (${booking.commission_percent}%)`} 
                      value={`-$${fmt(booking.service_price * booking.commission_percent / 100)}`} 
                      lbl={lbl} 
                      valCls="text-red-500" 
                    />
                    <Row 
                      label="Provider Base Amount" 
                      value={`$${fmt(booking.provider_amount || (booking.service_price * (1 - booking.commission_percent/100)))}`} 
                      lbl={lbl} 
                      valCls={val} 
                    />
                  </>
                )}
                <div className={`pt-2 mt-1 border-t ${divCls} flex justify-between`}>
                  <span className={`text-sm font-semibold ${val}`}>Provider Earns (Final)</span>
                  <span className="text-sm font-bold text-green-600">
                    ${fmt(booking.final_provider_amount || booking.provider_amount || booking.service_price)}
                  </span>
                </div>
                <div className={`pt-2 border-t ${divCls} flex justify-between`}>
                  <span className={`text-sm font-semibold ${val}`}>Customer Charged</span>
                  <span className={`text-sm font-bold ${val}`}>${fmt(booking.authorized_amount || booking.service_price)}</span>
                </div>
              </div>
              {booking.payment_intent_id && (
                <div>
                  <p className={`text-xs mb-1.5 ${lbl}`}>Stripe Payment Intent ID</p>
                  <div className={`p-2.5 rounded-lg font-mono text-xs ${muted} ${val} break-all border ${divCls}`}>
                    {booking.payment_intent_id}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Schedule */}
          <Card card={card} icon="📅" title="Schedule" val={val}>
            <Grid2>
              <Field 
                label="Job Date" 
                value={booking.job_date ? new Date(booking.job_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : '—'} 
                lbl={lbl} 
                val={val} 
              />
              <div>
                <p className={`text-xs mb-1 ${lbl}`}>Time Slots</p>
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(booking.job_time_slot) ? booking.job_time_slot : [booking.job_time_slot])
                    .filter(Boolean).map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 rounded-lg text-xs font-medium capitalize">
                        {s}
                      </span>
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
              <p className={`text-sm font-medium ${val}`}>
                {[booking.address_line1, booking.address_line2, booking.city, booking.postal_code]
                  .filter(Boolean).join(', ')}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['🅿️ Parking', booking.parking_access],
                ['🛗 Elevator', booking.elevator_access],
                ['🐕 Pets', booking.has_pets]
              ].map(([label, active]) => (
                <div key={label} className={`p-2.5 rounded-xl border text-center text-xs font-medium
                  ${active 
                    ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                    : isDarkMode 
                      ? 'bg-slate-800 border-slate-700 text-slate-500' 
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                  {label} {active ? '✓' : '✗'}
                </div>
              ))}
            </div>
          </Card>

          {/* Photos */}
          <Card card={card} icon="📷" title="Job Photos" val={val}>
            <div className="space-y-5">
              <div className="flex gap-2">
                {[['Before Photos', booking.before_photos_uploaded], ['After Photos', booking.after_photos_uploaded]].map(([label, done]) => (
                  <div key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    ${done ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-500'}`}>
                    {done ? '✓' : '○'} {label}
                  </div>
                ))}
              </div>
              <PhotoSection label="BEFORE" count={booking.before_photos?.length || 0} color="orange" photos={booking.before_photos || []} getPhotoSrc={getPhotoSrc} setLightbox={setLightbox} isDarkMode={isDarkMode} />
              <PhotoSection label="AFTER" count={booking.after_photos?.length || 0} color="green" photos={booking.after_photos || []} getPhotoSrc={getPhotoSrc} setLightbox={setLightbox} isDarkMode={isDarkMode} />
              {booking.photos?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}`}>CUSTOMER UPLOADS ({booking.photos.length})</span>
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

        {/* Sidebar - Right Column */}
        <div className="space-y-5">
          {/* Commission */}
          <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💰</span>
              <h2 className={`text-base font-semibold ${val}`}>Commission</h2>
              {commissionSet && (
                <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Live
                </span>
              )}
            </div>
            {commissionSet ? (
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${lbl}`}>Commission Rate</span>
                  <span className="text-2xl font-bold text-green-600">{booking.commission_percent}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${lbl}`}>Platform earns</span>
                  <span className="text-sm font-semibold text-green-600">
                    ${fmt(booking.service_price * booking.commission_percent / 100)}
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <p className={`text-xs mb-3 ${lbl}`}>Set commission to make this job visible to providers.</p>
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      step="0.5" 
                      value={commissionPct}
                      onChange={e => setCommissionPct(e.target.value)} 
                      placeholder="e.g. 20"
                      className={`w-full pl-3 pr-8 py-2.5 rounded-xl border text-sm outline-none transition
                        ${isDarkMode 
                          ? 'bg-slate-800 text-white border-slate-700 focus:border-teal-500' 
                          : 'bg-white text-gray-900 border-gray-300 focus:border-teal-500'
                        }
                        focus:ring-2 focus:ring-teal-200`} 
                    />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${lbl}`}>%</span>
                  </div>
                  <button 
                    onClick={saveCommission} 
                    disabled={savingCommission || commissionPct === ''}
                    className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-50"
                  >
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
                    <p className={`text-xs ${lbl}`}>
                      {booking.accepted_at ? `Accepted ${formatDateTime(booking.accepted_at)}` : 'Manually assigned'}
                    </p>
                  </div>
                </div>
                <div className={`pt-2 border-t border-teal-200 dark:border-teal-800 space-y-1`}>
                  {booking.provider_email && (
                    <p className={`text-xs ${lbl}`}>📧 {booking.provider_email}</p>
                  )}
                  {booking.provider_phone && (
                    <p className={`text-xs ${lbl}`}>📱 {booking.provider_phone}</p>
                  )}
                  {booking.provider_rating > 0 && (
                    <p className={`text-xs ${lbl}`}>⭐ {parseFloat(booking.provider_rating).toFixed(1)} rating</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className={`text-xs ${lbl}`}>Providers can self-assign once commission is set, or assign manually.</p>
                {!commissionSet && (
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <span>⚠️</span> Set commission first
                    </p>
                  </div>
                )}
                <select 
                  value={selectedProvider} 
                  onChange={e => setSelectedProvider(e.target.value)} 
                  disabled={updating}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition
                    ${isDarkMode 
                      ? 'bg-slate-800 text-white border-slate-700' 
                      : 'bg-white text-gray-900 border-gray-300'
                    }
                    focus:border-teal-500 focus:ring-2 focus:ring-teal-200`}
                >
                  <option value="">Select a provider</option>
                  {tradespeople.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.rating ? `(${p.rating})` : ''}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={assignProvider} 
                  disabled={!selectedProvider || updating || !commissionSet}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition
                    ${!commissionSet 
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500' 
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                >
                  {!commissionSet ? 'Set Commission First' : (updating ? 'Assigning…' : 'Assign Provider')}
                </button>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
            <h2 className={`text-base font-semibold mb-4 ${val}`}>Status Timeline</h2>
            {booking.status_history?.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {booking.status_history.map((item, i) => (
                  <div key={i} className="relative pl-4 pb-3 border-l-2 border-teal-500 last:pb-0">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-teal-500" />
                    <p className={`text-xs font-semibold ${val}`}>{getStatusLabel(item.status)}</p>
                    {item.notes && <p className={`text-xs italic mt-0.5 ${lbl}`}>{item.notes}</p>}
                    <p className={`text-[10px] mt-0.5 ${lbl}`}>{new Date(item.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${lbl}`}>No history yet</p>
            )}
          </div>

          {/* Update Status */}
          <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
            <h2 className={`text-base font-semibold mb-3 ${val}`}>Update Status</h2>
            
            {booking.status === 'disputed' ? (
              <div className="space-y-3">
                <p className={`text-sm ${lbl} mb-2`}>Dispute Resolution:</p>
                
                <button 
                  onClick={() => setShowReassignModal(true)}
                  disabled={updating}
                  className="w-full px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition disabled:opacity-50"
                >
                  Reassign to New Provider
                </button>
                
                <button 
                  onClick={restartBooking}
                  disabled={updating}
                  className="w-full px-4 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-semibold hover:bg-indigo-600 transition disabled:opacity-50"
                >
                  Restart Booking (Remove Provider)
                </button>
                
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t ${divCls}`}></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className={`px-2 ${isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-white text-gray-500'}`}>
                      Or set to
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {['pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(s => (
                    <button 
                      key={s} 
                      onClick={() => updateBooking({ status: s }, `Status → ${getStatusLabel(s)}`)}
                      disabled={updating}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                        ${isDarkMode 
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                        ${updating ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      {getStatusLabel(s)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p className={`text-sm ${lbl}`}>
                Status changes can only be made when a booking is under dispute.
              </p>
            )}
          </div>

          {/* Booking Meta */}
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

// Helper Components
function Card({ card, icon, title, val, children }) {
  return (
    <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
      <h2 className={`text-base font-semibold mb-4 flex items-center gap-2 ${val}`}>
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  )
}

function Grid2({ children }) { 
  return <div className="grid grid-cols-2 gap-4">{children}</div> 
}

function Field({ label, value, lbl, val }) {
  return (
    <div>
      <p className={`text-xs mb-0.5 ${lbl}`}>{label}</p>
      <p className={`text-sm font-medium ${val}`}>{value || '—'}</p>
    </div>
  )
}

function SmallField({ label, value, lbl, val }) {
  return (
    <div>
      <p className={`text-[10px] uppercase tracking-wide mb-0.5 ${lbl}`}>{label}</p>
      <p className={`text-xs font-medium ${val}`}>{value || '—'}</p>
    </div>
  )
}

function Row({ label, value, lbl, valCls }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${lbl}`}>{label}</span>
      <span className={`text-sm font-semibold ${valCls}`}>{value}</span>
    </div>
  )
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