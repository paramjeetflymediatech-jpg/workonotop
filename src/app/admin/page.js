'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminTheme } from './layout'

export default function AdminDashboard() {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalJobs: 0,
    pendingJobs: 0,
    confirmedJobs: 0,
    inProgressJobs: 0,
    completedJobs: 0,
    totalCustomers: 0,
    newCustomers: 0,
    totalProviders: 0,        // 🔥 Added
    activeProviders: 0,       // 🔥 Added
    totalServices: 0,
    totalCategories: 0,
    totalRevenue: 0,
    averageJobValue: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    setMounted(true)
    checkAuth()
    loadDashboardData()
  }, [])

  const checkAuth = () => {
    if (typeof window === 'undefined') return
    const auth = localStorage.getItem('adminAuth')
    if (!auth) {
      router.push('/admin/login')
    }
  }

  const loadDashboardData = async () => {
    if (typeof window === 'undefined') return
    setLoading(true)
    try {
      // 🔥 Added providers API call
      const [bookingsRes, customersRes, providersRes, servicesRes, categoriesRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/customers'),
        fetch('/api/admin/providers'),  // 🔥 New API call
        fetch('/api/services'),
        fetch('/api/categories')
      ])

      const bookingsData = await bookingsRes.json()
      const customersData = await customersRes.json()
      const providersData = await providersRes.json()  // 🔥 New data
      const servicesData = await servicesRes.json()
      const categoriesData = await categoriesRes.json()

      const bookings = bookingsData.data || []
      // 🔥 Filter customers by role='user' only
      const allUsers = customersData.data || []
      const customers = allUsers.filter(user => user.role === 'user')  // 🔥 Only users with role='user'

      // 🔥 Get providers data
      const providers = providersData.data?.providers || []
      const providersStats = providersData.data?.stats || { total: 0, active: 0 }

      const servicesArray = servicesData.data || []
      const categoriesArray = categoriesData.data || []

      const now = new Date()
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      const calculatedStats = {
        totalJobs: bookings.length,
        pendingJobs: bookings.filter(b => b.status === 'pending').length,
        confirmedJobs: bookings.filter(b => b.status === 'confirmed').length,
        inProgressJobs: bookings.filter(b => b.status === 'in_progress').length,
        completedJobs: bookings.filter(b => b.status === 'completed').length,
        cancelledJobs: bookings.filter(b => b.status === 'cancelled').length,

        // 🔥 Customers count (only role='user')
        totalCustomers: customers.length,
        newCustomers: customers.filter(c =>
          new Date(c.created_at) > weekAgo
        ).length,

        // 🔥 Providers count
        totalProviders: providersStats.total || providers.length,
        activeProviders: providersStats.active || providers.filter(p => p.status === 'active').length,

        totalServices: servicesArray.length,
        totalCategories: categoriesArray.length,
        activeServices: servicesArray.filter(s => s.is_active === 1).length,

        totalRevenue: bookings.reduce((sum, b) => {
          const servicePrice = parseFloat(b.service_price || 0)
          const additionalPrice = parseFloat(b.additional_price || 0)
          return sum + servicePrice + additionalPrice
        }, 0),

        jobsThisWeek: bookings.filter(b =>
          new Date(b.created_at) > weekAgo
        ).length,

        averageJobValue: bookings.length > 0
          ? bookings.reduce((sum, b) => {
            const servicePrice = parseFloat(b.service_price || 0)
            const additionalPrice = parseFloat(b.additional_price || 0)
            return sum + servicePrice + additionalPrice
          }, 0) / bookings.length
          : 0
      }

      setStats(calculatedStats)
      setRecentBookings(bookings.slice(0, 5))
      setServices(servicesArray.slice(0, 6))
      setCategories(categoriesArray)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400',
      matching: 'bg-orange-500/20 text-orange-600 dark:text-orange-400',
      confirmed: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
      in_progress: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
      completed: 'bg-green-500/20 text-green-600 dark:text-green-400',
      cancelled: 'bg-red-500/20 text-red-600 dark:text-red-400'
    }
    return colors[status] || 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0)
  }

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
          Dashboard Overview
        </h1>
        <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
          Welcome back! Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Stats Grid - 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Jobs Card */}
        <div className={`rounded-xl shadow-lg p-6 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Total Jobs
            </h3>
            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats.totalJobs}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            <span className="text-yellow-600">Pending: {stats.pendingJobs}</span>
            {' • '}
            <span className="text-green-600">Completed: {stats.completedJobs}</span>
          </div>
        </div>

        {/* Total Customers Card - 🔥 Fixed: Only role='user' */}
        <div className={`rounded-xl shadow-lg p-6 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Total Customers
            </h3>
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats.totalCustomers}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            <span className="text-green-600">New this week: {stats.newCustomers}</span>
          </div>
        </div>

        {/* Total Providers Card - 🔥 NEW */}
        <div className={`rounded-xl shadow-lg p-6 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Service Providers
            </h3>
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats.totalProviders}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            <span className="text-green-600">Active: {stats.activeProviders}</span>
          </div>
        </div>

        {/* Revenue Card */}
        <div className={`rounded-xl shadow-lg p-6 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Total Revenue
            </h3>
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            <span>Jobs this week: {stats.jobsThisWeek}</span>
            {' • '}
            <span>Avg: {formatCurrency(stats.averageJobValue)}</span>
          </div>
        </div>
      </div>

      {/* Second Row - Services & Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Services Card */}
        <div className={`rounded-xl shadow-lg p-6 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Services Overview
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Total Services</span>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalServices}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Active Services</span>
              <span className="font-semibold text-green-600">{stats.activeServices}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Categories</span>
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalCategories}
              </span>
            </div>
          </div>
        </div>

        {/* Job Status Distribution - Simplified */}
        <div className={`rounded-xl shadow-lg p-6 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
          <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Job Status
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Pending</span>
              <span className="font-semibold text-yellow-600">{stats.pendingJobs}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Confirmed</span>
              <span className="font-semibold text-blue-600">{stats.confirmedJobs}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>In Progress</span>
              <span className="font-semibold text-purple-600">{stats.inProgressJobs}</span>
            </div>
            <div className="flex justify-between">
              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Completed</span>
              <span className="font-semibold text-green-600">{stats.completedJobs}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className={`rounded-xl shadow-lg border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
        <div className={`p-6 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent Job Requests
            </h2>
            <button
              onClick={() => router.push('/admin/jobs')}
              className="text-sm text-teal-600 dark:text-teal-400 hover:underline font-medium"
            >
              View All →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {recentBookings.length > 0 ? (
            <table className="w-full">
              <thead className={isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}>
                <tr>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    ID
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Customer
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Service
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Date
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Status
                  </th>
                  <th className={`px-6 py-4 text-left text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-gray-200'}`}>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className={isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      #{booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {booking.customer_first_name} {booking.customer_last_name}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        {booking.customer_email}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {booking.service_name}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {formatDate(booking.job_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(parseFloat(booking.service_price || 0) + parseFloat(booking.additional_price || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={`p-8 text-center ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              No recent bookings found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}