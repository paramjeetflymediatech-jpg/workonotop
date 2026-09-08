import db from '@/lib/db';

/**
 * Fetch list of service locations with filters
 */
export async function getServiceLocationsList({
  serviceSlug = '',
  locationSlug = '',
  search = '',
  onlyMissing = false,
  limit = 50,
  offset = 0,
} = {}) {
  let sql = `
    SELECT 
      sl.*,
      s.name as service_name,
      s.slug as service_slug,
      s.base_price,
      s.description as service_description
    FROM service_locations sl
    JOIN services s ON sl.service_id = s.id
    WHERE 1=1
  `;
  const params = [];

  if (serviceSlug) {
    sql += ' AND s.slug = ?';
    params.push(serviceSlug);
  }

  if (locationSlug) {
    const cleanLoc = locationSlug.startsWith('in-') ? locationSlug.substring(3) : locationSlug;
    sql += ' AND (sl.location_slug = ? OR sl.location_slug = ? OR LOWER(sl.location_name) = ?)';
    params.push(cleanLoc, locationSlug, cleanLoc.replace(/-/g, ' '));
  }

  if (search) {
    sql += ' AND (LOWER(sl.location_name) LIKE ? OR LOWER(s.name) LIKE ? OR LOWER(sl.slug) LIKE ? OR LOWER(COALESCE(sl.description, \'\')) LIKE ?)';
    const term = `%${search.toLowerCase()}%`;
    params.push(term, term, term, term);
  }

  if (onlyMissing) {
    sql += ' AND (sl.description IS NULL OR sl.description = \'\' OR sl.meta_description IS NULL OR sl.meta_description = \'\')';
  }

  sql += ' ORDER BY sl.location_name ASC, s.name ASC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const rows = await db.query(sql, params);

  // Total count
  let countSql = `
    SELECT COUNT(*) as total
    FROM service_locations sl
    JOIN services s ON sl.service_id = s.id
    WHERE 1=1
  `;
  const countParams = [];

  if (serviceSlug) {
    countSql += ' AND s.slug = ?';
    countParams.push(serviceSlug);
  }
  if (locationSlug) {
    const cleanLoc = locationSlug.startsWith('in-') ? locationSlug.substring(3) : locationSlug;
    countSql += ' AND (sl.location_slug = ? OR sl.location_slug = ? OR LOWER(sl.location_name) = ?)';
    countParams.push(cleanLoc, locationSlug, cleanLoc.replace(/-/g, ' '));
  }
  if (search) {
    countSql += ' AND (LOWER(sl.location_name) LIKE ? OR LOWER(s.name) LIKE ? OR LOWER(sl.slug) LIKE ? OR LOWER(COALESCE(sl.description, \'\')) LIKE ?)';
    const term = `%${search.toLowerCase()}%`;
    countParams.push(term, term, term, term);
  }
  if (onlyMissing) {
    countSql += ' AND (sl.description IS NULL OR sl.description = \'\' OR sl.meta_description IS NULL OR sl.meta_description = \'\')';
  }

  const countRows = await db.query(countSql, countParams);
  const total = countRows[0]?.total || 0;

  return { rows: rows || [], total };
}

/**
 * Get single service location by ID, slug, or service_id + location_slug
 */
export async function getServiceLocationDetails(identifier) {
  if (!identifier) return null;
  const isId = typeof identifier === 'number' || (!isNaN(Number(identifier)) && !String(identifier).includes('-'));

  let sql = `
    SELECT 
      sl.*,
      s.name as service_name,
      s.slug as service_slug,
      s.base_price,
      s.description as service_description
    FROM service_locations sl
    JOIN services s ON sl.service_id = s.id
    WHERE ${isId ? 'sl.id = ?' : '(sl.slug = ? OR sl.slug = ? OR sl.slug = ?)'}
    LIMIT 1
  `;

  const str = String(identifier).trim();
  const params = isId
    ? [Number(identifier)]
    : [str, str.replace(/-in-/, '-'), str.replace(/-/, '-in-')];

  const rows = await db.query(sql, params);
  return rows[0] || null;
}

/**
 * Create or Update Service Location
 */
