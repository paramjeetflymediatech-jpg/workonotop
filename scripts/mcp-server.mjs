#!/usr/bin/env node

/**
 * WorkOnTap Model Context Protocol (MCP) Server
 * Exposes SEO and Service Catalog tools to AI assistants (ChatGPT, Claude Desktop, Cursor, etc.)
 */

import readline from 'readline';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

// Direct DB integration for the local MCP process
import mysql from 'mysql2/promise';

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root123',
      database: process.env.DB_NAME || 'workontap_db',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      waitForConnections: true,
      connectionLimit: 5,
    });
  }
  return pool;
}

// ----------------------------------------------------
// Tool Definitions
// ----------------------------------------------------
const TOOLS = [
  {
    name: 'list_seo_pages',
    description: 'List SEO settings across pages with options to filter for pages with missing metadata or search term.',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search term for page name or title' },
        only_missing: { type: 'boolean', description: 'If true, returns only pages missing meta title or description' },
        limit: { type: 'number', default: 20 },
      },
    },
  },
  {
    name: 'get_page_seo',
    description: 'Get the exact SEO metadata (title, description, keywords, canonical, OG tags) for a specific page route.',
    inputSchema: {
      type: 'object',
      required: ['page_name'],
      properties: {
        page_name: { type: 'string', description: 'The page route, e.g. /services/general-home-repairs or home' },
      },
    },
  },
  {
    name: 'update_page_seo',
    description: 'Update or create the SEO metadata for a specific page route in the WorkOnTap database.',
    inputSchema: {
      type: 'object',
      required: ['page_name'],
      properties: {
        page_name: { type: 'string', description: 'The page route, e.g. /services/general-home-repairs' },
        meta_title: { type: 'string', description: 'Target 50-60 character meta title' },
        meta_description: { type: 'string', description: 'Target 145-160 character meta description' },
        keywords: { type: 'string', description: 'Comma-separated target keywords' },
        canonical_url: { type: 'string', description: 'Canonical URL' },
        robots: { type: 'string', description: 'Crawler directives, e.g. index, follow' },
        og_title: { type: 'string', description: 'OpenGraph Title' },
        og_description: { type: 'string', description: 'OpenGraph Description' },
      },
    },
  },
  {
    name: 'list_services',
    description: 'List all service catalog offerings in the database with their categories, prices, and descriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        search: { type: 'string', description: 'Search filter' },
        category_id: { type: 'number', description: 'Category ID filter' },
      },
    },
  },
  {
    name: 'get_service_details',
    description: 'Get full service information by slug or ID, including rich HTML description and use cases.',
    inputSchema: {
      type: 'object',
      required: ['slug_or_id'],
      properties: {
        slug_or_id: { type: 'string', description: 'Service slug (e.g. general-home-repairs) or numerical ID' },
      },
    },
  },
  {
    name: 'create_or_update_service',
    description: 'Create a new service or update an existing service listing in the database.',
    inputSchema: {
      type: 'object',
      required: ['name'],
      properties: {
        name: { type: 'string', description: 'Service title' },
        slug: { type: 'string', description: 'URL slug (kebab-case)' },
        category_id: { type: 'number', description: 'Category ID' },
        short_description: { type: 'string', description: 'Short 1-2 sentence overview' },
        description: { type: 'string', description: 'Full HTML description' },
        use_cases: { type: 'string', description: 'Comma-separated use cases' },
        base_price: { type: 'string', description: 'Base price in CAD' },
        duration_minutes: { type: 'number', description: 'Duration in minutes' },
      },
    },
  },
];

