// 'use client';

// import Footer from '@/components/Footer';
// import Header from '@/components/Header';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useState, useEffect } from 'react';
// import { useAuth } from 'src/context/AuthContext';

// export default function HomePage() {
//   const router = useRouter();
//   const { user } = useAuth();
//   const [placeholder, setPlaceholder] = useState('');
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [loopNum, setLoopNum] = useState(0);
//   const [typingSpeed, setTypingSpeed] = useState(100);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
//   // State for dynamic homepage services
//   const [homepageServices, setHomepageServices] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const services = [
//     'fridge not cooling',
//     'leaky faucet',
//     'electrical outlet not working',
//     'washer repair',
//     'dryer vent cleaning',
//     'ceiling fan installation',
//     'garbage disposal jammed',
//     'furnace making weird noises',
//     'door not closing properly',
//     'sink clogged'
//   ];

//   // Fetch homepage services and categories
//   useEffect(() => {
//     fetchHomepageData();
//   }, []);

//   const fetchHomepageData = async () => {
//     setLoading(true);
//     try {
//       // Fetch services with is_homepage = 1
//       const servicesRes = await fetch('/api/services?is_homepage=1');
//       const servicesData = await servicesRes.json();

//       // Fetch categories for icons
//       const categoriesRes = await fetch('/api/categories');
//       const categoriesData = await categoriesRes.json();

//       if (servicesData.success) {
//         setHomepageServices(servicesData.data || []);
//       }

//       if (categoriesData.success) {
//         setCategories(categoriesData.data || []);
//       }
//     } catch (error) {
//       console.error('Error loading homepage data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper function to get category icon
//   const getCategoryIcon = (categoryId) => {
//     const category = categories.find(c => c.id === categoryId);
//     return category?.icon || '🔧';
//   };

//   useEffect(() => {
//     let timer;
    
//     const handleTyping = () => {
//       const i = loopNum % services.length;
//       const fullText = services[i];

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
//   }, [placeholder, isDeleting, loopNum, typingSpeed, services]);

//   const handleSearchClick = () => {
//     router.push('/services');
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter') {
//       router.push('/services');
//     }
//   };

//   const toggleMobileMenu = () => {
//     setMobileMenuOpen(!mobileMenuOpen);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-white font-sans antialiased">
//       <Header/>

//       <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white overflow-hidden">
//         <div className="absolute inset-0 opacity-10" style={{ 
//           backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' 
//         }}></div>
        
//         <div className="container mx-auto px-4 py-12 lg:py-24 relative z-10">
//           <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
//             <div className="flex-1 text-center lg:text-left">
//               <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 drop-shadow-md">
//                 Home maintenance <br className="hidden sm:block" />
//                 <span className="bg-green-500/30 px-3 py-1 inline-block rounded-lg">booked when you need it.</span>
//               </h1>
//               <p className="text-lg md:text-xl lg:text-2xl mb-8 text-green-50 font-light max-w-2xl lg:mx-0 mx-auto">
//                 Trusted local tradespeople • Free quotes • Verified reviews
//               </p>
              
//               <div 
//                 className="bg-white rounded-2xl shadow-2xl p-1 flex items-center max-w-2xl lg:mx-0 mx-auto cursor-pointer hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] border-2 border-transparent hover:border-green-300"
//                 onClick={handleSearchClick}
//               >
//                 <div className="flex items-center flex-1 bg-white rounded-xl px-4 sm:px-6 py-2 sm:py-3">
//                   <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 flex-shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
//                     <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//                   </svg>
//                   <input 
//                     type="text" 
//                     placeholder={placeholder || 'fridge not cooling'}
//                     className="flex-1 px-2 py-4 sm:py-5 lg:py-6 text-gray-800 outline-none bg-transparent cursor-pointer placeholder:text-gray-700 placeholder:font-medium placeholder:text-lg sm:placeholder:text-xl md:placeholder:text-2xl lg:placeholder:text-3xl placeholder:tracking-wide text-base sm:text-lg md:text-xl lg:text-2xl"
//                     readOnly
//                     value=""
//                     onClick={handleSearchClick}
//                     onKeyDown={handleKeyDown}
//                   />
//                 </div>
//               </div>
              
