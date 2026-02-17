'use client';

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
  
  // State for dynamic homepage services
  const [homepageServices, setHomepageServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const services = [
    'fridge not cooling',
    'leaky faucet',
    'electrical outlet not working',
    'washer repair',
    'dryer vent cleaning',
    'ceiling fan installation',
    'garbage disposal jammed',
    'furnace making weird noises',
    'door not closing properly',
    'sink clogged'
  ];

  // Fetch homepage services and categories
  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    setLoading(true);
    try {
      // Fetch services with is_homepage = 1
      const servicesRes = await fetch('/api/services?is_homepage=1');
      const servicesData = await servicesRes.json();

      // Fetch categories for icons
      const categoriesRes = await fetch('/api/categories');
      const categoriesData = await categoriesRes.json();

      if (servicesData.success) {
        setHomepageServices(servicesData.data || []);
      }

      if (categoriesData.success) {
        setCategories(categoriesData.data || []);
      }
    } catch (error) {
      console.error('Error loading homepage data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get category icon
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

  const handleSearchClick = () => {
    router.push('/services');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      router.push('/services');
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

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
                    readOnly
                    value=""
                    onClick={handleSearchClick}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
              
              <p className="text-white/90 text-sm sm:text-base md:text-lg mt-4 text-center lg:text-left flex items-center gap-2 justify-center lg:justify-start">
                <span className="text-xl sm:text-2xl">🔍</span> 
                <span className="font-medium">Click search or press Enter — see all services</span>
              </p>

              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 justify-center lg:justify-start">
                <p className="text-white/95 text-base sm:text-lg md:text-xl flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">📌</span>
                  Need help finding the right service? 
                  <Link href="/chat" className="font-bold underline ml-1 hover:text-green-200 transition decoration-2 underline-offset-4">
                    Chat with us
                  </Link>
                </p>
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
                    <div className="w-10 h-10 xl:w-14 xl:h-14 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-lg xl:text-2xl">👩‍🔧</div>
                    <div className="w-10 h-10 xl:w-14 xl:h-14 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-lg xl:text-2xl">👨‍🔧</div>
                    <div className="w-10 h-10 xl:w-14 xl:h-14 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-lg xl:text-2xl">👩‍🏭</div>
                    <div className="w-10 h-10 xl:w-14 xl:h-14 rounded-full bg-white/30 border-2 border-white flex items-center justify-center text-lg xl:text-2xl">👨‍🏭</div>
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

      <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-white to-green-50/30">
        <div className="container mx-auto px-4 text-center">
          <span className="text-green-700 font-semibold text-sm sm:text-base md:text-lg uppercase tracking-wider bg-green-100 px-3 sm:px-4 py-1 sm:py-2 rounded-full">Simple & fast</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mt-4 sm:mt-6 mb-8 sm:mb-12 md:mb-16 text-gray-900">
            How WorkOnTap works
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition border border-gray-100 flex flex-col items-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl mb-4 md:mb-6 text-green-700 group-hover:scale-110 group-hover:bg-green-200 transition duration-300">
                📋
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 md:mb-3">1. Tell us what you need</h3>
              <p className="text-sm sm:text-base text-gray-600">Choose date, time, and describe your job — takes 2 minutes.</p>
            </div>
            <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition border border-gray-100 flex flex-col items-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl mb-4 md:mb-6 text-green-700 group-hover:scale-110 group-hover:bg-green-200 transition duration-300">
                📱
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 md:mb-3">2. Instant matches</h3>
              <p className="text-sm sm:text-base text-gray-600">We find nearby certified pros — average 10 min response.</p>
            </div>
            <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition border border-gray-100 flex flex-col items-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl mb-4 md:mb-6 text-green-700 group-hover:scale-110 group-hover:bg-green-200 transition duration-300">
                👨‍🔧
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 md:mb-3">3. Pro arrives & fixes it</h3>
              <p className="text-sm sm:text-base text-gray-600">Relax while your WorkOnTap pro handles everything.</p>
            </div>
            <div className="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl transition border border-gray-100 flex flex-col items-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-green-100 rounded-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl mb-4 md:mb-6 text-green-700 group-hover:scale-110 group-hover:bg-green-200 transition duration-300">
                💚
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 md:mb-3">4. Pay & review</h3>
              <p className="text-sm sm:text-base text-gray-600">Secure payment, receipt, and job history all in one place.</p>
            </div>
          </div>

          <Link href="/services" className="mt-8 sm:mt-12 md:mt-16 inline-flex items-center bg-green-700 text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold shadow-xl hover:bg-green-800 hover:scale-105 transition duration-300">
            Start booking my service
            <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-green-50 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 border border-green-100 shadow-xl hover:shadow-2xl transition">
                <div className="flex items-center space-x-2 md:space-x-3 text-green-800 mb-4 md:mb-6">
                  <div className="p-2 md:p-3 bg-green-200 rounded-full">
                    <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xl md:text-2xl font-bold">Homeowner Protection Promise</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 md:mb-4 leading-tight">
                  Guaranteed jobs by certified professionals.
                </h2>
                <p className="text-base md:text-lg text-gray-700 mb-4 md:mb-6 leading-relaxed">
                  Every WorkOnTap pro is licensed, background-checked, and well-rated. 
                  If your experience isn&apos;t perfect, we&apos;ll make it right — <span className="font-semibold text-green-700">100% guaranteed.</span>
                </p>
                <Link href="/guarantee" className="inline-flex items-center bg-green-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-semibold shadow-md hover:bg-green-800 transition text-sm md:text-base">
                  Learn more about our promise
                  <svg className="w-3 h-3 md:w-4 md:h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
            <div className="order-1 lg:order-2 flex justify-center">
              <div className="relative w-full max-w-sm md:max-w-md">
                <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl md:rounded-3xl p-1 shadow-2xl">
                  <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 flex flex-col items-center">
                    <span className="text-6xl md:text-8xl mb-3 md:mb-4">🛡️</span>
                    <h3 className="text-xl md:text-2xl font-bold text-green-800">WorkOnTap Verified</h3>
                    <p className="text-center text-gray-600 text-sm md:text-base mt-2">Every pro is screened, insured, and reviewed</p>
                    <div className="flex mt-3 md:mt-4 space-x-1 md:space-x-2 text-xs md:text-sm">
                      <span className="text-green-600">✓</span><span> License check</span>
                      <span className="text-green-600 ml-2 md:ml-3">✓</span><span> Background</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 md:-bottom-5 md:-right-5 bg-yellow-400 text-black font-bold py-1 px-3 md:py-2 md:px-5 rounded-full shadow-lg text-xs md:text-sm">
                  Trusted since 2022
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DYNAMIC SERVICES SECTION - Only shows services with is_homepage = 1 */}
      <section className="py-12 md:py-16 lg:py-20 bg-green-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2 md:mb-4">
              What people in Calgary are doing now
            </h2>
            <p className="text-base md:text-lg text-gray-600">Trending services — book in under 2 minutes</p>
          </div>
          
          {homepageServices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
              {homepageServices.slice(0, 3).map((service) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group transform hover:-translate-y-2 transition duration-300"
                >
                  <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 h-full flex flex-col">
                    {/* Image/Icon area */}
                    <div className="h-40 sm:h-44 md:h-52 bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center relative">
                      {service.image_url ? (
                        <img
                          src={service.image_url}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl sm:text-6xl md:text-7xl group-hover:scale-110 transition duration-300">
                          {getCategoryIcon(service.category_id)}
                        </span>
                      )}
                      {/* Popular badge if is_popular is true */}
                      {service.is_popular === 1 && (
                        <span className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                          🔥 Popular
                        </span>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 md:p-6 flex-1 flex flex-col">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 group-hover:text-green-700 transition line-clamp-2 min-h-[3.5rem]">
                        {service.name}
                      </h3>
                      
                      {service.short_description && (
                        <p className="text-sm md:text-base text-gray-500 mt-1 line-clamp-2">
                          {service.short_description}
                        </p>
                      )}
                      
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
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            // Fallback if no homepage services - show nothing or a message
            <div className="text-center py-8">
              <p className="text-gray-500">No trending services available at the moment.</p>
            </div>
          )}
          
          <div className="text-center mt-8 md:mt-12 lg:mt-14">
            <Link href="/services" className="inline-flex items-center bg-white border-2 border-green-700 text-green-800 px-6 md:px-8 lg:px-10 py-2 md:py-3 lg:py-4 rounded-full text-sm md:text-base lg:text-lg font-bold shadow-md hover:bg-green-700 hover:text-white transition duration-300">
              View all services
              <svg className="w-4 h-4 md:w-5 md:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-300 pt-12 md:pt-16 pb-6 md:pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-8">
            <div className="sm:col-span-2 lg:col-span-2">
              <Link href="/" className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                WorkOnTap
              </Link>
              <p className="text-gray-400 mt-3 md:mt-4 max-w-xs text-sm md:text-base leading-relaxed">
                Trusted local tradespeople, booked on demand. Free quotes, verified reviews, 100% guaranteed.
              </p>
              <div className="flex space-x-4 md:space-x-5 mt-4 md:mt-6">
                <a href="#" className="text-gray-400 hover:text-white text-xl md:text-2xl transition"><i className="fab fa-facebook"></i></a>
                <a href="#" className="text-gray-400 hover:text-white text-xl md:text-2xl transition"><i className="fab fa-twitter"></i></a>
                <a href="#" className="text-gray-400 hover:text-white text-xl md:text-2xl transition"><i className="fab fa-instagram"></i></a>
                <a href="#" className="text-gray-400 hover:text-white text-xl md:text-2xl transition"><i className="fab fa-linkedin"></i></a>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold text-base md:text-lg mb-3 md:mb-4">For homeowners</h4>
              <ul className="space-y-2 md:space-y-3 text-sm md:text-base">
                <li><Link href="/services" className="hover:text-white transition">Explore Services</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white transition">How it works</Link></li>
                <li><Link href="/reviews" className="hover:text-white transition">Reviews</Link></li>
                <li><Link href="/app" className="hover:text-white transition">Get the app</Link></li>
                <li><Link href="/help" className="hover:text-white transition">Help Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold text-base md:text-lg mb-3 md:mb-4">For pros</h4>
              <ul className="space-y-2 md:space-y-3 text-sm md:text-base">
                <li><Link href="/pro-signup" className="hover:text-white transition">Become a pro</Link></li>
                <li><Link href="/pro-login" className="hover:text-white transition">Pro login</Link></li>
                <li><Link href="/pro-guidelines" className="hover:text-white transition">Pro guidelines</Link></li>
                <li><Link href="/insurance" className="hover:text-white transition">Insurance</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold text-base md:text-lg mb-3 md:mb-4">Company</h4>
              <ul className="space-y-2 md:space-y-3 text-sm md:text-base">
                <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/careers" className="hover:text-white transition">Careers</Link></li>
                <li><Link href="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="/press" className="hover:text-white transition">Press</Link></li>
                <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-10 md:mt-14 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center text-xs md:text-sm text-gray-500">
            <p>© 2026 WorkOnTap Inc. All rights reserved.</p>
            <div className="flex space-x-4 md:space-x-6 mt-3 md:mt-0">
              <Link href="/terms" className="hover:text-white transition">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link href="/guarantee" className="hover:text-white transition">Guarantee</Link>
              <Link href="/sitemap" className="hover:text-white transition">Sitemap</Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
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