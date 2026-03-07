'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, Clock, Eye, MessageSquare, RefreshCw, Filter, X } from 'lucide-react'
import { useAdminTheme } from '../layout'

const STATUS_CONFIG = {
  open: { 
    label: 'Open', 
    light: { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
    dark: { color: 'bg-red-500/20 text-red-400 border-red-500/30', dot: 'bg-red-400' }
  },
  reviewing: { 
    label: 'Reviewing', 
    light: { color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    dark: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' }
  },
  resolved: { 
    label: 'Resolved', 
    light: { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
    dark: { color: 'bg-green-500/20 text-green-400 border-green-500/30', dot: 'bg-green-400' }
  },
  closed: { 
    label: 'Closed', 
    light: { color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
    dark: { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', dot: 'bg-gray-400' }
  },
}

export default function AdminDisputesPage() {
  const { isDarkMode } = useAdminTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/disputes')
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch (e) {
      showToast('error', 'Failed to load disputes')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  const handleUpdate = async () => {
    if (!newStatus) return showToast('error', 'Please select a status')
    setSaving(true)
    try {
      const res = await fetch('/api/admin/disputes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispute_id: selected.id,
          status: newStatus,
          admin_notes: adminNotes
        })
      })
      const json = await res.json()
      if (json.success) {
        showToast('success', json.message)
        setSelected(null)
        setAdminNotes('')
        setNewStatus('')
        loadData()
      } else {
        showToast('error', json.message)
      }
    } catch (e) {
      showToast('error', 'Failed to update dispute')
    } finally {
      setSaving(false)
    }
  }

  const openModal = (d) => {
    setSelected(d)
    setAdminNotes(d.admin_notes || '')
    setNewStatus(d.status)
  }

  const fmt = (n) => `$${parseFloat(n || 0).toFixed(2)}`
  const fmtDate = (d) => d ? new Date(d).toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  }) : '—'

  const filtered = (data?.disputes || []).filter(d => filter === 'all' || d.status === filter)

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-slate-950' : 'bg-gray-50'
      }`}>
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const s = data?.summary || {}

  return (
    <div className={`min-h-screen ${
      isDarkMode ? 'bg-slate-950' : 'bg-gray-50'
    }`}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl text-white text-sm animate-slide-down
            ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Dispute Management
            </h1>
            <p className={`text-sm mt-1 ${
              isDarkMode ? 'text-slate-400' : 'text-gray-500'
            }`}>
              Review and resolve customer disputes
            </p>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`sm:hidden p-2 rounded-lg ${
              isDarkMode 
                ? 'bg-slate-800 text-white' 
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>

          {/* Desktop Refresh Button */}
          <button 
            onClick={loadData} 
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${
              isDarkMode 
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" /> 
            Refresh
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className={`sm:hidden mb-4 p-4 rounded-xl ${
            isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-200'
          }`}>
            <button 
              onClick={() => {
                loadData()
                setMobileMenuOpen(false)
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm w-full ${
                isDarkMode 
                  ? 'bg-slate-800 text-slate-300' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <RefreshCw className="w-4 h-4" /> 
              Refresh
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: 'Open', value: s.open_count, icon: '🚨', 
              light: 'bg-red-50 border-red-200', dark: 'bg-red-500/10 border-red-500/20', textLight: 'text-red-600', textDark: 'text-red-400' },
            { label: 'Reviewing', value: s.reviewing_count, icon: '🔍',
              light: 'bg-amber-50 border-amber-200', dark: 'bg-amber-500/10 border-amber-500/20', textLight: 'text-amber-600', textDark: 'text-amber-400' },
            { label: 'Resolved', value: s.resolved_count, icon: '✅',
              light: 'bg-green-50 border-green-200', dark: 'bg-green-500/10 border-green-500/20', textLight: 'text-green-600', textDark: 'text-green-400' },
            { label: 'Closed', value: s.closed_count, icon: '🔒',
              light: 'bg-gray-50 border-gray-200', dark: 'bg-gray-500/10 border-gray-500/20', textLight: 'text-gray-600', textDark: 'text-gray-400' },
          ].map(stat => (
            <div 
              key={stat.label} 
              className={`rounded-xl sm:rounded-2xl p-3 sm:p-4 border ${
                isDarkMode ? stat.dark : stat.light
              }`}
            >
              <div className="text-xl sm:text-2xl mb-1">{stat.icon}</div>
              <div className={`text-xl sm:text-2xl font-bold ${
                isDarkMode ? stat.textDark : stat.textLight
              }`}>
                {stat.value || 0}
              </div>
              <div className={`text-xs mt-1 ${
                isDarkMode ? 'text-slate-400' : 'text-gray-500'
              }`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Filter Tabs - Horizontal Scroll on Mobile */}
        <div className="mb-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-2 min-w-max sm:min-w-0 border-b pb-2 sm:pb-0 sm:border-b-0">
            {['all', 'open', 'reviewing', 'resolved', 'closed'].map(f => {
              const config = STATUS_CONFIG[f]
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`
                    px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium capitalize transition-all rounded-lg sm:rounded-none
                    ${filter === f 
                      ? isDarkMode
                        ? 'bg-red-500/20 text-red-400 sm:bg-transparent sm:border-b-2 sm:border-red-500 sm:text-red-400'
                        : 'bg-red-500 text-white sm:bg-transparent sm:border-b-2 sm:border-red-500 sm:text-red-600'
                      : isDarkMode
                        ? 'text-slate-400 hover:text-slate-300 sm:hover:border-b-2 sm:hover:border-slate-600'
                        : 'text-gray-500 hover:text-gray-700 sm:hover:border-b-2 sm:hover:border-gray-300'
                    }
                  `}
                >
                  <span className="flex items-center gap-1.5">
                    {f === 'all' ? 'All' : config?.label}
                    {f === 'open' && s.open_count > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                        isDarkMode
                          ? 'bg-red-500/20 text-red-400'
                          : filter === f && f !== 'all'
                            ? 'bg-white text-red-600'
                            : 'bg-red-500 text-white'
                      }`}>
                        {s.open_count}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className={`rounded-xl p-8 text-center border ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
            }`}>
              <CheckCircle className={`w-12 h-12 mx-auto mb-3 ${
                isDarkMode ? 'text-slate-700' : 'text-gray-300'
              }`} />
              <p className={isDarkMode ? 'text-slate-400' : 'text-gray-400'}>
                No disputes found
              </p>
            </div>
          ) : (
            filtered.map(d => {
              const cfg = STATUS_CONFIG[d.status] || STATUS_CONFIG.open
              const statusStyle = isDarkMode ? cfg.dark : cfg.light
              
              return (
                <div
                  key={d.id}
                  className={`rounded-xl border overflow-hidden ${
                    isDarkMode 
                      ? 'bg-slate-900 border-slate-800' 
                      : 'bg-white border-gray-200'
                  } ${d.status === 'open' ? (isDarkMode ? 'ring-1 ring-red-500/20' : 'ring-1 ring-red-200') : ''}`}
                >
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {d.booking_number}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1 border ${statusStyle.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                            {cfg.label}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          {d.service_name}
                        </p>
                      </div>
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {fmt(d.service_price)}
                      </span>
                    </div>

                    {/* Customer & Provider */}
                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Customer</p>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {d.customer_name}
                        </p>
                        <p className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          {d.customer_email}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Provider</p>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {d.provider_name || '—'}
                        </p>
                      </div>
                    </div>

                    {/* Reason Preview */}
                    <div className={`mb-3 p-2 rounded-lg text-xs ${
                      isDarkMode ? 'bg-slate-800' : 'bg-gray-50'
                    }`}>
                      <p className={`line-clamp-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                        {d.reason}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                        {fmtDate(d.created_at)}
                      </span>
                      <button
                        onClick={() => openModal(d)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium ${
                          isDarkMode
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-red-500 text-white hover:bg-red-600'
                        }`}
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block">
          {filtered.length === 0 ? (
            <div className={`rounded-2xl border p-12 text-center ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
            }`}>
              <CheckCircle className={`w-12 h-12 mx-auto mb-3 ${
                isDarkMode ? 'text-slate-700' : 'text-gray-300'
              }`} />
              <p className={isDarkMode ? 'text-slate-400' : 'text-gray-400'}>
                No disputes found
              </p>
            </div>
          ) : (
            <div className={`rounded-2xl border overflow-hidden ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className={`border-b ${
                    isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <tr>
                      <th className={`text-left px-4 py-3 font-semibold ${
                        isDarkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>Booking</th>
                      <th className={`text-left px-4 py-3 font-semibold ${
                        isDarkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>Customer</th>
                      <th className={`text-left px-4 py-3 font-semibold ${
                        isDarkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>Provider</th>
                      <th className={`text-left px-4 py-3 font-semibold ${
                        isDarkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>Reason</th>
                      <th className={`text-left px-4 py-3 font-semibold ${
                        isDarkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>Status</th>
                      <th className={`text-left px-4 py-3 font-semibold ${
                        isDarkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>Raised</th>
                      <th className={`text-left px-4 py-3 font-semibold ${
                        isDarkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${
                    isDarkMode ? 'divide-slate-800' : 'divide-gray-100'
                  }`}>
                    {filtered.map(d => {
                      const cfg = STATUS_CONFIG[d.status] || STATUS_CONFIG.open
                      const statusStyle = isDarkMode ? cfg.dark : cfg.light
                      
                      return (
                        <tr 
                          key={d.id} 
                          className={`${
                            isDarkMode 
                              ? 'hover:bg-slate-800/50' 
                              : 'hover:bg-gray-50'
                          } ${d.status === 'open' ? (isDarkMode ? 'bg-red-500/5' : 'bg-red-50/30') : ''}`}
                        >
                          <td className="px-4 py-3">
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {d.booking_number}
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                              {d.service_name}
                            </p>
                            <p className={`text-xs font-semibold ${
                              isDarkMode ? 'text-green-400' : 'text-green-600'
                            }`}>
                              {fmt(d.service_price)}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {d.customer_name}
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                              {d.customer_email}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {d.provider_name || '—'}
                            </p>
                            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                              {d.provider_email || ''}
                            </p>
                          </td>
                          <td className="px-4 py-3 max-w-xs">
                            <p className={`text-xs line-clamp-2 ${
                              isDarkMode ? 'text-slate-300' : 'text-gray-700'
                            }`}>
                              {d.reason}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusStyle.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`} />
                              {cfg.label}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-xs whitespace-nowrap ${
                            isDarkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>
                            {fmtDate(d.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => openModal(d)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                isDarkMode
                                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                  : 'bg-red-500 text-white hover:bg-red-600'
                              }`}
                            >
                              <Eye className="w-3 h-3" />
                              Review
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Review Modal - Fully Responsive with Dark Mode */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div 
              className="absolute inset-0 bg-black/50" 
              onClick={() => setSelected(null)}
            />
            
            <div className={`relative rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${
              isDarkMode ? 'bg-slate-900' : 'bg-white'
            }`}>
              
              {/* Modal Header */}
              <div className={`sticky top-0 z-10 p-5 border-b ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-red-600 to-orange-600' 
                  : 'bg-gradient-to-r from-red-600 to-orange-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-white font-bold text-lg">⚠️ Dispute Review</h2>
                    <p className="text-red-100 text-sm">Booking #{selected.booking_number}</p>
                  </div>
                  <button 
                    onClick={() => setSelected(null)}
                    className="text-white hover:opacity-70 p-1"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-5 space-y-4">
                
                {/* Booking Info */}
                <div className={`rounded-xl p-4 text-sm space-y-2 ${
                  isDarkMode ? 'bg-slate-800' : 'bg-gray-50'
                }`}>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>Service:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selected.service_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>Amount at stake:</span>
                    <span className={`font-bold ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {fmt(selected.authorized_amount || selected.service_price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>Customer:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selected.customer_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>Provider:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selected.provider_name || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>Raised:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {fmtDate(selected.created_at)}
                    </span>
                  </div>
                </div>

                {/* Dispute Reason */}
                <div className={`border-l-4 border-l-red-500 rounded-xl p-4 ${
                  isDarkMode 
                    ? 'bg-red-500/10 border-red-500/20' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${
                    isDarkMode ? 'text-red-400' : 'text-red-700'
                  }`}>
                    Customer&apos;s Dispute Reason
                  </p>
                  <p className={`text-sm leading-relaxed break-word break-all ${
                    isDarkMode ? 'text-red-300' : 'text-red-800'
                  }`}>
                    {selected.reason}
                  </p>
                </div>

                {/* Previous Admin Notes */}
                {selected.admin_notes && (
                  <div className={`border-l-4 border-l-blue-500 rounded-xl p-4 ${
                    isDarkMode 
                      ? 'bg-blue-500/10 border-blue-500/20' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <p className={`text-xs font-bold uppercase tracking-wide mb-2 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-700'
                    }`}>
                      Previous Admin Notes
                    </p>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-800'
                    }`}>
                      {selected.admin_notes}
                    </p>
                  </div>
                )}

                {/* Update Status */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    Update Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                      const statusStyle = isDarkMode ? cfg.dark : cfg.light
                      return (
                        <button
                          key={key}
                          onClick={() => setNewStatus(key)}
                          className={`
                            px-3 py-2 rounded-xl text-xs font-semibold border transition-all
                            ${newStatus === key 
                              ? `${statusStyle.color} ring-2 ring-offset-2 ${isDarkMode ? 'ring-offset-slate-900' : 'ring-offset-white'} ring-current` 
                              : isDarkMode
                                ? 'border-slate-700 text-slate-400 hover:border-slate-600'
                                : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }
                          `}
                        >
                          {cfg.label}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Admin Notes Input */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 flex items-center gap-1 ${
                    isDarkMode ? 'text-slate-300' : 'text-gray-700'
                  }`}>
                    <MessageSquare className="w-4 h-4" />
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    placeholder="Add internal notes about your decision..."
                    className={`w-full border rounded-xl p-3 text-sm outline-none resize-none transition-colors ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-slate-600' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                    }`}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleUpdate}
                    disabled={saving || !newStatus}
                    className={`
                      flex-1 py-3 rounded-xl font-bold text-sm transition-all
                      ${saving || !newStatus ? 'opacity-50 cursor-not-allowed' : ''}
                      ${isDarkMode
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-red-500 text-white hover:bg-red-600'
                      }
                    `}
                  >
                    {saving ? 'Saving...' : 'Save Update'}
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${
                      isDarkMode
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cancel
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Pagination or Load More for Mobile */}
        {filtered.length > 0 && (
          <div className="mt-6 flex justify-center sm:hidden">
            <button className={`px-6 py-2 rounded-lg text-sm font-medium ${
              isDarkMode
                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}>
              Load More
            </button>
          </div>
        )}

      </div>

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}