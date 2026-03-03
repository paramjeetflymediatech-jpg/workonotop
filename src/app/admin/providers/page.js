// // app/admin/providers/page.jsx
// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// export default function AdminProviders() {
//   const router = useRouter();
//   const [providers, setProviders] = useState([]);
//   const [stats, setStats] = useState({
//     total: 0,
//     active: 0,
//     pending: 0,
//     rejected: 0,
//     onboarding_completed: 0
//   });
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState('all');
//   const [search, setSearch] = useState('');

//   useEffect(() => {
//     loadProviders();
//   }, [filter, search]);

//   const loadProviders = async () => {
//     try {
//       setLoading(true);
//       const params = new URLSearchParams();
//       if (filter !== 'all') params.append('status', filter);
//       if (search) params.append('search', search);

//       const res = await fetch(`/api/admin/providers?${params}`);
//       const data = await res.json();

//       if (data.success) {
//         setProviders(data.data.providers);
//         setStats(data.data.stats);
//       }
//     } catch (error) {
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusBadge = (status) => {
//     const badges = {
//       active: 'bg-green-100 text-green-800 border-green-200',
//       inactive: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//       rejected: 'bg-red-100 text-red-800 border-red-200',
//       pending: 'bg-purple-100 text-purple-800 border-purple-200'
//     };
//     return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
//   };

//   const getStripeBadge = (connected, complete) => {
//     if (connected && complete) {
//       return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">✓ Connected & Verified</span>;
//     } else if (connected) {
//       return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">⏳ Pending Setup</span>;
//     } else {
//       return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">✗ Not Connected</span>;
//     }
//   };

//   const formatDate = (date) => {
//     return new Date(date).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900">Service Providers</h1>
//           <p className="text-gray-600 mt-1">Manage and review provider applications</p>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
//           <div className="bg-white rounded-xl shadow-sm border p-6">
//             <p className="text-sm text-gray-500 mb-1">Total</p>
//             <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
//           </div>
//           <div className="bg-white rounded-xl shadow-sm border p-6">
//             <p className="text-sm text-gray-500 mb-1">Active</p>
//             <p className="text-3xl font-bold text-green-600">{stats.active}</p>
//           </div>
//           <div className="bg-white rounded-xl shadow-sm border p-6">
//             <p className="text-sm text-gray-500 mb-1">Pending Approval</p>
//             <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
//           </div>
//           <div className="bg-white rounded-xl shadow-sm border p-6">
//             <p className="text-sm text-gray-500 mb-1">Rejected</p>
//             <p className="text-3xl font-bold text-red-600">{stats.rejected || 0}</p>
//           </div>
//           <div className="bg-white rounded-xl shadow-sm border p-6">
//             <p className="text-sm text-gray-500 mb-1">Onboarding Done</p>
//             <p className="text-3xl font-bold text-purple-600">{stats.onboarding_completed}</p>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-xl shadow-sm border p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
//           <div className="flex gap-2">
//             {['all', 'pending', 'active', 'inactive', 'rejected'].map((s) => (
//               <button
//                 key={s}
//                 onClick={() => setFilter(s)}
//                 className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
//                   filter === s 
//                     ? 'bg-teal-600 text-white' 
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 }`}
//               >
//                 {s} {s === 'pending' && stats.pending > 0 && `(${stats.pending})`}
//               </button>
//             ))}
//           </div>
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search by name, email, phone..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="pl-10 pr-4 py-2 border rounded-lg w-80 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
//             />
//             <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//         </div>

//         {/* Providers Table */}
//         <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b">
//               <tr>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Provider</th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Contact</th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Documents</th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Stripe</th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
//                 <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {providers.map((provider) => (
//                 <tr key={provider.id} className="hover:bg-gray-50 transition">
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg">
//                         {provider.name?.charAt(0).toUpperCase()}
//                       </div>
//                       <div>
//                         <div className="font-medium text-gray-900">{provider.name}</div>
//                         <div className="text-sm text-gray-500">{provider.specialty || 'Not specified'}</div>
//                         <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
//                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                           </svg>
//                           {provider.city || 'Not set'}
//                         </div>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm text-gray-900">{provider.email}</div>
//                     <div className="text-sm text-gray-500">{provider.phone}</div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="space-y-1">
//                       {provider.documents_verified ? (
//                         <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
//                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                           </svg>
//                           All Verified
//                         </span>
//                       ) : (
//                         <>
//                           {provider.approved_docs > 0 && (
//                             <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
//                               ✓ {provider.approved_docs} Approved
//                             </span>
//                           )}
//                           {provider.pending_docs > 0 && (
//                             <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
//                               ⏳ {provider.pending_docs} Pending
//                             </span>
//                           )}
//                           {provider.rejected_docs > 0 && (
//                             <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
//                               ✗ {provider.rejected_docs} Rejected
//                             </span>
//                           )}
//                           {provider.documents_count === 0 && (
//                             <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
//                               No Documents
//                             </span>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     {getStripeBadge(provider.stripe_account_id, provider.stripe_onboarding_complete)}
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusBadge(provider.status)}`}>
//                       {provider.status?.toUpperCase()}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 text-sm text-gray-500">
//                     {formatDate(provider.created_at)}
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => router.push(`/admin/providers/${provider.id}/documents`)}
//                         className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 transition flex items-center gap-1"
//                       >
//                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                         </svg>
//                         Review
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {providers.length === 0 && (
//             <div className="text-center py-12">
//               <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//               </svg>
//               <p className="mt-4 text-gray-500">No providers found</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



















// app/admin/providers/page.jsx - FINAL VERSION
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminTheme } from '../layout';

export default function AdminProviders() {
  const router = useRouter();
  const { isDarkMode } = useAdminTheme();
  const [providers, setProviders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    rejected: 0,
    onboarding_completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadProviders();
  }, [filter, search]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (search) params.append('search', search);

      const res = await fetch(`/api/admin/providers?${params}`);
      const data = await res.json();

      if (data.success) {
        setProviders(data.data.providers);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: isDarkMode
        ? 'bg-green-900/30 text-green-400 border-green-800'
        : 'bg-green-100 text-green-800 border-green-200',
      inactive: isDarkMode
        ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800'
        : 'bg-yellow-100 text-yellow-800 border-yellow-200',
      rejected: isDarkMode
        ? 'bg-red-900/30 text-red-400 border-red-800'
        : 'bg-red-100 text-red-800 border-red-200',
      pending: isDarkMode
        ? 'bg-purple-900/30 text-purple-400 border-purple-800'
        : 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return badges[status] || (isDarkMode
      ? 'bg-slate-800 text-slate-400 border-slate-700'
      : 'bg-gray-100 text-gray-800 border-gray-200');
  };

  const getStripeBadge = (connected, complete) => {
    if (connected && complete) {
      return isDarkMode
        ? <span className="px-2 py-1 text-xs bg-green-900/30 text-green-400 rounded-full">✓ Connected & Verified</span>
        : <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">✓ Connected & Verified</span>;
    } else if (connected) {
      return isDarkMode
        ? <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-400 rounded-full">⏳ Pending Setup</span>
        : <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">⏳ Pending Setup</span>;
    } else {
      return isDarkMode
        ? <span className="px-2 py-1 text-xs bg-slate-800 text-slate-400 rounded-full">✗ Not Connected</span>
        : <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">✗ Not Connected</span>;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Service Providers
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Manage and review provider applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className={`rounded-xl shadow-sm border p-4 md:p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
            <p className={`text-xs md:text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total</p>
            <p className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          </div>
          <div className={`rounded-xl shadow-sm border p-4 md:p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
            <p className={`text-xs md:text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Active</p>
            <p className="text-2xl md:text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className={`rounded-xl shadow-sm border p-4 md:p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
            <p className={`text-xs md:text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Pending Approval</p>
            <p className="text-2xl md:text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className={`rounded-xl shadow-sm border p-4 md:p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
            <p className={`text-xs md:text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Rejected</p>
            <p className="text-2xl md:text-3xl font-bold text-red-600">{stats.rejected || 0}</p>
          </div>
          <div className={`rounded-xl shadow-sm border p-4 md:p-6 col-span-2 md:col-span-1 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
            <p className={`text-xs md:text-sm mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Onboarding Done</p>
            <p className="text-2xl md:text-3xl font-bold text-purple-600">{stats.onboarding_completed}</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className={`rounded-xl shadow-sm border p-4 mb-6 flex flex-col lg:flex-row gap-4 lg:items-center justify-between ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
          {/* Horizontal scrollable buttons on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide -mx-2 px-2 lg:mx-0 lg:px-0">
            {['all', 'pending', 'active', 'inactive', 'rejected'].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition flex-shrink-0 ${filter === s
                  ? 'bg-teal-600 text-white'
                  : isDarkMode
                    ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {s} {s === 'pending' && stats.pending > 0 && `(${stats.pending})`}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-80">
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-10 pr-4 py-2.5 border rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition ${isDarkMode
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
            />
            <svg className={`w-5 h-5 absolute left-3 top-3 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Providers Table */}
        <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
          {providers.length > 0 ? (
            <>
              {/* Desktop View - Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className={`border-b ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'
                    }`}>
                    <tr>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`}>Provider</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`}>Contact</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`}>Documents</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`}>Stripe</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`}>Status</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`}>Joined</th>
                      <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'
                    }`}>
                    {providers.map((provider) => (
                      <tr key={provider.id} className={`transition duration-150 ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-teal-50/30'
                        }`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                              {provider.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {provider.name}
                              </div>
                              <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                {provider.specialty || 'Not specified'}
                              </div>
                              <div className={`text-[10px] flex items-center gap-1 mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'
                                }`}>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                {provider.city || 'Not set'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{provider.email}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{provider.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {provider.documents_verified ? (
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                                }`}>
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Verified
                              </span>
                            ) : (
                              <>
                                {provider.approved_docs > 0 && (
                                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'
                                    }`}>
                                    ✓ {provider.approved_docs} Approved
                                  </span>
                                )}
                                {provider.pending_docs > 0 && (
                                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    ⏳ {provider.pending_docs} Pending
                                  </span>
                                )}
                                {provider.rejected_docs > 0 && (
                                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'
                                    }`}>
                                    ✗ {provider.rejected_docs} Rejected
                                  </span>
                                )}
                                {provider.documents_count === 0 && (
                                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    No Docs
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStripeBadge(provider.stripe_account_id, provider.stripe_onboarding_complete)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${getStatusBadge(provider.status)}`}>
                            {provider.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          {formatDate(provider.created_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => router.push(`/admin/providers/${provider.id}/documents`)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition shadow-sm"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View - Cards */}
              <div className="lg:hidden divide-y divide-gray-100 dark:divide-slate-700">
                {providers.map((provider) => (
                  <div key={provider.id} className={`p-5 transition duration-150 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700/50' : 'bg-white hover:bg-teal-50/20'
                    }`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                          {provider.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className={`font-bold text-base leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {provider.name}
                          </div>
                          <div className={`text-xs mt-0.5 font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                            {provider.specialty || 'Service Provider'}
                          </div>
                          <div className={`text-[10px] flex items-center gap-1 mt-1 font-medium ${isDarkMode ? 'text-slate-500' : 'text-gray-400'
                            }`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {provider.city || 'Location not set'}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-full border shadow-sm ${getStatusBadge(provider.status)}`}>
                        {provider.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                        <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Contact</p>
                        <p className={`text-xs font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{provider.email}</p>
                        <p className={`text-[10px] mt-0.5 font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{provider.phone}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                        <p className={`text-[10px] uppercase font-bold tracking-wider mb-1.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Payment</p>
                        <div className="scale-90 origin-top-left">
                          {getStripeBadge(provider.stripe_account_id, provider.stripe_onboarding_complete)}
                        </div>
                      </div>
                    </div>

                    <div className="mb-5">
                      <p className={`text-[10px] uppercase font-bold tracking-wider mb-2.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Document Summary</p>
                      <div className="flex flex-wrap gap-1.5">
                        {provider.documents_verified ? (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-full shadow-sm ${isDarkMode ? 'bg-green-900/40 text-green-400 border border-green-800/50' : 'bg-green-100/80 text-green-800 border border-green-200'
                            }`}>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Fully Verified
                          </span>
                        ) : (
                          <>
                            {provider.approved_docs > 0 && (
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${isDarkMode ? 'bg-green-900/30 text-green-400 border-green-800/50' : 'bg-green-50 text-green-700 border-green-100'
                                }`}>
                                ✓ {provider.approved_docs} Approved
                              </span>
                            )}
                            {provider.pending_docs > 0 && (
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50' : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                }`}>
                                ⏳ {provider.pending_docs} Pending
                              </span>
                            )}
                            {provider.rejected_docs > 0 && (
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${isDarkMode ? 'bg-red-900/30 text-red-400 border-red-800/50' : 'bg-red-50 text-red-700 border-red-100'
                                }`}>
                                ✗ {provider.rejected_docs} Rejected
                              </span>
                            )}
                            {provider.documents_count === 0 && (
                              <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${isDarkMode ? 'bg-slate-700 text-slate-400 border-slate-600' : 'bg-gray-100 text-gray-600 border-gray-200'
                                }`}>No Documents</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-bold tracking-tighter uppercase ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Member Since</span>
                        <span className={`text-[11px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>{formatDate(provider.created_at)}</span>
                      </div>
                      <button
                        onClick={() => router.push(`/admin/providers/${provider.id}/documents`)}
                        className="px-5 py-2.5 bg-teal-600 text-white rounded-xl text-xs font-black hover:bg-teal-700 transition active:scale-95 shadow-lg shadow-teal-500/20"
                      >
                        REVIEW APPLICATION
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <svg className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className={`mt-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>No providers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}