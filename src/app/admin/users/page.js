'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminTheme } from '../layout'

export default function Users() {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [activeTab, setActiveTab] = useState('customers')
  const [customers, setCustomers] = useState([])
  const [tradespeople, setTradespeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [userBookings, setUserBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  
  // Tradespeople specific states
  const [filter, setFilter] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newTradesperson, setNewTradesperson] = useState({
    name: '',
    email: '',
    phone: '',
    // Removed other fields as they'll be filled by tradesperson later
  })
  const [showSuccessMessage, setShowSuccessMessage] = useState('')
  const [showErrorMessage, setShowErrorMessage] = useState('')

  useEffect(() => {
    checkAuth()
    loadAllUsers()
  }, [])

  const checkAuth = () => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) {
      router.push('/')
    }
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
      // Load customers
      const customersRes = await fetch('/api/customers')
      const customersData = await customersRes.json()
      if (customersData.success) {
        setCustomers(customersData.data || [])
      }

      // Load all tradespeople (remove status filter to see all)
      const tradespeopleRes = await fetch('/api/provider')
      if (tradespeopleRes.ok) {
        const tradespeopleData = await tradespeopleRes.json()
        if (tradespeopleData.success) {
          setTradespeople(tradespeopleData.data || [])
        }
      }
    } catch (error) {
      console.error('Error loading users:', error)
      showMessage('error', 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const loadUserBookings = async (userId, userEmail) => {
    setLoadingBookings(true)
    try {
      const res = await fetch(`/api/bookings?email=${encodeURIComponent(userEmail)}`)
      const data = await res.json()
      if (data.success) {
        setUserBookings(data.data || [])
      }
    } catch (error) {
      console.error('Error loading user bookings:', error)
    } finally {
      setLoadingBookings(false)
    }
  }

  // Customer functions
  const deleteCustomer = async (customerId) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) return
    
    try {
      const res = await fetch(`/api/customers?id=${customerId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        showMessage('success', 'Customer deleted successfully!')
        loadAllUsers()
        setIsModalOpen(false)
      } else {
        showMessage('error', data.message || 'Failed to delete customer')
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      showMessage('error', 'Failed to delete customer')
    }
  }

  const updateCustomer = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/customers?id=${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: selectedUser.first_name,
          last_name: selectedUser.last_name,
          phone: selectedUser.phone,
          receive_offers: selectedUser.receive_offers
        })
      })
      const data = await res.json()
      if (data.success) {
        setIsEditModalOpen(false)
        setSelectedUser(null)
        loadAllUsers()
        showMessage('success', 'Customer updated successfully!')
      } else {
        showMessage('error', data.message || 'Failed to update customer')
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      showMessage('error', 'Failed to update customer')
    }
  }

  // Tradesperson functions
  const updateTradespersonStatus = async (providerId, newStatus) => {
    try {
      const res = await fetch(`/api/provider?id=${providerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        showMessage('success', 'Provider status updated successfully')
        loadAllUsers()
      } else {
        showMessage('error', data.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating provider:', error)
      showMessage('error', 'Failed to update provider status')
    }
  }

  const deleteTradesperson = async (providerId) => {
    if (!confirm('Are you sure you want to delete this tradesperson? This action cannot be undone.')) return
    
    try {
      const res = await fetch(`/api/provider?id=${providerId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        showMessage('success', 'Tradesperson deleted successfully')
        loadAllUsers()
      } else {
        showMessage('error', data.message || 'Failed to delete tradesperson')
      }
    } catch (error) {
      console.error('Error deleting provider:', error)
      showMessage('error', 'Failed to delete tradesperson')
    }
  }

  // Updated addTradesperson function - only creates basic credentials
  const addTradesperson = async (e) => {
    e.preventDefault()
    try {
      // Generate a random temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
      
      const res = await fetch('/api/provider/create-with-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTradesperson.name,
          email: newTradesperson.email,
          phone: newTradesperson.phone,
          password: tempPassword,
          status: 'active' // Set as active by default
        })
      })
      
      const data = await res.json()
      if (data.success) {
        showMessage('success', `Tradesperson added successfully! Temporary password: ${tempPassword} (save this)`)
        setIsAddModalOpen(false)
        setNewTradesperson({
          name: '',
          email: '',
          phone: '',
        })
        loadAllUsers()
      } else {
        showMessage('error', data.message || 'Failed to add tradesperson')
      }
    } catch (error) {
      console.error('Error adding tradesperson:', error)
      showMessage('error', 'Failed to add tradesperson')
    }
  }

  // Filter functions
  const filteredCustomers = customers.filter(customer => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase()
    const email = customer.email?.toLowerCase() || ''
    const phone = customer.phone?.toLowerCase() || ''
    
    return fullName.includes(searchLower) || email.includes(searchLower) || phone.includes(searchLower)
  })

  const filteredTradespeople = tradespeople.filter(provider => {
    // First apply status filter
    if (filter !== 'all' && provider.status !== filter) return false
    
    // Then apply search filter
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    const name = provider.name?.toLowerCase() || ''
    const email = provider.email?.toLowerCase() || ''
    const phone = provider.phone?.toLowerCase() || ''
    const specialty = provider.specialty?.toLowerCase() || ''
    
    return name.includes(searchLower) || email.includes(searchLower) || 
           phone.includes(searchLower) || specialty.includes(searchLower)
  })

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (firstName, lastName) => {
    if (activeTab === 'customers') {
      return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
    } else {
      return selectedUser?.name?.charAt(0) || ''
    }
  }

  const calculateTotal = (booking) => {
    const servicePrice = parseFloat(booking.service_price) || 0
    const additionalPrice = parseFloat(booking.additional_price) || 0
    return (servicePrice + additionalPrice).toFixed(2)
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
      case 'matching': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
      case 'confirmed': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
      case 'in_progress': return 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
      case 'completed': return 'bg-green-500/20 text-green-600 dark:text-green-400'
      case 'cancelled': return 'bg-red-500/20 text-red-600 dark:text-red-400'
      case 'active': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
      case 'inactive': return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30'
      case 'suspended': return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
    }
  }

  // Helper function for rating
  const formatRating = (rating) => {
    if (rating === null || rating === undefined) return '0.0'
    const numRating = parseFloat(rating)
    return isNaN(numRating) ? '0.0' : numRating.toFixed(1)
  }

  const getRatingValue = (rating) => {
    if (rating === null || rating === undefined) return 0
    const numRating = parseFloat(rating)
    return isNaN(numRating) ? 0 : Math.round(numRating)
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
      {/* Success/Error Messages */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {showSuccessMessage}
        </div>
      )}
      {showErrorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {showErrorMessage}
        </div>
      )}

      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Users
          </h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
            Manage all customers and tradespeople
          </p>
        </div>
        
        {activeTab === 'tradespeople' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 sm:mt-0 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Tradesperson
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6 flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'customers'
              ? isDarkMode 
                ? 'text-white border-b-2 border-teal-500' 
                : 'text-teal-600 border-b-2 border-teal-500'
              : isDarkMode 
                ? 'text-slate-400 hover:text-slate-300' 
                : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Customers
          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
            activeTab === 'customers'
              ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400'
              : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-200 text-gray-600'
          }`}>
            {customers.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('tradespeople')}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'tradespeople'
              ? isDarkMode 
                ? 'text-white border-b-2 border-teal-500' 
                : 'text-teal-600 border-b-2 border-teal-500'
              : isDarkMode 
                ? 'text-slate-400 hover:text-slate-300' 
                : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tradespeople
          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
            activeTab === 'tradespeople'
              ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400'
              : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-gray-200 text-gray-600'
          }`}>
            {tradespeople.length}
          </span>
        </button>
      </div>

      {/* Stats Cards - Show based on active tab */}
      {activeTab === 'customers' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className={`rounded-xl p-6 shadow-lg border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Total Customers
                </p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {customers.length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-teal-500/20">
                <svg className="w-8 h-8 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-6 shadow-lg border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Active Customers
                </p>
                <p className={`text-3xl font-bold text-green-600 dark:text-green-400`}>
                  {customers.filter(c => c.booking_count > 0).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/20">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl p-6 shadow-lg border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Newsletter Subscribers
                </p>
                <p className={`text-3xl font-bold text-purple-600 dark:text-purple-400`}>
                  {customers.filter(c => c.receive_offers).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/20">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 flex flex-wrap gap-2">
          {['all', 'active', 'inactive', 'suspended'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === status
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                  : isDarkMode
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
              {filter === status && (
                <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                  {filteredTradespeople.length}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={`Search by name, email, or phone...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          />
          <svg 
            className={`absolute left-3 top-4 w-5 h-5 ${
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

      {/* Content based on active tab */}
      {activeTab === 'customers' ? (
        // Customers Table View
        <div className={`rounded-xl shadow-lg border overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Source</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Bookings</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Newsletter</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Joined</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <tr 
                      key={`customer-${customer.id}`} 
                      className={`cursor-pointer transition-colors ${
                        isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedUser({...customer, type: 'customer'})
                        loadUserBookings(customer.id, customer.email)
                        setIsModalOpen(true)
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                            isDarkMode ? 'bg-slate-700 text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {`${customer.first_name?.charAt(0) || ''}${customer.last_name?.charAt(0) || ''}`.toUpperCase()}
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
                        <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                          {customer.hear_about || 'Not specified'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          customer.booking_count > 0
                            ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                            : 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
                        }`}>
                          {customer.booking_count} booking{customer.booking_count !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {customer.receive_offers ? (
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          {formatDate(customer.created_at)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedUser({...customer, type: 'customer'})
                              setIsEditModalOpen(true)
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteCustomer(customer.id)
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-red-600 transition-colors"
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
                    <td colSpan="7" className="px-6 py-12 text-center">
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
      ) : (
        // Tradespeople Grid View
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTradespeople.length > 0 ? (
            filteredTradespeople.map((provider) => (
              <div
                key={`tradesperson-${provider.id}`}
                className={`rounded-xl shadow-lg border overflow-hidden ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                        isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'
                      }`}>
                        {provider.name?.charAt(0)}
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {provider.name}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          {provider.specialty || 'Not specified yet'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(provider.status)}`}>
                      {provider.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                        {provider.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                        {provider.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                        {provider.location || 'Not specified'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const ratingValue = getRatingValue(provider.rating);
                          return (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${
                                star <= ratingValue
                                  ? 'text-yellow-400'
                                  : isDarkMode ? 'text-slate-600' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          );
                        })}
                      </div>
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatRating(provider.rating)}
                      </span>
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {provider.total_jobs || 0} jobs
                    </span>
                  </div>

                  <div className="mt-2">
                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                      Experience: {provider.experience_years || 0} years
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser({...provider, type: 'tradesperson'})
                        setIsModalOpen(true)
                      }}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
                        color: isDarkMode ? '#e2e8f0' : '#1e293b'
                      }}
                    >
                      View Details
                    </button>
                    <select
                      onChange={(e) => updateTradespersonStatus(provider.id, e.target.value)}
                      value={provider.status}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                        isDarkMode 
                          ? 'bg-slate-800 text-white border-slate-700' 
                          : 'bg-gray-100 text-gray-900 border-gray-200'
                      }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <button
                      onClick={() => deleteTradesperson(provider.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-red-600 transition-colors"
                      title="Delete Tradesperson"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full">
              <div className={`text-center py-12 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl border ${
                isDarkMode ? 'border-slate-800' : 'border-gray-200'
              }`}>
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  No tradespeople found
                </p>
                <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                  {filter === 'all' ? 'Add your first tradesperson' : `No ${filter} tradespeople`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Tradesperson Modal - Simplified */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          <div className={`relative rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-slate-900' : 'bg-white'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Add New Tradesperson
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={addTradesperson}>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newTradesperson.name}
                    onChange={(e) => setNewTradesperson({...newTradesperson, name: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newTradesperson.email}
                    onChange={(e) => setNewTradesperson({...newTradesperson, email: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={newTradesperson.phone}
                    onChange={(e) => setNewTradesperson({...newTradesperson, phone: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="+1 (403) 555-0123"
                  />
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                    <strong>Note:</strong> A temporary password will be generated automatically. 
                    The tradesperson can log in and update their profile details later.
                  </p>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
          <div className={`relative rounded-xl shadow-xl w-full max-w-4xl my-8 ${
            isDarkMode ? 'bg-slate-900' : 'bg-white'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedUser.type === 'customer' ? 'Customer Details' : 'Tradesperson Details'}
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
              {/* User Info */}
              <div className="flex items-start gap-6 mb-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold ${
                  isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'
                }`}>
                  {selectedUser.type === 'customer' 
                    ? `${selectedUser.first_name?.charAt(0) || ''}${selectedUser.last_name?.charAt(0) || ''}`.toUpperCase()
                    : selectedUser.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedUser.type === 'customer' 
                          ? `${selectedUser.first_name} ${selectedUser.last_name}`
                          : selectedUser.name}
                      </h4>
                      <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                        {selectedUser.type === 'customer' ? `Customer ID: #${selectedUser.id}` : selectedUser.specialty || 'General Tradesperson'}
                      </p>
                    </div>
                    {selectedUser.type === 'customer' && selectedUser.receive_offers && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-600 dark:text-purple-400">
                        Newsletter Subscriber
                      </span>
                    )}
                    {selectedUser.type === 'tradesperson' && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedUser.status)}`}>
                        {selectedUser.status}
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-6">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Email</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedUser.email}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Phone</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedUser.phone || 'Not provided'}
                      </p>
                    </div>
                    
                    {selectedUser.type === 'customer' ? (
                      <>
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>How they found us</p>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedUser.hear_about || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Member Since</p>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatDate(selectedUser.created_at)}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Experience</p>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedUser.experience_years || 0} years
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Location</p>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedUser.location || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Rating</p>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const ratingValue = getRatingValue(selectedUser.rating);
                                return (
                                  <svg
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= ratingValue
                                        ? 'text-yellow-400'
                                        : isDarkMode ? 'text-slate-600' : 'text-gray-300'
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                );
                              })}
                            </div>
                            <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {formatRating(selectedUser.rating)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Total Jobs</p>
                          <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {selectedUser.total_jobs || 0}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {selectedUser.type === 'tradesperson' && selectedUser.bio && (
                    <div className="mt-4">
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Bio</p>
                      <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedUser.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* User Bookings (for customers) */}
              {selectedUser.type === 'customer' && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Booking History
                    </h4>
                    <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      Total: {userBookings.length} booking{userBookings.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {loadingBookings ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
                    </div>
                  ) : userBookings.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}>
                            <th className="px-4 py-3 text-left text-xs font-medium">Booking #</th>
                            <th className="px-4 py-3 text-left text-xs font-medium">Service</th>
                            <th className="px-4 py-3 text-left text-xs font-medium">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-medium">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {userBookings.map((booking) => (
                            <tr key={booking.id}>
                              <td className="px-4 py-3 text-sm">
                                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {booking.booking_number}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div>
                                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                                    {booking.service_name}
                                  </span>
                                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                                    {booking.category_name}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                                  {formatDate(booking.job_date)}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                                  {booking.status?.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-right">
                                <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  ${calculateTotal(booking)}
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
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              {selectedUser.type === 'customer' && (
                <button
                  onClick={() => {
                    setIsModalOpen(false)
                    setIsEditModalOpen(true)
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Edit Customer
                </button>
              )}
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
      {isEditModalOpen && selectedUser && selectedUser.type === 'customer' && (
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
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedUser.first_name || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, first_name: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedUser.last_name || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, last_name: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedUser.email || ''}
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

                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={selectedUser.phone || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="receive_offers"
                    checked={selectedUser.receive_offers === 1 || selectedUser.receive_offers === true}
                    onChange={(e) => setSelectedUser({...selectedUser, receive_offers: e.target.checked})}
                    className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                  />
                  <label htmlFor="receive_offers" className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Subscribed to newsletter and offers
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