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
//   const [selectedJob, setSelectedJob] = useState(null)
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [tradespeople, setTradespeople] = useState([])

//   useEffect(() => {
//     checkAuth()
//     loadJobs()
//     loadTradespeople()
//   }, [])

//   const checkAuth = () => {
//     const auth = localStorage.getItem('adminAuth')
//     if (!auth) {
//       router.push('/')
//     }
//   }

//   const loadJobs = async () => {
//     setLoading(true)
//     try {
//       const res = await fetch('/api/bookings')
//       const data = await res.json()
//       if (data.success) {
//         setJobs(data.data || [])
//       }
//     } catch (error) {
//       console.error('Error loading jobs:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const loadTradespeople = async () => {
//     try {
//       const res = await fetch('/api/providers?status=active')
//       const data = await res.json()
//       if (data.success) {
//         setTradespeople(data.data || [])
//       }
//     } catch (error) {
//       console.error('Error loading tradespeople:', error)
//     }
//   }

//   const updateJobStatus = async (jobId, newStatus) => {
//     try {
//       const res = await fetch(`/api/bookings?id=${jobId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ status: newStatus })
//       })
//       const data = await res.json()
//       if (data.success) {
//         loadJobs()
//         setIsModalOpen(false)
//       }
//     } catch (error) {
//       console.error('Error updating job:', error)
//     }
//   }

//   const assignProvider = async (jobId, providerId) => {
//     try {
//       const res = await fetch(`/api/bookings?id=${jobId}`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ provider_id: providerId })
//       })
//       const data = await res.json()
//       if (data.success) {
//         loadJobs()
//       }
//     } catch (error) {
//       console.error('Error assigning provider:', error)
//     }
//   }

//   const deleteJob = async (jobId) => {
//     if (!confirm('Are you sure you want to delete this job request?')) return
    
//     try {
//       const res = await fetch(`/api/bookings?id=${jobId}`, {
//         method: 'DELETE'
//       })
//       const data = await res.json()
//       if (data.success) {
//         loadJobs()
//       }
//     } catch (error) {
//       console.error('Error deleting job:', error)
//     }
//   }

//   const filteredJobs = jobs.filter(job => {
//     if (filter === 'all') return true
//     return job.status === filter
//   })

//   const getStatusColor = (status) => {
//     switch(status) {
//       case 'pending': return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
//       case 'matching': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
//       case 'confirmed': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
//       case 'in_progress': return 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
//       case 'completed': return 'bg-green-500/20 text-green-600 dark:text-green-400'
//       case 'cancelled': return 'bg-red-500/20 text-red-600 dark:text-red-400'
//       default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400'
//     }
//   }

//   const formatTimeSlot = (slot) => {
//     const slots = {
//       'morning': '8:00 AM - 12:00 PM',
//       'afternoon': '12:00 PM - 5:00 PM',
//       'evening': '5:00 PM - 9:00 PM'
//     }
//     return slots[slot] || slot
//   }

//   const calculateTotal = (job) => {
//     const servicePrice = parseFloat(job.service_price) || 0
//     const additionalPrice = parseFloat(job.additional_price) || 0
//     return (servicePrice + additionalPrice).toFixed(2)
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-4 sm:p-6 lg:p-8">
//       <div className="mb-8">
//         <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${
//           isDarkMode ? 'text-white' : 'text-gray-900'
//         }`}>
//           Job Requests
//         </h1>
//         <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
//           Manage and track all service requests
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
//                 ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
//                 : isDarkMode
//                   ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
//                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             {status.replace('_', ' ')}
//           </button>
//         ))}
//       </div>

