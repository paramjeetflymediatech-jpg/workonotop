import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DirectoryListing from '@/components/DirectoryListing';
import db from '@/lib/db';
import { getSeoForPath } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const seo = await getSeoForPath('/local-trades-and-services');

  return {
    title: seo.title || 'Local Trades & Services Directory | WorkOnTap',
    description: seo.description || 'Browse our complete directory of verified local trade professionals and home services across Canada.',
    alternates: {
      canonical: seo.canonical || 'https://workontap.com/local-trades-and-services',
    },
  };
}

export default async function DirectoryPage() {
  let directoryItems = [];
  try {
    const data = await db.query(
      `SELECT 
        s.name as service_name, 
        s.slug as service_slug,
        s.description,
        s.short_description,
        sl.location_name,
        sl.location_slug,
        sl.slug as full_slug
       FROM service_locations sl
       JOIN services s ON sl.service_id = s.id
       WHERE sl.is_active = 1 AND s.is_active = 1
       ORDER BY sl.location_name ASC, s.name ASC`
    );
    directoryItems = data || [];
  } catch (e) {
    console.error('Error loading directory in SSR /local-trades-and-services:', e);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 bg-white">
        <div className="container mx-auto px-6 max-w-7xl py-12">
          
          <div className="flex flex-col md:flex-row items-baseline justify-between mb-8 border-b border-slate-100 pb-4">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900">
              Local Trades & Services
            </h1>
            <Link 
              href="/services" 
              className="text-[#16A34A] font-semibold hover:underline flex items-center gap-1 mt-4 md:mt-0"
            >
              View All Services
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <DirectoryListing initialItems={directoryItems} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
