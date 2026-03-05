'use client'

import { useState, useEffect } from 'react'
import { useAdminTheme } from '../layout'
import { Download, Clock, CheckCircle, Users, Search, Calendar, DollarSign } from 'lucide-react'

export default function AdminPayouts() {
  const { isDarkMode } = useAdminTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetch('/api/admin/payouts')
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const formatMoney = (amt) => `£${parseFloat(amt || 0).toFixed(2)}`
  const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '—'

  const filteredPayouts = data?.payouts?.filter(p => {
    const matchesSearch = p.provider_name?.toLowerCase().includes(search.toLowerCase()) ||
                         p.booking_number?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 ">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <h1 className="text-2xl font-bold mb-6 dark:text-white">Payouts</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-5 border">
            <Download className="w-5 h-5 text-blue-600 mb-2" />
            <p className="text-xs text-gray-500">Total Payouts</p>
            <p className="text-2xl font-bold">{data?.summary?.total_payouts || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border">
            <Clock className="w-5 h-5 text-amber-600 mb-2" />
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-2xl font-bold">{formatMoney(data?.summary?.total_pending_amount)}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border">
            <CheckCircle className="w-5 h-5 text-emerald-600 mb-2" />
            <p className="text-xs text-gray-500">Paid</p>
            <p className="text-2xl font-bold">{formatMoney(data?.summary?.total_paid_amount)}</p>
          </div>
          <div className="bg-white rounded-xl p-5 border">
            <Users className="w-5 h-5 text-purple-600 mb-2" />
            <p className="text-xs text-gray-500">Active Providers</p>
            <p className="text-2xl font-bold">{data?.providers?.length || 0}</p>
          </div>
        </div>

        {/* Providers Table */}
        <div className="bg-white rounded-xl border mb-6">
          <div className="px-5 py-4 border-b">
            <h2 className="font-semibold">Provider Balances</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs">Provider</th>
                  <th className="px-5 py-3 text-left text-xs">Available</th>
                  <th className="px-5 py-3 text-left text-xs">Pending</th>
                  <th className="px-5 py-3 text-left text-xs">Total Earned</th>
                  <th className="px-5 py-3 text-left text-xs">Stripe</th>
                </tr>
              </thead>
              <tbody>
                {data?.providers?.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="px-5 py-4">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.email}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-emerald-600">{formatMoney(p.available_balance)}</td>
                    <td className="px-5 py-4 font-semibold text-amber-600">{formatMoney(p.pending_balance)}</td>
                    <td className="px-5 py-4 font-semibold">{formatMoney(p.total_earnings)}</td>
                    <td className="px-5 py-4">
                      {p.stripe_onboarding === 'complete' ? (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs">✅ Connected</span>
                      ) : (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">⚠️ Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search provider or booking..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-xl"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-xl"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Payouts Table */}
        <div className="bg-white rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs">Date</th>
                  <th className="px-5 py-3 text-left text-xs">Provider</th>
                  <th className="px-5 py-3 text-left text-xs">Booking</th>
                  <th className="px-5 py-3 text-left text-xs">Amount</th>
                  <th className="px-5 py-3 text-left text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.length > 0 ? (
                  filteredPayouts.map(p => (
                    <tr key={p.id} className="border-t">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{formatDate(p.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium">{p.provider_name}</p>
                        <p className="text-xs text-gray-400">{p.provider_email}</p>
                      </td>
                      <td className="px-5 py-4">
                        {p.booking_number ? (
                          <span className="font-mono text-xs">#{p.booking_number}</span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-teal-600">{formatMoney(p.amount)}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          p.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                          p.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          p.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center text-gray-400">
                      No payouts found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}