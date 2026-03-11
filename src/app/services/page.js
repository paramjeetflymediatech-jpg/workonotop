// 'use client';

// import Footer from '@/components/Footer';
// import Header from '@/components/Header';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useState, useEffect } from 'react';

// const PAGE_SIZE = 8;

// // Pagination Component
// function Pagination({ total, page, setPage }) {
//   const totalPages = Math.ceil(total / PAGE_SIZE)
//   const pages = []
//   for (let i = 1; i <= totalPages; i++) {
//     if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
//       pages.push(i)
//     } else if (pages[pages.length - 1] !== '...') {
//       pages.push('...')
//     }
//   }

//   if (totalPages <= 1) return null

//   return (
//     <div className="flex items-center justify-center mt-12 gap-2">
//       <button
//         onClick={() => setPage(p => Math.max(1, p - 1))}
//         disabled={page === 1}
//         className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
//           page === 1
//             ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//             : 'bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-500'
//         }`}
//       >
//         ‹
//       </button>

//       {pages.map((p, i) => (
//         p === '...'
//           ? <span key={`e-${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400">…</span>
//           : <button
//               key={p}
//               onClick={() => setPage(p)}
//               className={`w-10 h-10 rounded-lg font-medium transition ${
//                 page === p
//                   ? 'bg-green-700 text-white shadow-md'
//                   : 'bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-500'
//               }`}
//             >
//               {p}
//             </button>
//       ))}

//       <button
//         onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//         disabled={page === totalPages}
//         className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
//           page === totalPages
//             ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//             : 'bg-white border border-gray-200 text-gray-700 hover:bg-green-50 hover:border-green-500'
//         }`}
//       >
//         ›
//       </button>
//     </div>
//   )
// }

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

//   // Pagination state
//   const [page, setPage] = useState(1);

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

//   // Reset page when filters change
//   useEffect(() => {
//     setPage(1);
//   }, [activeCategory, searchTerm]);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
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
//     const matchesCategory = activeCategory === 'all' ||
//       service.category_id === parseInt(activeCategory);

//     const matchesSearch = searchTerm === '' ||
//       service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (service.short_description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (service.description || '').toLowerCase().includes(searchTerm.toLowerCase());

//     return matchesCategory && matchesSearch;
//   });

//   // Pagination logic
//   const startIndex = (page - 1) * PAGE_SIZE;
//   const endIndex = startIndex + PAGE_SIZE;
//   const pagedServices = filteredServices.slice(startIndex, endIndex);

//   // Category filter buttons
//   const filterCategories = [
//     { id: 'all', name: 'All Services', icon: '🔍' },
//     ...categories.map(cat => ({
//       id: cat.id.toString(),
//       name: cat.name,
//       icon: cat.icon || '🔧'
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

//             {/* 🔥 FIXED: Search bar without button - just input field */}
//             <div className="mt-8 md:mt-10 max-w-2xl mx-auto">
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                   <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                   </svg>
//                 </div>
//                 <input
//                   type="text"
//                   placeholder={placeholder || 'mount tv on wall'}
//                   className="w-full pl-14 pr-6 py-4 sm:py-5 text-gray-800 bg-white rounded-2xl shadow-2xl outline-none placeholder:text-gray-700 placeholder:font-medium placeholder:text-lg sm:placeholder:text-xl md:placeholder:text-2xl text-base sm:text-lg md:text-xl border-2 border-transparent focus:border-green-300 transition-all duration-300"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
//           <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
//             <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
//           </svg>
//         </div>
//       </section>

//       {/* Category Filters */}
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

//           {/* Results count */}
//           <div className="text-center mt-6 text-gray-600 text-sm md:text-base">
//             Showing <span className="font-bold text-green-700">
//               {filteredServices.length > 0 ? startIndex + 1 : 0} - {Math.min(endIndex, filteredServices.length)}
//             </span> of <span className="font-bold text-green-700">{filteredServices.length}</span> services
//             {activeCategory !== 'all' && ` in ${categories.find(c => c.id === parseInt(activeCategory))?.name}`}
//             {searchTerm && ` matching "${searchTerm}"`}
//           </div>
//         </div>
//       </section>

//       {/* Services Grid */}
//       <section className="py-12 md:py-16 lg:py-20 bg-gray-50/50">
//         <div className="container mx-auto px-4">
//           {filteredServices.length > 0 ? (
//             <>
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
//                 {pagedServices.map((service) => {
//                   const category = categories.find(c => c.id === service.category_id);

