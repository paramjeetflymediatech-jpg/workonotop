






// 'use client'

// import { useState, useEffect } from 'react'
// import Link from 'next/link'
// import { RefreshCw, MapPin, Clock } from 'lucide-react'

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
//       {toast.type === 'success' ? '✓' : toast.type === 'info' ? 'ℹ' : '✕'}
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
// function ConfirmModal({ isOpen, onClose, onConfirm, title, message, amount }) {
//   if (!isOpen) return null
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
//       <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
//         <div className="p-6 text-center">
//           <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <span className="text-2xl">💼</span>
//           </div>
//           <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
//           <p className="text-sm text-gray-500 mb-2">{message}</p>
//           {amount && (
//             <div className="inline-flex items-center gap-1.5 bg-green-50 border border-green-100 text-green-700 text-lg font-bold px-4 py-2 rounded-xl mt-1">
//               You earn: {amount}
//             </div>
//           )}
//         </div>
//         <div className="flex gap-3 px-6 pb-6">
//           <button onClick={onClose}
//             className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition">
//             Cancel
//           </button>
//           <button onClick={() => { onConfirm(); onClose(); }}
//             className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-sm transition">
//             Accept Job
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// // ── Helpers ───────────────────────────────────────────────────────────────────
// function formatDate(d) {
//   if (!d) return ''
//   return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
// }
// function fmtSlots(s) {
//   if (!s) return ''
//   return (Array.isArray(s) ? s : [s]).map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' · ')
// }
// function formatDuration(m) {
//   if (!m) return '60 min'
//   if (m < 60) return `${m} min`
//   const h = Math.floor(m / 60), r = m % 60
//   return r ? `${h}h ${r}m` : `${h} hour${h > 1 ? 's' : ''}`
// }

// function MetaBadge({ icon, text }) {
//   return (
//     <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
//       <span>{icon}</span> {text}
//     </span>
//   )
// }

// // ── Main Component ────────────────────────────────────────────────────────────
// export default function ProviderAvailableJobs() {
//   const [jobs, setJobs] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [refreshing, setRefreshing] = useState(false)
//   const [providerCity, setProviderCity] = useState('')
//   const [toast, setToast] = useState(null)
//   const [filter, setFilter] = useState('all')
//   const [stripeConnected, setStripeConnected] = useState(true)
//   const [confirmModal, setConfirmModal] = useState({ open: false, jobId: null, amount: null })
//   const [stripeModal, setStripeModal] = useState(false)

//   const showToast = (type, text) => setToast({ type, text })

//   useEffect(() => { loadJobs() }, [])

//   const loadJobs = async (silent = false) => {
//     silent ? setRefreshing(true) : setLoading(true)
//     try {
//       // Check stripe status alongside jobs
//       const [jobsRes, provRes] = await Promise.all([
//         fetch('/api/provider/available-jobs'),
//         fetch('/api/provider/me')
//       ])
//       const data = await jobsRes.json()
//       const provData = await provRes.json()

//       if (provData.success) {
//         setStripeConnected(provData.provider?.stripe_onboarding_complete || false)
//       }

//       if (data.success) {
//         setJobs(data.data || [])
//         if (data.provider_city) setProviderCity(data.provider_city)
//         if (!data.data?.length && !silent) showToast('info', 'No jobs available in your area')
//       } else {
//         showToast('error', data.message || 'Failed to load jobs')
//       }
//     } catch {
//       showToast('error', 'Connection failed. Please try again.')
//     } finally {
//       setLoading(false)
//       setRefreshing(false)
//     }
//   }

//   // Called when Accept button clicked — check Stripe first
//   const handleAcceptClick = (jobId, amount) => {
//     if (!stripeConnected) {
//       setStripeModal(true)
//       return
//     }
//     setConfirmModal({ open: true, jobId, amount })
//   }

//   const acceptJob = async (jobId) => {
//     try {
//       const res = await fetch('/api/provider/available-jobs', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ booking_id: jobId })
//       })
//       const data = await res.json()
//       if (data.success) {
//         showToast('success', data.message)
//         setJobs(prev => prev.filter(j => j.id !== jobId))
//         if (data.overtime_info) {
//           setTimeout(() => showToast('info', data.overtime_info.message), 1000)
//         }
//       } else {
//         showToast('error', data.message || 'Failed to accept job')
//         loadJobs(true)
//       }
//     } catch {
//       showToast('error', 'Failed to accept job')
//     }
//   }