//       {/* Jobs Table */}
//       <div className={`rounded-xl shadow-lg border overflow-hidden ${
//         isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//       }`}>
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className={isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}>
//                 <th className="px-6 py-4 text-left text-sm font-semibold">Booking #</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold">Service</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold">Date & Time</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold">Provider</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
//                 <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
//               {filteredJobs.length > 0 ? (
//                 filteredJobs.map((job) => (
//                   <tr key={job.id} className={isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}>
//                     <td className="px-6 py-4 text-sm">
//                       <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                         {job.booking_number}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div>
//                         <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                           {job.customer_first_name} {job.customer_last_name}
//                         </p>
//                         <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//                           {job.customer_email}
//                         </p>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                         {job.service_name}
//                       </p>
//                       <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//                         {job.category_name}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4">
//                       <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                         {new Date(job.job_date).toLocaleDateString()}
//                       </p>
//                       <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//                         {formatTimeSlot(job.job_time_slot)}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4">
//                       {job.provider_name ? (
//                         <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                           {job.provider_name}
//                         </span>
//                       ) : (
//                         <select
//                           onChange={(e) => assignProvider(job.id, e.target.value)}
//                           className={`text-sm rounded-lg px-2 py-1 ${
//                             isDarkMode 
//                               ? 'bg-slate-800 text-white border-slate-700' 
//                               : 'bg-gray-100 text-gray-900 border-gray-200'
//                           }`}
//                           defaultValue=""
//                         >
//                           <option value="" disabled>Assign Provider</option>
//                           {tradespeople.map(provider => (
//                             <option key={provider.id} value={provider.id}>
//                               {provider.name}
//                             </option>
//                           ))}
//                         </select>
//                       )}
//                     </td>
//                     <td className="px-6 py-4">
//                       <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                         ${calculateTotal(job)}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
//                         {job.status?.replace('_', ' ')}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-right">
//                       <div className="flex items-center justify-end gap-2">
//                         <button
//                           onClick={() => {
//                             setSelectedJob(job)
//                             setIsModalOpen(true)
//                           }}
//                           className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
//                         >
//                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                           </svg>
//                         </button>
//                         <button
//                           onClick={() => deleteJob(job.id)}
//                           className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-red-600 transition-colors"
//                         >
//                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                           </svg>
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="8" className="px-6 py-12 text-center">
//                     <div className="flex flex-col items-center">
//                       <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                       </svg>
//                       <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                         No jobs found
//                       </p>
//                       <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
//                         {filter === 'all' ? 'No job requests yet' : `No ${filter} jobs`}
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Job Details Modal */}
//       {isModalOpen && selectedJob && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/50" onClick={() => setIsModalOpen(false)} />
//           <div className={`relative rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto ${
//             isDarkMode ? 'bg-slate-900' : 'bg-white'
//           }`}>
//             <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit z-10">
//               <div className="flex items-center justify-between">
//                 <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   Booking {selectedJob.booking_number}
//                 </h3>
//                 <button
//                   onClick={() => setIsModalOpen(false)}
//                   className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
            
