// 'use client'

// import { useState, useEffect } from 'react'
// import { useAdminTheme } from '../layout'
// import { Download, Clock, CheckCircle, Users, Search, Calendar, DollarSign, X, Filter, ChevronDown, Eye } from 'lucide-react'

// export default function AdminPayouts() {
//   const { isDarkMode } = useAdminTheme()
//   const [data, setData] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [search, setSearch] = useState('')
//   const [statusFilter, setStatusFilter] = useState('all')
//   const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
//   const [selectedProvider, setSelectedProvider] = useState(null)
//   const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false)

//   useEffect(() => {
//     fetch('/api/admin/payouts')
//       .then(res => res.json())
//       .then(result => {
//         if (result.success) setData(result.data)
//       })
//       .finally(() => setLoading(false))
//   }, [])

//   const formatMoney = (amt) => `$${parseFloat(amt || 0).toFixed(2)}`
//   const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { 
//     month: 'short', 
//     day: 'numeric', 
//     year: 'numeric' 
//   }) : '—'

//   const filteredPayouts = data?.payouts?.filter(p => {
//     const matchesSearch = p.provider_name?.toLowerCase().includes(search.toLowerCase()) ||
//                          p.booking_number?.toLowerCase().includes(search.toLowerCase()) ||
//                          p.provider_email?.toLowerCase().includes(search.toLowerCase())
//     const matchesStatus = statusFilter === 'all' || p.status === statusFilter
//     return matchesSearch && matchesStatus
//   }) || []

//   if (loading) {
//     return (
//       <div className={`min-h-screen flex items-center justify-center ${
//         isDarkMode ? 'bg-slate-950' : 'bg-gray-50'
//       }`}>
//         <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
//       </div>
//     )
//   }

//   return (
//     <div className={`min-h-screen ${
//       isDarkMode ? 'bg-slate-950' : 'bg-gray-50'
//     }`}>
//       <div className="p-4 sm:p-6 lg:p-8">
//         <div className="max-w-7xl mx-auto">

//           {/* Header */}
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//             <div>
//               <h1 className={`text-2xl sm:text-3xl font-bold ${
//                 isDarkMode ? 'text-white' : 'text-gray-900'
//               }`}>
//                 Payouts
//               </h1>
//               <p className={`text-sm mt-1 ${
//                 isDarkMode ? 'text-slate-400' : 'text-gray-500'
//               }`}>
//                 Manage provider payments and balances
//               </p>
//             </div>
            
//             {/* Mobile Filter Button */}
//             <button
//               onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
//               className={`sm:hidden flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm ${
//                 isDarkMode 
//                   ? 'bg-slate-800 text-white border border-slate-700' 
//                   : 'bg-white text-gray-700 border border-gray-200'
//               }`}
//             >
//               <Filter className="w-4 h-4" />
//               Filters
//             </button>
//           </div>

//           {/* Summary Cards */}
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
//             {[
//               { 
//                 label: 'Total Payouts', 
//                 value: data?.summary?.total_payouts || 0, 
//                 icon: Download,
//                 light: 'bg-blue-50 border-blue-200', 
//                 dark: 'bg-blue-500/10 border-blue-500/20',
//                 iconLight: 'text-blue-600',
//                 iconDark: 'text-blue-400',
//                 isNumber: true
//               },
//               { 
//                 label: 'Pending', 
//                 value: data?.summary?.total_pending_amount, 
//                 icon: Clock,
//                 light: 'bg-amber-50 border-amber-200', 
//                 dark: 'bg-amber-500/10 border-amber-500/20',
//                 iconLight: 'text-amber-600',
//                 iconDark: 'text-amber-400'
//               },
//               { 
//                 label: 'Paid', 
//                 value: data?.summary?.total_paid_amount, 
//                 icon: CheckCircle,
//                 light: 'bg-emerald-50 border-emerald-200', 
//                 dark: 'bg-emerald-500/10 border-emerald-500/20',
//                 iconLight: 'text-emerald-600',
//                 iconDark: 'text-emerald-400'
//               },
//               { 
//                 label: 'Active Providers', 
//                 value: data?.providers?.length || 0, 
//                 icon: Users,
//                 light: 'bg-purple-50 border-purple-200', 
//                 dark: 'bg-purple-500/10 border-purple-500/20',
//                 iconLight: 'text-purple-600',
//                 iconDark: 'text-purple-400',
//                 isNumber: true
//               },
//             ].map(stat => (
//               <div 
//                 key={stat.label}
//                 className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 border ${
//                   isDarkMode ? stat.dark : stat.light
//                 }`}
//               >
//                 <stat.icon className={`w-5 h-5 mb-2 ${
//                   isDarkMode ? stat.iconDark : stat.iconLight
//                 }`} />
//                 <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
//                   {stat.label}
//                 </p>
//                 <p className={`text-xl sm:text-2xl font-bold ${
//                   isDarkMode ? 'text-white' : 'text-gray-900'
//                 }`}>
//                   {stat.isNumber ? stat.value : formatMoney(stat.value)}
//                 </p>
//               </div>
//             ))}
//           </div>

