// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAdminTheme } from '../layout'

// export default function JobRequests() {
//   const router = useRouter()
//   const { isDarkMode } = useAdminTheme()
//   const [jobs, setJobs] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [filter, setFilter] = useState('all')
//   const [tradespeople, setTradespeople] = useState([])
//   const [updatingJob, setUpdatingJob] = useState(null)
//   const [showSuccessMessage, setShowSuccessMessage] = useState('')
//   const [showErrorMessage, setShowErrorMessage] = useState('')

//   useEffect(() => {
//     checkAuth()
//     loadJobs()
//     loadTradespeople()
//   }, [])

//   const checkAuth = () => {
//     const auth = localStorage.getItem('adminAuth')
//     if (!auth) router.push('/')
//   }

//   const loadJobs = async () => {
//     setLoading(true)
//     try {
//       const res = await fetch('/api/bookings')
//       const data = await res.json()
//       if (data.success) setJobs(data.data || [])
//     } catch (error) {
//       showMessage('error', 'Failed to load jobs')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const loadTradespeople = async () => {
//     try {
//       const res = await fetch('/api/providers?status=active')
//       const data = await res.json()
//       if (data.success) setTradespeople(data.data || [])
//     } catch (error) {
//       console.error('Error loading tradespeople:', error)
//     }
//   }

//   const showMessage = (type, message) => {
//     if (type === 'success') {
//       setShowSuccessMessage(message)
//       setTimeout(() => setShowSuccessMessage(''), 3000)
//     } else {
//       setShowErrorMessage(message)
//       setTimeout(() => setShowErrorMessage(''), 3000)
//     }
//   }

//   const assignProvider = async (jobId, providerId) => {
//     if (!providerId) return
//     setUpdatingJob(jobId)
//     try {
//       const res = await fetch(`/api/bookings?id=${jobId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ provider_id: providerId })
//       })
//       const data = await res.json()
//       if (data.success) {
//         showMessage('success', 'Provider assigned')
//         loadJobs()
//       }
//     } catch (error) {
//       showMessage('error', 'Failed to assign provider')
//     } finally {
//       setUpdatingJob(null)
//     }
//   }

//   const filteredJobs = jobs.filter(job => filter === 'all' || job.status === filter)

//   const getStatusColor = (status) => {
//     const colors = {
//       pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
//       matching: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
//       confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
//       in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
//       completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
//       cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
//     }
//     return colors[status] || 'bg-gray-100 text-gray-800'
//   }

//   const calculateTotal = (job) => {
//     return (parseFloat(job.service_price) + parseFloat(job.additional_price || 0)).toFixed(2)
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-6">
//       {/* Messages */}
//       {showSuccessMessage && (
//         <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
//           {showSuccessMessage}
//         </div>
//       )}
//       {showErrorMessage && (
//         <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
//           {showErrorMessage}
//         </div>
//       )}

//       {/* Header */}
//       <div className="mb-6">
//         <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//           Job Requests
//         </h1>
//         <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//           Click on any row to view complete details
//         </p>
//       </div>

//       {/* Filters */}
//       <div className="mb-6 flex flex-wrap gap-2">
//         {['all', 'pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
//           <button
//             key={status}
//             onClick={() => setFilter(status)}
//             className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
//               filter === status
//                 ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
//                 : isDarkMode
//                   ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
//                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             {status === 'in_progress' ? 'In Progress' : status.replace('_', ' ')}
//             {filter === status && (
//               <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
//                 {filteredJobs.length}
//               </span>
//             )}
//           </button>
//         ))}
//       </div>

//       {/* Jobs Grid - Cards for better visibility */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {filteredJobs.length > 0 ? (
//           filteredJobs.map((job) => (
//             <div
//               key={job.id}
//               onClick={() => router.push(`/admin/bookings/${job.id}`)}
//               className={`rounded-xl shadow-md border p-5 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
//                 isDarkMode 
//                   ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' 
//                   : 'bg-white border-gray-200 hover:border-teal-300'
//               } ${updatingJob === job.id ? 'opacity-50' : ''}`}
//             >
//               {/* Header with Booking # and Status */}
//               <div className="flex justify-between items-start mb-3">
//                 <span className={`font-mono text-sm font-bold ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
//                   #{job.booking_number}
//                 </span>
//                 <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
//                   {job.status === 'in_progress' ? 'In Progress' : job.status}
//                 </span>
//               </div>

//               {/* Customer Info */}
//               <div className="mb-3">
//                 <p className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   {job.customer_first_name} {job.customer_last_name}
//                 </p>
//                 <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//                   {job.customer_email}
//                 </p>
//               </div>

//               {/* Service & Date */}
//               <div className="grid grid-cols-2 gap-2 mb-3">
//                 <div>
//                   <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>Service</p>
//                   <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                     {job.service_name}
//                   </p>
//                 </div>
//                 <div>
//                   <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>Date</p>
//                   <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                     {new Date(job.job_date).toLocaleDateString()}
//                   </p>
//                 </div>
//               </div>

//               {/* Provider & Amount */}
//               <div className="grid grid-cols-2 gap-2">
//                 <div>
//                   <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>Provider</p>
//                   {job.provider_name ? (
//                     <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       {job.provider_name}
//                     </p>
//                   ) : (
//                     <select
//                       onClick={(e) => e.stopPropagation()}
//                       onChange={(e) => assignProvider(job.id, e.target.value)}
//                       className={`text-sm rounded-lg px-2 py-1 border w-full ${
//                         isDarkMode 
//                           ? 'bg-slate-800 text-white border-slate-700' 
//                           : 'bg-gray-100 text-gray-900 border-gray-200'
//                       }`}
//                       defaultValue=""
//                       disabled={updatingJob === job.id}
//                     >
//                       <option value="" disabled>Assign</option>
//                       {tradespeople.map(provider => (
//                         <option key={provider.id} value={provider.id}>
//                           {provider.name}
//                         </option>
//                       ))}
//                     </select>
//                   )}
//                 </div>
//                 <div>
//                   <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>Amount</p>
//                   <p className={`text-lg font-bold text-teal-600`}>
//                     ${calculateTotal(job)}
//                   </p>
//                 </div>
//               </div>