//                   return (
//                     <Link
//                       key={service.id}
//                       href={`/services/${service.slug}`}
//                       className="group transform hover:-translate-y-2 transition-all duration-300"
//                     >
//                       <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 h-full flex flex-col">
//                         <div className="h-36 sm:h-40 md:h-44 flex items-center justify-center relative bg-gradient-to-br from-green-50 to-emerald-50">
//                           {service.image_url ? (
//                             <img
//                               src={service.image_url}
//                               alt={service.name}
//                               className="w-full h-full object-cover"
//                             />
//                           ) : (
//                             <span className="text-5xl sm:text-6xl md:text-7xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md">
//                               {category?.icon || '🔧'}
//                             </span>
//                           )}
//                           <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700 shadow-sm border border-gray-200">
//                             {category?.name || 'General'}
//                           </span>
//                         </div>

//                         <div className="p-5 md:p-6 flex-1 flex flex-col">
//                           <h3 className="text-lg md:text-xl font-bold text-gray-800 group-hover:text-green-700 transition line-clamp-2 min-h-[3.5rem]">
//                             {service.name}
//                           </h3>

//                           <p className="text-sm text-gray-600 mt-1 line-clamp-2">
//                             {service.short_description || service.description?.substring(0, 60) + '...' || 'No description'}
//                           </p>

//                           <div className="mt-3 flex items-end justify-between">
//                             <div>
//                               <p className="text-xs text-gray-500 uppercase tracking-wider">Starting at</p>
//                               <p className="text-xl md:text-2xl font-extrabold text-green-700">
//                                 ${parseFloat(service.base_price).toFixed(0)}
//                               </p>
//                             </div>

//                             <div className="bg-green-100 rounded-full p-2 group-hover:bg-green-600 transition-colors duration-300">
//                               <svg className="w-5 h-5 text-green-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                               </svg>
//                             </div>
//                           </div>

//                           {service.additional_price > 0 && (
//                             <p className="text-xs text-gray-500 mt-2">
//                               +${parseFloat(service.additional_price).toFixed(0)} additional
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     </Link>
//                   );
//                 })}
//               </div>

//               <Pagination total={filteredServices.length} page={page} setPage={setPage} />
//             </>
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






















'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const PAGE_SIZE = 8;

// Pagination Component
function Pagination({ total, page, setPage }) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center mt-12 gap-3">
      <button
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${page === 1
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
          : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 shadow-sm'
          }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {pages.map((p, i) => (
        p === '...'
          ? <span key={`e-${i}`} className="w-10 h-10 flex items-center justify-center text-slate-400">...</span>
          : <button
            key={p}
            onClick={() => setPage(p)}
            className={`w-12 h-12 rounded-2xl font-bold transition-all ${page === p
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-500'
              }`}
          >
            {p}
          </button>
      ))}

      <button
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${page === totalPages
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
          : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-600 shadow-sm'
          }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