//           {/* Mobile Filters Panel */}
//           {mobileFiltersOpen && (
//             <div className={`sm:hidden mb-4 p-4 rounded-xl border ${
//               isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//             }`}>
//               <div className="space-y-3">
//                 {/* Search */}
//                 <div className="relative">
//                   <Search className={`absolute left-3 top-2.5 w-4 h-4 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-400'
//                   }`} />
//                   <input
//                     type="text"
//                     placeholder="Search provider or booking..."
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
//                         : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                   />
//                 </div>

//                 {/* Status Filter */}
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   className={`w-full px-4 py-2 rounded-xl border text-sm ${
//                     isDarkMode 
//                       ? 'bg-slate-800 border-slate-700 text-white' 
//                       : 'bg-white border-gray-300 text-gray-900'
//                   } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                 >
//                   <option value="all">All Status</option>
//                   <option value="pending">Pending</option>
//                   <option value="processing">Processing</option>
//                   <option value="paid">Paid</option>
//                   <option value="failed">Failed</option>
//                 </select>
//               </div>
//             </div>
//           )}

//           {/* Desktop Filters */}
//           <div className="hidden sm:flex flex-col sm:flex-row gap-3 mb-6">
//             <div className="relative flex-1">
//               <Search className={`absolute left-3 top-2.5 w-4 h-4 ${
//                 isDarkMode ? 'text-slate-400' : 'text-gray-400'
//               }`} />
//               <input
//                 type="text"
//                 placeholder="Search provider or booking..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm ${
//                   isDarkMode 
//                     ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' 
//                     : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
//                 } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//               />
//             </div>
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className={`px-4 py-2 rounded-xl border text-sm min-w-[150px] ${
//                 isDarkMode 
//                   ? 'bg-slate-800 border-slate-700 text-white' 
//                   : 'bg-white border-gray-300 text-gray-900'
//               } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//             >
//               <option value="all">All Status</option>
//               <option value="pending">Pending</option>
//               <option value="processing">Processing</option>
//               <option value="paid">Paid</option>
//               <option value="failed">Failed</option>
//             </select>
//           </div>

//           {/* Provider Balances - Mobile Card View */}
//           <div className="sm:hidden mb-6">
//             <h2 className={`text-lg font-semibold mb-3 ${
//               isDarkMode ? 'text-white' : 'text-gray-900'
//             }`}>
//               Provider Balances
//             </h2>
//             <div className="space-y-3">
//               {data?.providers?.map(p => (
//                 <div
//                   key={p.id}
//                   className={`rounded-xl border p-4 ${
//                     isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//                   }`}
//                 >
//                   <div className="flex items-start justify-between mb-3">
//                     <div>
//                       <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                         {p.name}
//                       </h3>
//                       <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
//                         {p.email}
//                       </p>
//                     </div>
//                     {p.stripe_onboarding === 'complete' ? (
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         isDarkMode 
//                           ? 'bg-emerald-500/20 text-emerald-400' 
//                           : 'bg-emerald-100 text-emerald-700'
//                       }`}>
//                         ✅ Connected
//                       </span>
//                     ) : (
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         isDarkMode 
//                           ? 'bg-amber-500/20 text-amber-400' 
//                           : 'bg-amber-100 text-amber-700'
//                       }`}>
//                         ⚠️ Pending
//                       </span>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-3 gap-2 mb-3">
//                     <div>
//                       <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
//                         Available
//                       </p>
//                       <p className={`font-semibold ${
//                         isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
//                       }`}>
//                         {formatMoney(p.available_balance)}
//                       </p>
//                     </div>
//                     <div>
//                       <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
//                         Pending
//                       </p>
//                       <p className={`font-semibold ${
//                         isDarkMode ? 'text-amber-400' : 'text-amber-600'
//                       }`}>
//                         {formatMoney(p.pending_balance)}
//                       </p>
//                     </div>
//                     <div>
//                       <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
//                         Total
//                       </p>
//                       <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                         {formatMoney(p.total_earnings)}
//                       </p>
//                     </div>
//                   </div>

//                   <button
//                     onClick={() => {
//                       setSelectedProvider(p)
//                       setIsPayoutModalOpen(true)
//                     }}
//                     className={`w-full py-2 rounded-lg text-sm font-medium ${
//                       isDarkMode
//                         ? 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
//                         : 'bg-teal-500 text-white hover:bg-teal-600'
//                     }`}
//                   >
//                     Process Payout
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Provider Balances - Desktop Table */}
//           <div className={`hidden sm:block rounded-xl border mb-6 ${
//             isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//           }`}>
//             <div className={`px-5 py-4 border-b ${
//               isDarkMode ? 'border-slate-800' : 'border-gray-200'
//             }`}>
//               <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                 Provider Balances
//               </h2>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className={isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}>
//                   <tr>
//                     <th className={`px-5 py-3 text-left text-xs font-medium ${
//                       isDarkMode ? 'text-slate-300' : 'text-gray-600'
//                     }`}>
//                       Provider
//                     </th>
//                     <th className={`px-5 py-3 text-left text-xs font-medium ${
//                       isDarkMode ? 'text-slate-300' : 'text-gray-600'
//                     }`}>
//                       Available
//                     </th>
//                     <th className={`px-5 py-3 text-left text-xs font-medium ${
//                       isDarkMode ? 'text-slate-300' : 'text-gray-600'
//                     }`}>
//                       Pending
//                     </th>
//                     <th className={`px-5 py-3 text-left text-xs font-medium ${
//                       isDarkMode ? 'text-slate-300' : 'text-gray-600'
//                     }`}>
//                       Total Earned
//                     </th>
//                     <th className={`px-5 py-3 text-left text-xs font-medium ${
//                       isDarkMode ? 'text-slate-300' : 'text-gray-600'
//                     }`}>
//                       Stripe
//                     </th>
//                     <th className={`px-5 py-3 text-left text-xs font-medium ${
//                       isDarkMode ? 'text-slate-300' : 'text-gray-600'
//                     }`}>
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className={`divide-y ${
//                   isDarkMode ? 'divide-slate-800' : 'divide-gray-100'
//                 }`}>
//                   {data?.providers?.map(p => (
//                     <tr key={p.id} className={isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}>
//                       <td className="px-5 py-4">
//                         <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                           {p.name}
//                         </p>
//                         <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
//                           {p.email}
//                         </p>
//                       </td>
//                       <td className={`px-5 py-4 font-semibold ${
//                         isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
//                       }`}>
//                         {formatMoney(p.available_balance)}
//                       </td>
//                       <td className={`px-5 py-4 font-semibold ${
//                         isDarkMode ? 'text-amber-400' : 'text-amber-600'
//                       }`}>
//                         {formatMoney(p.pending_balance)}
//                       </td>
//                       <td className={`px-5 py-4 font-semibold ${
//                         isDarkMode ? 'text-white' : 'text-gray-900'
//                       }`}>
//                         {formatMoney(p.total_earnings)}
//                       </td>
//                       <td className="px-5 py-4">
//                         {p.stripe_onboarding === 'complete' ? (
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                             isDarkMode 
//                               ? 'bg-emerald-500/20 text-emerald-400' 
//                               : 'bg-emerald-100 text-emerald-700'
//                           }`}>
//                             ✅ Connected
//                           </span>
//                         ) : (
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                             isDarkMode 
//                               ? 'bg-amber-500/20 text-amber-400' 
//                               : 'bg-amber-100 text-amber-700'
//                           }`}>
//                             ⚠️ Pending
//                           </span>
//                         )}
//                       </td>
//                       <td className="px-5 py-4">
//                         <button
//                           onClick={() => {
//                             setSelectedProvider(p)
//                             setIsPayoutModalOpen(true)
//                           }}
//                           className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
//                             isDarkMode
//                               ? 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
//                               : 'bg-teal-500 text-white hover:bg-teal-600'
//                           }`}
//                         >
//                           Process
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Payouts History - Mobile Card View */}
//           <div className="sm:hidden">
//             <h2 className={`text-lg font-semibold mb-3 ${
//               isDarkMode ? 'text-white' : 'text-gray-900'
//             }`}>
//               Payout History
//             </h2>
//             <div className="space-y-3">
//               {filteredPayouts.length > 0 ? (
//                 filteredPayouts.map(p => (
//                   <div
//                     key={p.id}
//                     className={`rounded-xl border p-4 ${
//                       isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//                     }`}
//                   >
//                     <div className="flex items-start justify-between mb-2">
//                       <div>
//                         <p className={`text-xs ${
//                           isDarkMode ? 'text-slate-400' : 'text-gray-400'
//                         }`}>
//                           {formatDate(p.created_at)}
//                         </p>
//                         <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                           {p.provider_name}
//                         </p>
//                       </div>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                         p.status === 'paid' 
//                           ? isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
//                           : p.status === 'pending'
//                           ? isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
//                           : p.status === 'processing'
//                           ? isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
//                           : isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
//                       }`}>
//                         {p.status}
//                       </span>
//                     </div>

//                     <div className="flex items-center justify-between">
//                       <div>
//                         <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
//                           {p.booking_number ? `Booking #${p.booking_number}` : 'Manual payout'}
//                         </p>
//                         <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
//                           {p.provider_email}
//                         </p>
//                       </div>
//                       <p className={`font-bold text-lg ${
//                         isDarkMode ? 'text-teal-400' : 'text-teal-600'
//                       }`}>
//                         {formatMoney(p.amount)}
//                       </p>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className={`text-center py-12 rounded-xl border ${
//                   isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//                 }`}>
//                   <DollarSign className={`w-12 h-12 mx-auto mb-3 ${
//                     isDarkMode ? 'text-slate-700' : 'text-gray-300'
//                   }`} />
//                   <p className={isDarkMode ? 'text-slate-400' : 'text-gray-400'}>
//                     No payouts found
//                   </p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Payouts History - Desktop Table */}
//           <div className={`hidden sm:block rounded-xl border ${
//             isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//           }`}>
//             <div className={`px-5 py-4 border-b ${
//               isDarkMode ? 'border-slate-800' : 'border-gray-200'
//             }`}>
//               <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                 Payout History
//               </h2>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className={isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}>
//                   <tr>
//                     <th className={`px-5 py-3 text-left text-xs font-medium ${
//                       isDarkMode ? 'text-slate-300' : 'text-gray-600'
//                     }`}>
//                       Date
//                     </th>
//                     <th className={`px-5 py-3 text-left text-xs font-medium ${
//                       isDarkMode ? 'text-slate-300' : 'text-gray-600'
//                     }`}>
//                       Provider
//                     </th>
//                     <th className={`px-5 py-3 text-left text-xs font-medium ${
//                       isDarkMode ? 'text-slate-300' : 'text-gray-600'
//                     }`}>
//                       Booking
//                     </th>
//                     <th className={`px-5 py-3 text-left text-xs font-medium ${
//                       isDarkMode ? 'text-slate-300' : 'text-gray-600'
//                     }`}>
//                       Amount
//                     </th>
//                     <th className={`px-5 py-3 text-left text-xs font-medium ${
//                       isDarkMode ? 'text-slate-300' : 'text-gray-600'
//                     }`}>
//                       Status
//                     </th>
//                     <th className={`px-5 py-3 text-left text-xs font-medium ${
//                       isDarkMode ? 'text-slate-300' : 'text-gray-600'
//                     }`}>
//                       Action
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className={`divide-y ${
//                   isDarkMode ? 'divide-slate-800' : 'divide-gray-100'
//                 }`}>
//                   {filteredPayouts.length > 0 ? (
//                     filteredPayouts.map(p => (
//                       <tr key={p.id} className={isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}>
//                         <td className="px-5 py-4">
//                           <div className="flex items-center gap-2">
//                             <Calendar className={`w-3 h-3 ${
//                               isDarkMode ? 'text-slate-400' : 'text-gray-400'
//                             }`} />
//                             <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>
//                               {formatDate(p.created_at)}
//                             </span>
//                           </div>
//                         </td>
//                         <td className="px-5 py-4">
//                           <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                             {p.provider_name}
//                           </p>
//                           <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
//                             {p.provider_email}
//                           </p>
//                         </td>
//                         <td className="px-5 py-4">
//                           {p.booking_number ? (
//                             <span className={`font-mono text-xs ${
//                               isDarkMode ? 'text-slate-300' : 'text-gray-600'
//                             }`}>
//                               #{p.booking_number}
//                             </span>
//                           ) : (
//                             <span className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}>—</span>
//                           )}
//                         </td>
//                         <td className="px-5 py-4">
//                           <p className={`font-bold ${
//                             isDarkMode ? 'text-teal-400' : 'text-teal-600'
//                           }`}>
//                             {formatMoney(p.amount)}
//                           </p>
//                         </td>
//                         <td className="px-5 py-4">
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                             p.status === 'paid' 
//                               ? isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
//                               : p.status === 'pending'
//                               ? isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
//                               : p.status === 'processing'
//                               ? isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
//                               : isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
//                           }`}>
//                             {p.status}
//                           </span>
//                         </td>
//                         <td className="px-5 py-4">
//                           <button
//                             className={`p-1.5 rounded-lg ${
//                               isDarkMode
//                                 ? 'text-slate-400 hover:bg-slate-800'
//                                 : 'text-gray-400 hover:bg-gray-100'
//                             }`}
//                           >
//                             <Eye className="w-4 h-4" />
//                           </button>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="6" className={`px-5 py-12 text-center ${
//                         isDarkMode ? 'text-slate-400' : 'text-gray-400'
//                       }`}>
//                         No payouts found
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Load More Button for Mobile */}
//           {filteredPayouts.length > 0 && (
//             <div className="mt-6 flex justify-center sm:hidden">
//               <button className={`px-6 py-2 rounded-lg text-sm font-medium border ${
//                 isDarkMode
//                   ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
//                   : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
//               }`}>
//                 Load More
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Process Payout Modal */}
//       {isPayoutModalOpen && selectedProvider && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
//           <div 
//             className="absolute inset-0 bg-black/50" 
//             onClick={() => {
//               setIsPayoutModalOpen(false)
//               setSelectedProvider(null)
//             }}
//           />
          
