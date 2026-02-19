'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

export default function ProviderDashboard() {
  const router = useRouter()
  const [provider, setProvider] = useState(null)
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0
    // earnings removed
  })
  const [recentJobs, setRecentJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [ratings, setRatings] = useState(null)

  useEffect(() => {
    checkAuth()
    loadDashboard()
    loadRatings()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem('providerToken')
    if (!token) {
      router.push('/provider/login')
    }
  }

  const token = () => localStorage.getItem('providerToken')

  const loadDashboard = async () => {
    try {
      // Load provider profile
      const profileRes = await fetch('/api/provider', {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const profileData = await profileRes.json()
      if (profileData.success) {
        setProvider(profileData.data)
      }

      // Load jobs stats
      const jobsRes = await fetch('/api/provider/jobs', {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const jobsData = await jobsRes.json()
      if (jobsData.success) {
        const jobs = jobsData.data || []
        
        // Calculate stats (earnings removed)
        const pending = jobs.filter(j => j.status === 'pending' || j.status === 'matching').length
        const inProgress = jobs.filter(j => j.status === 'in_progress' || j.status === 'confirmed').length
        const completed = jobs.filter(j => j.status === 'completed').length

        setStats({ pending, inProgress, completed })

        // Get recent jobs
        const recent = jobs
          .filter(j => j.status === 'completed')
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(0, 5)
        setRecentJobs(recent)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

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
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  // Rating stars component with number conversion
  const RatingStars = ({ rating }) => {
    const numRating = Number(rating) || 0
    const fullStars = Math.floor(numRating)
    const hasHalfStar = numRating % 1 >= 0.5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400 text-lg">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400 text-lg">½</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300 text-lg">★</span>
        ))}
        <span className="ml-1 text-sm text-gray-600">({numRating.toFixed(1)})</span>
      </div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {provider?.name || 'Provider'}!
            </h1>
            <p className="text-gray-600 mt-1">Here's your activity overview</p>
          </div>

          {/* Stats Grid - 3 columns only (earnings removed) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Pending Jobs */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-400">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            </div>

            {/* In Progress */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-400">
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>

            {/* Completed */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-400">
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>

          {/* Ratings Section */}
          {ratings && ratings.stats.total_reviews > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Ratings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Overall Rating */}
                <div className="text-center">
                  <p className="text-4xl font-bold text-yellow-500 mb-2">
                    {Number(ratings.stats.overall_rating).toFixed(1)}
                  </p>
                  <RatingStars rating={Number(ratings.stats.overall_rating)} />
                  <p className="text-sm text-gray-500 mt-2">
                    {ratings.stats.total_reviews} reviews
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="md:col-span-2">
                  {[5,4,3,2,1].map(star => (
                    <div key={star} className="flex items-center gap-2 mb-2">
                      <span className="text-sm w-8">{star} ★</span>
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

              {/* Recent Reviews */}
              {ratings.reviews && ratings.reviews.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3">Recent Reviews</h3>
                  <div className="space-y-4">
                    {ratings.reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.customer_name}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{review.service}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        {review.review && (
                          <p className="text-sm text-gray-600">"{review.review}"</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">{review.date}</p>
                      </div>
                    ))}
                  </div>
                  
                  {ratings.reviews.length > 3 && (
                    <button
                      onClick={() => router.push('/provider/ratings')}
                      className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      View all {ratings.reviews.length} reviews →
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Quick Actions Grid - Only Available Jobs (Messages removed) */}
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 mb-8">
            <Link
              href="/provider/available-jobs"
              className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold mb-2">Available Jobs</h3>
              <p className="text-sm opacity-90 mb-4">Browse and accept new jobs</p>
              <span className="text-2xl font-bold">{stats.pending}</span>
              <span className="text-sm opacity-75 ml-2">pending</span>
            </Link>
          </div>

          {/* Recent Jobs */}
          {recentJobs.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
                <Link
                  href="/provider/jobs"
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  View All →
                </Link>
              </div>

              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    onClick={() => router.push(`/provider/jobs/${job.id}`)}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          COMPLETED
                        </span>
                        <span className="text-xs text-gray-500">#{job.booking_number}</span>
                      </div>
                      <p className="font-medium text-gray-900 mt-1">{job.service_name}</p>
                      <p className="text-sm text-gray-600">
                        {job.customer_first_name} {job.customer_last_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">
                        {formatCurrency(job.final_provider_amount || job.provider_amount || 0)}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(job.job_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}