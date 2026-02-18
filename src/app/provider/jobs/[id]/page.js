// // app/provider/jobs/[id]/page.jsx - COMPLETE with all validations

// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import React from 'react'
// import TimeTracker from '../TimeTracker'
// import JobPhotoUpload from '../JobPhotoUpload'

// export default function ProviderJobDetail({ params }) {
//   const router = useRouter()
//   const { id } = React.use(params)

//   const [job, setJob] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [photos, setPhotos] = useState({ before: [], after: [] })
//   const [toast, setToast] = useState(null)
//   const [mounted, setMounted] = useState(false)
//   const [showContact, setShowContact] = useState(false)

//   useEffect(() => {
//     setMounted(true)
//     checkAuth()
//     loadJob()
//     loadPhotos()
//   }, [id])

//   const checkAuth = () => {
//     if (typeof window !== 'undefined') {
//       const token = localStorage.getItem('providerToken')
//       if (!token) {
//         router.push('/provider/login')
//       }
//     }
//   }

//   const token = () => {
//     if (typeof window !== 'undefined') {
//       return localStorage.getItem('providerToken')
//     }
//     return null
//   }

//   const loadJob = async () => {
//     setLoading(true)
//     try {
//       const res = await fetch(`/api/provider/jobs/${id}`, {
//         headers: { Authorization: `Bearer ${token()}` }
//       })
//       const data = await res.json()
      
//       if (data.success) {
//         setJob(data.data)
//       } else {
//         showToast('error', data.message || 'Job not found')
//       }
//     } catch (error) {
//       showToast('error', 'Failed to load job')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const loadPhotos = async () => {
//     try {
//       const res = await fetch(`/api/provider/jobs/photos?booking_id=${id}`, {
//         headers: { Authorization: `Bearer ${token()}` }
//       })
//       const data = await res.json()
//       if (data.success) {
//         setPhotos(data.data)
//       }
//     } catch (error) {
//       console.error('Failed to load photos:', error)
//     }
//   }

//   const showToast = (type, text) => {
//     setToast({ type, text })
//     setTimeout(() => setToast(null), 4000)
//   }

//   const handleJobComplete = (jobData) => {
//     showToast('success', `Job completed! Duration: ${formatDuration(jobData.total_minutes)}`)
//     loadJob()
//   }

//   const handlePhotoUpload = (type) => {
//     showToast('success', `${type === 'before' ? 'Before' : 'After'} photos uploaded successfully`)
//     loadPhotos()
//   }

//   const formatDate = (dateString) => {
//     if (!dateString) return ''
//     return new Date(dateString).toLocaleDateString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     })
//   }

//   const formatDateTime = (date) => {
//     if (!date) return ''
//     return new Date(date).toLocaleString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   const formatDuration = (minutes) => {
//     if (!minutes || minutes === 0) return 'Not started'
//     if (minutes < 60) return `${minutes} min`
//     const hours = Math.floor(minutes / 60)
//     const mins = minutes % 60
//     return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
//   }

//   const getStatusColor = (status) => {
//     const colors = {
//       confirmed: 'bg-blue-100 text-blue-800',
//       in_progress: 'bg-yellow-100 text-yellow-800',
//       completed: 'bg-green-100 text-green-800'
//     }
//     return colors[status] || 'bg-gray-100 text-gray-800'
//   }

//   if (!mounted || loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent" />
//       </div>
//     )
//   }

//   if (!job) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <p className="text-gray-500">Job not found</p>
//           <Link href="/provider/jobs" className="mt-4 text-green-600">
//             Back to Jobs
//           </Link>
//         </div>
//       </div>
//     )
//   }

//   const hasOvertime = parseFloat(job.additional_price || 0) > 0
//   const overtimeRate = parseFloat(job.additional_price || 0)
//   const duration = job.duration_minutes || 60

//   return (
//     <div className="min-h-screen bg-gray-50 pb-20">
//       {/* Toast */}
//       {toast && (
//         <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium
//           ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
//           {toast.text}
//         </div>
//       )}

