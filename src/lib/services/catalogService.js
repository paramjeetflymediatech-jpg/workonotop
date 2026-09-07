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
  if (!rows || rows.length === 0) return null;

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
    description = '',
    short_description = '',
    base_price = '0.00',
    additional_price = '0.00',
    duration_minutes = 60,
    image_url = '',
    use_cases = '',
    is_homepage = 0,
    is_trending = 0,
    is_popular = 0,
    is_active = 1,
    skills = [],
    meta_title = '',
    meta_description = '',
    keywords = '',
  } = data;

  if (!name) {
    throw new Error('Service name is required');
  }

  const cleanSlug = (slug || name)
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

  const skillsJson = JSON.stringify(Array.isArray(skills) ? skills : []);

  if (existing) {
    await db.query(
      `UPDATE services 
       SET category_id = COALESCE(?, category_id),
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
        category_id ? Number(category_id) : null,
        name,
        cleanSlug,
        description,
        short_description,
        base_price,
        additional_price || '0.00',
        Number(duration_minutes) || 60,
        image_url || null,
        use_cases || '',
        is_homepage ? 1 : 0,
        is_trending ? 1 : 0,
        is_popular ? 1 : 0,
        is_active ? 1 : 0,
        skillsJson,
        meta_title || '',
        meta_description || '',
        keywords || '',
        existing.id,
      ]
    );

    return { id: existing.id, action: 'updated', slug: cleanSlug, name };
  } else {
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