//               <p className="text-white/90 text-sm sm:text-base md:text-lg mt-4 text-center lg:text-left flex items-center gap-2 justify-center lg:justify-start">
//                 <span className="text-xl sm:text-2xl">🔍</span> 
//                 <span className="font-medium">Click search or press Enter — see all services</span>
//               </p>

//               <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 justify-center lg:justify-start">
             
//                 <Link href="/services" className="bg-white/20 backdrop-blur-sm px-6 sm:px-8 py-2 sm:py-3 rounded-full text-white font-semibold hover:bg-white/30 transition border-2 border-white/40 text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl">
//                   View all services →
//                 </Link>
//               </div>
//             </div>
            
//             <div className="flex-1 hidden lg:flex justify-center">
//               <div className="relative w-80 xl:w-96">
//                 <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl"></div>
//                 <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 xl:p-10 border-2 border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300">
//                   <div className="text-7xl xl:text-9xl mb-4 xl:mb-6">🛠️</div>
//                   <h4 className="text-2xl xl:text-3xl font-bold text-white mb-2">5,000+ pros ready</h4>
//                   <p className="text-green-100 text-lg xl:text-xl">in Calgary & surrounding</p>
//                   <div className="flex mt-4 xl:mt-6 -space-x-2 xl:-space-x-3">
//                     <div className="w-10 h-10 xl:w-14 xl:h-14 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-lg xl:text-2xl">👩‍🔧</div>
//                     <div className="w-10 h-10 xl:w-14 xl:h-14 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-lg xl:text-2xl">👨‍🔧</div>
//                     <div className="w-10 h-10 xl:w-14 xl:h-14 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-lg xl:text-2xl">👩‍🏭</div>
//                     <div className="w-10 h-10 xl:w-14 xl:h-14 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-lg xl:text-2xl">👨‍🏭</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
//           <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
//             <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
//           </svg>
//         </div>
//       </section>

//       <section className="py-12 md:py-16 lg:py-20 bg-white">
//         <div className="container mx-auto px-4">
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 text-center">
//             <div className="bg-green-50/60 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-green-100 shadow-sm hover:shadow-md transition">
//               <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-green-800 mb-2">500,000+</h3>
//               <p className="text-gray-700 text-sm sm:text-base md:text-lg font-medium uppercase tracking-wide">JOBS COMPLETED</p>
//               <span className="inline-block mt-2 text-xs sm:text-sm text-green-600 bg-green-100 px-2 sm:px-3 py-1 rounded-full">trusted by thousands</span>
//             </div>
//             <div className="bg-green-50/60 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-green-100 shadow-sm hover:shadow-md transition">
//               <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-green-800 mb-2">96%</h3>
//               <p className="text-gray-700 text-sm sm:text-base md:text-lg font-medium uppercase tracking-wide">RATED THEIR PRO PERFECT</p>
//               <span className="inline-block mt-2 text-xs sm:text-sm text-green-600 bg-green-100 px-2 sm:px-3 py-1 rounded-full">⭐ 4.8 average</span>
//             </div>
//             <div className="bg-green-50/60 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-green-100 shadow-sm hover:shadow-md transition sm:col-span-2 md:col-span-1">
//               <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-green-800 mb-2 flex items-center justify-center">
//                 4.8 <span className="text-yellow-500 ml-2 text-3xl sm:text-4xl md:text-5xl">★</span>
//               </h3>
//               <p className="text-gray-700 text-sm sm:text-base md:text-lg font-medium uppercase tracking-wide">APP STORE RATING</p>
//               <span className="inline-block mt-2 text-xs sm:text-sm text-green-600 bg-green-100 px-2 sm:px-3 py-1 rounded-full">iOS & Android</span>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-white to-green-50/30">
//         <div className="container mx-auto px-4 text-center">
//           <span className="text-green-700 font-semibold text-sm sm:text-base md:text-lg uppercase tracking-wider bg-green-100 px-3 sm:px-4 py-1 sm:py-2 rounded-full">Simple & fast</span>
//           <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-4 sm:mt-6 mb-8 sm:mb-12 md:mb-16 text-gray-900">
//             How WorkOnTap works
//           </h2>
          
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
//             <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition border border-gray-100 flex flex-col items-center group">
//               <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl mb-4 md:mb-6 text-green-700 group-hover:scale-110 group-hover:bg-green-200 transition duration-300">
//                 📋
//               </div>
//               <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 md:mb-3">1. Tell us what you need</h3>
//               <p className="text-sm sm:text-base text-gray-600">Choose date, time, and describe your job — takes 2 minutes.</p>
//             </div>
//             <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition border border-gray-100 flex flex-col items-center group">
//               <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl mb-4 md:mb-6 text-green-700 group-hover:scale-110 group-hover:bg-green-200 transition duration-300">
//                 📱
//               </div>
//               <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 md:mb-3">2. Instant matches</h3>
//               <p className="text-sm sm:text-base text-gray-600">We find nearby certified pros — average 10 min response.</p>
//             </div>
//             <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition border border-gray-100 flex flex-col items-center group">
//               <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl mb-4 md:mb-6 text-green-700 group-hover:scale-110 group-hover:bg-green-200 transition duration-300">
//                 👨‍🔧
//               </div>
//               <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 md:mb-3">3. Pro arrives & fixes it</h3>
//               <p className="text-sm sm:text-base text-gray-600">Relax while your WorkOnTap pro handles everything.</p>
//             </div>
//             <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition border border-gray-100 flex flex-col items-center group">
//               <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl mb-4 md:mb-6 text-green-700 group-hover:scale-110 group-hover:bg-green-200 transition duration-300">
//                 💚
//               </div>
//               <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 md:mb-3">4. Pay & review</h3>
//               <p className="text-sm sm:text-base text-gray-600">Secure payment, receipt, and job history all in one place.</p>
//             </div>
//           </div>