//       {/* Header */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="max-w-4xl mx-auto px-4 py-4">
//           <div className="flex items-center justify-between">
//             <Link href="/provider/jobs" className="text-gray-600 hover:text-gray-900">
//               ← Back to Jobs
//             </Link>
//             <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
//               {job.status?.replace('_', ' ')}
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-4xl mx-auto px-4 py-6">
//         <div className="grid gap-6">
//           {/* Job Title */}
//           <div className="bg-white rounded-2xl border border-gray-200 p-6">
//             <h1 className="text-2xl font-bold text-gray-900">{job.service_name}</h1>
//             <p className="text-sm text-gray-500 mt-1">#{job.booking_number}</p>
//           </div>

//           {/* CUSTOMER CONTACT - Only visible after confirmation */}
//           {(job.status === 'confirmed' || job.status === 'in_progress' || job.status === 'completed') && (
//             <div className="bg-white rounded-2xl border border-blue-200 p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//                   <span>👤</span> Customer Contact
//                 </h2>
//                 <button
//                   onClick={() => setShowContact(!showContact)}
//                   className="text-sm text-blue-600 hover:text-blue-700"
//                 >
//                   {showContact ? 'Hide' : 'Show'} Contact Info
//                 </button>
//               </div>

//               {showContact && (
//                 <div className="space-y-3">
//                   <div className="flex items-center gap-3">
//                     <span className="text-gray-400 w-20">Name:</span>
//                     <span className="font-medium">{job.customer_first_name} {job.customer_last_name}</span>
//                   </div>
                  
//                   {job.customer_email && (
//                     <div className="flex items-center gap-3">
//                       <span className="text-gray-400 w-20">Email:</span>
//                       <a href={`mailto:${job.customer_email}`} className="text-blue-600 hover:underline">
//                         {job.customer_email}
//                       </a>
//                     </div>
//                   )}
                  
//                   {job.customer_phone && (
//                     <div className="flex items-center gap-3">
//                       <span className="text-gray-400 w-20">Phone:</span>
//                       <a href={`tel:${job.customer_phone}`} className="text-blue-600 hover:underline">
//                         {job.customer_phone}
//                       </a>
//                     </div>
//                   )}

//                   {/* Quick Actions */}
//                   <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
//                     {job.customer_phone && (
//                       <>
//                         <a
//                           href={`tel:${job.customer_phone}`}
//                           className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold text-center hover:bg-green-700"
//                         >
//                           📞 Call
//                         </a>
//                         <a
//                           href={`https://wa.me/${job.customer_phone.replace(/\D/g, '')}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold text-center hover:bg-emerald-700"
//                         >
//                           💬 WhatsApp
//                         </a>
//                       </>
//                     )}
//                     {job.customer_email && (
//                       <a
//                         href={`mailto:${job.customer_email}`}
//                         className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold text-center hover:bg-blue-700"
//                       >
//                         📧 Email
//                       </a>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Job Details */}
//           <div className="bg-white rounded-2xl border border-gray-200 p-6">
//             <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
            
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <p className="text-xs text-gray-400">Date</p>
//                 <p className="text-sm font-medium">{formatDate(job.job_date)}</p>
//               </div>
//               <div>
//                 <p className="text-xs text-gray-400">Time Slots</p>
//                 <div className="flex flex-wrap gap-1 mt-1">
//                   {job.job_time_slot?.map((slot, i) => (
//                     <span key={i} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
//                       {slot}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//               <div className="col-span-2">
//                 <p className="text-xs text-gray-400">Location</p>
//                 <p className="text-sm font-medium">{job.address_line1}</p>
//                 {job.address_line2 && <p className="text-sm text-gray-500">{job.address_line2}</p>}
//                 {job.city && <p className="text-sm text-gray-500">{job.city} {job.postal_code}</p>}
//               </div>
//             </div>

//             {/* Access Icons */}
//             <div className="flex flex-wrap gap-2 mt-4">
//               {job.parking_access && (
//                 <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">
//                   🅿️ Parking
//                 </span>
//               )}
//               {job.elevator_access && (
//                 <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">
//                   🛗 Elevator
//                 </span>
//               )}
//               {job.has_pets && (
//                 <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-200">
//                   🐕 Pets
//                 </span>
//               )}
//             </div>

//             {/* Description */}
//             {job.job_description && (
//               <div className="mt-4 pt-4 border-t border-gray-100">
//                 <p className="text-xs text-gray-400 mb-1">Description</p>
//                 <p className="text-sm text-gray-700">{job.job_description}</p>
//               </div>
//             )}

