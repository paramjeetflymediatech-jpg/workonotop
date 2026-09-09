import db from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://workontap.com'
  
  // Core static paths to ensure they are always present
  const corePaths = [
    '',
    '/about',
    '/contact',
    '/services',
    '/blogs',
    '/faq',
    '/help',
    '/terms',
    '/privacy',
    '/data-deletion'
  ]

  const sitemapEntries = []

  // 1. Add core static pages
  for (const path of corePaths) {
    sitemapEntries.push({
      url: `${baseUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: path === '' ? 'daily' : 'weekly',
      priority: path === '' ? 1.0 : 0.8,
    })
  }

  // 2. Fetch all SEO Settings for dynamic pages
  try {
    const seoSettings = await db.query('SELECT * FROM seo_settings')
    const pages = seoSettings || []
    
    for (const page of pages) {
      if (!page.page_name || page.page_name.toLowerCase() === 'global') continue
      
      let cleanPath = page.page_name.trim()
      
      // Format the path correctly (map 'home' to root if needed)
      if (cleanPath.toLowerCase() === 'home') cleanPath = '/'
      else if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath

      const fullUrl = `${baseUrl}${cleanPath}`

      // Check if entry already exists (ignoring trailing slash differences)
      const exists = sitemapEntries.some(
        (entry) => entry.url.replace(/\/$/, '') === fullUrl.replace(/\/$/, '')
      )

      if (!exists) {
        sitemapEntries.push({
          url: fullUrl,
          lastModified: page.updated_at ? new Date(page.updated_at) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.7,
        })
      }
    }
  } catch (error) {
    console.error('Error fetching SEO settings for sitemap:', error)
  }

  // 3. Fetch all Services (Only Active)
  try {
    const services = await db.query('SELECT * FROM services WHERE is_active = 1')
    const activeServices = services || []
    
    for (const service of activeServices) {
      if (!service.slug && !service.id) continue

      const servicePath = `/services/${service.slug || service.id}`
      const fullUrl = `${baseUrl}${servicePath}`
      
      // Check if entry already exists
      const exists = sitemapEntries.some(
        (entry) => entry.url.replace(/\/$/, '') === fullUrl.replace(/\/$/, '')
      )

      if (!exists) {
        sitemapEntries.push({
          url: fullUrl,
          lastModified: service.updated_at ? new Date(service.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }
    }
  } catch (error) {
    console.error('Error fetching Services for sitemap:', error)
  }

  // 4. Fetch all Blogs (Only Published)
  try {
    const blogs = await db.query('SELECT * FROM blogs WHERE is_published = 1')
    const publishedBlogs = blogs || []
    
    for (const blog of publishedBlogs) {
      if (!blog.slug && !blog.id) continue

      const blogPath = `/blogs/${blog.slug || blog.id}`
      const fullUrl = `${baseUrl}${blogPath}`
      
      // Check if entry already exists
      const exists = sitemapEntries.some(
        (entry) => entry.url.replace(/\/$/, '') === fullUrl.replace(/\/$/, '')
      )

      if (!exists) {
        sitemapEntries.push({
          url: fullUrl,
          lastModified: blog.updated_at ? new Date(blog.updated_at) : new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
        })
      }
    }
  } catch (error) {
    console.error('Error fetching Blogs for sitemap:', error)
  }

  // 5. Fetch all Active Service Locations for Location-based SEO Pages
  try {
    const serviceLocs = await db.query(
      `SELECT sl.id, sl.slug, sl.location_slug, sl.canonical_url, s.slug as service_slug, sl.updated_at
       FROM service_locations sl
       JOIN services s ON sl.service_id = s.id
       WHERE sl.is_active = 1 AND s.is_active = 1`
    )
    const activeLocs = serviceLocs || []
    
    for (const item of activeLocs) {
      const locSlug = item.slug || `${item.service_slug}-in-${item.location_slug}`
      if (!locSlug) continue

      const fullUrl = item.canonical_url || `${baseUrl}/services/${locSlug}`
      
      const exists = sitemapEntries.some(
        (entry) => entry.url.replace(/\/$/, '') === fullUrl.replace(/\/$/, '')
      )

      if (!exists) {
        sitemapEntries.push({
          url: fullUrl,
          lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        })
      }
    }
  } catch (error) {
    console.error('Error fetching Service Locations for sitemap:', error)
  }


  return sitemapEntries
}

