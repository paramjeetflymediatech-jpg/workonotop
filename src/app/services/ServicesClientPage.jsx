'use client';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DirectoryListing from '@/components/DirectoryListing';

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
          : 'bg-white border border-slate-200 text-slate-700 hover:border-[#16A34A] hover:text-[#16A34A] shadow-sm'
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
              ? 'bg-[#16A34A] text-white shadow-lg shadow-[#16A34A]/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-[#16A34A] hover:text-[#16A34A]'
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
          : 'bg-white border border-slate-200 text-slate-700 hover:border-[#16A34A] hover:text-[#16A34A] shadow-sm'
          }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

const METRO_VANCOUVER_LOCATIONS = [
  { name: 'All Locations', slug: 'all' },
  { name: 'Vancouver', slug: 'vancouver' },
  { name: 'Surrey', slug: 'surrey' },
  { name: 'Burnaby', slug: 'burnaby' },
  { name: 'Richmond', slug: 'richmond' },
  { name: 'Coquitlam', slug: 'coquitlam' },
  { name: 'Langley Township', slug: 'langley-township' },
  { name: 'Delta', slug: 'delta' },
  { name: 'Maple Ridge', slug: 'maple-ridge' },
  { name: 'North Vancouver District', slug: 'north-vancouver-district' },
  { name: 'New Westminster', slug: 'new-westminster' },
  { name: 'Port Coquitlam', slug: 'port-coquitlam' },
  { name: 'North Vancouver City', slug: 'north-vancouver-city' },
  { name: 'West Vancouver', slug: 'west-vancouver' },
  { name: 'Port Moody', slug: 'port-moody' },
  { name: 'Langley City', slug: 'langley-city' },
  { name: 'Pitt Meadows', slug: 'pitt-meadows' },
  { name: 'White Rock', slug: 'white-rock' },
  { name: 'Metro Vancouver', slug: 'metro-vancouver' }
];