//             {/* Instructions */}
//             {job.instructions && (
//               <div className="mt-4 pt-4 border-t border-gray-100">
//                 <p className="text-xs text-gray-400 mb-1">Special Instructions</p>
//                 <p className="text-sm text-gray-700">{job.instructions}</p>
//               </div>
//             )}
//           </div>

//           {/* Time Tracking - Only for confirmed/in_progress jobs */}
//           {(job.status === 'confirmed' || job.status === 'in_progress') && (
//             <div className="bg-white rounded-2xl border border-gray-200 p-6">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">Time Tracking</h2>
//               <TimeTracker 
//                 bookingId={job.id}
//                 onComplete={handleJobComplete}
//                 standardDuration={duration}
//                 overtimeRate={overtimeRate}
//                 hasBeforePhotos={photos.before.length > 0}
//               />
//             </div>
//           )}

//           {/* Completed Job Summary */}
//           {job.status === 'completed' && (
//             <div className="bg-white rounded-2xl border border-green-200 p-6">
//               <h2 className="text-lg font-semibold text-green-700 mb-4 flex items-center gap-2">
//                 <span>✓</span> Job Completed
//               </h2>
              
//               <div className="space-y-2">
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Started:</span>
//                   <span className="font-medium">{formatDateTime(job.start_time)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Completed:</span>
//                   <span className="font-medium">{formatDateTime(job.end_time)}</span>
//                 </div>
//                 <div className="flex justify-between pt-2 border-t border-green-200">
//                   <span className="text-gray-600">Total time:</span>
//                   <span className="font-bold text-green-700">
//                     {formatDuration(job.actual_duration_minutes)}
//                   </span>
//                 </div>
//                 {job.overtime_minutes > 0 && (
//                   <div className="flex justify-between text-purple-600">
//                     <span>Overtime:</span>
//                     <span>{formatDuration(job.overtime_minutes)}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* PHOTO UPLOAD SECTION - For confirmed/in_progress jobs */}
//           {(job.status === 'confirmed' || job.status === 'in_progress') && (
//             <div className="space-y-4">
//               {/* Before Photos Section */}
//               <div className="bg-white rounded-2xl border border-gray-200 p-6">
//                 <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                   <span>📸</span> Before Work Photos
//                   {photos.before.length === 0 && job.status === 'confirmed' && (
//                     <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full ml-2">
//                       Required before starting
//                     </span>
//                   )}
//                 </h3>
                
//                 {photos.before.length > 0 ? (
//                   <>
//                     <div className="grid grid-cols-3 gap-2 mb-3">
//                       {photos.before.map((photo, index) => (
//                         <div 
//                           key={index}
//                           onClick={() => window.open(photo.photo_url, '_blank')}
//                           className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 border border-gray-200"
//                         >
//                           <img src={photo.photo_url} alt={`Before ${index + 1}`} className="w-full h-full object-cover" />
//                         </div>
//                       ))}
//                     </div>
//                     <p className="text-sm text-green-600 flex items-center gap-1">
//                       <span>✅</span> {photos.before.length} before photo{photos.before.length > 1 ? 's' : ''} uploaded
//                     </p>
//                   </>
//                 ) : (
//                   <>
//                     {job.status === 'confirmed' && (
//                       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
//                         <p className="text-sm text-yellow-800">
//                           ⚠️ You must upload before-work photos before you can start the job
//                         </p>
//                       </div>
//                     )}
//                     <JobPhotoUpload 
//                       bookingId={job.id}
//                       photoType="before"
//                       onUploadComplete={() => handlePhotoUpload('before')}
//                     />
//                   </>
//                 )}
//               </div>

//               {/* After Photos Section */}
//               <div className="bg-white rounded-2xl border border-gray-200 p-6">
//                 <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
//                   <span>📸</span> After Work Photos
//                   {photos.after.length === 0 && job.status === 'in_progress' && (
//                     <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full ml-2">
//                       Required before completion
//                     </span>
//                   )}
//                 </h3>
                
