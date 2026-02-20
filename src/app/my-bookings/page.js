'use client'

import { useState, useEffect } from 'react'
import { useAuth } from 'src/context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'

export default function MyBookings() {
  const { user } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewBooking, setReviewBooking] = useState(null)
  const [reviewData, setReviewData] = useState({ rating: 5, review: '', is_anonymous: false })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewStatus, setReviewStatus] = useState({})
  const [invoices, setInvoices] = useState({})

  // ✅ FIXED: Helper function to safely format amounts (handles strings, null, undefined)
  const formatAmount = (amount) => {
    // Handle null/undefined
    if (amount === null || amount === undefined) return '0.00'

    // Convert to number if it's a string
    let num = amount
    if (typeof amount === 'string') {
      num = parseFloat(amount)
    }

    // Check if it's a valid number
    if (isNaN(num)) return '0.00'

    // Return formatted number
    return num.toFixed(2)
  }

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadBookings()
  }, [user])

  const loadBookings = async () => {
    if (!user) return

    setLoading(true)
    try {
      const res = await fetch(`/api/customer/bookings?user_id=${user.id}`)
      const data = await res.json()
      if (data.success) {
        const bookingsData = data.data || []

        // Fetch invoices for each booking
        const bookingsWithInvoices = await Promise.all(
          bookingsData.map(async (booking) => {
            try {
              const invoiceRes = await fetch(`/api/admin/invoices?booking_id=${booking.id}`)
              const invoiceData = await invoiceRes.json()
              if (invoiceData.success && invoiceData.data.length > 0) {
                const invoice = invoiceData.data[0]
                booking.invoice = {
                  id: invoice.id,
                  amount: parseFloat(invoice.total_amount), // ✅ Parse to number
                  status: invoice.status,
                  number: invoice.invoice_number,
                  payment_date: invoice.payment_date
                }
                // Save invoice in state
                setInvoices(prev => ({
                  ...prev,
                  [booking.id]: {
                    id: invoice.id,
                    amount: parseFloat(invoice.total_amount), // ✅ Parse to number
                    status: invoice.status,
                    number: invoice.invoice_number,
                    payment_date: invoice.payment_date
                  }
                }))
              }
            } catch (err) {
              console.error('Error fetching invoice:', err)
            }
            return booking
          })
        )

        setBookings(bookingsWithInvoices)
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const viewDetails = async (booking) => {
    try {
      const res = await fetch('/api/customer/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: booking.id,
          user_id: user.id
        })
      })
      const data = await res.json()
      if (data.success) {
        setSelectedBooking(data.data)
        setIsModalOpen(true)
        checkReviewStatus(data.data.id)
      }
    } catch (error) {
      console.error('Error fetching booking details:', error)
    }
  }

  const checkReviewStatus = async (bookingId) => {
    try {
      const res = await fetch(`/api/customer/reviews?booking_id=${bookingId}&customer_id=${user.id}`)
      const data = await res.json()
      if (data.success) {
        setReviewStatus(prev => ({
          ...prev,
          [bookingId]: data.data
        }))
      }
    } catch (error) {
      console.error('Error checking review status:', error)
    }
  }

  const submitReview = async () => {
    if (!reviewBooking) return

    setSubmittingReview(true)
    try {
      const res = await fetch('/api/customer/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: reviewBooking.id,
          provider_id: reviewBooking.provider_id,
          customer_id: user.id,
          rating: reviewData.rating,
          review: reviewData.review,
          is_anonymous: reviewData.is_anonymous
        })
      })
      const data = await res.json()
      if (data.success) {
        alert('✅ Review submitted successfully!')
        setShowReviewModal(false)
        setReviewData({ rating: 5, review: '', is_anonymous: false })
        checkReviewStatus(reviewBooking.id)
      } else {
        alert('❌ ' + data.message)
      }
    } catch (error) {
      alert('Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    return booking.status === filter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'matching': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'completed': return 'bg-green-100 text-green-800 border-green-300'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTimeSlot = (slot) => {
    if (Array.isArray(slot)) {
      return slot.join(', ')
    }
    const slots = {
      'morning': '8:00 AM - 12:00 PM',
      'afternoon': '12:00 PM - 5:00 PM',
      'evening': '5:00 PM - 9:00 PM'
    }
    return slots[slot] || slot
  }

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your bookings...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
            <p className="text-gray-600">Track and manage your service requests</p>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {['all', 'pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filter === status
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
              >
                {status.replace('_', ' ')}
                {status === 'all' && ` (${bookings.length})`}
              </button>
            ))}
          </div>

          {/* Bookings Grid */}
          {filteredBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBookings.map((booking) => {
                const invoice = invoices[booking.id]

                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-200"
                  >
                    {/* Service Image */}
                    {booking.service_image && (
                      <div className="h-48 overflow-hidden bg-gray-200">
                        <img
                          src={booking.service_image}
                          alt={booking.service_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      {/* Booking Number & Status */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-gray-500">
                          #{booking.booking_number}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                          {booking.status?.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Service Name */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {booking.service_name}
                      </h3>

                      {/* Provider (if assigned) */}
                      {booking.provider_name && (
                        <p className="text-sm text-gray-600 mb-2">
                          Provider: {booking.provider_name}
                          {booking.provider_rating && ` ⭐ ${booking.provider_rating}`}
                        </p>
                      )}

                      {/* Date & Time */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-700">
                          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(booking.job_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTimeSlot(booking.job_time_slot)}
                        </div>
                      </div>

                      {/* ✅ PRICE DISPLAY - INVOICE AMOUNT FIRST - WITH SAFE CHECK */}
                      <div className="mb-4 pb-4 border-b border-gray-200">
                        {invoice ? (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">Total Amount:</span>
                              <span className="text-xl font-bold text-green-600">
                                ${invoice.amount ? formatAmount(invoice.amount) : '0.00'}
                              </span>
                            </div>
                            {invoice.status === 'paid' && (
                              <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                                <span>✓</span> Paid
                              </div>
                            )}
                          </>
                        ) : (
                          /* Fallback to booking price */
                          <>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-gray-600">Base price:</span>
                              <span className="font-medium">${parseFloat(booking.service_price || 0).toFixed(2)}</span>
                            </div>

                            {booking.display?.has_overtime && (
                              <>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm text-gray-600">Overtime ({booking.display.overtime_minutes} min):</span>
                                  <span className="font-medium text-purple-600">+${booking.display.overtime_earnings.toFixed(2)}</span>
                                </div>
                                <div className="text-xs text-gray-500 mb-2">
                                  Rate: ${booking.display.overtime_rate}/hour
                                </div>
                              </>
                            )}

                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                              <span className="text-base font-semibold text-gray-900">Total:</span>
                              <span className="text-xl font-bold text-green-600">
                                ${(booking.display?.customer_total || booking.service_price || 0).toFixed(2)}
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* View Details Button */}
                      <button
                        onClick={() => viewDetails(booking)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all'
                  ? "You haven't made any bookings yet"
                  : `No ${filter.replace('_', ' ')} bookings`}
              </p>
              <Link
                href="/services"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Browse Services
              </Link>
            </div>
          )}
        </div>

        {/* Booking Details Modal */}
        {isModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                  <p className="text-sm text-gray-600">#{selectedBooking.booking_number}</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Status</h3>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(selectedBooking.status)}`}>
                    {selectedBooking.status?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                {/* Provider Info */}
                {selectedBooking.provider_name && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Provider</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="font-semibold">{selectedBooking.provider_name}</p>
                      {selectedBooking.provider_rating && (
                        <p className="text-sm text-gray-600">Rating: ⭐ {selectedBooking.provider_rating}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Service Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-gray-900 font-semibold">{selectedBooking.service_name}</p>
                    <p className="text-sm text-gray-600">{selectedBooking.category_name}</p>
                    {selectedBooking.service_description && (
                      <p className="text-sm text-gray-600">{selectedBooking.service_description}</p>
                    )}
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Scheduled For</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-900">{formatDate(selectedBooking.job_date)}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-900">{formatTimeSlot(selectedBooking.job_time_slot)}</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Service Location</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900">{selectedBooking.address_line1}</p>
                    {selectedBooking.address_line2 && (
                      <p className="text-gray-900">{selectedBooking.address_line2}</p>
                    )}
                    <p className="text-gray-900">
                      {selectedBooking.city}{selectedBooking.postal_code && `, ${selectedBooking.postal_code}`}
                    </p>
                  </div>
                </div>

                {/* Job Details */}
                {(selectedBooking.job_description || selectedBooking.timing_constraints || selectedBooking.instructions) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      {selectedBooking.job_description && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Description:</p>
                          <p className="text-gray-900">{selectedBooking.job_description}</p>
                        </div>
                      )}
                      {selectedBooking.timing_constraints && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Timing Constraints:</p>
                          <p className="text-gray-900">{selectedBooking.timing_constraints}</p>
                        </div>
                      )}
                      {selectedBooking.instructions && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Special Instructions:</p>
                          <p className="text-gray-900">{selectedBooking.instructions}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {selectedBooking.photos && selectedBooking.photos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Photos</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedBooking.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer"
                          onClick={() => window.open(photo, '_blank')}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* ✅ FIXED: Pricing - INVOICE AMOUNT WITH SAFE CHECK */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {/* Show invoice amount if available */}
                    {invoices[selectedBooking.id] ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Invoice Amount:</span>
                          <span className="font-bold text-green-600 text-lg">
                            ${invoices[selectedBooking.id].amount ? formatAmount(invoices[selectedBooking.id].amount) : '0.00'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Invoice #:</span>
                          <span className="text-gray-700">{invoices[selectedBooking.id].number || 'N/A'}</span>
                        </div>
                        {invoices[selectedBooking.id].status === 'paid' && (
                          <div className="mt-2 p-2 bg-green-50 rounded-lg text-center text-sm text-green-700">
                            ✓ Payment completed
                          </div>
                        )}
                      </>
                    ) : (
                      /* Fallback to booking display */
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-700">Base Service:</span>
                          <span className="font-semibold">${parseFloat(selectedBooking.service_price || 0).toFixed(2)}</span>
                        </div>

                        {selectedBooking.display && (
                          <div className="text-sm text-gray-600">
                            <p>Standard: {formatDuration(selectedBooking.display.standard_duration)}</p>
                            <p>Actual: {formatDuration(selectedBooking.display.actual_duration)}</p>
                          </div>
                        )}

                        {selectedBooking.display?.has_overtime && (
                          <>
                            <div className="flex justify-between text-purple-600">
                              <span>Overtime ({selectedBooking.display.overtime_minutes} min):</span>
                              <span className="font-semibold">+${selectedBooking.display.overtime_earnings.toFixed(2)}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Rate: ${selectedBooking.display.overtime_rate}/hour
                            </div>
                          </>
                        )}

                        <div className="border-t border-gray-300 pt-3 mt-3">
                          <div className="flex justify-between">
                            <span className="text-lg font-bold text-gray-900">Total:</span>
                            <span className="text-lg font-bold text-green-600">
                              ${(selectedBooking.display?.customer_total || parseFloat(selectedBooking.service_price || 0)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Review Section - Show if completed and paid */}
                {selectedBooking.status === 'completed' && reviewStatus[selectedBooking.id]?.can_review && (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setReviewBooking(selectedBooking)
                        setShowReviewModal(true)
                      }}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      ⭐ Write a Review
                    </button>
                  </div>
                )}

                {/* Show existing review */}
                {reviewStatus[selectedBooking.id]?.has_reviewed && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Your Review</h4>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className={star <= reviewStatus[selectedBooking.id].existing_review?.rating ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                    {reviewStatus[selectedBooking.id].existing_review?.review && (
                      <p className="text-sm text-gray-600">&quot;{reviewStatus[selectedBooking.id].existing_review.review}&quot;</p>
                    )}
                  </div>
                )}

                {/* Status History */}
                {selectedBooking.status_history && selectedBooking.status_history.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Status History</h3>
                    <div className="space-y-2">
                      {selectedBooking.status_history.map((history, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
                          <div>
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(history.status)}`}>
                              {history.status?.replace('_', ' ')}
                            </span>
                            {history.notes && (
                              <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(history.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && reviewBooking && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-4">Rate Your Experience</h3>
                <p className="text-sm text-gray-600 mb-4">{reviewBooking.service_name} with {reviewBooking.provider_name}</p>

                {/* Star Rating */}
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setReviewData({ ...reviewData, rating: star })}
                      className={`text-3xl transition-colors ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                {/* Review Text */}
                <textarea
                  placeholder="Write your review (optional)"
                  value={reviewData.review}
                  onChange={(e) => setReviewData({ ...reviewData, review: e.target.value })}
                  className="w-full p-3 border rounded-lg mb-4 h-24 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />

                {/* Anonymous Option */}
                <label className="flex items-center gap-2 mb-6">
                  <input
                    type="checkbox"
                    checked={reviewData.is_anonymous}
                    onChange={(e) => setReviewData({ ...reviewData, is_anonymous: e.target.checked })}
                    className="rounded text-purple-600"
                  />
                  <span className="text-sm text-gray-600">Post anonymously</span>
                </label>

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={submitReview}
                    disabled={submittingReview}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReviewModal(false)
                      setReviewData({ rating: 5, review: '', is_anonymous: false })
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}