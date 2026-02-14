'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminTheme } from '../layout'

export default function Customers() {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [customerBookings, setCustomerBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)

  useEffect(() => {
    checkAuth()
    loadCustomers()
  }, [])

  const checkAuth = () => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) {
      router.push('/')
    }
  }

  const loadCustomers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/customers')
      const data = await res.json()
      if (data.success) {
        setCustomers(data.data || [])
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCustomerBookings = async (customerId) => {
    setLoadingBookings(true)
    try {
      const res = await fetch(`/api/bookings?customer_id=${customerId}`)
      const data = await res.json()
      if (data.success) {
        setCustomerBookings(data.data || [])
      }
    } catch (error) {
      console.error('Error loading customer bookings:', error)
    } finally {
      setLoadingBookings(false)
    }
  }

  const updateCustomerStatus = async (customerId, isVerified) => {
    try {
      const customer = customers.find(c => c.id === customerId)
      const res = await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: customerId,
          first_name: customer.first_name,
          last_name: customer.last_name,
          phone: customer.phone,
          address: customer.address,
          city: customer.city,
          postal_code: customer.postal_code,
          is_verified: isVerified
        })
      })
      const data = await res.json()
      if (data.success) {
        loadCustomers()
      }
    } catch (error) {
      console.error('Error updating customer status:', error)
    }
  }

  const deleteCustomer = async (customerId) => {
    if (!confirm('Are you sure you want to delete this customer? This will also delete all their bookings and reviews.')) return
    
    try {
      const res = await fetch(`/api/customers?id=${customerId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        loadCustomers()
        setIsModalOpen(false)
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
    }
  }

  const updateCustomer = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedCustomer)
      })
      const data = await res.json()
      if (data.success) {
        setIsEditModalOpen(false)
        setSelectedCustomer(null)
        loadCustomers()
      }
    } catch (error) {
      console.error('Error updating customer:', error)
    }
  }

  const filteredCustomers = customers.filter(customer => {
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase()
      const email = customer.email?.toLowerCase() || ''
      const phone = customer.phone?.toLowerCase() || ''
      
      if (!fullName.includes(searchLower) && 
          !email.includes(searchLower) && 
          !phone.includes(searchLower)) {
        return false
      }
    }

    // Status filter
    if (filter === 'all') return true
    if (filter === 'verified') return customer.is_verified === 1
    if (filter === 'unverified') return customer.is_verified === 0
    return true
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getStatusColor = (isVerified) => {
    return isVerified
      ? 'bg-green-500/20 text-green-600 dark:text-green-400'
      : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Customers
        </h1>
        <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
          Manage all registered customers and their details
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className={`rounded-xl p-6 shadow-lg border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Total Customers
          </p>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {customers.length}
          </p>
        </div>
        
        <div className={`rounded-xl p-6 shadow-lg border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Verified Customers
          </p>
          <p className={`text-3xl font-bold text-green-600 dark:text-green-400`}>
            {customers.filter(c => c.is_verified).length}
          </p>
        </div>
        
        <div className={`rounded-xl p-6 shadow-lg border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Unverified Customers
          </p>
          <p className={`text-3xl font-bold text-yellow-600 dark:text-yellow-400`}>
            {customers.filter(c => !c.is_verified).length}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDarkMode 
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            />
            <svg 
              className={`absolute left-3 top-2.5 w-5 h-5 ${
                isDarkMode ? 'text-slate-500' : 'text-gray-400'
              }`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2">
          {['all', 'verified', 'unverified'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === status
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                  : isDarkMode
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Customers Table */}
      <div className={`rounded-xl shadow-lg border overflow-hidden ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}>
                <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Location</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    className={`cursor-pointer transition-colors ${
                      isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedCustomer(customer)
                      loadCustomerBookings(customer.id)
                      setIsModalOpen(true)
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {getInitials(customer.first_name, customer.last_name)}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {customer.first_name} {customer.last_name}
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                            ID: #{customer.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {customer.email}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          {customer.phone || 'No phone'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {customer.city || 'N/A'}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        {customer.postal_code || ''}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatDate(customer.created_at)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.is_verified)}`}>
                        {customer.is_verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer)
                            setIsEditModalOpen(true)
                          }}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            color: isDarkMode ? '#94a3b8' : '#475569'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#1e293b' : '#f1f5f9'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteCustomer(customer.id)}
                          className="p-2 rounded-lg transition-colors"
                          style={{
                            color: isDarkMode ? '#94a3b8' : '#475569'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#1e293b' : '#f1f5f9'
                            e.currentTarget.style.color = '#ef4444'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = isDarkMode ? '#94a3b8' : '#475569'
                          }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        No customers found
                      </p>
                      <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                        {searchTerm ? 'Try adjusting your search' : 'No customers have registered yet'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Details Modal */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className={`relative rounded-xl shadow-xl w-full max-w-4xl my-8 ${
            isDarkMode ? 'bg-slate-900' : 'bg-white'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Customer Details
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Customer Info */}
              <div className="flex items-start gap-6 mb-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ${
                  isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                  {getInitials(selectedCustomer.first_name, selectedCustomer.last_name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedCustomer.first_name} {selectedCustomer.last_name}
                      </h4>
                      <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                        Customer ID: #{selectedCustomer.id}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCustomer.is_verified)}`}>
                      {selectedCustomer.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-6">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Email</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedCustomer.email}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Phone</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedCustomer.phone || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Address</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedCustomer.address || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>City</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedCustomer.city || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Postal Code</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedCustomer.postal_code || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Member Since</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatDate(selectedCustomer.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Bookings */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Booking History
                  </h4>
                  <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Total: {customerBookings.length} bookings
                  </span>
                </div>

                {loadingBookings ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
                  </div>
                ) : customerBookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className={isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}>
                          <th className="px-4 py-2 text-left text-xs font-medium">Booking ID</th>
                          <th className="px-4 py-2 text-left text-xs font-medium">Service</th>
                          <th className="px-4 py-2 text-left text-xs font-medium">Provider</th>
                          <th className="px-4 py-2 text-left text-xs font-medium">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium">Status</th>
                          <th className="px-4 py-2 text-left text-xs font-medium">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {customerBookings.map((booking) => (
                          <tr key={booking.id}>
                            <td className="px-4 py-2 text-sm">
                              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                #{booking.id}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                                {booking.service_name}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                                {booking.provider_name || 'Unassigned'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                                {formatDate(booking.booking_date)}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' :
                                booking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-600' :
                                booking.status === 'in_progress' ? 'bg-purple-500/20 text-purple-600' :
                                booking.status === 'completed' ? 'bg-green-500/20 text-green-600' :
                                'bg-red-500/20 text-red-600'
                              }`}>
                                {booking.status?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                ${booking.total_price}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={`text-center py-8 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    No bookings found for this customer
                  </p>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  setSelectedCustomer(selectedCustomer)
                  setIsEditModalOpen(true)
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity"
              >
                Edit Customer
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  isDarkMode 
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditModalOpen(false)} />
          <div className={`relative rounded-xl shadow-xl w-full max-w-lg my-8 ${
            isDarkMode ? 'bg-slate-900' : 'bg-white'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Edit Customer
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={updateCustomer}>
              <div className="p-6 space-y-4">
                {/* First Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedCustomer.first_name || ''}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, first_name: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedCustomer.last_name || ''}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, last_name: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                {/* Email (Read Only) */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedCustomer.email || ''}
                    readOnly
                    disabled
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800/50 border-slate-700 text-slate-400' 
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                    } cursor-not-allowed`}
                  />
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                    Email cannot be changed
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={selectedCustomer.phone || ''}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, phone: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                {/* Address */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={selectedCustomer.address || ''}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, address: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                {/* City */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    City
                  </label>
                  <input
                    type="text"
                    value={selectedCustomer.city || ''}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, city: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={selectedCustomer.postal_code || ''}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, postal_code: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                {/* Verification Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_verified"
                    checked={selectedCustomer.is_verified === 1}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, is_verified: e.target.checked ? 1 : 0})}
                    className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                  />
                  <label htmlFor="is_verified" className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Verified Customer
                  </label>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    isDarkMode 
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Update Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}