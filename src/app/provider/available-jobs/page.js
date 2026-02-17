// app/provider/available-jobs/page.jsx - UPDATED WITH DURATION

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ProviderAvailableJobs() {
  const router = useRouter()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [providerCity, setProviderCity] = useState('')
  const [toast, setToast] = useState(null)
  const [filter, setFilter] = useState('all')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkAuth()
    loadJobs()
  }, [])

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

  const loadJobs = async (silent = false) => {
    if (silent) setRefreshing(true)
    else setLoading(true)
    
    try {
      const res = await fetch('/api/provider/available-jobs', {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const data = await res.json()
      
      if (data.success) {
        setJobs(data.data || [])
        if (data.provider_city) setProviderCity(data.provider_city)
        if (data.data.length === 0 && !silent) {
          showToast('info', 'No jobs available in your area')
        }
      } else {
        showToast('error', data.message || 'Failed to load jobs')
      }
    } catch (error) {
      showToast('error', 'Connection failed. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const showToast = (type, text) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }

  const acceptJob = async (jobId) => {
    try {
      const res = await fetch('/api/provider/available-jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({ booking_id: jobId })
      })
      
      const data = await res.json()
      
      if (data.success) {
        showToast('success', data.message)
        setJobs(jobs.filter(j => j.id !== jobId))
        
        if (data.overtime_info) {
          setTimeout(() => {
            showToast('info', data.overtime_info.message)
          }, 1000)
        }
      } else {
        showToast('error', data.message || 'Failed to accept job')
        loadJobs(true)
      }
    } catch (error) {
      showToast('error', 'Failed to accept job')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    if (!mounted) {
      const date = new Date(dateString)
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    }
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const fmtSlots = (slots) => {
    if (!slots) return ''
    const slotArray = Array.isArray(slots) ? slots : [slots]
    return slotArray.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' · ')
  }

  // Format duration nicely
  const formatDuration = (minutes) => {
    if (!minutes) return '60 min'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`
  }

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true
    if (filter === 'with_overtime') return job.pricing?.has_overtime
    if (filter === 'base_only') return !job.pricing?.has_overtime
    return true
  })

  // Calculate stats
  const totalJobs = jobs.length
  const overtimeJobs = jobs.filter(j => j.pricing?.has_overtime).length
  const baseJobs = totalJobs - overtimeJobs

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium flex items-center gap-2 max-w-xs
          ${toast.type === 'success' ? 'bg-green-500' : 
            toast.type === 'info' ? 'bg-blue-500' : 'bg-red-500'}`}>
          {toast.type === 'success' ? '✓' : toast.type === 'info' ? 'ℹ️' : '✕'} {toast.text}
        </div>
      )}

      {/* Sticky Header */}
      <div className="sticky top-[60px] lg:top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Available Jobs</h1>
              {providerCity && (
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <span className="text-green-500">📍</span>
                  <span>Showing jobs near <strong className="text-gray-600">{providerCity}</strong></span>
                </p>
              )}
            </div>
            <button 
              onClick={() => loadJobs(true)} 
              disabled={refreshing}
              className={`flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition ${refreshing ? 'opacity-50' : ''}`}
            >
              <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Stats and Filters */}
          {!loading && jobs.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex gap-2 text-xs">
                <span className="text-gray-500">Total: <strong className="text-gray-900">{totalJobs}</strong></span>
                <span className="text-gray-300">|</span>
                <span className="text-green-600">Overtime: <strong>{overtimeJobs}</strong></span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">Base: <strong>{baseJobs}</strong></span>
              </div>
              
              <div className="flex gap-1 ml-auto">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    filter === 'all' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('with_overtime')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    filter === 'with_overtime' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  With Overtime
                </button>
                <button
                  onClick={() => setFilter('base_only')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    filter === 'base_only' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Base Only
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent" />
            <p className="text-sm text-gray-400">Loading jobs near you…</p>
          </div>

        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 sm:p-14 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No jobs available</h3>
            <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
              {filter !== 'all' 
                ? `No ${filter === 'with_overtime' ? 'jobs with overtime' : 'base jobs'} available in ${providerCity || 'your area'}`
                : `No open jobs in ${providerCity || 'your area'} right now`
              }
            </p>
            <button 
              onClick={() => {
                setFilter('all')
                loadJobs()
              }}
              className="mt-6 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition"
            >
              Check Again
            </button>
          </div>

        ) : (
          <>
            <p className="text-sm text-gray-400 mb-4">
              <strong className="text-gray-700">{filteredJobs.length}</strong> job{filteredJobs.length !== 1 ? 's' : ''} available
              {filter !== 'all' && (
                <span className="ml-1">
                  ({filter === 'with_overtime' ? 'with overtime' : 'base only'})
                </span>
              )}
            </p>

            <div className="space-y-3">
              {filteredJobs.map((job) => {
                const duration = job.pricing?.duration_minutes || job.service_duration || 60
                
                return (
                  <div key={job.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all overflow-hidden">
                    
                    {/* Card Header */}
                    <div className="flex items-start justify-between p-4 sm:p-5 pb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-xl flex-shrink-0">
                          {job.category_icon || '🔧'}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{job.service_name}</h3>
                          <p className="text-xs text-gray-400">{job.category_name}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">You earn</p>
                        <p className="text-xl sm:text-2xl font-extrabold text-green-600 leading-tight">
                          {job.display_amount}
                        </p>
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="mx-4 sm:mx-5 mb-3">
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg">
                        <span>⏱️</span> Duration: {formatDuration(duration)}
                      </span>
                    </div>

                    {/* Overtime Banner */}
                    {job.pricing?.has_overtime && (
                      <div className="mx-4 sm:mx-5 mb-3">
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-3">
                          <div className="flex items-start gap-2">
                            <span className="text-xl">⏰</span>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-purple-700">
                                Overtime Available: +${job.pricing.overtime_rate.toFixed(2)}/hour
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                Standard duration: {formatDuration(duration)}. Earn extra for additional time.
                              </p>
                              <div className="flex gap-3 mt-2 text-xs">
                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                  1hr OT: ${(job.pricing.total_provider_amount + job.pricing.overtime_rate).toFixed(2)}
                                </span>
                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                  2hr OT: ${(job.pricing.total_provider_amount + (job.pricing.overtime_rate * 2)).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Meta Row */}
                    <div className="flex flex-wrap gap-2 px-4 sm:px-5 pb-3">
                      <MetaBadge icon="📅" text={formatDate(job.job_date)} />
                      <MetaBadge icon="🕐" text={fmtSlots(job.job_time_slot)} />
                      <MetaBadge icon="📍" text={job.address_line1?.split(',')[0] || '—'} />
                    </div>

                    {/* Access Icons */}
                    {(job.parking_access || job.elevator_access || job.has_pets) && (
                      <div className="flex gap-1.5 px-4 sm:px-5 pb-3 flex-wrap">
                        {job.parking_access && <Chip label="🅿️ Parking" green />}
                        {job.elevator_access && <Chip label="🛗 Elevator" green />}
                        {job.has_pets && <Chip label="🐕 Pets" />}
                      </div>
                    )}

                    {/* Description */}
                    {job.job_description && (
                      <p className="px-4 sm:px-5 pb-3 text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {job.job_description}
                      </p>
                    )}

                    {/* Commission Info */}
                    <div className="px-4 sm:px-5 pb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>💰 Commission: {job.pricing?.commission_percent}%</span>
                        <span>•</span>
                        <span>Base: ${job.pricing?.base_price.toFixed(2)}</span>
                        <span>•</span>
                        <span>You get: ${job.pricing?.provider_base_earnings.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 sm:p-5 pt-0 flex flex-col sm:flex-row gap-2">
                      <Link
                        href={`/provider/available-jobs/${job.id}`}
                        className="flex-1 py-2.5 text-center border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => acceptJob(job.id)}
                        className={`flex-1 py-2.5 text-center text-white rounded-xl text-sm font-bold transition ${
                          job.pricing?.has_overtime
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        Accept — {job.display_amount}
                        {job.pricing?.has_overtime && (
                          <span className="ml-1 text-xs opacity-90">+OT</span>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Helper Components
function MetaBadge({ icon, text }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg">
      <span>{icon}</span> {text}
    </span>
  )
}

function Chip({ label, green }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border
      ${green ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
      {label}
    </span>
  )
}