'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from 'src/context/AuthContext'
import Header from '@/components/Header'

export default function ProviderJobs() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showSuccessMessage, setShowSuccessMessage] = useState('')
  const [showErrorMessage, setShowErrorMessage] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    
    const token = localStorage.getItem('providerToken')
    if (!token) {
      logout()
      router.push('/')
      return
    }

    loadJobs()
  }, [user])

  const showMessage = (type, message) => {
    if (type === 'success') {
      setShowSuccessMessage(message)
      setTimeout(() => setShowSuccessMessage(''), 3000)
    } else {
      setShowErrorMessage(message)
      setTimeout(() => setShowErrorMessage(''), 3000)
    }
  }

  const loadJobs = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('providerToken')
      const status = filter !== 'all' ? `&status=${filter}` : ''
      const res = await fetch(`/api/provider/jobs?limit=100${status}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!res.ok) {
        if (res.status === 401) {
          logout()
          router.push('/')
          return
        }
        throw new Error('Failed to load jobs')
      }
      
      const data = await res.json()
      if (data.success) {
        setJobs(data.data || [])
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
      showMessage('error', 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadJobs()
    }
  }, [filter])

  const updateJobStatus = async (jobId, newStatus) => {
    try {
      const token = localStorage.getItem('providerToken')
      const res = await fetch(`/api/provider/jobs?id=${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await res.json()
      if (data.success) {
        showMessage('success', `Job status updated to ${newStatus.replace('_', ' ')}`)
        loadJobs()
      } else {
        showMessage('error', data.message || 'Failed to update job')
      }
    } catch (error) {
      console.error('Error updating job:', error)
      showMessage('error', 'Failed to update job')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'matching': 'bg-orange-100 text-orange-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTimeSlot = (slot) => {
    if (Array.isArray(slot)) {
      return slot.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ')
    }
    const slots = {
      'morning': '8:00 AM - 12:00 PM',
      'afternoon': '12:00 PM - 5:00 PM',
      'evening': '5:00 PM - 9:00 PM'
    }
    return slots[slot] || slot
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        {/* Messages */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
            {showSuccessMessage}
          </div>
        )}
        {showErrorMessage && (
          <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            {showErrorMessage}
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Jobs</h1>
              <p className="text-gray-600">Manage all your assigned jobs</p>
            </div>
            <Link
              href="/provider/dashboard"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {['all', 'pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === status
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {status === 'in_progress' ? 'In Progress' : status.replace('_', ' ')}
                {filter === status && jobs.length > 0 && (
                  <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {jobs.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Jobs List */}
          {jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-sm font-mono text-gray-500">#{job.booking_number}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status?.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.service_name}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Customer</p>
                          <p className="text-sm font-medium">{job.customer_first_name} {job.customer_last_name}</p>
                          <p className="text-xs text-gray-600">{job.customer_phone}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date & Time</p>
                          <p className="text-sm font-medium">{formatDate(job.job_date)}</p>
                          <p className="text-xs text-gray-600">{formatTimeSlot(job.job_time_slot)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm">{job.address_line1}</p>
                          <p className="text-xs text-gray-600">{job.city}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Payment</p>
                          <p className="text-lg font-bold text-green-600">
                            ${(parseFloat(job.service_price) + parseFloat(job.additional_price || 0)).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Job Actions */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {job.status === 'confirmed' && (
                          <button
                            onClick={() => updateJobStatus(job.id, 'in_progress')}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
                          >
                            Start Job
                          </button>
                        )}
                        {job.status === 'in_progress' && (
                          <button
                            onClick={() => updateJobStatus(job.id, 'completed')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                          >
                            Mark Complete
                          </button>
                        )}
                        <Link
                          href={`/provider/jobs/${job.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`tel:${job.customer_phone}`}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
                        >
                          Call Customer
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "You don't have any jobs assigned yet" 
                  : `No ${filter.replace('_', ' ')} jobs`}
              </p>
              <Link
                href="/provider/dashboard"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Back to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}