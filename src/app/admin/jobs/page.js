







// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAdminTheme } from '../layout'

// const PAGE_SIZE = 6

// function Pagination({ total, page, setPage, isDarkMode }) {
//   const totalPages = Math.ceil(total / PAGE_SIZE)
//   const pages = []
//   for (let i = 1; i <= totalPages; i++) {
//     if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
//       pages.push(i)
//     } else if (pages[pages.length - 1] !== '...') {
//       pages.push('...')
//     }
//   }

//   return (
//     <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
//       <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
//         {total === 0
//           ? 'No results'
//           : totalPages <= 1
//             ? `${total} total`
//             : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total} total`}
//       </p>
//       {totalPages > 1 && (
//         <div className="flex items-center gap-1">
//           <button
//             onClick={() => setPage(p => Math.max(1, p - 1))}
//             disabled={page === 1}
//             className={`px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 transition ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
//           >‹</button>
//           {pages.map((p, i) => (
//             p === '...'
//               ? <span key={`e-${i}`} className="px-2 text-slate-400 text-sm">…</span>
//               : <button key={p} onClick={() => setPage(p)}
//                   className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
//                     page === p
//                       ? 'bg-teal-600 text-white shadow-sm'
//                       : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
//                   }`}>{p}</button>
//           ))}
//           <button
//             onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//             disabled={page === totalPages}
//             className={`px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 transition ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
//           >›</button>
//         </div>
//       )}
//     </div>
//   )
// }

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
//   const [page, setPage] = useState(1)
  
//   // 🔥 Customer dropdown filter
//   const [selectedCustomer, setSelectedCustomer] = useState('all')
//   const [customers, setCustomers] = useState([])

//   const [showInvoiceModal, setShowInvoiceModal] = useState(false)
//   const [currentInvoice, setCurrentInvoice] = useState(null)
//   const [generatingInvoice, setGeneratingInvoice] = useState(null)
//   const [downloadingInvoice, setDownloadingInvoice] = useState(null) // 🔥 New state for download

//   useEffect(() => {
//     checkAuth()
//     loadJobs()
//     loadTradespeople()
//   }, [])

//   // Reset page on filter or customer change
//   useEffect(() => { 
//     setPage(1) 
//   }, [filter, selectedCustomer])

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
//     } catch {
//       showMessage('error', 'Failed to load jobs')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const loadTradespeople = async () => {
//     try {
//       const res = await fetch('/api/provider?status=active')
//       const data = await res.json()
//       if (data.success) setTradespeople(data.data || [])
//     } catch (error) {
//       console.error('Error loading tradespeople:', error)
//     }
//   }

//   // 🔥 Extract unique customers when jobs change
//   useEffect(() => {
//     if (jobs.length > 0) {
//       const uniqueCustomers = []
//       const customerMap = new Map()
      
//       jobs.forEach(job => {
//         const customerId = job.customer_id || `${job.customer_first_name}-${job.customer_last_name}-${job.customer_email}`
//         if (!customerMap.has(customerId)) {
//           customerMap.set(customerId, {
//             id: customerId,
//             first_name: job.customer_first_name,
//             last_name: job.customer_last_name,
//             email: job.customer_email,
//             fullName: `${job.customer_first_name || ''} ${job.customer_last_name || ''}`.trim()
//           })
//         }
//       })
      
//       setCustomers(Array.from(customerMap.values()))
//     }
//   }, [jobs])

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
//         body: JSON.stringify({ provider_id: providerId, status: 'matching' })
//       })
//       const data = await res.json()
//       if (data.success) {
//         showMessage('success', 'Provider assigned successfully')
//         loadJobs()
//       } else {
//         showMessage('error', data.message || 'Failed to assign provider')
//       }
//     } catch {
//       showMessage('error', 'Failed to assign provider')
//     } finally {
//       setUpdatingJob(null)
//     }
//   }

//   const generateInvoice = async (bookingId) => {
//     setGeneratingInvoice(bookingId)
//     try {
//       const res = await fetch('/api/admin/invoices/generate', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ booking_id: bookingId })
//       })
//       const data = await res.json()
//       if (data.success) {
//         showMessage('success', 'Invoice generated successfully!')
//         // Reload jobs to get the new invoice
//         loadJobs()
//       } else {
//         showMessage('error', data.message || 'Failed to generate invoice')
//       }
//     } catch {
//       showMessage('error', 'Failed to generate invoice')
//     } finally {
//       setGeneratingInvoice(null)
//     }
//   }

//  // Update your page.js download function
// const downloadInvoice = async (invoiceId, invoiceNumber) => {
//   setDownloadingInvoice(invoiceId)
//   try {
//     // Use preview API but force download
//     const response = await fetch(`/api/admin/invoices/${invoiceId}/preview`, {
//       method: 'GET',
//     })

//     if (!response.ok) {
//       throw new Error('Download failed')
//     }

//     // Get the HTML content
//     const html = await response.text()
    
