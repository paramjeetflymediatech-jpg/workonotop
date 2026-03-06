// // app/provider/available-jobs/[id]/page.jsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import React from 'react'
// import { ArrowLeft, Clock, Calendar, MapPin, X, CheckCircle } from 'lucide-react'

// // ── Toast ─────────────────────────────────────────────────────────────────────
// function Toast({ toast, onDismiss }) {
//   useEffect(() => {
//     if (!toast) return
//     const t = setTimeout(onDismiss, 4000)
//     return () => clearTimeout(t)
//   }, [toast, onDismiss])
//   if (!toast) return null
//   const bg = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-blue-600' }
//   return (
//     <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-white text-sm font-medium max-w-xs ${bg[toast.type]}`}>
//       {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
//       {toast.text}
//     </div>
//   )
// }

// // ── Stripe Not Connected Modal ─────────────────────────────────────────────────
// function StripeRequiredModal({ isOpen, onClose }) {
//   if (!isOpen) return null
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
//       <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
//         <div className="p-6 text-center">
//           <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <span className="text-3xl">💳</span>
//           </div>
//           <h3 className="text-lg font-bold text-gray-900 mb-2">Stripe Not Connected</h3>
//           <p className="text-sm text-gray-500 mb-1">
//             You need to connect your Stripe account before you can accept jobs and receive payments.
//           </p>
//           <p className="text-xs text-gray-400 mb-5">
//             It only takes a few minutes to set up.
//           </p>
//           <div className="flex gap-3">
//             <button onClick={onClose}
//               className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition">
//               Later
//             </button>
//             <Link href="/provider/onboarding?step=3"
//               className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition text-center">
//               Connect Stripe →
//             </Link>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ── Confirm Modal ─────────────────────────────────────────────────────────────
// function ConfirmModal({ isOpen, onClose, onConfirm, loading, amount, hasOvertime, baseEarnings, netOT }) {
//   if (!isOpen) return null
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
//       <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
//         <div className="p-6 text-center">
//           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${hasOvertime ? 'bg-purple-50' : 'bg-green-50'}`}>
//             <span className="text-2xl">💼</span>
//           </div>
//           <h3 className="text-lg font-bold text-gray-900 mb-1">Accept this Job?</h3>
//           <p className="text-sm text-gray-400 mb-4">This job will be assigned to you immediately and removed from the pool.</p>
//           <div className={`rounded-xl p-3 mb-2 ${hasOvertime ? 'bg-purple-50 border border-purple-100' : 'bg-green-50 border border-green-100'}`}>
//             <p className="text-xs text-gray-500 mb-1">Guaranteed earnings</p>
//             <p className={`text-2xl font-extrabold ${hasOvertime ? 'text-purple-700' : 'text-green-700'}`}>{amount}</p>
//           </div>
//           {hasOvertime && (
//             <div className="text-xs text-gray-500 flex justify-center gap-3 mt-2">
//               <span>1hr OT: ${(parseFloat(baseEarnings) + parseFloat(netOT)).toFixed(2)}</span>
//               <span>·</span>
//               <span>2hr OT: ${(parseFloat(baseEarnings) + parseFloat(netOT) * 2).toFixed(2)}</span>
//             </div>
//           )}
//         </div>
//         <div className="flex gap-3 px-6 pb-6">
//           <button onClick={onClose} disabled={loading}
//             className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition">
//             Cancel
//           </button>
//           <button onClick={onConfirm} disabled={loading}
//             className={`flex-1 py-3 text-white font-bold rounded-xl text-sm transition disabled:opacity-60 flex items-center justify-center gap-2 ${
//               hasOvertime ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-green-600 hover:bg-green-700'
//             }`}>
//             {loading
//               ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Accepting…</>
//               : '✓ Confirm Accept'
//             }
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ── Helpers ───────────────────────────────────────────────────────────────────
// function formatDate(d) {
//   if (!d) return ''
//   return new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
// }
// function formatDuration(m) {
//   if (!m) return '60 minutes'
//   if (m < 60) return `${m} minutes`
//   const h = Math.floor(m / 60), r = m % 60
//   return r ? `${h} hour${h > 1 ? 's' : ''} ${r} min` : `${h} hour${h > 1 ? 's' : ''}`
// }
// function fmtSlots(s) {
//   if (!s) return []
//   return (Array.isArray(s) ? s : [s]).map(x => x.charAt(0).toUpperCase() + x.slice(1))
// }

