











'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminTheme } from '../layout';
import Swal from 'sweetalert2';

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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
        ? <span className="px-2 py-1 text-xs bg-green-900/30 text-green-400 rounded-full whitespace-nowrap">✓ Connected & Verified</span>
        : <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full whitespace-nowrap">✓ Connected & Verified</span>;
    } else if (connected) {
      return isDarkMode
        ? <span className="px-2 py-1 text-xs bg-yellow-900/30 text-yellow-400 rounded-full whitespace-nowrap">⏳ Pending Setup</span>
        : <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full whitespace-nowrap">⏳ Pending Setup</span>;
    } else {
      return isDarkMode
        ? <span className="px-2 py-1 text-xs bg-slate-800 text-slate-400 rounded-full whitespace-nowrap">✗ Not Connected</span>
        : <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full whitespace-nowrap">✗ Not Connected</span>;
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

  const formatShortDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const updateProviderStatus = async (providerId, newStatus, providerName) => {
    const statusLabels = { active: 'Active', inactive: 'Inactive', suspended: 'Suspended', pending: 'Pending', rejected: 'Rejected' }
    const statusColors = { active: '#10b981', inactive: '#f59e0b', suspended: '#ef4444', pending: '#6366f1', rejected: '#64748b' }
    const result = await Swal.fire({
      title: 'Change Provider Status?',
      html: `Change <strong>${providerName}</strong>'s status to <strong>${statusLabels[newStatus] || newStatus}</strong>?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Change It',
      cancelButtonText: 'Cancel',
      confirmButtonColor: statusColors[newStatus] || '#14b8a6',
      cancelButtonColor: '#64748b',
      background: isDarkMode ? '#1e293b' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#000000',
    })
    if (!result.isConfirmed) return
    try {
      const res = await fetch(`/api/provider?id=${providerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      const data = await res.json()
      if (data.success) {
        Swal.fire({ 
          title: 'Updated!', 
          text: `${providerName} is now ${statusLabels[newStatus]}.`, 
          icon: 'success', 
          confirmButtonColor: '#14b8a6', 
          timer: 2000, 
          showConfirmButton: false,
          background: isDarkMode ? '#1e293b' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
        })
        loadProviders()
      } else {
        Swal.fire({ 
          title: 'Error', 
          text: data.message || 'Failed to update status', 
          icon: 'error', 
          confirmButtonColor: '#14b8a6',
          background: isDarkMode ? '#1e293b' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
        })
      }
    } catch {
      Swal.fire({ 
        title: 'Error', 
        text: 'Failed to update provider status', 
        icon: 'error', 
        confirmButtonColor: '#14b8a6',
        background: isDarkMode ? '#1e293b' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
      })
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Loading providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="px-3 sm:px-4 md:px-6 py-4 sm:py-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Service Providers
          </h1>
          <p className={`mt-0.5 sm:mt-1 text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Manage and review provider applications
          </p>
        </div>

        {/* Stats Cards - Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className={`rounded-xl shadow-sm border p-3 sm:p-4 md:p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <p className={`text-xs sm:text-sm mb-0.5 sm:mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total</p>
            <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
          </div>
          <div className={`rounded-xl shadow-sm border p-3 sm:p-4 md:p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <p className={`text-xs sm:text-sm mb-0.5 sm:mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Active</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className={`rounded-xl shadow-sm border p-3 sm:p-4 md:p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <p className={`text-xs sm:text-sm mb-0.5 sm:mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Pending</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className={`rounded-xl shadow-sm border p-3 sm:p-4 md:p-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <p className={`text-xs sm:text-sm mb-0.5 sm:mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Rejected</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-red-600">{stats.rejected || 0}</p>
          </div>
          <div className={`rounded-xl shadow-sm border p-3 sm:p-4 md:p-6 col-span-2 md:col-span-1 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <p className={`text-xs sm:text-sm mb-0.5 sm:mb-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>Onboarding Done</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600">{stats.onboarding_completed}</p>
          </div>
        </div>

        {/* Filters and Search - Mobile Optimized */}
        <div className={`rounded-xl shadow-sm border p-3 sm:p-4 mb-4 sm:mb-6 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          
          {/* Mobile Filter Toggle */}
          <div className="flex lg:hidden items-center justify-between mb-3">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition
                ${isDarkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter by Status
              <svg className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
              {filter !== 'all' ? `Showing: ${filter}` : 'All providers'}
            </span>
          </div>

          {/* Filter Buttons - Desktop (always visible) & Mobile (toggle) */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
              {/* Scrollable filter buttons on mobile */}
              <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide -mx-1 px-1 lg:mx-0 lg:px-0">
                {['all', 'pending', 'active', 'inactive', 'rejected'].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setFilter(s);
                      setShowMobileFilters(false);
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium capitalize whitespace-nowrap transition flex-shrink-0 
                      ${filter === s
                        ? 'bg-teal-600 text-white shadow-md'
                        : isDarkMode
                          ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {s} {s === 'pending' && stats.pending > 0 && ` (${stats.pending})`}
                  </button>
                ))}
              </div>
              
              {/* Search Input */}
              <div className="relative w-full lg:w-80">
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={`pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 text-sm border rounded-lg w-full focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition 
                    ${isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                />
                <svg className={`w-4 sm:w-5 h-4 sm:h-5 absolute left-3 top-2.5 sm:top-3 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`} 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Providers List */}
        <div className={`rounded-xl shadow-sm border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          {providers.length > 0 ? (
            <>
              {/* Desktop View - Table (lg and above) */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className={`border-b ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                    <tr>
                      <th className={`px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Provider</th>
                      <th className={`px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Contact</th>
                      <th className={`px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Documents</th>
                      <th className={`px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Stripe</th>
                      <th className={`px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Status</th>
                      <th className={`px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Joined</th>
                      <th className={`px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-slate-700' : 'divide-gray-200'}`}>
                    {providers.map((provider) => (
                      <tr key={provider.id} className={`transition duration-150 ${isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-teal-50/30'}`}>
                        <td className="px-4 xl:px-6 py-3 xl:py-4">
                          <div className="flex items-center gap-2 xl:gap-3">
                            <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm xl:text-lg shadow-sm flex-shrink-0">
                              {provider.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className={`font-semibold text-sm xl:text-base truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {provider.name}
                              </div>
                              <div className={`text-[10px] xl:text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                {provider.specialty || 'Not specified'}
                              </div>
                              <div className={`text-[8px] xl:text-[10px] flex items-center gap-1 mt-0.5 xl:mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                <svg className="w-2.5 h-2.5 xl:w-3 xl:h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                <span className="truncate">{provider.city || 'Not set'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-3 xl:py-4">
                          <div className={`text-xs xl:text-sm font-medium truncate max-w-[150px] xl:max-w-[200px] ${isDarkMode ? 'text-white' : 'text-gray-900'}`} title={provider.email}>
                            {provider.email}
                          </div>
                          <div className={`text-[10px] xl:text-xs truncate max-w-[150px] xl:max-w-[200px] ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`} title={provider.phone}>
                            {provider.phone}
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-3 xl:py-4">
                          <div className="flex flex-wrap gap-1 max-w-[120px] xl:max-w-[150px]">
                            {provider.documents_verified ? (
                              <span className={`inline-flex items-center gap-1 px-1.5 xl:px-2 py-0.5 text-[8px] xl:text-[10px] font-bold rounded-full whitespace-nowrap ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
                                <svg className="w-2 h-2 xl:w-2.5 xl:h-2.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Verified
                              </span>
                            ) : (
                              <>
                                {provider.approved_docs > 0 && (
                                  <span className={`px-1.5 xl:px-2 py-0.5 text-[8px] xl:text-[10px] font-bold rounded-full whitespace-nowrap ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-800'}`}>
                                    ✓ {provider.approved_docs}
                                  </span>
                                )}
                                {provider.pending_docs > 0 && (
                                  <span className={`px-1.5 xl:px-2 py-0.5 text-[8px] xl:text-[10px] font-bold rounded-full whitespace-nowrap ${isDarkMode ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>
                                    ⏳ {provider.pending_docs}
                                  </span>
                                )}
                                {provider.rejected_docs > 0 && (
                                  <span className={`px-1.5 xl:px-2 py-0.5 text-[8px] xl:text-[10px] font-bold rounded-full whitespace-nowrap ${isDarkMode ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>
                                    ✗ {provider.rejected_docs}
                                  </span>
                                )}
                                {provider.documents_count === 0 && (
                                  <span className={`px-1.5 xl:px-2 py-0.5 text-[8px] xl:text-[10px] font-bold rounded-full whitespace-nowrap ${isDarkMode ? 'bg-slate-700 text-slate-400' : 'bg-gray-100 text-gray-800'}`}>
                                    No Docs
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-3 xl:py-4">
                          <div className="scale-90 xl:scale-100 origin-left">
                            {getStripeBadge(provider.stripe_account_id, provider.stripe_onboarding_complete)}
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-3 xl:py-4">
                          <span className={`px-2 xl:px-3 py-0.5 xl:py-1 text-[8px] xl:text-[10px] font-bold rounded-full border whitespace-nowrap ${getStatusBadge(provider.status)}`}>
                            {provider.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className={`px-4 xl:px-6 py-3 xl:py-4 text-[10px] xl:text-xs whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                          {formatShortDate(provider.created_at)}
                        </td>
                        <td className="px-4 xl:px-6 py-3 xl:py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={provider.status}
                              onChange={e => updateProviderStatus(provider.id, e.target.value, provider.name)}
                              className={`px-1.5 xl:px-2 py-1 xl:py-1.5 rounded-lg text-[8px] xl:text-xs font-medium border cursor-pointer outline-none focus:ring-2 focus:ring-teal-500
                                ${provider.status === 'active' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30' :
                                  provider.status === 'suspended' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' :
                                    provider.status === 'rejected' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' :
                                      provider.status === 'inactive' ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30' :
                                        provider.status === 'pending' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30' :
                                          isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-gray-100 text-gray-700 border-gray-200'
                              }`}>
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                              <option value="pending">Pending</option>
                              <option value="suspended">Suspended</option>
                              <option value="rejected">Rejected</option>
                            </select>
                            <button
                              onClick={() => router.push(`/admin/providers/${provider.id}/documents`)}
                              className="px-2 xl:px-3 py-1 xl:py-1.5 bg-teal-600 text-white rounded-lg text-[8px] xl:text-xs font-bold hover:bg-teal-700 transition shadow-sm whitespace-nowrap"
                            >
                              Review
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View - Cards (below lg) */}
              <div className="lg:hidden divide-y divide-gray-100 dark:divide-slate-700">
                {providers.map((provider) => (
                  <div key={provider.id} className={`p-4 sm:p-5 transition duration-150 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700/50' : 'bg-white hover:bg-teal-50/20'}`}>
                    {/* Header with Avatar and Status */}
                    <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold text-base sm:text-xl shadow-md flex-shrink-0">
                          {provider.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`font-bold text-sm sm:text-base leading-tight truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {provider.name}
                          </div>
                          <div className={`text-[10px] sm:text-xs mt-0.5 font-medium truncate ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                            {provider.specialty || 'Service Provider'}
                          </div>
                          <div className={`text-[8px] sm:text-[10px] flex items-center gap-1 mt-0.5 sm:mt-1 font-medium truncate ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className="truncate">{provider.city || 'Location not set'}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 sm:px-2.5 py-1 text-[8px] sm:text-[10px] font-black rounded-full border shadow-sm flex-shrink-0 ${getStatusBadge(provider.status)}`}>
                        {provider.status?.toUpperCase()}
                      </span>
                    </div>

                    {/* Contact & Payment Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-5">
                      <div className={`p-2 sm:p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                        <p className={`text-[8px] sm:text-[10px] uppercase font-bold tracking-wider mb-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Contact</p>
                        <p className={`text-[10px] sm:text-xs font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`} title={provider.email}>
                          {provider.email}
                        </p>
                        <p className={`text-[8px] sm:text-[10px] mt-0.5 font-medium truncate ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`} title={provider.phone}>
                          {provider.phone}
                        </p>
                      </div>
                      <div className={`p-2 sm:p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-gray-50'}`}>
                        <p className={`text-[8px] sm:text-[10px] uppercase font-bold tracking-wider mb-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Payment</p>
                        <div className="scale-75 sm:scale-90 origin-left">
                          {getStripeBadge(provider.stripe_account_id, provider.stripe_onboarding_complete)}
                        </div>
                      </div>
                    </div>

                    {/* Document Summary */}
                    <div className="mb-3 sm:mb-5">
                      <p className={`text-[8px] sm:text-[10px] uppercase font-bold tracking-wider mb-1.5 sm:mb-2.5 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Document Summary</p>
                      <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        {provider.documents_verified ? (
                          <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 text-[8px] sm:text-[10px] font-bold rounded-full shadow-sm ${isDarkMode ? 'bg-green-900/40 text-green-400 border border-green-800/50' : 'bg-green-100/80 text-green-800 border border-green-200'}`}>
                            <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                            Fully Verified
                          </span>
                        ) : (
                          <>
                            {provider.approved_docs > 0 && (
                              <span className={`px-2 sm:px-2.5 py-1 text-[8px] sm:text-[10px] font-bold rounded-full border whitespace-nowrap ${isDarkMode ? 'bg-green-900/30 text-green-400 border-green-800/50' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                ✓ {provider.approved_docs} Approved
                              </span>
                            )}
                            {provider.pending_docs > 0 && (
                              <span className={`px-2 sm:px-2.5 py-1 text-[8px] sm:text-[10px] font-bold rounded-full border whitespace-nowrap ${isDarkMode ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                ⏳ {provider.pending_docs} Pending
                              </span>
                            )}
                            {provider.rejected_docs > 0 && (
                              <span className={`px-2 sm:px-2.5 py-1 text-[8px] sm:text-[10px] font-bold rounded-full border whitespace-nowrap ${isDarkMode ? 'bg-red-900/30 text-red-400 border-red-800/50' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                ✗ {provider.rejected_docs} Rejected
                              </span>
                            )}
                            {provider.documents_count === 0 && (
                              <span className={`px-2 sm:px-2.5 py-1 text-[8px] sm:text-[10px] font-bold rounded-full border whitespace-nowrap ${isDarkMode ? 'bg-slate-700 text-slate-400 border-slate-600' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                No Documents
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Footer with Actions */}
                    <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 dark:border-slate-700">
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[8px] sm:text-[10px] font-bold tracking-tighter uppercase ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>Member Since</span>
                        <span className={`text-[9px] sm:text-[11px] font-semibold truncate ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                          {formatShortDate(provider.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                        <select
                          value={provider.status}
                          onChange={e => updateProviderStatus(provider.id, e.target.value, provider.name)}
                          className={`px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg text-[8px] sm:text-xs border ${isDarkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-gray-100 text-gray-700 border-gray-200'} focus:outline-none`}>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="pending">Pending</option>
                          <option value="suspended">Suspended</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <button
                          onClick={() => router.push(`/admin/providers/${provider.id}/documents`)}
                          className="px-2.5 sm:px-4 py-1 sm:py-2 bg-teal-600 text-white rounded-lg sm:rounded-xl text-[8px] sm:text-xs font-black hover:bg-teal-700 transition active:scale-95 shadow-lg shadow-teal-500/20 whitespace-nowrap"
                        >
                          REVIEW
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4">
              <svg className={`mx-auto h-10 w-10 sm:h-12 sm:w-12 ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className={`mt-3 sm:mt-4 text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>No providers found</p>
              <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Custom scrollbar hide class */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}