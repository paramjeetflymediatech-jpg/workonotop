// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAdminTheme } from '../layout'

// export default function Services() {
//   const router = useRouter()
//   const { isDarkMode } = useAdminTheme()
//   const [services, setServices] = useState([])
//   const [categories, setCategories] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [filter, setFilter] = useState('all')
//   const [selectedCategory, setSelectedCategory] = useState('all')
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false)
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false)
//   const [selectedService, setSelectedService] = useState(null)
//   const [newService, setNewService] = useState({
//     category_id: '',
//     name: '',
//     slug: '',
//     description: '',
//     short_description: '',
//     base_price: '',
//     additional_price: '',
//     duration_minutes: '',
//     image_url: '',
//     use_cases: '',
//     is_homepage: false,    // 👈 ADDED
//     is_trending: false,    // 👈 ADDED
//     is_popular: false,     // 👈 ADDED
//     is_active: true
//   })

//   useEffect(() => {
//     checkAuth()
//     loadServices()
//     loadCategories()
//   }, [])

//   const checkAuth = () => {
//     const auth = localStorage.getItem('adminAuth')
//     if (!auth) {
//       router.push('/')
//     }
//   }

//   const loadServices = async () => {
//     setLoading(true)
//     try {
//       const res = await fetch('/api/services')
//       const data = await res.json()
//       if (data.success) {
//         setServices(data.data || [])
//       }
//     } catch (error) {
//       console.error('Error loading services:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const loadCategories = async () => {
//     try {
//       const res = await fetch('/api/categories')
//       const data = await res.json()
//       if (data.success) {
//         setCategories(data.data || [])
//       }
//     } catch (error) {
//       console.error('Error loading categories:', error)
//     }
//   }

//   const addService = async (e) => {
//     e.preventDefault()
//     try {
//       const res = await fetch('/api/services', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(newService)
//       })
//       const data = await res.json()
//       if (data.success) {
//         setIsAddModalOpen(false)
//         setNewService({
//           category_id: '',
//           name: '',
//           slug: '',
//           description: '',
//           short_description: '',
//           base_price: '',
//           additional_price: '',
//           duration_minutes: '',
//           image_url: '',
//           use_cases: '',
//           is_homepage: false,
//           is_trending: false,
//           is_popular: false,
//           is_active: true
//         })
//         loadServices()
//       }
//     } catch (error) {
//       console.error('Error adding service:', error)
//     }
//   }

//   const updateService = async (e) => {
//     e.preventDefault()
//     try {
//       const res = await fetch('/api/services', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(selectedService)
//       })
//       const data = await res.json()
//       if (data.success) {
//         setIsEditModalOpen(false)
//         setSelectedService(null)
//         loadServices()
//       }
//     } catch (error) {
//       console.error('Error updating service:', error)
//     }
//   }

//   const deleteService = async (serviceId) => {
//     if (!confirm('Are you sure you want to delete this service?')) return
    
//     try {
//       const res = await fetch(`/api/services?id=${serviceId}`, {
//         method: 'DELETE'
//       })
//       const data = await res.json()
//       if (data.success) {
//         loadServices()
//       }
//     } catch (error) {
//       console.error('Error deleting service:', error)
//     }
//   }

//   const toggleServiceStatus = async (service) => {
//     try {
//       const res = await fetch('/api/services', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ...service,
//           is_active: !service.is_active
//         })
//       })
//       const data = await res.json()
//       if (data.success) {
//         loadServices()
//       }
//     } catch (error) {
//       console.error('Error toggling service status:', error)
//     }
//   }

//   const filteredServices = services.filter(service => {
//     if (selectedCategory !== 'all' && service.category_id !== parseInt(selectedCategory)) {
//       return false
//     }
//     if (filter === 'all') return true
//     if (filter === 'active') return service.is_active === true
//     if (filter === 'inactive') return service.is_active === false
//     return true
//   })

//   const formatPrice = (price) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 2
//     }).format(price)
//   }