// function InfoCard({ title, icon, children }) {
//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
//       <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm mb-4">
//         <span>{icon}</span> {title}
//       </h2>
//       {children}
//     </div>
//   )
// }

// // ── Main ──────────────────────────────────────────────────────────────────────
// export default function ProviderJobDetail({ params }) {
//   const router = useRouter()
//   const { id } = React.use(params)

//   const [job, setJob] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [accepting, setAccepting] = useState(false)
//   const [showConfirm, setShowConfirm] = useState(false)
//   const [stripeConnected, setStripeConnected] = useState(true)
//   const [stripeModal, setStripeModal] = useState(false)
//   const [toast, setToast] = useState(null)

//   const showToast = (type, text) => setToast({ type, text })

//   useEffect(() => { loadJob(); checkStripe() }, [id])

//   const checkStripe = async () => {
//     try {
//       const res = await fetch('/api/provider/me')
//       const data = await res.json()
//       if (data.success) {
//         setStripeConnected(data.provider?.stripe_onboarding_complete || false)
//       }
//     } catch {
//       // ignore
//     }
//   }

//   const loadJob = async () => {
//     setLoading(true)
//     try {
//       // ✅ Cookie-based auth
//       const res = await fetch(`/api/provider/available-jobs/${id}`)
//       const data = await res.json()
//       if (data.success) {
//         setJob({ ...data.data, is_available: data.is_available, is_my_job: data.is_my_job })
//       } else {
//         showToast('error', data.message || 'Job not found')
//       }
//     } catch {
//       showToast('error', 'Failed to load job')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const acceptJob = async () => {
//     // stripeConnected should already be true when called
//     setAccepting(true)
//     try {
//       const res = await fetch('/api/provider/available-jobs', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ booking_id: id })
//       })
//       const data = await res.json()
//       setShowConfirm(false)
//       if (data.success) {
//         showToast('success', '🎉 Job accepted!')
//         if (data.overtime_info) setTimeout(() => showToast('info', data.overtime_info.message), 800)
//         setTimeout(() => router.push('/provider/available-jobs'), 2000)
//       } else {
//         showToast('error', data.message || 'Could not accept job')
//         loadJob()
//       }
//     } catch {
//       showToast('error', 'Request failed')
//       setAccepting(false)
//     }
//   }

//   if (loading) return (
//     <div className="flex flex-col items-center justify-center py-32 gap-3">
//       <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
//       <p className="text-sm text-gray-400">Loading job details…</p>
//     </div>
//   )

//   if (!job) return (
//     <div className="flex flex-col items-center justify-center py-32 text-center">
//       <span className="text-5xl mb-4">😕</span>
//       <h3 className="text-lg font-bold text-gray-900 mb-2">Job Not Found</h3>
//       <p className="text-sm text-gray-400 mb-5">This job may have already been taken.</p>
//       <Link href="/provider/available-jobs"
//         className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition">
//         ← Back to Jobs
//       </Link>
//     </div>
//   )

//   const amount = parseFloat(job.provider_amount || 0)
//   const basePrice = parseFloat(job.service_price || job.base_price || 0)
//   const commPct = parseFloat(job.commission_percent || 0)
//   const otRate = parseFloat(job.additional_price || job.overtime_rate || 0)
//   const dur = job.service_duration || 60
//   const commAmt = basePrice * (commPct / 100)
//   const baseEarnings = basePrice - commAmt
//   const netOT = otRate * (1 - commPct / 100)
//   const hasOvertime = otRate > 0
//   const slots = fmtSlots(job.job_time_slot)

//   return (
//     <div className="w-full pb-32">
//       <Toast toast={toast} onDismiss={() => setToast(null)} />
//       <StripeRequiredModal isOpen={stripeModal} onClose={() => setStripeModal(false)} />

//       <ConfirmModal
//         isOpen={showConfirm}
//         onClose={() => setShowConfirm(false)}
//         onConfirm={acceptJob}
//         loading={accepting}
//         amount={`$${amount.toFixed(2)}`}
//         hasOvertime={hasOvertime}
//         baseEarnings={baseEarnings}
//         netOT={netOT}
//       />

//       {/* Back */}
//       <div className="mb-4">
//         <Link href="/provider/available-jobs"
//           className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
//           <ArrowLeft className="h-4 w-4" /> Available Jobs
//         </Link>
//       </div>