//     // Create blob and download
//     const blob = new Blob([html], { type: 'text/html' })
//     const url = window.URL.createObjectURL(blob)
//     const link = document.createElement('a')
//     link.href = url
//     link.download = `invoice-${invoiceNumber || invoiceId}.html`
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//     window.URL.revokeObjectURL(url)
    
//     showMessage('success', 'Invoice downloaded successfully!')
//   } catch (error) {
//     console.error('Download error:', error)
//     showMessage('error', 'Failed to download invoice')
//   } finally {
//     setDownloadingInvoice(null)
//   }
// }

//   const viewInvoice = async (bookingId) => {
//     try {
//       const res = await fetch(`/api/admin/invoices?booking_id=${bookingId}`)
//       const data = await res.json()
//       if (data.success && data.data.length > 0) {
//         setCurrentInvoice(data.data[0])
//         setShowInvoiceModal(true)
//       } else {
//         showMessage('error', 'No invoice found for this booking')
//       }
//     } catch {
//       showMessage('error', 'Failed to load invoice')
//     }
//   }

//   const updateInvoiceStatus = async (invoiceId, newStatus) => {
//     try {
//       const res = await fetch('/api/admin/invoices', {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ invoice_id: invoiceId, status: newStatus })
//       })
//       const data = await res.json()
//       if (data.success) {
//         showMessage('success', `Invoice marked as ${newStatus}`)
//         if (currentInvoice) {
//           // Update current invoice
//           setCurrentInvoice({...currentInvoice, status: newStatus})
//         }
//         loadJobs() // Reload jobs to update status
//       }
//     } catch {
//       showMessage('error', 'Failed to update invoice')
//     }
//   }

//   // 🔥 Filter by status AND customer
//   const filteredJobs = jobs.filter(job => {
//     // Status filter
//     if (filter !== 'all' && job.status !== filter) return false
    
//     // Customer filter
//     if (selectedCustomer !== 'all') {
//       const customerId = job.customer_id || `${job.customer_first_name}-${job.customer_last_name}-${job.customer_email}`
//       if (customerId !== selectedCustomer) return false
//     }
    
//     return true
//   })
  
//   const pagedJobs = filteredJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

//   const STATUS_CONFIG = {
//     pending:     { label: 'Pending',     dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 ring-amber-200',      dark: 'bg-amber-900/20 text-amber-400 ring-amber-800' },
//     matching:    { label: 'Matching',    dot: 'bg-orange-400',  badge: 'bg-orange-50 text-orange-700 ring-orange-200',    dark: 'bg-orange-900/20 text-orange-400 ring-orange-800' },
//     confirmed:   { label: 'Confirmed',   dot: 'bg-blue-400',    badge: 'bg-blue-50 text-blue-700 ring-blue-200',          dark: 'bg-blue-900/20 text-blue-400 ring-blue-800' },
//     in_progress: { label: 'In Progress', dot: 'bg-violet-400',  badge: 'bg-violet-50 text-violet-700 ring-violet-200',   dark: 'bg-violet-900/20 text-violet-400 ring-violet-800' },
//     completed:   { label: 'Completed',   dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dark: 'bg-emerald-900/20 text-emerald-400 ring-emerald-800' },
//     cancelled:   { label: 'Cancelled',   dot: 'bg-red-400',     badge: 'bg-red-50 text-red-700 ring-red-200',            dark: 'bg-red-900/20 text-red-400 ring-red-800' },
//   }

//   const formatDuration = (minutes) => {
//     if (!minutes || minutes < 1) return '—'
//     if (minutes < 60) return `${minutes}m`
//     const h = Math.floor(minutes / 60)
//     const m = minutes % 60
//     return m > 0 ? `${h}h ${m}m` : `${h}h`
//   }

//   const statusCount = (s) => jobs.filter(j => s === 'all' ? true : j.status === s).length

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="flex flex-col items-center gap-4">
//           <div className="relative w-14 h-14">
//             <div className="absolute inset-0 rounded-full border-4 border-teal-100 dark:border-teal-900"></div>
//             <div className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
//           </div>
//           <p className="text-sm text-gray-400 font-medium tracking-wide">Loading jobs…</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className={`min-h-screen p-4 sm:p-6 transition-colors ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>

//       {/* Toast */}
//       <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
//         {showSuccessMessage && (
//           <div className="flex items-center gap-3 bg-emerald-600 text-white pl-4 pr-5 py-3 rounded-xl shadow-xl text-sm font-medium">
//             <span>✓</span>{showSuccessMessage}
//           </div>
//         )}
//         {showErrorMessage && (
//           <div className="flex items-center gap-3 bg-red-600 text-white pl-4 pr-5 py-3 rounded-xl shadow-xl text-sm font-medium">
//             <span>✕</span>{showErrorMessage}
//           </div>
//         )}
//       </div>

//       <div className="max-w-7xl mx-auto">

