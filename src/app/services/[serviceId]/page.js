// app/services/[serviceId]/page.js - Service Detail Page
// ✅ FIXED - Next.js 15 params Promise issue resolved
// ✅ Uses React.use() to unwrap params

'use client';

import Link from 'next/link';
import { useState, useEffect, use } from 'react'; // 👈 use import karo
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function ServiceDetailPage({ params }) {
  // 👇 Params ko unwrap karo using React.use()
  const unwrappedParams = use(params);
  const serviceId = unwrappedParams.serviceId;
  
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('123 8 Avenue Southwest, Suite 504, Calgary AB');
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState(selectedAddress);
  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (serviceId) {  // 👈 ab serviceId use karo
      fetchServiceData();
    }
  }, [serviceId]);  // 👈 ab serviceId use karo

  const fetchServiceData = async () => {
    setLoading(true);
    try {
      // Service fetch karo slug ke saath
      const serviceRes = await fetch(`/api/services?slug=${serviceId}`);
      const serviceData = await serviceRes.json();
      
      if (serviceData.success && serviceData.data) {
        setService(serviceData.data);
        
        // Related services fetch karo (same category)
        if (serviceData.data.category_id) {
          const relatedRes = await fetch(`/api/services?category_id=${serviceData.data.category_id}`);
          const relatedData = await relatedRes.json();
          if (relatedData.success) {
            // Current service ko hatao aur limit 4 rakho
            const filtered = relatedData.data
              .filter(s => s.id !== serviceData.data.id)
              .slice(0, 4);
            setRelatedServices(filtered);
          }
        }
      } else {
        // Service nahi mili to redirect
        router.push('/services');
      }
    } catch (error) {
      console.error('Error loading service:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleAddressSave = () => {
    setSelectedAddress(tempAddress);
    setAddressModalOpen(false);
  };

  // Parse use cases from comma-separated string
  const useCases = service?.use_cases 
    ? service.use_cases.split(',').map(item => item.trim()).filter(item => item)
    : [];

  // Safe price formatting
  const formatPrice = (price) => {
    if (!price) return '0.00';
    return parseFloat(price).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Service not found</h2>
          <Link href="/services" className="text-green-700 hover:underline">
            Browse all services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans antialiased">
     <Header/>
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-200 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center text-sm text-gray-600">
            <Link href="/" className="hover:text-green-700 transition">Home</Link>
            <span className="mx-2">›</span>
            <Link href="/services" className="hover:text-green-700 transition">Services</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900 font-medium">{service.name}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Left Column - Service Details */}
          <div className="lg:col-span-2">
            {/* Hero Image */}
            <div className="mb-6 md:mb-8 rounded-2xl overflow-hidden shadow-lg">
              <div className="h-56 sm:h-64 md:h-72 flex items-center justify-center relative bg-gradient-to-br from-green-100 to-emerald-100">
                {service.image_url ? (
                  <img 
                    src={service.image_url} 
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-8xl sm:text-9xl md:text-[10rem] drop-shadow-xl">
                    {service.category_icon || '🔧'}
                  </span>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 shadow-md border border-gray-200">
                  <span className="text-green-700 font-bold">{service.category_name || 'General'}</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
                {service.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-green-700 font-semibold">⚡ Get a confirmed job in minutes</span>
              </div>
            </div>

            {/* Description */}
            {service.description && (
              <div className="bg-green-50/50 rounded-2xl p-6 md:p-8 mb-8 border border-green-100">
                <p className="text-gray-800 text-lg leading-relaxed">
                  {service.description}
                </p>
              </div>
            )}

            {/* Customers Use This Service For */}
            {useCases.length > 0 && (
              <div className="mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <span className="bg-green-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg mr-3">✓</span>
                  Customers use this service for
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {useCases.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-green-50 transition">
                      <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-800 font-medium">{item}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-6 text-gray-700 text-lg flex items-center">
                  <span className="text-2xl mr-2">💬</span>
                  Not sure if this is the right service for you? 
                  <Link href="/chat" className="font-bold text-green-700 underline ml-2 hover:text-green-800 transition decoration-2 underline-offset-4">
                    Chat with us
                  </Link>
                </p>
              </div>
            )}

            {/* How It Works */}
            <div className="mb-10 bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <span className="bg-green-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg mr-3">⚡</span>
                How WorkOnTap works
              </h2>
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-700 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-md">1</div>
                  <div className="pt-1">
                    <h3 className="font-bold text-xl text-gray-800 mb-2">Tell us what you need</h3>
                    <p className="text-gray-600">Select a date, time, and describe your job — takes 2 minutes.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-700 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-md">2</div>
                  <div className="pt-1">
                    <h3 className="font-bold text-xl text-gray-800 mb-2">Get matched instantly</h3>
                    <p className="text-gray-600">Submit your request and get matched with a certified WorkOnTap pro in minutes — average 10 min response.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-green-700 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-md">3</div>
                  <div className="pt-1">
                    <h3 className="font-bold text-xl text-gray-800 mb-2">Chat & confirm</h3>
                    <p className="text-gray-600">Discuss details with your pro before the job begins. Pay securely after you&apos;re 100% satisfied.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Protection Promise */}
            <div className="bg-gradient-to-br from-green-800 to-green-700 rounded-2xl p-6 md:p-8 text-white shadow-xl">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="text-6xl">🛡️</div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-2xl font-bold mb-2">Homeowner Protection Promise</h3>
                  <p className="text-green-100 mb-4">
                    Every WorkOnTap pro is licensed, background-checked, and well-rated. 
                    If your experience isn&apos;t perfect, we&apos;ll make it right — 100% guaranteed.
                  </p>
                  <Link href="/guarantee" className="inline-flex items-center bg-white text-green-800 px-6 py-3 rounded-full font-semibold hover:bg-green-50 transition shadow-lg">
                    Learn more
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl border-2 border-green-100 overflow-hidden shadow-xl hover:shadow-2xl transition-shadow">
                <div className="bg-gradient-to-r from-green-800 to-green-700 px-6 py-5">
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    <span className="mr-2">📋</span>
                    Book this job
                  </h3>
                  <p className="text-green-100 text-sm mt-1">Get a confirmed pro in minutes</p>
                </div>
                
                <div className="p-6">
                  {/* Pricing */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2 flex items-center">
                      <span className="text-green-700 mr-1">✓</span> 
                      Transparent, upfront pricing
                      <Link href="/pricing" className="text-green-700 underline ml-1 text-xs font-medium">
                        Learn more
                      </Link>
                    </p>
                    
                    <div className="bg-green-50 rounded-xl p-5 border-2 border-green-200">
                      <div className="text-center">
                        <div className="text-sm uppercase tracking-wider text-gray-600 mb-1">Starting at</div>
                        <div className="text-4xl md:text-5xl font-extrabold text-green-800">
                          ${formatPrice(service.base_price)}
                        </div>
                        <div className="text-sm text-gray-600 mt-2">For the first appointment</div>
                        {service.additional_price > 0 && (
                          <>
                            <div className="border-t border-green-200 my-3"></div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Additional</span>
                              <span className="font-bold text-green-800">+${formatPrice(service.additional_price)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Duration */}
                  {service.duration_minutes && (
                    <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-medium text-gray-800">Duration</span>
                        </div>
                        <span className="text-green-700 font-semibold">
                          {service.duration_minutes} minutes
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-800 mb-2 flex items-center">
                      <svg className="w-5 h-5 text-green-700 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Where do you need service?
                    </label>
                    <div 
                      className="flex items-center p-3 border-2 border-gray-200 rounded-xl hover:border-green-500 transition cursor-pointer bg-white"
                      onClick={() => setAddressModalOpen(true)}
                    >
                      <span className="text-sm flex-1 line-clamp-1">{selectedAddress}</span>
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ✓ Your address is kept private until you accept a pro
                    </p>
                  </div>

                  {/* CTA Button */}
                  <Link href={`/booking/schedule?service=${service.id}`}>
                    <button className="w-full bg-gradient-to-r from-green-700 to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:from-green-800 hover:to-green-700 transition-all duration-300 transform hover:scale-[1.02]">
                      Get Started — Free Quote
                    </button>
                  </Link>

                  <p className="text-xs text-center text-gray-500 mt-3 flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    You won&apos;t be charged until the job is complete
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {addressModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-fadeIn">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Enter your address</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Street address</label>
              <input 
                type="text" 
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                value={tempAddress}
                onChange={(e) => setTempAddress(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleAddressSave}
                className="flex-1 bg-green-700 text-white py-3 rounded-xl font-semibold hover:bg-green-800 transition"
              >
                Save address
              </button>
              <button 
                onClick={() => setAddressModalOpen(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Related Services */}
      {relatedServices.length > 0 && (
        <section className="bg-gray-50/80 py-12 md:py-16 mt-8 border-t border-gray-200">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              You might also need
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedServices.map((item) => (
                <Link 
                  key={item.id}
                  href={`/services/${item.slug}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="h-32 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-5xl group-hover:scale-110 transition-transform">
                        {item.category_icon || '🔧'}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 group-hover:text-green-700 transition line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-green-700 font-semibold text-sm mt-1">
                      Starting at ${formatPrice(item.base_price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
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
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}