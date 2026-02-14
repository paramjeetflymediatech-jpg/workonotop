// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAdminTheme } from './layout'

// export default function AdminDashboard() {
//   const router = useRouter()
//   const { isDarkMode } = useAdminTheme()
//   const [stats, setStats] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [isMounted, setIsMounted] = useState(false)

//   useEffect(() => {
//     setIsMounted(true)
    
//     const auth = localStorage.getItem('adminAuth')
//     if (!auth) {
//       router.push('/')
//       return
//     }
//     loadData()
//   }, [])

//   const loadData = async () => {
//     setLoading(true)
//     try {
//       const statsRes = await fetch('/api/stats')
//       const statsData = await statsRes.json()
//       setStats(statsData.data || {
//         totalJobs: 4,
//         pendingJobs: 0,
//         totalTradespeople: 3,
//         activeTradespeople: 3,
//         totalReviews: 2,
//         averageRating: 4.5
//       })
//     } catch (error) {
//       console.error('Error loading data:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (!isMounted) {
//     return null
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
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${
//           isDarkMode ? 'text-white' : 'text-gray-900'
//         }`}>
//           Dashboard Overview
//         </h1>
//         <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
//           Welcome back! Here's what's happening with your business today.
//         </p>
//       </div>

//       {/* Stats Grid */}
//       {stats && (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {/* Total Job Requests */}
//           <div className={`rounded-xl p-6 shadow-lg border ${
//             isDarkMode 
//               ? 'bg-slate-900 border-slate-800' 
//               : 'bg-white border-gray-200'
//           }`}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className={`text-sm mb-1 ${
//                   isDarkMode ? 'text-slate-400' : 'text-gray-600'
//                 }`}>Total Job Requests</p>
//                 <p className={`text-3xl font-bold ${
//                   isDarkMode ? 'text-white' : 'text-gray-900'
//                 }`}>{stats.totalJobs}</p>
//               </div>
//               <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
//                 <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           {/* Pending Jobs */}
//           <div className={`rounded-xl p-6 shadow-lg border ${
//             isDarkMode 
//               ? 'bg-slate-900 border-slate-800' 
//               : 'bg-white border-gray-200'
//           }`}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className={`text-sm mb-1 ${
//                   isDarkMode ? 'text-slate-400' : 'text-gray-600'
//                 }`}>Pending Jobs</p>
//                 <p className={`text-3xl font-bold ${
//                   isDarkMode ? 'text-white' : 'text-gray-900'
//                 }`}>{stats.pendingJobs}</p>
//               </div>
//               <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600">
//                 <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           {/* Total Tradespeople */}
//           <div className={`rounded-xl p-6 shadow-lg border ${
//             isDarkMode 
//               ? 'bg-slate-900 border-slate-800' 
//               : 'bg-white border-gray-200'
//           }`}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className={`text-sm mb-1 ${
//                   isDarkMode ? 'text-slate-400' : 'text-gray-600'
//                 }`}>Total Tradespeople</p>
//                 <p className={`text-3xl font-bold ${
//                   isDarkMode ? 'text-white' : 'text-gray-900'
//                 }`}>{stats.totalTradespeople}</p>
//               </div>
//               <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
//                 <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           {/* Active Tradespeople */}
//           <div className={`rounded-xl p-6 shadow-lg border ${
//             isDarkMode 
//               ? 'bg-slate-900 border-slate-800' 
//               : 'bg-white border-gray-200'
//           }`}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className={`text-sm mb-1 ${
//                   isDarkMode ? 'text-slate-400' : 'text-gray-600'
//                 }`}>Active Tradespeople</p>
//                 <p className={`text-3xl font-bold ${
//                   isDarkMode ? 'text-white' : 'text-gray-900'
//                 }`}>{stats.activeTradespeople}</p>
//               </div>
//               <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
//                 <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           {/* Total Reviews */}
//           <div className={`rounded-xl p-6 shadow-lg border ${
//             isDarkMode 
//               ? 'bg-slate-900 border-slate-800' 
//               : 'bg-white border-gray-200'
//           }`}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className={`text-sm mb-1 ${
//                   isDarkMode ? 'text-slate-400' : 'text-gray-600'
//                 }`}>Total Reviews</p>
//                 <p className={`text-3xl font-bold ${
//                   isDarkMode ? 'text-white' : 'text-gray-900'
//                 }`}>{stats.totalReviews}</p>
//               </div>
//               <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600">
//                 <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           {/* Average Rating */}
//           <div className={`rounded-xl p-6 shadow-lg border ${
//             isDarkMode 
//               ? 'bg-slate-900 border-slate-800' 
//               : 'bg-white border-gray-200'
//           }`}>
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className={`text-sm mb-1 ${
//                   isDarkMode ? 'text-slate-400' : 'text-gray-600'
//                 }`}>Average Rating</p>
//                 <p className={`text-3xl font-bold ${
//                   isDarkMode ? 'text-white' : 'text-gray-900'
//                 }`}>{stats.averageRating}</p>
//               </div>
//               <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600">
//                 <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
//                 </svg>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Quick Stats & System Status */}
//       <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {/* Quick Stats */}
//         <div className={`rounded-xl p-6 shadow-lg border ${
//           isDarkMode 
//             ? 'bg-slate-900 border-slate-800' 
//             : 'bg-white border-gray-200'
//         }`}>
//           <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
//             isDarkMode ? 'text-white' : 'text-gray-900'
//           }`}>
//             <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
//             </svg>
//             Quick Stats
//           </h3>
//           <div className="space-y-4">
//             <div className={`flex items-center justify-between p-3 rounded-lg ${
//               isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'
//             }`}>
//               <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Jobs This Week</span>
//               <span className={`font-semibold ${
//                 isDarkMode ? 'text-white' : 'text-gray-900'
//               }`}>{stats?.totalJobs || 4}</span>
//             </div>
//             <div className={`flex items-center justify-between p-3 rounded-lg ${
//               isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'
//             }`}>
//               <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>New Tradespeople</span>
//               <span className={`font-semibold ${
//                 isDarkMode ? 'text-white' : 'text-gray-900'
//               }`}>{stats?.totalTradespeople || 3}</span>
//             </div>
//             <div className={`flex items-center justify-between p-3 rounded-lg ${
//               isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'
//             }`}>
//               <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Completion Rate</span>
//               <span className="font-semibold text-green-600 dark:text-green-400">92%</span>
//             </div>
//           </div>
//         </div>

//         {/* System Status */}
//         <div className={`rounded-xl p-6 shadow-lg border ${
//           isDarkMode 
//             ? 'bg-slate-900 border-slate-800' 
//             : 'bg-white border-gray-200'
//         }`}>
//           <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${
//             isDarkMode ? 'text-white' : 'text-gray-900'
//           }`}>
//             <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             System Status
//           </h3>
//           <div className="space-y-4">
//             <div className={`flex items-center justify-between p-3 rounded-lg ${
//               isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'
//             }`}>
//               <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Database</span>
//               <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-600 dark:text-green-400">
//                 Healthy
//               </span>
//             </div>
//             <div className={`flex items-center justify-between p-3 rounded-lg ${
//               isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'
//             }`}>
//               <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>API Status</span>
//               <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-600 dark:text-green-400">
//                 Online
//               </span>
//             </div>
//             <div className={`flex items-center justify-between p-3 rounded-lg ${
//               isDarkMode ? 'bg-slate-800/50' : 'bg-gray-100'
//             }`}>
//               <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Last Backup</span>
//               <span className={isDarkMode ? 'text-slate-500' : 'text-gray-500'}>2 hours ago</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }












'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminTheme } from './layout'

export default function AdminDashboard() {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentBookings, setRecentBookings] = useState([])

  useEffect(() => {
    checkAuth()
    loadDashboardData()
  }, [])

  const checkAuth = () => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) {
      router.push('/admin/login')
    }
  }

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const statsRes = await fetch('/api/stats')
      const statsData = await statsRes.json()
      setStats(statsData.data)

      const bookingsRes = await fetch('/api/bookings')
      const bookingsData = await bookingsRes.json()
      setRecentBookings(bookingsData.data?.slice(0, 5) || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Dashboard Overview
        </h1>
        <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Jobs Card */}
        <div className={`rounded-xl p-6 shadow-lg border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Total Jobs
              </p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalJobs}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className="text-yellow-600 dark:text-yellow-400">Pending: {stats.pendingJobs}</span>
            <span className="text-green-600 dark:text-green-400">Completed: {stats.completedJobs}</span>
          </div>
        </div>

        {/* Total Customers Card */}
        <div className={`rounded-xl p-6 shadow-lg border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Total Customers
              </p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalCustomers}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className="text-green-600 dark:text-green-400">Verified: {stats.verifiedCustomers}</span>
            <span className="text-blue-600 dark:text-blue-400">New: {stats.newCustomers}</span>
          </div>
        </div>

        {/* Total Tradespeople Card */}
        <div className={`rounded-xl p-6 shadow-lg border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Tradespeople
              </p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalTradespeople}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className="text-green-600 dark:text-green-400">Active: {stats.activeTradespeople}</span>
            <span className="text-blue-600 dark:text-blue-400">New: {stats.newTradespeople}</span>
          </div>
        </div>

        {/* Revenue Card */}
        <div className={`rounded-xl p-6 shadow-lg border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Total Revenue
              </p>
              <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ${parseFloat(stats.totalRevenue).toLocaleString()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-green-600">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <span className="text-blue-600 dark:text-blue-400">Jobs This Week: {stats.jobsThisWeek}</span>
            <span className="text-green-600 dark:text-green-400">Completion: {stats.completionRate}%</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Job Status Distribution */}
        <div className={`rounded-xl p-6 shadow-lg border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Job Status
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Pending</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.pendingJobs}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Confirmed</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.confirmedJobs}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>In Progress</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.inProgressJobs}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Completed</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.completedJobs}
              </p>
            </div>
          </div>
        </div>

        {/* Services Overview */}
        <div className={`rounded-xl p-6 shadow-lg border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Services & Categories
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Total Services</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalServices}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Categories</p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalCategories}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Summary */}
      <div className={`rounded-xl p-6 shadow-lg border mb-8 ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-bold flex items-center gap-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Reviews Overview
          </h3>
          <button
            onClick={() => router.push('/admin/reviews')}
            className="text-sm text-teal-600 dark:text-teal-400 hover:underline"
          >
            View All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Total Reviews</p>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.totalReviews}
            </p>
          </div>
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Average Rating</p>
            <div className="flex items-center gap-2">
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.averageRating}
              </p>
              <span className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>/5.0</span>
            </div>
          </div>
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>5-Star Reviews</p>
            <p className={`text-2xl font-bold text-green-600 dark:text-green-400`}>
              {stats.fiveStarReviews}
            </p>
          </div>
          <div>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>4-Star Reviews</p>
            <p className={`text-2xl font-bold text-blue-600 dark:text-blue-400`}>
              {stats.fourStarReviews}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className={`rounded-xl shadow-lg border overflow-hidden ${
        isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Recent Job Requests
            </h3>
            <button
              onClick={() => router.push('/admin/jobs')}
              className="text-sm text-teal-600 dark:text-teal-400 hover:underline font-medium"
            >
              View All
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentBookings.length > 0 ? (
                recentBookings.map((booking) => (
                  <tr key={booking.id} className={isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        #{booking.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {booking.first_name} {booking.last_name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {booking.service_name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                        booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' :
                        booking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                        booking.status === 'in_progress' ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400' :
                        booking.status === 'completed' ? 'bg-green-500/20 text-green-600 dark:text-green-400' :
                        'bg-red-500/20 text-red-600 dark:text-red-400'
                      }`}>
                        {booking.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        ${booking.total_price}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center">
                    <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                      No recent bookings found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}