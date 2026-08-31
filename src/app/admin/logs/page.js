'use client'

import React, { useState, useEffect } from 'react'
import { useAdminTheme } from '../layout'

export default function ActivityLogsPage() {
  const { isDarkMode } = useAdminTheme()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actorFilter, setActorFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState(null)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/logs?actor_type=${actorFilter}&page=${page}&limit=50`)
      const data = await res.json()
      if (data.success) {
        setLogs(data.data)
        setPagination(data.pagination)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [actorFilter, page])

  const handleFilterChange = (e) => {
    setActorFilter(e.target.value)
    setPage(1) // Reset to first page on filter change
  }

  const formatTime = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    } catch {
      return dateStr
    }
  }

  const getActorBadgeColor = (type) => {
    const map = {
      customer: 'bg-blue-100 text-blue-800 border-blue-200',
      provider: 'bg-teal-100 text-teal-800 border-teal-200',
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      system: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return map[type] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 lg:p-8 ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Activity Logs</h1>
            <p className={`mt-1 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Track all user and system activities across the platform.</p>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={actorFilter} 
              onChange={handleFilterChange}
              className={`px-4 py-2 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}
            >
              <option value="all">All Actors</option>
              <option value="customer">Customers</option>
              <option value="provider">Providers</option>
              <option value="admin">Admins</option>
              <option value="system">System</option>
            </select>
            <button 
              onClick={fetchLogs} 
              className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition flex items-center justify-center"
              title="Refresh Logs"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent" />
          </div>
        ) : logs.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'}`}>
            <p className="text-lg font-medium">No logs found</p>
            <p className="text-sm mt-1">Try changing your filters.</p>
          </div>
        ) : (
          <div className={`rounded-2xl border overflow-hidden shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className={`text-xs uppercase ${isDarkMode ? 'bg-slate-800/50 text-slate-400 border-b border-slate-800' : 'bg-slate-50 text-slate-500 border-b border-slate-200'}`}>
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date & Time</th>
                    <th className="px-4 py-3 font-semibold">Actor</th>
                    <th className="px-4 py-3 font-semibold">Action</th>
                    <th className="px-4 py-3 font-semibold">Entity</th>
                    <th className="px-4 py-3 font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {logs.map(log => (
                    <tr key={log.id} className={`transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{formatTime(log.created_at)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getActorBadgeColor(log.actor_type)}`}>
                            {log.actor_type}
                          </span>
                          <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                            {log.actor_name || `ID #${log.actor_id}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-mono text-[11px] px-2 py-1 rounded bg-teal-50 text-teal-700 font-semibold dark:bg-teal-900/30 dark:text-teal-400`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {log.entity_type ? (
                          <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`text-xs max-w-xs break-words ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {log.details ? (
                            <pre className="font-mono text-[10px] bg-black/5 dark:bg-black/20 p-2 rounded overflow-x-auto">
                              {JSON.stringify(typeof log.details === 'string' ? JSON.parse(log.details) : log.details, null, 2)}
                            </pre>
                          ) : '—'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className={`p-4 border-t flex items-center justify-between ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Showing page <span className="font-semibold">{pagination.page}</span> of <span className="font-semibold">{pagination.totalPages}</span>
                  {' '}({pagination.total} total logs)
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={pagination.page <= 1}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      pagination.page <= 1 
                        ? (isDarkMode ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed')
                        : (isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50')
                    }`}
                  >
                    Previous
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={pagination.page >= pagination.totalPages}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      pagination.page >= pagination.totalPages 
                        ? (isDarkMode ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed')
                        : (isDarkMode ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50')
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