//             <div className="p-6 space-y-6">
//               {/* Customer Information */}
//               <div>
//                 <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   Customer Information
//                 </h4>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Name</p>
//                     <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       {selectedJob.customer_first_name} {selectedJob.customer_last_name}
//                     </p>
//                   </div>
//                   <div>
//                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Email</p>
//                     <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       {selectedJob.customer_email}
//                     </p>
//                   </div>
//                   <div>
//                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Phone</p>
//                     <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       {selectedJob.customer_phone}
//                     </p>
//                   </div>
//                   <div>
//                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>User ID</p>
//                     <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       {selectedJob.user_id || 'Guest'}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Service Details */}
//               <div>
//                 <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   Service Details
//                 </h4>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Service</p>
//                     <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       {selectedJob.service_name}
//                     </p>
//                   </div>
//                   <div>
//                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Category</p>
//                     <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       {selectedJob.category_name}
//                     </p>
//                   </div>
//                   <div>
//                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Service Price</p>
//                     <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       ${parseFloat(selectedJob.service_price).toFixed(2)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Additional Price</p>
//                     <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       ${parseFloat(selectedJob.additional_price).toFixed(2)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Total Amount</p>
//                     <p className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       ${calculateTotal(selectedJob)}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Job Schedule */}
//               <div>
//                 <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   Job Schedule
//                 </h4>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Date</p>
//                     <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       {new Date(selectedJob.job_date).toLocaleDateString('en-US', {
//                         weekday: 'long',
//                         year: 'numeric',
//                         month: 'long',
//                         day: 'numeric'
//                       })}
//                     </p>
//                   </div>
//                   <div>
//                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Time Slot</p>
//                     <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       {formatTimeSlot(selectedJob.job_time_slot)}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Address */}
//               <div>
//                 <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   Service Location
//                 </h4>
//                 <div className="grid grid-cols-1 gap-4">
//                   <div>
//                     <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Address</p>
//                     <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       {selectedJob.address_line1}
//                       {selectedJob.address_line2 && `, ${selectedJob.address_line2}`}
//                     </p>
//                     <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       {selectedJob.city}{selectedJob.postal_code && `, ${selectedJob.postal_code}`}
//                     </p>
//                   </div>
//                   <div className="grid grid-cols-3 gap-4">
//                     <div>
//                       <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Parking Access</p>
//                       <p className={`font-medium ${selectedJob.parking_access ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
//                         {selectedJob.parking_access ? 'Yes' : 'No'}
//                       </p>
//                     </div>
//                     <div>
//                       <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Elevator Access</p>
//                       <p className={`font-medium ${selectedJob.elevator_access ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
//                         {selectedJob.elevator_access ? 'Yes' : 'No'}
//                       </p>
//                     </div>
//                     <div>
//                       <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Has Pets</p>
//                       <p className={`font-medium ${selectedJob.has_pets ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'}`}>
//                         {selectedJob.has_pets ? 'Yes' : 'No'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Job Details */}
//               {(selectedJob.job_description || selectedJob.timing_constraints || selectedJob.instructions) && (
//                 <div>
//                   <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                     Additional Details
//                   </h4>
//                   <div className="space-y-3">
//                     {selectedJob.job_description && (
//                       <div>
//                         <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Job Description</p>
//                         <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                           {selectedJob.job_description}
//                         </p>
//                       </div>
//                     )}
//                     {selectedJob.timing_constraints && (
//                       <div>
//                         <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Timing Constraints</p>
//                         <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                           {selectedJob.timing_constraints}
//                         </p>
//                       </div>
//                     )}
//                     {selectedJob.instructions && (
//                       <div>
//                         <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Special Instructions</p>
//                         <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                           {selectedJob.instructions}
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Photos */}
//               {selectedJob.photos && selectedJob.photos.length > 0 && (
//                 <div>
//                   <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                     Uploaded Photos
//                   </h4>
//                   <div className="grid grid-cols-3 gap-4">
//                     {selectedJob.photos.map((photo, index) => (
//                       <img
//                         key={index}
//                         src={photo}
//                         alt={`Job photo ${index + 1}`}
//                         className="w-full h-32 object-cover rounded-lg"
//                       />
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Status Update */}
//               <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
//                 <p className={`text-sm mb-3 font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//                   Update Status
//                 </p>
//                 <div className="flex flex-wrap gap-2">
//                   {['pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
//                     <button
//                       key={status}
//                       onClick={() => updateJobStatus(selectedJob.id, status)}
//                       disabled={selectedJob.status === status}
//                       className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
//                         selectedJob.status === status
//                           ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
//                           : isDarkMode
//                             ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
//                             : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                       }`}
//                     >
//                       {status.replace('_', ' ')}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
            