//   const formatDuration = (minutes) => {
//     if (!minutes) return 'N/A'
//     const hours = Math.floor(minutes / 60)
//     const mins = minutes % 60
//     return hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`
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
//       <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${
//             isDarkMode ? 'text-white' : 'text-gray-900'
//           }`}>
//             Services
//           </h1>
//           <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
//             Manage all services offered by your platform
//           </p>
//         </div>
        
//         <button
//           onClick={() => setIsAddModalOpen(true)}
//           className="mt-4 sm:mt-0 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//           </svg>
//           Add Service
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="mb-6 flex flex-col sm:flex-row gap-4">
//         {/* Category Filter */}
//         <div className="flex-1">
//           <select
//             value={selectedCategory}
//             onChange={(e) => setSelectedCategory(e.target.value)}
//             className={`w-full px-4 py-2 rounded-lg border ${
//               isDarkMode 
//                 ? 'bg-slate-800 border-slate-700 text-white' 
//                 : 'bg-white border-gray-300 text-gray-900'
//             } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//           >
//             <option value="all">All Categories</option>
//             {categories.map(category => (
//               <option key={category.id} value={category.id}>
//                 {category.name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Status Filter */}
//         <div className="flex gap-2">
//           {['all', 'active', 'inactive'].map((status) => (
//             <button
//               key={status}
//               onClick={() => setFilter(status)}
//               className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
//                 filter === status
//                   ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
//                   : isDarkMode
//                     ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               {status}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Services Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
//         {filteredServices.length > 0 ? (
//           filteredServices.map((service) => (
//             <div
//               key={service.id}
//               className={`rounded-xl shadow-lg border overflow-hidden ${
//                 isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//               } ${!service.is_active ? 'opacity-60' : ''}`}
//             >
//               <div className="p-6">
//                 {/* Header */}
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-center gap-3">
//                     <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
//                       isDarkMode ? 'bg-slate-800' : 'bg-gray-100'
//                     }`}>
//                       {service.category_icon || '🔧'}
//                     </div>
//                     <div>
//                       <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                         {service.name}
//                       </h3>
//                       <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//                         {service.category_name}
//                       </p>
//                     </div>
//                   </div>
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                     service.is_active
//                       ? 'bg-green-500/20 text-green-600 dark:text-green-400'
//                       : 'bg-red-500/20 text-red-600 dark:text-red-400'
//                   }`}>
//                     {service.is_active ? 'Active' : 'Inactive'}
//                   </span>
//                 </div>

//                 {/* Description */}
//                 <p className={`text-sm mb-4 line-clamp-2 ${
//                   isDarkMode ? 'text-slate-400' : 'text-gray-600'
//                 }`}>
//                   {service.short_description || service.description || 'No description available'}
//                 </p>

//                 {/* Pricing */}
//                 <div className="mb-4">
//                   <div className="flex items-baseline gap-2">
//                     <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       {formatPrice(service.base_price)}
//                     </span>
//                     <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//                       base price
//                     </span>
//                   </div>
//                   {service.additional_price > 0 && (
//                     <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//                       +{formatPrice(service.additional_price)} additional
//                     </p>
//                   )}
//                 </div>

//                 {/* Duration */}
//                 <div className="flex items-center gap-2 mb-4">
//                   <svg className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                   <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                     {formatDuration(service.duration_minutes)}
//                   </span>
//                 </div>