export async function upsertServiceLocation(data) {
  const {
    id,
    service_id,
    service_slug,
    location_name,
    location_slug,
    slug,
    description,
    custom_heading,
    custom_intro,
    meta_title,
    meta_description,
    keywords,
    canonical_url,
    og_title,
    og_description,
    og_image,
    is_active,
  } = data;

  // Resolve service_id if only service_slug is provided
  let resolvedServiceId = service_id;
  let resolvedServiceSlug = service_slug;

  if (!resolvedServiceId && service_slug) {
    const sRows = await db.query('SELECT id, slug, name FROM services WHERE slug = ? LIMIT 1', [service_slug]);
    if (sRows && sRows.length > 0) {
      resolvedServiceId = sRows[0].id;
      resolvedServiceSlug = sRows[0].slug;
    }
  }

  if (resolvedServiceId && !resolvedServiceSlug) {
    const sRows = await db.query('SELECT id, slug, name FROM services WHERE id = ? LIMIT 1', [resolvedServiceId]);
    if (sRows && sRows.length > 0) {
      resolvedServiceSlug = sRows[0].slug;
    }
  }

  // Check if updating an existing record
  let existing = null;
  if (id) {
    existing = await getServiceLocationDetails(id);
  } else if (slug) {
    existing = await getServiceLocationDetails(slug);
  } else if (resolvedServiceId && location_slug) {
    const cleanLoc = location_slug.startsWith('in-') ? location_slug.substring(3) : location_slug;
    const rows = await db.query(
      'SELECT * FROM service_locations WHERE service_id = ? AND (location_slug = ? OR location_slug = ?) LIMIT 1',
      [resolvedServiceId, cleanLoc, location_slug]
    );
    existing = rows[0] || null;
  }

  if (existing) {
    const finalDescription = description !== undefined ? description : existing.description;
    const finalCustomHeading = custom_heading !== undefined ? custom_heading : existing.custom_heading;
    const finalCustomIntro = custom_intro !== undefined ? custom_intro : existing.custom_intro;
    const finalMetaTitle = meta_title !== undefined ? meta_title : existing.meta_title;
    const finalMetaDescription = meta_description !== undefined ? meta_description : existing.meta_description;
    const finalKeywords = keywords !== undefined ? keywords : existing.keywords;
    const finalCanonicalUrl = canonical_url !== undefined ? canonical_url : existing.canonical_url;
    const finalOgTitle = og_title !== undefined ? og_title : existing.og_title;
    const finalOgDescription = og_description !== undefined ? og_description : existing.og_description;
    const finalOgImage = og_image !== undefined ? og_image : existing.og_image;
    const finalIsActive = is_active !== undefined ? (is_active ? 1 : 0) : existing.is_active;

    await db.query(
      `UPDATE service_locations
       SET description = ?,
           custom_heading = ?,
           custom_intro = ?,
           meta_title = ?,
           meta_description = ?,
           keywords = ?,
           canonical_url = ?,
           og_title = ?,
           og_description = ?,
           og_image = ?,
           is_active = ?,
           updated_at = NOW()
       WHERE id = ?`,
      [
        finalDescription,
        finalCustomHeading,
        finalCustomIntro,
        finalMetaTitle,
        finalMetaDescription,
        finalKeywords,
        finalCanonicalUrl,
        finalOgTitle,
        finalOgDescription,
        finalOgImage,
        finalIsActive,
        existing.id,
      ]
    );

    return {
      id: existing.id,
      action: 'updated',
      slug: existing.slug,
      service_id: existing.service_id,
      location_name: existing.location_name,
    };
  } else {
    if (!resolvedServiceId) {
      throw new Error('service_id or valid service_slug is required to create a new service location');
    }
    if (!location_name && !location_slug) {
      throw new Error('location_name or location_slug is required');
    }

    const finalLocName = location_name || location_slug.replace(/-/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
    const rawLocSlug = (location_slug || location_name || '')
      .toLowerCase()
      .trim()
      .replace(/[^\\w\\s-]/g, '')
      .replace(/\\s+/g, '-');
    const finalLocSlug = rawLocSlug.startsWith('in-') ? rawLocSlug.substring(3) : rawLocSlug;
    const finalComboSlug = slug || `${resolvedServiceSlug}-${finalLocSlug}`;

    const result = await db.query(
      `INSERT INTO service_locations
       (service_id, location_name, location_slug, slug, description, custom_heading, custom_intro, meta_title, meta_description, keywords, canonical_url, og_title, og_description, og_image, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resolvedServiceId,
        finalLocName,
        finalLocSlug,
        finalComboSlug,
        description || null,
        custom_heading || null,
        custom_intro || null,
        meta_title || null,
        meta_description || null,
        keywords || null,
        canonical_url || null,
        og_title || null,
        og_description || null,
        og_image || null,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
      ]
    );

    return {
      id: result.insertId,
      action: 'created',
      slug: finalComboSlug,
      service_id: resolvedServiceId,
      location_name: finalLocName,
    };
  }
}

/**
 * Delete Service Location
 */
export async function deleteServiceLocation(idOrSlug) {
  if (typeof idOrSlug === 'number' || (!isNaN(Number(idOrSlug)) && !String(idOrSlug).includes('-'))) {
    await db.query('DELETE FROM service_locations WHERE id = ?', [Number(idOrSlug)]);
  } else {
    await db.query('DELETE FROM service_locations WHERE slug = ?', [String(idOrSlug).trim()]);
  }
  return { success: true };
}
