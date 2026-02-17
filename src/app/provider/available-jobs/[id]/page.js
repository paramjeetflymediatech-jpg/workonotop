// app/provider/available-jobs/[id]/page.jsx - UPDATED WITH DURATION

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import React from 'react'

export default function ProviderJobDetail({ params }) {
  const router = useRouter()
  const { id } = React.use(params)

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [toast, setToast] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkAuth()
    loadJob()
  }, [id])

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('providerToken')
      if (!token) {
        router.push('/provider/login')
      }
    }
  }

  const token = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('providerToken')
    }
    return null
  }

  const loadJob = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/provider/available-jobs/${id}`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const data = await res.json()
      
      if (data.success) {
        setJob({ 
          ...data.data, 
          is_available: data.is_available, 
          is_my_job: data.is_my_job 
        })
      } else {
        showToast('error', data.message || 'Job not found')
      }
    } catch (error) {
      showToast('error', 'Failed to load job')
    } finally {
      setLoading(false)
    }
  }

  const acceptJob = async () => {
    if (!confirm(`Accept this job and earn $${parseFloat(job.provider_amount).toFixed(2)}?`)) return
    
    setAccepting(true)
    try {
      const res = await fetch('/api/provider/available-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({ booking_id: id })
      })
      
      const data = await res.json()
      
      if (data.success) {
        showToast('success', '🎉 Job accepted!')
        if (data.overtime_info) {
          setTimeout(() => {
            showToast('info', data.overtime_info.message)
          }, 500)
        }
        setTimeout(() => router.push('/provider/available-jobs'), 2000)
      } else {
        showToast('error', data.message || 'Could not accept job')
        loadJob()
      }
    } catch (error) {
      showToast('error', 'Request failed')
    } finally {
      setAccepting(false)
    }
  }

  const showToast = (type, text) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    if (!mounted) {
      const date = new Date(dateString)
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const fmtSlots = (slots) => {
    if (!slots) return []
    return (Array.isArray(slots) ? slots : [slots]).map(s => 
      s.charAt(0).toUpperCase() + s.slice(1)
    )
  }

  // Format duration nicely
  const formatDuration = (minutes) => {
    if (!minutes) return '60 minutes'
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ${mins} min` : `${hours} hour${hours > 1 ? 's' : ''}`
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading job details…</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-sm">
          <span className="text-5xl mb-4 block">😕</span>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Job Not Found</h3>
          <p className="text-gray-400 text-sm mb-5">This job may have already been taken or removed.</p>
          <Link
            href="/provider/available-jobs"
            className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition"
          >
            ← Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  const amount = parseFloat(job.provider_amount || 0)
  const slots = fmtSlots(job.job_time_slot)
  const customerName = `${job.customer_first_name || ''} ${job.customer_last_name || ''}`.trim()
  const hasOvertime = parseFloat(job.additional_price || 0) > 0
  const overtimeRate = parseFloat(job.additional_price || 0)
  const duration = job.service_duration || 60
  const basePrice = parseFloat(job.service_price || 0)
  const commissionPercent = parseFloat(job.commission_percent || 0)
  const commissionAmount = basePrice * (commissionPercent / 100)
  const baseEarnings = basePrice - commissionAmount

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 max-w-xs
          ${toast.type === 'success' ? 'bg-green-500' : 
            toast.type === 'info' ? 'bg-blue-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? '✓' : toast.type === 'info' ? 'ℹ️' : '✕'} {toast.text}
        </div>
      )}

      {/* Hero Section */}
      <div className={`text-white ${
        hasOvertime 
          ? 'bg-gradient-to-br from-purple-600 via-purple-700 to-blue-700' 
          : 'bg-gradient-to-br from-green-500 via-green-600 to-teal-600'
      }`}>
        {/* Back navigation */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 sm:pt-5">
          <Link
            href="/provider/available-jobs"
            className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Available Jobs
          </Link>
        </div>

        {/* Hero content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">
                {job.category_name}
              </p>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight">{job.service_name}</h1>
              <p className="text-white/70 text-xs mt-1.5">#{job.booking_number}</p>
            </div>
            <div className="text-right flex-shrink-0 bg-white/15 rounded-2xl px-4 py-3 backdrop-blur-sm">
              <p className="text-white/70 text-[10px] uppercase tracking-wide mb-0.5">You earn</p>
              <p className="text-3xl sm:text-4xl font-extrabold">${amount.toFixed(2)}</p>
            </div>
          </div>

          {/* Duration Badge */}
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-xs">
              <span>⏱️</span> Standard Duration: {formatDuration(duration)}
            </span>
          </div>

          {/* Overtime Badge */}
          {hasOvertime && (
            <div className="mt-4 bg-white/20 rounded-xl p-3 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⏰</span>
                <div>
                  <p className="font-semibold">Overtime Available: +${overtimeRate.toFixed(2)}/hour</p>
                  <p className="text-xs text-white/80 mt-0.5">
                    Standard job takes {formatDuration(duration)}. Earn extra for any additional time.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Banners */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-3">
        {!job.is_available && !job.is_my_job && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-4 flex items-center gap-2.5">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <p className="text-sm text-red-700 font-medium">
              This job was already accepted by another provider.
            </p>
          </div>
        )}
        {job.is_my_job && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-3.5 mb-4 flex items-center justify-between gap-2">
            <p className="text-sm text-green-700 font-medium flex items-center gap-2">
              <span>✓</span> You accepted this job!
            </p>
            <Link href="/provider/jobs" className="text-sm text-green-700 font-bold underline whitespace-nowrap">
              My Jobs →
            </Link>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-3 mt-1">
        {/* Customer Contact Card */}
        {(job.customer_email || job.customer_phone || customerName) && (
          <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-4">
              <SectionTitle icon="👤" title="Customer Contact" />
              <div className="mt-3 space-y-3">
                {customerName && (
                  <DetailRow label="Name" value={customerName} />
                )}
                {job.customer_email && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400 w-16">Email:</span>
                    <a
                      href={`mailto:${job.customer_email}?subject=Regarding your booking: ${job.booking_number}`}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 group"
                    >
                      <span>{job.customer_email}</span>
                      <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  </div>
                )}
                {job.customer_phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400 w-16">Phone:</span>
                    <a
                      href={`tel:${job.customer_phone}`}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 group"
                    >
                      <span>{job.customer_phone}</span>
                      <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>

              {/* Quick Action Buttons */}
              {(job.customer_email || job.customer_phone) && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                  {job.customer_email && (
                    <QuickActionButton
                      href={`mailto:${job.customer_email}?subject=Regarding your booking: ${job.booking_number}`}
                      icon="📧"
                      label="Email"
                      color="blue"
                    />
                  )}
                  {job.customer_phone && (
                    <>
                      <QuickActionButton
                        href={`tel:${job.customer_phone}`}
                        icon="📞"
                        label="Call"
                        color="green"
                      />
                      <QuickActionButton
                        href={`https://wa.me/${job.customer_phone.replace(/\D/g, '')}`}
                        icon="💬"
                        label="WhatsApp"
                        color="emerald"
                        target="_blank"
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pricing Breakdown Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4">
            <SectionTitle icon="💰" title="Payment Breakdown" />
            
            {/* Duration Info */}
            <div className="mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-lg">⏱️</span>
                <div>
                  <p className="text-xs text-gray-400">Standard Duration</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDuration(duration)}</p>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Base price:</span>
                <span className="font-medium text-gray-900">${basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Commission ({commissionPercent}%):</span>
                <span className="font-medium text-orange-600">
                  -${commissionAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-gray-100">
                <span className="text-gray-700">Base earnings:</span>
                <span className="text-green-600">${baseEarnings.toFixed(2)}</span>
              </div>
              
              {hasOvertime && (
                <>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Overtime rate:</span>
                    <span className="font-medium text-purple-600">+${overtimeRate.toFixed(2)}/hour</span>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 mt-2">
                    <p className="text-xs text-purple-700 font-medium mb-1">What you could earn with overtime:</p>
                    <div className="flex justify-between text-sm">
                      <span>1 hour overtime:</span>
                      <span className="font-bold text-purple-700">${(amount + overtimeRate).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>2 hours overtime:</span>
                      <span className="font-bold text-purple-700">${(amount + (overtimeRate * 2)).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Based on standard duration of {formatDuration(duration)}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Schedule Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4">
            <SectionTitle icon="📅" title="Schedule" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <DetailRow label="Date" value={formatDate(job.job_date)} />
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Time Slots</p>
                <div className="flex flex-wrap gap-1.5">
                  {slots.map((s, i) => (
                    <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-xs font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {job.timing_constraints && (
              <div className="mt-3 pt-3 border-t border-gray-50">
                <DetailRow label="Timing Notes" value={job.timing_constraints} />
              </div>
            )}
          </div>
        </div>

        {/* Location Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-4 sm:px-5 py-4">
            <SectionTitle icon="📍" title="Location" />
            <div className="mt-3 bg-gray-50 rounded-xl p-3.5">
              <p className="text-sm font-semibold text-gray-900">{job.address_line1}</p>
              {job.address_line2 && <p className="text-sm text-gray-500 mt-0.5">{job.address_line2}</p>}
              {(job.city || job.postal_code) && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {[job.city, job.postal_code].filter(Boolean).join(', ')}
                </p>
              )}
            </div>
            
            {/* Access Icons */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <AccessCard label="Parking" icon="🅿️" active={job.parking_access} />
              <AccessCard label="Elevator" icon="🛗" active={job.elevator_access} />
              <AccessCard label="Pets" icon="🐕" active={job.has_pets} yellow />
            </div>
          </div>
        </div>

        {/* Description */}
        {job.job_description && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-4 sm:px-5 py-4">
              <SectionTitle icon="📝" title="Job Description" />
              <p className="text-sm text-gray-700 leading-relaxed mt-3">{job.job_description}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        {job.instructions && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-4 sm:px-5 py-4">
              <SectionTitle icon="💡" title="Special Instructions" />
              <p className="text-sm text-gray-700 leading-relaxed mt-3">{job.instructions}</p>
            </div>
          </div>
        )}

        {/* Photos */}
        {job.photos?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="px-4 sm:px-5 py-4">
              <SectionTitle icon="📷" title={`Photos (${job.photos.length})`} />
              <div className="grid grid-cols-3 gap-2 mt-3">
                {job.photos.map((photo, i) => (
                  <div
                    key={i}
                    onClick={() => window.open(photo, '_blank')}
                    className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition"
                  >
                    <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Accept Button */}
      {job.is_available && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 z-30 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={acceptJob}
              disabled={accepting}
              className={`w-full py-4 text-white rounded-2xl font-bold text-base hover:opacity-90 active:scale-[0.99] transition-all shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 ${
                hasOvertime
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                  : 'bg-green-600'
              }`}
            >
              {accepting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Accepting…
                </>
              ) : (
                <>
                  ✓ Accept this Job — Earn ${amount.toFixed(2)}
                  {hasOvertime && (
                    <>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">+OT</span>
                      <span className="text-xs opacity-90">
                        (Std: {formatDuration(duration)})
                      </span>
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper Components
function SectionTitle({ icon, title }) {
  return (
    <h2 className="font-semibold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
      <span>{icon}</span> {title}
    </h2>
  )
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  )
}

function AccessCard({ icon, label, active, yellow }) {
  const on = yellow
    ? 'bg-amber-50 border-amber-200 text-amber-700'
    : 'bg-green-50 border-green-200 text-green-700'
  const off = 'bg-gray-50 border-gray-200 text-gray-300'
  
  return (
    <div className={`rounded-xl border p-2.5 text-center text-xs font-semibold ${active ? on : off}`}>
      <span className="block text-base mb-0.5">{icon}</span>
      {label} {active ? '✓' : '—'}
    </div>
  )
}

function QuickActionButton({ href, icon, label, color, target = '_self' }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    emerald: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
  }
  
  return (
    <a
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : ''}
      className={`inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition ${colorClasses[color]}`}
    >
      <span>{icon}</span> {label}
    </a>
  )
}