export default function ServicesClientPage({ 
  initialServices = [], 
  initialCategories = [], 
  initialDirectoryItems = [] 
}) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('vancouver');
  const [searchTerm, setSearchTerm] = useState('');
  const [services, setServices] = useState(Array.isArray(initialServices) ? initialServices : []);
  const [categories, setCategories] = useState(Array.isArray(initialCategories) ? initialCategories : []);
  const [loading, setLoading] = useState(!Array.isArray(initialServices) || initialServices.length === 0);
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
      const yOffset = -120;
      const y = searchArea.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      window.scrollBy({ top: 150, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!initialServices || initialServices.length === 0) {
      fetchData();
    }
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
  }, [activeCategory, searchTerm, selectedLocation]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const servicesRes = await fetch('/api/services', { cache: 'no-store' });
      const categoriesRes = await fetch('/api/categories', { cache: 'no-store' });

      if (servicesRes.ok) {
        const sText = await servicesRes.text();
        if (sText) {
          const servicesData = JSON.parse(sText);
          if (servicesData.success) {
            setServices(servicesData.data || []);
          }
        }
      }

      if (categoriesRes.ok) {
        const cText = await categoriesRes.text();
        if (cText) {
          const categoriesData = JSON.parse(cText);
          if (categoriesData.success) {
            setCategories(categoriesData.data || []);
          }
        }
      }
    } catch (error) {
      console.error('Error loading data in fetchData:', error);
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

    let matchesLocation = true;
    if (selectedLocation !== 'all') {
      const cityKeywords = [
        'vancouver', 'surrey', 'burnaby', 'richmond', 'coquitlam',
        'langley', 'delta', 'maple ridge', 'new westminster',
        'port coquitlam', 'west vancouver', 'port moody',
        'pitt meadows', 'white rock', 'north vancouver', 'metro vancouver'
      ];

      const getBaseCity = (slug) => {
        if (slug.includes('langley')) return 'langley';
        if (slug.includes('north-vancouver')) return 'north vancouver';
        if (slug === 'west-vancouver') return 'west vancouver';
        if (slug === 'port-coquitlam') return 'port coquitlam';
        if (slug === 'port-moody') return 'port moody';
        if (slug === 'pitt-meadows') return 'pitt meadows';
        if (slug === 'maple-ridge') return 'maple ridge';
        if (slug === 'new-westminster') return 'new westminster';
        if (slug === 'white-rock') return 'white rock';
        if (slug === 'metro-vancouver') return 'metro vancouver';
        return slug;
      };

      const baseCity = getBaseCity(selectedLocation);

      const hasOtherLocation = cityKeywords.some(city => {
        if (city === baseCity) return false;

        const serviceNameLower = service.name.toLowerCase();

        if (serviceNameLower.includes(city)) {
          if (city === 'vancouver' &&
            (serviceNameLower.includes('north vancouver') ||
              serviceNameLower.includes('west vancouver') ||
              serviceNameLower.includes('metro vancouver'))) {
            return false;
          }
          if (city === 'coquitlam' && serviceNameLower.includes('port coquitlam')) {
            return false;
          }
          return true;
        }
        return false;
      });

      if (hasOtherLocation) {
        matchesLocation = false;
      }
    }

    return matchesCategory && matchesSearch && matchesLocation;
  });

  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pagedServices = filteredServices.slice(startIndex, endIndex);

  const filterCategories = [
    { id: 'all', name: 'All Services', icon: '✨', image_url: null },
    ...categories.map(cat => ({
      id: cat.id.toString(),
      name: cat.name,
      icon: cat.icon || '🛠️',
      image_url: cat.image_url
    }))
  ];

  if (loading && services.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-[#16A34A]/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const getImageUrl = (url) => url && !url.startsWith('http') && !url.startsWith('/') ? '/uploads/' + url : url;

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      <Header />

      {/* Premium Hero Section */}
      <section className="relative pt-10 pb-20 md:pt-10 md:pb-10 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#16A34A]/5 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#16A34A]/5 rounded-full blur-[120px]"></div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-outfit)] leading-[1.1] mb-8 tracking-tight text-slate-900">
              Your Home, <br />
              <span className="text-transparent bg-clip-text bg-[#16A34A]">Managed with Care.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              Find and book top-rated professionals for maintenance, repairs, and improvements. Transparent pricing and quality guaranteed.
            </p>

            {/* Premium Search Bar */}
            <div id="search-container" className="max-w-2xl mx-auto relative group">
              <div className="absolute -inset-2 bg-[#16A34A]/20 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
              <div className="relative bg-white border border-slate-200 rounded-[2rem] p-2 flex items-center shadow-2xl shadow-slate-200/50 group-focus-within:border-[#16A34A] transition-all duration-300">
                <div className="flex items-center flex-1 px-5">
                  <svg className="w-6 h-6 text-[#16A34A] mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  className="hidden sm:block bg-slate-900 text-white font-bold px-8 py-4 rounded-2xl hover:bg-[#16A34A] transition-all active:scale-95"
                >
                  Find Pros
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section id="services-listing" className="bg-white border-b border-slate-100 py-6">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center items-center overflow-x-auto no-scrollbar pb-1">
            {filterCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 flex items-center gap-2
                  ${activeCategory === category.id
                    ? 'bg-[#16A34A] text-white shadow-lg shadow-[#16A34A]/30 scale-105'
                    : 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-white hover:border-[#16A34A] hover:text-[#16A34A]'
                  }
                `}
              >
                {category.image_url ? (
                  <img src={getImageUrl(category.image_url)} alt={category.name} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <span>
                    {category.icon && category.icon.length > 2 ? (
                      <ion-icon name={category.icon}></ion-icon>
                    ) : (
                      category.icon
                    )}
                  </span>
                )}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Listing */}
      <section className="py-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 font-[family-name:var(--font-outfit)]">
                {activeCategory === 'all'
                  ? searchTerm ? `Results for "${searchTerm}"` : 'All Services'
                  : categories.find(c => c.id === parseInt(activeCategory))?.name
                }
              </h2>
              <p className="text-slate-500 mt-2">
                Showing {filteredServices.length} vetted services
              </p>
            </div>
          </div>

          {filteredServices.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {pagedServices.map((service, idx) => {
                  const category = categories.find(c => c.id === service.category_id);
                  const targetUrl = `/services/${service.slug}`;

                  return (
                    <Link
                      key={`${service.id}-${idx}`}
                      href={targetUrl}
                      className="group flex flex-col bg-white overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-[#16A34A]/5 transition-all duration-500 h-full"
                    >
                      <div className="relative aspect-video overflow-hidden bg-slate-100">
                        {service.image_url || category?.image_url ? (
                          <img
                            src={getImageUrl(service.image_url || category?.image_url)}
                            alt={service.name}
                            className="w-full h-full object-cover transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#16A34A]/10 to-[#16A34A]/20">
                            <span className="text-6xl group-hover:scale-125 transition-transform duration-500">
                              {category?.icon && category.icon.includes('-') ? (
                                <div className="text-[#16A34A] flex">
                                  <ion-icon name={category.icon}></ion-icon>
                                </div>
                              ) : (
                                category?.icon || '🔧'
                              )}
                            </span>
                          </div>
                        )}
                        {category?.name && (
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 border border-white/20">
                            {category.name}
                          </div>
                        )}
                      </div>

                      <div className="p-8 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold text-[#16A34A] group-hover:text-[#16A34A] transition-colors line-clamp-2 min-h-[3.5rem] mb-3">
                          {service.name}
                        </h3>

                        <p className="text-slate-500 text-sm mb-8 line-clamp-2">
                          {service.short_description || "High-quality professional service guaranteed."}
                        </p>

                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                          <div>
                            <span className="text-slate-400 text-xs uppercase tracking-widest block mb-1">Starting from</span>
                            <span className="text-2xl font-black text-[#16A34A]">${parseFloat(service.base_price || 0).toFixed(0)}</span>
                          </div>
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-[#16A34A]">
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
                className="bg-[#16A34A] text-white font-bold px-10 py-5 rounded-2xl hover:bg-[#16A34A]/90 transition-all shadow-xl shadow-[#16A34A]/20 active:scale-95"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Directory Link Section */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Looking for something specific?</h2>
          <p className="text-slate-500 mb-12 max-w-2xl mx-auto">Browse our complete directory of all local trades and services across Canada.</p>

          <DirectoryListing initialItems={initialDirectoryItems} />
        </div>
      </section>

      {/* Premium Trust Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              { title: 'Verified Pros', desc: 'Every professional is background checked and verified.', icon: '🛡️' },
              { title: 'Quality Guaranteed', desc: 'Not happy with the results? We will make it right.', icon: '🏆' },
              { title: 'Transparent Pay', desc: 'Secure payments with no hidden commissions.', icon: '💳' },
            ].map((item, i) => (
              <div key={i} className="text-center group">
                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-3xl mb-6 mx-auto group-hover:bg-[#16A34A]/10 group-hover:scale-110 transition-all duration-500">
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3 font-[family-name:var(--font-outfit)]">{item.title}</h4>
                <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer initialServices={services} />

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
