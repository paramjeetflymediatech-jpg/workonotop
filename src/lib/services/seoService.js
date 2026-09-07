import db from '@/lib/db';

/**
 * Fetch list of SEO settings with search and filter capabilities
 */
export async function getSeoSettings({ search = '', onlyMissing = false, limit = 50, offset = 0 } = {}) {
  let sql = 'SELECT * FROM seo_settings WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (LOWER(page_name) LIKE ? OR LOWER(meta_title) LIKE ?)';
    const term = `%${search.toLowerCase()}%`;
    params.push(term, term);
  }

  if (onlyMissing) {
    sql += " AND (meta_title IS NULL OR meta_title = '' OR meta_description IS NULL OR meta_description = '')";
  }

  sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const rows = await db.query(sql, params);

  // Also get total count
  let countSql = 'SELECT COUNT(*) as total FROM seo_settings WHERE 1=1';
  const countParams = [];
  if (search) {
    countSql += ' AND (LOWER(page_name) LIKE ? OR LOWER(meta_title) LIKE ?)';
    const term = `%${search.toLowerCase()}%`;
    countParams.push(term, term);
  }
  if (onlyMissing) {
    countSql += " AND (meta_title IS NULL OR meta_title = '' OR meta_description IS NULL OR meta_description = '')";
  }
  const countRows = await db.query(countSql, countParams);
  const total = countRows[0]?.total || 0;

  return { rows: rows || [], total };
}

/**
 * Get single page SEO by page_name
 */
export async function getSeoForPage(pageName) {
  if (!pageName) return null;
  const clean = pageName.trim();
  const rows = await db.query(
    'SELECT * FROM seo_settings WHERE LOWER(page_name) = ? LIMIT 1',
    [clean.toLowerCase()]
  );
  return rows[0] || null;
}

/**
 * Insert or Update SEO Settings for a page
 */
export async function upsertSeoSetting(data) {
  const {
    page_name,
    meta_title = '',
    meta_description = '',
    keywords = '',
    canonical_url = '',
    robots = 'index, follow',
    og_title = '',
    og_description = '',
    og_image = '',
    header_scripts = '',
    footer_scripts = '',
  } = data;

  if (!page_name || typeof page_name !== 'string') {
    throw new Error('page_name is required');
  }

  const cleanPageName = page_name.trim();

  // Check if setting exists
  const existing = await getSeoForPage(cleanPageName);

  if (existing) {
    await db.query(
      `UPDATE seo_settings 
       SET meta_title = ?, meta_description = ?, keywords = ?, canonical_url = ?, 
           robots = ?, og_title = ?, og_description = ?, og_image = ?, 
           header_scripts = ?, footer_scripts = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        meta_title !== undefined ? meta_title : existing.meta_title,
        meta_description !== undefined ? meta_description : existing.meta_description,
        keywords !== undefined ? keywords : existing.keywords,
        canonical_url !== undefined ? canonical_url : existing.canonical_url,
        robots !== undefined ? robots : existing.robots,
        og_title !== undefined ? og_title : existing.og_title,
        og_description !== undefined ? og_description : existing.og_description,
        og_image !== undefined ? og_image : existing.og_image,
        header_scripts !== undefined ? header_scripts : existing.header_scripts,
        footer_scripts !== undefined ? footer_scripts : existing.footer_scripts,
        existing.id,
      ]
    );

    return { id: existing.id, action: 'updated', page_name: cleanPageName };
  } else {
    const result = await db.query(
      `INSERT INTO seo_settings 
       (page_name, meta_title, meta_description, keywords, canonical_url, robots, og_title, og_description, og_image, header_scripts, footer_scripts)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cleanPageName,
        meta_title || '',
        meta_description || '',
        keywords || '',
        canonical_url || '',
        robots || 'index, follow',
        og_title || '',
        og_description || '',
        og_image || '',
        header_scripts || '',
        footer_scripts || '',
      ]
    );

    return { id: result.insertId, action: 'created', page_name: cleanPageName };
  }
}

/**
 * Delete SEO Setting
 */
export async function deleteSeoSetting(pageNameOrId) {
  if (typeof pageNameOrId === 'number' || !isNaN(Number(pageNameOrId))) {
    await db.query('DELETE FROM seo_settings WHERE id = ?', [Number(pageNameOrId)]);
  } else {
    await db.query('DELETE FROM seo_settings WHERE LOWER(page_name) = ?', [String(pageNameOrId).toLowerCase().trim()]);
  }
  return { success: true };
}