//                 {/* Actions */}
//                 <div className="flex items-center gap-2">
//                   <button
//                     onClick={() => {
//                       setSelectedService(service)
//                       setIsEditModalOpen(true)
//                     }}
//                     className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
//                     style={{
//                       backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
//                       color: isDarkMode ? '#e2e8f0' : '#1e293b'
//                     }}
//                     onMouseEnter={(e) => {
//                       e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#e2e8f0'
//                     }}
//                     onMouseLeave={(e) => {
//                       e.currentTarget.style.backgroundColor = isDarkMode ? '#1e293b' : '#f1f5f9'
//                     }}
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => toggleServiceStatus(service)}
//                     className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                       service.is_active
//                         ? isDarkMode
//                           ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
//                           : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
//                         : isDarkMode
//                           ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
//                           : 'bg-green-100 text-green-700 hover:bg-green-200'
//                     }`}
//                   >
//                     {service.is_active ? 'Deactivate' : 'Activate'}
//                   </button>
//                   <button
//                     onClick={() => deleteService(service.id)}
//                     className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-red-600 transition-colors"
//                   >
//                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                     </svg>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))
//         ) : (
//           <div className="col-span-full">
//             <div className={`text-center py-12 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl border ${
//               isDarkMode ? 'border-slate-800' : 'border-gray-200'
//             }`}>
//               <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//               </svg>
//               <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                 No services found
//               </p>
//               <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
//                 {selectedCategory === 'all' 
//                   ? 'Add your first service' 
//                   : `No services in this category`}
//               </p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Add Service Modal */}
//       {isAddModalOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
//           <div className="absolute inset-0 bg-black/50" onClick={() => setIsAddModalOpen(false)} />
//           <div className={`relative rounded-xl shadow-xl w-full max-w-2xl my-8 ${
//             isDarkMode ? 'bg-slate-900' : 'bg-white'
//           }`}>
//             <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//               <div className="flex items-center justify-between">
//                 <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   Add New Service
//                 </h3>
//                 <button
//                   onClick={() => setIsAddModalOpen(false)}
//                   className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
            
//             <form onSubmit={addService}>
//               <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
//                 {/* Category */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Category *
//                   </label>
//                   <select
//                     required
//                     value={newService.category_id}
//                     onChange={(e) => setNewService({...newService, category_id: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                   >
//                     <option value="">Select a category</option>
//                     {categories.map(category => (
//                       <option key={category.id} value={category.id}>
//                         {category.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Service Name */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Service Name *
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     value={newService.name}
//                     onChange={(e) => setNewService({
//                       ...newService, 
//                       name: e.target.value,
//                       slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
//                     })}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                     placeholder="e.g., Appliance Installation"
//                   />
//                 </div>

//                 {/* Slug */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Slug *
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     value={newService.slug}
//                     onChange={(e) => setNewService({...newService, slug: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                     placeholder="e.g., appliance-installation"
//                   />
//                 </div>

//                 {/* Short Description */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Short Description
//                   </label>
//                   <input
//                     type="text"
//                     value={newService.short_description}
//                     onChange={(e) => setNewService({...newService, short_description: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                     placeholder="Brief description (max 500 chars)"
//                     maxLength="500"
//                   />
//                 </div>

//                 {/* Full Description */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Full Description
//                   </label>
//                   <textarea
//                     rows="4"
//                     value={newService.description}
//                     onChange={(e) => setNewService({...newService, description: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                     placeholder="Detailed description of the service..."
//                   ></textarea>
//                 </div>

//                 {/* Pricing */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className={`block text-sm font-medium mb-1 ${
//                       isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                     }`}>
//                       Base Price ($) *
//                     </label>
//                     <input
//                       type="number"
//                       required
//                       step="0.01"
//                       min="0"
//                       value={newService.base_price}
//                       onChange={(e) => setNewService({...newService, base_price: e.target.value})}
//                       className={`w-full px-4 py-2 rounded-lg border ${
//                         isDarkMode 
//                           ? 'bg-slate-800 border-slate-700 text-white' 
//                           : 'bg-white border-gray-300 text-gray-900'
//                       } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                       placeholder="0.00"
//                     />
//                   </div>
//                   <div>
//                     <label className={`block text-sm font-medium mb-1 ${
//                       isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                     }`}>
//                       Additional Price ($)
//                     </label>
//                     <input
//                       type="number"
//                       step="0.01"
//                       min="0"
//                       value={newService.additional_price}
//                       onChange={(e) => setNewService({...newService, additional_price: e.target.value})}
//                       className={`w-full px-4 py-2 rounded-lg border ${
//                         isDarkMode 
//                           ? 'bg-slate-800 border-slate-700 text-white' 
//                           : 'bg-white border-gray-300 text-gray-900'
//                       } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                       placeholder="0.00"
//                     />
//                   </div>
//                 </div>

//                 {/* Duration */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Duration (minutes)
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     value={newService.duration_minutes}
//                     onChange={(e) => setNewService({...newService, duration_minutes: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                     placeholder="e.g., 120"
//                   />
//                 </div>