//           <Link href="/services" className="mt-8 sm:mt-12 md:mt-16 inline-flex items-center bg-green-700 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold shadow-xl hover:bg-green-800 hover:scale-105 transition duration-300">
//             Start booking my service
//             <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
//             </svg>
//           </Link>
//         </div>
//       </section>

//       <section className="py-12 md:py-16 lg:py-20 bg-white">
//         <div className="container mx-auto px-4">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
//             <div className="order-2 lg:order-1">
//               <div className="bg-green-50 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 border border-green-100 shadow-xl hover:shadow-2xl transition">
//                 <div className="flex items-center space-x-2 md:space-x-3 text-green-800 mb-4 md:mb-6">
//                   <div className="p-2 md:p-3 bg-green-200 rounded-full">
//                     <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <span className="text-xl md:text-2xl font-bold">Homeowner Protection Promise</span>
//                 </div>
//                 <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 md:mb-4 leading-tight">
//                   Guaranteed jobs by certified professionals.
//                 </h2>
//                 <p className="text-base md:text-lg text-gray-700 mb-4 md:mb-6 leading-relaxed">
//                   Every WorkOnTap pro is licensed, background-checked, and well-rated. 
//                   If your experience isn&apos;t perfect, we&apos;ll make it right — <span className="font-semibold text-green-700">100% guaranteed.</span>
//                 </p>
//                 <Link href="/guarantee" className="inline-flex items-center bg-green-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold shadow-md hover:bg-green-800 transition text-sm md:text-base">
//                   Learn more about our promise
//                   <svg className="w-3 h-3 md:w-4 md:h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </Link>
//               </div>
//             </div>
//             <div className="order-1 lg:order-2 flex justify-center">
//               <div className="relative w-full max-w-sm md:max-w-md">
//                 <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl md:rounded-3xl p-1 shadow-2xl">
//                   <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col items-center">
//                     <span className="text-6xl md:text-8xl mb-3 md:mb-4">🛡️</span>
//                     <h3 className="text-xl md:text-2xl font-bold text-green-800">WorkOnTap Verified</h3>
//                     <p className="text-center text-gray-600 text-sm md:text-base mt-2">Every pro is screened, insured, and reviewed</p>
//                     <div className="flex mt-3 md:mt-4 space-x-1 md:space-x-2 text-xs md:text-sm">
//                       <span className="text-green-600">✓</span><span> License check</span>
//                       <span className="text-green-600 ml-2 md:ml-3">✓</span><span> Background</span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="absolute -bottom-4 -right-4 md:-bottom-5 md:-right-5 bg-yellow-400 text-black font-bold py-1 px-3 md:py-2 md:px-5 rounded-full shadow-lg text-xs md:text-sm">
//                   Trusted since 2022
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* DYNAMIC SERVICES SECTION - Only shows services with is_homepage = 1 */}
//       <section className="py-12 md:py-16 lg:py-20 bg-green-50/50">
//         <div className="container mx-auto px-4">
//           <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-14">
//             {/* <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2 md:mb-4">
//               What people in Calgary are doing now
//             </h2> */}
// <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2 md:mb-4 max-w-2xl mx-auto leading-tight text-center px-4">
//   What people in Calgary are doing now
// </h2>
//             <p className="text-base md:text-lg text-gray-600">Trending services — book in under 2 minutes</p>
//           </div>
          
