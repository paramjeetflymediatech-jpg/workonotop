import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'workontap_db',
    port: parseInt(process.env.DB_PORT || '3306'),
  });

  console.log('Connected to database:', process.env.DB_NAME || 'workontap_db');

  const migrations = [
    // 1. services table
    {
      table: 'services',
      column: 'skills',
      sql: 'ALTER TABLE services ADD COLUMN skills JSON NULL AFTER is_active',
    },
    {
      table: 'services',
      column: 'meta_title',
      sql: 'ALTER TABLE services ADD COLUMN meta_title VARCHAR(255) NULL AFTER skills',
    },
    {
      table: 'services',
      column: 'meta_description',
      sql: 'ALTER TABLE services ADD COLUMN meta_description TEXT NULL AFTER meta_title',
    },
    {
      table: 'services',
      column: 'keywords',
      sql: 'ALTER TABLE services ADD COLUMN keywords TEXT NULL AFTER meta_description',
    },

    // 2. service_categories table
    {
      table: 'service_categories',
      column: 'image_url',
      sql: 'ALTER TABLE service_categories ADD COLUMN image_url VARCHAR(255) NULL AFTER icon',
    },

    // 3. service_locations table
    {
      table: 'service_locations',
      column: 'og_title',
      sql: 'ALTER TABLE service_locations ADD COLUMN og_title VARCHAR(255) NULL AFTER canonical_url',
    },
    {
      table: 'service_locations',
      column: 'og_description',
      sql: 'ALTER TABLE service_locations ADD COLUMN og_description TEXT NULL AFTER og_title',
    },
    {
      table: 'service_locations',
      column: 'og_image',
      sql: 'ALTER TABLE service_locations ADD COLUMN og_image VARCHAR(255) NULL AFTER og_description',
    },
    {
      table: 'service_locations',
      column: 'description',
      sql: 'ALTER TABLE service_locations ADD COLUMN description LONGTEXT NULL AFTER custom_intro',
    },

    // 4. seo_settings table
    {
      table: 'seo_settings',
      column: 'robots',
      sql: "ALTER TABLE seo_settings ADD COLUMN robots VARCHAR(100) DEFAULT 'index, follow' AFTER canonical_url",
    },

    // 5. blogs table
    {
      table: 'blogs',
      column: 'short_content',
      sql: 'ALTER TABLE blogs ADD COLUMN short_content TEXT NULL AFTER content',
    },
    {
      table: 'blogs',
      column: 'canonical_url',
      sql: 'ALTER TABLE blogs ADD COLUMN canonical_url VARCHAR(255) NULL AFTER keywords',
    },
    {
      table: 'blogs',
      column: 'og_title',
      sql: 'ALTER TABLE blogs ADD COLUMN og_title VARCHAR(255) NULL AFTER canonical_url',
    },
    {
      table: 'blogs',
      column: 'og_description',
      sql: 'ALTER TABLE blogs ADD COLUMN og_description TEXT NULL AFTER og_title',
    },
  ];

  for (const item of migrations) {
    try {
      const [cols] = await connection.query(`SHOW COLUMNS FROM ${item.table} LIKE '${item.column}'`);
      if (cols.length === 0) {
        console.log(`Adding column '${item.column}' to '${item.table}'...`);
        await connection.query(item.sql);
        console.log(`✅ Added '${item.column}' to '${item.table}' successfully.`);
      } else {
        console.log(`ℹ️ Column '${item.column}' already exists in '${item.table}'.`);
      }
    } catch (err) {
      console.error(`❌ Error migrating ${item.table}.${item.column}:`, err.message);
    }
  }

  await connection.end();
  console.log('\nMigration completed!');
}

runMigration().catch(console.error);