//                 {/* Image URL */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Image URL
//                   </label>
//                   <input
//                     type="url"
//                     value={newService.image_url}
//                     onChange={(e) => setNewService({...newService, image_url: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                     placeholder="https://example.com/image.jpg"
//                   />
//                 </div>

//                 {/* 👇 Show on Homepage Options */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       id="is_homepage_add"
//                       checked={newService.is_homepage || false}
//                       onChange={(e) => setNewService({...newService, is_homepage: e.target.checked})}
//                       className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
//                     />
//                     <label htmlFor="is_homepage_add" className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
//                       Show on Homepage
//                     </label>
//                   </div>
                  
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       id="is_trending_add"
//                       checked={newService.is_trending || false}
//                       onChange={(e) => setNewService({...newService, is_trending: e.target.checked})}
//                       className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
//                     />
//                     <label htmlFor="is_trending_add" className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
//                       Trending
//                     </label>
//                   </div>
                  
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       id="is_popular_add"
//                       checked={newService.is_popular || false}
//                       onChange={(e) => setNewService({...newService, is_popular: e.target.checked})}
//                       className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
//                     />
//                     <label htmlFor="is_popular_add" className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
//                       Popular
//                     </label>
//                   </div>
//                 </div>

//                 {/* 👇 Customers use this service for */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Customers use this service for
//                   </label>
//                   <textarea
//                     rows="3"
//                     value={newService.use_cases || ''}
//                     onChange={(e) => setNewService({...newService, use_cases: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                     placeholder="Dishwasher Repair, Washer Repair, Dryer Repair, Range Repair, Fridge Repair, And much more!"
//                   />
//                   <p className="text-xs text-gray-500 mt-1">
//                     Separate with commas. Each item will appear as bullet point.
//                   </p>
//                 </div>
//               </div>
              
//               <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setIsAddModalOpen(false)}
//                   className={`px-4 py-2 rounded-lg font-medium ${
//                     isDarkMode 
//                       ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
//                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                   }`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity"
//                 >
//                   Add Service
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Edit Service Modal */}
//       {isEditModalOpen && selectedService && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
//           <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditModalOpen(false)} />
//           <div className={`relative rounded-xl shadow-xl w-full max-w-2xl my-8 ${
//             isDarkMode ? 'bg-slate-900' : 'bg-white'
//           }`}>
//             <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//               <div className="flex items-center justify-between">
//                 <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   Edit Service
//                 </h3>
//                 <button
//                   onClick={() => setIsEditModalOpen(false)}
//                   className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
            
//             <form onSubmit={updateService}>
//               <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
//                 {/* Category */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Category *
//                   </label>
//                   <select
//                     required
//                     value={selectedService.category_id}
//                     onChange={(e) => setSelectedService({...selectedService, category_id: parseInt(e.target.value)})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                   >
//                     <option value="">Select a category</option>
//                     {categories.map(category => (
//                       <option key={category.id} value={category.id}>
//                         {category.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Service Name */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Service Name *
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     value={selectedService.name}
//                     onChange={(e) => setSelectedService({...selectedService, name: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                   />
//                 </div>

//                 {/* Slug */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Slug *
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     value={selectedService.slug}
//                     onChange={(e) => setSelectedService({...selectedService, slug: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                   />
//                 </div>

//                 {/* Short Description */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Short Description
//                   </label>
//                   <input
//                     type="text"
//                     value={selectedService.short_description || ''}
//                     onChange={(e) => setSelectedService({...selectedService, short_description: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                     maxLength="500"
//                   />
//                 </div>

//                 {/* Full Description */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Full Description
//                   </label>
//                   <textarea
//                     rows="4"
//                     value={selectedService.description || ''}
//                     onChange={(e) => setSelectedService({...selectedService, description: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                   ></textarea>
//                 </div>

