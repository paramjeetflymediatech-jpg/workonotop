'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminTheme } from '../layout'

export default function Reviews() {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [stats, setStats] = useState(null)

  useEffect(() => {
    checkAuth()
    loadReviews()
    loadStats()
  }, [])

  const checkAuth = () => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) {
      router.push('/')
    }
  }

  const loadReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reviews')
      const data = await res.json()
      if (data.success) {
        setReviews(data.data || [])
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const deleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return
    
    try {
      const res = await fetch(`/api/reviews?id=${reviewId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        loadReviews()
        loadStats()
      }
    } catch (error) {
      console.error('Error deleting review:', error)
    }
  }

  const filteredReviews = reviews.filter(review => {
    if (filter === 'all') return true
    return review.rating === parseInt(filter)
  })

  const getRatingStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400'
                : isDarkMode ? 'text-slate-600' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
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
      <div className="mb-8">
        <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Reviews
        </h1>
        <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
          Manage customer reviews and feedback
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className={`rounded-xl p-6 shadow-lg border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Total Reviews
          </p>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {stats?.totalReviews || reviews.length}
          </p>
        </div>
        
        <div className={`rounded-xl p-6 shadow-lg border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Average Rating
          </p>
          <div className="flex items-center gap-2">
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats?.averageRating || '0.0'}
            </p>
            <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>/ 5.0</span>
          </div>
          <div className="mt-2">
            {getRatingStars(Math.round(parseFloat(stats?.averageRating || 0)))}
          </div>
        </div>
        
        <div className={`rounded-xl p-6 shadow-lg border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            5-Star Reviews
          </p>
          <p className={`text-3xl font-bold text-green-600 dark:text-green-400`}>
            {stats?.fiveStarReviews || 0}
          </p>
        </div>
      </div>

      {/* Rating Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            filter === 'all'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
              : isDarkMode
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All Reviews
        </button>
        {[5, 4, 3, 2, 1].map((rating) => (
          <button
            key={rating}
            onClick={() => setFilter(rating.toString())}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
              filter === rating.toString()
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                : isDarkMode
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {rating} Star
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className={`rounded-xl shadow-lg border p-6 ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                    isDarkMode ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-900'
                  }`}>
                    {review.customer_name?.charAt(0) || 'U'}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {review.customer_name || 'Anonymous'}
                      </h4>
                      <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      {getRatingStars(review.rating)}
                      <span className={`text-sm font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {review.rating}.0
                      </span>
                    </div>
                    
                    <p className={`text-sm mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      {review.comment}
                    </p>
                    
                    <div className="flex items-center gap-3 text-xs">
                      <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                        Service: {review.service_name}
                      </span>
                      <span className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}>•</span>
                      <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                        Tradesperson: {review.provider_name}
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => deleteReview(review.id)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={`text-center py-12 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl border ${
            isDarkMode ? 'border-slate-800' : 'border-gray-200'
          }`}>
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No reviews found
            </p>
            <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
              {filter === 'all' ? 'No reviews yet' : `No ${filter}-star reviews`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}