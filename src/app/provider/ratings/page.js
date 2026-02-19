'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

export default function ProviderRatings() {
  const router = useRouter()
  const [ratings, setRatings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkAuth()
    loadRatings()
    
    // Remove cz-shortcut-listen attribute added by browser extensions
    const removeExtensionAttributes = () => {
      if (document.body.hasAttribute('cz-shortcut-listen')) {
        document.body.removeAttribute('cz-shortcut-listen')
      }
    }
    
    removeExtensionAttributes()
    
    // Observe for any future additions
    const observer = new MutationObserver(() => {
      removeExtensionAttributes()
    })
    
    observer.observe(document.body, { attributes: true })
    
    return () => observer.disconnect()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('providerToken')
    if (!token) {
      router.push('/provider/login')
    }
  }

  const token = () => localStorage.getItem('providerToken')

  const loadRatings = async () => {
    try {
      const res = await fetch('/api/provider/ratings', {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const data = await res.json()
      if (data.success) {
        setRatings(data.data)
      }
    } catch (error) {
      console.error('Error loading ratings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReviews = ratings?.reviews?.filter(review => {
    if (filter === 'all') return true
    return review.rating === parseInt(filter)
  }) || []

  // ✅ FIXED: RatingStars with number conversion
  const RatingStars = ({ rating, size = 'text-lg' }) => {
    const numRating = Number(rating) || 0
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`${i < numRating ? 'text-yellow-400' : 'text-gray-300'} ${size}`}>
            ★
          </span>
        ))}
      </div>
    )
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="mb-6">
            <Link href="/provider/dashboard" className="text-green-600 hover:text-green-700 text-sm mb-2 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Your Reviews & Ratings</h1>
          </div>

          {/* Rating Summary */}
          {ratings && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <p className="text-5xl font-bold text-yellow-500 mb-2">
                    {/* ✅ FIXED: Convert to number before toFixed */}
                    {Number(ratings.stats.overall_rating).toFixed(1)}
                  </p>
                  {/* ✅ FIXED: Pass number to RatingStars */}
                  <RatingStars rating={Number(ratings.stats.overall_rating)} size="text-2xl" />
                  <p className="text-sm text-gray-500 mt-2">
                    {ratings.stats.total_reviews} reviews
                  </p>
                </div>

                <div className="flex-1">
                  {[5,4,3,2,1].map(star => (
                    <div key={star} className="flex items-center gap-2 mb-2">
                      <span className="text-sm w-12">{star} stars</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full"
                          style={{
                            width: `${(ratings.stats.distribution[star] / ratings.stats.total_reviews) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12">
                        {ratings.stats.distribution[star]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              All Reviews ({ratings?.reviews?.length || 0})
            </button>
            {[5,4,3,2,1].map(star => (
              <button
                key={star}
                onClick={() => setFilter(star.toString())}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  filter === star.toString()
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {star} ★ ({ratings?.stats.distribution[star] || 0})
              </button>
            ))}
          </div>

          {/* Reviews List */}
          {filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.customer_name}</h3>
                      <p className="text-sm text-gray-500">{review.service} • {review.date}</p>
                    </div>
                    {/* ✅ FIXED: Pass number to RatingStars */}
                    <RatingStars rating={Number(review.rating)} />
                  </div>
                  {review.review && (
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">"{review.review}"</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <p className="text-gray-500">No reviews found</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}