//   const filteredJobs = jobs.filter(j => {
//     if (filter === 'with_overtime') return j.pricing?.has_overtime
//     if (filter === 'base_only') return !j.pricing?.has_overtime
//     if (filter === 'assigned') return j.is_admin_assigned
//     return true
//   })

//   const stats = {
//     total: jobs.length,
//     assigned: jobs.filter(j => j.is_admin_assigned).length,
//     overtime: jobs.filter(j => j.pricing?.has_overtime).length,
//     base: jobs.filter(j => !j.pricing?.has_overtime).length,
//   }

//   return (
//     <div className="w-full">
//       <Toast toast={toast} onDismiss={() => setToast(null)} />

//       <StripeRequiredModal
//         isOpen={stripeModal}
//         onClose={() => setStripeModal(false)}
//       />

//       <ConfirmModal
//         isOpen={confirmModal.open}
//         onClose={() => setConfirmModal({ open: false, jobId: null, amount: null })}
//         onConfirm={() => acceptJob(confirmModal.jobId)}
//         title="Accept this Job?"
//         message="This job will be assigned to you immediately."
//         amount={confirmModal.amount}
//       />

//       {/* Header */}
//       <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
//         <div>
//           <h1 className="text-xl font-bold text-gray-900">Available Jobs</h1>
//           {providerCity && (
//             <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
//               <MapPin className="h-3.5 w-3.5 text-green-500" />
//               Jobs near <strong className="text-gray-600 ml-1">{providerCity}</strong>
//             </p>
//           )}
//         </div>
//         <button onClick={() => loadJobs(true)} disabled={refreshing}
//           className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition disabled:opacity-50">
//           <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
//           Refresh
//         </button>
//       </div>

//       {/* Stripe warning banner on available jobs page */}
//       {!stripeConnected && !loading && (
//         <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
//           <span className="text-xl">⚠️</span>
//           <p className="text-sm text-amber-800 flex-1">
//             <strong>Stripe not connected.</strong> You can view jobs but cannot accept them until you connect Stripe.
//           </p>
//           <Link href="/provider/onboarding?step=3"
//             className="text-xs font-bold text-amber-700 underline whitespace-nowrap">
//             Connect →
//           </Link>
//         </div>
//       )}

//       {/* Stats + Filters */}
//       {!loading && jobs.length > 0 && (
//         <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
//           <div className="flex gap-3 text-xs flex-wrap">
//             <span className="text-gray-500">Total: <strong className="text-gray-900">{stats.total}</strong></span>
//             {stats.assigned > 0 && (
//               <>
//                 <span className="text-gray-300">|</span>
//                 <span className="text-blue-600">🎯 Assigned: <strong>{stats.assigned}</strong></span>
//               </>
//             )}
//             <span className="text-gray-300">|</span>
//             <span className="text-purple-600">+OT: <strong>{stats.overtime}</strong></span>
//             <span className="text-gray-300">|</span>
//             <span className="text-gray-500">Base: <strong>{stats.base}</strong></span>
//           </div>
//           <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl flex-wrap">
//             {[
//               ['all', 'All'],
//               ...(stats.assigned > 0 ? [['assigned', '🎯 Assigned']] : []),
//               ['with_overtime', '+Overtime'],
//               ['base_only', 'Base Only'],
//             ].map(([val, label]) => (
//               <button key={val} onClick={() => setFilter(val)}
//                 className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
//                   filter === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
//                 }`}>
//                 {label}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Content */}
//       {loading ? (
//         <div className="flex flex-col items-center justify-center py-24 gap-3">
//           <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
//           <p className="text-sm text-gray-400">Loading jobs near you…</p>
//         </div>

//       ) : filteredJobs.length === 0 ? (
//         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
//           <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
//             <span className="text-3xl">🔍</span>
//           </div>
//           <h3 className="text-lg font-bold text-gray-900 mb-1">No jobs available</h3>
//           <p className="text-sm text-gray-400 max-w-xs mx-auto">
//             {filter === 'assigned' ? 'No jobs assigned to you by admin right now'
//               : filter !== 'all' ? `No ${filter === 'with_overtime' ? 'overtime' : 'base'} jobs in ${providerCity || 'your area'}`
//               : `No open jobs in ${providerCity || 'your area'} right now`}
//           </p>
//           <button onClick={() => { setFilter('all'); loadJobs() }}
//             className="mt-5 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition">
//             Check Again
//           </button>
//         </div>

