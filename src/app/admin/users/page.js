'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminTheme } from '../layout'

const PAGE_SIZE = 8

function Pagination({ total, page, setPage }) {
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="flex items-center justify-between mt-4 px-2">
      <p className="text-xs text-gray-500 dark:text-slate-400">
        {total === 0
          ? 'No results'
          : totalPages <= 1
            ? `${total} total`
            : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total} total`}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            ‹
          </button>
          {pages.map((p, i) => (
            p === '...'
              ? <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
              : <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                    page === p
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            ›
          </button>
        </div>
      )}
    </div>
  )
}

export default function Users() {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [activeTab, setActiveTab] = useState('customers')
  const [customers, setCustomers] = useState([])
  const [admins, setAdmins] = useState([])
  const [providers, setProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [userBookings, setUserBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [providerFilter, setProviderFilter] = useState('all')
  const [showSuccessMessage, setShowSuccessMessage] = useState('')
  const [showErrorMessage, setShowErrorMessage] = useState('')

  // Pagination state
  const [customerPage, setCustomerPage] = useState(1)
  const [adminPage, setAdminPage] = useState(1)
  const [providerPage, setProviderPage] = useState(1)

  const [selectedProvider, setSelectedProvider] = useState(null)
  const [isProviderDetailsOpen, setIsProviderDetailsOpen] = useState(false)
  const [providerJobs, setProviderJobs] = useState([])
  const [providerStats, setProviderStats] = useState({
    totalJobs: 0, completedJobs: 0, pendingJobs: 0, cancelledJobs: 0,
    totalEarnings: 0, avgRating: 0, totalHoursWorked: 0, completionRate: 0,
    topServices: [], monthlyEarnings: []
  })

  useEffect(() => {
    checkAuth()
    loadAllUsers()
  }, [])

  // Reset pages on search
  useEffect(() => {
    setCustomerPage(1)
    setAdminPage(1)
    setProviderPage(1)
  }, [searchTerm, providerFilter])

  const checkAuth = () => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) router.push('/')
  }

  const showMessage = (type, message) => {
    if (type === 'success') {
      setShowSuccessMessage(message)
      setTimeout(() => setShowSuccessMessage(''), 3000)
    } else {
      setShowErrorMessage(message)
      setTimeout(() => setShowErrorMessage(''), 3000)
    }
  }

  const loadAllUsers = async () => {
    setLoading(true)
    try {
      const [usersRes, providersRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/provider')
      ])
      const usersData = await usersRes.json()
      if (usersData.success) {
        const all = usersData.data || []
        setCustomers(all.filter(u => u.role !== 'admin'))
        setAdmins(all.filter(u => u.role === 'admin'))
      }
      if (providersRes.ok) {
        const providersData = await providersRes.json()
        if (providersData.success) setProviders(providersData.data || [])
      }
    } catch {
      showMessage('error', 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const loadUserBookings = async (userEmail) => {
    setLoadingBookings(true)
    setUserBookings([])
    try {
      const res = await fetch(`/api/bookings?email=${encodeURIComponent(userEmail)}`)
      const data = await res.json()
      if (data.success) setUserBookings(data.data || [])
    } catch { console.error('Error loading bookings') }
    finally { setLoadingBookings(false) }
  }

  const loadProviderDetails = async (provider) => {
    setSelectedProvider(provider)
    setLoadingBookings(true)
    try {
      const res = await fetch(`/api/admin/provider-jobs?providerId=${provider.id}`)
      const data = await res.json()
      if (data.success) {
        const jobs = data.data || []
        setProviderJobs(jobs)
        setProviderStats(calculateProviderStats(jobs, provider))
      }
    } catch {
      showMessage('error', 'Failed to load provider details')
    } finally {
      setLoadingBookings(false)
      setIsProviderDetailsOpen(true)
    }
  }

  const calculateProviderStats = (jobs, provider) => {
    const completed = jobs.filter(j => j.status === 'completed')
    const pending = jobs.filter(j => ['pending', 'matching', 'confirmed'].includes(j.status))
    const cancelled = jobs.filter(j => j.status === 'cancelled')
    const totalEarnings = completed.reduce((sum, job) => sum + parseFloat(job.final_provider_amount || job.provider_amount || 0), 0)
    const totalMinutes = completed.reduce((sum, job) => sum + (parseInt(job.actual_duration_minutes) || 0), 0)
    const serviceCount = {}
    jobs.forEach(job => { serviceCount[job.service_name] = (serviceCount[job.service_name] || 0) + 1 })
    const topServices = Object.entries(serviceCount).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5)
    const monthlyEarnings = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = month.toLocaleString('default', { month: 'short' })
      const monthEarnings = completed
        .filter(job => {
          const d = new Date(job.end_time || job.created_at)
          return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear()
        })
        .reduce((sum, job) => sum + parseFloat(job.final_provider_amount || job.provider_amount || 0), 0)
      monthlyEarnings.push({ month: monthName, earnings: monthEarnings })
    }
    return {
      totalJobs: jobs.length, completedJobs: completed.length,
      pendingJobs: pending.length, cancelledJobs: cancelled.length,
      totalEarnings, avgRating: parseFloat(provider.rating) || 0,
      totalHoursWorked: Math.round((totalMinutes / 60) * 10) / 10,
      completionRate: jobs.length ? Math.round((completed.length / jobs.length) * 100) : 0,
      topServices, monthlyEarnings
    }
  }

  const deleteCustomer = async (customerId) => {
    if (!confirm('Delete this customer? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/customers?id=${customerId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        showMessage('success', 'Customer deleted successfully')
        loadAllUsers()
        setIsModalOpen(false)
      } else showMessage('error', data.message || 'Failed to delete customer')
    } catch { showMessage('error', 'Failed to delete customer') }
  }

  const updateCustomer = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/customers?id=${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: selectedUser.first_name, last_name: selectedUser.last_name, phone: selectedUser.phone, receive_offers: selectedUser.receive_offers })
      })
      const data = await res.json()
      if (data.success) {
        setIsEditModalOpen(false)
        setSelectedUser(null)
        loadAllUsers()
        showMessage('success', 'Customer updated successfully')
      } else showMessage('error', data.message || 'Failed to update customer')
    } catch { showMessage('error', 'Failed to update customer') }
  }

  const updateProviderStatus = async (providerId, newStatus) => {
    try {
      const res = await fetch(`/api/provider?id=${providerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) { showMessage('success', 'Provider status updated'); loadAllUsers() }
      else showMessage('error', data.message || 'Failed to update status')
    } catch { showMessage('error', 'Failed to update provider status') }
  }

  const search = (items, fields) => {
    if (!searchTerm) return items
    const q = searchTerm.toLowerCase()
    return items.filter(item => fields.some(f => (item[f] || '').toString().toLowerCase().includes(q)))
  }

  const filteredCustomers = search(customers, ['first_name', 'last_name', 'email', 'phone'])
  const filteredAdmins = search(admins, ['first_name', 'last_name', 'email', 'phone'])
  const filteredProviders = search(
    providerFilter === 'all' ? providers : providers.filter(p => p.status === providerFilter),
    ['name', 'email', 'phone', 'city']
  )

  // Paginated slices
  const pagedCustomers = filteredCustomers.slice((customerPage - 1) * PAGE_SIZE, customerPage * PAGE_SIZE)
  const pagedAdmins = filteredAdmins.slice((adminPage - 1) * PAGE_SIZE, adminPage * PAGE_SIZE)
  const pagedProviders = filteredProviders.slice((providerPage - 1) * PAGE_SIZE, providerPage * PAGE_SIZE)

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'
  const formatDateTime = (d) => d ? new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'
  const calculateTotal = (b) => (parseFloat(b.service_price || 0) + parseFloat(b.additional_price || 0)).toFixed(2)
  const formatRating = (r) => { const n = parseFloat(r); return isNaN(n) ? '0.0' : n.toFixed(1) }
  const getRatingValue = (r) => { const n = parseFloat(r); return isNaN(n) ? 0 : Math.round(n) }

  const getStatusColor = (status) => {
    const map = {
      pending: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
      matching: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
      confirmed: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
      in_progress: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
      completed: 'bg-green-500/20 text-green-600 dark:text-green-400',
      cancelled: 'bg-red-500/20 text-red-600 dark:text-red-400',
      active: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30',
      inactive: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30',
      suspended: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30',
    }
    return map[status] || 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
  }

  const card = `rounded-xl shadow-lg border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'}`
  const th = `px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`
  const tdText = `text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`
  const subText = `text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent" />
    </div>
  )

  const tabs = [
    { key: 'customers', label: 'Customers', count: customers.length },
    { key: 'admins', label: 'Admins', count: admins.length },
    { key: 'providers', label: 'Providers', count: providers.length },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">✓ {showSuccessMessage}</div>
      )}
      {showErrorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm">✕ {showErrorMessage}</div>
      )}

      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Users</h1>
        <p className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}>Manage all customers, admins, and providers</p>
      </div>

      <div className="mb-6 flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSearchTerm('') }}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? isDarkMode ? 'text-white border-b-2 border-teal-500' : 'text-teal-600 border-b-2 border-teal-500'
                : isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-600 hover:text-gray-900'
            }`}>
            {tab.label}
            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              activeTab === tab.key
                ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400'
                : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-200 text-gray-600'
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Customers', value: customers.length, color: 'teal' },
            { label: 'With Bookings', value: customers.filter(c => c.booking_count > 0).length, color: 'green' },
            { label: 'Newsletter', value: customers.filter(c => c.receive_offers).length, color: 'purple' },
          ].map(stat => (
            <div key={stat.label} className={`${card} p-5 flex items-center justify-between`}>
              <div>
                <p className={subText}>{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 text-${stat.color}-500`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'providers' && (
        <div className="mb-4 flex flex-wrap gap-2">
          {['all', 'active', 'inactive', 'suspended'].map(s => (
            <button key={s} onClick={() => setProviderFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                providerFilter === s
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                  : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>{s}</button>
          ))}
        </div>
      )}

      <div className="mb-5 relative">
        <input type="text" placeholder="Search by name, email, or phone…"
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 rounded-lg border text-sm ${
            isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
          } focus:outline-none focus:ring-2 focus:ring-teal-500`}
        />
        <svg className={`absolute left-3 top-3.5 w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
      </div>

      {/* ── CUSTOMERS TABLE ── */}
      {activeTab === 'customers' && (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}>
                <tr>
                  <th className={th}>Customer</th>
                  <th className={th}>Contact</th>
                  <th className={th}>Source</th>
                  <th className={th}>Bookings</th>
                  <th className={th}>Newsletter</th>
                  <th className={th}>Joined</th>
                  <th className={`px-6 py-4 text-right text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {pagedCustomers.length > 0 ? pagedCustomers.map(c => (
                  <tr key={c.id} className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}`}
                    onClick={() => { setSelectedUser({ ...c, type: 'customer' }); loadUserBookings(c.email); setIsModalOpen(true) }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isDarkMode ? 'bg-teal-900 text-teal-300' : 'bg-teal-100 text-teal-700'}`}>
                          {`${c.first_name?.charAt(0) || ''}${c.last_name?.charAt(0) || ''}`.toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{c.first_name} {c.last_name}</p>
                          <p className={subText}>#{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={tdText}>{c.email}</p>
                      <p className={subText}>{c.phone || '—'}</p>
                    </td>
                    <td className="px-6 py-4"><p className={subText}>{c.hear_about || '—'}</p></td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.booking_count > 0 ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-gray-500/20 text-gray-500'}`}>
                        {c.booking_count} booking{c.booking_count !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {c.receive_offers ? <span className="text-green-500 text-xs font-medium">✓ Yes</span> : <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>No</span>}
                    </td>
                    <td className="px-6 py-4"><p className={subText}>{formatDate(c.created_at)}</p></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={e => { e.stopPropagation(); setSelectedUser({ ...c, type: 'customer' }); setIsEditModalOpen(true) }}
                          className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button onClick={e => { e.stopPropagation(); deleteCustomer(c.id) }}
                          className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-gray-500 hover:text-red-600'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} className="py-16 text-center">
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{searchTerm ? 'No customers match your search' : 'No customers yet'}</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4">
            <Pagination total={filteredCustomers.length} page={customerPage} setPage={setCustomerPage} />
          </div>
        </div>
      )}

      {/* ── ADMINS TABLE ── */}
      {activeTab === 'admins' && (
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}>
                <tr>
                  <th className={th}>Admin</th>
                  <th className={th}>Email</th>
                  <th className={th}>Phone</th>
                  <th className={th}>Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                {pagedAdmins.length > 0 ? pagedAdmins.map(a => (
                  <tr key={a.id} className={isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                          {`${a.first_name?.charAt(0) || ''}${a.last_name?.charAt(0) || ''}`.toUpperCase()}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{a.first_name} {a.last_name}</p>
                          <span className="text-xs bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">Admin</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><p className={tdText}>{a.email}</p></td>
                    <td className="px-6 py-4"><p className={subText}>{a.phone || '—'}</p></td>
                    <td className="px-6 py-4"><p className={subText}>{formatDate(a.created_at)}</p></td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="py-16 text-center">
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{searchTerm ? 'No admins match your search' : 'No admins found'}</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 pb-4">
            <Pagination total={filteredAdmins.length} page={adminPage} setPage={setAdminPage} />
          </div>
        </div>
      )}

      {/* ── PROVIDERS GRID ── */}
      {activeTab === 'providers' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {pagedProviders.length > 0 ? pagedProviders.map(p => (
              <div key={p.id} className={`${card} p-5 cursor-pointer hover:shadow-xl transition-all`} onClick={() => loadProviderDetails(p)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
                      {p.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
                      <p className={subText}>{p.city || 'No city'}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(p.status)}`}>{p.status}</span>
                </div>
                <div className="space-y-1.5 mb-4">
                  <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{p.email}</p>
                  <p className={subText}>{p.phone || 'No phone'}</p>
                  <p className={subText}>{p.specialty || 'No specialty'}</p>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(star => (
                      <svg key={star} className={`w-3.5 h-3.5 ${star <= getRatingValue(p.rating) ? 'text-yellow-400' : isDarkMode ? 'text-slate-600' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                    <span className={`text-xs ml-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{formatRating(p.rating)}</span>
                  </div>
                  <span className={subText}>{p.total_jobs || 0} jobs</span>
                </div>
                <select value={p.status}
                  onChange={e => { e.stopPropagation(); updateProviderStatus(p.id, e.target.value) }}
                  onClick={e => e.stopPropagation()}
                  className={`w-full px-3 py-2 rounded-lg text-sm border ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-gray-50 text-gray-900 border-gray-200'} focus:outline-none focus:ring-2 focus:ring-teal-500`}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                <button onClick={e => { e.stopPropagation(); loadProviderDetails(p) }}
                  className="mt-3 w-full px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:opacity-90 transition">
                  View Details
                </button>
              </div>
            )) : (
              <div className="col-span-full py-16 text-center">
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{searchTerm ? 'No providers match your search' : 'No providers found'}</p>
              </div>
            )}
          </div>
          <Pagination total={filteredProviders.length} page={providerPage} setPage={setProviderPage} />
        </>
      )}

      {/* ── PROVIDER DETAILS MODAL ── */}
      {isProviderDetailsOpen && selectedProvider && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsProviderDetailsOpen(false)} />
          <div className={`relative rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className={`p-6 border-b sticky top-0 z-10 ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${isDarkMode ? 'bg-teal-900 text-teal-300' : 'bg-teal-100 text-teal-700'}`}>
                    {selectedProvider.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedProvider.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedProvider.status)}`}>{selectedProvider.status}</span>
                      <span className={subText}>Provider ID: #{selectedProvider.id}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsProviderDetailsOpen(false)} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingBookings ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Jobs', value: providerStats.totalJobs, color: isDarkMode ? 'text-white' : 'text-gray-900' },
                      { label: 'Completed', value: providerStats.completedJobs, color: 'text-green-500' },
                      { label: 'Pending', value: providerStats.pendingJobs, color: 'text-yellow-500' },
                      { label: 'Completion Rate', value: `${providerStats.completionRate}%`, color: 'text-teal-500' },
                    ].map(s => (
                      <div key={s.label} className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                        <p className={subText}>{s.label}</p>
                        <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                      <p className={subText}>Total Earnings</p>
                      <p className="text-2xl font-bold mt-1 text-green-500">${providerStats.totalEarnings.toFixed(2)}</p>
                    </div>
                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                      <p className={subText}>Hours Worked</p>
                      <p className="text-2xl font-bold mt-1 text-blue-500">{providerStats.totalHoursWorked} hrs</p>
                    </div>
                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                      <p className={subText}>Avg Rating</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-2xl font-bold text-yellow-500">{formatRating(providerStats.avgRating)}</p>
                        <div className="flex items-center gap-0.5">
                          {[1,2,3,4,5].map(star => (
                            <svg key={star} className={`w-4 h-4 ${star <= getRatingValue(providerStats.avgRating) ? 'text-yellow-400' : isDarkMode ? 'text-slate-600' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  {providerStats.topServices.length > 0 && (
                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                      <p className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Top Services</p>
                      <div className="space-y-2">
                        {providerStats.topServices.map((service, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>{service.name}</span>
                            <span className="text-sm font-medium text-teal-500">{service.count} jobs</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {providerStats.monthlyEarnings.length > 0 && (
                    <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                      <p className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Monthly Earnings (Last 6 Months)</p>
                      <div className="space-y-2">
                        {providerStats.monthlyEarnings.map((month, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <span className={`text-xs w-12 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{month.month}</span>
                            <div className="flex-1 h-6 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                                style={{ width: `${Math.min(100, (month.earnings / (Math.max(1, providerStats.totalEarnings / 6)) * 100))}%` }} />
                            </div>
                            <span className={`text-sm font-medium w-16 text-right ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${month.earnings.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={`border-t pt-5 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                    <h5 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Job History ({providerJobs.length})</h5>
                    {providerJobs.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}>
                              <th className="px-4 py-2.5 text-left text-xs font-medium">Booking #</th>
                              <th className="px-4 py-2.5 text-left text-xs font-medium">Service</th>
                              <th className="px-4 py-2.5 text-left text-xs font-medium">Customer</th>
                              <th className="px-4 py-2.5 text-left text-xs font-medium">Date</th>
                              <th className="px-4 py-2.5 text-left text-xs font-medium">Status</th>
                              <th className="px-4 py-2.5 text-right text-xs font-medium">Amount</th>
                              <th className="px-4 py-2.5 text-right text-xs font-medium">Provider Earned</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {providerJobs.map(job => (
                              <tr key={job.id}>
                                <td className="px-4 py-3 font-mono text-xs">{job.booking_number}</td>
                                <td className="px-4 py-3">
                                  <p className="font-medium">{job.service_name}</p>
                                  <p className={`text-xs ${subText}`}>{job.category_name || '—'}</p>
                                </td>
                                <td className="px-4 py-3">{job.customer_first_name} {job.customer_last_name}</td>
                                <td className="px-4 py-3 text-xs">{formatDateTime(job.job_date)}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(job.status)}`}>{job.status?.replace('_', ' ')}</span>
                                </td>
                                <td className="px-4 py-3 text-right font-medium">${calculateTotal(job)}</td>
                                <td className="px-4 py-3 text-right font-medium text-green-600">
                                  ${(parseFloat(job.final_provider_amount) || parseFloat(job.provider_amount) || 0).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className={`text-sm text-center py-6 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>No job history found</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={`p-5 border-t flex justify-end gap-3 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <select value={selectedProvider.status}
                onChange={e => { updateProviderStatus(selectedProvider.id, e.target.value); setSelectedProvider({...selectedProvider, status: e.target.value}) }}
                className={`px-3 py-2 rounded-lg text-sm border ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-gray-50 text-gray-900 border-gray-200'} focus:outline-none focus:ring-2 focus:ring-teal-500`}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <button onClick={() => setIsProviderDetailsOpen(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOMER DETAIL MODAL ── */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className={`relative rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className={`p-6 border-b sticky top-0 ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Customer Details</h3>
                <button onClick={() => setIsModalOpen(false)} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${isDarkMode ? 'bg-teal-900 text-teal-300' : 'bg-teal-100 text-teal-700'}`}>
                  {`${selectedUser.first_name?.charAt(0) || ''}${selectedUser.last_name?.charAt(0) || ''}`.toUpperCase()}
                </div>
                <div>
                  <h4 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedUser.first_name} {selectedUser.last_name}</h4>
                  <p className={subText}>{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Phone', value: selectedUser.phone || '—' },
                  { label: 'Joined', value: formatDate(selectedUser.created_at) },
                  { label: 'How they found us', value: selectedUser.hear_about || '—' },
                  { label: 'Newsletter', value: selectedUser.receive_offers ? 'Subscribed' : 'Not subscribed' },
                ].map(item => (
                  <div key={item.label} className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                    <p className={subText}>{item.label}</p>
                    <p className={`text-sm font-medium mt-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className={`border-t pt-5 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <h5 className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Booking History ({userBookings.length})</h5>
                {loadingBookings ? (
                  <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent" /></div>
                ) : userBookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={isDarkMode ? 'bg-slate-800' : 'bg-gray-50'}>
                          <th className="px-4 py-2.5 text-left text-xs font-medium">Booking #</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium">Service</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium">Provider</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium">Date</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium">Status</th>
                          <th className="px-4 py-2.5 text-right text-xs font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                        {userBookings.map(b => (
                          <tr key={b.id}>
                            <td className="px-4 py-3 font-mono text-xs">{b.booking_number}</td>
                            <td className="px-4 py-3">{b.service_name}</td>
                            <td className="px-4 py-3">{b.provider_name || '—'}</td>
                            <td className="px-4 py-3 text-xs">{formatDate(b.job_date)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(b.status)}`}>{b.status?.replace('_', ' ')}</span>
                            </td>
                            <td className="px-4 py-3 text-right font-medium">${calculateTotal(b)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={`text-sm text-center py-6 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>No bookings found</p>
                )}
              </div>
            </div>
            <div className={`p-5 border-t flex justify-end gap-3 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <button onClick={() => { setIsModalOpen(false); setIsEditModalOpen(true) }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-medium hover:opacity-90">
                Edit Customer
              </button>
              <button onClick={() => setIsModalOpen(false)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT CUSTOMER MODAL ── */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          <div className={`relative rounded-2xl shadow-2xl w-full max-w-md ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Customer</h3>
                <button onClick={() => setIsEditModalOpen(false)} className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={updateCustomer}>
              <div className="p-6 space-y-4">
                {[
                  { label: 'First Name', key: 'first_name', type: 'text', required: true },
                  { label: 'Last Name', key: 'last_name', type: 'text', required: true },
                  { label: 'Phone', key: 'phone', type: 'tel', required: false },
                ].map(field => (
                  <div key={field.key}>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`}>
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    <input type={field.type} required={field.required} value={selectedUser[field.key] || ''}
                      onChange={e => setSelectedUser({ ...selectedUser, [field.key]: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-lg border text-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                ))}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-700'}`}>Email</label>
                  <input type="email" value={selectedUser.email || ''} disabled
                    className={`w-full px-4 py-2.5 rounded-lg border text-sm cursor-not-allowed ${isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-500' : 'bg-gray-100 border-gray-200 text-gray-400'}`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}>Email cannot be changed</p>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox"
                    checked={selectedUser.receive_offers === 1 || selectedUser.receive_offers === true}
                    onChange={e => setSelectedUser({ ...selectedUser, receive_offers: e.target.checked })}
                    className="w-4 h-4 text-teal-600 rounded border-gray-300"
                  />
                  <span className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>Subscribed to newsletter</span>
                </label>
              </div>
              <div className={`p-5 border-t flex justify-end gap-3 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <button type="button" onClick={() => setIsEditModalOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                  Cancel
                </button>
                <button type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-medium hover:opacity-90">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}