//         {/* Header */}
//         <div className="mb-6 sm:mb-8">
//           <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
//             <div>
//               <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
//                 Job Requests
//               </h1>
//               <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
//                 {jobs.length} total booking{jobs.length !== 1 ? 's' : ''}
//               </p>
//             </div>
//             {/* Summary pills — hidden on mobile */}
//             <div className="hidden md:flex items-center gap-3 flex-wrap">
//               {['pending', 'in_progress', 'completed'].map(s => {
//                 const cfg = STATUS_CONFIG[s]
//                 return (
//                   <div key={s} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${
//                     isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
//                   }`}>
//                     <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
//                     {statusCount(s)} {cfg.label}
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//         </div>

//         {/* 🔥 Filters Row */}
//         <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
//           {/* Status Filter Tabs */}
//           <div className="overflow-x-auto pb-1">
//             <div className={`flex gap-1.5 w-max sm:w-full p-1.5 rounded-2xl ${
//               isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'
//             }`}>
//               {['all', 'pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((s) => {
//                 const cfg = STATUS_CONFIG[s]
//                 const active = filter === s
//                 const count = statusCount(s)
//                 return (
//                   <button key={s} onClick={() => setFilter(s)}
//                     className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
//                       active
//                         ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
//                         : isDarkMode
//                           ? 'text-slate-400 hover:text-white hover:bg-slate-800'
//                           : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
//                     }`}
//                   >
//                     {s !== 'all' && cfg && (
//                       <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white/70' : cfg.dot}`}></span>
//                     )}
//                     <span className="capitalize">{s === 'in_progress' ? 'In Progress' : s}</span>
//                     <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
//                       active ? 'bg-white/20 text-white' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
//                     }`}>{count}</span>
//                   </button>
//                 )
//               })}
//             </div>
//           </div>

//           {/* 🔥 Customer Dropdown */}
//           <div>
//             <select
//               value={selectedCustomer}
//               onChange={(e) => setSelectedCustomer(e.target.value)}
//               className={`w-full px-4 py-2.5 rounded-xl border ${
//                 isDarkMode 
//                   ? 'bg-slate-900 border-slate-800 text-white' 
//                   : 'bg-white border-slate-200 text-slate-900'
//               } focus:outline-none focus:ring-2 focus:ring-teal-500 transition`}
//             >
//               <option value="all">All Customers</option>
//               {customers.map((customer) => (
//                 <option key={customer.id} value={customer.id}>
//                   {customer.fullName || customer.email} {customer.email && `(${customer.email})`}
//                 </option>
//               ))}
//             </select>
            
//             {/* Selected filter indicator */}
//             {selectedCustomer !== 'all' && (
//               <div className="mt-2 flex items-center gap-2">
//                 <span className={`text-xs px-2 py-1 rounded-full ${
//                   isDarkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-700'
//                 }`}>
//                   Filtering by: {customers.find(c => c.id === selectedCustomer)?.fullName || 'Selected customer'}
//                 </span>
//                 <button
//                   onClick={() => setSelectedCustomer('all')}
//                   className="text-xs text-red-600 hover:underline"
//                 >
//                   Clear
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Results count */}
//         <div className="mb-4">
//           <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
//             Showing {filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''}
//             {selectedCustomer !== 'all' && ' for selected customer'}
//           </p>
//         </div>

//         {/* Cards Grid */}
//         {filteredJobs.length === 0 ? (
//           <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed ${
//             isDarkMode ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-400'
//           }`}>
//             <div className="text-5xl mb-4 opacity-50">📋</div>
//             <p className="text-lg font-medium">No jobs found</p>
//             <p className="text-sm mt-1">
//               {selectedCustomer !== 'all' 
//                 ? 'No jobs for this customer' 
//                 : 'Try a different filter'}
//             </p>
//           </div>
//         ) : (
//           <>
//             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
//               {pagedJobs.map((job) => {
//                 const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending
//                 const hasOvertime = parseFloat(job.additional_price || 0) > 0
//                 const isUpdating = updatingJob === job.id

//                 return (
//                   <div key={job.id}
//                     className={`group relative flex flex-col rounded-2xl border transition-all duration-200 ${
//                       isUpdating ? 'opacity-50 pointer-events-none' : ''
//                     } ${
//                       isDarkMode
//                         ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-black/30'
//                         : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/5'
//                     }`}
//                   >
//                     {/* Status accent line */}
//                     <div className={`absolute top-0 left-6 right-6 h-0.5 rounded-b-full ${cfg.dot} opacity-60`}></div>

//                     <div className="p-4 sm:p-5 flex flex-col flex-1">

//                       {/* Card Header */}
//                       <div className="flex items-center justify-between mb-4">
//                         <button onClick={() => router.push(`/admin/bookings/${job.id}`)}
//                           className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
//                             isDarkMode ? 'text-teal-400 bg-teal-900/30 hover:bg-teal-900/60' : 'text-teal-700 bg-teal-50 hover:bg-teal-100'
//                           }`}>
//                           #{job.booking_number}
//                         </button>
//                         <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${
//                           isDarkMode ? cfg.dark : cfg.badge
//                         }`}>
//                           <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
//                           {cfg.label}
//                         </span>
//                       </div>

