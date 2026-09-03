// app/provider/jobs/page.jsx - FIXED with cookie auth
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Clock, AlertCircle } from 'lucide-react'
import TimeTracker from './TimeTracker'

const MetaBadge = ({ icon, text }) => (
  <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50/80 border border-gray-100 px-2.5 py-1.5 rounded-lg shadow-sm">
    <span className="opacity-80">{icon}</span> {text}
  </span>
)

export default function ProviderJobs() {
  const router = useRouter()
  const [jobs, setJobs] = useState([])
  const [activeTab, setActiveTab] = useState('ongoing')
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [toast, setToast] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkAuth()
    loadJobs()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/provider/me')
      if (!res.ok) {
        router.push('/provider/login')
      }
    } catch {
      router.push('/provider/login')
    }
  }

  const loadJobs = async () => {
    try {
      // No manual token needed - cookies are sent automatically
      const res = await fetch('/api/provider/jobs')
      const data = await res.json()
      if (data.success) {
        setJobs(data.data || [])
      } else {
        if (res.status === 401) {
          router.push('/provider/login')
        }
        showToast('error', data.message || 'Failed to load jobs')
      }
    } catch (error) {
      showToast('error', 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (type, text) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }

  const handleJobComplete = (jobData) => {
    showToast('success', `Job completed! Duration: ${formatDuration(jobData.total_minutes)}`)
    loadJobs()
    setSelectedJob(null)
  }

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-gray-100 text-gray-800',
      awaiting_approval: 'bg-teal-100 text-teal-800',
      disputed: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (date) => {
    if (!date) return ''
    if (typeof date === 'string' && date.includes(',')) {
      return date.split(',').map(d => new Date(d.trim()).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      })).join(' • ')
    }
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return 'Not started'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const formatDateTime = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium
          ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {toast.text}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Jobs</h1>

        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'ongoing' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'completed' ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed
          </button>
        </div>

        {(() => {
          const filteredJobs = jobs.filter(job => 
            activeTab === 'ongoing' 
              ? ['confirmed', 'in_progress'].includes(job.status)
              : ['completed', 'awaiting_approval', 'disputed'].includes(job.status)
          );

          if (filteredJobs.length === 0) {
            return (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
                <p className="text-gray-500">
                  {activeTab === 'ongoing' ? 'No ongoing jobs right now.' : 'No completed jobs yet.'}
                </p>
                {activeTab === 'ongoing' && (
                  <Link 
                    href="/provider/available-jobs"
                    className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                  >
                    Browse Available Jobs
                  </Link>
                )}
              </div>
            );
          }

          return (
            <div className="grid gap-4">
              {filteredJobs.map(job => {
              const duration = job.duration_minutes || 60
              const commPct = parseFloat(job.commission_percent ?? 20)
              const baseAmount = parseFloat(job.final_provider_amount) > 0
                ? parseFloat(job.final_provider_amount)
                : (parseFloat(job.provider_amount || 0) + parseFloat(job.overtime_earnings || 0)) || (parseFloat(job.service_price || 0) * (1 - (commPct / 100)))
              const otRate = parseFloat(job.additional_price || 0)
              const netOT = otRate * (1 - (commPct / 100))
              const hasOvertime = otRate > 0

              const hasParking = !!job.parking_access
              const hasElevator = !!job.elevator_access
              const hasPets = !!job.has_pets

              return (
                <div key={job.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                  job.status === 'in_progress' ? 'border-yellow-200 hover:border-yellow-300 ring-1 ring-yellow-100' :
                  job.status === 'confirmed' ? 'border-blue-200 hover:border-blue-300 ring-1 ring-blue-100' :
                  hasOvertime && job.status !== 'completed' ? 'border-purple-200 hover:border-purple-300 ring-1 ring-purple-100' :
                  'border-gray-100 hover:border-green-200'
                }`}>
                  


                  <div className="flex items-start justify-between p-5 pb-3 border-b border-gray-50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0 group">
                        {job.photos?.length > 0 ? (
                          <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 shadow-sm relative cursor-pointer"
                            onClick={() => window.open(job.photos[0], '_blank')}>
                            <img src={job.photos[0]} alt="Job" className="w-full h-full object-cover" />
                            {job.photos.length > 1 && (
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-[10px] font-bold">+{job.photos.length - 1}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl ${
                            job.status === 'completed' ? 'bg-green-50 border border-green-100 text-green-600' :
                            hasOvertime ? 'bg-purple-50 border border-purple-100 text-purple-600' :
                            'bg-blue-50 border border-blue-100 text-blue-600'
                          }`}>
                            🔧
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-sm truncate">{job.service_name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${getStatusColor(job.status)}`}>
                            {job.status?.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {job.customer_first_name} {job.customer_last_name} • #{job.booking_number}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">You earn</p>
                      <p className={`text-2xl font-extrabold leading-tight ${job.status === 'completed' ? 'text-green-600' : 'text-black'}`}>
                        ${baseAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>


                  <div className="flex flex-wrap gap-2 px-5 pb-3">
                    <MetaBadge icon="📅" text={formatDate(job.job_date)} />
                    {job.job_time_slot && <MetaBadge icon="🕐" text={job.job_time_slot} />}
                    <MetaBadge icon="📍" text={job.address_line1?.split(',')[0] || '—'} />
                    {job.service_area_name && (
                      <span className="inline-flex items-center gap-1 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg">
                        <span>🗺️</span> {job.service_area_group ? `${job.service_area_group} - ${job.service_area_name}` : job.service_area_name}
                      </span>
                    )}
                    {job.photos?.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg font-bold cursor-pointer"
                            onClick={() => window.open(job.photos[0], '_blank')}>
                        <span>📷</span> {job.photos.length} Photo{job.photos.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {(hasParking || hasElevator || hasPets) && (
                    <div className="flex gap-1.5 px-5 pb-3 flex-wrap">
                      {hasParking && <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 border border-green-200 text-green-700">🅿️ Parking</span>}
                      {hasElevator && <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-50 border border-green-200 text-green-700">🛗 Elevator</span>}
                      {hasPets && <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-50 border border-amber-200 text-amber-700">🐕 Pets</span>}
                    </div>
                  )}

                  {job.status === 'completed' && (
                    <div className="mx-5 mb-3 bg-green-50 border border-green-200 rounded-xl p-4">
                      <p className="text-green-700 font-bold flex items-center gap-2 mb-2 text-sm">
                        <span>✓</span> Job Completed
                      </p>
                      {job.actual_duration_minutes > 0 && (
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-green-600/80">Started:</span>
                            <span className="font-medium text-green-900">{formatDateTime(job.start_time)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-600/80">Completed:</span>
                            <span className="font-medium text-green-900">{formatDateTime(job.end_time)}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-green-200/50 mt-1">
                            <span className="text-green-700">Total time:</span>
                            <span className="font-bold text-green-700">
                              {formatDuration(job.actual_duration_minutes)}
                            </span>
                          </div>
                          {job.overtime_minutes > 0 && (
                            <div className="flex justify-between text-purple-700 mt-1">
                              <span className="font-medium">Overtime:</span>
                              <span className="font-bold">{formatDuration(job.overtime_minutes)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-5 pt-2 flex gap-2">
                    <Link 
                      href={`/provider/jobs/${job.id}`}
                      className={`flex-1 py-3 border rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 group ${
                        job.status === 'in_progress' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-500 hover:text-white' :
                        job.status === 'confirmed' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-600 hover:text-white' :
                        'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {job.status === 'in_progress' ? '▶ Continue Job' : job.status === 'confirmed' ? '▶ Start Job' : 'View Details'}
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
          )
        })()}
      </div>
    </div>
  )
}