//               {/* Quick location preview */}
//               <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
//                 <p className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//                   📍 {job.address_line1}
//                 </p>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="col-span-full text-center py-12">
//             <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//               No jobs found
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }













'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminTheme } from '../layout'

export default function JobRequests() {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [tradespeople, setTradespeople] = useState([])
  const [updatingJob, setUpdatingJob] = useState(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState('')
  const [showErrorMessage, setShowErrorMessage] = useState('')

  useEffect(() => {
    checkAuth()
    loadJobs()
    loadTradespeople()
  }, [])

  const checkAuth = () => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) router.push('/')
  }

  const loadJobs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      if (data.success) {
        setJobs(data.data || [])
      }
    } catch (error) {
      showMessage('error', 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const loadTradespeople = async () => {
    try {
      const res = await fetch('/api/provider?status=active')
      const data = await res.json()
      if (data.success) {
        setTradespeople(data.data || [])
      }
    } catch (error) {
      console.error('Error loading tradespeople:', error)
    }
  }

  const showMessage = (type, message) => {
    if (type === 'success') {
      setShowSuccessMessage(message)
      setTimeout(() => setShowSuccessMessage(''), 3000)
    } else {
      setShowErrorMessage(message)
      setTimeout(() => setShowErrorMessage(''), 3000)
    }
  }

  const assignProvider = async (jobId, providerId) => {
    if (!providerId) return
    setUpdatingJob(jobId)
    try {
      const res = await fetch(`/api/bookings?id=${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          provider_id: providerId,
          status: 'matching' // Auto update status to matching when provider assigned
        })
      })
      const data = await res.json()
      if (data.success) {
        showMessage('success', 'Provider assigned successfully')
        loadJobs()
      } else {
        showMessage('error', data.message || 'Failed to assign provider')
      }
    } catch (error) {
      showMessage('error', 'Failed to assign provider')
    } finally {
      setUpdatingJob(null)
    }
  }

  const filteredJobs = jobs.filter(job => filter === 'all' || job.status === filter)

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      matching: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const calculateTotal = (job) => {
    return (parseFloat(job.service_price) + parseFloat(job.additional_price || 0)).toFixed(2)
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
      {/* Messages */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {showSuccessMessage}
        </div>
      )}
      {showErrorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {showErrorMessage}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Job Requests
        </h1>
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          Manage and assign jobs to tradespeople
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {['all', 'pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === status
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md'
                : isDarkMode
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'in_progress' ? 'In Progress' : status.replace('_', ' ')}
            {filter === status && (
              <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {filteredJobs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className={`rounded-xl shadow-md border p-5 transition-all hover:shadow-lg ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' 
                  : 'bg-white border-gray-200 hover:border-teal-300'
              } ${updatingJob === job.id ? 'opacity-50' : ''}`}
            >
              {/* Header with Booking # and Status */}
              <div className="flex justify-between items-start mb-3">
                <span 
                  onClick={() => router.push(`/admin/bookings/${job.id}`)}
                  className={`font-mono text-sm font-bold cursor-pointer hover:underline ${
                    isDarkMode ? 'text-teal-400' : 'text-teal-600'
                  }`}
                >
                  #{job.booking_number}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                  {job.status === 'in_progress' ? 'In Progress' : job.status}
                </span>
              </div>

              {/* Customer Info */}
              <div 
                onClick={() => router.push(`/admin/bookings/${job.id}`)}
                className="cursor-pointer mb-3"
              >
                <p className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {job.customer_first_name} {job.customer_last_name}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  {job.customer_email}
                </p>
              </div>

              {/* Service & Date */}
              <div 
                onClick={() => router.push(`/admin/bookings/${job.id}`)}
                className="grid grid-cols-2 gap-2 mb-3 cursor-pointer"
              >
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>Service</p>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {job.service_name}
                  </p>
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>Date</p>
                  <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {new Date(job.job_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Provider Assignment & Amount */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>Provider</p>
                  {job.provider_name ? (
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {job.provider_name}
                    </p>
                  ) : (
                    <select
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => assignProvider(job.id, e.target.value)}
                      className={`text-sm rounded-lg px-2 py-1 border w-full ${
                        isDarkMode 
                          ? 'bg-slate-800 text-white border-slate-700' 
                          : 'bg-gray-100 text-gray-900 border-gray-200'
                      }`}
                      defaultValue=""
                      disabled={updatingJob === job.id}
                    >
                      <option value="" disabled>Select Provider</option>
                      {tradespeople.map(provider => (
                        <option key={provider.id} value={provider.id}>
                          {provider.name} {provider.rating ? `⭐ ${provider.rating}` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>Amount</p>
                  <p className={`text-lg font-bold text-teal-600`}>
                    ${calculateTotal(job)}
                  </p>
                </div>
              </div>

              {/* Quick location preview */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  📍 {job.address_line1}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => router.push(`/admin/bookings/${job.id}`)}
                  className="flex-1 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition"
                >
                  View Details
                </button>
                {!job.provider_name && (
                  <button
                    onClick={() => {/* Quick assign first available provider */}}
                    className="px-3 py-1.5 border border-teal-600 text-teal-600 rounded-lg text-xs font-semibold hover:bg-teal-50 transition"
                  >
                    Quick Assign
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              No jobs found
            </p>
          </div>
        )}
      </div>
    </div>
  )
}