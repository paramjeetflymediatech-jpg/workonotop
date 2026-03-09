'use client'

import { useState, useEffect } from 'react'
import { useAuth } from 'src/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import {
  User, BookOpen, ChevronRight,
  AlertCircle, Calendar, DollarSign, Star
} from 'lucide-react'

const fmt     = (n) => `$${parseFloat(n || 0).toFixed(2)}`
const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  : '—'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const router   = useRouter()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!user) { router.push('/'); return }
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true); setError('')
      const res  = await fetch(`/api/customers/${user.id}`)
      const data = await res.json()
      if (data.success) setProfile(data.data)
      else setError(data.message || 'Failed to load')
    } catch { setError('Failed to load') }
    finally  { setLoading(false) }
  }

  if (loading) return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-[3px] border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  )

  if (error || !profile) return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-8 text-center shadow-sm border w-full max-w-sm">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button onClick={loadProfile}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition w-full">
            Try Again
          </button>
        </div>
      </div>
    </>
  )

  const stats    = profile.stats || {}
  const initials = `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gray-50/80">

        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 pt-8 pb-20 px-4">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white text-xl font-black flex-shrink-0 shadow-lg">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-teal-200 text-xs font-semibold uppercase tracking-widest mb-0.5">Welcome back</p>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-teal-100/80 text-xs mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>Member since {fmtDate(profile.created_at)}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 -mt-12 pb-10 space-y-4">

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { label: 'Total Bookings', value: stats.total_bookings || 0,   icon: BookOpen,   color: 'text-teal-600',    bg: 'bg-teal-50'    },
              { label: 'Total Spent',    value: fmt(stats.total_spent),       icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Avg. Booking',   value: fmt(stats.avg_booking_value), icon: Star,       color: 'text-violet-600',  bg: 'bg-violet-50'  },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-4">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${bg} flex items-center justify-center mb-2 sm:mb-3`}>
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${color}`} />
                </div>
                <p className={`text-base sm:text-xl font-black ${color} truncate`}>{value}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/profile"
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:border-teal-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">My Profile</h3>
              <p className="text-xs text-gray-400 leading-relaxed">View and update your personal information</p>
            </Link>

            <Link href="/my-bookings"
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:border-teal-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">My Bookings</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Track and manage all your service bookings</p>
            </Link>
          </div>

        </div>
      </div>
    </>
  )
}