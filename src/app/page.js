import { getSeoForPath } from '@/lib/seo';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const seo = await getSeoForPath('/');

  return {
    title: seo.title || 'WorkOnTap - Home Maintenance & Trade Services',
    description: seo.description || 'WorkOnTap connects you with skilled and trusted local tradespeople for every job, big or small.',
    keywords: seo.keywords || 'home maintenance, plumbers, electricians, hvac, cleaners, vancouver',
    alternates: {
      canonical: seo.canonical || 'https://workontap.com',
    },
    robots: seo.robots || 'index, follow',
    openGraph: {
      title: seo.ogTitle || seo.title || 'WorkOnTap - Home Maintenance & Trade Services',
      description: seo.ogDescription || seo.description || 'WorkOnTap connects you with skilled and trusted local tradespeople.',
      url: seo.canonical || 'https://workontap.com',
      siteName: 'WorkOnTap',
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle || seo.title || 'WorkOnTap - Home Maintenance & Trade Services',
      description: seo.ogDescription || seo.description || 'WorkOnTap connects you with skilled and trusted local tradespeople.',
      images: seo.ogImage ? [seo.ogImage] : [],
    },
  };
}

export default function HomePage() {
  return <HomeClient />;
}