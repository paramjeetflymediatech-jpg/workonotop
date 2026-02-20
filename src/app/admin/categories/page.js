// 'use client'

// import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAdminTheme } from '../layout'

// export default function Categories() {
//   const router = useRouter()
//   const { isDarkMode } = useAdminTheme()
//   const [categories, setCategories] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false)
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false)
//   const [selectedCategory, setSelectedCategory] = useState(null)
//   const [newCategory, setNewCategory] = useState({
//     name: '',
//     slug: '',
//     icon: '',
//     description: '',
//     display_order: 0
//   })

//   useEffect(() => {
//     checkAuth()
//     loadCategories()
//   }, [])

//   const checkAuth = () => {
//     const auth = localStorage.getItem('adminAuth')
//     if (!auth) {
//       router.push('/')
//     }
//   }

//   const loadCategories = async () => {
//     setLoading(true)
//     try {
//       const res = await fetch('/api/categories')
//       const data = await res.json()
//       if (data.success) {
//         setCategories(data.data || [])
//       }
//     } catch (error) {
//       console.error('Error loading categories:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const addCategory = async (e) => {
//     e.preventDefault()
//     try {
//       const res = await fetch('/api/categories', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(newCategory)
//       })
//       const data = await res.json()
//       if (data.success) {
//         setIsAddModalOpen(false)
//         setNewCategory({
//           name: '',
//           slug: '',
//           icon: '',
//           description: '',
//           display_order: 0
//         })
//         loadCategories()
//       }
//     } catch (error) {
//       console.error('Error adding category:', error)
//     }
//   }

//   const updateCategory = async (e) => {
//     e.preventDefault()
//     try {
//       const res = await fetch('/api/categories', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(selectedCategory)
//       })
//       const data = await res.json()
//       if (data.success) {
//         setIsEditModalOpen(false)
//         setSelectedCategory(null)
//         loadCategories()
//       }
//     } catch (error) {
//       console.error('Error updating category:', error)
//     }
//   }

//   const deleteCategory = async (categoryId) => {
//     if (!confirm('Are you sure you want to delete this category?')) return
    
//     try {
//       const res = await fetch(`/api/categories?id=${categoryId}`, {
//         method: 'DELETE'
//       })
//       const data = await res.json()
//       if (data.success) {
//         loadCategories()
//       }
//     } catch (error) {
//       console.error('Error deleting category:', error)
//     }
//   }

//   const toggleCategoryStatus = async (category) => {
//     try {
//       const res = await fetch('/api/categories', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           ...category,
//           is_active: !category.is_active
//         })
//       })
//       const data = await res.json()
//       if (data.success) {
//         loadCategories()
//       }
//     } catch (error) {
//       console.error('Error toggling category status:', error)
//     }
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
//       <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
//         <div>
//           <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${
//             isDarkMode ? 'text-white' : 'text-gray-900'
//           }`}>
//             Service Categories
//           </h1>
//           <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
//             Manage service categories and their display order
//           </p>
//         </div>
        
//         <button
//           onClick={() => setIsAddModalOpen(true)}
//           className="mt-4 sm:mt-0 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
//         >
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//           </svg>
//           Add Category
//         </button>
//       </div>

//       {/* Categories Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {categories.map((category) => (
//           <div
//             key={category.id}
//             className={`rounded-xl shadow-lg border overflow-hidden ${
//               isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
//             } ${!category.is_active ? 'opacity-60' : ''}`}
//           >
//             <div className="p-6">
//               <div className="flex items-start justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="text-3xl">{category.icon || '📋'}</div>
//                   <div>
//                     <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                       {category.name}
//                     </h3>
//                     <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//                       slug: {category.slug}
//                     </p>
//                   </div>
//                 </div>
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
//                   category.is_active
//                     ? 'bg-green-500/20 text-green-600 dark:text-green-400'
//                     : 'bg-red-500/20 text-red-600 dark:text-red-400'
//                 }`}>
//                   {category.is_active ? 'Active' : 'Inactive'}
//                 </span>
//               </div>

//               {category.description && (
//                 <p className={`mt-3 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//                   {category.description}
//                 </p>
//               )}

//               <div className="mt-4 flex items-center justify-between">
//                 <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
//                   Display Order: {category.display_order}
//                 </span>
//               </div>

