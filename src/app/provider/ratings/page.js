'use client'

// src/app/provider/ratings/page.jsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Star, ArrowLeft, ChevronRight, Calendar,
  CheckCircle, XCircle, MessageSquare, TrendingUp, Award
} from 'lucide-react'

export default function ProviderRatings() {
  const router = useRouter()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    setMounted(true)
    loadRatings()
  }, [])

  const loadRatings = async () => {
    try {
      const res = await fetch('/api/provider/ratings')
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      } else {
        if (res.status === 401) router.push('/provider/login')
        showToast('error', result.message || 'Failed to load')
      }
    } catch {
      showToast('error', 'Failed to load ratings')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (type, text) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }

  const formatDate = (d) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const avgRating = parseFloat(data?.stats?.average_rating || 0).toFixed(1)
  const totalReviews = data?.stats?.total_reviews || 0
  const dist = data?.stats?.distribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

  const filtered = (data?.reviews || []).filter(r =>
    filter === 'all' ? true : r.rating === Number(filter)
  )

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500">Loading your ratings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-medium flex items-center gap-2 animate-slideIn
          ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.text}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Ratings</h1>
          <div className="w-16 sm:w-20" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="p-2 bg-yellow-100 rounded-xl w-fit mb-3">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Avg Rating</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{avgRating}</p>
            <p className="text-xs text-gray-400 mt-1">Out of 5.0</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition">
            <div className="p-2 bg-blue-100 rounded-xl w-fit mb-3">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mb-1">Total Reviews</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalReviews}</p>
            <p className="text-xs text-gray-400 mt-1">All time</p>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl p-4 sm:p-5 shadow-lg">
            <div className="p-2 bg-white/20 rounded-xl w-fit mb-3">
              <Award className="w-4 h-4 text-white" />
            </div>
            <p className="text-green-100 text-xs mb-1">5-Star Reviews</p>
            <p className="text-2xl sm:text-3xl font-bold">{dist[5]}</p>
            <p className="text-green-100 text-xs mt-1">
              {totalReviews > 0 ? Math.round((dist[5] / totalReviews) * 100) : 0}% of all reviews
            </p>
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-6 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Rating breakdown</h2>

          {/* Big rating display */}
          <div className="flex items-center gap-6 mb-5">
            <div className="text-center">
              <p className="text-5xl font-bold text-gray-900">{avgRating}</p>
              <div className="flex items-center justify-center gap-0.5 my-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(avgRating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                ))}
              </div>
              <p className="text-xs text-gray-400">{totalReviews} reviews</p>
            </div>

            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map(star => {
                const count = dist[star] || 0
                const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-4">{star}</span>
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-5 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="font-semibold text-gray-900">Reviews</h2>

            {/* Filter */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
              {['all', '5', '4', '3', '2', '1'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition
                    ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {f === 'all' ? 'All' : `${f}★`}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            {filtered.length > 0 ? (
              <div className="space-y-4">
                {filtered.map((r, i) => (
                  <div key={r.id || i} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm flex-shrink-0">
                          {r.is_anonymous ? '?' : r.customer_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{r.customer_name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-400">{formatDate(r.date)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                        ))}
                      </div>
                    </div>

                    {r.service && (
                      <p className="text-xs text-green-700 font-medium mb-1.5">🔧 {r.service}</p>
                    )}

                    {r.review ? (
                      <p className="text-sm text-gray-600 leading-relaxed">&quot;{r.review}&quot;</p>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No written review</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-3 bg-gray-100 rounded-2xl w-fit mx-auto mb-3">
                  <Star className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No reviews yet</p>
                <p className="text-sm text-gray-400 mt-1">Reviews from completed jobs will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link href="/provider/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slideIn { animation: slideIn 0.3s ease-out; }
      `}</style>
    </div>
  )
}