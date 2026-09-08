'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/Icon';
import AutocompleteComponent from 'react-google-autocomplete';

const Autocomplete = AutocompleteComponent.default || AutocompleteComponent;

export default function ServiceLocationClientPage({
  service,
  serviceLocation,
  serviceId,
  locationSlug,
  locationName,
  allLocations = []
}) {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState(`${locationName}, BC, Canada`);
  const [addressError, setAddressError] = useState('');

  useEffect(() => {
    // If address was saved previously in session, use it if it matches
    const savedAddress = sessionStorage.getItem('userAddress');
    if (savedAddress && savedAddress.toLowerCase().includes(locationName.toLowerCase())) {
      setSelectedAddress(savedAddress);
    }
  }, [locationName]);

  const handleBookNow = () => {
    if (!selectedAddress || selectedAddress.trim() === '') {
      setAddressError('Please confirm your service address');
      return;
    }

    sessionStorage.setItem('selectedServiceId', service?.id);
    sessionStorage.setItem('selectedServiceName', service?.name);
    sessionStorage.setItem('selectedServicePrice', service?.base_price);
    sessionStorage.setItem('userAddress', selectedAddress);
    sessionStorage.setItem('selectedLocationName', locationName);
    sessionStorage.setItem('selectedLocationSlug', locationSlug);
    sessionStorage.setItem('userCity', locationName);

    router.push(`/booking/schedule?service=${service?.id}`);
  };

  const useCases = service?.use_cases
    ? service.use_cases.split(',').map(item => item.trim()).filter(item => item)
    : [];

  const headingText = serviceLocation?.custom_heading || `#1 Rated ${service?.name || 'Home'} Services in ${locationName}, BC`;
  const introText = serviceLocation?.custom_intro || `Looking for top-rated, background-checked ${service?.name?.toLowerCase() || 'home maintenance'} specialists in ${locationName}? WorkOnTap connects you with verified local pros who deliver fast, high-quality service at transparent upfront rates.`;

  const dynamicShortDescription = service?.short_description
    ? service.short_description.replace(new RegExp(service?.name, 'gi'), `${service?.name} in ${locationName}`)
    : '';

  const dynamicDescription = (serviceLocation?.description && serviceLocation.description.trim() !== '')
    ? serviceLocation.description
    : (service?.description
      ? service.description.replace(new RegExp(service?.name, 'gi'), `${service?.name} in ${locationName}`)
      : '');

  if (!service) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Header />
        <div className="container mx-auto px-6 py-20 text-center max-w-xl">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Service Not Found</h2>
          <p className="text-gray-600 mb-8">We couldn&apos;t find the service you&apos;re looking for in {locationName}.</p>
          <Link href="/services" className="inline-flex items-center px-6 py-3 bg-[#16A34A] text-white font-semibold rounded-xl hover:bg-[#15803D] transition">
            Browse All Services
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const getImageUrl = (url) => url && !url.startsWith('http') && !url.startsWith('/') ? '/uploads/' + url : url;

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200 py-3">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex items-center text-sm text-gray-600 flex-wrap gap-1">
            <Link href="/" className="hover:text-[#16A34A] transition">Home</Link>
            <span>›</span>
            <Link href="/services" className="hover:text-[#16A34A] transition">Services</Link>
            <span>›</span>
            <Link href={`/services/${service.slug}`} className="hover:text-[#16A34A] transition">{service.name}</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">{locationName}, BC</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-5xl py-8 md:py-12">
        <div className="w-full">

          {/* Main Content Column */}
          <div>

            {/* Image Banner */}
            <div className="mb-6 md:mb-8 rounded-2xl overflow-hidden shadow-sm border border-slate-100 relative bg-slate-50">
              {service.image_url || service.category_image_url ? (
                <img
                  src={getImageUrl(service.image_url || service.category_image_url)}
                  alt={`${service.name} in ${locationName}`}
                  className="w-full h-auto max-h-[500px] object-cover"
                />
              ) : (
                <div className="aspect-[16/9] w-full flex items-center justify-center bg-gradient-to-br from-[#16A34A]/10 to-[#16A34A]/20">
                  <span className="text-8xl sm:text-9xl">
                    {service.category_icon ? <Icon name={service.category_icon} /> : <Icon name="wrench" />}
                  </span>
                </div>
              )}
              {/* <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full text-xs sm:text-sm font-bold text-[#16A34A] shadow-md border border-emerald-100">
                📍 Serving {locationName}, BC
              </div> */}
            </div>

            {/* Title & Short Description */}
            <div className="mb-8 mt-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
                {serviceLocation?.custom_heading || headingText}
              </h1>
              {(serviceLocation?.custom_intro || introText || dynamicShortDescription) && (
                <p className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium">
                  {serviceLocation?.custom_intro || introText || dynamicShortDescription}
                </p>
              )}
            </div>

            {/* Why Choose Us Grid */}
            {/* <div className="mb-10 bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🛡️</span> Why Hire {service.name} Experts in {locationName} via WorkOnTap?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-2xl">✅</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Verified Local Professionals</h3>
                    <p className="text-xs text-gray-600">Background-checked and rated experts serving {locationName}.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-2xl">💰</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Upfront Pricing</h3>
                    <p className="text-xs text-gray-600">No hidden fees. Starting from ${parseFloat(service.base_price).toFixed(2)}.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Fast Dispatch</h3>
                    <p className="text-xs text-gray-600">Get a confirmed pro scheduled to your address quickly.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Satisfaction Guarantee</h3>
                    <p className="text-xs text-gray-600">Protected by WorkOnTap quality guarantee.</p>
                  </div>
                </div>
              </div>
            </div> */}

            {/* Description & Use Cases */}
            {/* {service.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">About this Service in {locationName}</h2>
                <div 
                  className="prose max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: service.description }}
                />
              </div>
            )} */}


            {dynamicDescription && (
              <div className="bg-white rounded-2xl p-6 md:p-8 mb-8 border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center border-b border-gray-100 pb-3">
                  <span className="bg-[#16A34A] text-white w-7 h-7 rounded-full flex items-center justify-center text-sm mr-2.5 shadow-sm">📋</span>
                  Service Details & Overview
                </h3>
                <div
                  className="rich-text-content text-gray-800 text-base leading-relaxed break-words"
                  dangerouslySetInnerHTML={{ __html: dynamicDescription }}
                />
              </div>
            )}

            {useCases.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Help With</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {useCases.map((useCase, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-gray-800 font-medium text-sm">
                      <span className="text-[#16A34A] font-bold">✓</span> {useCase}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nearby Metro Vancouver Locations for Interlinking */}
            {/* {allLocations.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {service.name} Services in Nearby Metro Vancouver Cities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {allLocations.map((loc, idx) => {
                    if (loc.location_slug === locationSlug) return null;
                    return (
                      <Link
                        key={idx}
                        href={service.slug.includes(loc.location_slug) ? `/services/${service.slug}` : `/services/${service.slug}-${loc.location_slug}`}
                        className="px-3.5 py-1.5 bg-gray-100 hover:bg-[#16A34A] hover:text-white text-gray-700 rounded-lg text-xs font-medium transition"
                      >
                        {service.name} in {loc.location_name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )} */}

          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
