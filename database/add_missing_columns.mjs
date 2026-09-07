import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'workontap_db',
  waitForConnections: true,
  connectionLimit: 5,
});

async function addColumnIfNotExists(conn, table, column, columnDef) {
  const [rows] = await conn.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?
  `, [process.env.DB_NAME || 'workontap_db', table, column]);

  if (rows.length === 0) {
    console.log(`Adding column '${column}' to table '${table}'...`);
    await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${columnDef};`);
    console.log(` Added '${column}' to '${table}'.`);
  } else {
    console.log(` Column '${column}' already exists in '${table}'.`);
  }
}

async function run() {
  console.log('Connecting to database...');
  const conn = await pool.getConnection();

  try {
    console.log('Checking and adding missing columns...\n');

    // 1. Table: services
    await addColumnIfNotExists(conn, 'services', 'meta_title', 'VARCHAR(255) NULL AFTER `is_active`');
    await addColumnIfNotExists(conn, 'services', 'meta_description', 'TEXT NULL AFTER `meta_title`');
    await addColumnIfNotExists(conn, 'services', 'keywords', 'TEXT NULL AFTER `meta_description`');
    await addColumnIfNotExists(conn, 'services', 'skills', 'JSON NULL AFTER `is_active`');
    await addColumnIfNotExists(conn, 'services', 'use_cases', 'TEXT NULL AFTER `image_url`');
    await addColumnIfNotExists(conn, 'services', 'short_description', 'VARCHAR(500) NULL AFTER `description`');

    // 2. Table: seo_settings
    await conn.query(`
      CREATE TABLE IF NOT EXISTS seo_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        page_name VARCHAR(100) NOT NULL UNIQUE,
        meta_title VARCHAR(255),
        meta_description TEXT,
        keywords TEXT,
        canonical_url VARCHAR(255),
        robots VARCHAR(100) DEFAULT 'index, follow',
        og_title VARCHAR(255),
        og_description TEXT,
        og_image VARCHAR(255),
        header_scripts TEXT,
        footer_scripts TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    await addColumnIfNotExists(conn, 'seo_settings', 'robots', "VARCHAR(100) DEFAULT 'index, follow' AFTER `canonical_url`");
    await addColumnIfNotExists(conn, 'seo_settings', 'og_title', 'VARCHAR(255) NULL AFTER `robots`');
    await addColumnIfNotExists(conn, 'seo_settings', 'og_description', 'TEXT NULL AFTER `og_title`');
    await addColumnIfNotExists(conn, 'seo_settings', 'og_image', 'VARCHAR(255) NULL AFTER `og_description`');

    // 3. Table: service_locations
    await addColumnIfNotExists(conn, 'service_locations', 'meta_title', 'VARCHAR(255) NULL');
    await addColumnIfNotExists(conn, 'service_locations', 'meta_description', 'TEXT NULL');
    await addColumnIfNotExists(conn, 'service_locations', 'keywords', 'TEXT NULL');
    await addColumnIfNotExists(conn, 'service_locations', 'canonical_url', 'VARCHAR(255) NULL');
    await addColumnIfNotExists(conn, 'service_locations', 'og_title', 'VARCHAR(255) NULL');
    await addColumnIfNotExists(conn, 'service_locations', 'og_description', 'TEXT NULL');
    await addColumnIfNotExists(conn, 'service_locations', 'og_image', 'VARCHAR(255) NULL');

    // 4. Table: blogs
    await addColumnIfNotExists(conn, 'blogs', 'short_content', 'TEXT NULL AFTER `content`');
    await addColumnIfNotExists(conn, 'blogs', 'meta_title', 'VARCHAR(255) NULL');
    await addColumnIfNotExists(conn, 'blogs', 'meta_description', 'TEXT NULL');
    await addColumnIfNotExists(conn, 'blogs', 'keywords', 'TEXT NULL');
    await addColumnIfNotExists(conn, 'blogs', 'canonical_url', 'VARCHAR(255) NULL');
    await addColumnIfNotExists(conn, 'blogs', 'og_title', 'VARCHAR(255) NULL');
    await addColumnIfNotExists(conn, 'blogs', 'og_description', 'TEXT NULL');

    // 5. Table: service_categories
    await addColumnIfNotExists(conn, 'service_categories', 'image_url', 'VARCHAR(255) NULL AFTER `icon`');

    console.log('\n All database columns verified and updated successfully!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    conn.release();
    await pool.end();
  }
}

run();