//       {/* Hero */}
//       <div className={`rounded-2xl text-white p-6 mb-4 ${
//         hasOvertime
//           ? 'bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700'
//           : 'bg-gradient-to-br from-green-500 to-teal-600'
//       }`}>
//         <div className="flex items-start justify-between gap-4">
//           <div className="min-w-0">
//             <p className="text-white/70 text-xs uppercase tracking-wide mb-1">{job.category_name}</p>
//             <h1 className="text-xl font-bold">{job.service_name}</h1>
//             <p className="text-white/60 text-xs mt-1">#{job.booking_number}</p>
//           </div>
//           <div className="text-right flex-shrink-0 bg-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm">
//             <p className="text-white/70 text-[10px] uppercase tracking-wide">You earn</p>
//             <p className="text-3xl font-extrabold">${amount.toFixed(2)}</p>
//           </div>
//         </div>
//         <div className="mt-3 flex flex-wrap gap-2">
//           <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-xs">
//             <Clock className="h-3 w-3" /> {formatDuration(dur)}
//           </span>
//           {hasOvertime && (
//             <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
//               ⏰ +${otRate.toFixed(2)}/hr overtime
//             </span>
//           )}
//         </div>
//       </div>

//       {/* Status banners */}
//       {!job.is_available && !job.is_my_job && (
//         <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-4 flex items-center gap-2.5">
//           <span className="text-xl">⚠️</span>
//           <p className="text-sm text-red-700 font-medium">Already accepted by another provider.</p>
//         </div>
//       )}
//       {job.is_my_job && (
//         <div className="bg-green-50 border border-green-200 rounded-xl p-3.5 mb-4 flex items-center justify-between">
//           <p className="text-sm text-green-700 font-medium flex items-center gap-2">
//             <CheckCircle className="h-4 w-4" /> You accepted this job!
//           </p>
//           <Link href="/provider/jobs" className="text-sm text-green-700 font-bold underline">My Jobs →</Link>
//         </div>
//       )}

//       <div className="space-y-3">
//         {/* Payment Breakdown */}
//         <InfoCard title="Payment Breakdown" icon="💰">
//           <div className="space-y-2.5">
//             <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
//               <Clock className="h-4 w-4 text-gray-400" />
//               <div>
//                 <p className="text-xs text-gray-400">Standard Duration</p>
//                 <p className="text-sm font-semibold text-gray-900">{formatDuration(dur)}</p>
//               </div>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-500">Base price</span>
//               <span className="font-medium text-gray-900">${basePrice.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between text-sm">
//               <span className="text-gray-500">Commission ({commPct}%)</span>
//               <span className="font-medium text-orange-600">−${commAmt.toFixed(2)}</span>
//             </div>
//             <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100">
//               <span className="text-gray-800">Your base earnings</span>
//               <span className="text-green-600">${baseEarnings.toFixed(2)}</span>
//             </div>

//             {hasOvertime && (
//               <>
//                 <div className="flex justify-between text-sm pt-1">
//                   <span className="text-gray-500">Overtime rate (gross)</span>
//                   <span className="font-medium text-purple-600">+${otRate.toFixed(2)}/hr</span>
//                 </div>
//                 <div className="flex justify-between text-sm">
//                   <span className="text-gray-500">Commission on OT ({commPct}%)</span>
//                   <span className="font-medium text-orange-600">−${(otRate * commPct / 100).toFixed(2)}/hr</span>
//                 </div>
//                 <div className="flex justify-between text-sm font-semibold">
//                   <span className="text-gray-700">Net overtime rate</span>
//                   <span className="text-green-600">+${netOT.toFixed(2)}/hr</span>
//                 </div>

//                 <div className="bg-purple-50 rounded-xl p-3.5 mt-1">
//                   <p className="text-xs font-semibold text-purple-700 mb-3">With overtime, you could earn:</p>
//                   {[[1, baseEarnings + netOT], [2, baseEarnings + netOT * 2]].map(([hrs, total]) => (
//                     <div key={hrs} className="mb-2 last:mb-0">
//                       <div className="flex justify-between text-sm">
//                         <span className="text-gray-600">Base + {hrs}hr overtime</span>
//                         <span className="font-bold text-purple-700">${total.toFixed(2)}</span>
//                       </div>
//                       <div className="text-xs text-gray-400">
//                         ${baseEarnings.toFixed(2)} + ${(netOT * hrs).toFixed(2)} net OT
//                       </div>
//                     </div>
//                   ))}
//                   <p className="text-xs text-gray-400 mt-2">All amounts after {commPct}% commission</p>
//                 </div>
//               </>
//             )}
//           </div>
//         </InfoCard>

