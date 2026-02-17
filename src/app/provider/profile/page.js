'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from 'src/context/AuthContext'
import Image from 'next/image'

export default function ProviderProfile() {
  const router = useRouter()
  const { user, login } = useAuth()
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage]     = useState({ show: false, type: '', text: '' })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isNewUser, setIsNewUser] = useState(false)   // first time setup

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experience_years: '',
    bio: '',
    location: '',
    city: '',
    rating: 0,
    total_jobs: 0,
    avatar_url: '',
  })

  useEffect(() => { loadProfile() }, [])

  const showMsg = (type, text) => {
    setMessage({ show: true, type, text })
    setTimeout(() => setMessage({ show: false, type: '', text: '' }), 3500)
  }

  const token = () => localStorage.getItem('providerToken')

  // Helper function to safely get string values (never null)
  const safeString = (value) => {
    if (value === null || value === undefined) return ''
    return String(value)
  }

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadProfile = async () => {
    try {
      const res  = await fetch('/api/provider/profile', { headers: { Authorization: `Bearer ${token()}` } })
      const data = await res.json()
      if (data.success) {
        const d = data.data
        const cityMissing = !d?.city?.trim()
        setIsNewUser(cityMissing)
        
        setProfile({
          name:             safeString(d?.name)             || safeString(user?.name),
          email:            safeString(d?.email)            || safeString(user?.email),
          phone:            safeString(d?.phone),
          specialty:        safeString(d?.specialty),
          experience_years: d?.experience_years != null ? String(d.experience_years) : '',
          bio:              safeString(d?.bio),
          location:         safeString(d?.location),
          city:             safeString(d?.city),
          rating:           Number(d?.rating)   || 0,
          total_jobs:       Number(d?.total_jobs)|| 0,
          avatar_url:       safeString(d?.avatar_url),
        })
        
        if (d?.avatar_url) {
          setImagePreview(d.avatar_url)
          localStorage.setItem('providerProfileImage', d.avatar_url)
        }
      }
    } catch { showMsg('error', 'Failed to load profile') }
    finally  { setLoading(false) }
  }

  // ── Image ─────────────────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const uploadImage = async () => {
    if (!imageFile) return null
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', imageFile)
      const res  = await fetch('/api/provider/upload', {
        method: 'POST', headers: { Authorization: `Bearer ${token()}` }, body: fd,
      })
      const data = await res.json()
      if (data.success) { 
        localStorage.setItem('providerProfileImage', data.url); 
        return data.url 
      }
      showMsg('error', data.message || 'Upload failed')
    } catch { showMsg('error', 'Upload failed') }
    finally { setUploading(false) }
    return null
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!profile.city?.trim()) {
      showMsg('error', 'City is required to use the dashboard')
      return
    }
    setSaving(true)
    try {
      let avatarUrl = profile.avatar_url
      if (imageFile) { const u = await uploadImage(); if (u) avatarUrl = u }

      const res = await fetch('/api/provider/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          specialty: profile.specialty || '',
          experience_years: parseInt(profile.experience_years) || 0,
          bio: profile.bio || '',
          location: profile.location || '',
          city: profile.city.trim() || '',
          avatar_url: avatarUrl || '',
        }),
      })
      const data = await res.json()
      if (data.success) {
        showMsg('success', 'Profile saved!')
        login({ ...user, name: data.data.name, email: data.data.email, avatar_url: data.data.avatar_url }, 'provider')
        setProfile(prev => ({ 
          ...prev, 
          ...data.data, 
          experience_years: data.data.experience_years != null ? String(data.data.experience_years) : '', 
          city: data.data.city ?? '' 
        }))
        if (data.data.avatar_url) { 
          setImagePreview(data.data.avatar_url); 
          localStorage.setItem('providerProfileImage', data.data.avatar_url) 
        }
        setImageFile(null)
        setIsNewUser(false)
        // If city was just set for first time, go to dashboard
        if (isNewUser) setTimeout(() => router.push('/provider/dashboard'), 1200)
      } else {
        showMsg('error', data.message || 'Save failed')
      }
    } catch { showMsg('error', 'Save failed') }
    finally { setSaving(false) }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent" />
      </div>
    )
  }

  const stars = [1, 2, 3, 4, 5]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Toast */}
      {message.show && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold flex items-center gap-2 animate-fade-in
          ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
          {message.type === 'success' ? '✓' : '✕'} {message.text}
        </div>
      )}

      {/* New user setup banner */}
      {isNewUser && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 text-center">
          <p className="text-sm font-medium">
            👋 Welcome! Please complete your profile — especially your <strong>City</strong> — to unlock your dashboard.
          </p>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-6 sm:px-6 sm:py-8">

        {/* Page title */}
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Keep your information up to date</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">

          {/* Cover + Avatar */}
          <div className="h-28 sm:h-36 bg-gradient-to-br from-green-400 via-green-500 to-teal-600 relative">
            <div className="absolute -bottom-10 left-5 sm:left-6">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                  {imagePreview
                    ? <Image src={imagePreview} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" unoptimized={imagePreview?.startsWith('data:')} />
                    : <div className="w-full h-full bg-green-600 flex items-center justify-center text-white text-3xl font-bold">
                        {profile.name?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                  }
                </div>
                <label className={`absolute -bottom-1 -right-1 w-7 h-7 sm:w-8 sm:h-8 bg-green-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-700 transition shadow-md border-2 border-white ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" disabled={uploading} />
                  {uploading
                    ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                  }
                </label>
              </div>
            </div>
          </div>

          <div className="pt-14 sm:pt-16 px-5 sm:px-6 pb-6 sm:pb-8">

            {/* Stats row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{profile.name || 'Your Name'}</h2>
                <p className="text-gray-400 text-sm">{profile.specialty || 'Service Provider'}</p>
                {profile.city && <p className="text-green-600 text-xs mt-0.5 font-medium">📍 {profile.city}</p>}
              </div>
              <div className="flex gap-2">
                {/* Rating */}
                <div className="text-center px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 min-w-[64px]">
                  <div className="flex justify-center gap-px mb-1">
                    {stars.map(s => (
                      <svg key={s} className={`w-3 h-3 ${s <= Math.round(Number(profile.rating || 0)) ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-gray-900">{Number(profile.rating || 0).toFixed(1)}</p>
                  <p className="text-[10px] text-gray-400">Rating</p>
                </div>
                <div className="text-center px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 min-w-[54px]">
                  <p className="text-base font-bold text-gray-900">{profile.total_jobs}</p>
                  <p className="text-[10px] text-gray-400">Jobs</p>
                </div>
                <div className="text-center px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 min-w-[54px]">
                  <p className="text-base font-bold text-gray-900">{profile.experience_years || 0}</p>
                  <p className="text-[10px] text-gray-400">Yrs Exp</p>
                </div>
              </div>
            </div>

            {/* City required alert */}
            {!profile.city && (
              <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <span className="text-xl flex-shrink-0">🚨</span>
                <div>
                  <p className="text-sm font-semibold text-red-800">City is required!</p>
                  <p className="text-xs text-red-600 mt-0.5">You cannot access Dashboard, Jobs, or Earnings until you set your city below.</p>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Section: Basic */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Basic Info</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Field label="Full Name" required>
                    <input 
                      type="text" 
                      required 
                      value={profile.name || ''}
                      onChange={e => setProfile({...profile, name: e.target.value})}
                      placeholder="James Carter"
                      className="input" />
                  </Field>
                  <Field label="Email" required>
                    <input 
                      type="email" 
                      required 
                      value={profile.email || ''}
                      onChange={e => setProfile({...profile, email: e.target.value})}
                      placeholder="james@example.com"
                      className="input" />
                  </Field>
                  <Field label="Phone" required>
                    <input 
                      type="tel" 
                      required 
                      value={profile.phone || ''}
                      onChange={e => setProfile({...profile, phone: e.target.value})}
                      placeholder="9876543210"
                      className="input" />
                  </Field>
                </div>
              </div>

              {/* Section: Location — highlighted */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  📍 Your Location <span className="text-red-500">— Required for job matching</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      required 
                      value={profile.city || ''}
                      onChange={e => setProfile({...profile, city: e.target.value})}
                      placeholder="e.g. Calgary"
                      className="w-full px-3.5 py-2.5 border border-green-300 bg-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm font-medium transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Address</label>
                    <input 
                      type="text" 
                      value={profile.location || ''}
                      onChange={e => setProfile({...profile, location: e.target.value})}
                      placeholder="e.g. 123 Main St, Calgary, AB"
                      className="w-full px-3.5 py-2.5 border border-gray-200 bg-white rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm transition" />
                  </div>
                </div>
              </div>

              {/* Section: Professional */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Professional</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <Field label="Specialty / Trade">
                    <input 
                      type="text" 
                      value={profile.specialty || ''}
                      onChange={e => setProfile({...profile, specialty: e.target.value})}
                      placeholder="e.g. Plumber, Electrician"
                      className="input" />
                  </Field>
                  <Field label="Years of Experience">
                    <input 
                      type="number" 
                      min="0" 
                      value={profile.experience_years || ''}
                      onChange={e => setProfile({...profile, experience_years: e.target.value})}
                      placeholder="e.g. 5"
                      className="input" />
                  </Field>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                    <textarea 
                      rows={3} 
                      value={profile.bio || ''}
                      onChange={e => setProfile({...profile, bio: e.target.value})}
                      placeholder="Tell customers about your experience and services..."
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm resize-none transition" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving || uploading}
                  className="flex-1 sm:flex-none px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 active:scale-[0.98] transition-all disabled:opacity-50 text-sm shadow-sm shadow-green-200">
                  {saving
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving…
                      </span>
                    : isNewUser ? '✓ Save & Go to Dashboard' : 'Save Changes'}
                </button>
                {!isNewUser && (
                  <Link href="/provider/dashboard"
                    className="px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition text-sm">
                    Cancel
                  </Link>
                )}
              </div>

            </form>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          transition: all 0.15s;
          outline: none;
          background: white;
        }
        .input:focus {
          ring: 2px solid #22c55e;
          border-color: transparent;
          box-shadow: 0 0 0 2px #22c55e;
        }
      `}</style>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}