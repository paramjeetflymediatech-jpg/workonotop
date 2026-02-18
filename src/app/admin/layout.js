// 'use client'

// import Sidebar from '../../components/Sidebar'
// import { usePathname } from 'next/navigation'
// import { useState, useEffect, createContext, useContext } from 'react'

// const AdminThemeContext = createContext()

// export const useAdminTheme = () => {
//   const context = useContext(AdminThemeContext)
//   if (!context) {
//     throw new Error('useAdminTheme must be used within AdminThemeProvider')
//   }
//   return context
// }

// export default function AdminLayout({ children }) {
//   const pathname = usePathname()
//   const [isDarkMode, setIsDarkMode] = useState(false)
//   const [isMounted, setIsMounted] = useState(false)
//   const [isCollapsed, setIsCollapsed] = useState(false)
//   const [isMobile, setIsMobile] = useState(false)

//   useEffect(() => {
//     setIsMounted(true)
//     const savedTheme = localStorage.getItem('adminTheme')
//     setIsDarkMode(savedTheme === 'dark')
    
//     const savedCollapsed = localStorage.getItem('sidebarCollapsed')
//     setIsCollapsed(savedCollapsed === 'true')

//     // Check if mobile
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 1024)
//     }
    
//     checkMobile()
//     window.addEventListener('resize', checkMobile)
    
//     return () => window.removeEventListener('resize', checkMobile)
//   }, [])

//   const toggleTheme = () => {
//     const newTheme = !isDarkMode
//     setIsDarkMode(newTheme)
//     localStorage.setItem('adminTheme', newTheme ? 'dark' : 'light')
//   }

//   useEffect(() => {
//     const handleSidebarChange = () => {
//       const savedCollapsed = localStorage.getItem('sidebarCollapsed')
//       setIsCollapsed(savedCollapsed === 'true')
//     }
    
//     window.addEventListener('storage', handleSidebarChange)
//     window.addEventListener('sidebarCollapsed', handleSidebarChange)
    
//     return () => {
//       window.removeEventListener('storage', handleSidebarChange)
//       window.removeEventListener('sidebarCollapsed', handleSidebarChange)
//     }
//   }, [])

//   if (pathname === '/admin/login') {
//     return children
//   }

//   if (!isMounted) {
//     return null
//   }

//   return (
//     <AdminThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
//       <div className="flex min-h-screen w-full relative">
//         <Sidebar />
//         {/* Main Content - Responsive margin */}
//         <main 
//           className="flex-1 transition-all duration-300 ease-in-out w-full"
//           style={{
//             marginLeft: isMobile ? '0' : (isCollapsed ? '80px' : '256px'),
//             width: isMobile ? '100%' : (isCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 256px)')
//           }}
//         >
//           <div 
//             className="min-h-screen w-full overflow-x-hidden"
//             style={{
//               backgroundColor: isDarkMode ? '#020617' : '#f8fafc'
//             }}
//           >
//             {/* Add responsive padding */}
//             <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
//               {children}
//             </div>
//           </div>
//         </main>
//       </div>
//     </AdminThemeContext.Provider>
//   )
// }




// app/admin/layout.js
'use client'

import Sidebar from '@/components/Sidebar'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, createContext, useContext } from 'react'

const AdminThemeContext = createContext()

export const useAdminTheme = () => {
  const context = useContext(AdminThemeContext)
  if (!context) {
    throw new Error('useAdminTheme must be used within AdminThemeProvider')
  }
  return context
}

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Check authentication
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for adminAuth (what your system actually uses)
      const adminAuth = localStorage.getItem('adminAuth')
      
      console.log('Auth check:', { adminAuth, pathname })
      
      // If no auth and not on login page, redirect to login
      if (adminAuth !== 'loggedin' && pathname !== '/admin/login') {
        router.push('/admin/login')
      }
    }
  }, [pathname, router])

  // Handle hydration and initial setup
  useEffect(() => {
    setIsMounted(true)
    
    // Load saved preferences
    const savedTheme = localStorage.getItem('adminTheme')
    setIsDarkMode(savedTheme === 'dark')
    
    const savedCollapsed = localStorage.getItem('sidebarCollapsed')
    setIsCollapsed(savedCollapsed === 'true')

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem('adminTheme', newTheme ? 'dark' : 'light')
  }

  // Listen for sidebar changes
  useEffect(() => {
    const handleSidebarChange = () => {
      const savedCollapsed = localStorage.getItem('sidebarCollapsed')
      setIsCollapsed(savedCollapsed === 'true')
    }
    
    window.addEventListener('storage', handleSidebarChange)
    window.addEventListener('sidebarCollapsed', handleSidebarChange)
    
    return () => {
      window.removeEventListener('storage', handleSidebarChange)
      window.removeEventListener('sidebarCollapsed', handleSidebarChange)
    }
  }, [])

  // If on login page, render without sidebar
  if (pathname === '/admin/login') {
    return children
  }

  // Show loading while checking auth or before mount
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <AdminThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div className="flex min-h-screen w-full relative">
        <Sidebar />
        {/* Main Content - Responsive margin */}
        <main 
          className="flex-1 transition-all duration-300 ease-in-out w-full"
          style={{
            marginLeft: isMobile ? '0' : (isCollapsed ? '80px' : '256px'),
            width: isMobile ? '100%' : (isCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 256px)')
          }}
        >
          <div 
            className="min-h-screen w-full overflow-x-hidden"
            style={{
              backgroundColor: isDarkMode ? '#020617' : '#f8fafc'
            }}
          >
            {/* Add responsive padding */}
            <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AdminThemeContext.Provider>
  )
}