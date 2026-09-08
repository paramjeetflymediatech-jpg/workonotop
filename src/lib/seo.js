import db from '@/lib/db'

export async function getSeoForPath(rawPathname) {
  let pathname = (rawPathname || '/').trim()
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1)
  }
  if (!pathname || pathname === '' || pathname === 'index') {
    pathname = '/'
  }

  let globalSeo = null
  let pageSeo = null
  let blogSeo = null
  let serviceSeo = null

  // 1. Fetch Global SEO
  try {
    const rows = await db.query("SELECT * FROM seo_settings WHERE LOWER(page_name) = 'global' LIMIT 1")
    if (rows && rows.length > 0) globalSeo = rows[0]
  } catch (e) {
    console.error('Error fetching global SEO:', e)
  }

  // Build page name variants
  const cleanName = pathname.replace(/^\//, '')
  const pageVariants = [
    pathname,
    cleanName,
    pathname.toLowerCase(),
    cleanName.toLowerCase()
  ]
  if (pathname === '/') {
    pageVariants.push('home', 'index', '')
  }

  // 2. Fetch Page SEO from seo_settings
  try {
    const rows = await db.query(
      `SELECT * FROM seo_settings WHERE LOWER(page_name) IN (?) LIMIT 1`,
      [pageVariants]
    )
    if (rows && rows.length > 0) pageSeo = rows[0]
  } catch (e) {
    console.error('Error fetching page SEO:', e)
  }

  const lastSegment = pathname.split('/').filter(Boolean).pop()

  // 3. Fetch Blog SEO if visiting a blog detail page (/blogs/:id_or_slug)
  if (pathname.includes('/blogs/') && lastSegment && lastSegment !== 'blogs') {
    try {
      const rows = await db.query(
        `SELECT * FROM blogs WHERE (slug = ? OR id = ?) AND is_published = 1 LIMIT 1`,
        [lastSegment, lastSegment]
      )
      if (rows && rows.length > 0) blogSeo = rows[0]
    } catch (e) {
      console.error('Error fetching blog SEO:', e)
    }
  }

  let serviceLocationSeo = null

  // 4. Check for nested Service Location path (/services/:serviceSlug-:locationSlug)
  const serviceLocParts = pathname.split('/').filter(Boolean)
  if (serviceLocParts.length === 2 && serviceLocParts[0] === 'services') {
    const slug = serviceLocParts[1]
    
    try {
      // First try direct lookup by service_locations slug
      const directLocs = await db.query(
        `SELECT sl.*, s.name as service_name
         FROM service_locations sl
         JOIN services s ON sl.service_id = s.id
         WHERE (sl.slug = ? OR sl.slug = ? OR sl.slug = ?) AND sl.is_active = 1 LIMIT 1`,
        [slug, slug.replace(/-in-/, '-'), slug.replace(/-/, '-in-')]
      );

      if (directLocs && directLocs.length > 0) {
        serviceLocationSeo = directLocs[0];
      } else {
        // First get all services to do prefix matching
        const allServices = await db.query(`SELECT id, slug, name FROM services WHERE is_active = 1 ORDER BY LENGTH(slug) DESC`);
        
        let matchedService = null;
        let locationSlug = '';
        
        for (const s of allServices) {
          if (slug.startsWith(s.slug + '-')) {
            matchedService = s;
            let rawLoc = slug.substring(s.slug.length + 1);
            locationSlug = rawLoc.startsWith('in-') ? rawLoc.substring(3) : rawLoc;
            break;
          }
        }

        if (matchedService && locationSlug) {
          const rows = await db.query(
            `SELECT sl.*, s.name as service_name
             FROM service_locations sl
             JOIN services s ON sl.service_id = s.id
             WHERE s.id = ? AND (sl.location_slug = ? OR sl.location_slug = ? OR LOWER(sl.location_name) = ? OR LOWER(sl.location_name) = ? OR sl.slug = ?) AND sl.is_active = 1 LIMIT 1`,
            [matchedService.id, locationSlug, `in-${locationSlug}`, locationSlug.replace(/-/g, ' '), `in ${locationSlug.replace(/-/g, ' ')}`, slug]
          );
          if (rows && rows.length > 0) {
            serviceLocationSeo = rows[0];
          }
        }
      }
    } catch (e) {
      console.error('Error fetching service location SEO:', e);
    }
  }

  // 5. Fetch Service SEO if visiting a service detail page (/services/:id_or_slug)
  if (pathname.includes('/services/') && lastSegment && lastSegment !== 'services') {
    try {
      const rows = await db.query(
        `SELECT * FROM services WHERE (slug = ? OR id = ?) AND is_active = 1 LIMIT 1`,
        [lastSegment, lastSegment]
      )
      if (rows && rows.length > 0) serviceSeo = rows[0]
    } catch (e) {
      console.error('Error fetching service SEO:', e)
    }
  }

  const title = 
    pageSeo?.meta_title ||
    serviceLocationSeo?.meta_title ||
    blogSeo?.meta_title || 
    blogSeo?.title || 
    (serviceSeo ? `${serviceSeo.name} | WorkOnTap` : null) || 
    globalSeo?.meta_title || 
    'WorkOnTap - Home Maintenance Services'

  const rawLocDesc = serviceLocationSeo?.description || null
  const cleanLocDesc = rawLocDesc ? rawLocDesc.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...' : null

  const rawServiceDesc = serviceSeo?.short_description || serviceSeo?.description || null
  const cleanServiceDesc = rawServiceDesc ? rawServiceDesc.replace(/<[^>]*>?/gm, '').slice(0, 160) + '...' : null

  const description = 
    pageSeo?.meta_description ||
    serviceLocationSeo?.meta_description ||
    cleanLocDesc ||
    blogSeo?.meta_description || 
    blogSeo?.short_content || 
    cleanServiceDesc ||
    globalSeo?.meta_description || 
    'Book trusted local pros for your home maintenance needs'

  const keywords = 
    pageSeo?.keywords ||
    serviceLocationSeo?.keywords ||
    blogSeo?.keywords || 
    globalSeo?.keywords || 
    'home maintenance, plumbers, electricians, hvac, cleaners'

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://workontap.com'
  const canonical = 
    pageSeo?.canonical_url ||
    serviceLocationSeo?.canonical_url ||
    globalSeo?.canonical_url || 
    `https://workontap.com${pathname === '/' ? '' : pathname}`

  const robots = 
    pageSeo?.robots ||
    globalSeo?.robots || 
    'index, follow'

  const ogTitle = 
    pageSeo?.og_title ||
    serviceLocationSeo?.og_title ||
    blogSeo?.og_title || 
    title

  const ogDescription = 
    pageSeo?.og_description ||
    serviceLocationSeo?.og_description ||
    blogSeo?.og_description || 
    description

  let ogImage = 
    pageSeo?.og_image ||
    serviceLocationSeo?.og_image ||
    blogSeo?.image_url || 
    serviceSeo?.image_url ||
    globalSeo?.og_image || 
    null

  if (ogImage && ogImage.includes('localhost')) {
    ogImage = ogImage.replace('http://localhost:3000', baseUrl)
  }

  return {
    title,
    description,
    keywords,
    canonical,
    robots,
    ogTitle,
    ogDescription,
    ogImage,
    headerScripts: pageSeo?.header_scripts || globalSeo?.header_scripts || '',
    footerScripts: pageSeo?.footer_scripts || globalSeo?.footer_scripts || ''
  }
}