//         {/* Schedule */}
//         <InfoCard title="Schedule" icon="📅">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div>
//               <p className="text-xs text-gray-400 mb-1">Date</p>
//               <p className="text-sm font-semibold text-gray-900">{formatDate(job.job_date)}</p>
//             </div>
//             <div>
//               <p className="text-xs text-gray-400 mb-2">Time Slot{slots.length > 1 ? 's' : ''}</p>
//               <div className="flex flex-wrap gap-1.5">
//                 {slots.map((s, i) => (
//                   <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-semibold">{s}</span>
//                 ))}
//               </div>
//             </div>
//           </div>
//           {job.timing_constraints && (
//             <div className="mt-3 pt-3 border-t border-gray-100">
//               <p className="text-xs text-gray-400 mb-1">Timing Notes</p>
//               <p className="text-sm text-gray-700">{job.timing_constraints}</p>
//             </div>
//           )}
//         </InfoCard>

//         {/* Location */}
//         <InfoCard title="Location" icon="📍">
//           <div className="bg-gray-50 rounded-xl p-3.5 mb-3">
//             <p className="text-sm font-semibold text-gray-900">{job.address_line1}</p>
//             {job.address_line2 && <p className="text-sm text-gray-500 mt-0.5">{job.address_line2}</p>}
//             {(job.city || job.postal_code) && (
//               <p className="text-xs text-gray-400 mt-0.5">{[job.city, job.postal_code].filter(Boolean).join(', ')}</p>
//             )}
//           </div>
//           <div className="grid grid-cols-3 gap-2">
//             {[
//               ['🅿️', 'Parking', job.parking_access, 'green'],
//               ['🛗', 'Elevator', job.elevator_access, 'green'],
//               ['🐕', 'Pets', job.has_pets, 'amber'],
//             ].map(([icon, label, val, color]) => (
//               <div key={label} className={`rounded-xl border p-2.5 text-center text-xs font-semibold ${
//                 val
//                   ? color === 'green' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'
//                   : 'bg-gray-50 border-gray-200 text-gray-300'
//               }`}>
//                 <span className="block text-base mb-0.5">{icon}</span>
//                 {label} {val ? '✓' : '—'}
//               </div>
//             ))}
//           </div>
//         </InfoCard>

//         {/* Description */}
//         {job.job_description && (
//           <InfoCard title="Job Description" icon="📝">
//             <p className="text-sm text-gray-700 leading-relaxed">{job.job_description}</p>
//           </InfoCard>
//         )}

//         {/* Instructions */}
//         {job.instructions && (
//           <InfoCard title="Special Instructions" icon="💡">
//             <p className="text-sm text-gray-700 leading-relaxed">{job.instructions}</p>
//           </InfoCard>
//         )}

//         {/* Photos */}
//         {job.photos?.length > 0 && (
//           <InfoCard title={`Photos (${job.photos.length})`} icon="📷">
//             <div className="grid grid-cols-3 gap-2">
//               {job.photos.map((photo, i) => (
//                 <div key={i} onClick={() => window.open(photo, '_blank')}
//                   className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition">
//                   <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
//                 </div>
//               ))}
//             </div>
//           </InfoCard>
//         )}
//       </div>

//       {/* Sticky Accept Button */}
//       {job.is_available && (
//         <div className="fixed bottom-0 left-0 right-0 lg:left-60 z-30 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
//           <div className="max-w-3xl mx-auto">
//             <button onClick={() => {
//                 if (!stripeConnected) {
//                   setStripeModal(true)
//                 } else {
//                   setShowConfirm(true)
//                 }
//               }}
//               className={`w-full py-4 text-white rounded-2xl font-bold text-base transition shadow-lg flex items-center justify-center gap-2 ${
//                 hasOvertime
//                   ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-95'
//                   : 'bg-green-600 hover:bg-green-700'
//               }`}>
//               ✓ Accept this Job — Earn ${amount.toFixed(2)}
//               {hasOvertime && (
//                 <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
//                   Up to ${(baseEarnings + netOT * 2).toFixed(2)} with 2hr OT
//                 </span>
//               )}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }











