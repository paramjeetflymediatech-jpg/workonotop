// // app/services/page.js - Services Listing Page
// // ✅ SIMPLE - Direct database se data
// // ✅ Categories API se aa rahi hain
// // ✅ Services API se aa rahe hain
// // ✅ No static mapping, no hardcoding

// 'use client';

// import Footer from '@/components/Footer';
// import Header from '@/components/Header';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useState, useEffect } from 'react';

// export default function ServicesPage() {
//   const router = useRouter();
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [activeCategory, setActiveCategory] = useState('all');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [services, setServices] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [placeholder, setPlaceholder] = useState('');
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [loopNum, setLoopNum] = useState(0);
//   const [typingSpeed, setTypingSpeed] = useState(100);

//   // Animated search placeholder
//   const searchExamples = [
//     'mount tv on wall',
//     'fix leaky faucet',
//     'install ceiling fan',
//     'clean carpets',
//     'repair dryer',
//     'paint living room',
//   ];

//   // Fetch services and categories from API
//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       // Dono API ek saath call karo
//       const [servicesRes, categoriesRes] = await Promise.all([
//         fetch('/api/services'),
//         fetch('/api/categories')
//       ]);

//       const servicesData = await servicesRes.json();
//       const categoriesData = await categoriesRes.json();

//       if (servicesData.success) {
//         setServices(servicesData.data || []);
//       }

//       if (categoriesData.success) {
//         setCategories(categoriesData.data || []);
//       }
//     } catch (error) {
//       console.error('Error loading data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Typing effect
//   useEffect(() => {
//     let timer;

//     const handleTyping = () => {
//       const i = loopNum % searchExamples.length;
//       const fullText = searchExamples[i];

//       if (!isDeleting) {
//         setPlaceholder(fullText.substring(0, placeholder.length + 1));
//         setTypingSpeed(80);
//       } else {
//         setPlaceholder(fullText.substring(0, placeholder.length - 1));
//         setTypingSpeed(40);
//       }

//       if (!isDeleting && placeholder === fullText) {
//         setTimeout(() => setIsDeleting(true), 2000);
//       } else if (isDeleting && placeholder === '') {
//         setIsDeleting(false);
//         setLoopNum(loopNum + 1);
//         setTypingSpeed(80);
//       }
//     };

//     timer = setTimeout(handleTyping, typingSpeed);
//     return () => clearTimeout(timer);
//   }, [placeholder, isDeleting, loopNum, typingSpeed, searchExamples]);

//   // Filter services based on active category and search
//   const filteredServices = services.filter(service => {
//     // Category filter
//     const matchesCategory = activeCategory === 'all' ||
//       service.category_id === parseInt(activeCategory);

//     // Search filter
//     const matchesSearch = searchTerm === '' ||
//       service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (service.short_description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (service.description || '').toLowerCase().includes(searchTerm.toLowerCase());

//     return matchesCategory && matchesSearch;
//   });

//   const handleSearch = (e) => {
//     e.preventDefault();
//     // Real-time filter already applied
//   };

//   const toggleMobileMenu = () => {
//     setMobileMenuOpen(!mobileMenuOpen);
//   };

//   // Category filter buttons - DIRECTLY from API data
//   const filterCategories = [
//     { id: 'all', name: 'All Services', icon: '🔍' },
//     ...categories.map(cat => ({
//       id: cat.id.toString(),
//       name: cat.name,
//       icon: cat.icon || '🔧' // Icon database se, nahi to default
//     }))
//   ];

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white font-sans antialiased">
//       <Header />
//       {/* Hero Section */}
//       <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white py-12 md:py-16 lg:py-20 relative overflow-hidden">
//         <div className="absolute inset-0 opacity-10" style={{
//           backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
//         }}></div>

//         <div className="container mx-auto px-4 relative z-10">
//           <div className="max-w-4xl mx-auto text-center">
//             <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 md:mb-6 drop-shadow-md">
//               WorkOnTap keeps your home in great shape, <br className="hidden sm:block" />
//               <span className="bg-green-500/30 px-3 py-1 inline-block rounded-lg">inside and out.</span>
//             </h1>

//             <form onSubmit={handleSearch} className="mt-8 md:mt-10">
//               <div className="bg-white rounded-2xl shadow-2xl p-1 flex items-center max-w-2xl mx-auto hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] border-2 border-transparent hover:border-green-300">
//                 <div className="flex items-center flex-1 bg-white rounded-xl px-4 sm:px-6 py-2 sm:py-3">
//                   <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 flex-shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                   </svg>
//                   <input
//                     type="text"
//                     placeholder={placeholder || 'mount tv on wall'}
//                     className="flex-1 px-2 py-4 sm:py-5 text-gray-800 outline-none bg-transparent placeholder:text-gray-700 placeholder:font-medium placeholder:text-lg sm:placeholder:text-xl md:placeholder:text-2xl placeholder:tracking-wide text-base sm:text-lg md:text-xl"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                   />
//                 </div>
//                 <button
//                   type="submit"
//                   className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 sm:px-8 py-4 sm:py-5 rounded-xl transition duration-200 shadow-lg whitespace-nowrap text-base sm:text-lg"
//                 >
//                   Find a Pro
//                 </button>
//               </div>
//             </form>

         
//           </div>
//         </div>

