'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminTheme } from '../layout'

export default function AdminProviders() {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [providers, setProviders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedProvider, setSelectedProvider] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth')
    if (adminAuth !== 'loggedin') {
      router.push('/admin/login')
      return
    }
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      const res = await fetch('/api/admin/providers')
      const data = await res.json()
      if (data.success) {
        setProviders(data.data.providers)
        setStats(data.data.stats)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProviderDetails = async (id) => {
    try {
      const res = await fetch(`/api/admin/providers?id=${id}`)
      const data = await res.json()
      if (data.success) {
        setSelectedProvider(data.data)
        setShowModal(true)
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const filteredProviders = providers.filter(p => 
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.specialty?.toLowerCase().includes(search.toLowerCase())
  )

  // ✅ FIXED: RatingStars component with number conversion
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

  // ✅ FIXED: Helper function to format rating
  const formatRating = (rating) => {
    const num = Number(rating) || 0
    return num.toFixed(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
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

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total</p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.total}
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Active</p>
            <p className={`text-2xl font-bold text-green-600`}>{stats.active}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Avg Rating</p>
            <p className={`text-2xl font-bold text-yellow-500`}>{stats.avg_rating}</p>
          </div>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-white'} shadow`}>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Reviews</p>
            <p className={`text-2xl font-bold text-purple-600`}>{stats.total_reviews}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by name, email, specialty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full max-w-md px-4 py-2 rounded-lg border ${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'bg-white border-gray-200'
          }`}
        />
      </div>

      {/* Providers Grid */}
      {filteredProviders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProviders.map((provider) => (
            <div
              key={provider.id}
              onClick={() => loadProviderDetails(provider.id)}
              className={`p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition ${
                isDarkMode ? 'bg-slate-800' : 'bg-white'
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
                {/* ✅ FIXED: Using formatRating helper */}
                <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                  {formatRating(provider.avg_rating || provider.rating)} ({provider.total_reviews || 0} reviews)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
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

              <p className={`text-sm mt-3 truncate ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                📍 {provider.city || 'No location'} • 📧 {provider.email}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className={`text-center py-12 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
          No providers found
        </p>
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
                className="p-2 hover:bg-gray-100 rounded-full"
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
                    {/* ✅ FIXED: Using formatRating */}
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
                            {review.is_anonymous ? 'Anonymous' : `${review.first_name} ${review.last_name}`}
                          </span>
                          <RatingStars rating={review.rating} />
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                          {review.review}
                        </p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                          {review.service_name} • {new Date(review.created_at).toLocaleDateString()}
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