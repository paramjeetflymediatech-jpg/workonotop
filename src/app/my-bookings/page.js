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
        setBookings(data.data || [])
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
      }
    } catch (error) {
      console.error('Error fetching booking details:', error)
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    return booking.status === filter
  })

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
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
    const slots = {
      'morning': '8:00 AM - 12:00 PM',
      'afternoon': '12:00 PM - 5:00 PM',
      'evening': '5:00 PM - 9:00 PM'
    }
    return slots[slot] || slot
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
          {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === status
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
            {filteredBookings.map((booking) => (
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

                  {/* Category */}
                  <p className="text-sm text-gray-600 mb-4">
                    {booking.category_name}
                  </p>

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

                  {/* Price */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <p className="text-2xl font-bold text-green-600">
                      ${(parseFloat(booking.service_price) + parseFloat(booking.additional_price || 0)).toFixed(2)}
                    </p>
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
            ))}
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
                : `No ${filter} bookings`}
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
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Service Price:</span>
                    <span className="font-semibold">${parseFloat(selectedBooking.service_price).toFixed(2)}</span>
                  </div>
                  {parseFloat(selectedBooking.additional_price) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Additional Charges:</span>
                      <span className="font-semibold">${parseFloat(selectedBooking.additional_price).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-lg font-bold text-green-600">
                        ${(parseFloat(selectedBooking.service_price) + parseFloat(selectedBooking.additional_price || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

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
    </div>
    </>
  )
}