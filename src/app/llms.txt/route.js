import db from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /llms.txt
 * Dynamic Markdown document optimized for LLMs (ChatGPT, Claude, Perplexity, Gemini, etc.)
 * Provides structured index of Core Pages, Services, Local Service Locations, and Blog Posts.
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://workontap.com'

  let textContent = `# WorkOnTap - Home Services & Maintenance Platform\n\n`
  textContent += `> WorkOnTap is a premier on-demand platform connecting homeowners, renters, and businesses across Metro Vancouver and British Columbia with verified, background-checked local trades and home service professionals.\n\n`

  // 1. Core Platform Pages
  textContent += `## Core Pages\n`
  textContent += `- [Home Page](${baseUrl}/): On-demand home repairs, cleaning, maintenance, and skilled trades.\n`
  textContent += `- [Services Catalog](${baseUrl}/services): Full directory of residential and commercial services.\n`
  textContent += `- [Local Trades & Service Areas](${baseUrl}/local-trades-and-services): Cities and regions serviced across BC.\n`
  textContent += `- [Blogs & Guides](${baseUrl}/blogs): Expert home improvement guides, maintenance tips, and industry advice.\n`
  textContent += `- [About Us](${baseUrl}/about): Our mission, quality standards, and verified provider network.\n`
  textContent += `- [Contact Us](${baseUrl}/contact): Customer support, provider inquiries, and emergency booking assistance.\n`
  textContent += `- [Happiness Guarantee](${baseUrl}/guarantee): 100% satisfaction guarantee on all booked jobs.\n`
  textContent += `- [How It Works](${baseUrl}/how-it-works): 3-step easy booking process for customers and providers.\n`
  textContent += `- [FAQ](${baseUrl}/faq): Frequently asked questions regarding pricing, insurance, and booking.\n`
  textContent += `- [Help Center](${baseUrl}/help): Booking support, payment assistance, and dispute resolution.\n`
  textContent += `- [Terms of Service](${baseUrl}/terms): Terms, customer agreements, and provider policies.\n`
  textContent += `- [Privacy Policy](${baseUrl}/privacy): User privacy and data protection policies.\n`
  textContent += `- [Data Deletion](${baseUrl}/data-deletion): User account and data deletion instructions.\n\n`

  // 2. Dynamic Main Services
  try {
    const services = await db.query(`
      SELECT s.id, s.name, s.slug, s.short_description, s.description, s.base_price, sc.name as category_name
      FROM services s
      LEFT JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.is_active = 1
      ORDER BY sc.display_order ASC, s.name ASC
    `)

    if (services && services.length > 0) {
      textContent += `## Available Services\n`
      let currentCategory = ''

      for (const service of services) {
        const cat = service.category_name || 'General Services'
        if (cat !== currentCategory) {
          currentCategory = cat
          textContent += `\n### ${currentCategory}\n`
        }

        const serviceSlug = service.slug || service.id
        const serviceUrl = `${baseUrl}/services/${serviceSlug}`
        const rawDesc = service.short_description || service.description || ''
        const cleanDesc = rawDesc
          ? rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
          : `Professional ${service.name} services.`
        const priceStr = service.base_price ? ` (Starting at $${service.base_price} CAD)` : ''

        textContent += `- [${service.name}](${serviceUrl}): ${cleanDesc}${priceStr}\n`
      }
      textContent += `\n`
    }
  } catch (error) {
    console.error('Error fetching Services for llms.txt:', error)
  }

  // 3. Dynamic Local Service Locations (Grouped by Location / City)
  try {
    const serviceLocs = await db.query(`
      SELECT 
        sl.id, 
        sl.slug, 
        sl.location_name, 
        sl.location_slug, 
        sl.custom_heading, 
        sl.custom_intro, 
        sl.meta_description,
        sl.canonical_url,
        s.name as service_name, 
        s.slug as service_slug, 
        s.base_price
      FROM service_locations sl
      JOIN services s ON sl.service_id = s.id
      WHERE sl.is_active = 1 AND s.is_active = 1
      ORDER BY sl.location_name ASC, s.name ASC
    `)

    if (serviceLocs && serviceLocs.length > 0) {
      textContent += `## Local Service Hubs & Service Locations\n`
      let currentLocation = ''

      for (const item of serviceLocs) {
        if (item.location_name !== currentLocation) {
          currentLocation = item.location_name
          textContent += `\n### ${currentLocation}, BC\n`
        }

        const locSlug = item.slug || `${item.service_slug}-in-${item.location_slug}`
        const locUrl = item.canonical_url || `${baseUrl}/services/${locSlug}`
        const title = item.custom_heading || `${item.service_name} in ${item.location_name}`
        const desc = item.custom_intro || item.meta_description || `Verified local ${item.service_name.toLowerCase()} pros serving ${item.location_name}, BC.`
        const cleanDesc = desc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()

        textContent += `- [${title}](${locUrl}): ${cleanDesc}\n`
      }
      textContent += `\n`
    }
  } catch (error) {
    console.error('Error fetching Service Locations for llms.txt:', error)
  }

  // 4. Dynamic Blog & Knowledge Base Articles
  try {
    const blogs = await db.query(`
      SELECT id, title, slug, short_content, meta_description, author, created_at
      FROM blogs
      WHERE is_published = 1
      ORDER BY created_at DESC
    `)

    if (blogs && blogs.length > 0) {
      textContent += `## Blog & Knowledge Base Articles\n`
      for (const blog of blogs) {
        const blogUrl = `${baseUrl}/blogs/${blog.slug || blog.id}`
        const rawDesc = blog.meta_description || blog.short_content || ''
        const cleanDesc = rawDesc
          ? `: ${rawDesc.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}`
          : ''
        textContent += `- [${blog.title}](${blogUrl})${cleanDesc}\n`
      }
      textContent += `\n`
    }
  } catch (error) {
    console.error('Error fetching Blogs for llms.txt:', error)
  }

  return new Response(textContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
