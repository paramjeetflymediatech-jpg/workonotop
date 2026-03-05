'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminTheme } from '../../layout'

export default function BookingDetailsPage({ params }) {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [toast, setToast] = useState('')
  const [tradespeople, setTradespeople] = useState([])
  const [selectedProvider, setSelectedProvider] = useState('')

  const [commissionPct, setCommissionPct] = useState('')
  const [savingCommission, setSavingCommission] = useState(false)

  const unwrappedParams = React.use(params)
  const bookingId = unwrappedParams.id

  useEffect(() => {
    fetchBooking()
    loadTradespeople()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`)
      const data = await res.json()
      if (data.success) {
        setBooking(data.data)
        setSelectedProvider(data.data.provider_id || '')
        if (data.data.commission_percent != null) {
          setCommissionPct(String(data.data.commission_percent))
        }
      } else {
        notify('error', 'Booking not found')
      }
    } catch {
      notify('error', 'Failed to load booking')
    } finally {
      setLoading(false)
    }
  }

  const loadTradespeople = async () => {
    try {
      const res = await fetch('/api/provider?status=active')
      const data = await res.json()
      if (data.success) setTradespeople(data.data || [])
    } catch {
      console.error('Error loading tradespeople')
    }
  }

  const notify = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(''), 3000)
  }

  const updateBooking = async (body, successMsg) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/bookings?id=${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.success) {
        notify('success', successMsg)
        fetchBooking()
      } else {
        notify('error', data.message || 'Failed to update')
      }
    } catch {
      notify('error', 'Request failed')
    } finally {
      setUpdating(false)
    }
  }

  const saveCommission = async () => {
    const pct = parseFloat(commissionPct)
    if (isNaN(pct) || pct < 0 || pct > 100) {
      notify('error', 'Enter a valid percentage (0–100)')
      return
    }
    setSavingCommission(true)
    try {
      const res = await fetch(`/api/bookings?id=${booking.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commission_percent: pct })
      })
      const data = await res.json()
      if (data.success) {
        notify('success', `Commission set to ${pct}%. Job is now visible to providers.`)
        fetchBooking()
      } else {
        notify('error', data.message || 'Failed to set commission')
      }
    } catch {
      notify('error', 'Request failed')
    } finally {
      setSavingCommission(false)
    }
  }

  // ✅ FIXED: Check commission before assigning provider
  const assignProvider = async () => {
    if (!selectedProvider) {
      notify('error', 'Please select a provider')
      return
    }

    // ✅ Check if commission is set
    if (booking.commission_percent === null || booking.commission_percent === undefined) {
      notify('error', '⚠️ Please set commission first before assigning provider. Provider will only see jobs with commission set.')
      return
    }

    await updateBooking({ provider_id: selectedProvider, status: 'matching' }, 'Provider assigned successfully')
  }

  const basePrice = booking ? parseFloat(booking.service_price) : 0
  const additionalPrice = booking ? parseFloat(booking.additional_price || 0) : 0
  const duration = booking?.service_duration || 60

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ${mins} min` : `${hours} hour${hours > 1 ? 's' : ''}`
  }

  const calculateCommissionBreakdown = () => {
    if (!booking) return null
    const pct = parseFloat(commissionPct)
    if (isNaN(pct) || commissionPct === '') {
      if (booking.commission_percent != null) {
        const savedPct = parseFloat(booking.commission_percent)
        const commissionAmount = basePrice * (savedPct / 100)
        const providerBaseAmount = basePrice - commissionAmount
        return { pct: savedPct, commissionAmount, providerBaseAmount, additionalPrice, totalProviderAmount: providerBaseAmount, isLive: true }
      }
      return null
    }
    const commissionAmount = basePrice * (pct / 100)
    const providerBaseAmount = basePrice - commissionAmount
    return { pct, commissionAmount, providerBaseAmount, additionalPrice, totalProviderAmount: providerBaseAmount, isLive: false }
  }

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  const formatDateTime = (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400',
    matching: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400',
    confirmed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400',
    awaiting_approval: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
    completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400',
    disputed: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
    cancelled: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400',
  }

  const paymentStatusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    authorized: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    refunded: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  }

  const card = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
  const labelCls = isDarkMode ? 'text-slate-400' : 'text-gray-500'
  const valueCls = isDarkMode ? 'text-white' : 'text-gray-900'
  const breakdown = calculateCommissionBreakdown()
  const commissionSet = booking?.commission_percent != null

  const getStatusLabel = (s) => {
    const labels = {
      in_progress: 'In Progress',
      awaiting_approval: 'Awaiting Approval',
      disputed: 'Disputed',
    }
    return labels[s] || s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Booking not found</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm">Go Back</button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2
          ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}

      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${valueCls}`}>Booking Details</h1>
          <p className={`text-sm font-mono ${labelCls}`}>{booking.booking_number}</p>
        </div>
        <span className={`ml-auto px-3 py-1.5 rounded-full text-xs font-semibold border ${statusColors[booking.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
          {getStatusLabel(booking.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-5">
          <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
            <SectionTitle icon="👤" label="Customer Information" valueCls={valueCls} />
            <Grid2>
              <Field label="Name" value={`${booking.customer_first_name} ${booking.customer_last_name}`} labelCls={labelCls} valueCls={valueCls} />
              <Field label="Email" value={booking.customer_email} labelCls={labelCls} valueCls={valueCls} />
              <Field label="Phone" value={booking.customer_phone || '—'} labelCls={labelCls} valueCls={valueCls} />
              <Field label="User ID" value={booking.user_id || 'Guest'} labelCls={labelCls} valueCls={valueCls} />
            </Grid2>
          </div>

          <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
            <SectionTitle icon="🔧" label="Service & Pricing" valueCls={valueCls} />
            <Grid2>
              <Field label="Service" value={booking.service_name} labelCls={labelCls} valueCls={valueCls} />
              <Field label="Category" value={booking.category_name} labelCls={labelCls} valueCls={valueCls} />
              <Field label="Base Price" value={`$${basePrice.toFixed(2)}`} labelCls={labelCls} valueCls={valueCls} />
              <Field label="Overtime Rate" value={additionalPrice > 0 ? `$${additionalPrice.toFixed(2)}/hr` : 'Not set'} labelCls={labelCls} valueCls={valueCls} />
            </Grid2>
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-lg">⏱️</span>
                <div>
                  <p className={`text-xs ${labelCls}`}>Service Duration</p>
                  <p className={`text-base font-semibold ${valueCls}`}>{formatDuration(duration)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT INFORMATION */}
          <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
            <SectionTitle icon="💳" label="Payment Information" valueCls={valueCls} />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${labelCls}`}>Payment Status</span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${paymentStatusColors[booking.payment_status] || 'bg-gray-100 text-gray-800'}`}>
                  {booking.payment_status?.toUpperCase() || 'PENDING'}
                </span>
              </div>

              {(booking.service_price > 0 || booking.additional_price > 0 || booking.final_provider_amount > 0) && (
                <div className={`rounded-lg p-3 space-y-2 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                  <div className="flex justify-between text-sm">
                    <span className={labelCls}>Service Price</span>
                    <span className={`font-semibold ${valueCls}`}>${parseFloat(booking.service_price || 0).toFixed(2)}</span>
                  </div>
                  {booking.additional_price > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className={labelCls}>Overtime Rate</span>
                      <span className={`font-semibold ${valueCls}`}>${parseFloat(booking.additional_price || 0).toFixed(2)}/hr</span>
                    </div>
                  )}
                  {booking.overtime_hours > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className={labelCls}>Overtime Hours</span>
                      <span className={`font-semibold ${valueCls}`}>{booking.overtime_hours} hrs</span>
                    </div>
                  )}
                  {booking.overtime_earnings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className={labelCls}>Overtime Earnings</span>
                      <span className={`font-semibold ${valueCls}`}>${parseFloat(booking.overtime_earnings).toFixed(2)}</span>
                    </div>
                  )}
                  {booking.final_provider_amount > 0 && (
                    <div className={`flex justify-between text-sm pt-2 mt-2 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                      <span className={`font-semibold ${labelCls}`}>Provider Earns</span>
                      <span className="font-bold text-green-600">${parseFloat(booking.final_provider_amount).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {booking.payment_intent_id && (
                <div>
                  <p className={`text-xs ${labelCls} mb-1`}>Stripe Payment Intent ID</p>
                  <p className={`text-xs font-mono ${valueCls} break-all bg-gray-50 dark:bg-slate-800 p-2 rounded-lg`}>
                    {booking.payment_intent_id}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
            <SectionTitle icon="📅" label="Schedule" valueCls={valueCls} />
            <Grid2>
              <Field label="Date" value={formatDate(booking.job_date)} labelCls={labelCls} valueCls={valueCls} />
              <div>
                <p className={`text-xs mb-1 ${labelCls}`}>Time Slots</p>
                <div className="flex flex-wrap gap-1">
                  {(Array.isArray(booking.job_time_slot) ? booking.job_time_slot : [booking.job_time_slot]).map((s, i) => (
                    <span key={i} className="px-2 py-1 bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400 rounded-lg text-xs font-medium capitalize">{s}</span>
                  ))}
                </div>
              </div>
            </Grid2>
          </div>

          <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
            <SectionTitle icon="📍" label="Location & Access" valueCls={valueCls} />
            <div className="p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 mb-3">
              <p className={`text-sm font-medium ${valueCls}`}>{booking.address_line1}</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '🅿️ Parking', active: booking.parking_access },
                { label: '🛗 Elevator', active: booking.elevator_access },
                { label: '🐕 Pets', active: booking.has_pets },
              ].map(({ label, active }) => (
                <div key={label} className={`p-2 rounded-lg border text-center text-xs
                  ${active
                    ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                    : isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                  {label} {active ? '✓' : '✗'}
                </div>
              ))}
            </div>
          </div>

          {/* JOB DESCRIPTION & NOTES */}
          {(booking.description || booking.special_instructions || booking.additional_notes) && (
            <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
              <SectionTitle icon="📝" label="Job Description & Notes" valueCls={valueCls} />
              {booking.description && (
                <div className="mb-3">
                  <p className={`text-xs mb-1 ${labelCls}`}>Description</p>
                  <p className={`text-sm ${valueCls} leading-relaxed`}>{booking.description}</p>
                </div>
              )}
              {booking.special_instructions && (
                <div className="mb-3">
                  <p className={`text-xs mb-1 ${labelCls}`}>Special Instructions</p>
                  <div className={`p-3 rounded-lg border ${isDarkMode ? 'bg-amber-900/20 border-amber-800 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'} text-sm`}>
                    {booking.special_instructions}
                  </div>
                </div>
              )}
              {booking.additional_notes && (
                <div>
                  <p className={`text-xs mb-1 ${labelCls}`}>Additional Notes</p>
                  <p className={`text-sm ${valueCls} leading-relaxed`}>{booking.additional_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* BEFORE / AFTER PHOTOS */}
          {(booking.before_photos?.length > 0 || booking.after_photos?.length > 0) && (
            <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
              <SectionTitle icon="📷" label="Before & After Photos" valueCls={valueCls} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* BEFORE */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
                    <p className={`text-xs font-bold uppercase tracking-wider ${labelCls}`}>Before ({booking.before_photos?.length || 0})</p>
                  </div>
                  {booking.before_photos?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {booking.before_photos.map((p, i) => (
                        <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                          className="block aspect-square rounded-xl overflow-hidden border border-orange-200 dark:border-orange-800 hover:opacity-90 transition shadow-sm">
                          <img src={p.url} alt={`Before ${i + 1}`} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className={`flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-gray-200 text-gray-400'} text-xs`}>
                      No before photos yet
                    </div>
                  )}
                </div>
                {/* AFTER */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                    <p className={`text-xs font-bold uppercase tracking-wider ${labelCls}`}>After ({booking.after_photos?.length || 0})</p>
                  </div>
                  {booking.after_photos?.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {booking.after_photos.map((p, i) => (
                        <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                          className="block aspect-square rounded-xl overflow-hidden border border-green-200 dark:border-green-800 hover:opacity-90 transition shadow-sm">
                          <img src={p.url} alt={`After ${i + 1}`} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className={`flex flex-col items-center justify-center h-24 rounded-xl border-2 border-dashed ${isDarkMode ? 'border-slate-700 text-slate-500' : 'border-gray-200 text-gray-400'} text-xs`}>
                      No after photos yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CUSTOMER UPLOAD PHOTOS */}
          {booking.photos?.length > 0 && (
            <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
              <SectionTitle icon="🖼️" label={`Customer Photos (${booking.photos.length})`} valueCls={valueCls} />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {booking.photos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="block aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 hover:opacity-90 transition shadow-sm">
                    <img src={url} alt={`Customer photo ${i + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-5">

          {/* COMMISSION CARD */}
          <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">💰</span>
              <h2 className={`text-base font-semibold ${valueCls}`}>Commission</h2>
              {commissionSet && (
                <span className="ml-auto flex items-center gap-1 text-xs text-green-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Live
                </span>
              )}
            </div>

            {commissionSet ? (
              <div>
                <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-sm ${labelCls}`}>Commission Rate</span>
                    <span className="text-2xl font-bold text-green-600">{booking.commission_percent}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className={`text-xs mb-4 ${labelCls}`}>
                  Commission is on base price only. Overtime is added at final billing.
                </p>
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <input
                      type="number" min="0" max="100" step="0.5"
                      value={commissionPct}
                      onChange={(e) => setCommissionPct(e.target.value)}
                      placeholder="e.g. 30"
                      className={`w-full pl-3 pr-8 py-2.5 rounded-xl border text-sm
                        ${isDarkMode ? 'bg-slate-800 text-white border-slate-700 focus:border-teal-500' : 'bg-white text-gray-900 border-gray-300 focus:border-teal-500'}
                        focus:ring-2 focus:ring-teal-200 outline-none transition`}
                    />
                    <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium ${labelCls}`}>%</span>
                  </div>
                  <button
                    onClick={saveCommission}
                    disabled={savingCommission || commissionPct === ''}
                    className="px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-50"
                  >
                    {savingCommission ? '…' : 'Save'}
                  </button>
                </div>

                {/* ✅ WARNING MESSAGE - Commission not set */}
                {!commissionSet && (
                  <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600 text-lg">⚠️</span>
                      <div>
                        <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                          Commission not set
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
                          Job is hidden from providers. Set commission first to make it visible.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Provider Assignment */}
          <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">👷</span>
              <h2 className={`text-base font-semibold ${valueCls}`}>Provider Assignment</h2>
            </div>
            {booking.provider_name ? (
              <>
                <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-xl border border-teal-200 dark:border-teal-800 mb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold">
                      {booking.provider_name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${valueCls}`}>{booking.provider_name}</p>
                      <p className={`text-xs mt-0.5 ${labelCls}`}>{booking.accepted_at ? `Accepted ${formatDateTime(booking.accepted_at)}` : 'Manually assigned'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5 mt-2 pt-2 border-t border-teal-200 dark:border-teal-800">
                    {booking.provider_email && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs">📧</span>
                        <span className={`text-xs ${labelCls} truncate`}>{booking.provider_email}</span>
                      </div>
                    )}
                    {booking.provider_phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs">📱</span>
                        <span className={`text-xs ${labelCls}`}>{booking.provider_phone}</span>
                      </div>
                    )}
                    {booking.provider_rating > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs">⭐</span>
                        <span className={`text-xs font-semibold ${valueCls}`}>{parseFloat(booking.provider_rating).toFixed(1)} rating</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className={`text-xs ${labelCls}`}>
                  Providers can self-assign once commission is set, or manually assign below.
                </p>

                {/* ✅ Commission warning in provider assignment card */}
                {!commissionSet && (
                  <div className="p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <span className="text-amber-600">⚠️</span>
                      Set commission first before assigning provider
                    </p>
                  </div>
                )}

                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  disabled={updating}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm
                    ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-white text-gray-900 border-gray-300'}
                    focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition`}
                >
                  <option value="">Select a provider</option>
                  {tradespeople.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <button
                  onClick={assignProvider}
                  disabled={!selectedProvider || updating || !commissionSet}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold transition 
                    ${!commissionSet
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                >
                  {!commissionSet ? 'Set Commission First' : (updating ? 'Assigning…' : 'Manually Assign Provider')}
                </button>
              </div>
            )}
          </div>

          {/* Status Timeline */}
          <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
            <h2 className={`text-base font-semibold mb-4 ${valueCls}`}>Status Timeline</h2>
            {booking.status_history?.length > 0 ? (
              <div className="space-y-3">
                {booking.status_history.map((item, i) => (
                  <div key={i} className="relative pl-4 pb-3 border-l-2 border-teal-500 last:pb-0">
                    <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-teal-500" />
                    <p className={`text-xs font-semibold capitalize ${valueCls}`}>{getStatusLabel(item.status)}</p>
                    <p className={`text-[10px] mt-0.5 ${labelCls}`}>{new Date(item.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${labelCls}`}>No history yet</p>
            )}
          </div>

          {/* Update Status */}
          <div className={`rounded-xl shadow-sm border p-5 ${card}`}>
            <h2 className={`text-base font-semibold mb-3 ${valueCls}`}>Update Status</h2>
            <div className="flex flex-wrap gap-2">
              {['pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((s) => (
                <button
                  key={s}
                  onClick={() => updateBooking({ status: s }, `Status → ${getStatusLabel(s)}`)}
                  disabled={booking.status === s || updating}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                    ${booking.status === s
                      ? 'bg-teal-500 text-white cursor-default'
                      : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    ${updating ? 'opacity-50 cursor-wait' : ''}`}
                >
                  {getStatusLabel(s)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ icon, label, valueCls }) {
  return (
    <h2 className={`text-base font-semibold mb-4 flex items-center gap-2 ${valueCls}`}>
      <span>{icon}</span> {label}
    </h2>
  )
}

function Grid2({ children }) {
  return <div className="grid grid-cols-2 gap-4">{children}</div>
}

function Field({ label, value, labelCls, valueCls }) {
  return (
    <div>
      <p className={`text-xs mb-0.5 ${labelCls}`}>{label}</p>
      <p className={`text-sm font-medium ${valueCls}`}>{value}</p>
    </div>
  )
}