//           {homepageServices.length > 0 ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
//               {homepageServices.slice(0, 3).map((service) => (
//                 <Link
//                   key={service.id}
//                   href={`/services/${service.slug}`}
//                   className="group transform hover:-translate-y-2 transition duration-300"
//                 >
//                   <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 h-full flex flex-col">
//                     {/* Image/Icon area */}
//                     <div className="h-40 sm:h-44 md:h-52 bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center relative">
//                       {service.image_url ? (
//                         <img
//                           src={service.image_url}
//                           alt={service.name}
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <span className="text-5xl sm:text-6xl md:text-7xl group-hover:scale-110 transition duration-300">
//                           {getCategoryIcon(service.category_id)}
//                         </span>
//                       )}
//                       {/* Popular badge if is_popular is true */}
//                       {service.is_popular === 1 && (
//                         <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
//                           🔥 Popular
//                         </span>
//                       )}
//                     </div>
                    
//                     {/* Content */}
//                     <div className="p-4 md:p-6 flex-1 flex flex-col">
//                       <h3 className="text-xl md:text-2xl font-bold text-gray-800 group-hover:text-green-700 transition line-clamp-2 min-h-[3.5rem]">
//                         {service.name}
//                       </h3>
                      
//                       {service.short_description && (
//                         <p className="text-sm md:text-base text-gray-500 mt-1 line-clamp-2">
//                           {service.short_description}
//                         </p>
//                       )}
                      
//                       <div className="mt-3 flex items-end justify-between">
//                         <div>
//                           <p className="text-xs text-gray-500 uppercase tracking-wider">Starting at</p>
//                           <p className="text-xl md:text-2xl font-extrabold text-green-700">
//                             ${parseFloat(service.base_price).toFixed(0)}
//                           </p>
//                         </div>
                        
//                         <div className="bg-green-100 rounded-full p-2 group-hover:bg-green-600 transition-colors duration-300">
//                           <svg className="w-5 h-5 text-green-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                           </svg>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           ) : (
//             // Fallback if no homepage services - show nothing or a message
//             <div className="text-center py-8">
//               <p className="text-gray-500">No trending services available at the moment.</p>
//             </div>
//           )}
          
//           <div className="text-center mt-8 md:mt-12 lg:mt-14">
//             <Link href="/services" className="inline-flex items-center bg-white border-2 border-green-700 text-green-800 px-6 md:px-8 lg:px-10 py-2 md:py-3 lg:py-4 rounded-full text-sm md:text-base lg:text-lg font-bold shadow-md hover:bg-green-700 hover:text-white transition duration-300">
//               View all services
//               <svg className="w-4 h-4 md:w-5 md:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//               </svg>
//             </Link>
//           </div>
//         </div>
//       </section>



//       <Footer/>

     
//       <style jsx>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(-10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
//         .line-clamp-2 {
//           display: -webkit-box;
//           -webkit-line-clamp: 2;
//           -webkit-box-orient: vertical;
//           overflow: hidden;
//         }
//       `}</style>
//     </div>
//   );
// }







