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
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Home Maintenance');
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // Hero text typing effect states
  const [heroText, setHeroText] = useState('');
  const [isDeletingHero, setIsDeletingHero] = useState(false);
  const [loopNumHero, setLoopNumHero] = useState(0);
  const [typingSpeedHero, setTypingSpeedHero] = useState(100);

  const [homepageServices, setHomepageServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const services = [
    'fridge not cooling', 'leaky faucet', 'electrical outlet not working',
    'washer repair', 'dryer vent cleaning', 'ceiling fan installation',
    'garbage disposal jammed', 'furnace making weird noises',
    'door not closing properly', 'sink clogged'
  ];

  const heroPhrases = [
    'Perfectly Maintained.',
    'Beautifully Upgraded.',
    'Expertly Repaired.',
    'Spotlessly Cleaned.',
    'Professionally Managed',
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

  useEffect(() => {
    let timer;
    const handleTyping = () => {
      const i = loopNumHero % heroPhrases.length;
      const fullText = heroPhrases[i];
      if (!isDeletingHero) {
        setHeroText(fullText.substring(0, heroText.length + 1));
        setTypingSpeedHero(80);
      } else {
        setHeroText(fullText.substring(0, heroText.length - 1));
        setTypingSpeedHero(40);
      }
      if (!isDeletingHero && heroText === fullText) {
        setTimeout(() => setIsDeletingHero(true), 2000);
      } else if (isDeletingHero && heroText === '') {
        setIsDeletingHero(false);
        setLoopNumHero(loopNumHero + 1);
        setTypingSpeedHero(80);
      }
    };
    timer = setTimeout(handleTyping, typingSpeedHero);
    return () => clearTimeout(timer);
  }, [heroText, isDeletingHero, loopNumHero, typingSpeedHero, heroPhrases]);

  const handleSearchClick = () => {
    if (searchTerm.trim()) {
      router.push(`/services?search=${encodeURIComponent(searchTerm)}`);
    } else {
      router.push('/services');
    }
  };
  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearchClick(); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16  border-green-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900 overflow-x-hidden">
      <Header />

      {/* Unique Hero Section */}
      <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden bg-white">

        <div className="container mx-auto px-6 max-w-7xl relative z-10 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Content */}
            <div className="flex-1 text-center lg:text-left relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/30 text-[#15803D] text-sm font-medium mb-6 backdrop-blur-sm animate-fadeIn">
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brandLight opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
  </span>
  5,000+ Verified Pros Ready
</div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-[family-name:var(--font-outfit)] leading-[1.1] mb-8 tracking-tight min-h-[100px] md:min-h-[140px] lg:min-h-[160px]">
                Your Home, <br />
                <span className="text-transparent bg-clip-text bg-[#15803D]">
                  {heroText || '\u00A0'}
                </span>
                <span className="text-emerald-400 animate-pulse">|</span>
              </h1>

              <p className="text-lg md:text-xl mb-10 max-w-xl lg:mx-0 mx-auto leading-relaxed">
                Connect with the city&apos;s finest tradespeople in minutes.
                Transparent pricing, instant booking, and guaranteed quality.
              </p>

              {/* Floating Search Bar */}
              {/* <div className="relative max-w-2xl lg:mx-0 mx-auto group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div
                  className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex items-center hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-center flex-1 px-4 py-3">
                    <svg className="w-6 h-6 text-emerald-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder={placeholder || 'What do you need fixed?'}
                      className="w-full bg-transparent border-none outline-none text-white placeholder:text-slate-400 text-lg md:text-xl"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <button onClick={handleSearchClick} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold px-4 sm:px-8 py-2 sm:py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 text-sm sm:text-base mr-2 sm:mr-0">
                    Search
                  </button>
                </div>
              </div> */}


              <div className="relative max-w-2xl lg:mx-0 mx-auto group">
  
  {/* Glow Border */}
  <div className="absolute -inset-1 rounded-2xl opacity-30 group-hover:opacity-60 transition duration-700"
    style={{
      background: "linear-gradient(90deg, #15803D, #22c55e)"
    }}
  ></div>

  {/* Main Box */}
  <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 flex items-center hover:bg-white/15 transition-all duration-300">

    {/* Input Area */}
    <div className="flex items-center flex-1 px-4 py-3">
      
      {/* Icon */}
      <svg
        className="w-6 h-6 mr-3"
        style={{ color: "#15803D" }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Input */}
      <input
        type="text"
        placeholder={placeholder || 'What do you need fixed?'}
        className="w-full bg-transparent border-none outline-none text-black placeholder:text-black text-lg md:text-xl"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>

    {/* Button */}
    <button
      onClick={handleSearchClick}
      className="font-bold px-4 sm:px-8 py-2 sm:py-3 rounded-xl transition-all active:scale-95 text-sm sm:text-base mr-2 sm:mr-0"
      style={{
        backgroundColor: "#15803D",
        color: "#ECFDF5",
        boxShadow: "0 10px 25px rgba(21, 128, 61, 0.4)"
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#166534"}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#15803D"}
    >
      Search
    </button>

  </div>
</div>

              <div className="mt-8 flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  No hidden fees
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Certified Experts
                </div>
              </div>
            </div>

            {/* Right Side - Responsive Background/Visual */}
            <div className="absolute inset-0 z-0 lg:relative lg:flex-1 lg:z-10 mt-12 lg:mt-0 overflow-hidden lg:overflow-visible opacity-25 lg:opacity-100 flex items-center lg:justify-end justify-center">
              {/* White Gradient Background behind image */}
              <div className="absolute inset-x-0 lg:inset-0 transform scale-150 lg:scale-110"></div>

              <div className="relative z-10 w-full transition-all duration-500 group flex items-center justify-center">
                <img
                  src="/hero-sphere.png"
                  alt="Quality Service Guaranteed"
                  className="object-contain lg:object-cover lg:scale-105 group-hover:scale-100 transition-transform duration-700"
                />
              </div>

              {/* Floating Decorative Elements (Desktop only) */}
              {/* <div className="absolute top-1/2 -right-12 w-32 h-32 bg-white/10 rounded-full blur-3xl -z-10 animate-pulse hidden lg:block"></div>
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -z-10 hidden lg:block"></div> */}
            </div>
          </div>
        </div>

        {/* Bottom Curve */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10 translate-y-[1px]">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* Sleek Ticker/Stats Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="group">
              <div className="text-4xl md:text-6xl font-light text-slate-900 mb-2 font-[family-name:var(--font-outfit)] group-hover:text-[#15803D] transition-colors duration-500">500k<span className="text-[#15803D] font-bold">+</span></div>
              <div className="text-slate-500 uppercase tracking-[0.2em] text-sm font-semibold">Jobs Completed Locally</div>
              <div className="w-12 h-0.5 bg-slate-200 mx-auto mt-6 group-hover:w-24 group-hover:bg-[#15803D] transition-all duration-500"></div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-6xl font-light text-slate-900 mb-2 font-[family-name:var(--font-outfit)] group-hover:text-[#15803D] transition-colors duration-500">96<span className="text-[#15803D] font-bold">%</span></div>
              <div className="text-slate-500 uppercase tracking-[0.2em] text-sm font-semibold">Client Satisfaction</div>
              <div className="w-12 h-0.5 bg-slate-200 mx-auto mt-6 group-hover:w-24 group-hover:bg-[#15803D] transition-all duration-500"></div>
            </div>
            <div className="group">
              <div className="text-4xl md:text-6xl font-light text-slate-900 mb-2 font-[family-name:var(--font-outfit)] group-hover:text-[#15803D] transition-colors duration-500">4.8<span className="text-[#15803D] font-bold">★</span></div>
              <div className="text-slate-500 uppercase tracking-[0.2em] text-sm font-semibold">Average Pro Rating</div>
              <div className="w-12 h-0.5 bg-slate-200 mx-auto mt-6 group-hover:w-24 group-hover:bg-[#15803D] transition-all duration-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Video "How it Works" Section */}
      <section className="py-12 bg-white relative">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-5xl mx-auto">
            <div className="relative rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border-[12px] border-white group">
              <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>
              <video 
                src="/video/how-it-works.mp4" 
                className="w-full h-auto object-cover"
                autoPlay 
                muted 
                loop 
                playsInline
                controls
              />
            </div>
          </div>
        </div>
      </section>

      {/* Interactive "How it Works" */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-2xl mx-auto text-center mb-12 md:mb-20">
            <span className="text-emerald-600 font-bold tracking-widest uppercase text-xs md:text-sm mb-3 md:mb-4 block">Process</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 font-[family-name:var(--font-outfit)] leading-tight">How WorkOnTap works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '01', title: 'Request Service', desc: 'Describe your job and preferred schedule in minutes.' },
              { icon: '02', title: 'Instant Match', desc: 'We pair you with the best-rated pros in your local area.' },
              { icon: '03', title: 'Professional Fix', desc: 'Your pro arrives equipped and ready to handle the job.' },
              { icon: '04', title: 'Seamless Pay', desc: 'Secure digital payment and job history saved for later.' },
            ].map((step, i) => (
              <div key={i} className="group relative">
                <div className="bg-slate-50 rounded-[2rem] p-10 h-full border border-slate-100 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500 group-hover:-translate-y-2">
                  <div className="text-5xl font-black text-slate-200 group-hover:text-emerald-100 transition-colors mb-6 font-[family-name:var(--font-outfit)]">{step.icon}</div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-slate-200 z-10"></div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-20 text-center">
            <Link href="/services" className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl active:scale-95 group">
              Start Your First Booking
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Asymmetrical Service Grid */}
      <section className="py-24 bg-slate-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-4 md:gap-6">
            <div className="max-w-2xl">
              <span className="text-emerald-600 font-bold tracking-widest uppercase text-xs md:text-sm mb-3 md:mb-4 block">Hot Right Now</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 font-[family-name:var(--font-outfit)] leading-tight">Trending in Metro Vancouver</h2>
            </div>
            <Link href="/services" className="text-slate-900 text-sm md:text-base font-bold border-b-2 border-emerald-500 pb-1 hover:text-emerald-600 hover:border-emerald-600 transition-all">
              View All Services →
            </Link>
          </div>

          {homepageServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-8">
              {homepageServices.slice(0, 3).map((service, i) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className={`group relative overflow-hidden rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-700 ${i === 0 ? 'md:col-span-3 lg:col-span-7 h-[500px]' :
                    i === 1 ? 'md:col-span-3 lg:col-span-5 h-[500px]' :
                      'md:col-span-6 lg:col-span-12 h-[400px]'
                    }`}
                >
                  <div className="absolute inset-0">
                    <img
                      src={service.image_url || '/images/hero-default.jpg'}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
                  </div>

                  <div className="absolute inset-0 p-10 flex flex-col justify-end">
                    <div className="flex items-center gap-3 mb-4">
                      {service.is_popular === 1 && (
                        <span className="px-3 py-1 bg-amber-400 text-slate-900 text-xs font-bold rounded-full uppercase tracking-tighter">Popular</span>
                      )}
                      <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium rounded-full uppercase">Home Care</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight group-hover:text-emerald-400 transition-colors">{service.name}</h3>
                    <p className="text-slate-300 mb-6 max-w-lg line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{service.short_description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <span className="text-slate-400 text-sm block mb-1">Starting from</span>
                        <span className="text-2xl font-bold">${parseFloat(service.base_price).toFixed(0)}</span>
                      </div>
                      <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-white transition-colors duration-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 text-xl">Curating best services for you...</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us & Premium Testimonials Combined */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
            <div>
              <span className="text-emerald-600 font-bold tracking-widest uppercase text-sm mb-4 block">Our Story</span>
              <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 font-[family-name:var(--font-outfit)]">Quality you can <br /> trust, every time.</h2>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed">
                WorkOnTap was built on a simple promise: providing reliable, high-quality home maintenance that doesn&apos;t break the bank.
                We&apos;ve vetted thousands of pros so you don&apos;t have to.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { title: 'Vetted Pros', desc: 'Background checked and verified.' },
                  { title: 'Flat Pricing', desc: 'No hidden fees or surprises.' },
                  { title: 'Fast Results', desc: 'Average 10 min response time.' },
                  { title: 'Quality Guarantee', desc: 'We stand by every job.' },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-2 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <div className="text-sm text-slate-500">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl skew-y-1">
                <img src="/whychooseus.jpg" alt="Quality Work" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-[#16A34A] text-slate-900 p-8 rounded-[2rem] shadow-xl max-w-xs hidden md:block text-white">
                <div className="text-4xl font-black mb-2">10+</div>
                <div className="font-bold">Service Categories</div>
                <div className="text-sm opacity-80">Covering everything from plumbing to landscaping.</div>
              </div>
            </div>
          </div>

          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 font-[family-name:var(--font-outfit)]">Voices of Trust</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials[testimonialIndex].map((t, i) => (
              <div key={i} className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 relative group overflow-hidden hover:bg-white hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <svg className="w-20 h-20 text-slate-900" fill="currentColor" viewBox="0 0 32 32"><path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-2.2 1.8-4 4-4V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-2.2 1.8-4 4-4V8z" /></svg>
                </div>
                <div className="relative z-10">
                  <div className="flex text-amber-400 mb-6">
                    {[...Array(t.stars)].map((_, i) => (
                      <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p className="text-xl text-slate-700 italic mb-8 leading-relaxed">&quot;{t.text}&quot;</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#16A34A] flex items-center justify-center text-white font-bold ">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{t.name}</div>
                      <div className="text-sm text-slate-500">Verified Customer</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3 mt-12">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIndex(i)}
                className={`h-2 transition-all duration-300 rounded-full ${testimonialIndex === i ? 'w-12 bg-emerald-500' : 'w-4 bg-slate-200 hover:bg-slate-300'}`}
              />
            ))}
          </div>
        </div>
      </section>

      <Footer />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        :global(html, body) {
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
}