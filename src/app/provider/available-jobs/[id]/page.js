







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
            className={`flex-1 py-3 text-white font-bold rounded-xl text-sm transition disabled:opacity-60 flex items-center justify-center gap-2 ${hasOvertime ? 'bg-gradient-to-r from-purple-600 to-blue-600' : 'bg-green-600 hover:bg-green-700'
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
  const [selectedPhoto, setSelectedPhoto] = useState(null)
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
        console.log('✅ [DEBUG] Fetched job data:', data.data)
        setJob({
          ...data.data,
          is_available: data.is_available,
          is_my_job: data.is_my_job,
          availability_reason: data.availability_reason
        })
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
        setTimeout(() => router.push('/provider/jobs'), 2000)
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

  const amount = parseFloat(job.provider_amount || 0)
  const basePrice = parseFloat(job.service_price || job.base_price || 0)
  const commPct = parseFloat(job.commission_percent || 0)
  const otRate = parseFloat(job.additional_price || job.overtime_rate || 0)
  const dur = job.service_duration || 60
  const commAmt = basePrice * (commPct / 100)
  const baseEarnings = basePrice - commAmt
  const netOT = otRate * (1 - commPct / 100)
  const hasOvertime = otRate > 0
  const slots = fmtSlots(job.job_time_slot)

  // ✅ FIX: Cast to boolean — prevents MySQL tinyint 0 rendering as "0" text in JSX
  const hasParking = !!job.parking_access
  const hasElevator = !!job.elevator_access
  const hasPets = !!job.has_pets

  return (
    <div className="w-full max-w-4xl mx-auto pb-32 px-4 md:px-0">
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
      <div className="mb-6">
        <Link href="/provider/available-jobs"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition font-medium">
          <ArrowLeft className="h-4 w-4" /> Available Jobs
        </Link>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-r from-green-700 to-teal-600 rounded-3xl text-white p-6 md:p-8 mb-6 shadow-xl shadow-green-900/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="min-w-0">
            <p className="text-green-100 text-[10px] md:text-xs uppercase tracking-widest font-bold mb-2 opacity-80">
              {job.category_name}
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 leading-tight">
              {job.service_name}
            </h1>
            <p className="text-white/60 text-xs font-mono">ID: {job.booking_number}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md rounded-full px-3.5 py-1.5 text-xs font-medium">
                <Clock className="h-3.5 w-3.5 text-green-200" /> {formatDuration(dur)}
              </span>
              {hasOvertime && (
                <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md rounded-full px-3.5 py-1.5 text-xs font-bold text-green-100">
                  ⏰ +${otRate.toFixed(2)}/hr OT
                </span>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 bg-white/15 rounded-3xl p-5 backdrop-blur-md border border-white/10 text-center md:text-right min-w-[140px]">
            <p className="text-green-100 text-[10px] uppercase tracking-widest font-bold mb-1 opacity-70">Guaranteed</p>
            <p className="text-4xl font-black leading-none">${amount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Status banners */}
      {!job.is_available && !job.is_my_job && (
        <div className={`border rounded-2xl p-4 mb-6 flex items-center gap-3 ${job.availability_reason === 'awaiting_approval'
            ? 'bg-amber-50 border-amber-200'
            : 'bg-red-50 border-red-200'
          }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${job.availability_reason === 'awaiting_approval' ? 'bg-amber-100' : 'bg-red-100'
            }`}>
            <span className="text-xl">{job.availability_reason === 'awaiting_approval' ? '⏳' : '⚠️'}</span>
          </div>
          <div>
            <p className={`text-sm font-bold ${job.availability_reason === 'awaiting_approval' ? 'text-amber-800' : 'text-red-700'
              }`}>
              {job.availability_reason === 'already_accepted' && 'Already accepted by another provider.'}
              {job.availability_reason === 'awaiting_approval' && 'Awaiting Admin Approval'}
              {job.availability_reason === 'not_available' && 'This job is no longer available.'}
              {!job.availability_reason && 'Job is currently unavailable.'}
            </p>
            {/* {job.availability_reason === 'awaiting_approval' && (
              <p className="text-xs text-amber-700/70 mt-0.5 font-medium">
                The administrator needs to set the commission for this job before it can be accepted.
              </p>
            )} */}
          </div>
        </div>
      )}

      {job.is_my_job && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
          <p className="text-sm text-green-700 font-bold flex items-center gap-2.5">
            <CheckCircle className="h-5 w-5" /> You accepted this job!
          </p>
          <Link href="/provider/jobs" className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition flex-shrink-0">
            View My Jobs
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side Info */}
        <div className="space-y-6">
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
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1 font-medium italic">Timing Notes</p>
                <p className="text-sm text-gray-700 break-words whitespace-pre-wrap">{job.timing_constraints}</p>
              </div>
            )}
          </InfoCard>

          <InfoCard title="Location" icon="📍">
            <div className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
              <p className="text-sm font-bold text-gray-900 break-words">{job.address_line1}</p>
              {job.address_line2 && <p className="text-sm text-gray-500 mt-0.5 break-words">{job.address_line2}</p>}
              {(job.city || job.postal_code) && (
                <p className="text-xs text-gray-400 mt-1 font-medium">{[job.city, job.postal_code].filter(Boolean).join(', ')}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                ['🅿️', 'Parking', hasParking, 'green'],
                ['🛗', 'Elevator', hasElevator, 'green'],
                ['🐕', 'Pets', hasPets, 'amber'],
              ].map(([icon, label, val, color]) => (
                <div key={label} className={`rounded-xl border p-2.5 text-center transition-colors ${val
                    ? color === 'green'
                      ? 'bg-green-50 border-green-200 text-green-700'
                      : 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-gray-50 border-gray-100 text-gray-300'
                  }`}>
                  <span className="block text-lg mb-0.5">{icon}</span>
                  <p className="text-[10px] font-bold uppercase tracking-tight">{label}</p>
                  <p className="text-[10px] mt-0.5">{val ? '✓' : '—'}</p>
                </div>
              ))}
            </div>
          </InfoCard>

          {job.photos?.length > 0 && (
            <InfoCard title={`Customer Photos (${job.photos.length})`} icon="📷">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {job.photos.map((photo, i) => (
                  <div key={i} onClick={() => setSelectedPhoto(photo)}
                    className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition border border-gray-100 shadow-sm group relative">
                    <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] bg-white/90 px-2 py-1 rounded-md font-bold shadow-sm">View</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-3 italic font-medium">* Click to enlarge photo</p>
            </InfoCard>
          )}
        </div>

        {/* Photo Preview Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)} />
            <button 
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-6 right-6 z-[110] p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
              <X className="h-6 w-6" />
            </button>
            <div className="relative z-[110] max-w-5xl w-full h-full flex items-center justify-center">
              <img 
                src={selectedPhoto} 
                alt="Enlarged view" 
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300" 
              />
            </div>
          </div>
        )}

        {/* Right Side Info */}
        <div className="space-y-6">
          <InfoCard title="Payment Breakdown" icon="💰">
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-50">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Standard Duration</p>
                  <p className="text-sm font-bold text-gray-900">{formatDuration(dur)}</p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Service Base Price</span>
                <span className="font-bold text-gray-900">${basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 font-medium">Platform Fee ({commPct}%)</span>
                <span className="font-bold text-orange-600">−${commAmt.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-3 border-t border-gray-100">
                <span className="text-gray-900 uppercase tracking-tighter">Your Base Earnings</span>
                <span className="text-green-600 text-lg">${baseEarnings.toFixed(2)}</span>
              </div>

              {hasOvertime && (
                <div className="bg-purple-50 rounded-2xl p-4 mt-2 border border-purple-100">
                  <p className="text-md font-bold mb-3">Potential Earnings with Overtime</p>
                  {[[1, baseEarnings + netOT], [2, baseEarnings + netOT * 2]].map(([hrs, total]) => (
                    <div key={hrs} className="flex justify-between items-center mb-2 last:mb-0">
                      <div>
                        <p className="text-sm font-bold ">Base + {hrs}hr OT</p>
                        <p className="text-[10px] ">${baseEarnings.toFixed(2)} + ${(netOT * hrs).toFixed(2)}</p>
                      </div>
                      <span className="text-sm font-black">${total.toFixed(2)}</span>
                    </div>
                  ))}
                  <p className="text-[10px] mt-3 italic font-medium">Net OT rate: ${netOT.toFixed(2)}/hr after commission</p>
                </div>
              )}
            </div>
          </InfoCard>

          {job.job_description && (
            <InfoCard title="Job Description" icon="📝">
              <p className="text-sm text-gray-700 leading-relaxed break-words whitespace-pre-wrap font-medium">{job.job_description}</p>
            </InfoCard>
          )}

          {job.instructions && (
            <InfoCard title="Special Instructions" icon="💡">
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <p className="text-sm text-amber-900 leading-relaxed break-words whitespace-pre-wrap font-medium">{job.instructions}</p>
              </div>
            </InfoCard>
          )}
        </div>
      </div>

      {/* Debug Info */}
      <div className="mt-12 p-4 bg-gray-50 border border-gray-100 rounded-2xl opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-[10px] text-gray-400 font-mono">DEBUG: job.photos.length = {job.photos?.length || 0} | booking_id={id}</p>
      </div>

      {/* Sticky Accept Button */}
      {job.is_available && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-40 p-4 md:p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => { if (!stripeConnected) { setStripeModal(true) } else { setShowConfirm(true) } }}
              className={`w-full py-4.5 text-white rounded-2xl font-black text-lg transition-all shadow-xl hover:scale-[1.01] active:scale-95 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 ${hasOvertime
                  ? 'bg-gradient-to-r from-green-700 to-teal-600 shadow-green-900/20'
                  : 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
                }`}>
              <span>Accept this Job — Earn ${amount.toFixed(2)}</span>
              {hasOvertime && (
                <span className="text-[10px] md:text-xs bg-white/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm">
                  Potential up to ${(baseEarnings + netOT * 2).toFixed(2)}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}