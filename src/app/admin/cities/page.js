'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'

export default function CitiesPage() {
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCity, setEditingCity] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    cluster_group: '',
    is_active: true,
    citiesInput: ''
  })

  useEffect(() => {
    fetchCities()
  }, [])

  const fetchCities = async () => {
    try {
      const res = await fetch('/api/admin/service-areas')
      const data = await res.json()
      if (data.success) {
        setCities(data.data)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to fetch cities')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (city = null) => {
    if (city) {
      setEditingCity(city)
      setFormData({
        name: city.name,
        cluster_group: city.cluster_group,
        is_active: city.is_active === 1,
        citiesInput: Array.isArray(city.cities) ? city.cities.join(', ') : ''
      })
    } else {
      setEditingCity(null)
      setFormData({
        name: '',
        cluster_group: '',
        is_active: true,
        citiesInput: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCity(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.cluster_group) {
      toast.error('Name and Cluster Group are required')
      return
    }

    try {
      const url = editingCity 
        ? `/api/admin/service-areas/${editingCity.id}`
        : '/api/admin/service-areas'
      const method = editingCity ? 'PUT' : 'POST'

      const citiesArray = formData.citiesInput 
        ? formData.citiesInput.split(',').map(c => c.trim()).filter(c => c.length > 0)
        : [];

      const payload = {
        name: formData.name,
        cluster_group: formData.cluster_group,
        is_active: formData.is_active,
        cities: citiesArray
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        fetchCities()
        handleCloseModal()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error('Failed to save city')
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
          fetchCities()
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
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          <Plus className="w-5 h-5" />
          Add City
        </button>
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
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
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
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                        city.is_active 
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {city.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleOpenModal(city)}
                          className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(city.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl transform transition-all">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {editingCity ? 'Edit City' : 'Add New City'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white"
                    placeholder="e.g., Brampton"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Cluster Group <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.cluster_group}
                    onChange={(e) => setFormData({...formData, cluster_group: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white"
                    placeholder="e.g., Greater Toronto Area"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Group name used to organize areas in the provider app.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mapped Cities
                  </label>
                  <input
                    type="text"
                    value={formData.citiesInput}
                    onChange={(e) => setFormData({...formData, citiesInput: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-500 dark:bg-slate-700 dark:text-white"
                    placeholder="e.g., Surrey, Langley, White Rock"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Comma-separated list of exact city names that belong to this service area.
                  </p>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 dark:peer-focus:ring-teal-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-teal-600"></div>
                  </label>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
                    Active
                  </span>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition font-medium"
                  >
                    {editingCity ? 'Save Changes' : 'Add City'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
