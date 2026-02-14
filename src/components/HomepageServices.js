// src/components/HomepageServices.js
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomepageServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomepageServices();
  }, []);

  const fetchHomepageServices = async () => {
    try {
      const res = await fetch('/api/services?homepage=true&limit=3');
      const data = await res.json();
      if (data.success) {
        setServices(data.data || []);
      }
    } catch (error) {
      console.error('Error loading homepage services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fallback services agar koi select nahi kiya
  const displayServices = services.length > 0 ? services : [
    { id: 'handyman', name: 'Handyman Services', icon: '🔨', base_price: 69, slug: 'handyman' },
    { id: 'electrical', name: 'Electrical', icon: '💡', base_price: 89, slug: 'electrical' },
    { id: 'plumbing', name: 'Plumbing', icon: '🔧', base_price: 99, slug: 'plumbing' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-green-50/50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-8 md:mb-12 lg:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2 md:mb-4">
            What people in Calgary are doing now
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            Trending services — book in under 2 minutes
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {displayServices.map((service) => (
            <Link 
              key={service.id}
              href={`/services/${service.slug}`}
              className="group transform hover:-translate-y-2 transition duration-300"
            >
              <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100">
                <div className="h-40 sm:h-44 md:h-48 bg-gradient-to-r from-green-100 to-green-200 flex items-center justify-center relative">
                  {service.image_url ? (
                    <img 
                      src={service.image_url} 
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl sm:text-6xl md:text-7xl group-hover:scale-110 transition duration-300">
                      {service.category_icon || service.icon || '🔧'}
                    </span>
                  )}
                </div>
                <div className="p-4 md:p-6">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 group-hover:text-green-700 transition">
                    {service.name}
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 mt-1">
                    {service.short_description || 'Professional service'}
                  </p>
                  <span className="inline-block mt-2 md:mt-4 text-sm md:text-base text-green-600 font-semibold">
                    Starting at ${parseFloat(service.base_price || 0).toFixed(0)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-8 md:mt-12 lg:mt-14">
          <Link 
            href="/services" 
            className="inline-flex items-center bg-white border-2 border-green-700 text-green-800 px-6 md:px-8 lg:px-10 py-2 md:py-3 lg:py-4 rounded-full text-sm md:text-base lg:text-lg font-bold shadow-md hover:bg-green-700 hover:text-white transition duration-300"
          >
            View all services
            <svg className="w-4 h-4 md:w-5 md:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}