export default function ServicesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placeholder, setPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);
  const [page, setPage] = useState(1);

  const searchExamples = [
    'mount tv on wall',
    'fix leaky faucet',
    'install ceiling fan',
    'clean carpets',
    'repair dryer',
    'paint living room',
  ];

  const handleSearchClick = () => {
    const searchArea = document.getElementById('search-container');
    if (searchArea) {
      const yOffset = -120; // 120px offset gives enough room for the sticky header and keeps the search bar in clear view
      const y = searchArea.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      window.scrollBy({ top: 150, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchData();
    // Parse query params for search term passed from the Home Page
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchTerm(searchParam);
      // Automatically scroll down to the search area
      setTimeout(() => {
        const searchArea = document.getElementById('search-container');
        if (searchArea) {
          const yOffset = -120;
          const y = searchArea.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 500);
    }
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeCategory, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
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

  const filteredServices = services.filter(service => {
    const matchesCategory = activeCategory === 'all' ||
      service.category_id === parseInt(activeCategory);

    const matchesSearch = searchTerm === '' ||
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.short_description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pagedServices = filteredServices.slice(startIndex, endIndex);

  const filterCategories = [
    { id: 'all', name: 'All Services', icon: '✨' },
    ...categories.map(cat => ({
      id: cat.id.toString(),
      name: cat.name,
      icon: cat.icon || '🛠️'
    }))
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <Header />

      {/* Premium Hero Section */}
      <section className="relative pt-10 pb-20 md:pt-10 md:pb-10 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-bold mb-8 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Expert Care for Every Home
            </div> */}

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-outfit)] leading-[1.1] mb-8 tracking-tight text-slate-900">
              Your Home, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Managed with Care.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              Find and book top-rated professionals for maintenance, repairs, and improvements. Transparent pricing and quality guaranteed.
            </p>

            {/* Premium Search Bar */}
            <div id="search-container" className="max-w-2xl mx-auto relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <div className="relative bg-white border border-slate-200 rounded-[2rem] p-2 flex items-center shadow-2xl shadow-slate-200/50 group-focus-within:border-emerald-500 transition-all duration-300">
                <div className="flex items-center flex-1 px-5">
                  <svg className="w-6 h-6 text-emerald-500 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder={placeholder || 'What do you need?'}
                    className="w-full bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 text-lg md:text-xl font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onClick={(e) => {
                      setTimeout(() => {
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }, 100);
                    }}
                    onFocus={(e) => {
                      setTimeout(() => {
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }, 100);
                    }}
                  />
                </div>
                <div className="hidden sm:block h-10 w-px bg-slate-100 mx-2"></div>
                <button
                  onClick={handleSearchClick}
                  className="hidden sm:block bg-slate-900 text-white font-bold px-8 py-4 rounded-2xl hover:bg-emerald-600 transition-all active:scale-95"
                >
                  Find Pros
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation - Horizontal Scroll on small screens */}
      <section id="services-listing" className=" top-[80px] z-30  backdrop-blur-xl border-y border-slate-100 py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center items-center gap-3 overflow-x-auto no-scrollbar pb-1 md:justify-center">
            {filterCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2
                  ${activeCategory === category.id
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                    : 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-white hover:border-emerald-300 hover:text-emerald-600'
                  }
                `}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Listing */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 font-[family-name:var(--font-outfit)]">
                {activeCategory === 'all'
                  ? searchTerm ? `Results for "${searchTerm}"` : 'All Services'
                  : categories.find(c => c.id === parseInt(activeCategory))?.name
                }
              </h2>
              <p className="text-slate-500 mt-2">
                Showing {filteredServices.length} vetted services in your area
              </p>
            </div>
          </div>

          {filteredServices.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {pagedServices.map((service) => {
                  const category = categories.find(c => c.id === service.category_id);
                  return (
                    <Link
                      key={service.id}
                      href={`/services/${service.slug}`}
                      className="group flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 hover:-translate-y-2 h-full"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        {service.image_url ? (
                          <img
                            src={service.image_url}
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50">
                            <span className="text-6xl group-hover:scale-125 transition-transform duration-500">{category?.icon || '🛠️'}</span>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 border border-white/20">
                          {category?.name || 'General'}
                        </div>
                      </div>

                      <div className="p-8 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 min-h-[3.5rem] mb-3">
                          {service.name}
                        </h3>

                        <p className="text-slate-500 text-sm mb-8 line-clamp-2">
                          {service.short_description || "High-quality professional service guaranteed."}
                        </p>

                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                          <div>
                            <span className="text-slate-400 text-xs uppercase tracking-widest block mb-1">Starting from</span>
                            <span className="text-2xl font-black text-emerald-600">${parseFloat(service.base_price).toFixed(0)}</span>
                          </div>
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-emerald-500 transition-colors duration-500">
                            <svg className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <Pagination total={filteredServices.length} page={page} setPage={setPage} />
            </>
          ) : (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="text-6xl mb-6 animate-bounce">🔍</div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">No services found</h3>
              <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto">We couldn&apos;t find any results matching your search. Try a different term or clear filters.</p>
              <button
                onClick={() => { setActiveCategory('all'); setSearchTerm(''); }}
                className="bg-emerald-500 text-white font-bold px-10 py-5 rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Premium Trust Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              { title: 'Verified Pros', desc: 'Every professional is background checked and verified.', icon: '🛡️' },
              { title: 'Quality Guaranteed', desc: 'Not happy with the results? We will make it right.', icon: '🏆' },
              { title: 'Transparent Pay', desc: 'Secure payments with no hidden commissions.', icon: '💳' },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-3xl mb-6 mx-auto group-hover:bg-emerald-50 group-hover:scale-110 transition-all duration-500">
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3 font-[family-name:var(--font-outfit)]">{item.title}</h4>
                <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}