//           <div className={`relative rounded-2xl w-full max-w-md ${
//             isDarkMode ? 'bg-slate-900' : 'bg-white'
//           }`}>
            
//             {/* Modal Header */}
//             <div className={`p-5 border-b ${
//               isDarkMode ? 'border-slate-800' : 'border-gray-200'
//             }`}>
//               <div className="flex items-center justify-between">
//                 <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   Process Payout
//                 </h3>
//                 <button
//                   onClick={() => {
//                     setIsPayoutModalOpen(false)
//                     setSelectedProvider(null)
//                   }}
//                   className={`p-1 rounded-lg ${
//                     isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-100'
//                   }`}
//                 >
//                   <X className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`} />
//                 </button>
//               </div>
//             </div>

//             {/* Modal Content */}
//             <div className="p-5 space-y-4">
//               {/* Provider Info */}
//               <div className={`p-4 rounded-xl ${
//                 isDarkMode ? 'bg-slate-800' : 'bg-gray-50'
//               }`}>
//                 <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   {selectedProvider.name}
//                 </p>
//                 <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
//                   {selectedProvider.email}
//                 </p>
//               </div>

//               {/* Balance Info */}
//               <div className="grid grid-cols-2 gap-3">
//                 <div className={`p-3 rounded-xl ${
//                   isDarkMode ? 'bg-slate-800' : 'bg-gray-50'
//                 }`}>
//                   <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
//                     Available
//                   </p>
//                   <p className={`text-lg font-bold ${
//                     isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
//                   }`}>
//                     {formatMoney(selectedProvider.available_balance)}
//                   </p>
//                 </div>
//                 <div className={`p-3 rounded-xl ${
//                   isDarkMode ? 'bg-slate-800' : 'bg-gray-50'
//                 }`}>
//                   <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
//                     Pending
//                   </p>
//                   <p className={`text-lg font-bold ${
//                     isDarkMode ? 'text-amber-400' : 'text-amber-600'
//                   }`}>
//                     {formatMoney(selectedProvider.pending_balance)}
//                   </p>
//                 </div>
//               </div>