// app/provider/available-jobs/[id]/page.jsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import { ArrowLeft, Clock, Calendar, MapPin, X, CheckCircle } from 'lucide-react'

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [toast, onDismiss])
  if (!toast) return null
  const bg = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-blue-600' }
  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl text-white text-sm font-medium max-w-xs ${bg[toast.type]}`}>
      {toast.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
      {toast.text}
    </div>
  )
}

// ── Stripe Not Connected Modal ─────────────────────────────────────────────────
function StripeRequiredModal({ isOpen, onClose }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💳</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Stripe Not Connected</h3>
          <p className="text-sm text-gray-500 mb-1">
            You need to connect your Stripe account before you can accept jobs and receive payments.
          </p>
          <p className="text-xs text-gray-400 mb-5">It only takes a few minutes to set up.</p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition">
              Later
            </button>
            <Link href="/provider/onboarding?step=3"
              className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-sm transition text-center">
              Connect Stripe →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
function ConfirmModal({ isOpen, onClose, onConfirm, loading, amount, hasOvertime, baseEarnings, netOT }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="p-6 text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${hasOvertime ? 'bg-purple-50' : 'bg-green-50'}`}>
            <span className="text-2xl">💼</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Accept this Job?</h3>
          <p className="text-sm text-gray-400 mb-4">This job will be assigned to you immediately and removed from the pool.</p>
          <div className={`rounded-xl p-3 mb-2 ${hasOvertime ? 'bg-purple-50 border border-purple-100' : 'bg-green-50 border border-green-100'}`}>
            <p className="text-xs text-gray-500 mb-1">Guaranteed earnings</p>
            <p className={`text-2xl font-extrabold ${hasOvertime ? 'text-purple-700' : 'text-green-700'}`}>{amount}</p>
          </div>
          {hasOvertime && (
            <div className="text-xs text-gray-500 flex justify-center gap-3 mt-2">
              <span>1hr OT: ${(parseFloat(baseEarnings) + parseFloat(netOT)).toFixed(2)}</span>
              <span>·</span>
              <span>2hr OT: ${(parseFloat(baseEarnings) + parseFloat(netOT) * 2).toFixed(2)}</span>
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} disabled={loading}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 py-3 text-white font-bold rounded-xl text-sm transition disabled:opacity-60 flex items-center justify-center gap-2 ${
              hasOvertime ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-green-600 hover:bg-green-700'
            }`}>
            {loading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Accepting…</>
              : '✓ Confirm Accept'
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}
function formatDuration(m) {
  if (!m) return '60 minutes'
  if (m < 60) return `${m} minutes`
  const h = Math.floor(m / 60), r = m % 60
  return r ? `${h} hour${h > 1 ? 's' : ''} ${r} min` : `${h} hour${h > 1 ? 's' : ''}`
}
function fmtSlots(s) {
  if (!s) return []
  return (Array.isArray(s) ? s : [s]).map(x => x.charAt(0).toUpperCase() + x.slice(1))
}

function InfoCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm mb-4">
        <span>{icon}</span> {title}
      </h2>
      {children}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProviderJobDetail({ params }) {
  const router = useRouter()
  const { id } = React.use(params)

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [stripeConnected, setStripeConnected] = useState(true)
  const [stripeModal, setStripeModal] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (type, text) => setToast({ type, text })

  useEffect(() => { loadJob(); checkStripe() }, [id])

  const checkStripe = async () => {
    try {
      const res = await fetch('/api/provider/me')
      const data = await res.json()
      if (data.success) setStripeConnected(data.provider?.stripe_onboarding_complete || false)
    } catch { /* ignore */ }
  }

  const loadJob = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/provider/available-jobs/${id}`)
      const data = await res.json()
      if (data.success) {
        setJob({ ...data.data, is_available: data.is_available, is_my_job: data.is_my_job })
      } else {
        showToast('error', data.message || 'Job not found')
      }
    } catch {
      showToast('error', 'Failed to load job')
    } finally {
      setLoading(false)
    }
  }

  const acceptJob = async () => {
    setAccepting(true)
    try {
      const res = await fetch('/api/provider/available-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: id })
      })
      const data = await res.json()
      setShowConfirm(false)
      if (data.success) {
        showToast('success', '🎉 Job accepted!')
        if (data.overtime_info) setTimeout(() => showToast('info', data.overtime_info.message), 800)
        setTimeout(() => router.push('/provider/available-jobs'), 2000)
      } else {
        showToast('error', data.message || 'Could not accept job')
        loadJob()
      }
    } catch {
      showToast('error', 'Request failed')
      setAccepting(false)
    }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-3">
      <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Loading job details…</p>
    </div>
  )

  if (!job) return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <span className="text-5xl mb-4">😕</span>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Job Not Found</h3>
      <p className="text-sm text-gray-400 mb-5">This job may have already been taken.</p>
      <Link href="/provider/available-jobs"
        className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition">
        ← Back to Jobs
      </Link>
    </div>
  )

  const amount      = parseFloat(job.provider_amount || 0)
  const basePrice   = parseFloat(job.service_price || job.base_price || 0)
  const commPct     = parseFloat(job.commission_percent || 0)
  const otRate      = parseFloat(job.additional_price || job.overtime_rate || 0)
  const dur         = job.service_duration || 60
  const commAmt     = basePrice * (commPct / 100)
  const baseEarnings = basePrice - commAmt
  const netOT       = otRate * (1 - commPct / 100)
  const hasOvertime = otRate > 0
  const slots       = fmtSlots(job.job_time_slot)

  // ✅ FIX: Cast to boolean — prevents MySQL tinyint 0 rendering as "0" text in JSX
  const hasParking  = !!job.parking_access
  const hasElevator = !!job.elevator_access
  const hasPets     = !!job.has_pets

  return (
    <div className="w-full pb-32">
      <Toast toast={toast} onDismiss={() => setToast(null)} />
      <StripeRequiredModal isOpen={stripeModal} onClose={() => setStripeModal(false)} />

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={acceptJob}
        loading={accepting}
        amount={`$${amount.toFixed(2)}`}
        hasOvertime={hasOvertime}
        baseEarnings={baseEarnings}
        netOT={netOT}
      />

      {/* Back */}
      <div className="mb-4">
        <Link href="/provider/available-jobs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
          <ArrowLeft className="h-4 w-4" /> Available Jobs
        </Link>
      </div>

      {/* Hero */}
      <div className={`rounded-2xl text-white p-6 mb-4 ${
        hasOvertime
          ? 'bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700'
          : 'bg-gradient-to-br from-green-500 to-teal-600'
      }`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-white/70 text-xs uppercase tracking-wide mb-1">{job.category_name}</p>
            <h1 className="text-xl font-bold">{job.service_name}</h1>
            <p className="text-white/60 text-xs mt-1">#{job.booking_number}</p>
          </div>
          <div className="text-right flex-shrink-0 bg-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm">
            <p className="text-white/70 text-[10px] uppercase tracking-wide">You earn</p>
            <p className="text-3xl font-extrabold">${amount.toFixed(2)}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-xs">
            <Clock className="h-3 w-3" /> {formatDuration(dur)}
          </span>
          {hasOvertime && (
            <span className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
              ⏰ +${otRate.toFixed(2)}/hr overtime
            </span>
          )}
        </div>
      </div>

      {/* Status banners */}
      {!job.is_available && !job.is_my_job && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-4 flex items-center gap-2.5">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-red-700 font-medium">Already accepted by another provider.</p>
        </div>
      )}
      {job.is_my_job && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3.5 mb-4 flex items-center justify-between">
          <p className="text-sm text-green-700 font-medium flex items-center gap-2">
            <CheckCircle className="h-4 w-4" /> You accepted this job!
          </p>
          <Link href="/provider/jobs" className="text-sm text-green-700 font-bold underline">My Jobs →</Link>
        </div>
      )}

      <div className="space-y-3">
        {/* Payment Breakdown */}
        <InfoCard title="Payment Breakdown" icon="💰">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Clock className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Standard Duration</p>
                <p className="text-sm font-semibold text-gray-900">{formatDuration(dur)}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Base price</span>
              <span className="font-medium text-gray-900">${basePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Commission ({commPct}%)</span>
              <span className="font-medium text-orange-600">−${commAmt.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100">
              <span className="text-gray-800">Your base earnings</span>
              <span className="text-green-600">${baseEarnings.toFixed(2)}</span>
            </div>

            {hasOvertime && (
              <>
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-gray-500">Overtime rate (gross)</span>
                  <span className="font-medium text-purple-600">+${otRate.toFixed(2)}/hr</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Commission on OT ({commPct}%)</span>
                  <span className="font-medium text-orange-600">−${(otRate * commPct / 100).toFixed(2)}/hr</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-gray-700">Net overtime rate</span>
                  <span className="text-green-600">+${netOT.toFixed(2)}/hr</span>
                </div>

                <div className="bg-purple-50 rounded-xl p-3.5 mt-1">
                  <p className="text-xs font-semibold text-purple-700 mb-3">With overtime, you could earn:</p>
                  {[[1, baseEarnings + netOT], [2, baseEarnings + netOT * 2]].map(([hrs, total]) => (
                    <div key={hrs} className="mb-2 last:mb-0">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Base + {hrs}hr overtime</span>
                        <span className="font-bold text-purple-700">${total.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        ${baseEarnings.toFixed(2)} + ${(netOT * hrs).toFixed(2)} net OT
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-gray-400 mt-2">All amounts after {commPct}% commission</p>
                </div>
              </>
            )}
          </div>
        </InfoCard>

        {/* Schedule */}
        <InfoCard title="Schedule" icon="📅">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Date</p>
              <p className="text-sm font-semibold text-gray-900">{formatDate(job.job_date)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">Time Slot{slots.length > 1 ? 's' : ''}</p>
              <div className="flex flex-wrap gap-1.5">
                {slots.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-semibold">{s}</span>
                ))}
              </div>
            </div>
          </div>
          {job.timing_constraints && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Timing Notes</p>
              <p className="text-sm text-gray-700">{job.timing_constraints}</p>
            </div>
          )}
        </InfoCard>

        {/* Location */}
        <InfoCard title="Location" icon="📍">
          <div className="bg-gray-50 rounded-xl p-3.5 mb-3">
            <p className="text-sm font-semibold text-gray-900">{job.address_line1}</p>
            {job.address_line2 && <p className="text-sm text-gray-500 mt-0.5">{job.address_line2}</p>}
            {(job.city || job.postal_code) && (
              <p className="text-xs text-gray-400 mt-0.5">{[job.city, job.postal_code].filter(Boolean).join(', ')}</p>
            )}
          </div>

          {/* ✅ FIXED: Using boolean cast — prevents tinyint 0 showing as "0" text */}
          <div className="grid grid-cols-3 gap-2">
            {[
              ['🅿️', 'Parking',  hasParking,  'green'],
              ['🛗', 'Elevator', hasElevator, 'green'],
              ['🐕', 'Pets',     hasPets,     'amber'],
            ].map(([icon, label, val, color]) => (
              <div key={label} className={`rounded-xl border p-2.5 text-center text-xs font-semibold ${
                val
                  ? color === 'green'
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-gray-50 border-gray-200 text-gray-300'
              }`}>
                <span className="block text-base mb-0.5">{icon}</span>
                {label} {val ? '✓' : '—'}
              </div>
            ))}
          </div>
        </InfoCard>

        {/* Description */}
        {job.job_description && (
          <InfoCard title="Job Description" icon="📝">
            <p className="text-sm text-gray-700 leading-relaxed">{job.job_description}</p>
          </InfoCard>
        )}

        {/* Instructions */}
        {job.instructions && (
          <InfoCard title="Special Instructions" icon="💡">
            <p className="text-sm text-gray-700 leading-relaxed">{job.instructions}</p>
          </InfoCard>
        )}

        {/* Photos */}
        {job.photos?.length > 0 && (
          <InfoCard title={`Photos (${job.photos.length})`} icon="📷">
            <div className="grid grid-cols-3 gap-2">
              {job.photos.map((photo, i) => (
                <div key={i} onClick={() => window.open(photo, '_blank')}
                  className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition">
                  <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </InfoCard>
        )}
      </div>

      {/* Sticky Accept Button */}
      {job.is_available && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-60 z-30 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => { if (!stripeConnected) { setStripeModal(true) } else { setShowConfirm(true) } }}
              className={`w-full py-4 text-white rounded-2xl font-bold text-base transition shadow-lg flex items-center justify-center gap-2 ${
                hasOvertime
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-95'
                  : 'bg-green-600 hover:bg-green-700'
              }`}>
              ✓ Accept this Job — Earn ${amount.toFixed(2)}
              {hasOvertime && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                  Up to ${(baseEarnings + netOT * 2).toFixed(2)} with 2hr OT
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}