//                 {/* Pricing */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className={`block text-sm font-medium mb-1 ${
//                       isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                     }`}>
//                       Base Price ($) *
//                     </label>
//                     <input
//                       type="number"
//                       required
//                       step="0.01"
//                       min="0"
//                       value={selectedService.base_price}
//                       onChange={(e) => setSelectedService({...selectedService, base_price: e.target.value})}
//                       className={`w-full px-4 py-2 rounded-lg border ${
//                         isDarkMode 
//                           ? 'bg-slate-800 border-slate-700 text-white' 
//                           : 'bg-white border-gray-300 text-gray-900'
//                       } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                     />
//                   </div>
//                   <div>
//                     <label className={`block text-sm font-medium mb-1 ${
//                       isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                     }`}>
//                       Additional Price ($)
//                     </label>
//                     <input
//                       type="number"
//                       step="0.01"
//                       min="0"
//                       value={selectedService.additional_price || ''}
//                       onChange={(e) => setSelectedService({...selectedService, additional_price: e.target.value})}
//                       className={`w-full px-4 py-2 rounded-lg border ${
//                         isDarkMode 
//                           ? 'bg-slate-800 border-slate-700 text-white' 
//                           : 'bg-white border-gray-300 text-gray-900'
//                       } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                     />
//                   </div>
//                 </div>

//                 {/* Duration */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Duration (minutes)
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     value={selectedService.duration_minutes || ''}
//                     onChange={(e) => setSelectedService({...selectedService, duration_minutes: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                   />
//                 </div>

//                 {/* Image URL */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Image URL
//                   </label>
//                   <input
//                     type="url"
//                     value={selectedService.image_url || ''}
//                     onChange={(e) => setSelectedService({...selectedService, image_url: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                   />
//                 </div>

//                 {/* 👇 Show on Homepage Options - FIXED: using selectedService */}
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       id="is_homepage_edit"
//                       checked={selectedService.is_homepage || false}
//                       onChange={(e) => setSelectedService({...selectedService, is_homepage: e.target.checked})}
//                       className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
//                     />
//                     <label htmlFor="is_homepage_edit" className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
//                       Show on Homepage
//                     </label>
//                   </div>
                  
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       id="is_trending_edit"
//                       checked={selectedService.is_trending || false}
//                       onChange={(e) => setSelectedService({...selectedService, is_trending: e.target.checked})}
//                       className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
//                     />
//                     <label htmlFor="is_trending_edit" className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
//                       Trending
//                     </label>
//                   </div>
                  
//                   <div className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       id="is_popular_edit"
//                       checked={selectedService.is_popular || false}
//                       onChange={(e) => setSelectedService({...selectedService, is_popular: e.target.checked})}
//                       className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
//                     />
//                     <label htmlFor="is_popular_edit" className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
//                       Popular
//                     </label>
//                   </div>
//                 </div>

//                 {/* 👇 Customers use this service for */}
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Customers use this service for
//                   </label>
//                   <textarea
//                     rows="3"
//                     value={selectedService.use_cases || ''}
//                     onChange={(e) => setSelectedService({...selectedService, use_cases: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                     placeholder="Dishwasher Repair, Washer Repair, Dryer Repair, Range Repair, Fridge Repair, And much more!"
//                   />
//                   <p className="text-xs text-gray-500 mt-1">
//                     Separate with commas. Each item will appear as bullet point.
//                   </p>
//                 </div>

//                 {/* Status */}
//                 <div className="flex items-center gap-2">
//                   <input
//                     type="checkbox"
//                     id="is_active"
//                     checked={selectedService.is_active}
//                     onChange={(e) => setSelectedService({...selectedService, is_active: e.target.checked})}
//                     className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
//                   />
//                   <label htmlFor="is_active" className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
//                     Active (visible to customers)
//                   </label>
//                 </div>
//               </div>
              
//               <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setIsEditModalOpen(false)}
//                   className={`px-4 py-2 rounded-lg font-medium ${
//                     isDarkMode 
//                       ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
//                       : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                   }`}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity"
//                 >
//                   Update Service
//                 </button>
//               </div>
//             </form>
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