//             <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end sticky bottom-0 bg-inherit">
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="px-6 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
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
  const [selectedJob, setSelectedJob] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
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
    if (!auth) {
      router.push('/')
    }
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
      console.error('Error loading jobs:', error)
      showMessage('error', 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const loadTradespeople = async () => {
    try {
      const res = await fetch('/api/providers?status=active')
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

  const updateJobStatus = async (jobId, newStatus, notes = '') => {
    setUpdatingJob(jobId)
    try {
      const res = await fetch(`/api/bookings?id=${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          notes: notes || `Status updated to ${newStatus}`
        })
      })
      const data = await res.json()
      if (data.success) {
        showMessage('success', `Job status updated to ${newStatus.replace('_', ' ')}`)
        loadJobs()
        setIsModalOpen(false)
      } else {
        showMessage('error', data.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Error updating job:', error)
      showMessage('error', 'Failed to update job status')
    } finally {
      setUpdatingJob(null)
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
          provider_id: providerId
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
      console.error('Error assigning provider:', error)
      showMessage('error', 'Failed to assign provider')
    } finally {
      setUpdatingJob(null)
    }
  }

  const deleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job request?')) return
    
    setUpdatingJob(jobId)
    try {
      const res = await fetch(`/api/bookings?id=${jobId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        showMessage('success', 'Job deleted successfully')
        loadJobs()
      } else {
        showMessage('error', data.message || 'Failed to delete job')
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      showMessage('error', 'Failed to delete job')
    } finally {
      setUpdatingJob(null)
    }
  }

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true
    return job.status === filter
  })

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30'
      case 'matching': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30'
      case 'confirmed': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
      case 'in_progress': return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30'
      case 'completed': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30'
    }
  }

  const formatTimeSlot = (slot) => {
    const slots = {
      'morning': '8:00 AM - 12:00 PM',
      'afternoon': '12:00 PM - 5:00 PM',
      'evening': '5:00 PM - 9:00 PM'
    }
    return slots[slot] || slot
  }

  const calculateTotal = (job) => {
    const servicePrice = parseFloat(job.service_price) || 0
    const additionalPrice = parseFloat(job.additional_price) || 0
    return (servicePrice + additionalPrice).toFixed(2)
  }

  const getStatusStep = (status) => {
    const steps = {
      'pending': 1,
      'matching': 2,
      'confirmed': 3,
      'in_progress': 4,
      'completed': 5
    }
    return steps[status] || 0
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
      {/* Success/Error Messages */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-down">
          {showSuccessMessage}
        </div>
      )}
      {showErrorMessage && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-down">
          {showErrorMessage}
        </div>
      )}

      <div className="mb-8">
        <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Job Requests
        </h1>
        <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
          Manage and track all service requests
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
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
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

      {/* Jobs Table */}
      <div className={`rounded-xl shadow-lg border overflow-hidden ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}>
                <th className="px-6 py-4 text-left text-sm font-semibold">Booking #</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Service</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Date & Time</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Provider</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                  <tr key={job.id} className={`${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'} transition-colors ${updatingJob === job.id ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {job.booking_number}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {job.customer_first_name} {job.customer_last_name}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          {job.customer_email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {job.service_name}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        {job.category_name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(job.job_date).toLocaleDateString()}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        {formatTimeSlot(job.job_time_slot)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {job.provider_name ? (
                        <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {job.provider_name}
                        </span>
                      ) : (
                        <select
                          onChange={(e) => assignProvider(job.id, e.target.value)}
                          className={`text-sm rounded-lg px-2 py-1 border ${
                            isDarkMode 
                              ? 'bg-slate-800 text-white border-slate-700' 
                              : 'bg-gray-100 text-gray-900 border-gray-200'
                          }`}
                          defaultValue=""
                          disabled={updatingJob === job.id}
                        >
                          <option value="" disabled>Assign Provider</option>
                          {tradespeople.map(provider => (
                            <option key={provider.id} value={provider.id}>
                              {provider.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${calculateTotal(job)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                        {job.status === 'in_progress' ? 'In Progress' : job.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedJob(job)
                            setIsModalOpen(true)
                          }}
                          disabled={updatingJob === job.id}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => deleteJob(job.id)}
                          disabled={updatingJob === job.id}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete Job"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        No jobs found
                      </p>
                      <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                        {filter === 'all' ? 'No job requests yet' : `No ${filter.replace('_', ' ')} jobs`}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Details Modal */}
      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className={`relative rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-slate-900' : 'bg-white'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-inherit z-10">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Booking Details - {selectedJob.booking_number}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Information */}
              <div>
                <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Name</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedJob.customer_first_name} {selectedJob.customer_last_name}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Email</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedJob.customer_email}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Phone</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedJob.customer_phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>User ID</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedJob.user_id || 'Guest'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div>
                <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Service Details
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Service</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedJob.service_name}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Category</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedJob.category_name}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Service Price</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${parseFloat(selectedJob.service_price).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Additional Price</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${parseFloat(selectedJob.additional_price).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Total Amount</p>
                    <p className={`font-semibold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${calculateTotal(selectedJob)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Schedule */}
              <div>
                <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Job Schedule
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Date</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(selectedJob.job_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Time Slot</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatTimeSlot(selectedJob.job_time_slot)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Service Location
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Address</p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedJob.address_line1}
                      {selectedJob.address_line2 && `, ${selectedJob.address_line2}`}
                    </p>
                    <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedJob.city}{selectedJob.postal_code && `, ${selectedJob.postal_code}`}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Parking Access</p>
                      <p className={`font-medium ${selectedJob.parking_access ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {selectedJob.parking_access ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Elevator Access</p>
                      <p className={`font-medium ${selectedJob.elevator_access ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {selectedJob.elevator_access ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Has Pets</p>
                      <p className={`font-medium ${selectedJob.has_pets ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {selectedJob.has_pets ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              {(selectedJob.job_description || selectedJob.timing_constraints || selectedJob.instructions) && (
                <div>
                  <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Additional Details
                  </h4>
                  <div className="space-y-3">
                    {selectedJob.job_description && (
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Job Description</p>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedJob.job_description}
                        </p>
                      </div>
                    )}
                    {selectedJob.timing_constraints && (
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Timing Constraints</p>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedJob.timing_constraints}
                        </p>
                      </div>
                    )}
                    {selectedJob.instructions && (
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Special Instructions</p>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {selectedJob.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Photos */}
              {selectedJob.photos && selectedJob.photos.length > 0 && (
                <div>
                  <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Uploaded Photos
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedJob.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Job photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(photo, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">Click to view</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className={`text-sm mb-4 font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Status Timeline
                </p>
                <div className="flex items-center justify-between">
                  {['pending', 'matching', 'confirmed', 'in_progress', 'completed'].map((status, index) => {
                    const stepNumber = index + 1
                    const currentStep = getStatusStep(selectedJob.status)
                    const isCompleted = currentStep >= stepNumber
                    const isCurrent = selectedJob.status === status
                    
                    return (
                      <div key={status} className="flex-1 text-center">
                        <div className="relative">
                          <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium
                            ${isCompleted 
                              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' 
                              : isDarkMode 
                                ? 'bg-slate-700 text-slate-400' 
                                : 'bg-gray-200 text-gray-600'
                            }
                            ${isCurrent ? 'ring-2 ring-teal-500 ring-offset-2 dark:ring-offset-slate-900' : ''}
                          `}>
                            {stepNumber}
                          </div>
                          <div className={`mt-2 text-xs font-medium capitalize
                            ${isCompleted 
                              ? isDarkMode ? 'text-teal-400' : 'text-teal-600'
                              : isDarkMode ? 'text-slate-500' : 'text-gray-500'
                            }
                          `}>
                            {status === 'in_progress' ? 'In Progress' : status}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className={`text-sm mb-3 font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  Update Status
                </p>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => updateJobStatus(selectedJob.id, status)}
                      disabled={selectedJob.status === status || updatingJob === selectedJob.id}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                        selectedJob.status === status
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white cursor-default'
                          : isDarkMode
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } ${updatingJob === selectedJob.id ? 'opacity-50 cursor-wait' : ''}`}
                    >
                      {updatingJob === selectedJob.id && selectedJob.status !== status ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </span>
                      ) : (
                        status === 'in_progress' ? 'In Progress' : status.replace('_', ' ')
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end sticky bottom-0 bg-inherit">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}