//               {/* Amount Input */}
//               <div>
//                 <label className={`block text-sm font-medium mb-1 ${
//                   isDarkMode ? 'text-slate-300' : 'text-gray-700'
//                 }`}>
//                   Payout Amount
//                 </label>
//                 <div className="relative">
//                   <span className={`absolute left-3 top-2 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-500'
//                   }`}>$</span>
//                   <input
//                     type="number"
//                     step="0.01"
//                     max={selectedProvider.available_balance}
//                     className={`w-full pl-7 pr-4 py-2 rounded-xl border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                     placeholder="0.00"
//                   />
//                 </div>
//                 <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
//                   Maximum: {formatMoney(selectedProvider.available_balance)}
//                 </p>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex gap-3 pt-2">
//                 <button
//                   className={`flex-1 py-3 rounded-xl font-bold text-sm ${
//                     isDarkMode
//                       ? 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30'
//                       : 'bg-teal-500 text-white hover:bg-teal-600'
//                   }`}
//                 >
//                   Process Payout
//                 </button>
//                 <button
//                   onClick={() => {
//                     setIsPayoutModalOpen(false)
//                     setSelectedProvider(null)
//                   }}
//                   className={`flex-1 py-3 rounded-xl font-bold text-sm ${
//                     isDarkMode
//                       ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
//                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                   }`}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }


