//         <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
//           <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
//             <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
//           </svg>
//         </div>
//       </section>

//       {/* Category Filters - DIRECTLY from database */}
//       <section className="py-8 md:py-12 bg-white border-b border-gray-200">
//         <div className="container mx-auto px-4">
//           <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
//             {filterCategories.map((category) => (
//               <button
//                 key={category.id}
//                 onClick={() => setActiveCategory(category.id)}
//                 className={`
//                   px-4 md:px-6 py-2 md:py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-200
//                   flex items-center space-x-1 md:space-x-2
//                   ${activeCategory === category.id
//                     ? 'bg-green-700 text-white shadow-md shadow-green-200 scale-105'
//                     : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-500 hover:text-green-700 hover:bg-green-50'
//                   }
//                 `}
//               >
//                 <span className="text-base md:text-lg">{category.icon}</span>
//                 <span>{category.name}</span>
//               </button>
//             ))}
//           </div>

//           <div className="text-center mt-6 text-gray-600 text-sm md:text-base">
//             Showing <span className="font-bold text-green-700">{filteredServices.length}</span> services
//             {activeCategory !== 'all' && ` in ${categories.find(c => c.id === parseInt(activeCategory))?.name}`}
//             {searchTerm && ` matching "${searchTerm}"`}
//           </div>
//         </div>
//       </section>

//       {/* Services Grid - DIRECTLY from database */}
//       <section className="py-12 md:py-16 lg:py-20 bg-gray-50/50">
//         <div className="container mx-auto px-4">
//           {filteredServices.length > 0 ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
//               {filteredServices.map((service) => {
//                 // Find category for this service
//                 const category = categories.find(c => c.id === service.category_id);

//                 return (
//                   <Link
//                     key={service.id}
//                     href={`/services/${service.slug}`}
//                     className="group transform hover:-translate-y-2 transition-all duration-300"
//                   >
//                     <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 h-full flex flex-col">
//                       {/* Image/Icon area */}
//                       <div className="h-36 sm:h-40 md:h-44 flex items-center justify-center relative bg-gradient-to-br from-green-50 to-emerald-50">
//                         {service.image_url ? (
//                           <img
//                             src={service.image_url}
//                             alt={service.name}
//                             className="w-full h-full object-cover"
//                           />
//                         ) : (
//                           <span className="text-5xl sm:text-6xl md:text-7xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
//                             {category?.icon || '🔧'}
//                           </span>
//                         )}
//                         <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm border border-gray-200">
//                           {category?.name || 'General'}
//                         </span>
//                       </div>

//                       {/* Content */}
//                       <div className="p-5 md:p-6 flex-1 flex flex-col">
//                         <h3 className="text-lg md:text-xl font-bold text-gray-800 group-hover:text-green-700 transition line-clamp-2 min-h-[3.5rem]">
//                           {service.name}
//                         </h3>

//                         <p className="text-sm text-gray-600 mt-1 line-clamp-2">
//                           {service.short_description || service.description?.substring(0, 60) + '...' || 'No description'}
//                         </p>

//                         <div className="mt-3 flex items-end justify-between">
//                           <div>
//                             <p className="text-xs text-gray-500 uppercase tracking-wider">Starting at</p>
//                             <p className="text-xl md:text-2xl font-extrabold text-green-700">
//                               ${parseFloat(service.base_price).toFixed(0)}
//                             </p>
//                           </div>

//                           <div className="bg-green-100 rounded-full p-2 group-hover:bg-green-600 transition-colors duration-300">
//                             <svg className="w-5 h-5 text-green-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                             </svg>
//                           </div>
//                         </div>

