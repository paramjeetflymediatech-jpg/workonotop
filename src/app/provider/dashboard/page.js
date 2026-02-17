'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from 'src/context/AuthContext'

export default function ProviderDashboard() {
  const { user } = useAuth()
  const [jobs, setJobs]     = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats]   = useState({ pending: 0, inProgress: 0, completed: 0, totalEarnings: 0 })

  useEffect(() => { loadJobs() }, [])

  const loadJobs = async () => {
    try {
      const token = localStorage.getItem('providerToken')
      const res   = await fetch('/api/provider/jobs', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data  = await res.json()
      if (data.success) {
        const list = data.data || []
        setJobs(list)

        let pending = 0, inProgress = 0, completed = 0, totalEarnings = 0
        list.forEach(job => {
          const status = job.status ?? ''
          if (['pending','matching'].includes(status)) pending++
          if (['confirmed','in_progress'].includes(status)) inProgress++
          if (status === 'completed') {
            completed++
            // Use provider_amount if set, else fall back to full price
            totalEarnings += parseFloat(job.provider_amount ?? job.service_price ?? 0)
          }
        })
        setStats({ pending, inProgress, completed, totalEarnings })
      }
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Safe amount helper — never returns NaN
  const safeAmt = (job) =>
    parseFloat(job.provider_amount ?? job.service_price ?? 0) +
    parseFloat(job.additional_price ?? 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent" />
      </div>
    )
  }

  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Here's your activity overview</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard icon="⏳" label="Pending"     value={stats.pending}     />
          <StatCard icon="⚡" label="In Progress" value={stats.inProgress}  />
          <StatCard icon="✅" label="Completed"   value={stats.completed}   />
          <StatCard icon="💰" label="Earnings"    value={`$${stats.totalEarnings.toFixed(2)}`} green />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <QuickLink href="/provider/available-jobs" icon="🗂️" title="Available Jobs" sub="Browse and accept new jobs" badge={null} />
          <QuickLink href="/provider/schedule"       icon="📅" title="My Schedule"    sub="Manage your availability" />
          <QuickLink href="/provider/earnings"       icon="💰" title="Earnings"       sub="View payment history" />
          <QuickLink href="/provider/messages"       icon="💬" title="Messages"       sub="Chat with customers" />
        </div>

        {/* Recent jobs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Jobs</h2>
            <Link href="/provider/jobs" className="text-sm text-green-600 font-medium hover:text-green-700 transition">
              View All →
            </Link>
          </div>

          {jobs.length === 0 ? (
            <div className="p-10 text-center">
              <span className="text-4xl mb-3 block">📋</span>
              <h3 className="font-semibold text-gray-900 mb-1">No jobs yet</h3>
              <p className="text-sm text-gray-400 mb-4">Go check available jobs and accept your first one!</p>
              <Link href="/provider/available-jobs"
                className="inline-block px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition">
                Browse Available Jobs
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {jobs.slice(0, 5).map((job) => {
                const status  = job.status ?? ''
                const amount  = safeAmt(job)
                const statusStyle = {
                  completed:   'bg-green-100 text-green-700',
                  in_progress: 'bg-purple-100 text-purple-700',
                  confirmed:   'bg-blue-100 text-blue-700',
                  cancelled:   'bg-red-100 text-red-700',
                }[status] || 'bg-yellow-100 text-yellow-700'

                return (
                  <Link key={job.id} href={`/provider/jobs/${job.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${statusStyle}`}>
                          {status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-300 font-mono">#{job.booking_number ?? ''}</span>
                      </div>
                      <p className="font-medium text-gray-900 text-sm truncate">{job.service_name ?? 'Service'}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {[job.customer_first_name, job.customer_last_name].filter(Boolean).join(' ') || 'Customer'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-green-600">${amount.toFixed(2)}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, green }) {
  return (
    <div className={`rounded-2xl p-4 sm:p-5 ${green ? 'bg-green-600 text-white' : 'bg-white border border-gray-100 shadow-sm'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs font-medium ${green ? 'text-green-200' : 'text-gray-400'}`}>{label}</span>
      </div>
      <p className={`text-2xl sm:text-3xl font-bold ${green ? 'text-white' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

function QuickLink({ href, icon, title, sub }) {
  return (
    <Link href={href}
      className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 sm:p-5 hover:shadow-md hover:border-green-200 transition-all flex items-center gap-4 group">
      <div className="w-11 h-11 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-green-100 transition">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      <svg className="w-4 h-4 text-gray-300 ml-auto group-hover:text-green-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}