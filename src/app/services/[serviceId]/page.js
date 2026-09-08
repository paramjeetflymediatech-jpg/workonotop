import db from '@/lib/db';
import { getSeoForPath } from '@/lib/seo';
import ServiceLocationClientPage from './ServiceLocationClientPage';
import ServiceDetailClientPage from './ServiceDetailClientPage';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';



export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.serviceId;
  const seo = await getSeoForPath(`/services/${slug}`);

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: seo.canonical,
    },
    openGraph: {
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.description,
      url: seo.canonical,
      siteName: 'WorkOnTap',
      images: seo.ogImage ? [{ url: seo.ogImage }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.description,
      images: seo.ogImage ? [seo.ogImage] : [],
    },
  };
}

export default async function ServiceDynamicPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.serviceId;

  // 1. Check if it's a direct service slug
  const services = await db.query(
    `SELECT s.*, sc.name as category_name, sc.icon as category_icon, sc.image_url as category_image_url
     FROM services s
     LEFT JOIN service_categories sc ON s.category_id = sc.id
     WHERE s.slug = ? AND s.is_active = 1 LIMIT 1`,
    [slug]
  );

  if (services && services.length > 0) {
    const service = { ...services[0] };
    try {
      service.skills = typeof service.skills === 'string' ? JSON.parse(service.skills) : (service.skills || []);
    } catch (e) {
      service.skills = [];
    }

    let relatedServices = [];
    if (service.category_id) {
      const related = await db.query(
        `SELECT s.*, sc.name as category_name, sc.icon as category_icon, sc.image_url as category_image_url
         FROM services s
         LEFT JOIN service_categories sc ON s.category_id = sc.id
         WHERE s.category_id = ? AND s.id != ? AND s.is_active = 1 LIMIT 4`,
        [service.category_id, service.id]
      );
      relatedServices = (related || []).map(r => {
        let skills = [];
        try {
          skills = typeof r.skills === 'string' ? JSON.parse(r.skills) : (r.skills || []);
        } catch (e) {}
        return { ...r, skills };
      });
    }

    return (
      <ServiceDetailClientPage 
        serviceId={slug} 
        initialService={service} 
        initialRelatedServices={relatedServices} 
      />
    );
  }

  // 2. Check if it's a service-location slug combination (e.g. furniture-assembly-burnaby or furniture-assembly-in-burnaby)
  let matchedService = null;
  let locationSlug = '';
  let serviceLocation = null;

  // First try direct match in service_locations by slug
  const directLocs = await db.query(
    `SELECT sl.*, s.slug as service_slug
     FROM service_locations sl
     JOIN services s ON sl.service_id = s.id
     WHERE (sl.slug = ? OR sl.slug = ? OR sl.slug = ?) AND sl.is_active = 1 LIMIT 1`,
    [slug, slug.replace(/-in-/, '-'), slug.replace(/-/, '-in-')]
  );

  if (directLocs && directLocs.length > 0) {
    serviceLocation = directLocs[0];
    locationSlug = serviceLocation.location_slug;
    const fullServices = await db.query(
      `SELECT s.*, sc.name as category_name, sc.icon as category_icon, sc.image_url as category_image_url
       FROM services s
       LEFT JOIN service_categories sc ON s.category_id = sc.id
       WHERE s.id = ? AND s.is_active = 1 LIMIT 1`,
      [serviceLocation.service_id]
    );
    if (fullServices && fullServices.length > 0) {
      matchedService = fullServices[0];
    }
  }

  // If not matched directly, try matching service prefix (e.g. furniture-assembly-in-burnaby)
  if (!matchedService) {
    const allServices = await db.query(
      `SELECT id, name, slug FROM services WHERE is_active = 1 ORDER BY LENGTH(slug) DESC`
    );

    for (const s of allServices) {
      if (slug.startsWith(s.slug + '-')) {
        matchedService = s;
        let rawLoc = slug.substring(s.slug.length + 1);
        locationSlug = rawLoc.startsWith('in-') ? rawLoc.substring(3) : rawLoc;
        break;
      }
    }

    if (matchedService && locationSlug) {
      const locRows = await db.query(
        `SELECT * FROM service_locations 
         WHERE service_id = ? AND (location_slug = ? OR location_slug = ? OR LOWER(location_name) = ? OR LOWER(location_name) = ? OR slug = ?) AND is_active = 1 LIMIT 1`,
        [matchedService.id, locationSlug, `in-${locationSlug}`, locationSlug.replace(/-/g, ' '), `in ${locationSlug.replace(/-/g, ' ')}`, slug]
      );

      serviceLocation = (locRows && locRows.length > 0) ? locRows[0] : null;

      // Re-fetch full service data since we only queried id, name, slug above
      const fullServices = await db.query(
        `SELECT s.*, sc.name as category_name, sc.icon as category_icon, sc.image_url as category_image_url
         FROM services s
         LEFT JOIN service_categories sc ON s.category_id = sc.id
         WHERE s.id = ? AND s.is_active = 1 LIMIT 1`,
        [matchedService.id]
      );
      if (fullServices && fullServices.length > 0) {
        matchedService = fullServices[0];
      }
    }
  }

  if (matchedService && locationSlug) {
    const locList = await db.query(
      `SELECT DISTINCT location_name, location_slug FROM service_locations WHERE is_active = 1 ORDER BY location_name ASC LIMIT 20`
    );

    const locationName = serviceLocation?.location_name || locationSlug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return (
      <ServiceLocationClientPage
        service={matchedService}
        serviceLocation={serviceLocation}
        serviceId={matchedService.slug}
        locationSlug={locationSlug}
        locationName={locationName}
        allLocations={locList || []}
      />
    );
  }

  console.log('--- DEBUG START ---');
  console.log('Incoming slug:', slug);
  console.log('Services check 1:', services?.length);
  console.log('Matched Service:', matchedService?.slug);
  console.log('Location Slug:', locationSlug);

  return notFound();
}
