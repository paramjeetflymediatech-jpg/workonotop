'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from 'src/context/AuthContext'
import Header from '@/components/Header'

export default function ProviderDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    totalEarnings: 0
  })
  const [showSuccessMessage, setShowSuccessMessage] = useState('')
  const [showErrorMessage, setShowErrorMessage] = useState('')

  useEffect(() => {
    // Check if user is logged in and is provider
    if (!user) {
      router.push('/')
      return
    }
    
    // Check if user is provider (has token)
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
      const res = await fetch('/api/provider/jobs', {
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
        
        // Calculate stats
        const newStats = {
          pending: 0,
          confirmed: 0,
          in_progress: 0,
          completed: 0,
          totalEarnings: 0
        }
        
        data.data.forEach(job => {
          if (job.status === 'pending' || job.status === 'matching') newStats.pending++
          if (job.status === 'confirmed') newStats.confirmed++
          if (job.status === 'in_progress') newStats.in_progress++
          if (job.status === 'completed') {
            newStats.completed++
            newStats.totalEarnings += parseFloat(job.service_price) + parseFloat(job.additional_price || 0)
          }
        })
        
        setStats(newStats)
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
      showMessage('error', 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

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
        loadJobs() // Reload jobs
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
      weekday: 'short',
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
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || user?.first_name || 'Provider'}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your jobs today.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
              <p className="text-sm text-gray-600 mb-1">Pending / Matching</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 mb-1">Confirmed Jobs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.confirmed}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{stats.in_progress}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <p className="text-sm text-gray-600 mb-1">Completed Jobs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>

          {/* Earnings Card */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg opacity-90 mb-1">Total Earnings</p>
                <p className="text-4xl font-bold">${stats.totalEarnings.toFixed(2)}</p>
                <p className="text-sm opacity-75 mt-2">From {stats.completed} completed jobs</p>
              </div>
              <div className="text-6xl">💰</div>
            </div>
          </div>

          {/* My Jobs */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">My Assigned Jobs</h2>
              <Link 
                href="/provider/jobs"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                View All →
              </Link>
            </div>

            {jobs.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {jobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm font-mono text-gray-500">#{job.booking_number}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status?.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.service_name}</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
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
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
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

                {jobs.length > 5 && (
                  <div className="p-4 text-center border-t border-gray-200">
                    <Link 
                      href="/provider/jobs" 
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      View all {jobs.length} jobs →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs assigned yet</h3>
                <p className="text-gray-600 mb-6">When you get assigned jobs, they'll appear here</p>
                <Link
                  href="/provider/profile"
                  className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Complete Your Profile
                </Link>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/provider/profile" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                  👤
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">My Profile</h3>
                  <p className="text-sm text-gray-600">Update your information</p>
                </div>
              </div>
            </Link>
            
            <Link href="/provider/schedule" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                  📅
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">My Schedule</h3>
                  <p className="text-sm text-gray-600">Manage availability</p>
                </div>
              </div>
            </Link>
            
            <Link href="/provider/earnings" className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
                  💰
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Earnings</h3>
                  <p className="text-sm text-gray-600">View payment history</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}