//                 {photos.after.length > 0 ? (
//                   <>
//                     <div className="grid grid-cols-3 gap-2 mb-3">
//                       {photos.after.map((photo, index) => (
//                         <div 
//                           key={index}
//                           onClick={() => window.open(photo.photo_url, '_blank')}
//                           className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 border border-gray-200"
//                         >
//                           <img src={photo.photo_url} alt={`After ${index + 1}`} className="w-full h-full object-cover" />
//                         </div>
//                       ))}
//                     </div>
//                     <p className="text-sm text-green-600 flex items-center gap-1">
//                       <span>✅</span> {photos.after.length} after photo{photos.after.length > 1 ? 's' : ''} uploaded
//                     </p>
//                   </>
//                 ) : (
//                   <>
//                     {job.status === 'in_progress' && (
//                       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
//                         <p className="text-sm text-yellow-800">
//                           ⚠️ You must upload after-work photos before you can complete the job
//                         </p>
//                       </div>
//                     )}
//                     <JobPhotoUpload 
//                       bookingId={job.id}
//                       photoType="after"
//                       onUploadComplete={() => handlePhotoUpload('after')}
//                     />
//                   </>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Show all photos for completed jobs */}
//           {job.status === 'completed' && (photos.before.length > 0 || photos.after.length > 0) && (
//             <div className="bg-white rounded-2xl border border-gray-200 p-6">
//               <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Photos</h2>
              
//               {photos.before.length > 0 && (
//                 <div className="mb-6">
//                   <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                     <span>📸</span> Before Work ({photos.before.length})
//                   </h3>
//                   <div className="grid grid-cols-3 gap-2">
//                     {photos.before.map((photo, index) => (
//                       <div 
//                         key={index}
//                         onClick={() => window.open(photo.photo_url, '_blank')}
//                         className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 border border-gray-200"
//                       >
//                         <img src={photo.photo_url} alt={`Before ${index + 1}`} className="w-full h-full object-cover" />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {photos.after.length > 0 && (
//                 <div>
//                   <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
//                     <span>📸</span> After Work ({photos.after.length})
//                   </h3>
//                   <div className="grid grid-cols-3 gap-2">
//                     {photos.after.map((photo, index) => (
//                       <div 
//                         key={index}
//                         onClick={() => window.open(photo.photo_url, '_blank')}
//                         className="aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 border border-gray-200"
//                       >
//                         <img src={photo.photo_url} alt={`After ${index + 1}`} className="w-full h-full object-cover" />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }










// app/provider/jobs/[id]/page.jsx - FIXED: no refresh needed after photo upload

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import TimeTracker from '../TimeTracker'
import JobPhotoUpload from '../JobPhotoUpload'

