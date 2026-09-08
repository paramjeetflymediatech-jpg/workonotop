import db from '@/lib/db';

/**
 * Fetch list of services with category information
 */
export async function getServicesList({ search = '', categoryId = null, activeOnly = false, limit = 50, offset = 0 } = {}) {
  let sql = `
    SELECT s.*, sc.name as category_name, sc.slug as category_slug
    FROM services s
    LEFT JOIN service_categories sc ON s.category_id = sc.id
    WHERE 1=1
  `;
  const params = [];

  if (activeOnly) {
    sql += ' AND s.is_active = 1';
  }

  if (categoryId) {
    sql += ' AND s.category_id = ?';
    params.push(Number(categoryId));
  }

  if (search) {
    sql += ' AND (LOWER(s.name) LIKE ? OR LOWER(s.slug) LIKE ? OR LOWER(s.description) LIKE ?)';
    const term = `%${search.toLowerCase()}%`;
    params.push(term, term, term);
  }

  sql += ' ORDER BY s.id DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const rows = await db.query(sql, params);

  const formatted = (rows || []).map(s => {
    let skills = [];
    try {
      skills = typeof s.skills === 'string' ? JSON.parse(s.skills) : (s.skills || []);
    } catch (e) {
      skills = [];
    }
    return { ...s, skills };
  });

  return formatted;
}

/**
 * Get full service details by slug or id
 */
export async function getServiceDetails(slugOrId) {
  if (!slugOrId) return null;
  const isId = typeof slugOrId === 'number' || (!isNaN(Number(slugOrId)) && !String(slugOrId).includes('-'));

  let sql = `
    SELECT s.*, sc.name as category_name, sc.slug as category_slug
    FROM services s
    LEFT JOIN service_categories sc ON s.category_id = sc.id
    WHERE ${isId ? 's.id = ?' : 's.slug = ?'}
    LIMIT 1
  `;

  const rows = await db.query(sql, [isId ? Number(slugOrId) : String(slugOrId).trim()]);
  if (!rows || rows.length === 0) {
    if (!isId) {
      const cleanSlug = String(slugOrId).trim();
      const locRows = await db.query(
        `SELECT sl.*, s.name as service_name, s.slug as base_service_slug, s.base_price, s.image_url
         FROM service_locations sl
         JOIN services s ON sl.service_id = s.id
         WHERE (sl.slug = ? OR sl.slug = ? OR sl.slug = ?) LIMIT 1`,
        [cleanSlug, cleanSlug.replace(/-in-/, '-'), cleanSlug.replace(/-/, '-in-')]
      );
      if (locRows && locRows.length > 0) {
        const loc = locRows[0];
        return {
          id: loc.id,
          name: `${loc.service_name} in ${loc.location_name}`,
          slug: loc.slug,
          location_name: loc.location_name,
          location_slug: loc.location_slug,
          description: loc.description,
          custom_heading: loc.custom_heading,
          custom_intro: loc.custom_intro,
          meta_title: loc.meta_title,
          meta_description: loc.meta_description,
          keywords: loc.keywords,
          canonical_url: loc.canonical_url,
          is_active: loc.is_active,
          base_price: loc.base_price,
          is_service_location: true,
        };
      }
    }
    return null;
  }

  const service = rows[0];
  try {
    service.skills = typeof service.skills === 'string' ? JSON.parse(service.skills) : (service.skills || []);
  } catch (e) {
    service.skills = [];
  }
  return service;
}

/**
 * Create or Update a Service
 */
