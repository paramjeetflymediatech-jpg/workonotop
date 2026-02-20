// app/provider/jobs/[id]/page.jsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import TimeTracker from '../TimeTracker'
import JobPhotoUpload from '../JobPhotoUpload'

export default function ProviderJobDetail({ params }) {
  const router = useRouter()
  const { id } = React.use(params)

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [photos, setPhotos] = useState({ before: [], after: [] })
  const [toast, setToast] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [showContact, setShowContact] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkAuth()
    loadJob()
    loadPhotos()
  }, [id])

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('providerToken')
      if (!token) router.push('/provider/login')
    }
  }

  const token = () => {
    if (typeof window !== 'undefined') return localStorage.getItem('providerToken')
    return null
  }

  const loadJob = async () => {
    try {
      const res = await fetch(`/api/provider/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const data = await res.json()
      if (data.success) setJob(data.data)
    } catch {
      showToast('error', 'Failed to load job')
    } finally {
      setLoading(false)
    }
  }

  const loadPhotos = useCallback(async () => {
    try {
      const res = await fetch(`/api/provider/jobs/photos?booking_id=${id}`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const data = await res.json()
      if (data.success) setPhotos(data.data)
    } catch (error) {
      console.error('Failed to load photos:', error)
    }
  }, [id])

  const showToast = (type, text) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }

  // Called when timer STARTS — reload job so in_progress status shows after photo section
  const handleJobStart = async () => {
    await loadJob()
  }

  // Called when job COMPLETES
  const handleJobComplete = async (jobData) => {
    showToast('success', `Job completed! Duration: ${formatDuration(jobData.total_minutes)}`)
    await loadJob()
    await loadPhotos()
  }

  const handlePhotoUpload = async (type) => {
    showToast('success', `${type === 'before' ? 'Before' : 'After'} photos uploaded!`)
    await loadPhotos()
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const formatDateTime = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return 'Not started'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-green-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-gray-400 font-medium">Loading job…</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <p className="text-gray-500 text-lg">Job not found</p>
          <Link href="/provider/jobs" className="text-green-600 underline text-sm">← Back to Jobs</Link>
        </div>
      </div>
    )
  }

  const hasBeforePhotos = photos.before.length > 0
  const hasAfterPhotos = photos.after.length > 0
  const duration = job.duration_minutes || 60
  const overtimeRate = parseFloat(job.additional_price || 0)
  const isCompleted = job.status === 'completed'
  const isInProgress = job.status === 'in_progress'
  const isConfirmed = job.status === 'confirmed'

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium
          ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.text}
        </div>
      )}

      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/provider/jobs" className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Jobs
          </Link>
          <StatusBadge status={job.status} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Job Title */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-400 font-medium mb-1">#{job.booking_number}</p>
          <h1 className="text-xl font-bold text-gray-900">{job.service_name}</h1>
          <p className="text-sm text-gray-500 mt-1">{formatDate(job.job_date)}</p>
        </div>

        {/* Step Progress Bar */}
        {!isCompleted && (
          <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: 'Before Photos', done: hasBeforePhotos, active: !hasBeforePhotos },
                { num: 2, label: isInProgress ? 'In Progress' : 'Start Job', done: isInProgress || isCompleted, active: hasBeforePhotos && isConfirmed },
                { num: 3, label: 'After Photos', done: hasAfterPhotos, active: isInProgress && !hasAfterPhotos },
                { num: 4, label: 'Complete', done: isCompleted, active: isInProgress && hasAfterPhotos },
              ].map((step, i, arr) => (
                <React.Fragment key={step.num}>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step.done ? 'bg-green-500 text-white' :
                      step.active ? 'bg-green-600 text-white ring-4 ring-green-100' :
                      'bg-gray-100 text-gray-400'
                    }`}>
                      {step.done ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                        </svg>
                      ) : step.num}
                    </div>
                    <span className={`text-[9px] font-semibold text-center leading-tight max-w-[52px] ${
                      step.active ? 'text-green-700' : step.done ? 'text-green-500' : 'text-gray-400'
                    }`}>{step.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-1 mb-4 rounded ${step.done ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* STEP 1: Before Photos */}
        {!isCompleted && !hasBeforePhotos && (
          <div className="bg-white rounded-2xl border border-green-300 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-lg flex-shrink-0">📷</div>
              <div>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Step 1 — Required</p>
                <h2 className="font-bold text-gray-900">Upload Before Photos</h2>
                <p className="text-xs text-gray-400 mt-0.5">Take photos of the area before starting work</p>
              </div>
            </div>
            <JobPhotoUpload
              bookingId={job.id}
              photoType="before"
              onUploadComplete={() => handlePhotoUpload('before')}
            />
          </div>
        )}

        {/* STEP 2: Timer */}
        {!isCompleted && hasBeforePhotos && (
          <div className="bg-white rounded-2xl border border-green-300 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-lg flex-shrink-0">
                {isInProgress ? '⏱️' : '▶️'}
              </div>
              <div>
                <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">
                  {isInProgress ? 'Timer Running' : 'Step 2 — Ready to Start'}
                </p>
                <h2 className="font-bold text-gray-900">
                  {isInProgress ? 'Job In Progress' : 'Start the Job'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isInProgress
                    ? 'Upload after photos below, then hit Complete'
                    : 'Before photos done. Begin when ready.'}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Before Photos ({photos.before.length})</p>
              <PhotoGrid photos={photos.before} label="Before" />
            </div>

            <TimeTracker
              bookingId={job.id}
              onStart={handleJobStart}
              onComplete={handleJobComplete}
              standardDuration={duration}
              overtimeRate={overtimeRate}
              hasBeforePhotos={hasBeforePhotos}
              hasAfterPhotos={hasAfterPhotos}
            />
          </div>
        )}

        {/* STEP 3: After Photos — shown the moment job is in_progress */}
        {isInProgress && (
          <div className={`bg-white rounded-2xl border p-5 ${!hasAfterPhotos ? 'border-amber-300 shadow-sm' : 'border-green-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                !hasAfterPhotos ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'
              }`}>
                {hasAfterPhotos ? '✅' : '📸'}
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${!hasAfterPhotos ? 'text-amber-500' : 'text-green-600'}`}>
                  {!hasAfterPhotos ? 'Step 3 — Upload to Complete' : 'Step 3 — Done!'}
                </p>
                <h2 className="font-bold text-gray-900">After Work Photos</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {!hasAfterPhotos
                    ? 'Upload completed work photos — then scroll up and hit Complete ↑'
                    : `${photos.after.length} photo${photos.after.length > 1 ? 's' : ''} uploaded — scroll up and hit Complete ↑`}
                </p>
              </div>
            </div>

            {hasAfterPhotos ? (
              <PhotoGrid photos={photos.after} label="After" />
            ) : (
              <JobPhotoUpload
                bookingId={job.id}
                photoType="after"
                onUploadComplete={() => handlePhotoUpload('after')}
              />
            )}
          </div>
        )}

        {/* Completed Summary */}
        {isCompleted && (
          <div className="bg-white rounded-2xl border border-green-200 p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">✓</div>
              <div>
                <h2 className="font-bold text-green-700">Job Completed</h2>
                <p className="text-xs text-gray-400">Great work!</p>
              </div>
            </div>
            <div className="text-sm divide-y divide-gray-100">
              <div className="flex justify-between py-2.5">
                <span className="text-gray-500">Started</span>
                <span className="font-medium">{formatDateTime(job.start_time)}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-gray-500">Completed</span>
                <span className="font-medium">{formatDateTime(job.end_time)}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-gray-500">Total Time</span>
                <span className="font-bold text-green-700">{formatDuration(job.actual_duration_minutes)}</span>
              </div>
              {job.overtime_minutes > 0 && (
                <div className="flex justify-between py-2.5">
                  <span className="text-gray-500">Overtime</span>
                  <span className="font-semibold text-purple-600">{formatDuration(job.overtime_minutes)}</span>
                </div>
              )}
            </div>

            {(photos.before.length > 0 || photos.after.length > 0) && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Job Photos</h3>
                <div className="grid grid-cols-2 gap-3">
                  {photos.before.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Before ({photos.before.length})</p>
                      <PhotoGrid photos={photos.before} label="Before" cols={2} />
                    </div>
                  )}
                  {photos.after.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">After ({photos.after.length})</p>
                      <PhotoGrid photos={photos.after} label="After" cols={2} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Job Details (collapsible) */}
        <JobDetailsCard job={job} showContact={showContact} setShowContact={setShowContact} />
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const config = {
    confirmed:   { label: 'Confirmed',   classes: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
    in_progress: { label: 'In Progress', classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
    completed:   { label: 'Completed',   classes: 'bg-green-50 text-green-700 ring-1 ring-green-200' },
  }
  const cfg = config[status] || { label: status, classes: 'bg-gray-100 text-gray-600' }
  return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}>{cfg.label}</span>
}

function JobDetailsCard({ job, showContact, setShowContact }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className="font-semibold text-gray-800 text-sm">Job Details</span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          {['confirmed', 'in_progress', 'completed'].includes(job.status) && (
            <div>
              <button onClick={() => setShowContact(!showContact)} className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <span>👤</span> Customer Contact
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showContact ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              {showContact && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400 w-12">Name</span>
                    <span className="font-medium">{job.customer_first_name} {job.customer_last_name}</span>
                  </div>
                  {job.customer_phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400 w-12">Phone</span>
                      <a href={`tel:${job.customer_phone}`} className="text-blue-600">{job.customer_phone}</a>
                    </div>
                  )}
                  {job.customer_email && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-gray-400 w-12">Email</span>
                      <a href={`mailto:${job.customer_email}`} className="text-blue-600 truncate">{job.customer_email}</a>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3">
                    {job.customer_phone && (
                      <>
                        <a href={`tel:${job.customer_phone}`} className="flex-1 py-2 bg-green-600 text-white rounded-xl text-xs font-semibold text-center">Call</a>
                        <a href={`https://wa.me/${job.customer_phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold text-center">WhatsApp</a>
                      </>
                    )}
                    {job.customer_email && (
                      <a href={`mailto:${job.customer_email}`} className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold text-center">Email</a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Date</p>
              <p className="font-medium">{new Date(job.job_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            {job.job_time_slot?.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Time</p>
                <div className="flex flex-wrap gap-1">
                  {job.job_time_slot.map((slot, i) => (
                    <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs">{slot}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="text-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Location</p>
            <p className="font-medium">{job.address_line1}</p>
            {job.address_line2 && <p className="text-gray-500">{job.address_line2}</p>}
            {job.city && <p className="text-gray-500">{job.city} {job.postal_code}</p>}
          </div>
          {(job.parking_access || job.elevator_access || job.has_pets) && (
            <div className="flex flex-wrap gap-2">
              {job.parking_access && <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">Parking</span>}
              {job.elevator_access && <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">Elevator</span>}
              {job.has_pets && <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">Pets on site</span>}
            </div>
          )}
          {job.job_description && (
            <div className="text-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Description</p>
              <p className="text-gray-700 leading-relaxed">{job.job_description}</p>
            </div>
          )}
          {job.instructions && (
            <div className="text-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Special Instructions</p>
              <p className="text-gray-700 leading-relaxed">{job.instructions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PhotoGrid({ photos, label, cols = 3 }) {
  const gridClass = cols === 2 ? 'grid-cols-2' : 'grid-cols-3'
  return (
    <div className={`grid ${gridClass} gap-2`}>
      {photos.map((photo, index) => (
        <div key={index} onClick={() => window.open(photo.photo_url, '_blank')}
          className="aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 border border-gray-200 transition-opacity">
          <img src={photo.photo_url} alt={`${label} ${index + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  )
}