//               <div className="mt-4 flex items-center gap-2">
//                 <button
//                   onClick={() => {
//                     setSelectedCategory(category)
//                     setIsEditModalOpen(true)
//                   }}
//                   className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
//                   style={{
//                     backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
//                     color: isDarkMode ? '#e2e8f0' : '#1e293b'
//                   }}
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => toggleCategoryStatus(category)}
//                   className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
//                     category.is_active
//                       ? isDarkMode
//                         ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
//                         : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
//                       : isDarkMode
//                         ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
//                         : 'bg-green-100 text-green-700 hover:bg-green-200'
//                   }`}
//                 >
//                   {category.is_active ? 'Deactivate' : 'Activate'}
//                 </button>
//                 <button
//                   onClick={() => deleteCategory(category.id)}
//                   className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-red-600 transition-colors"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Add Category Modal */}
//       {isAddModalOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/50" onClick={() => setIsAddModalOpen(false)} />
//           <div className={`relative rounded-xl shadow-xl w-full max-w-lg ${
//             isDarkMode ? 'bg-slate-900' : 'bg-white'
//           }`}>
//             <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//               <div className="flex items-center justify-between">
//                 <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   Add New Category
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
            
//             <form onSubmit={addCategory}>
//               <div className="p-6 space-y-4">
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Category Name *
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     value={newCategory.name}
//                     onChange={(e) => setNewCategory({...newCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                     placeholder="e.g., Cleaning"
//                   />
//                 </div>
                
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Slug *
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     value={newCategory.slug}
//                     onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                     placeholder="e.g., cleaning"
//                   />
//                 </div>
                
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Icon (Emoji)
//                   </label>
//                   <input
//                     type="text"
//                     value={newCategory.icon}
//                     onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                     placeholder="e.g., 🧹"
//                   />
//                 </div>
                
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Description
//                   </label>
//                   <textarea
//                     rows="3"
//                     value={newCategory.description}
//                     onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                     placeholder="Describe this category..."
//                   ></textarea>
//                 </div>
                
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Display Order
//                   </label>
//                   <input
//                     type="number"
//                     value={newCategory.display_order}
//                     onChange={(e) => setNewCategory({...newCategory, display_order: parseInt(e.target.value)})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                     placeholder="0"
//                   />
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
//                   Add Category
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Edit Category Modal */}
//       {isEditModalOpen && selectedCategory && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditModalOpen(false)} />
//           <div className={`relative rounded-xl shadow-xl w-full max-w-lg ${
//             isDarkMode ? 'bg-slate-900' : 'bg-white'
//           }`}>
//             <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//               <div className="flex items-center justify-between">
//                 <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//                   Edit Category
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
            
//             <form onSubmit={updateCategory}>
//               <div className="p-6 space-y-4">
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Category Name *
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     value={selectedCategory.name}
//                     onChange={(e) => setSelectedCategory({...selectedCategory, name: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                   />
//                 </div>
                
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Slug *
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     value={selectedCategory.slug}
//                     onChange={(e) => setSelectedCategory({...selectedCategory, slug: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                   />
//                 </div>
                
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Icon (Emoji)
//                   </label>
//                   <input
//                     type="text"
//                     value={selectedCategory.icon}
//                     onChange={(e) => setSelectedCategory({...selectedCategory, icon: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                   />
//                 </div>
                
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Description
//                   </label>
//                   <textarea
//                     rows="3"
//                     value={selectedCategory.description || ''}
//                     onChange={(e) => setSelectedCategory({...selectedCategory, description: e.target.value})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                   ></textarea>
//                 </div>
                
//                 <div>
//                   <label className={`block text-sm font-medium mb-1 ${
//                     isDarkMode ? 'text-slate-400' : 'text-gray-700'
//                   }`}>
//                     Display Order
//                   </label>
//                   <input
//                     type="number"
//                     value={selectedCategory.display_order}
//                     onChange={(e) => setSelectedCategory({...selectedCategory, display_order: parseInt(e.target.value)})}
//                     className={`w-full px-4 py-2 rounded-lg border ${
//                       isDarkMode 
//                         ? 'bg-slate-800 border-slate-700 text-white' 
//                         : 'bg-white border-gray-300 text-gray-900'
//                     } focus:outline-none focus:ring-2 focus:ring-teal-500`}
//                   />
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
//                   Update Category
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

const PAGE_SIZE = 6