'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from 'src/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [placeholder, setPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Home Maintenance');
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  
  const [homepageServices, setHomepageServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const services = [
    'fridge not cooling', 'leaky faucet', 'electrical outlet not working',
    'washer repair', 'dryer vent cleaning', 'ceiling fan installation',
    'garbage disposal jammed', 'furnace making weird noises',
    'door not closing properly', 'sink clogged'
  ];

  const serviceCategories = ['Home Maintenance', 'Home Remodeling', 'Outdoor Upkeep', 'Essential Home Services'];

  const servicesByCategory = {
    'Home Maintenance': [
      { title: 'Electric Work', desc: 'Our electricians handle installations, wiring issues, safety checks, and repairs with precision and care to keep your home running safely.', image: '/images/electric.jpg', large: true },
      { title: 'Plumbing Service', desc: 'We provide fast solutions for leaks, clogs, and installations.', image: '/images/plumbing.jpg' },
      { title: 'Roofing & Waterproofing', desc: 'Protect your home from water damage with expert roofing solutions.', image: '/images/roofing.jpg' },
      { title: 'Carpenter Work', desc: 'From furniture repairs to custom woodwork done right.', image: '/images/carpenter.jpg' },
    ],
    'Home Remodeling': [
      { title: 'Kitchen Renovation', desc: 'Transform your kitchen with modern designs and quality craftsmanship.', image: '/images/kitchen.jpg', large: true },
      { title: 'Bathroom Remodel', desc: 'Upgrade your bathroom with stylish and functional improvements.', image: '/images/bathroom.jpg' },
      { title: 'Flooring Installation', desc: 'Expert flooring solutions for every room in your home.', image: '/images/flooring.jpg' },
      { title: 'Interior Painting', desc: 'Fresh coats and professional finishes for beautiful interiors.', image: '/images/painting.jpg' },
    ],
    'Outdoor Upkeep': [
      { title: 'Lawn Care', desc: 'Keep your lawn healthy, green, and well-maintained year-round.', image: '/images/lawn.jpg', large: true },
      { title: 'Fence Installation', desc: 'Durable and attractive fencing solutions for your property.', image: '/images/fence.jpg' },
      { title: 'Pressure Washing', desc: 'Blast away dirt and grime from driveways, decks, and siding.', image: '/images/pressure.jpg' },
      { title: 'Gutter Cleaning', desc: 'Keep gutters clear to prevent water damage and overflow.', image: '/images/gutter.jpg' },
    ],
    'Essential Home Services': [
      { title: 'House Cleaning', desc: 'Professional cleaning services for a spotless and healthy home.', image: '/images/cleaning.jpg', large: true },
      { title: 'Appliance Repair', desc: 'Fast and reliable repairs for all major home appliances.', image: '/images/appliance.jpg' },
      { title: 'HVAC Service', desc: 'Heating and cooling maintenance to keep your home comfortable.', image: '/images/hvac.jpg' },
      { title: 'Pest Control', desc: 'Safe and effective pest removal to protect your home.', image: '/images/pest.jpg' },
    ],
  };

  const testimonials = [
    [
      { name: 'Vikram A.', stars: 5, text: 'Appreciated the carpenter\'s quality of work during his renovation project, saying the platform made the entire process smooth and hassle-free.' },
      { name: 'Priya M', stars: 5, text: 'Stated that the painter completely transformed her living room with beautiful finishing and attention to detail, making Work On Top her go-to choice.' },
      { name: 'Rohan.', stars: 5, text: 'Shared that the electrician arrived on time, completed all repairs quickly, and provided excellent service. He was impressed with both the response time and the professionalism.' },
    ],
    [
      { name: 'Anita S.', stars: 5, text: 'Was very happy with the plumbing service. The pro arrived quickly and fixed the issue efficiently with great professionalism.' },
      { name: 'James K.', stars: 5, text: 'Found the booking process incredibly easy. The handyman was skilled, polite, and left the place spotless after the job.' },
      { name: 'Sara L.', stars: 5, text: 'Loved how fast the response was. The cleaning team did an outstanding job and exceeded all her expectations.' },
    ],
  ];

  useEffect(() => { fetchHomepageData(); }, []);

  const fetchHomepageData = async () => {
    setLoading(true);
    try {
      const servicesRes = await fetch('/api/services?is_homepage=1');
      const servicesData = await servicesRes.json();
      const categoriesRes = await fetch('/api/categories');
      const categoriesData = await categoriesRes.json();
      if (servicesData.success) setHomepageServices(servicesData.data || []);
      if (categoriesData.success) setCategories(categoriesData.data || []);
    } catch (error) {
      console.error('Error loading homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || '🔧';
  };

  useEffect(() => {
    let timer;
    const handleTyping = () => {
      const i = loopNum % services.length;
      const fullText = services[i];
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
  }, [placeholder, isDeleting, loopNum, typingSpeed, services]);

  const handleSearchClick = () => router.push('/services');
  const handleKeyDown = (e) => { if (e.key === 'Enter') router.push('/services'); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <Header/>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.3\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' 
        }}></div>
        <div className="container mx-auto px-4 py-12 lg:py-24 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 drop-shadow-md">
                Home maintenance <br className="hidden sm:block" />
                <span className="bg-green-500/30 px-3 py-1 inline-block rounded-lg">booked when you need it.</span>
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl mb-8 text-green-50 font-light max-w-2xl lg:mx-0 mx-auto">
                Trusted local tradespeople • Free quotes • Verified reviews
              </p>
              <div 
                className="bg-white rounded-2xl shadow-2xl p-1 flex items-center max-w-2xl lg:mx-0 mx-auto cursor-pointer hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] border-2 border-transparent hover:border-green-300"
                onClick={handleSearchClick}
              >
                <div className="flex items-center flex-1 bg-white rounded-xl px-4 sm:px-6 py-2 sm:py-3">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 flex-shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder={placeholder || 'fridge not cooling'}
                    className="flex-1 px-2 py-4 sm:py-5 lg:py-6 text-gray-800 outline-none bg-transparent cursor-pointer placeholder:text-gray-700 placeholder:font-medium placeholder:text-lg sm:placeholder:text-xl md:placeholder:text-2xl lg:placeholder:text-3xl placeholder:tracking-wide text-base sm:text-lg md:text-xl lg:text-2xl"
                    readOnly value="" onClick={handleSearchClick} onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
              <p className="text-white/90 text-sm sm:text-base md:text-lg mt-4 text-center lg:text-left flex items-center gap-2 justify-center lg:justify-start">
                <span className="text-xl sm:text-2xl">🔍</span>
                <span className="font-medium">Click search or press Enter — see all services</span>
              </p>
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 justify-center lg:justify-start">
                <Link href="/services" className="bg-white/20 backdrop-blur-sm px-6 sm:px-8 py-2 sm:py-3 rounded-full text-white font-semibold hover:bg-white/30 transition border-2 border-white/40 text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl">
                  View all services →
                </Link>
              </div>
            </div>
            <div className="flex-1 hidden lg:flex justify-center">
              <div className="relative w-80 xl:w-96">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 xl:p-10 border-2 border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300">
                  <div className="text-7xl xl:text-9xl mb-4 xl:mb-6">🛠️</div>
                  <h4 className="text-2xl xl:text-3xl font-bold text-white mb-2">5,000+ pros ready</h4>
                  <p className="text-green-100 text-lg xl:text-xl">in Calgary & surrounding</p>
                  <div className="flex mt-4 xl:mt-6 -space-x-2 xl:-space-x-3">
                    {['👩‍🔧','👨‍🔧','👩‍🏭','👨‍🏭'].map((emoji, i) => (
                      <div key={i} className="w-10 h-10 xl:w-14 xl:h-14 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-lg xl:text-2xl">{emoji}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10 text-center">
            <div className="bg-green-50/60 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-green-100 shadow-sm hover:shadow-md transition">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-green-800 mb-2">500,000+</h3>
              <p className="text-gray-700 text-sm sm:text-base md:text-lg font-medium uppercase tracking-wide">JOBS COMPLETED</p>
              <span className="inline-block mt-2 text-xs sm:text-sm text-green-600 bg-green-100 px-2 sm:px-3 py-1 rounded-full">trusted by thousands</span>
            </div>
            <div className="bg-green-50/60 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-green-100 shadow-sm hover:shadow-md transition">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-green-800 mb-2">96%</h3>
              <p className="text-gray-700 text-sm sm:text-base md:text-lg font-medium uppercase tracking-wide">RATED THEIR PRO PERFECT</p>
              <span className="inline-block mt-2 text-xs sm:text-sm text-green-600 bg-green-100 px-2 sm:px-3 py-1 rounded-full">⭐ 4.8 average</span>
            </div>
            <div className="bg-green-50/60 rounded-2xl md:rounded-3xl p-6 md:p-8 border border-green-100 shadow-sm hover:shadow-md transition sm:col-span-2 md:col-span-1">
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-green-800 mb-2 flex items-center justify-center">
                4.8 <span className="text-yellow-500 ml-2 text-3xl sm:text-4xl md:text-5xl">★</span>
              </h3>
              <p className="text-gray-700 text-sm sm:text-base md:text-lg font-medium uppercase tracking-wide">APP STORE RATING</p>
              <span className="inline-block mt-2 text-xs sm:text-sm text-green-600 bg-green-100 px-2 sm:px-3 py-1 rounded-full">iOS & Android</span>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-white to-green-50/30">
        <div className="container mx-auto px-4 text-center">
          <span className="text-green-700 font-semibold text-sm sm:text-base md:text-lg uppercase tracking-wider bg-green-100 px-3 sm:px-4 py-1 sm:py-2 rounded-full">Simple & fast</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-4 sm:mt-6 mb-8 sm:mb-12 md:mb-16 text-gray-900">How WorkOnTap works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: '📋', title: '1. Tell us what you need', desc: 'Choose date, time, and describe your job — takes 2 minutes.' },
              { icon: '📱', title: '2. Instant matches', desc: 'We find nearby certified pros — average 10 min response.' },
              { icon: '👨‍🔧', title: '3. Pro arrives & fixes it', desc: 'Relax while your WorkOnTap pro handles everything.' },
              { icon: '💚', title: '4. Pay & review', desc: 'Secure payment, receipt, and job history all in one place.' },
            ].map((step, i) => (
              <div key={i} className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition border border-gray-100 flex flex-col items-center group">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl mb-4 md:mb-6 text-green-700 group-hover:scale-110 group-hover:bg-green-200 transition duration-300">{step.icon}</div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 md:mb-3">{step.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/services" className="mt-8 sm:mt-12 md:mt-16 inline-flex items-center bg-green-700 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold shadow-xl hover:bg-green-800 hover:scale-105 transition duration-300">
            Start booking my service
            <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        </div>
      </section>

      {/* Trending Services */}
      <section className="py-12 md:py-16 lg:py-20 bg-green-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2 md:mb-4 max-w-2xl mx-auto leading-tight text-center px-4">
              What people in Calgary are doing now
            </h2>
            <p className="text-base md:text-lg text-gray-600">Trending services — book in under 2 minutes</p>
          </div>
          {homepageServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
              {homepageServices.slice(0, 3).map((service) => (
                <Link key={service.id} href={`/services/${service.slug}`} className="group transform hover:-translate-y-2 transition duration-300">
                  <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 h-full flex flex-col">
                    <div className="h-40 sm:h-44 md:h-52 bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center relative">
                      {service.image_url ? (
                        <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl sm:text-6xl md:text-7xl group-hover:scale-110 transition duration-300">{getCategoryIcon(service.category_id)}</span>
                      )}
                      {service.is_popular === 1 && (
                        <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">🔥 Popular</span>
                      )}
                    </div>
                    <div className="p-4 md:p-6 flex-1 flex flex-col">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 group-hover:text-green-700 transition line-clamp-2 min-h-[3.5rem]">{service.name}</h3>
                      {service.short_description && <p className="text-sm md:text-base text-gray-500 mt-1 line-clamp-2">{service.short_description}</p>}
                      <div className="mt-3 flex items-end justify-between">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wider">Starting at</p>
                          <p className="text-xl md:text-2xl font-extrabold text-green-700">${parseFloat(service.base_price).toFixed(0)}</p>
                        </div>
                        <div className="bg-green-100 rounded-full p-2 group-hover:bg-green-600 transition-colors duration-300">
                          <svg className="w-5 h-5 text-green-700 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8"><p className="text-gray-500">No trending services available at the moment.</p></div>
          )}
          <div className="text-center mt-8 md:mt-12 lg:mt-14">
            <Link href="/services" className="inline-flex items-center bg-white border-2 border-green-700 text-green-800 px-6 md:px-8 lg:px-10 py-2 md:py-3 lg:py-4 rounded-full text-sm md:text-base lg:text-lg font-bold shadow-md hover:bg-green-700 hover:text-white transition duration-300">
              View all services
              <svg className="w-4 h-4 md:w-5 md:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Customers Love Life */}
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900">Why Customers Love Life</h2>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-green-600 mt-1">The Work Tap</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-4 md:space-y-6">
              {[
                { title: 'Skilled Local Experts', desc: 'Our platform connects you with experienced tradespeople from your own area, ensuring faster response and dependable service every time.' },
                { title: 'Affordable Service Rates', desc: "We offer transparent and pocket-friendly pricing so you know exactly what you're paying for with no hidden charges." },
                { title: 'Verified & Trusted Pros', desc: 'Every WorkOnTap pro is background-checked, licensed, and reviewed by real customers so you can book with complete confidence.' },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition text-center">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm md:text-base text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="order-first lg:order-last">
              <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
                <img src="/whychooseus.jpg" alt="Why customers love WorkOnTap" className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Work On Top */}
      <section className="py-12 md:py-16 lg:py-20 bg-gray-50" style={{ backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <p className="text-green-600 font-semibold text-base md:text-lg mb-2">Why Choose Work On Top?</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                Your Reliable Partner For Local Trade Services
              </h2>
              <p className="text-gray-600 text-base md:text-lg mb-4 leading-relaxed">
                Work On Top was created to make hiring skilled tradespeople simple, quick, and worry-free. Instead of searching endlessly for a trustworthy electrician, plumber, carpenter, or painter, you can find verified professionals in minutes. Our mission is to offer dependable service that fits your schedule, budget, and expectations.
              </p>
              <p className="text-gray-600 text-base md:text-lg mb-6 leading-relaxed">
                From emergency repairs to planned home improvements, we ensure every job is handled by trained experts committed to quality and safety. With reliable reviews, seamless
              </p>
              <ul className="space-y-2 mb-8">
                {['Enjoy quick booking', 'transparent pricing', 'dependable service'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-700 text-base">
                    <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className="text-4xl">🔧</div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Professional & Simple</h4>
                  <p className="text-gray-600 text-sm md:text-base">Work On Top makes finding reliable home service experts fast and stress-free.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-2xl overflow-hidden shadow-lg h-52 md:h-64">
                <img src="/why-choose.jpg" alt="Plumber working" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-2xl overflow-hidden shadow-lg h-52 md:h-64">
                <img src="/trade-person-working.jpg" alt="Tradesperson working" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

   

      {/* Customer Satisfaction First */}
      <section className="py-12 md:py-20 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="hidden lg:block">
              <img src="/cleaner.png" alt="Cleaner" className="w-full max-w-sm mx-auto object-contain" />
            </div>
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Customer Satisfaction First</h2>
              <div className="w-24 h-1 bg-gray-300 mx-auto lg:mx-0 mb-6"></div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">Experience Service You Can Count On</h3>
              <p className="text-gray-600 text-base md:text-lg mb-8 leading-relaxed">
                At Work On Top, we believe that quality service should be both accessible and trustworthy. Every tradesperson follows high standards of workmanship, ensuring tasks are completed with accuracy, care, and professionalism. Your comfort and satisfaction remain our highest priority throughout the service process.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'Trusted Home Services', 'Fast Service Solutions',
                  'Quality You Deserve', 'Trusted Local Professionals',
                  'Simplify Your Home', 'Hassle-Free Repairs',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-700">
                    <span className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </span>
                    <span className="text-sm md:text-base font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

    

      {/* Trusted by Households & Businesses */}
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Trusted by Households & Businesses</h2>
            <p className="text-gray-600 text-base md:text-lg max-w-3xl mx-auto">
              Thousands of customers depend on Work On Top for timely and professional service. With a growing network of trained and verified tradespeople, we ensure smooth solutions for both everyday tasks and specialised jobs. Our commitment to transparency, reliability, and quality makes us the preferred choice for homes and businesses across the region.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Homeowners', image: '/homeowner.jpg' },
              { label: 'Small Businesses', image: '/small business.jpg' },
              { label: 'Property Managers', image: '/property manager.jpg' },
            ].map((item, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden shadow-lg group h-56 md:h-64 cursor-pointer">
                <img src={item.image} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-white text-green-700 font-bold px-4 py-1.5 rounded-full text-sm md:text-base shadow">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/what_client_says.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4">What Our Customers Say</h2>
            <p className="text-white/80 text-base md:text-lg max-w-3xl mx-auto">
              Our customers appreciate the convenience, professionalism, and high-quality service that Work On Top delivers. Each testimonial reflects real experiences and the trust people place in our platform. Here are some of the reviews shared by clients who rely on our experts for their home and office needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials[testimonialIndex].map((t, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{t.name}</h4>
                    <div className="flex text-yellow-400 text-sm mt-0.5">
                      {'★'.repeat(t.stars)}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">G</div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIndex(i)}
                className={`w-3 h-3 rounded-full transition-all ${testimonialIndex === i ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer/>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}