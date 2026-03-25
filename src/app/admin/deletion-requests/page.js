'use client';

import { useState, useEffect } from 'react';
import { useAdminTheme } from '../layout';
import toast from 'react-hot-toast';

export default function DeletionRequestsPage() {
  const { isDarkMode } = useAdminTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchRequests(pagination.page);
  }, [pagination.page]);

  const fetchRequests = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/deletion-requests?page=${page}&limit=${pagination.limit}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
          page: data.pagination.page
        }));
      } else {
        toast.error(data.message || 'Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Internal Server Error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch('/api/admin/deletion-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        if (selectedRequest && selectedRequest.id === id) {
          setSelectedRequest({ ...selectedRequest, status });
        }
        fetchRequests(pagination.page);
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Pending</span>;
      case 'processed':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Processed</span>;
      case 'cancelled':
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">Cancelled</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="space-y-6 relative pb-10">
      {/* Mobile/Tab-only Background Blur overlay */}
      <div className="lg:hidden fixed inset-0 bg-white/40 backdrop-blur-xl -z-10 pointer-events-none" />

      <div className="flex justify-between items-center relative z-10">
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Data Deletion Requests
          </h2>
          <p className={`text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Review and manage {pagination.total} user data deletion requests.
          </p>
        </div>
        <button
          onClick={() => fetchRequests(pagination.page)}
          className="p-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Desktop Table Layout */}
      <div className={`hidden lg:block overflow-hidden rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b text-sm font-bold ${isDarkMode ? 'border-slate-800 text-slate-400 bg-slate-800/50' : 'border-slate-200 text-slate-500 bg-slate-50'}`}>
                <th className="px-6 py-4">Request Date</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4 ">Reason Preview</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-200'}`}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-4 h-12">
                      <div className={`h-4 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                    </td>
                  </tr>
                ))
              ) : requests.length > 0 ? (
                requests.map((req) => (
                  <tr 
                    key={req.id} 
                    onClick={() => setSelectedRequest(req)}
                    className={`cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {req.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                      {req.reason || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(req.id, 'processed')}
                              className="px-3 py-1 text-xs font-bold bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                            >
                              Process
                            </button>
                            <button
                              onClick={() => updateStatus(req.id, 'cancelled')}
                              className="px-3 py-1 text-xs font-bold bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className={`p-1 rounded-md transition ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                          title="View Details"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No deletion requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Tablet Card Layout */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={`p-5 rounded-2xl border animate-pulse ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between mb-4">
                <div className={`h-4 w-24 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                <div className={`h-4 w-16 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
              </div>
              <div className={`h-4 w-full rounded mb-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
              <div className={`h-4 w-2/3 rounded ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
            </div>
          ))
        ) : requests.length > 0 ? (
          requests.map((req) => (
            <div 
              key={req.id} 
              onClick={() => setSelectedRequest(req)}
              className={`p-5 rounded-2xl border transition-all active:scale-[0.98] ${
                isDarkMode ? 'bg-slate-900 border-slate-800 active:bg-slate-800' : 'bg-white border-slate-200 active:bg-slate-50'
              } shadow-sm`}
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {new Date(req.created_at).toLocaleDateString()}
                </span>
                {getStatusBadge(req.status)}
              </div>
              <h4 className={`text-sm font-bold mb-2 truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {req.email}
              </h4>
              <p className={`text-xs line-clamp-2 mb-4 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {req.reason || 'No reason provided.'}
              </p>
              
              <div className="flex gap-2 pt-3 border-t border-slate-800/10 dark:border-slate-800">
                {req.status === 'pending' && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); updateStatus(req.id, 'processed'); }}
                      className="flex-1 py-2 text-[11px] font-bold bg-green-600 text-white rounded-lg"
                    >
                      Process
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); updateStatus(req.id, 'cancelled'); }}
                      className="flex-1 py-2 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-400"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedRequest(req); }}
                  className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition ${
                    req.status === 'pending' 
                      ? (isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500')
                      : (isDarkMode ? 'bg-teal-900/30 text-teal-400' : 'bg-teal-50 text-teal-600')
                  }`}
                >
                  View Full Reason
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-400">
            No deletion requests found.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 relative z-10">
          <p className="text-xs font-medium text-slate-500">
            Showing page <span className="font-bold text-teal-600">{pagination.page}</span> of <span className="font-bold">{pagination.totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                pagination.page === 1 
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800' 
                  : (isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm')
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }).map((_, i) => {
                const pageNum = i + 1;
                // Simple logic to show current, first, last, and a few around current
                if (
                  pageNum === 1 || 
                  pageNum === pagination.totalPages || 
                  (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                        pagination.page === pageNum
                          ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                          : (isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-50 text-slate-500')
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === pagination.page - 2 || 
                  pageNum === pagination.page + 2
                ) {
                  return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                }
                return null;
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                pagination.page === pagination.totalPages 
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800' 
                  : (isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm')
              }`}
            >
              Next
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`px-5 py-4 sm:px-8 sm:py-6 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
              <div>
                <h3 className={`text-lg sm:text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Request Details</h3>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Submitted on {new Date(selectedRequest.created_at).toLocaleString()}</p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className={`p-1.5 sm:p-2 rounded-full transition ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-8 space-y-5 sm:space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 sm:mb-2">User Email</label>
                  <p className={`text-sm sm:text-base font-semibold break-all ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 sm:mb-2">Status</label>
                  <div className="inline-block">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>

              <div className={`p-4 sm:p-6 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 sm:mb-3">Reason for Deletion</label>
                <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  {selectedRequest.reason || <span className="italic opacity-50 text-xs">No reason provided.</span>}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-700/20 text-[9px] sm:text-[10px] text-slate-500 flex justify-between">
                  <span>Word count: {selectedRequest.reason ? selectedRequest.reason.trim().split(/\s+/).filter(Boolean).length : 0}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`px-5 py-4 sm:px-8 sm:py-5 border-t flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 order-1 sm:order-1">
                {selectedRequest.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(selectedRequest.id, 'processed')}
                      className="w-full sm:w-auto px-6 py-2.5 sm:py-2 text-xs sm:text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-900/20"
                    >
                      Process Request
                    </button>
                    <button
                      onClick={() => updateStatus(selectedRequest.id, 'cancelled')}
                      className="w-full sm:w-auto px-6 py-2.5 sm:py-2 text-xs sm:text-sm font-bold bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                    >
                      Cancel Request
                    </button>
                  </>
                )}
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className={`w-full sm:w-auto px-6 py-2 text-xs sm:text-sm font-bold transition order-2 sm:order-2 ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