function Pagination({ total, page, setPage, isDarkMode }) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="flex items-center justify-between mt-6 flex-wrap gap-3">
      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
        {total === 0
          ? 'No results'
          : totalPages <= 1
            ? `${total} total`
            : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total} total`}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 transition ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >‹</button>
          {pages.map((p, i) => (
            p === '...'
              ? <span key={`e-${i}`} className="px-2 text-slate-400 text-sm">…</span>
              : <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                    page === p
                      ? 'bg-teal-600 text-white shadow-sm'
                      : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}>{p}</button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-3 py-1.5 rounded-lg text-sm disabled:opacity-40 transition ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}
          >›</button>
        </div>
      )}
    </div>
  )
}

export default function Categories() {
  const router = useRouter()
  const { isDarkMode } = useAdminTheme()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [newCategory, setNewCategory] = useState({
    name: '',
    slug: '',
    icon: '',
    description: '',
    display_order: 0
  })
  
  // 🔥 Pagination state
  const [page, setPage] = useState(1)

  useEffect(() => {
    checkAuth()
    loadCategories()
  }, [])

  // 🔥 Reset page when categories change (after add/edit/delete)
  useEffect(() => {
    setPage(1)
  }, [categories.length])

  const checkAuth = () => {
    const auth = localStorage.getItem('adminAuth')
    if (!auth) {
      router.push('/')
    }
  }

  const loadCategories = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (data.success) {
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      })
      const data = await res.json()
      if (data.success) {
        setIsAddModalOpen(false)
        setNewCategory({
          name: '',
          slug: '',
          icon: '',
          description: '',
          display_order: 0
        })
        loadCategories()
      }
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const updateCategory = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedCategory)
      })
      const data = await res.json()
      if (data.success) {
        setIsEditModalOpen(false)
        setSelectedCategory(null)
        loadCategories()
      }
    } catch (error) {
      console.error('Error updating category:', error)
    }
  }

  const deleteCategory = async (categoryId) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    try {
      const res = await fetch(`/api/categories?id=${categoryId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (data.success) {
        loadCategories()
      }
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const toggleCategoryStatus = async (category) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...category,
          is_active: !category.is_active
        })
      })
      const data = await res.json()
      if (data.success) {
        loadCategories()
      }
    } catch (error) {
      console.error('Error toggling category status:', error)
    }
  }

  // 🔥 Pagination logic
  const startIndex = (page - 1) * PAGE_SIZE
  const endIndex = startIndex + PAGE_SIZE
  const pagedCategories = categories.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-3xl sm:text-4xl font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Service Categories
          </h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
            Manage service categories and their display order
          </p>
        </div>
        
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="mt-4 sm:mt-0 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Category
        </button>
      </div>

      {/* 🔥 Results count */}
      <div className="mb-4">
        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Showing {categories.length > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, categories.length)} of {categories.length} categories
        </p>
      </div>

      {/* Categories Grid */}
      {pagedCategories.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pagedCategories.map((category) => (
              <div
                key={category.id}
                className={`rounded-xl shadow-lg border overflow-hidden ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
                } ${!category.is_active ? 'opacity-60' : ''}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{category.icon || '📋'}</div>
                      <div>
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {category.name}
                        </h3>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                          slug: {category.slug}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      category.is_active
                        ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                        : 'bg-red-500/20 text-red-600 dark:text-red-400'
                    }`}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {category.description && (
                    <p className={`mt-3 text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {category.description}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      Display Order: {category.display_order}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(category)
                        setIsEditModalOpen(true)
                      }}
                      className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9',
                        color: isDarkMode ? '#e2e8f0' : '#1e293b'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleCategoryStatus(category)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        category.is_active
                          ? isDarkMode
                            ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                            : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : isDarkMode
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {category.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 🔥 Pagination */}
          <Pagination total={categories.length} page={page} setPage={setPage} isDarkMode={isDarkMode} />
        </>
      ) : (
        <div className={`text-center py-12 rounded-xl border ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
        }`}>
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            No categories found
          </p>
          <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
            Click "Add Category" to create your first category
          </p>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsAddModalOpen(false)} />
          <div className={`relative rounded-xl shadow-xl w-full max-w-lg ${
            isDarkMode ? 'bg-slate-900' : 'bg-white'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Add New Category
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
            
            <form onSubmit={addCategory}>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="e.g., Cleaning"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCategory.slug}
                    onChange={(e) => setNewCategory({...newCategory, slug: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="e.g., cleaning"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={newCategory.icon}
                    onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="e.g., 🧹"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="Describe this category..."
                  ></textarea>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={newCategory.display_order}
                    onChange={(e) => setNewCategory({...newCategory, display_order: parseInt(e.target.value) || 0})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditModalOpen(false)} />
          <div className={`relative rounded-xl shadow-xl w-full max-w-lg ${
            isDarkMode ? 'bg-slate-900' : 'bg-white'
          }`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Edit Category
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={updateCategory}>
              <div className="p-6 space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedCategory.name}
                    onChange={(e) => setSelectedCategory({...selectedCategory, name: e.target.value})}
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
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedCategory.slug}
                    onChange={(e) => setSelectedCategory({...selectedCategory, slug: e.target.value})}
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
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={selectedCategory.icon || ''}
                    onChange={(e) => setSelectedCategory({...selectedCategory, icon: e.target.value})}
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
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={selectedCategory.description || ''}
                    onChange={(e) => setSelectedCategory({...selectedCategory, description: e.target.value})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  ></textarea>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-700'
                  }`}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={selectedCategory.display_order}
                    onChange={(e) => setSelectedCategory({...selectedCategory, display_order: parseInt(e.target.value) || 0})}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}