//                       {/* Customer */}
//                       <div className="mb-4 cursor-pointer" onClick={() => router.push(`/admin/bookings/${job.id}`)}>
//                         <p className={`text-base font-semibold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
//                           {job.customer_first_name} {job.customer_last_name}
//                         </p>
//                         <p className={`text-xs mt-0.5 truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
//                           {job.customer_email}
//                         </p>
//                       </div>

//                       {/* Info Grid */}
//                       <div
//                         className={`grid grid-cols-3 gap-2 mb-4 p-3 rounded-xl cursor-pointer ${isDarkMode ? 'bg-slate-800/60' : 'bg-slate-50'}`}
//                         onClick={() => router.push(`/admin/bookings/${job.id}`)}
//                       >
//                         <div>
//                           <p className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Service</p>
//                           <p className={`text-xs font-medium leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{job.service_name}</p>
//                         </div>
//                         <div>
//                           <p className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Date</p>
//                           <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
//                             {new Date(job.job_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
//                           </p>
//                         </div>
//                         <div>
//                           <p className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Duration</p>
//                           <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{formatDuration(job.service_duration || 60)}</p>
//                         </div>
//                       </div>

//                       {/* Provider + Price */}
//                       <div className="flex items-end justify-between gap-3 mb-4">
//                         <div className="flex-1 min-w-0">
//                           <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Provider</p>
//                           {job.provider_name ? (
//                             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium w-fit ${
//                               isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
//                             }`}>
//                               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
//                               {job.provider_name}
//                             </div>
//                           ) : (
//                             <select onClick={e => e.stopPropagation()} onChange={e => assignProvider(job.id, e.target.value)}
//                               defaultValue="" disabled={isUpdating}
//                               className={`text-xs rounded-lg px-2.5 py-1.5 border w-full focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
//                                 isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-slate-700 border-slate-200'
//                               }`}>
//                               <option value="" disabled>Assign provider…</option>
//                               {tradespeople.map(p => (
//                                 <option key={p.id} value={p.id}>{p.name}{p.rating ? ` ★ ${p.rating}` : ''}</option>
//                               ))}
//                             </select>
//                           )}
//                         </div>
//                         <div className="text-right flex-shrink-0">
//                           <p className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Rate</p>
//                           <p className="text-xl font-bold text-teal-500 leading-tight">
//                             ${parseFloat(job.service_price).toFixed(2)}
//                             <span className={`text-xs font-normal ml-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>/hr</span>
//                           </p>
//                           {hasOvertime && (
//                             <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
//                               +${parseFloat(job.additional_price).toFixed(2)}/hr OT
//                             </p>
//                           )}
//                         </div>
//                       </div>

//                       {/* Commission */}
//                       <div className={`flex items-center gap-1.5 text-[11px] mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
//                         {job.commission_percent ? (
//                           <>
//                             <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
//                             Commission {job.commission_percent}% — provider gets ${parseFloat(job.provider_amount || 0).toFixed(2)}
//                           </>
//                         ) : (
//                           <>
//                             <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
//                             Commission not set
//                           </>
//                         )}
//                       </div>

//                       {/* Location */}
//                       <div className={`flex items-center gap-1.5 text-[11px] mb-4 truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
//                         <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
//                         </svg>
//                         <span className="truncate">{job.address_line1}</span>
//                       </div>

//                       {/* Actions */}
//                       <div className="mt-auto space-y-2">
//                         <div className="flex gap-2">
//                           <button onClick={() => router.push(`/admin/bookings/${job.id}`)}
//                             className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors">
//                             View Details
//                           </button>
//                           {!job.provider_name && (
//                             <button onClick={() => tradespeople.length > 0 ? assignProvider(job.id, tradespeople[0].id) : showMessage('error', 'No providers available')}
//                               disabled={tradespeople.length === 0}
//                               className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-40 ${
//                                 isDarkMode ? 'border-teal-700 text-teal-400 hover:bg-teal-900/40' : 'border-teal-300 text-teal-700 hover:bg-teal-50'
//                               }`}>
//                               Quick Assign
//                             </button>
//                           )}
//                         </div>

//                         {job.status === 'completed' && (
//                           <div className="flex gap-2">
//                             <button onClick={() => generateInvoice(job.id)} disabled={generatingInvoice === job.id}
//                               className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50">
//                               {generatingInvoice === job.id ? (
//                                 <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>Generating…</>
//                               ) : (
//                                 <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
//                                 </svg>Generate Invoice</>
//                               )}
//                             </button>
                            
