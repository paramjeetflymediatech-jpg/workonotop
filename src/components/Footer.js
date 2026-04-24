'use client';

import Link from 'next/link';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log('Footer: Fetching services...');
        const res = await fetch('/api/services');
        console.log('Footer: Services status:', res.status);
        const data = await res.json();
        if (data.success) {
          setServices(data.data?.slice(0, 6) || []);
        }
      } catch (error) {
        console.error('Footer: Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-gray-50 border-t border-gray-200">

      {/* Main Footer */}
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12">

          {/* Col 1 - Logo + Description + Social */}
          <div className="lg:col-span-4 md:col-span-2">
            <Link href="/" className="inline-flex items-center mb-6 transition-transform hover:scale-105 duration-300">
              <Image src="/logo.png" alt="Logo" width={220} height={70} className="object-contain" />
            </Link>
            <p className="text-[15px] text-gray-500 leading-offset-relaxed mb-8 max-w-md">
              Work On Top connects you with skilled and trusted local tradespeople for every job, big or small. Our mission is to provide dependable service, fair pricing, and complete customer satisfaction. Whatever your repair, upgrade, or service need may be, we deliver solutions that are quick, easy, and handled with professionalism.
            </p>
            <div className="flex items-center gap-4">

              {/* Facebook */}
              <a href="#" aria-label="Facebook" className="group w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#1877F2] hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-md">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>

              {/* Twitter */}
              <a href="#" aria-label="Twitter" className="group w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-black hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-md">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </a>

              {/* Instagram */}
              <a href="#" aria-label="Instagram" className="group w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-md">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                </svg>
              </a>

              {/* YouTube */}
              <a href="#" aria-label="YouTube" className="group w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#FF0000] hover:border-transparent transition-all duration-300 shadow-sm hover:shadow-md">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" />
                </svg>
              </a>

            </div>
          </div>

          {/* Col 2 - Quick Links */}
          <div className="lg:col-span-2 md:col-span-1 mt-10 md:mt-0">
            <h4 className="font-bold text-gray-900 text-lg mb-6 relative">
              <span className="relative z-10">Quick Links</span>
              <span className="absolute left-0 bottom-[-8px] w-12 h-[3px] bg-green-600 rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', href: '/' },
                { label: 'Find A Trade', href: '/services' },
                { label: 'Help', href: '/help' },
                { label: 'Data Deletion Request', href: '/data-deletion' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map((link) => (
                <li key={link.href} className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 transition-all duration-300 hover:translate-x-1">
                  <svg className="w-3 h-3 text-green-600 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                  <Link href={link.href} className="font-medium">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 - Dynamic Services */}
          <div className="lg:col-span-3 md:col-span-1 mt-10 md:mt-0">
            <h4 className="font-bold text-gray-900 text-lg mb-6 relative">
              <span className="relative z-10">Services</span>
              <span className="absolute left-0 bottom-[-8px] w-12 h-[3px] bg-green-600 rounded-full"></span>
            </h4>
            <ul className="space-y-3">
              {services.length > 0 ? services.map((service) => (
                <li key={service.id} className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 transition-all duration-300 hover:translate-x-1">
                  <svg className="w-3 h-3 text-green-600 flex-shrink-0 opacity-70" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                  <Link href={`/services/${service.slug}`} className="font-medium">{service.name}</Link>
                </li>
              )) : (
                <li className="text-sm text-gray-400">Loading services...</li>
              )}
            </ul>
          </div>

          {/* Col 4 - Contact Us */}
          <div className="lg:col-span-3 md:col-span-2 mt-10 lg:mt-0">
            <h4 className="font-bold text-gray-900 text-lg mb-6 relative">
              <span className="relative z-10">Contact Us</span>
              <span className="absolute left-0 bottom-[-8px] w-12 h-[3px] bg-green-600 rounded-full"></span>
            </h4>
            <ul className="space-y-4 mb-6">
              <li className="flex items-start gap-3 text-sm text-gray-500 group">
                <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div className="pt-1">
                  <p className="font-semibold text-gray-800 mb-1">Email Us</p>
                  <p>infoworktap@gmail.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-500 group">
                <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="pt-1">
                  <p className="font-semibold text-gray-800 mb-1">Our Location</p>
                  <p>London, UK</p>
                </div>
              </li>
            </ul>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 h-40 w-full shadow-inner lg:max-w-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2483.690857182831!2d-0.12255!3d51.50335!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487604b900d26973%3A0x4291f3172409ea92!2sLondon%20Eye!5e0!3m2!1sen!2suk!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="py-6 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm font-medium text-gray-500 text-center md:text-left">
          <p>© Copyrights {currentYear} | All Rights Reserved By <span className="text-gray-900 font-bold">worktap</span></p>
          <p>
            Website Design and Develop by <a href="https://flymediatech.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors">Flymedia Technology</a>
          </p>
        </div>
      </div>

    </footer>
  );
}