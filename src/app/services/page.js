import db from '@/lib/db';
import { getSeoForPath } from '@/lib/seo';
import ServicesClientPage from './ServicesClientPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const seo = await getSeoForPath('/services');

  return {
    title: seo.title || 'All Professional Home & Trade Services | WorkOnTap',
    description: seo.description || 'Explore our full list of vetted home repair, cleaning, moving, and trade services across Metro Vancouver and Canada. Book trusted professionals easily.',
    keywords: seo.keywords || 'services, home cleaning, moving, handyman, trades, vancouver',
    alternates: {
      canonical: seo.canonical || 'https://workontap.com/services',
    },
    openGraph: {
      title: seo.ogTitle || seo.title || 'All Professional Home & Trade Services | WorkOnTap',
      description: seo.ogDescription || seo.description || 'Explore our full list of vetted home repair, cleaning, moving, and trade services.',
      url: seo.canonical || 'https://workontap.com/services',
      siteName: 'WorkOnTap',
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle || seo.title || 'All Professional Home & Trade Services | WorkOnTap',
      description: seo.ogDescription || seo.description,
      images: seo.ogImage ? [seo.ogImage] : [],
    },
  };
}

export default async function ServicesPage() {
  let services = [];
  let categories = [];
  let directoryItems = [];

  try {
    const servicesData = await db.query(
      `SELECT s.*, sc.name as category_name, sc.slug as category_slug, sc.icon as category_icon, sc.image_url as category_image_url
       FROM services s
       LEFT JOIN service_categories sc ON s.category_id = sc.id
       WHERE s.is_active = 1
       ORDER BY sc.display_order, s.name`
    );

    services = (servicesData || []).map(s => {
      let parsedSkills = [];
      try {
        parsedSkills = typeof s.skills === 'string' ? JSON.parse(s.skills) : (s.skills || []);
      } catch (e) {
        parsedSkills = [];
      }
      return { ...s, skills: parsedSkills };
    });
  } catch (error) {
    console.error('Error loading services in SSR /services:', error);
  }

  try {
    const categoriesData = await db.query(
      'SELECT * FROM service_categories WHERE is_active = 1 ORDER BY display_order, name'
    );
    categories = categoriesData || [];
  } catch (error) {
    console.error('Error loading categories in SSR /services:', error);
  }

  try {
    const directoryData = await db.query(
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
    directoryItems = directoryData || [];
  } catch (error) {
    console.error('Error loading directory in SSR /services:', error);
  }

  return (
    <ServicesClientPage 
      initialServices={services} 
      initialCategories={categories} 
      initialDirectoryItems={directoryItems} 
    />
  );
}