export async function createOrUpdateService(data) {
  const {
    id,
    category_id,
    name,
    slug,
    description,
    short_description,
    base_price,
    additional_price,
    duration_minutes,
    image_url,
    use_cases,
    is_homepage,
    is_trending,
    is_popular,
    is_active,
    skills,
    meta_title,
    meta_description,
    keywords,
  } = data;

  if (!name && !id && !slug) {
    throw new Error('Service name, slug, or ID is required');
  }

  const cleanSlug = (slug || name || '')
    .toLowerCase()
    .trim()
    .replace(/[\/]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  // Check if updating by ID or slug
  let existing = null;
  if (id) {
    existing = await getServiceDetails(id);
  } else if (cleanSlug) {
    existing = await getServiceDetails(cleanSlug);
  }

  // If this matches a service location record (or existing is a service location)
  if (existing?.is_service_location) {
    const finalDesc = description !== undefined ? description : existing.description;
    const finalMetaTitle = meta_title !== undefined ? meta_title : existing.meta_title;
    const finalMetaDesc = meta_description !== undefined ? meta_description : existing.meta_description;
    const finalKeywords = keywords !== undefined ? keywords : existing.keywords;

    await db.query(
      `UPDATE service_locations 
       SET description = ?, meta_title = ?, meta_description = ?, keywords = ?, updated_at = NOW()
       WHERE id = ?`,
      [finalDesc, finalMetaTitle, finalMetaDesc, finalKeywords, existing.id]
    );

    return {
      id: existing.id,
      action: 'updated',
      slug: existing.slug,
      name: existing.name,
      is_service_location: true,
    };
  }

  if (existing) {
    // Preserve existing values if not specified (undefined) in the incoming payload
    const finalName = name !== undefined ? name : existing.name;
    const finalSlug = slug !== undefined ? cleanSlug : existing.slug;
    const finalCategoryId = category_id !== undefined ? (category_id ? Number(category_id) : null) : existing.category_id;
    const finalDescription = description !== undefined ? description : (existing.description || '');
    const finalShortDescription = short_description !== undefined ? short_description : (existing.short_description || '');
    const finalBasePrice = base_price !== undefined ? base_price : (existing.base_price || '0.00');
    const finalAdditionalPrice = additional_price !== undefined ? additional_price : (existing.additional_price || '0.00');
    const finalDurationMinutes = duration_minutes !== undefined ? (Number(duration_minutes) || 60) : (existing.duration_minutes || 60);
    const finalImageUrl = image_url !== undefined ? (image_url || null) : existing.image_url;
    const finalUseCases = use_cases !== undefined ? use_cases : (existing.use_cases || '');
    const finalIsHomepage = is_homepage !== undefined ? (is_homepage ? 1 : 0) : (existing.is_homepage ? 1 : 0);
    const finalIsTrending = is_trending !== undefined ? (is_trending ? 1 : 0) : (existing.is_trending ? 1 : 0);
    const finalIsPopular = is_popular !== undefined ? (is_popular ? 1 : 0) : (existing.is_popular ? 1 : 0);
    const finalIsActive = is_active !== undefined ? (is_active ? 1 : 0) : (existing.is_active ? 1 : 0);

    let skillsJson;
    if (skills !== undefined) {
      skillsJson = JSON.stringify(Array.isArray(skills) ? skills : []);
    } else {
      skillsJson = JSON.stringify(Array.isArray(existing.skills) ? existing.skills : []);
    }

    const finalMetaTitle = meta_title !== undefined ? meta_title : (existing.meta_title || '');
    const finalMetaDescription = meta_description !== undefined ? meta_description : (existing.meta_description || '');
    const finalKeywords = keywords !== undefined ? keywords : (existing.keywords || '');

    await db.query(
      `UPDATE services 
       SET category_id = ?,
           name = ?,
           slug = ?,
           description = ?,
           short_description = ?,
           base_price = ?,
           additional_price = ?,
           duration_minutes = ?,
           image_url = ?,
           use_cases = ?,
           is_homepage = ?,
           is_trending = ?,
           is_popular = ?,
           is_active = ?,
           skills = ?,
           meta_title = ?,
           meta_description = ?,
           keywords = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [
        finalCategoryId,
        finalName,
        finalSlug,
        finalDescription,
        finalShortDescription,
        finalBasePrice,
        finalAdditionalPrice,
        finalDurationMinutes,
        finalImageUrl,
        finalUseCases,
        finalIsHomepage,
        finalIsTrending,
        finalIsPopular,
        finalIsActive,
        skillsJson,
        finalMetaTitle,
        finalMetaDescription,
        finalKeywords,
        existing.id,
      ]
    );

    return { id: existing.id, action: 'updated', slug: finalSlug, name: finalName };
  } else {
    const skillsJson = JSON.stringify(Array.isArray(skills) ? skills : []);
    const result = await db.query(
      `INSERT INTO services 
       (category_id, name, slug, description, short_description, base_price, additional_price, duration_minutes, image_url, use_cases, is_homepage, is_trending, is_popular, is_active, skills, meta_title, meta_description, keywords)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id ? Number(category_id) : 1,
        name,
        cleanSlug,
        description || '',
        short_description || '',
        base_price || '0.00',
        additional_price || '0.00',
        Number(duration_minutes) || 60,
        image_url || null,
        use_cases || '',
        is_homepage ? 1 : 0,
        is_trending ? 1 : 0,
        is_popular ? 1 : 0,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        skillsJson,
        meta_title || '',
        meta_description || '',
        keywords || '',
      ]
    );

    return { id: result.insertId, action: 'created', slug: cleanSlug, name };
  }
}

/**
 * Get All Categories
 */
export async function getCategories() {
  const rows = await db.query('SELECT * FROM service_categories WHERE is_active = 1 ORDER BY display_order ASC, name ASC');
  return rows || [];
}
