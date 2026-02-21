'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminTheme } from '../layout'

const PAGE_SIZE = 6

// Pagination Component
function Pagination({ total, page, setPage, isDarkMode }) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        {total === 0
          ? 'No results'
          : totalPages <= 1
            ? `${total} total`
            : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total} total`}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 transition ${
            isDarkMode 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >‹</button>
        
        {pages.map((p, i) => (
          p === '...' 
            ? <span key={`e-${i}`} className="px-2 text-slate-400 text-sm">…</span>
            : <button 
                key={p} 
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                  page === p
                    ? 'bg-teal-600 text-white shadow-sm'
                    : isDarkMode 
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >{p}</button>
        ))}
        
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className={`px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 transition ${
            isDarkMode 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >›</button>
      </div>
    </div>
  )
}

// Rating Stars Component
const RatingStars = ({ rating }) => {
  const numRating = Number(rating) || 0
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(star => (
        <span key={star} className={star <= numRating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  )
}

export default function AdminProviders() {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [providers, setProviders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [page, setPage] = useState(1)
  const [error, setError] = useState(null)
  
  // Abort controller for cleanup
  const abortControllerRef = useRef(null)

  // Load providers with cleanup
  const loadProviders = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch('/api/admin/providers', {
        signal: abortControllerRef.current.signal,
        cache: 'no-store'
      })
      
      const data = await res.json()
      
      if (data.success) {
        setProviders(data.data.providers || [])
        setStats(data.data.stats || null)
      } else {
        setError(data.message || 'Failed to load providers')
      }
    } catch (error) {
      // Ignore abort errors
      if (error.name !== 'AbortError') {
        console.error('Error:', error)
        setError('Failed to load providers. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Load provider details
  const loadProviderDetails = useCallback(async (id) => {
    try {
      const res = await fetch(`/api/admin/providers?id=${id}`, {
        cache: 'no-store'
      })
      const data = await res.json()
      if (data.success) {
        setSelectedProvider(data.data)
        setShowModal(true)
      }
    } catch (error) {
      console.error('Error loading provider details:', error)
    }
  }, [])

  // Check auth and load data
  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth !== 'loggedin') {
      router.push('/admin/login')
      return
    }
    
    loadProviders()

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [router, loadProviders])

  // Reset page when search changes
  useEffect(() => {
    setPage(1)
  }, [search])

  // Filter providers
  const filteredProviders = providers.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.specialty?.toLowerCase().includes(search.toLowerCase())
  )

  // Pagination
  const startIndex = (page - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const pagedProviders = filteredProviders.slice(startIndex, endIndex)

  // Format rating helper
  const formatRating = (rating) => {
    const num = Number(rating) || 0
    return num.toFixed(1)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} border ${isDarkMode ? 'border-red-800' : 'border-red-200'}`}>
          <p className={`text-center ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
          <button 
            onClick={loadProviders}
            className="mt-2 mx-auto block px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Service Providers
        </h1>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          {providers.length} total providers
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total</p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.total}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Avg Rating</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.avg_rating}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Reviews</p>
            <p className="text-2xl font-bold text-purple-600">{stats.total_reviews}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <input
          type="text"
          placeholder="Search by name, email, specialty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full sm:max-w-md px-4 py-2 rounded-lg border ${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
              : 'bg-white border-gray-200 placeholder-gray-400'
          }`}
        />
        
        {search && (
          <div className="flex items-center gap-2">
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Found {filteredProviders.length} result{filteredProviders.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => setSearch('')}
              className={`text-xs px-2 py-1 rounded ${
                isDarkMode 
                  ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      {filteredProviders.length > 0 && (
        <div className="mb-4">
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredProviders.length)} of {filteredProviders.length} providers
          </p>
        </div>
      )}

      {/* Providers Grid */}
      {filteredProviders.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedProviders.map((provider) => (
              <div
                key={provider.id}
                onClick={() => loadProviderDetails(provider.id)}
                className={`p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 ${
                  isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {provider.name}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                      {provider.specialty || 'General'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    provider.status === 'active' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {provider.status}
                  </span>
                </div>

                <div className="mb-3">
                  <RatingStars rating={provider.avg_rating || provider.rating} />
                  <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {formatRating(provider.avg_rating || provider.rating)} ({provider.total_reviews || 0} reviews)
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Jobs</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {provider.total_jobs || 0}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Experience</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {provider.experience_years || 0} yrs
                    </p>
                  </div>
                </div>

                <p className={`text-sm truncate ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  📍 {provider.city || 'No location'} • 📧 {provider.email}
                </p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination 
            total={filteredProviders.length} 
            page={page} 
            setPage={setPage} 
            isDarkMode={isDarkMode} 
          />
        </>
      ) : (
        <div className={`text-center py-12 rounded-lg border ${
          isDarkMode ? 'border-slate-800' : 'border-gray-200'
        }`}>
          <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
            No providers found
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-2 text-sm text-teal-600 hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-lg p-6 ${
            isDarkMode ? 'bg-slate-900' : 'bg-white'
          }`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedProvider.name}
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  {selectedProvider.email} • {selectedProvider.phone}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className={`p-2 rounded-full hover:bg-gray-100 ${
                  isDarkMode ? 'hover:bg-slate-800' : ''
                }`}
              >
                ✕
              </button>
            </div>

            {/* Provider Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Specialty</p>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedProvider.specialty || '—'}</p>
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Experience</p>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedProvider.experience_years || 0} years</p>
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Location</p>
                  <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{selectedProvider.city || '—'}</p>
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Status</p>
                  <p className={selectedProvider.status === 'active' ? 'text-green-600' : 'text-gray-500'}>
                    {selectedProvider.status}
                  </p>
                </div>
              </div>

              {/* Bio */}
              {selectedProvider.bio && (
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Bio</p>
                  <p className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>{selectedProvider.bio}</p>
                </div>
              )}

              {/* Ratings */}
              <div className="pt-4 border-t">
                <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Ratings & Reviews
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-500">
                      {formatRating(selectedProvider.avg_rating || selectedProvider.rating)}
                    </p>
                    <RatingStars rating={selectedProvider.avg_rating || selectedProvider.rating} />
                  </div>
                  <div>
                    <p className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                      {selectedProvider.total_reviews || 0} reviews
                    </p>
                    <p className={isDarkMode ? 'text-slate-300' : 'text-gray-700'}>
                      {selectedProvider.total_jobs || 0} total jobs
                    </p>
                  </div>
                </div>

                {/* Reviews List */}
                {selectedProvider.reviews && selectedProvider.reviews.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedProvider.reviews.map((review) => (
                      <div key={review.id} className={`p-3 rounded ${
                        isDarkMode ? 'bg-slate-800' : 'bg-gray-50'
                      }`}>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">
                            {review.is_anonymous ? 'Anonymous' : `${review.first_name || ''} ${review.last_name || ''}`}
                          </span>
                          <RatingStars rating={review.rating} />
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                          {review.review}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                          {review.service_name} • {review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    No reviews yet
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}