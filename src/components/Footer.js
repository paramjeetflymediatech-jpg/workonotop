'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('/api/services');
        const data = await res.json();
        if (data.success) {
          setServices(data.data?.slice(0, 6) || []);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-gray-50 border-t border-gray-200">

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-10 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Col 1 - Logo + Description + Social */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 border-2 border-green-600 rounded-md flex items-center justify-center">
                <span className="text-green-600 font-extrabold text-xl">W</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">work on tap</span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Work On Top connects you with skilled and trusted local tradespeople for every job, big or small. Our mission is to provide dependable service, fair pricing, and complete customer satisfaction. Whatever your repair, upgrade, or service need may be, we deliver solutions that are quick, easy, and handled with professionalism.
            </p>
            <div className="flex items-center gap-3">
              
              {/* Facebook */}
              <a href="#" aria-label="Facebook" className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
                </svg>
              </a>

              {/* Twitter */}
              <a href="#" aria-label="Twitter" className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                </svg>
              </a>

              {/* Instagram - fixed */}
              <a href="#" aria-label="Instagram" className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
              </a>

              {/* YouTube - fixed */}
              <a href="#" aria-label="YouTube" className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition">
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
  </svg>
</a>

            </div>
          </div>

          {/* Col 2 - Quick Links */}
          <div>
            <h4 className="font-bold text-gray-800 text-base mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: 'Home', href: '/' },
                { label: 'Find A Trade', href: '/services' },
                { label: 'Help', href: '/help' },
                { label: 'Data Deletion Request', href: '/data-deletion' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map((link) => (
                <li key={link.href} className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 transition">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M13 5l7 7-7 7"/>
                    <path d="M5 5l7 7-7 7"/>
                  </svg>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 - Dynamic Services */}
          <div>
            <h4 className="font-bold text-gray-800 text-base mb-4">Services</h4>
            <ul className="space-y-2">
              {services.length > 0 ? services.map((service) => (
                <li key={service.id} className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-700 transition">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M13 5l7 7-7 7"/>
                    <path d="M5 5l7 7-7 7"/>
                  </svg>
                  <Link href={`/services/${service.slug}`}>{service.name}</Link>
                </li>
              )) : (
                <li className="text-sm text-gray-400">Loading services...</li>
              )}
            </ul>
          </div>

          {/* Col 4 - Contact Us */}
          <div>
            <h4 className="font-bold text-gray-800 text-base mb-4">Contact Us</h4>
            <ul className="space-y-3 mb-4">
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                </svg>
                infoworktap@gmail.com
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                Address
              </li>
            </ul>

            {/* Map */}
            <div className="rounded-xl overflow-hidden border border-gray-200 h-32 w-full">
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
      <div className="bg-green-700 py-4">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-white">
          <p>© Copyrights {currentYear} | All Rights Reserved By worktap</p>
          <p>Website Design and Develop by Flymedia Technology</p>
        </div>
      </div>

    </footer>
  );
}