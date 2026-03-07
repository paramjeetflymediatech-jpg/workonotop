'use client'

import { useState, useEffect } from 'react'
import { useAuth } from 'src/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import {
  User, Mail, Phone, Calendar, CreditCard,
  Edit2, Save, X, CheckCircle, AlertCircle,
  ArrowLeft, Clock, Star
} from 'lucide-react'

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [message, onClose])
  if (!message) return null
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl text-white text-sm max-w-sm
      ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
      {message}
    </div>
  )
}

const statusColor = (s) => {
  const colors = {
    pending: 'bg-yellow-50 text-yellow-700',
    confirmed: 'bg-blue-50 text-blue-700',
    in_progress: 'bg-purple-50 text-purple-700',
    awaiting_approval: 'bg-amber-50 text-amber-700',
    completed: 'bg-green-50 text-green-700',
    disputed: 'bg-red-50 text-red-700',
    cancelled: 'bg-gray-50 text-gray-600',
  }
  return colors[s] || 'bg-gray-50 text-gray-600'
}

export default function CustomerProfilePage() {
  const { user, login } = useAuth()
  const router = useRouter()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState({ message: '', type: '' })

  // Edit form state
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    hear_about: '',
    receive_offers: false,
  })

  const notify = (message, type = 'success') => setToast({ message, type })

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await fetch(`/api/customers/${user.id}`)
      const data = await res.json()
      if (data.success) {
        setProfile(data.data)
        setForm({
          first_name: data.data.first_name || '',
          last_name: data.data.last_name || '',
          phone: data.data.phone || '',
          hear_about: data.data.hear_about || '',
          receive_offers: !!data.data.receive_offers,
        })
      } else {
        setError(data.message || 'Failed to load profile')
      }
    } catch (err) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      notify('First and last name are required', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/customers/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.success) {
        setProfile(prev => ({ ...prev, ...data.data }))
        // Update auth context with new name
        login({ ...user, first_name: data.data.first_name, last_name: data.data.last_name })
        setEditing(false)
        notify('Profile updated successfully')
      } else {
        notify(data.message || 'Failed to update', 'error')
      }
    } catch {
      notify('Something went wrong', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      phone: profile.phone || '',
      hear_about: profile.hear_about || '',
      receive_offers: !!profile.receive_offers,
    })
    setEditing(false)
  }

  const fmt = (n) => `$${parseFloat(n || 0).toFixed(2)}`
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'

  if (loading) return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </>
  )

  if (error || !profile) return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 text-center border">
            <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Could not load profile</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button onClick={loadProfile} className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold">
              Try Again
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Header />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />

      <div className="min-h-screen bg-gray-50 py-6 md:py-10">
        <div className="max-w-2xl mx-auto px-4 space-y-5">

          {/* Back */}
          <Link href="/my-bookings" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Bookings
          </Link>

          {/* Profile Card */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  {profile.first_name?.[0]?.toUpperCase()}{profile.last_name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {profile.first_name} {profile.last_name}
                  </h1>
                  <p className="text-teal-100 text-sm mt-0.5">{profile.email}</p>
                  <p className="text-teal-200 text-xs mt-1">Member since {fmtDate(profile.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 divide-x border-b">
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{profile.stats?.total_bookings || 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">Total Bookings</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-teal-600">{fmt(profile.stats?.total_spent)}</p>
                <p className="text-xs text-gray-500 mt-0.5">Total Spent</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{fmt(profile.stats?.avg_booking_value)}</p>
                <p className="text-xs text-gray-500 mt-0.5">Avg. Booking</p>
              </div>
            </div>

            {/* Edit / View Section */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-600" /> Personal Information
                </h2>
                {!editing ? (
                  <button onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 font-medium border border-teal-200 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleCancel}
                      className="flex items-center gap-1 text-sm text-gray-600 border px-3 py-1.5 rounded-lg hover:bg-gray-50">
                      <X className="w-4 h-4" /> Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-1 text-sm text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg disabled:opacity-50">
                      <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              {!editing ? (
                /* VIEW MODE */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">First Name</p>
                      <p className="font-semibold text-gray-900">{profile.first_name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Last Name</p>
                      <p className="font-semibold text-gray-900">{profile.last_name || '—'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                    <p className="font-semibold text-gray-900">{profile.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
                    <p className="font-semibold text-gray-900">{profile.phone || '—'}</p>
                  </div>
                  {profile.hear_about && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">How they heard about us</p>
                      <p className="font-semibold text-gray-900">{profile.hear_about}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <div className={`w-4 h-4 rounded flex items-center justify-center ${profile.receive_offers ? 'bg-teal-600' : 'bg-gray-200'}`}>
                      {profile.receive_offers && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <p className="text-sm text-gray-600">Subscribed to offers & news</p>
                  </div>
                </div>
              ) : (
                /* EDIT MODE */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={form.first_name}
                        onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={form.last_name}
                        onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                        className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full border-2 border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+1 (403) 000-0000"
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">How did you hear about us?</label>
                    <input
                      type="text"
                      value={form.hear_about}
                      onChange={e => setForm(p => ({ ...p, hear_about: e.target.value }))}
                      placeholder="e.g. social media, from a friend..."
                      className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-500"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.receive_offers}
                      onChange={e => setForm(p => ({ ...p, receive_offers: e.target.checked }))}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">Receive news and special offers</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Recent Bookings */}
          {profile.recent_bookings?.length > 0 && (
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-600" /> Recent Bookings
                </h2>
                <Link href="/my-bookings" className="text-sm text-teal-600 hover:underline font-medium">
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {profile.recent_bookings.map((b) => (
                  <Link key={b.id} href={`/my-bookings/${b.id}`}
                    className="flex items-center justify-between p-3 rounded-xl border hover:bg-gray-50 transition">
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{b.service_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {b.job_date ? new Date(b.job_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : fmtDate(b.created_at)}
                        {b.city ? ` · ${b.city}` : ''}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-bold text-sm text-gray-900">{fmt(b.service_price)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(b.status)}`}>
                        {(b.status || '').replace(/_/g, ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Account Info */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" /> Account Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Member since</span>
                <span className="font-medium">{fmtDate(profile.created_at)}</span>
              </div>
              {profile.stats?.last_booking && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Last booking</span>
                  <span className="font-medium">{fmtDate(profile.stats.last_booking)}</span>
                </div>
              )}
              {profile.stats?.first_booking && (
                <div className="flex justify-between">
                  <span className="text-gray-500">First booking</span>
                  <span className="font-medium">{fmtDate(profile.stats.first_booking)}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}