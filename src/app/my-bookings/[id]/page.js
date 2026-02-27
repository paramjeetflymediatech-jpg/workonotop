'use client'

import { useState, useEffect } from 'react'
import { useAuth } from 'src/context/AuthContext'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import ChatBox from '@/components/ChatBox'
import {
  Calendar, Clock, MapPin, User, Phone, Mail,
  Star, MessageCircle, ArrowLeft, CreditCard,
  CheckCircle, XCircle, AlertCircle, Image as ImageIcon
} from 'lucide-react'

export default function BookingDetails() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const bookingId = params.id

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('details')
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadBookingDetails()
  }, [user, bookingId])

  const loadBookingDetails = async () => {
    try {
      const res = await fetch(`/api/customer/booking-details?bookingId=${bookingId}`)
      const data = await res.json()
      if (data.success) {
        setBooking(data.booking)
      } else {
        setError(data.message)
      }
    } catch (error) {
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'matching': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'in_progress': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'completed': return 'bg-green-50 text-green-700 border-green-200'
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2
    }).format(amount || 0)
  }

  const formatTimeSlot = (slot) => {
    const slots = {
      'morning': '8:00 AM - 12:00 PM',
      'afternoon': '12:00 PM - 5:00 PM',
      'evening': '5:00 PM - 9:00 PM'
    }
    return slots[slot] || slot
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
      </>
    )
  }

  if (error || !booking) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-sm">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h2>
              <p className="text-gray-500 mb-6">{error || 'The booking you are looking for does not exist'}</p>
              <Link 
                href="/my-bookings" 
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-semibold transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to My Bookings
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  const canChat = booking.status === 'confirmed' || booking.status === 'in_progress'
  const hasPhotos = (booking.photos?.booking_photos?.length > 0) || (booking.photos?.job_photos?.length > 0)

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-6 md:py-8">
        <div className="max-w-5xl mx-auto px-4">
          {/* Back button & header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link 
              href="/my-bookings" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition" />
              <span className="text-sm font-medium">Back to Bookings</span>
            </Link>
            <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
              {booking.status?.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          {/* Booking Title */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{booking.service.name}</h1>
            <p className="text-sm text-gray-500">Booking #{booking.booking_number}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 md:gap-2 mb-6 border-b border-gray-200 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-sm font-medium transition border-b-2 whitespace-nowrap ${
                activeTab === 'details'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Details
            </button>
            {hasPhotos && (
              <button
                onClick={() => setActiveTab('photos')}
                className={`px-4 py-2 text-sm font-medium transition border-b-2 whitespace-nowrap ${
                  activeTab === 'photos'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Photos
              </button>
            )}
            {canChat && (
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 text-sm font-medium transition border-b-2 whitespace-nowrap ${
                  activeTab === 'chat'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Chat {booking.message_count > 0 && `(${booking.message_count})`}
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Provider Info */}
              {booking.provider && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-green-600" />
                    Service Provider
                  </h2>
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                      {booking.provider.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{booking.provider.name}</h3>
                      {booking.provider.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium">{booking.provider.rating.toFixed(1)}</span>
                          {booking.provider.specialty && (
                            <span className="text-xs text-gray-400 ml-2">• {booking.provider.specialty}</span>
                          )}
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-3 text-sm text-gray-600">
                        {booking.provider.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {booking.provider.phone}
                          </span>
                        )}
                        {booking.provider.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            {booking.provider.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Job Details */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Job Details</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Date & Time</p>
                      <p className="text-sm text-gray-600">{formatDate(booking.job.date)}</p>
                      <p className="text-sm text-gray-600">{formatTimeSlot(booking.job.time_slot)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">{booking.location.address_line1}</p>
                      {booking.location.address_line2 && (
                        <p className="text-sm text-gray-600">{booking.location.address_line2}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        {booking.location.city}, {booking.location.postal_code}
                      </p>
                    </div>
                  </div>

                  {booking.job.description && (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Description</p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{booking.job.description}</p>
                      </div>
                    </div>
                  )}

                  {booking.job.instructions && (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Special Instructions</p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{booking.job.instructions}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    {booking.job.parking_access && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">🚗 Parking Available</span>
                    )}
                    {booking.job.elevator_access && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">🛗 Elevator Access</span>
                    )}
                    {booking.job.has_pets && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">🐾 Has Pets</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-600" />
                  Payment Details
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Price</span>
                    <span className="font-medium">{formatCurrency(booking.pricing.base_price)}</span>
                  </div>
                  
                  {booking.pricing.overtime_minutes > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Overtime ({booking.pricing.overtime_minutes} min)</span>
                      <span className="font-medium text-purple-600">+{formatCurrency(booking.pricing.overtime_earnings)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatCurrency(booking.pricing.total)}
                      </span>
                    </div>
                  </div>

                  {booking.payment.invoice && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {booking.payment.invoice.status === 'paid' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          )}
                          <span className="text-sm font-medium">
                            Invoice #{booking.payment.invoice.number}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-green-600">
                          {booking.payment.invoice.status}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline - CLEAN VERSION (No admin commission) */}
              {booking.status_history?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Status Timeline</h2>
                  <div className="space-y-4">
                    {booking.status_history.map((history, index) => {
                      // Filter out admin commission notes
                      let displayNotes = history.notes;
                      if (displayNotes && displayNotes.includes('Commission set to')) {
                        displayNotes = ''; // Remove commission notes
                      }
                      if (displayNotes && displayNotes.includes('Admin:')) {
                        displayNotes = ''; // Remove any admin mentions
                      }
                      
                      return (
                        <div key={index} className="flex gap-3">
                          <div className="relative">
                            <div className="w-2 h-2 mt-2 rounded-full bg-green-600"></div>
                            {index < booking.status_history.length - 1 && (
                              <div className="absolute top-4 left-1 w-0.5 h-12 bg-gray-200"></div>
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="text-sm font-semibold text-gray-900">
                              {history.status.replace('_', ' ').toUpperCase()}
                            </p>
                            {displayNotes && displayNotes !== 'Booking created' && (
                              <p className="text-xs text-gray-500 mt-1">{displayNotes}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(history.created_at)} at {formatTime(history.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Timeline - If no notes at all, use this simpler version */}
              {/* {booking.status_history?.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Status Timeline</h2>
                  <div className="space-y-4">
                    {booking.status_history.map((history, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="relative">
                          <div className="w-2 h-2 mt-2 rounded-full bg-green-600"></div>
                          {index < booking.status_history.length - 1 && (
                            <div className="absolute top-4 left-1 w-0.5 h-12 bg-gray-200"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <p className="text-sm font-semibold text-gray-900">
                            {history.status.replace('_', ' ').toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(history.created_at)} at {formatTime(history.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && hasPhotos && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-green-600" />
                Job Photos
              </h2>
              
              {/* Booking Photos */}
              {booking.photos?.booking_photos?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Booking Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {booking.photos.booking_photos.map((photo, index) => (
                      <div key={index} className="relative group cursor-pointer" onClick={() => setSelectedImage(photo.photo_url)}>
                        <img
                          src={photo.photo_url}
                          alt={`Booking photo ${index + 1}`}
                          className="w-full h-40 object-cover rounded-xl border border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center">
                          <span className="bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs font-medium">View</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Photos (Before/After) */}
              {booking.photos?.job_photos?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Work Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {booking.photos.job_photos.map((photo, index) => (
                      <div key={index} className="relative group cursor-pointer" onClick={() => setSelectedImage(photo.photo_url)}>
                        <img
                          src={photo.photo_url}
                          alt={`${photo.photo_type} photo`}
                          className="w-full h-40 object-cover rounded-xl border border-gray-200"
                        />
                        <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                          {photo.photo_type}
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center">
                          <span className="bg-white text-gray-900 px-3 py-1.5 rounded-lg text-xs font-medium">View</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && canChat && booking.provider && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="h-[500px]">
                <ChatBox bookingId={booking.id} currentUserType="customer" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white w-10 h-10 rounded-full flex items-center justify-center transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Mobile Chat Button */}
      {canChat && activeTab !== 'chat' && (
        <div className="fixed bottom-6 left-0 right-0 px-4 md:hidden">
          <button
            onClick={() => setActiveTab('chat')}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with Provider
          </button>
        </div>
      )}
    </>
  )
}