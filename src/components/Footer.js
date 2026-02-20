'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-white border-t border-gray-100 py-10">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* 3-Column Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Services</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/services" className="hover:text-gray-900">All Services</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-gray-900">About Us</Link></li>
              <li><Link href="/how-it-works" className="hover:text-gray-900">How It Works</Link></li>
              <li><Link href="/contact" className="hover:text-gray-900">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/faq" className="hover:text-gray-900">FAQ</Link></li>
              <li><Link href="/help" className="hover:text-gray-900">Help Center</Link></li>
              <li><Link href="/guarantee" className="hover:text-gray-900">Our Guarantee</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-400">
          <p>© {currentYear} WorkOnTap. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}