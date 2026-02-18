// app/provider/jobs/page.jsx - UPDATED (Only show time, no earnings)

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import TimeTracker from './TimeTracker'

export default function ProviderJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [toast, setToast] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadJobs()
  }, [])

  const token = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('providerToken')
    }
    return null
  }

  const loadJobs = async () => {
    try {
      const res = await fetch('/api/provider/jobs', {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const data = await res.json()
      if (data.success) {
        setJobs(data.data || [])
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
      pending: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (date) => {
    if (!date) return ''
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

        {jobs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <p className="text-gray-500">No jobs assigned yet</p>
            <Link 
              href="/provider/available-jobs"
              className="mt-4 inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
            >
              Browse Available Jobs
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map(job => {
              const duration = job.duration_minutes || 60
              const hasOvertime = parseFloat(job.additional_price || 0) > 0
              const overtimeRate = parseFloat(job.additional_price || 0)
              const baseAmount = parseFloat(job.provider_amount || 0)
              const finalAmount = parseFloat(job.final_provider_amount || baseAmount)
              
              return (
                <div key={job.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition">
                  {/* Job Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{job.service_name}</h3>
                        <p className="text-sm text-gray-500">#{job.booking_number}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="p-4">
                    {/* Duration Display - Only Show Time, Not Earnings */}
                    <div className="mb-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg">
                        <span>⏱️</span> Est: {formatDuration(duration)}
                      </span>
                      {job.actual_duration_minutes > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-lg">
                          <span>✓</span> Actual: {formatDuration(job.actual_duration_minutes)}
                        </span>
                      )}
                      {job.status === 'in_progress' && (
                        <span className="inline-flex items-center gap-1 text-xs bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-lg">
                          <span>⏺</span> In Progress
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400">Date</p>
                        <p className="text-sm font-medium">{formatDate(job.job_date)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Customer</p>
                        <p className="text-sm font-medium">{job.customer_first_name} {job.customer_last_name}</p>
                      </div>
                    </div>

                    {/* Overtime Rate if available - Show as info only
                    {hasOvertime && (
                      <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-700 flex items-center gap-2">
                          <span>⏰</span>
                          <span>Overtime Rate: ${overtimeRate.toFixed(2)}/hour</span>
                        </p>
                      </div>
                    )} */}

                    {/* Time Tracking Section - For active jobs */}
                    {(job.status === 'confirmed' || job.status === 'in_progress') && (
                      <div className="mb-4">
                        <TimeTracker 
                          bookingId={job.id} 
                          onComplete={handleJobComplete}
                          standardDuration={duration}
                          overtimeRate={overtimeRate}
                        />
                      </div>
                    )}

                    {/* Completed Job - Show Only Time Info, No Earnings */}
                    {job.status === 'completed' && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                        <p className="text-green-700 font-medium flex items-center gap-2 mb-2">
                          <span>✓</span> Job Completed
                        </p>
                        {job.actual_duration_minutes > 0 && (
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Started:</span>
                              <span className="font-medium">{formatDateTime(job.start_time)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Completed:</span>
                              <span className="font-medium">{formatDateTime(job.end_time)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-green-200">
                              <span className="text-gray-600">Total time:</span>
                              <span className="font-bold text-green-700">
                                {formatDuration(job.actual_duration_minutes)}
                              </span>
                            </div>
                            {job.overtime_minutes > 0 && (
                              <div className="flex justify-between text-purple-600">
                                <span>Overtime:</span>
                                <span>{formatDuration(job.overtime_minutes)}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* View Details Link */}
                    <div className="text-right">
                      <Link 
                        href={`/provider/jobs/${job.id}`}
                        className="text-sm text-green-600 hover:text-green-700 font-medium inline-flex items-center gap-1"
                      >
                        View Details
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}