export default function Services() {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  
  // 🔥 Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6
  
  // 🔥 Upload states
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  
  const [newService, setNewService] = useState({
    category_id: '',
    name: '',
    slug: '',
    description: '',
    short_description: '',
    base_price: '',
    additional_price: '',
    duration_minutes: '',
    image_url: '',
    use_cases: '',
    is_homepage: false,
    is_trending: false,
    is_popular: false,
    is_active: true
  })

  useEffect(() => {
    checkAuth()
    loadServices()
    loadCategories()
  }, [])

  const checkAuth = () => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) {
      router.push('/')
    }
  }

  const loadServices = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/services')
      const data = await res.json()
      if (data.success) {
        setServices(data.data || [])
      }
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  // 🔥 Image Upload Function
  const handleImageUpload = async (e, isEdit = false) => {
    const file = e.target.files[0]
    if (!file) return

    // Preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      
      if (data.success) {
        if (!isEdit) {
          setNewService({...newService, image_url: data.url})
        } else {
          setSelectedService({...selectedService, image_url: data.url})
        }
      } else {
        alert('Upload failed: ' + data.message)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const addService = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newService)
      })
      const data = await res.json()
      if (data.success) {
        setIsAddModalOpen(false)
        setImagePreview('') // Clear preview
        setNewService({
          category_id: '',
          name: '',
          slug: '',
          description: '',
          short_description: '',
          base_price: '',
          additional_price: '',
          duration_minutes: '',
          image_url: '',
          use_cases: '',
          is_homepage: false,
          is_trending: false,
          is_popular: false,
          is_active: true
        })
        loadServices()
        setCurrentPage(1)
      }
    } catch (error) {
      console.error('Error adding service:', error)
    }
  }

  const updateService = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedService)
      })
      const data = await res.json()
      if (data.success) {
        setIsEditModalOpen(false)
        setImagePreview('') // Clear preview
        setSelectedService(null)
        loadServices()
      }
    } catch (error) {
      console.error('Error updating service:', error)
    }
  }

  const deleteService = async (serviceId) => {
    if (!confirm('Are you sure you want to delete this service?')) return
    
    try {
      const res = await fetch(`/api/services?id=${serviceId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        loadServices()
        setCurrentPage(1)
      }
    } catch (error) {
      console.error('Error deleting service:', error)
    }
  }

  const toggleServiceStatus = async (service) => {
    try {
      const res = await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...service,
          is_active: !service.is_active
        })
      })
      const data = await res.json()
      if (data.success) {
        loadServices()
      }
    } catch (error) {
      console.error('Error toggling service status:', error)
    }
  }

  // Filter services
  const filteredServices = services.filter(service => {
    if (selectedCategory !== 'all' && service.category_id !== parseInt(selectedCategory)) {
      return false
    }
    if (filter === 'all') return true
    if (filter === 'active') return service.is_active === true
    if (filter === 'inactive') return service.is_active === false
    return true
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentServices = filteredServices.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price)
  }

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Services
          </h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
            Manage all services offered by your platform
          </p>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="mt-4 sm:mt-0 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Service
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Category Filter */}
        <div className="flex-1">
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setCurrentPage(1)
            }}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilter(status)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                filter === status
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                  : isDarkMode
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 flex justify-between items-center">
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
          Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
          <span className="font-semibold">{Math.min(endIndex, filteredServices.length)}</span> of{' '}
          <span className="font-semibold">{filteredServices.length}</span> services
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentServices.length > 0 ? (
          currentServices.map((service) => (
            <div
              key={service.id}
              className={`rounded-xl shadow-lg border overflow-hidden ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
              } ${!service.is_active ? 'opacity-60' : ''}`}
            >
              <div className="p-6">
                {/* Header with Image */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {service.image_url ? (
                      <img 
                        src={service.image_url} 
                        alt={service.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                        isDarkMode ? 'bg-slate-800' : 'bg-gray-100'
                      }`}>
                        {service.category_icon || '🔧'}
                      </div>
                    )}
                    <div>
                      <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {service.name}
                      </h3>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        {service.category_name}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    service.is_active
                      ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                      : 'bg-red-500/20 text-red-600 dark:text-red-400'
                  }`}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Description */}
                <p className={`text-sm mb-4 line-clamp-2 ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  {service.short_description || service.description || 'No description available'}
                </p>

                {/* Pricing */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatPrice(service.base_price)}
                    </span>
                    <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      base price
                    </span>
                  </div>
                  {service.additional_price > 0 && (
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      +{formatPrice(service.additional_price)} additional
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div className="flex items-center gap-2 mb-4">
                  <svg className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {formatDuration(service.duration_minutes)}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedService(service)
                      setIsEditModalOpen(true)
                    }}
                    className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
                      color: isDarkMode ? '#e2e8f0' : '#1e293b'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#334155' : '#e2e8f0'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isDarkMode ? '#1e293b' : '#f1f5f9'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleServiceStatus(service)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      service.is_active
                        ? isDarkMode
                          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : isDarkMode
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {service.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteService(service.id)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className={`text-center py-12 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-xl border ${
              isDarkMode ? 'border-slate-800' : 'border-gray-200'
            }`}>
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                No services found
              </p>
              <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                {selectedCategory === 'all' 
                  ? 'Add your first service' 
                  : `No services in this category`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredServices.length > 0 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 1
                  ? 'opacity-50 cursor-not-allowed'
                  : isDarkMode
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                    : isDarkMode
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === totalPages
                  ? 'opacity-50 cursor-not-allowed'
                  : isDarkMode
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsAddModalOpen(false)} />
          <div className={`relative rounded-xl shadow-xl w-full max-w-2xl my-8 ${
            isDarkMode ? 'bg-slate-900' : 'bg-white'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Add New Service
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={addService}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Category */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Category *
                  </label>
                  <select
                    required
                    value={newService.category_id}
                    onChange={(e) => setNewService({...newService, category_id: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newService.name}
                    onChange={(e) => setNewService({
                      ...newService, 
                      name: e.target.value,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, '-')
                    })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="e.g., Appliance Installation"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={newService.slug}
                    onChange={(e) => setNewService({...newService, slug: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="e.g., appliance-installation"
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={newService.short_description}
                    onChange={(e) => setNewService({...newService, short_description: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="Brief description (max 500 chars)"
                    maxLength="500"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Full Description
                  </label>
                  <textarea
                    rows="4"
                    value={newService.description}
                    onChange={(e) => setNewService({...newService, description: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="Detailed description of the service..."
                  ></textarea>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-700'
                    }`}>
                      Base Price ($) *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={newService.base_price}
                      onChange={(e) => setNewService({...newService, base_price: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-slate-800 border-slate-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-700'
                    }`}>
                      Additional Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newService.additional_price}
                      onChange={(e) => setNewService({...newService, additional_price: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-slate-800 border-slate-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newService.duration_minutes}
                    onChange={(e) => setNewService({...newService, duration_minutes: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="e.g., 120"
                  />
                </div>

                {/* 🔥 Image Upload with Preview */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Service Image
                  </label>
                  
                  {/* Preview */}
                  {imagePreview && (
                    <div className="mb-3">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div className="flex items-center gap-3">
                    <label className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors ${
                      uploading 
                        ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                        : isDarkMode
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, false)}
                        disabled={uploading}
                        className="hidden"
                      />
                      {uploading ? 'Uploading...' : 'Choose Image'}
                    </label>
                    
                    {/* Hidden input to store URL */}
                    <input
                      type="hidden"
                      value={newService.image_url}
                    />
                    
                    {newService.image_url && !imagePreview && (
                      <span className="text-sm text-green-600">✓ Image uploaded</span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Max file size: 10MB. Supported formats: JPG, PNG, GIF, WebP
                  </p>
                </div>

                {/* Show on Homepage Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_homepage_add"
                      checked={newService.is_homepage || false}
                      onChange={(e) => setNewService({...newService, is_homepage: e.target.checked})}
                      className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                    />
                    <label htmlFor="is_homepage_add" className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Show on Homepage
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_trending_add"
                      checked={newService.is_trending || false}
                      onChange={(e) => setNewService({...newService, is_trending: e.target.checked})}
                      className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                    />
                    <label htmlFor="is_trending_add" className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Trending
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_popular_add"
                      checked={newService.is_popular || false}
                      onChange={(e) => setNewService({...newService, is_popular: e.target.checked})}
                      className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                    />
                    <label htmlFor="is_popular_add" className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Popular
                    </label>
                  </div>
                </div>

                {/* Customers use this service for */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Customers use this service for
                  </label>
                  <textarea
                    rows="3"
                    value={newService.use_cases || ''}
                    onChange={(e) => setNewService({...newService, use_cases: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="Dishwasher Repair, Washer Repair, Dryer Repair, Range Repair, Fridge Repair, And much more!"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate with commas. Each item will appear as bullet point.
                  </p>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false)
                    setImagePreview('')
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    isDarkMode 
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {isEditModalOpen && selectedService && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditModalOpen(false)} />
          <div className={`relative rounded-xl shadow-xl w-full max-w-2xl my-8 ${
            isDarkMode ? 'bg-slate-900' : 'bg-white'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Edit Service
                </h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setImagePreview('')
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={updateService}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Category */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Category *
                  </label>
                  <select
                    required
                    value={selectedService.category_id}
                    onChange={(e) => setSelectedService({...selectedService, category_id: parseInt(e.target.value)})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedService.name}
                    onChange={(e) => setSelectedService({...selectedService, name: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedService.slug}
                    onChange={(e) => setSelectedService({...selectedService, slug: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={selectedService.short_description || ''}
                    onChange={(e) => setSelectedService({...selectedService, short_description: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    maxLength="500"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Full Description
                  </label>
                  <textarea
                    rows="4"
                    value={selectedService.description || ''}
                    onChange={(e) => setSelectedService({...selectedService, description: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  ></textarea>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-700'
                    }`}>
                      Base Price ($) *
                    </label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={selectedService.base_price}
                      onChange={(e) => setSelectedService({...selectedService, base_price: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-slate-800 border-slate-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-700'
                    }`}>
                      Additional Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={selectedService.additional_price || ''}
                      onChange={(e) => setSelectedService({...selectedService, additional_price: e.target.value})}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDarkMode 
                          ? 'bg-slate-800 border-slate-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={selectedService.duration_minutes || ''}
                    onChange={(e) => setSelectedService({...selectedService, duration_minutes: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>

                {/* 🔥 Image Upload with Preview - Edit Modal */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Service Image
                  </label>
                  
                  {/* Preview */}
                  {(imagePreview || selectedService?.image_url) && (
                    <div className="mb-3">
                      <img 
                        src={imagePreview || selectedService?.image_url} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      />
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div className="flex items-center gap-3">
                    <label className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors ${
                      uploading 
                        ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                        : isDarkMode
                          ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, true)}
                        disabled={uploading}
                        className="hidden"
                      />
                      {uploading ? 'Uploading...' : 'Change Image'}
                    </label>
                    
                    {selectedService?.image_url && !imagePreview && (
                      <span className="text-sm text-green-600">✓ Image uploaded</span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Max file size: 10MB. Supported formats: JPG, PNG, GIF, WebP
                  </p>
                </div>

                {/* Show on Homepage Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_homepage_edit"
                      checked={selectedService.is_homepage || false}
                      onChange={(e) => setSelectedService({...selectedService, is_homepage: e.target.checked})}
                      className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                    />
                    <label htmlFor="is_homepage_edit" className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Show on Homepage
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_trending_edit"
                      checked={selectedService.is_trending || false}
                      onChange={(e) => setSelectedService({...selectedService, is_trending: e.target.checked})}
                      className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                    />
                    <label htmlFor="is_trending_edit" className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Trending
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_popular_edit"
                      checked={selectedService.is_popular || false}
                      onChange={(e) => setSelectedService({...selectedService, is_popular: e.target.checked})}
                      className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                    />
                    <label htmlFor="is_popular_edit" className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                      Popular
                    </label>
                  </div>
                </div>

                {/* Customers use this service for */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Customers use this service for
                  </label>
                  <textarea
                    rows="3"
                    value={selectedService.use_cases || ''}
                    onChange={(e) => setSelectedService({...selectedService, use_cases: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="Dishwasher Repair, Washer Repair, Dryer Repair, Range Repair, Fridge Repair, And much more!"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate with commas. Each item will appear as bullet point.
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={selectedService.is_active}
                    onChange={(e) => setSelectedService({...selectedService, is_active: e.target.checked})}
                    className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500"
                  />
                  <label htmlFor="is_active" className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Active (visible to customers)
                  </label>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    setImagePreview('')
                  }}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    isDarkMode 
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Update Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}