'use client'

import { useState, useEffect } from 'react'
import { useAdminTheme } from '../layout'
import { Download, Clock, CheckCircle, Users, Search, Calendar, DollarSign, Filter } from 'lucide-react'

export default function AdminPayouts() {
  const { isDarkMode } = useAdminTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    fetch('/api/admin/payouts')
      .then(res => res.json())
      .then(result => {
        if (result.success) setData(result.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const formatMoney = (amt) => `$${parseFloat(amt || 0).toFixed(2)}`
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : '—'

  const filteredPayouts = data?.payouts?.filter(p => {
    const matchesSearch = p.provider_name?.toLowerCase().includes(search.toLowerCase()) ||
                         p.booking_number?.toLowerCase().includes(search.toLowerCase()) ||
                         p.provider_email?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  }) || []

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-slate-950' : 'bg-gray-50'
      }`}>
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'}`}>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Payouts
              </h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                Provider payments and balances
              </p>
            </div>

            {/* Mobile Filter Button */}
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className={`sm:hidden flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm ${
                isDarkMode
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[
              { label: 'Total Payouts', value: data?.summary?.total_payouts || 0, icon: Download, light: 'bg-blue-50 border-blue-200', dark: 'bg-blue-500/10 border-blue-500/20', iconLight: 'text-blue-600', iconDark: 'text-blue-400', isNumber: true },
              { label: 'Pending', value: data?.summary?.total_pending_amount, icon: Clock, light: 'bg-amber-50 border-amber-200', dark: 'bg-amber-500/10 border-amber-500/20', iconLight: 'text-amber-600', iconDark: 'text-amber-400' },
              { label: 'Paid', value: data?.summary?.total_paid_amount, icon: CheckCircle, light: 'bg-emerald-50 border-emerald-200', dark: 'bg-emerald-500/10 border-emerald-500/20', iconLight: 'text-emerald-600', iconDark: 'text-emerald-400' },
              { label: 'Active Providers', value: data?.providers?.length || 0, icon: Users, light: 'bg-purple-50 border-purple-200', dark: 'bg-purple-500/10 border-purple-500/20', iconLight: 'text-purple-600', iconDark: 'text-purple-400', isNumber: true },
            ].map(stat => (
              <div key={stat.label} className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 border ${isDarkMode ? stat.dark : stat.light}`}>
                <stat.icon className={`w-5 h-5 mb-2 ${isDarkMode ? stat.iconDark : stat.iconLight}`} />
                <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{stat.label}</p>
                <p className={`text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.isNumber ? stat.value : formatMoney(stat.value)}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile Filters Panel */}
          {mobileFiltersOpen && (
            <div className={`sm:hidden mb-4 p-4 rounded-xl border ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
            }`}>
              <div className="space-y-3">
                <div className="relative">
                  <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search provider or booking..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm ${
                      isDarkMode
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full px-4 py-2 rounded-xl border text-sm ${
                    isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          )}

          {/* Desktop Filters */}
          <div className="hidden sm:flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search provider or booking..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm ${
                  isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-2 rounded-xl border text-sm min-w-[150px] ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-teal-500`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Provider Balances - Mobile */}
          <div className="sm:hidden mb-6">
            <h2 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Provider Balances
            </h2>
            <div className="space-y-3">
              {data?.providers?.map(p => (
                <div key={p.id} className={`rounded-xl border p-4 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{p.name}</h3>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>{p.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.stripe_onboarding === 'complete'
                        ? isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                        : isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {p.stripe_onboarding === 'complete' ? '✅ Connected' : '⚠️ Pending'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Available</p>
                      <p className={`font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {formatMoney(p.available_balance)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Pending</p>
                      <p className={`font-semibold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                        {formatMoney(p.pending_balance)}
                      </p>
                    </div>
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Total</p>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatMoney(p.total_earnings)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Provider Balances - Desktop */}
          <div className={`hidden sm:block rounded-xl border mb-6 ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
            <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
              <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Provider Balances</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}>
                  <tr>
                    {['Provider', 'Available', 'Pending', 'Total Earned', 'Stripe'].map(col => (
                      <th key={col} className={`px-5 py-3 text-left text-xs font-medium ${
                        isDarkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-gray-100'}`}>
                  {data?.providers?.map(p => (
                    <tr key={p.id} className={isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}>
                      <td className="px-5 py-4">
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>{p.email}</p>
                      </td>
                      <td className={`px-5 py-4 font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {formatMoney(p.available_balance)}
                      </td>
                      <td className={`px-5 py-4 font-semibold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                        {formatMoney(p.pending_balance)}
                      </td>
                      <td className={`px-5 py-4 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatMoney(p.total_earnings)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          p.stripe_onboarding === 'complete'
                            ? isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                            : isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {p.stripe_onboarding === 'complete' ? '✅ Connected' : '⚠️ Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payout History - Mobile */}
          <div className="sm:hidden">
            <h2 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Payout History
            </h2>
            <div className="space-y-3">
              {filteredPayouts.length > 0 ? filteredPayouts.map(p => (
                <div key={p.id} className={`rounded-xl border p-4 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                        {formatDate(p.created_at)}
                      </p>
                      <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {p.provider_name}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      p.status === 'paid' ? isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                      : p.status === 'pending' ? isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                      : p.status === 'processing' ? isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                      : isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                        {p.booking_number ? `Booking #${p.booking_number}` : 'Manual payout'}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        {p.provider_email}
                      </p>
                    </div>
                    <p className={`font-bold text-lg ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                      {formatMoney(p.amount)}
                    </p>
                  </div>
                </div>
              )) : (
                <div className={`text-center py-12 rounded-xl border ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
                }`}>
                  <DollarSign className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-slate-700' : 'text-gray-300'}`} />
                  <p className={isDarkMode ? 'text-slate-400' : 'text-gray-400'}>No payouts found</p>
                </div>
              )}
            </div>
          </div>

          {/* Payout History - Desktop */}
          <div className={`hidden sm:block rounded-xl border ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
          }`}>
            <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
              <h2 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Payout History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}>
                  <tr>
                    {['Date', 'Provider', 'Booking', 'Amount', 'Status'].map(col => (
                      <th key={col} className={`px-5 py-3 text-left text-xs font-medium ${
                        isDarkMode ? 'text-slate-300' : 'text-gray-600'
                      }`}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-gray-100'}`}>
                  {filteredPayouts.length > 0 ? filteredPayouts.map(p => (
                    <tr key={p.id} className={isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-gray-50'}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className={`w-3 h-3 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} />
                          <span className={isDarkMode ? 'text-slate-300' : 'text-gray-600'}>
                            {formatDate(p.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{p.provider_name}</p>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>{p.provider_email}</p>
                      </td>
                      <td className="px-5 py-4">
                        {p.booking_number
                          ? <span className={`font-mono text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>#{p.booking_number}</span>
                          : <span className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}>—</span>
                        }
                      </td>
                      <td className={`px-5 py-4 font-bold ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                        {formatMoney(p.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          p.status === 'paid' ? isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                          : p.status === 'pending' ? isDarkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                          : p.status === 'processing' ? isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                          : isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className={`px-5 py-12 text-center ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>
                        No payouts found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}