export default function ProviderJobDetail({ params }) {
  const router = useRouter()
  const { id } = React.use(params)

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [photos, setPhotos] = useState({ before: [], after: [] })
  const [toast, setToast] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [showContact, setShowContact] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkAuth()
    loadJob()
    loadPhotos()
  }, [id])

  const checkAuth = () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('providerToken')
      if (!token) router.push('/provider/login')
    }
  }

  const token = () => {
    if (typeof window !== 'undefined') return localStorage.getItem('providerToken')
    return null
  }

  const loadJob = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/provider/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const data = await res.json()
      if (data.success) setJob(data.data)
      else showToast('error', data.message || 'Job not found')
    } catch {
      showToast('error', 'Failed to load job')
    } finally {
      setLoading(false)
    }
  }

  // ✅ FIX: useCallback so we can call this from anywhere and always get fresh data
  const loadPhotos = useCallback(async () => {
    try {
      const res = await fetch(`/api/provider/jobs/photos?booking_id=${id}`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      const data = await res.json()
      if (data.success) setPhotos(data.data)
    } catch (error) {
      console.error('Failed to load photos:', error)
    }
  }, [id])

  const showToast = (type, text) => {
    setToast({ type, text })
    setTimeout(() => setToast(null), 4000)
  }

  const handleJobComplete = (jobData) => {
    showToast('success', `Job completed! Duration: ${formatDuration(jobData.total_minutes)}`)
    loadJob()
  }

  // ✅ FIX: After upload, immediately reload photos so TimeTracker gets updated hasAfterPhotos
  const handlePhotoUpload = async (type) => {
    showToast('success', `${type === 'before' ? 'Before' : 'After'} photos uploaded!`)
    await loadPhotos() // await so state updates before render
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const formatDateTime = (date) => {
    if (!date) return ''
    return new Date(date).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const formatDuration = (minutes) => {
    if (!minutes || minutes === 0) return 'Not started'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const STATUS_CONFIG = {
    confirmed:   { label: 'Confirmed',   classes: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' },
    in_progress: { label: 'In Progress', classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200' },
    completed:   { label: 'Completed',   classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' },
  }

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-green-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-green-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-slate-400 font-medium">Loading job…</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <p className="text-slate-500 text-lg">Job not found</p>
          <Link href="/provider/jobs" className="text-green-600 underline text-sm">
            ← Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  const hasOvertime = parseFloat(job.additional_price || 0) > 0
  const overtimeRate = parseFloat(job.additional_price || 0)
  const duration = job.duration_minutes || 60

  // ✅ FIX: These are derived from live `photos` state — update instantly on upload
  const hasBeforePhotos = photos.before.length > 0
  const hasAfterPhotos = photos.after.length > 0

  const statusCfg = STATUS_CONFIG[job.status] || { label: job.status, classes: 'bg-gray-100 text-gray-700' }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
        }`}>
          <span>{toast.type === 'success' ? '✓' : '✕'}</span>
          {toast.text}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/provider/jobs"
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
            Jobs
          </Link>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusCfg.classes}`}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* ── JOB TITLE CARD ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
            #{job.booking_number}
          </p>
          <h1 className="text-xl font-bold text-slate-900">{job.service_name}</h1>
        </div>

        {/* ── CUSTOMER CONTACT ── */}
        {['confirmed', 'in_progress', 'completed'].includes(job.status) && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setShowContact(!showContact)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <span className="font-semibold text-slate-800">Customer Contact</span>
              </div>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${showContact ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            {showContact && (
              <div className="px-5 pb-5 border-t border-slate-100">
                <div className="pt-4 space-y-2 mb-4">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-400 w-12 flex-shrink-0">Name</span>
                    <span className="font-medium text-slate-800">{job.customer_first_name} {job.customer_last_name}</span>
                  </div>
                  {job.customer_email && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-400 w-12 flex-shrink-0">Email</span>
                      <a href={`mailto:${job.customer_email}`} className="text-blue-600 hover:underline truncate">{job.customer_email}</a>
                    </div>
                  )}
                  {job.customer_phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-400 w-12 flex-shrink-0">Phone</span>
                      <a href={`tel:${job.customer_phone}`} className="text-blue-600 hover:underline">{job.customer_phone}</a>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {job.customer_phone && (
                    <>
                      <a href={`tel:${job.customer_phone}`}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-600 text-white rounded-xl text-xs font-semibold hover:bg-green-700 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                        </svg>
                        Call
                      </a>
                      <a href={`https://wa.me/${job.customer_phone.replace(/\D/g, '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors">
                        WhatsApp
                      </a>
                    </>
                  )}
                  {job.customer_email && (
                    <a href={`mailto:${job.customer_email}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors">
                      Email
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── JOB DETAILS ── */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Job Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Date</p>
              <p className="text-sm font-medium text-slate-800">{formatDate(job.job_date)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Time Slots</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {job.job_time_slot?.map((slot, i) => (
                  <span key={i} className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">{slot}</span>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Location</p>
              <p className="text-sm font-medium text-slate-800">{job.address_line1}</p>
              {job.address_line2 && <p className="text-sm text-slate-500">{job.address_line2}</p>}
              {job.city && <p className="text-sm text-slate-500">{job.city} {job.postal_code}</p>}
            </div>
          </div>

          {(job.parking_access || job.elevator_access || job.has_pets) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
              {job.parking_access && (
                <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 font-medium">Parking</span>
              )}
              {job.elevator_access && (
                <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200 font-medium">Elevator</span>
              )}
              {job.has_pets && (
                <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200 font-medium">Pets on site</span>
              )}
            </div>
          )}

          {job.job_description && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Description</p>
              <p className="text-sm text-slate-700 leading-relaxed">{job.job_description}</p>
            </div>
          )}

          {job.instructions && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Special Instructions</p>
              <p className="text-sm text-slate-700 leading-relaxed">{job.instructions}</p>
            </div>
          )}
        </div>

        {/* ── PHOTO SECTIONS (confirmed / in_progress) ── */}
        {['confirmed', 'in_progress'].includes(job.status) && (
          <>
            {/* BEFORE PHOTOS */}
            <PhotoSection
              title="Before Work Photos"
              type="before"
              photos={photos.before}
              required={job.status === 'confirmed'}
              requiredMessage="Required before you can start the job"
              warningMessage="Upload before-work photos to start the job"
              bookingId={job.id}
              onUploadComplete={() => handlePhotoUpload('before')}
            />

            {/* AFTER PHOTOS — only show once job is in progress */}
            {job.status === 'in_progress' && (
              <PhotoSection
                title="After Work Photos"
                type="after"
                photos={photos.after}
                required={true}
                requiredMessage="Required before you can complete the job"
                warningMessage="Upload after-work photos to complete the job"
                bookingId={job.id}
                onUploadComplete={() => handlePhotoUpload('after')}
              />
            )}
          </>
        )}

        {/* ── TIME TRACKING ── */}
        {/* ✅ FIX: Pass LIVE hasBeforePhotos and hasAfterPhotos from state — updates instantly */}
        {['confirmed', 'in_progress'].includes(job.status) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Time Tracking</h2>

            {/* Validation checklist — shows what's needed */}
            <div className="space-y-2 mb-5">
              <ValidationRow
                done={hasBeforePhotos}
                label="Before photos uploaded"
                pending="Upload before photos first"
              />
              {job.status === 'in_progress' && (
                <ValidationRow
                  done={hasAfterPhotos}
                  label="After photos uploaded"
                  pending="Upload after photos to complete"
                />
              )}
            </div>

            <TimeTracker
              bookingId={job.id}
              onComplete={handleJobComplete}
              standardDuration={duration}
              overtimeRate={overtimeRate}
              hasBeforePhotos={hasBeforePhotos}   // ✅ live from state
              hasAfterPhotos={hasAfterPhotos}     // ✅ live from state
            />
          </div>
        )}

        {/* ── COMPLETED SUMMARY ── */}
        {job.status === 'completed' && (
          <div className="bg-white rounded-2xl border border-emerald-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h2 className="font-semibold text-emerald-700">Job Completed</h2>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Started</span>
                <span className="font-medium text-slate-800">{formatDateTime(job.start_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Completed</span>
                <span className="font-medium text-slate-800">{formatDateTime(job.end_time)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-emerald-100">
                <span className="text-slate-500">Total time</span>
                <span className="font-bold text-emerald-700">{formatDuration(job.actual_duration_minutes)}</span>
              </div>
              {job.overtime_minutes > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Overtime</span>
                  <span className="font-semibold text-violet-600">{formatDuration(job.overtime_minutes)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── COMPLETED JOB PHOTOS ── */}
        {job.status === 'completed' && (photos.before.length > 0 || photos.after.length > 0) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Job Photos</h2>
            {photos.before.length > 0 && (
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                  Before ({photos.before.length})
                </p>
                <PhotoGrid photos={photos.before} label="Before" />
              </div>
            )}
            {photos.after.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                  After ({photos.after.length})
                </p>
                <PhotoGrid photos={photos.after} label="After" />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

// ── HELPER COMPONENTS ──

function PhotoSection({ title, type, photos, required, requiredMessage, warningMessage, bookingId, onUploadComplete }) {
  const done = photos.length > 0
  return (
    <div className={`bg-white rounded-2xl border p-5 ${
      required && !done ? 'border-amber-200' : 'border-slate-200'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-800">{title}</h3>
        {required && !done && (
          <span className="text-[10px] font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full">
            {requiredMessage}
          </span>
        )}
        {done && (
          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
            ✓ {photos.length} uploaded
          </span>
        )}
      </div>

      {done ? (
        <PhotoGrid photos={photos} label={type} />
      ) : (
        <>
          {required && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
              <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <p className="text-xs text-amber-800 font-medium">{warningMessage}</p>
            </div>
          )}
          <JobPhotoUpload
            bookingId={bookingId}
            photoType={type}
            onUploadComplete={onUploadComplete}
          />
        </>
      )}
    </div>
  )
}

function PhotoGrid({ photos, label }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((photo, index) => (
        <div
          key={index}
          onClick={() => window.open(photo.photo_url, '_blank')}
          className="aspect-square rounded-xl overflow-hidden bg-slate-100 cursor-pointer hover:opacity-90 border border-slate-200 transition-opacity"
        >
          <img src={photo.photo_url} alt={`${label} ${index + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  )
}

function ValidationRow({ done, label, pending }) {
  return (
    <div className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-xl ${
      done ? 'bg-emerald-50' : 'bg-slate-50'
    }`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
        done ? 'bg-emerald-500' : 'bg-slate-200'
      }`}>
        {done ? (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        ) : (
          <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="0"/>
          </svg>
        )}
      </div>
      <span className={done ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
        {done ? label : pending}
      </span>
    </div>
  )
}