//       ) : (
//         <div className="space-y-3">
//           {filteredJobs.map((job) => {
//             const dur = job.pricing?.duration_minutes || 60
//             const commPct = job.pricing?.commission_percent || 0
//             const baseEarnings = job.pricing?.provider_base_earnings || 0
//             const otRate = job.pricing?.overtime_rate || 0
//             const netOT = otRate * (1 - commPct / 100)

//             return (
//               <div key={job.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
//                 job.is_admin_assigned ? 'border-blue-200 hover:border-blue-300' : 'border-gray-100 hover:border-green-200'
//               }`}>

//                 {job.is_admin_assigned && (
//                   <div className="bg-blue-50 border-b border-blue-100 px-5 py-2.5 flex items-center gap-2">
//                     <span className="text-base">🎯</span>
//                     <p className="text-xs font-semibold text-blue-700">Assigned to you by admin — awaiting your acceptance</p>
//                   </div>
//                 )}

//                 <div className="flex items-start justify-between p-5 pb-3">
//                   <div className="flex items-center gap-3 min-w-0">
//                     <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
//                       job.is_admin_assigned ? 'bg-blue-50 border border-blue-100' : 'bg-green-50 border border-green-100'
//                     }`}>
//                       {job.category_icon || '🔧'}
//                     </div>
//                     <div className="min-w-0">
//                       <h3 className="font-bold text-gray-900 text-sm truncate">{job.service_name}</h3>
//                       <p className="text-xs text-gray-400">{job.category_name}</p>
//                     </div>
//                   </div>
//                   <div className="text-right flex-shrink-0 ml-3">
//                     <p className="text-[10px] text-gray-400 uppercase tracking-wide">You earn</p>
//                     <p className={`text-2xl font-extrabold leading-tight ${job.is_admin_assigned ? 'text-blue-600' : 'text-green-600'}`}>
//                       {job.display_amount}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex flex-wrap gap-2 px-5 pb-3">
//                   <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg">
//                     <Clock className="h-3 w-3" /> {formatDuration(dur)}
//                   </span>
//                   {job.pricing?.has_overtime && (
//                     <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-lg font-semibold">
//                       ⏰ +${otRate.toFixed(2)}/hr OT
//                     </span>
//                   )}
//                 </div>

//                 {job.pricing?.has_overtime && (
//                   <div className="mx-5 mb-3 bg-purple-50 border border-purple-100 rounded-xl p-3">
//                     <p className="text-xs font-semibold text-purple-700 mb-1.5">Overtime earnings potential</p>
//                     <div className="flex gap-2">
//                       <span className="bg-white border border-purple-200 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
//                         1hr OT: ${(baseEarnings + netOT).toFixed(2)}
//                       </span>
//                       <span className="bg-white border border-purple-200 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
//                         2hr OT: ${(baseEarnings + netOT * 2).toFixed(2)}
//                       </span>
//                     </div>
//                     <p className="text-xs text-gray-400 mt-1.5">Net rate after {commPct}% commission: ${netOT.toFixed(2)}/hr</p>
//                   </div>
//                 )}

//                 <div className="flex flex-wrap gap-2 px-5 pb-3">
//                   <MetaBadge icon="📅" text={formatDate(job.job_date)} />
//                   <MetaBadge icon="🕐" text={fmtSlots(job.job_time_slot)} />
//                   <MetaBadge icon="📍" text={job.address_line1?.split(',')[0] || '—'} />
//                 </div>

//                 {(job.parking_access || job.elevator_access || job.has_pets) && (
//                   <div className="flex gap-1.5 px-5 pb-3 flex-wrap">
//                     {job.parking_access && <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 border border-green-200 text-green-700">🅿️ Parking</span>}
//                     {job.elevator_access && <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 border border-green-200 text-green-700">🛗 Elevator</span>}
//                     {job.has_pets && <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-50 border border-amber-200 text-amber-700">🐕 Pets</span>}
//                   </div>
//                 )}

//                 <div className="px-5 pb-3">
//                   <p className="text-xs text-gray-400">
//                     Base ${job.pricing?.base_price?.toFixed(2)} · {commPct}% commission · You get ${baseEarnings.toFixed(2)}
//                   </p>
//                 </div>

