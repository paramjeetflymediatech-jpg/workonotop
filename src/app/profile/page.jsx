'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from 'src/context/AuthContext'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import {
  User, Mail, Phone, Calendar,
  Edit2, Save, X, CheckCircle, AlertCircle, Clock, Camera
} from 'lucide-react'

function Toast({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [message, onClose])
  if (!message) return null
  return (
    <div className={`fixed top-4 right-4 left-4 sm:left-auto z-50 px-4 py-3 rounded-2xl shadow-2xl text-white text-sm flex items-center gap-2
      ${type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'}`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
    </div>
  )
}

function FieldRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <p className="text-sm font-semibold text-gray-800 break-words">{value || '—'}</p>
      </div>
    </div>
  )
}

function InputField({ label, required, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 text-sm outline-none
          focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/10 transition placeholder:text-gray-300"
        {...props}
      />
    </div>
  )
}

export default function CustomerProfilePage() {
  const { user, login } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef(null)

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [toast, setToast]     = useState({ message: '', type: '' })
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const [form, setForm] = useState({
    first_name: '', last_name: '', phone: '', hear_about: '', receive_offers: false,
  })

  const notify = (message, type = 'success') => setToast({ message, type })

  useEffect(() => {
    if (!user) { router.push('/'); return }
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true); setError('')
      const res  = await fetch(`/api/customers/${user.id}`)
      const data = await res.json()
      if (data.success) {
        setProfile(data.data)
        setForm({
          first_name:     data.data.first_name    || '',
          last_name:      data.data.last_name     || '',
          phone:          data.data.phone         || '',
          hear_about:     data.data.hear_about    || '',
          receive_offers: !!data.data.receive_offers,
        })
      } else {
        setError(data.message || 'Failed to load profile')
      }
    } catch { setError('Failed to load profile') }
    finally  { setLoading(false) }
  }

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      notify('First and last name are required', 'error'); return
    }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('first_name', form.first_name)
      formData.append('last_name', form.last_name)
      formData.append('phone', form.phone)
      formData.append('hear_about', form.hear_about)
      formData.append('receive_offers', form.receive_offers)
      if (selectedImage) {
        formData.append('profile_image', selectedImage)
      }

      const res  = await fetch(`/api/customers/${user.id}`, {
        method: 'PUT',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setProfile(prev => ({ ...prev, ...data.data }))
        login({ ...user, 
          first_name: data.data.first_name, 
          last_name: data.data.last_name,
          image_url: data.data.image_url 
        })
        setEditing(false)
        setSelectedImage(null)
        setImagePreview(null)
        notify('Profile updated successfully')
      } else {
        notify(data.message || 'Failed to update', 'error')
      }
    } catch { notify('Something went wrong', 'error') }
    finally  { setSaving(false) }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        notify('Image size should be less than 5MB', 'error')
        return
      }
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleCancel = () => {
    setForm({
      first_name:     profile.first_name    || '',
      last_name:      profile.last_name     || '',
      phone:          profile.phone         || '',
      hear_about:     profile.hear_about    || '',
      receive_offers: !!profile.receive_offers,
    })
    setSelectedImage(null)
    setImagePreview(null)
    setEditing(false)
  }

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'N/A'

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
          <h2 className="text-lg font-bold text-gray-900 mb-2">Could not load profile</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button onClick={loadProfile}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition w-full">
            Try Again
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Header />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />

      <div className="min-h-screen bg-gray-50/80">

        {/* Hero Banner */}
        <div className="bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 pt-8 pb-14 px-4">
          <div className="max-w-2xl mx-auto flex items-center gap-4">
            <div className="relative group/avatar">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
              <div className="w-16 h-16 sm:w-20 sm:w-20 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-xl sm:text-2xl font-black flex-shrink-0 shadow-lg overflow-hidden relative">
                {(imagePreview || profile.image_url) ? (
                  <img src={imagePreview || profile.image_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{profile.first_name?.[0]?.toUpperCase()}{profile.last_name?.[0]?.toUpperCase()}</span>
                )}
                
                {editing && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-teal-100 text-xs sm:text-sm mt-0.5 truncate">{profile.email}</p>
              <p className="text-teal-200/80 text-xs mt-1 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span>Member since {fmtDate(profile.created_at)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="max-w-2xl mx-auto px-4 -mt-5 pb-10">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Card Header — stacks on very small screens */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <h2 className="text-sm font-bold text-gray-900">Personal Information</h2>
              </div>

              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition flex-shrink-0"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={handleCancel}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition">
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-1 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 px-3 py-1.5 rounded-lg disabled:opacity-60 transition">
                    <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {/* Card Body */}
            <div className="px-4 sm:px-6 py-4">
              {!editing ? (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                    <FieldRow icon={User}  label="First Name" value={profile.first_name} />
                    <FieldRow icon={User}  label="Last Name"  value={profile.last_name}  />
                  </div>
                  <FieldRow icon={Mail}  label="Email Address" value={profile.email} />
                  <FieldRow icon={Phone} label="Phone Number"  value={profile.phone} />
                  {profile.hear_about && (
                    <FieldRow icon={User} label="How they heard about us" value={profile.hear_about} />
                  )}
                  <div className={`mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold
                    ${profile.receive_offers
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${profile.receive_offers ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                      {profile.receive_offers && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    {profile.receive_offers ? 'Subscribed to offers & news' : 'Not subscribed to offers'}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="First Name" required type="text" value={form.first_name}
                      onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
                    <InputField label="Last Name" required type="text" value={form.last_name}
                      onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
                    <input type="email" value={profile.email} disabled
                      className="w-full border border-gray-200 bg-gray-100 rounded-xl px-3.5 py-2.5 text-sm text-gray-400 cursor-not-allowed" />
                    <p className="text-xs text-gray-400 mt-1">Email address cannot be changed</p>
                  </div>
                  <InputField label="Phone Number" type="tel" value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+1 (403) 000-0000" />
                  <InputField label="How did you hear about us?" type="text" value={form.hear_about}
                    onChange={e => setForm(p => ({ ...p, hear_about: e.target.value }))}
                    placeholder="e.g. Instagram, from a friend…" />
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input type="checkbox" checked={form.receive_offers}
                      onChange={e => setForm(p => ({ ...p, receive_offers: e.target.checked }))}
                      className="w-4 h-4 border-gray-300 rounded accent-teal-600 flex-shrink-0" />
                    <span className="text-sm text-gray-600 font-medium">Receive news and special offers</span>
                  </label>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-4 bg-gray-50/60 border-t border-gray-100">
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  Joined: <span className="font-semibold text-gray-700 ml-1">{fmtDate(profile.created_at)}</span>
                </div>
                {profile.stats?.last_booking && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    Last booking: <span className="font-semibold text-gray-700 ml-1">{fmtDate(profile.stats.last_booking)}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}