'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

export default function CitiesPage() {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    fetchCities(page)
  }, [page])

  const fetchCities = async (currentPage) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/service-areas?page=${currentPage}&limit=10`)
      const data = await res.json()
      if (data.success) {
        setCities(data.data)
        setTotalPages(data.totalPages || 1)
        setTotalItems(data.total || 0)
        setPage(data.page || 1)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to fetch cities')
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
        const res = await fetch(`/api/admin/service-areas/${id}`, {
          method: 'DELETE'
        })
        const data = await res.json()
        if (data.success) {
          toast.success(data.message)
          fetchCities(page)
        } else {
          toast.error(data.message)
        }
      } catch (error) {
        toast.error('Failed to delete city')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cities & Service Areas</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage locations where services are offered.</p>
        </div>
        <Link
          href="/admin/cities/new"
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add City
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-slate-200">Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-slate-200">Cluster Group</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-slate-200">Mapped Cities</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-slate-200">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-slate-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    </div>
                  </td>
                </tr>
              ) : cities.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No cities found. Add one to get started.
                  </td>
                </tr>
              ) : (
                cities.map((city) => (
                  <tr key={city.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{city.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">
                      {city.cluster_group}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300 text-sm max-w-xs truncate" title={Array.isArray(city.cities) ? city.cities.join(', ') : ''}>
                      {Array.isArray(city.cities) && city.cities.length > 0 
                        ? city.cities.join(', ') 
                        : <span className="text-gray-400 italic">None</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        city.is_active === 1 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {city.is_active === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/cities/${city.id}`}
                          className="p-2 text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(city.id)}
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
        
        {/* Pagination controls */}
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