//                 <div className="p-5 pt-0 flex gap-2">
//                   <Link href={`/provider/available-jobs/${job.id}`}
//                     className="flex-1 py-2.5 text-center border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
//                     View Details
//                   </Link>
//                   {/* ✅ Accept button — Stripe check hoga, koi redirect nahi */}
//                   <button
//                     onClick={() => handleAcceptClick(job.id, job.display_amount)}
//                     className={`flex-1 py-2.5 text-center text-white rounded-xl text-sm font-bold transition ${
//                       !stripeConnected
//                         ? 'bg-gray-400 cursor-pointer'
//                         : job.is_admin_assigned
//                         ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
//                         : job.pricing?.has_overtime
//                         ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
//                         : 'bg-green-600 hover:bg-green-700'
//                     }`}>
//                     {!stripeConnected ? '🔒 Connect Stripe' : `Accept — ${job.display_amount}`}
//                     {stripeConnected && job.pricing?.has_overtime && !job.is_admin_assigned && <span className="ml-1 text-xs opacity-80">+OT</span>}
//                   </button>
//                 </div>
//               </div>
//             )
//           })}
//         </div>
//       )}
//     </div>
//   )
// }











'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, MapPin, Clock, AlertCircle } from 'lucide-react'

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
      {toast.type === 'success' ? '✓' : toast.type === 'info' ? 'ℹ' : '✕'}
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
          <p className="text-xs text-gray-400 mb-5">
            It only takes a few minutes to set up.
          </p>
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
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, amount, hasOvertime }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 text-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${hasOvertime ? 'bg-purple-50' : 'bg-green-50'}`}>
            <span className="text-2xl">💼</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500 mb-2">{message}</p>
          
          {/* Overtime Warning */}
          {hasOvertime && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-left">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">⚠️ Overtime Available</p>
                  <p className="text-xs text-amber-700 mt-0.5">Maximum 2 hours overtime allowed per job. You&apos;ll be paid at overtime rate for any extra time.</p>
                </div>
              </div>
            </div>
          )}
          
          {amount && (
            <div className={`inline-flex items-center gap-1.5 ${hasOvertime ? 'bg-purple-50 border border-purple-100' : 'bg-green-50 border border-green-100'} text-${hasOvertime ? 'purple' : 'green'}-700 text-lg font-bold px-4 py-2 rounded-xl mt-1`}>
              You earn: {amount}
            </div>
          )}
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl text-sm hover:bg-gray-50 transition">
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-2.5 text-white font-bold rounded-xl text-sm transition ${
              hasOvertime 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}>
            Accept Job
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
function fmtSlots(s) {
  if (!s) return ''
  return (Array.isArray(s) ? s : [s]).map(x => x.charAt(0).toUpperCase() + x.slice(1)).join(' · ')
}
function formatDuration(m) {
  if (!m) return '60 min'
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60), r = m % 60
  return r ? `${h}h ${r}m` : `${h} hour${h > 1 ? 's' : ''}`
}

function MetaBadge({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
      <span>{icon}</span> {text}
    </span>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProviderAvailableJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [providerCity, setProviderCity] = useState('')
  const [toast, setToast] = useState(null)
  const [filter, setFilter] = useState('all')
  const [stripeConnected, setStripeConnected] = useState(true)
  const [confirmModal, setConfirmModal] = useState({ open: false, jobId: null, amount: null, hasOvertime: false })
  const [stripeModal, setStripeModal] = useState(false)

  const showToast = (type, text) => setToast({ type, text })

  useEffect(() => { loadJobs() }, [])

  const loadJobs = async (silent = false) => {
    silent ? setRefreshing(true) : setLoading(true)
    try {
      // Check stripe status alongside jobs
      const [jobsRes, provRes] = await Promise.all([
        fetch('/api/provider/available-jobs'),
        fetch('/api/provider/me')
      ])
      const data = await jobsRes.json()
      const provData = await provRes.json()

      if (provData.success) {
        setStripeConnected(provData.provider?.stripe_onboarding_complete || false)
      }

      if (data.success) {
        setJobs(data.data || [])
        if (data.provider_city) setProviderCity(data.provider_city)
        if (!data.data?.length && !silent) showToast('info', 'No jobs available in your area')
      } else {
        showToast('error', data.message || 'Failed to load jobs')
      }
    } catch {
      showToast('error', 'Connection failed. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Called when Accept button clicked — check Stripe first
  const handleAcceptClick = (jobId, amount, hasOvertime) => {
    if (!stripeConnected) {
      setStripeModal(true)
      return
    }
    setConfirmModal({ open: true, jobId, amount, hasOvertime })
  }

  const acceptJob = async (jobId) => {
    try {
      const res = await fetch('/api/provider/available-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: jobId })
      })
      const data = await res.json()
      if (data.success) {
        showToast('success', data.message)
        setJobs(prev => prev.filter(j => j.id !== jobId))
        if (data.overtime_info) {
          setTimeout(() => showToast('info', data.overtime_info.message), 1000)
        }
      } else {
        showToast('error', data.message || 'Failed to accept job')
        loadJobs(true)
      }
    } catch {
      showToast('error', 'Failed to accept job')
    }
  }

  const filteredJobs = jobs.filter(j => {
    if (filter === 'with_overtime') return j.pricing?.has_overtime
    if (filter === 'base_only') return !j.pricing?.has_overtime
    if (filter === 'assigned') return j.is_admin_assigned
    return true
  })

  const stats = {
    total: jobs.length,
    assigned: jobs.filter(j => j.is_admin_assigned).length,
    overtime: jobs.filter(j => j.pricing?.has_overtime).length,
    base: jobs.filter(j => !j.pricing?.has_overtime).length,
  }

  return (
    <div className="w-full">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      <StripeRequiredModal
        isOpen={stripeModal}
        onClose={() => setStripeModal(false)}
      />

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, jobId: null, amount: null, hasOvertime: false })}
        onConfirm={() => acceptJob(confirmModal.jobId)}
        title="Accept this Job?"
        message="This job will be assigned to you immediately."
        amount={confirmModal.amount}
        hasOvertime={confirmModal.hasOvertime}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Available Jobs</h1>
          {providerCity && (
            <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-green-500" />
              Jobs near <strong className="text-gray-600 ml-1">{providerCity}</strong>
            </p>
          )}
        </div>
        <button onClick={() => loadJobs(true)} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stripe warning banner on available jobs page */}
      {!stripeConnected && !loading && (
        <div className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-amber-800 flex-1">
            <strong>Stripe not connected.</strong> You can view jobs but cannot accept them until you connect Stripe.
          </p>
          <Link href="/provider/onboarding?step=3"
            className="text-xs font-bold text-amber-700 underline whitespace-nowrap">
            Connect →
          </Link>
        </div>
      )}

      {/* Stats + Filters */}
      {!loading && jobs.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex gap-3 text-xs flex-wrap">
            <span className="text-gray-500">Total: <strong className="text-gray-900">{stats.total}</strong></span>
            {stats.assigned > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-blue-600">🎯 Assigned: <strong>{stats.assigned}</strong></span>
              </>
            )}
            <span className="text-gray-300">|</span>
            <span className="text-purple-600">+OT: <strong>{stats.overtime}</strong></span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">Base: <strong>{stats.base}</strong></span>
          </div>
          <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl flex-wrap">
            {[
              ['all', 'All'],
              ...(stats.assigned > 0 ? [['assigned', '🎯 Assigned']] : []),
              ['with_overtime', '+Overtime'],
              ['base_only', 'Base Only'],
            ].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading jobs near you…</p>
        </div>

      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔍</span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No jobs available</h3>
          <p className="text-sm text-gray-400 max-w-xs mx-auto">
            {filter === 'assigned' ? 'No jobs assigned to you by admin right now'
              : filter !== 'all' ? `No ${filter === 'with_overtime' ? 'overtime' : 'base'} jobs in ${providerCity || 'your area'}`
              : `No open jobs in ${providerCity || 'your area'} right now`}
          </p>
          <button onClick={() => { setFilter('all'); loadJobs() }}
            className="mt-5 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition">
            Check Again
          </button>
        </div>

      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const dur = job.pricing?.duration_minutes || 60
            const commPct = job.pricing?.commission_percent || 0
            const baseEarnings = job.pricing?.provider_base_earnings || 0
            const otRate = job.pricing?.overtime_rate || 0
            const netOT = otRate * (1 - commPct / 100)
            const hasOvertime = job.pricing?.has_overtime

            return (
              <div key={job.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                job.is_admin_assigned ? 'border-blue-200 hover:border-blue-300' : 
                hasOvertime ? 'border-purple-200 hover:border-purple-300 ring-1 ring-purple-100' : 
                'border-gray-100 hover:border-green-200'
              }`}>

                {job.is_admin_assigned && (
                  <div className="bg-blue-50 border-b border-blue-100 px-5 py-2.5 flex items-center gap-2">
                    <span className="text-base">🎯</span>
                    <p className="text-xs font-semibold text-blue-700">Assigned to you by admin — awaiting your acceptance</p>
                  </div>
                )}

                {/* Overtime Highlight Banner */}
                {hasOvertime && !job.is_admin_assigned && (
                  <div className="bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-white" />
                      <p className="text-xs font-semibold text-white">⏰ Overtime eligible — max 2 hours at ${otRate.toFixed(2)}/hr</p>
                    </div>
                    <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full">+OT</span>
                  </div>
                )}

                <div className="flex items-start justify-between p-5 pb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                      job.is_admin_assigned ? 'bg-blue-50 border border-blue-100' : 
                      hasOvertime ? 'bg-purple-50 border border-purple-100' : 
                      'bg-green-50 border border-green-100'
                    }`}>
                      {job.category_icon || '🔧'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{job.service_name}</h3>
                      <p className="text-xs text-gray-400">{job.category_name}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">You earn</p>
                    <p className={`text-2xl font-extrabold leading-tight ${
                      job.is_admin_assigned ? 'text-blue-600' : 
                      hasOvertime ? 'text-purple-600' : 
                      'text-green-600'
                    }`}>
                      {job.display_amount}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 px-5 pb-3">
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg">
                    <Clock className="h-3 w-3" /> {formatDuration(dur)}
                  </span>
                  {hasOvertime && (
                    <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-1 rounded-lg font-semibold">
                      ⏰ +${otRate.toFixed(2)}/hr OT
                    </span>
                  )}
                </div>

                {hasOvertime && (
                  <div className="mx-5 mb-3 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      <p className="text-xs font-semibold text-amber-700">Max 2 hours overtime allowed</p>
                    </div>
                    <p className="text-xs font-semibold text-purple-700 mb-1.5">Overtime earnings potential:</p>
                    <div className="flex gap-2">
                      <span className="bg-white border border-purple-200 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                        1hr OT: ${(baseEarnings + netOT).toFixed(2)}
                      </span>
                      <span className="bg-white border border-purple-200 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                        2hr OT: ${(baseEarnings + netOT * 2).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Net rate after {commPct}% commission: ${netOT.toFixed(2)}/hr</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 px-5 pb-3">
                  <MetaBadge icon="📅" text={formatDate(job.job_date)} />
                  <MetaBadge icon="🕐" text={fmtSlots(job.job_time_slot)} />
                  <MetaBadge icon="📍" text={job.address_line1?.split(',')[0] || '—'} />
                </div>

                {(job.parking_access || job.elevator_access || job.has_pets) && (
                  <div className="flex gap-1.5 px-5 pb-3 flex-wrap">
                    {job.parking_access && <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 border border-green-200 text-green-700">🅿️ Parking</span>}
                    {job.elevator_access && <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 border border-green-200 text-green-700">🛗 Elevator</span>}
                    {job.has_pets && <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-50 border border-amber-200 text-amber-700">🐕 Pets</span>}
                  </div>
                )}

                <div className="px-5 pb-3">
                  <p className="text-xs text-gray-400">
                    Base ${job.pricing?.base_price?.toFixed(2)} · {commPct}% commission · You get ${baseEarnings.toFixed(2)}
                  </p>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <Link href={`/provider/available-jobs/${job.id}`}
                    className="flex-1 py-2.5 text-center border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
                    View Details
                  </Link>
                  <button
                    onClick={() => handleAcceptClick(job.id, job.display_amount, hasOvertime)}
                    className={`flex-1 py-2.5 text-center text-white rounded-xl text-sm font-bold transition ${
                      !stripeConnected
                        ? 'bg-gray-400 cursor-pointer'
                        : job.is_admin_assigned
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                        : hasOvertime
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}>
                    {!stripeConnected ? '🔒 Connect Stripe' : `Accept — ${job.display_amount}`}
                    {stripeConnected && hasOvertime && !job.is_admin_assigned && (
                      <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded-full">max 2hr</span>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}