'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, MapPin, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

export default function DistrictsPage() {
  const [districts, setDistricts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [states, setStates] = useState([])
  const [filterState, setFilterState] = useState('')

  useEffect(() => {
    fetchStates()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    fetchDistricts(page, filterState, debouncedSearch)
  }, [page, filterState, debouncedSearch])

  const fetchStates = async () => {
    try {
      const res = await fetch('/api/admin/states?all=true')
      const data = await res.json()
      if (data.success) {
        setStates(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch states')
    }
  }

  const fetchDistricts = async (currentPage, stateId, searchQuery) => {
    setLoading(true)
    try {
      const query = new URLSearchParams({
        page: currentPage,
        limit: 10,
        state_id: stateId,
        search: searchQuery
      })
      const res = await fetch(`/api/admin/districts?${query}`)
      const data = await res.json()
      if (data.success) {
        setDistricts(data.data)
        setTotalPages(data.totalPages || 1)
        setTotalItems(data.total || 0)
        setPage(data.page || 1)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to fetch districts')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    })

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/districts/${id}`, {
          method: 'DELETE'
        })
        const data = await res.json()
        if (data.success) {
          toast.success(data.message)
          fetchDistricts(page, filterState, debouncedSearch)
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error('Failed to delete district')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Districts</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage districts under states.</p>
        </div>
        <Link
          href="/admin/districts/new"
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add District
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search districts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-white"
          />
        </div>
        <select
          value={filterState}
          onChange={(e) => {
            setFilterState(e.target.value)
            setPage(1)
          }}
          className="w-full sm:w-64 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-white"
        >
          <option value="">All States</option>
          {states.map((state) => (
            <option key={state.id} value={state.id}>{state.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-slate-200">Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-slate-200">State</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-slate-200">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-slate-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    </div>
                  </td>
                </tr>
              ) : districts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No districts found. Add one to get started.
                  </td>
                </tr>
              ) : (
                districts.map((district) => (
                  <tr key={district.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{district.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">
                      {district.state_name}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(district)}
                        title="Click to change status"
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium hover:opacity-80 transition cursor-pointer ${district.is_active === 1
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                      >
                        {district.is_active === 1 ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/districts/${district.id}`}
                          className="p-2 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(district.id)}
                          className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to <span className="font-medium">{Math.min(page * 10, totalItems)}</span> of <span className="font-medium">{totalItems}</span> results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
