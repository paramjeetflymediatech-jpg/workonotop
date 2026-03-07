'use client'

// src/app/admin/reviews/page.jsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminTheme } from '../layout'

export default function AdminReviews() {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('adminAuth') !== 'loggedin') router.push('/admin/login')
    fetch('/api/reviews', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (d.success) setReviews(Array.isArray(d.data) ? d.data : []) })
      .finally(() => setLoading(false))
  }, [router])

  const text = isDarkMode ? 'text-white' : 'text-gray-900'
  const sub = isDarkMode ? 'text-slate-400' : 'text-gray-500'
  const row = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-teal-500 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="p-6">
      <h1 className={`text-2xl font-bold mb-1 ${text}`}>Reviews</h1>
      <p className={`text-sm mb-6 ${sub}`}>{reviews.length} total reviews</p>

      {reviews.length === 0 && (
        <p className={`text-center py-16 ${sub}`}>No reviews yet.</p>
      )}

      <div className="space-y-3">
        {reviews.map(r => (
          <div key={r.id} className={`border rounded-xl p-4 ${row}`}>
            <div className="flex items-center justify-between mb-1">
              <p className={`font-medium text-sm ${text}`}>
                {r.is_anonymous ? 'Anonymous' : r.customer_name}
                <span className={`ml-2 font-normal ${sub}`}>→ {r.provider_name}</span>
              </p>
              <span className="text-yellow-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
            </div>
            {r.review && <p className={`text-sm ${sub}`}>&quot;{r.review}&quot;</p>}
            <p className={`text-xs mt-1 ${sub}`}>
              {r.service_name} · #{r.booking_number} · {new Date(r.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}