//                             {/* 🔥 Check if invoice exists and show download button */}
//                             {job.invoice_id ? (
//                               <button 
//                                 onClick={() => downloadInvoice(job.invoice_id, job.booking_number)}
//                                 disabled={downloadingInvoice === job.invoice_id}
//                                 className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
//                                   downloadingInvoice === job.invoice_id
//                                     ? 'opacity-50 cursor-not-allowed'
//                                     : isDarkMode
//                                       ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
//                                       : 'bg-emerald-600 hover:bg-emerald-700 text-white'
//                                 }`}
//                               >
//                                 {downloadingInvoice === job.invoice_id ? (
//                                   <>
//                                     <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
//                                     Downloading...
//                                   </>
//                                 ) : (
//                                   <>
//                                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                                       <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//                                     </svg>
//                                     Download PDF
//                                   </>
//                                 )}
//                               </button>
//                             ) : (
//                               <button 
//                                 onClick={() => viewInvoice(job.id)}
//                                 className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
//                                   isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                                 }`}
//                               >
//                                 <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
//                                   <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
//                                 </svg>
//                                 View
//                               </button>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>

//             {/* Pagination */}
//             <Pagination total={filteredJobs.length} page={page} setPage={setPage} isDarkMode={isDarkMode} />
//           </>
//         )}
//       </div>

//       {/* Invoice Modal */}
//       {showInvoiceModal && currentInvoice && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//           onClick={e => { if (e.target === e.currentTarget) setShowInvoiceModal(false) }}>
//           <div className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${
//             isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'
//           }`}>
//             <div className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b flex-wrap gap-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
//               <div>
//                 <p className={`text-xs font-semibold uppercase tracking-widest mb-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Invoice Preview</p>
//                 <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentInvoice.invoice_number}</h2>
//               </div>
//               <div className="flex items-center gap-2 flex-wrap">
//                 <select value={currentInvoice.status} onChange={e => updateInvoiceStatus(currentInvoice.id, e.target.value)}
//                   className={`px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
//                     isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
//                   }`}>
//                   <option value="draft">Draft</option>
//                   <option value="sent">Sent</option>
//                   <option value="paid">Paid</option>
//                   <option value="overdue">Overdue</option>
//                 </select>
                
//                 {/* 🔥 Download button in modal */}
//                 <button
//                   onClick={() => downloadInvoice(currentInvoice.id, currentInvoice.invoice_number)}
//                   disabled={downloadingInvoice === currentInvoice.id}
//                   className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
//                     downloadingInvoice === currentInvoice.id
//                       ? 'opacity-50 cursor-not-allowed bg-gray-400'
//                       : 'bg-emerald-600 hover:bg-emerald-700 text-white'
//                   }`}
//                 >
//                   {downloadingInvoice === currentInvoice.id ? (
//                     <>
//                       <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
//                       Downloading...
//                     </>
//                   ) : (
//                     <>
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//                       </svg>
//                       Download PDF
//                     </>
//                   )}
//                 </button>
                
//                 <button onClick={() => setShowInvoiceModal(false)}
//                   className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${
//                     isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
//                   }`}>
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
//                   </svg>
//                 </button>
//               </div>
//             </div>
//             <div className="flex-1 overflow-auto p-4">
//               <iframe src={`/api/admin/invoices/${currentInvoice.id}/preview`}
//                 className="w-full h-[500px] sm:h-[600px] rounded-xl border-0" title="Invoice Preview" />
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

const PAGE_SIZE = 6