//                         {service.additional_price > 0 && (
//                           <p className="text-xs text-gray-500 mt-2">
//                             +${parseFloat(service.additional_price).toFixed(0)} additional
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                   </Link>
//                 );
//               })}
//             </div>
//           ) : (
//             <div className="text-center py-16 md:py-20">
//               <div className="text-6xl mb-4">🔍</div>
//               <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">No services found</h3>
//               <p className="text-gray-600 text-lg mb-6">Try adjusting your filters or search term</p>
//               <button
//                 onClick={() => { setActiveCategory('all'); setSearchTerm(''); }}
//                 className="bg-green-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-800 transition shadow-md"
//               >
//                 Clear all filters
//               </button>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Trust Badges */}
//       <section className="py-12 md:py-16 bg-white border-t border-gray-100">
//         <div className="container mx-auto px-4">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
//             <div className="flex flex-col items-center">
//               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
//                 <svg className="w-8 h-8 text-green-700" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812z" clipRule="evenodd" />
//                   <path fillRule="evenodd" d="M10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <h4 className="text-lg font-bold text-gray-800">Verified Pros</h4>
//               <p className="text-gray-600 text-sm mt-1">Background-checked & licensed</p>
//             </div>
//             <div className="flex flex-col items-center">
//               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
//                 <svg className="w-8 h-8 text-green-700" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                 </svg>
//               </div>
//               <h4 className="text-lg font-bold text-gray-800">4.8 ★ Rating</h4>
//               <p className="text-gray-600 text-sm mt-1">From 500,000+ jobs</p>
//             </div>
//             <div className="flex flex-col items-center">
//               <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
//                 <svg className="w-8 h-8 text-green-700" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <h4 className="text-lg font-bold text-gray-800">100% Guarantee</h4>
//               <p className="text-gray-600 text-sm mt-1">Homeowner Protection Promise</p>
//             </div>
//           </div>
//         </div>
//       </section>

//       <Footer/>

    
//     </div>
//   );
// }













// app/services/page.js - Services Listing Page with Pagination
// ✅ SIMPLE - Direct database se data
// ✅ Categories API se aa rahi hain
// ✅ Services API se aa rahe hain
// ✅ 8 items per page pagination

'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const PAGE_SIZE = 8; // 🔥 8 items per page

// 🔥 Pagination Component
function Pagination({ total, page, setPage }) {
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center mt-12 gap-2">
      <button
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
          page === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-500'
        }`}
      >
        ‹
      </button>
      
      {pages.map((p, i) => (
        p === '...'
          ? <span key={`e-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400">…</span>
          : <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded-lg font-medium transition ${
                page === p
                  ? 'bg-green-700 text-white shadow-md'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-500'
              }`}
            >
              {p}
            </button>
      ))}
      
      <button
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
          page === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-500'
        }`}
      >
        ›
      </button>
    </div>
  )
}