// ----------------------------------------------------
// Tool Handlers
// ----------------------------------------------------
async function handleToolCall(name, args) {
  const db = getPool();

  switch (name) {
    case 'list_seo_pages': {
      let sql = 'SELECT id, page_name, meta_title, meta_description, keywords, canonical_url, robots, updated_at FROM seo_settings WHERE 1=1';
      const params = [];
      if (args.search) {
        sql += ' AND (LOWER(page_name) LIKE ? OR LOWER(meta_title) LIKE ?)';
        params.push(`%${args.search.toLowerCase()}%`, `%${args.search.toLowerCase()}%`);
      }
      if (args.only_missing) {
        sql += " AND (meta_title IS NULL OR meta_title = '' OR meta_description IS NULL OR meta_description = '')";
      }
      sql += ' ORDER BY id DESC LIMIT ?';
      params.push(Number(args.limit || 20));

      const [rows] = await db.query(sql, params);
      return { total_found: rows.length, pages: rows };
    }

    case 'get_page_seo': {
      const [rows] = await db.query('SELECT * FROM seo_settings WHERE LOWER(page_name) = ? LIMIT 1', [args.page_name.toLowerCase().trim()]);
      if (rows.length === 0) return { error: `SEO settings for '${args.page_name}' not found.` };
      return rows[0];
    }

    case 'update_page_seo': {
      const pageName = args.page_name.trim();
      const [existing] = await db.query('SELECT id FROM seo_settings WHERE LOWER(page_name) = ? LIMIT 1', [pageName.toLowerCase()]);

      if (existing.length > 0) {
        await db.query(
          `UPDATE seo_settings 
           SET meta_title = COALESCE(?, meta_title),
               meta_description = COALESCE(?, meta_description),
               keywords = COALESCE(?, keywords),
               canonical_url = COALESCE(?, canonical_url),
               robots = COALESCE(?, robots),
               og_title = COALESCE(?, og_title),
               og_description = COALESCE(?, og_description),
               updated_at = NOW()
           WHERE id = ?`,
          [
            args.meta_title || null,
            args.meta_description || null,
            args.keywords || null,
            args.canonical_url || null,
            args.robots || null,
            args.og_title || null,
            args.og_description || null,
            existing[0].id,
          ]
        );
        return { status: 'success', action: 'updated', page_name: pageName };
      } else {
        const [result] = await db.query(
          `INSERT INTO seo_settings (page_name, meta_title, meta_description, keywords, canonical_url, robots, og_title, og_description)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            pageName,
            args.meta_title || '',
            args.meta_description || '',
            args.keywords || '',
            args.canonical_url || '',
            args.robots || 'index, follow',
            args.og_title || '',
            args.og_description || '',
          ]
        );
        return { status: 'success', action: 'created', id: result.insertId, page_name: pageName };
      }
    }

    case 'list_services': {
      let sql = 'SELECT s.id, s.name, s.slug, s.base_price, s.short_description, sc.name as category_name FROM services s LEFT JOIN service_categories sc ON s.category_id = sc.id WHERE 1=1';
      const params = [];
      if (args.search) {
        sql += ' AND (LOWER(s.name) LIKE ? OR LOWER(s.slug) LIKE ?)';
        params.push(`%${args.search.toLowerCase()}%`, `%${args.search.toLowerCase()}%`);
      }
      if (args.category_id) {
        sql += ' AND s.category_id = ?';
        params.push(args.category_id);
      }
      sql += ' ORDER BY s.id DESC LIMIT 50';
      const [rows] = await db.query(sql, params);
      return { count: rows.length, services: rows };
    }

    case 'get_service_details': {
      const isId = !isNaN(Number(args.slug_or_id));
      const sql = `SELECT s.*, sc.name as category_name FROM services s LEFT JOIN service_categories sc ON s.category_id = sc.id WHERE ${isId ? 's.id = ?' : 's.slug = ?'} LIMIT 1`;
      const [rows] = await db.query(sql, [isId ? Number(args.slug_or_id) : args.slug_or_id]);
      if (rows.length === 0) return { error: 'Service not found' };
      return rows[0];
    }

    case 'create_or_update_service': {
      const slug = (args.slug || args.name).toLowerCase().trim().replace(/[\/]/g, '').replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      const [existing] = await db.query('SELECT id FROM services WHERE slug = ? LIMIT 1', [slug]);

      if (existing.length > 0) {
        await db.query(
          `UPDATE services SET name = ?, slug = ?, category_id = COALESCE(?, category_id), short_description = ?, description = ?, use_cases = ?, base_price = COALESCE(?, base_price), duration_minutes = COALESCE(?, duration_minutes), updated_at = NOW() WHERE id = ?`,
          [args.name, slug, args.category_id || null, args.short_description || '', args.description || '', args.use_cases || '', args.base_price || null, args.duration_minutes || null, existing[0].id]
        );
        return { status: 'success', action: 'updated', slug };
      } else {
        const [res] = await db.query(
          `INSERT INTO services (name, slug, category_id, short_description, description, use_cases, base_price, duration_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [args.name, slug, args.category_id || 1, args.short_description || '', args.description || '', args.use_cases || '', args.base_price || '0.00', args.duration_minutes || 60]
        );
        return { status: 'success', action: 'created', id: res.insertId, slug };
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ----------------------------------------------------
// JSON-RPC Model Context Protocol stdio Handler
// ----------------------------------------------------
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on('line', async (line) => {
  if (!line.trim()) return;

  try {
    const request = JSON.parse(line);
    const { id, method, params } = request;

    if (method === 'initialize') {
      const response = {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {},
          },
          serverInfo: {
            name: 'workontap-mcp-server',
            version: '1.0.0',
          },
        },
      };
      console.log(JSON.stringify(response));
      return;
    }

    if (method === 'tools/list') {
      const response = {
        jsonrpc: '2.0',
        id,
        result: {
          tools: TOOLS,
        },
      };
      console.log(JSON.stringify(response));
      return;
    }

    if (method === 'tools/call') {
      const { name, arguments: args } = params;
      try {
        const result = await handleToolCall(name, args || {});
        const response = {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          },
        };
        console.log(JSON.stringify(response));
      } catch (err) {
        const response = {
          jsonrpc: '2.0',
          id,
          result: {
            isError: true,
            content: [{ type: 'text', text: `Error executing ${name}: ${err.message}` }],
          },
        };
        console.log(JSON.stringify(response));
      }
      return;
    }

    // Default error for unhandled method
    console.log(JSON.stringify({
      jsonrpc: '2.0',
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    }));
  } catch (err) {
    console.error('MCP parse error:', err);
  }
});