function Pagination({ total, page, setPage, isDarkMode }) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        {total === 0
          ? 'No results'
          : totalPages <= 1
            ? `${total} total`
            : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total} total`}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 transition ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >‹</button>
          {pages.map((p, i) => (
            p === '...'
              ? <span key={`e-${i}`} className="px-2 text-slate-400 text-sm">…</span>
              : <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                    page === p
                      ? 'bg-teal-600 text-white shadow-sm'
                      : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}>{p}</button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 transition ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >›</button>
        </div>
      )}
    </div>
  )
}

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
  const [page, setPage] = useState(1)
  
  // Customer dropdown filter
  const [selectedCustomer, setSelectedCustomer] = useState('all')
  const [customers, setCustomers] = useState([])

  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [currentInvoice, setCurrentInvoice] = useState(null)
  const [generatingInvoice, setGeneratingInvoice] = useState(null)
  const [downloadingInvoice, setDownloadingInvoice] = useState(null)

  useEffect(() => {
    checkAuth()
    loadJobs()
    loadTradespeople()
  }, [])

  // Reset page on filter or customer change
  useEffect(() => { 
    setPage(1) 
  }, [filter, selectedCustomer])

  const checkAuth = () => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) router.push('/')
  }

  const loadJobs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/bookings')
      const data = await res.json()
      if (data.success) setJobs(data.data || [])
    } catch {
      showMessage('error', 'Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const loadTradespeople = async () => {
    try {
      const res = await fetch('/api/provider?status=active')
      const data = await res.json()
      if (data.success) setTradespeople(data.data || [])
    } catch (error) {
      console.error('Error loading tradespeople:', error)
    }
  }

  // Extract unique customers when jobs change
  useEffect(() => {
    if (jobs.length > 0) {
      const uniqueCustomers = []
      const customerMap = new Map()
      
      jobs.forEach(job => {
        const customerId = job.customer_id || `${job.customer_first_name}-${job.customer_last_name}-${job.customer_email}`
        if (!customerMap.has(customerId)) {
          customerMap.set(customerId, {
            id: customerId,
            first_name: job.customer_first_name,
            last_name: job.customer_last_name,
            email: job.customer_email,
            fullName: `${job.customer_first_name || ''} ${job.customer_last_name || ''}`.trim()
          })
        }
      })
      
      setCustomers(Array.from(customerMap.values()))
    }
  }, [jobs])

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
        body: JSON.stringify({ provider_id: providerId, status: 'matching' })
      })
      const data = await res.json()
      if (data.success) {
        showMessage('success', 'Provider assigned successfully')
        loadJobs()
      } else {
        showMessage('error', data.message || 'Failed to assign provider')
      }
    } catch {
      showMessage('error', 'Failed to assign provider')
    } finally {
      setUpdatingJob(null)
    }
  }

  const generateInvoice = async (bookingId) => {
    setGeneratingInvoice(bookingId)
    try {
      const res = await fetch('/api/admin/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId })
      })
      const data = await res.json()
      if (data.success) {
        showMessage('success', 'Invoice generated successfully!')
        loadJobs()
      } else {
        showMessage('error', data.message || 'Failed to generate invoice')
      }
    } catch {
      showMessage('error', 'Failed to generate invoice')
    } finally {
      setGeneratingInvoice(null)
    }
  }

  // ✅ FIXED: Simple HTML download function
  const downloadInvoice = async (invoiceId, invoiceNumber) => {
    setDownloadingInvoice(invoiceId)
    try {
      const response = await fetch(`/api/admin/invoices/${invoiceId}/preview`)
      
      if (!response.ok) {
        throw new Error('Download failed')
      }

      const html = await response.text()
      
      // Create blob and download as HTML
      const blob = new Blob([html], { type: 'text/html' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoiceNumber || invoiceId}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      showMessage('success', 'Invoice downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      showMessage('error', 'Failed to download invoice')
    } finally {
      setDownloadingInvoice(null)
    }
  }

  const viewInvoice = async (bookingId) => {
    try {
      const res = await fetch(`/api/admin/invoices?booking_id=${bookingId}`)
      const data = await res.json()
      if (data.success && data.data.length > 0) {
        setCurrentInvoice(data.data[0])
        setShowInvoiceModal(true)
      } else {
        showMessage('error', 'No invoice found for this booking')
      }
    } catch {
      showMessage('error', 'Failed to load invoice')
    }
  }

  const updateInvoiceStatus = async (invoiceId, newStatus) => {
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_id: invoiceId, status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        showMessage('success', `Invoice marked as ${newStatus}`)
        if (currentInvoice) {
          setCurrentInvoice({...currentInvoice, status: newStatus})
        }
        loadJobs()
      }
    } catch {
      showMessage('error', 'Failed to update invoice')
    }
  }

  // Filter by status AND customer
  const filteredJobs = jobs.filter(job => {
    if (filter !== 'all' && job.status !== filter) return false
    
    if (selectedCustomer !== 'all') {
      const customerId = job.customer_id || `${job.customer_first_name}-${job.customer_last_name}-${job.customer_email}`
      if (customerId !== selectedCustomer) return false
    }
    
    return true
  })
  
  const pagedJobs = filteredJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const STATUS_CONFIG = {
    pending:     { label: 'Pending',     dot: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 ring-amber-200',      dark: 'bg-amber-900/20 text-amber-400 ring-amber-800' },
    matching:    { label: 'Matching',    dot: 'bg-orange-400',  badge: 'bg-orange-50 text-orange-700 ring-orange-200',    dark: 'bg-orange-900/20 text-orange-400 ring-orange-800' },
    confirmed:   { label: 'Confirmed',   dot: 'bg-blue-400',    badge: 'bg-blue-50 text-blue-700 ring-blue-200',          dark: 'bg-blue-900/20 text-blue-400 ring-blue-800' },
    in_progress: { label: 'In Progress', dot: 'bg-violet-400',  badge: 'bg-violet-50 text-violet-700 ring-violet-200',   dark: 'bg-violet-900/20 text-violet-400 ring-violet-800' },
    completed:   { label: 'Completed',   dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dark: 'bg-emerald-900/20 text-emerald-400 ring-emerald-800' },
    cancelled:   { label: 'Cancelled',   dot: 'bg-red-400',     badge: 'bg-red-50 text-red-700 ring-red-200',            dark: 'bg-red-900/20 text-red-400 ring-red-800' },
  }

  const formatDuration = (minutes) => {
    if (!minutes || minutes < 1) return '—'
    if (minutes < 60) return `${minutes}m`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  const statusCount = (s) => jobs.filter(j => s === 'all' ? true : j.status === s).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-teal-100 dark:border-teal-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-gray-400 font-medium tracking-wide">Loading jobs…</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 transition-colors ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>

      {/* Toast */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {showSuccessMessage && (
          <div className="flex items-center gap-3 bg-emerald-600 text-white pl-4 pr-5 py-3 rounded-xl shadow-xl text-sm font-medium">
            <span>✓</span>{showSuccessMessage}
          </div>
        )}
        {showErrorMessage && (
          <div className="flex items-center gap-3 bg-red-600 text-white pl-4 pr-5 py-3 rounded-xl shadow-xl text-sm font-medium">
            <span>✕</span>{showErrorMessage}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Job Requests
              </h1>
              <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {jobs.length} total booking{jobs.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3 flex-wrap">
              {['pending', 'in_progress', 'completed'].map(s => {
                const cfg = STATUS_CONFIG[s]
                return (
                  <div key={s} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium ${
                    isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`}></span>
                    {statusCount(s)} {cfg.label}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="overflow-x-auto pb-1">
            <div className={`flex gap-1.5 w-max sm:w-full p-1.5 rounded-2xl ${
              isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200 shadow-sm'
            }`}>
              {['all', 'pending', 'matching', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((s) => {
                const cfg = STATUS_CONFIG[s]
                const active = filter === s
                const count = statusCount(s)
                return (
                  <button key={s} onClick={() => setFilter(s)}
                    className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      active
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                        : isDarkMode
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {s !== 'all' && cfg && (
                      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white/70' : cfg.dot}`}></span>
                    )}
                    <span className="capitalize">{s === 'in_progress' ? 'In Progress' : s}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                      active ? 'bg-white/20 text-white' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
                    }`}>{count}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white' 
                  : 'bg-white border-slate-200 text-slate-900'
              } focus:outline-none focus:ring-2 focus:ring-teal-500 transition`}
            >
              <option value="all">All Customers</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName || customer.email} {customer.email && `(${customer.email})`}
                </option>
              ))}
            </select>
            
            {selectedCustomer !== 'all' && (
              <div className="mt-2 flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  isDarkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-700'
                }`}>
                  Filtering by: {customers.find(c => c.id === selectedCustomer)?.fullName || 'Selected customer'}
                </span>
                <button
                  onClick={() => setSelectedCustomer('all')}
                  className="text-xs text-red-600 hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4">
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Showing {filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''}
            {selectedCustomer !== 'all' && ' for selected customer'}
          </p>
        </div>

        {/* Cards Grid */}
        {filteredJobs.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed ${
            isDarkMode ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-400'
          }`}>
            <div className="text-5xl mb-4 opacity-50">📋</div>
            <p className="text-lg font-medium">No jobs found</p>
            <p className="text-sm mt-1">
              {selectedCustomer !== 'all' 
                ? 'No jobs for this customer' 
                : 'Try a different filter'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {pagedJobs.map((job) => {
                const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.pending
                const hasOvertime = parseFloat(job.additional_price || 0) > 0
                const isUpdating = updatingJob === job.id

                return (
                  <div key={job.id}
                    className={`group relative flex flex-col rounded-2xl border transition-all duration-200 ${
                      isUpdating ? 'opacity-50 pointer-events-none' : ''
                    } ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-black/30'
                        : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/5'
                    }`}
                  >
                    <div className={`absolute top-0 left-6 right-6 h-0.5 rounded-b-full ${cfg.dot} opacity-60`}></div>

                    <div className="p-4 sm:p-5 flex flex-col flex-1">

                      <div className="flex items-center justify-between mb-4">
                        <button onClick={() => router.push(`/admin/bookings/${job.id}`)}
                          className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                            isDarkMode ? 'text-teal-400 bg-teal-900/30 hover:bg-teal-900/60' : 'text-teal-700 bg-teal-50 hover:bg-teal-100'
                          }`}>
                          #{job.booking_number}
                        </button>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${
                          isDarkMode ? cfg.dark : cfg.badge
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                          {cfg.label}
                        </span>
                      </div>

                      <div className="mb-4 cursor-pointer" onClick={() => router.push(`/admin/bookings/${job.id}`)}>
                        <p className={`text-base font-semibold leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {job.customer_first_name} {job.customer_last_name}
                        </p>
                        <p className={`text-xs mt-0.5 truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {job.customer_email}
                        </p>
                      </div>

                      <div
                        className={`grid grid-cols-3 gap-2 mb-4 p-3 rounded-xl cursor-pointer ${isDarkMode ? 'bg-slate-800/60' : 'bg-slate-50'}`}
                        onClick={() => router.push(`/admin/bookings/${job.id}`)}
                      >
                        <div>
                          <p className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Service</p>
                          <p className={`text-xs font-medium leading-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{job.service_name}</p>
                        </div>
                        <div>
                          <p className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Date</p>
                          <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                            {new Date(job.job_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                        <div>
                          <p className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Duration</p>
                          <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{formatDuration(job.service_duration || 60)}</p>
                        </div>
                      </div>

                      <div className="flex items-end justify-between gap-3 mb-4">
                        <div className="flex-1 min-w-0">
                          <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Provider</p>
                          {job.provider_name ? (
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium w-fit ${
                              isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              {job.provider_name}
                            </div>
                          ) : (
                            <select onClick={e => e.stopPropagation()} onChange={e => assignProvider(job.id, e.target.value)}
                              defaultValue="" disabled={isUpdating}
                              className={`text-xs rounded-lg px-2.5 py-1.5 border w-full focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                                isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-slate-700 border-slate-200'
                              }`}>
                              <option value="" disabled>Assign provider…</option>
                              {tradespeople.map(p => (
                                <option key={p.id} value={p.id}>{p.name}{p.rating ? ` ★ ${p.rating}` : ''}</option>
                              ))}
                            </select>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Rate</p>
                          <p className="text-xl font-bold text-teal-500 leading-tight">
                            ${parseFloat(job.service_price).toFixed(2)}
                            <span className={`text-xs font-normal ml-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>/hr</span>
                          </p>
                          {hasOvertime && (
                            <p className={`text-[10px] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                              +${parseFloat(job.additional_price).toFixed(2)}/hr OT
                            </p>
                          )}
                        </div>
                      </div>

                      <div className={`flex items-center gap-1.5 text-[11px] mb-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {job.commission_percent ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                            Commission {job.commission_percent}% — provider gets ${parseFloat(job.provider_amount || 0).toFixed(2)}
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                            Commission not set
                          </>
                        )}
                      </div>

                      <div className={`flex items-center gap-1.5 text-[11px] mb-4 truncate ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                        </svg>
                        <span className="truncate">{job.address_line1}</span>
                      </div>

                      <div className="mt-auto space-y-2">
                        <div className="flex gap-2">
                          <button onClick={() => router.push(`/admin/bookings/${job.id}`)}
                            className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-colors">
                            View Details
                          </button>
                          {!job.provider_name && (
                            <button onClick={() => tradespeople.length > 0 ? assignProvider(job.id, tradespeople[0].id) : showMessage('error', 'No providers available')}
                              disabled={tradespeople.length === 0}
                              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors disabled:opacity-40 ${
                                isDarkMode ? 'border-teal-700 text-teal-400 hover:bg-teal-900/40' : 'border-teal-300 text-teal-700 hover:bg-teal-50'
                              }`}>
                              Quick Assign
                            </button>
                          )}
                        </div>

                        {job.status === 'completed' && (
                          <div className="flex gap-2">
                            <button onClick={() => generateInvoice(job.id)} disabled={generatingInvoice === job.id}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50">
                              {generatingInvoice === job.id ? (
                                <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>Generating…</>
                              ) : (
                                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>Generate Invoice</>
                              )}
                            </button>
                            
                            {job.invoice_id ? (
                              <button 
                                onClick={() => downloadInvoice(job.invoice_id, job.booking_number)}
                                disabled={downloadingInvoice === job.invoice_id}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                  downloadingInvoice === job.invoice_id
                                    ? 'opacity-50 cursor-not-allowed'
                                    : isDarkMode
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                }`}
                              >
                                {downloadingInvoice === job.invoice_id ? (
                                  <>
                                    <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                                    Downloading...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download Invoice
                                  </>
                                )}
                              </button>
                            ) : (
                              <button 
                                onClick={() => viewInvoice(job.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                                  isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                </svg>
                                View
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <Pagination total={filteredJobs.length} page={page} setPage={setPage} isDarkMode={isDarkMode} />
          </>
        )}
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && currentInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowInvoiceModal(false) }}>
          <div className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'
          }`}>
            <div className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b flex-wrap gap-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-widest mb-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Invoice Preview</p>
                <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{currentInvoice.invoice_number}</h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select value={currentInvoice.status} onChange={e => updateInvoiceStatus(currentInvoice.id, e.target.value)}
                  className={`px-3 py-2 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-teal-500 transition ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
                
                <button
                  onClick={() => downloadInvoice(currentInvoice.id, currentInvoice.invoice_number)}
                  disabled={downloadingInvoice === currentInvoice.id}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    downloadingInvoice === currentInvoice.id
                      ? 'opacity-50 cursor-not-allowed bg-gray-400'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {downloadingInvoice === currentInvoice.id ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Invoice
                    </>
                  )}
                </button>
                
                <button onClick={() => setShowInvoiceModal(false)}
                  className={`flex items-center justify-center w-9 h-9 rounded-xl transition-colors ${
                    isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <iframe src={`/api/admin/invoices/${currentInvoice.id}/preview`}
                className="w-full h-[500px] sm:h-[600px] rounded-xl border-0" title="Invoice Preview" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}