export default function ServicesPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placeholder, setPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);
  
  // 🔥 Pagination state
  const [page, setPage] = useState(1);

  // Animated search placeholder
  const searchExamples = [
    'mount tv on wall',
    'fix leaky faucet',
    'install ceiling fan',
    'clean carpets',
    'repair dryer',
    'paint living room',
  ];

  // Fetch services and categories from API
  useEffect(() => {
    fetchData();
  }, []);

  // 🔥 Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeCategory, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Dono API ek saath call karo
      const [servicesRes, categoriesRes] = await Promise.all([
        fetch('/api/services'),
        fetch('/api/categories')
      ]);

      const servicesData = await servicesRes.json();
      const categoriesData = await categoriesRes.json();

      if (servicesData.success) {
        setServices(servicesData.data || []);
      }

      if (categoriesData.success) {
        setCategories(categoriesData.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Typing effect
  useEffect(() => {
    let timer;

    const handleTyping = () => {
      const i = loopNum % searchExamples.length;
      const fullText = searchExamples[i];

      if (!isDeleting) {
        setPlaceholder(fullText.substring(0, placeholder.length + 1));
        setTypingSpeed(80);
      } else {
        setPlaceholder(fullText.substring(0, placeholder.length - 1));
        setTypingSpeed(40);
      }

      if (!isDeleting && placeholder === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && placeholder === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(80);
      }
    };

    timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholder, isDeleting, loopNum, typingSpeed, searchExamples]);

  // Filter services based on active category and search
  const filteredServices = services.filter(service => {
    // Category filter
    const matchesCategory = activeCategory === 'all' ||
      service.category_id === parseInt(activeCategory);

    // Search filter
    const matchesSearch = searchTerm === '' ||
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.short_description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // 🔥 Pagination logic
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pagedServices = filteredServices.slice(startIndex, endIndex);

  const handleSearch = (e) => {
    e.preventDefault();
    // Real-time filter already applied
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Category filter buttons - DIRECTLY from API data
  const filterCategories = [
    { id: 'all', name: 'All Services', icon: '🔍' },
    ...categories.map(cat => ({
      id: cat.id.toString(),
      name: cat.name,
      icon: cat.icon || '🔧' // Icon database se, nahi to default
    }))
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white py-12 md:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 md:mb-6 drop-shadow-md">
              WorkOnTap keeps your home in great shape, <br className="hidden sm:block" />
              <span className="bg-green-500/30 px-3 py-1 inline-block rounded-lg">inside and out.</span>
            </h1>

            <form onSubmit={handleSearch} className="mt-8 md:mt-10">
              <div className="bg-white rounded-2xl shadow-2xl p-1 flex items-center max-w-2xl mx-auto hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] border-2 border-transparent hover:border-green-300">
                <div className="flex items-center flex-1 bg-white rounded-xl px-4 sm:px-6 py-2 sm:py-3">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 flex-shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder={placeholder || 'mount tv on wall'}
                    className="flex-1 px-2 py-4 sm:py-5 text-gray-800 outline-none bg-transparent placeholder:text-gray-700 placeholder:font-medium placeholder:text-lg sm:placeholder:text-xl md:placeholder:text-2xl placeholder:tracking-wide text-base sm:text-lg md:text-xl"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 sm:px-8 py-4 sm:py-5 rounded-xl transition duration-200 shadow-lg whitespace-nowrap text-base sm:text-lg"
                >
                  Find a Pro
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Category Filters - DIRECTLY from database */}
      <section className="py-8 md:py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
            {filterCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  px-4 md:px-6 py-2 md:py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-200
                  flex items-center space-x-1 md:space-x-2
                  ${activeCategory === category.id
                    ? 'bg-green-700 text-white shadow-md shadow-green-200 scale-105'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-green-500 hover:text-green-700 hover:bg-green-50'
                  }
                `}
              >
                <span className="text-base md:text-lg">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* 🔥 Results count with pagination info */}
          <div className="text-center mt-6 text-gray-600 text-sm md:text-base">
            Showing <span className="font-bold text-green-700">
              {filteredServices.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, filteredServices.length)}
            </span> of <span className="font-bold text-green-700">{filteredServices.length}</span> services
            {activeCategory !== 'all' && ` in ${categories.find(c => c.id === parseInt(activeCategory))?.name}`}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        </div>
      </section>

      {/* Services Grid - DIRECTLY from database */}
      <section className="py-12 md:py-16 lg:py-20 bg-gray-50/50">
        <div className="container mx-auto px-4">
          {filteredServices.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {pagedServices.map((service) => {
                  // Find category for this service
                  const category = categories.find(c => c.id === service.category_id);

                  return (
                    <Link
                      key={service.id}
                      href={`/services/${service.slug}`}
                      className="group transform hover:-translate-y-2 transition-all duration-300"
                    >
                      <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 h-full flex flex-col">
                        {/* Image/Icon area */}
                        <div className="h-36 sm:h-40 md:h-44 flex items-center justify-center relative bg-gradient-to-br from-green-50 to-emerald-50">
                          {service.image_url ? (
                            <img
                              src={service.image_url}
                              alt={service.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-5xl sm:text-6xl md:text-7xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
                              {category?.icon || '🔧'}
                            </span>
                          )}
                          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm border border-gray-200">
                            {category?.name || 'General'}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-5 md:p-6 flex-1 flex flex-col">
                          <h3 className="text-lg md:text-xl font-bold text-gray-800 group-hover:text-green-700 transition line-clamp-2 min-h-[3.5rem]">
                            {service.name}
                          </h3>

                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {service.short_description || service.description?.substring(0, 60) + '...' || 'No description'}
                          </p>

                          <div className="mt-3 flex items-end justify-between">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider">Starting at</p>
                              <p className="text-xl md:text-2xl font-extrabold text-green-700">
                                ${parseFloat(service.base_price).toFixed(0)}
                              </p>
                            </div>

                            <div className="bg-green-100 rounded-full p-2 group-hover:bg-green-600 transition-colors duration-300">
                              <svg className="w-5 h-5 text-green-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>

                          {service.additional_price > 0 && (
                            <p className="text-xs text-gray-500 mt-2">
                              +${parseFloat(service.additional_price).toFixed(0)} additional
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* 🔥 Pagination Component */}
              <Pagination total={filteredServices.length} page={page} setPage={setPage} />
            </>
          ) : (
            <div className="text-center py-16 md:py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">No services found</h3>
              <p className="text-gray-600 text-lg mb-6">Try adjusting your filters or search term</p>
              <button
                onClick={() => { setActiveCategory('all'); setSearchTerm(''); }}
                className="bg-green-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-800 transition shadow-md"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 md:py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-800">Verified Pros</h4>
              <p className="text-gray-600 text-sm mt-1">Background-checked & licensed</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-800">4.8 ★ Rating</h4>
              <p className="text-gray-600 text-sm mt-1">From 500,000+ jobs</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-700" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-800">100% Guarantee</h4>
              <p className="text-gray-600 text-sm mt-1">Homeowner Protection Promise</p>
            </div>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
}