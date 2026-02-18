'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from 'src/context/AuthContext'
import { useRouter } from 'next/navigation'

export default function ProviderDashboard() {
  const { user, isProvider } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ pending: 0, inProgress: 0, completed: 0, totalEarnings: 0 })
  const [error, setError] = useState(null)

  // Redirect if not provider
  useEffect(() => {
    if (!loading && !isProvider()) {
      router.push('/')
    }
  }, [isProvider, loading, router])

  useEffect(() => {
    if (isProvider()) {
      loadJobs()
    }
  }, [isProvider])

  const loadJobs = async () => {
    try {
      setError(null)
      const token = localStorage.getItem('providerToken')

      if (!token) {
        setError('Authentication token not found')
        setLoading(false)
        return
      }

      const res = await fetch('/api/provider/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        if (res.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('providerToken')
          router.push('/')
          return
        }
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()

      if (data.success) {
        const list = data.data || []
        setJobs(list)

        let pending = 0, inProgress = 0, completed = 0, totalEarnings = 0

        list.forEach(job => {
          const status = job.status?.toLowerCase() || ''

          // Pending jobs
          if (['pending', 'matching', 'awaiting_confirmation'].includes(status)) {
            pending++
          }
          // In progress jobs
          if (['confirmed', 'in_progress', 'assigned'].includes(status)) {
            inProgress++
          }
          // Completed jobs
          if (status === 'completed') {
            completed++
            // Use provider_amount if set, else fall back to full price
            const earnings = parseFloat(job.provider_amount ?? job.service_price ?? 0)
            if (!isNaN(earnings)) {
              totalEarnings += earnings
            }
          }
        })

        setStats({
          pending,
          inProgress,
          completed,
          totalEarnings: Number(totalEarnings.toFixed(2))
        })
      } else {
        setError(data.message || 'Failed to load jobs')
      }
    } catch (err) {
      console.error('Dashboard load error:', err)
      setError(err.message || 'An error occurred while loading your dashboard')
    } finally {
      setLoading(false)
    }
  }

  // Safe amount helper — never returns NaN
  const safeAmt = (job) => {
    const baseAmount = parseFloat(job.provider_amount ?? job.service_price ?? 0)
    const additional = parseFloat(job.additional_price ?? 0)
    const total = (isNaN(baseAmount) ? 0 : baseAmount) + (isNaN(additional) ? 0 : additional)
    return Number(total.toFixed(2))
  }

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return 'pending'
    return status.replace(/_/g, ' ')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setLoading(true)
              setError(null)
              loadJobs()
            }}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Get user's first name safely
  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Here&apos;s your activity overview</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard icon="⏳" label="Pending" value={stats.pending} />
          <StatCard icon="⚡" label="In Progress" value={stats.inProgress} />
          <StatCard icon="✅" label="Completed" value={stats.completed} />
          <StatCard
            icon="💰"
            label="Earnings"
            value={`$${stats.totalEarnings.toFixed(2)}`}
            green
          />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <QuickLink href="/provider/available-jobs" icon="🗂️" title="Available Jobs" sub="Browse and accept new jobs" />
          <QuickLink href="/provider/schedule" icon="📅" title="My Schedule" sub="Manage your availability" />
          <QuickLink href="/provider/earnings" icon="💰" title="Earnings" sub="View payment history" />
          <QuickLink href="/provider/messages" icon="💬" title="Messages" sub="Chat with customers" />
        </div>

        {/* Recent jobs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Jobs</h2>
            {jobs.length > 0 && (
              <Link href="/provider/jobs" className="text-sm text-green-600 font-medium hover:text-green-700 transition">
                View All →
              </Link>
            )}
          </div>

          {jobs.length === 0 ? (
            <div className="p-10 text-center">
              <span className="text-5xl mb-4 block">📋</span>
              <h3 className="font-semibold text-gray-900 mb-2">No jobs yet</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
                Ready to start earning? Browse available jobs and accept your first client!
              </p>
              <Link
                href="/provider/available-jobs"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition shadow-md hover:shadow-lg"
              >
                Browse Available Jobs
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {jobs.slice(0, 5).map((job) => {
                const status = job.status?.toLowerCase() || 'pending'
                const amount = safeAmt(job)

                // Get status style
                const getStatusStyle = (status) => {
                  const styles = {
                    completed: 'bg-green-100 text-green-700',
                    in_progress: 'bg-purple-100 text-purple-700',
                    confirmed: 'bg-blue-100 text-blue-700',
                    assigned: 'bg-indigo-100 text-indigo-700',
                    cancelled: 'bg-red-100 text-red-700',
                    pending: 'bg-yellow-100 text-yellow-700',
                    matching: 'bg-orange-100 text-orange-700',
                    awaiting_confirmation: 'bg-amber-100 text-amber-700'
                  }
                  return styles[status] || 'bg-gray-100 text-gray-700'
                }

                return (
                  <Link
                    key={job.id}
                    href={`/provider/jobs/${job.id}`}
                    className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-all gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${getStatusStyle(status)}`}>
                          {formatStatus(status)}
                        </span>
                        {job.booking_number && (
                          <span className="text-xs text-gray-300 font-mono">#{job.booking_number}</span>
                        )}
                      </div>
                      <p className="font-medium text-gray-900 text-sm truncate group-hover:text-green-700 transition">
                        {job.service_name || 'Service'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {job.customer_name || [job.customer_first_name, job.customer_last_name].filter(Boolean).join(' ') || 'Customer'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-green-600 text-lg">${amount.toFixed(2)}</p>
                      {job.status === 'completed' && (
                        <p className="text-[10px] text-gray-400">Earned</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick action for providers with no jobs */}
        {jobs.length === 0 && (
          <div className="mt-6 bg-green-50 border border-green-100 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                💡
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Tips to get your first job</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Complete your profile with a professional photo</li>
                  <li>• Set your availability in the schedule</li>
                  <li>• Browse and apply to available jobs</li>
                  <li>• Respond quickly to customer messages</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, green = false }) {
  return (
    <div className={`rounded-2xl p-4 sm:p-5 transition-all ${green
        ? 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-md'
        : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'
      }`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-medium ${green ? 'text-green-200' : 'text-gray-400'}`}>{label}</span>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${green ? 'text-white' : 'text-gray-900'}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  )
}

function QuickLink({ href, icon, title, sub }) {
  return (
    <Link
      href={href}
      className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 sm:p-5 hover:shadow-md hover:border-green-200 transition-all flex items-center gap-4 group"
    >
      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm group-hover:text-green-700 transition">
          {title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>
      </div>
      <svg className="w-5 h-5 text-gray-300 group-hover:text-green-500 transition-all group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}