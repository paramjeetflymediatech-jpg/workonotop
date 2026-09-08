import 'dotenv/config';
import mysql from 'mysql2/promise';

const LOCATIONS = [
  { name: 'Surrey', slug: 'surrey' },
  { name: 'Burnaby', slug: 'burnaby' },
  { name: 'Richmond', slug: 'richmond' },
  { name: 'Coquitlam', slug: 'coquitlam' },
  { name: 'Langley Township', slug: 'langley-township' },
  { name: 'Delta', slug: 'delta' },
  { name: 'Maple Ridge', slug: 'maple-ridge' },
  { name: 'North Vancouver District', slug: 'north-vancouver-district' },
  { name: 'New Westminster', slug: 'new-westminster' },
  { name: 'Port Coquitlam', slug: 'port-coquitlam' },
  { name: 'North Vancouver City', slug: 'north-vancouver-city' },
  { name: 'West Vancouver', slug: 'west-vancouver' },
  { name: 'Port Moody', slug: 'port-moody' },
  { name: 'Langley City', slug: 'langley-city' },
  { name: 'Pitt Meadows', slug: 'pitt-meadows' },
  { name: 'White Rock', slug: 'white-rock' },
  { name: 'Metro Vancouver', slug: 'metro-vancouver' }
];

async function runAlterAndSeed() {
  console.log('🚀 Starting Complete Locations & SEO Alter/Seed Script...');

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root123',
      database: process.env.DB_NAME || 'workontap_db',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      multipleStatements: true
    });

    console.log(`✅ Connected to MySQL database: ${process.env.DB_NAME || 'workontap_db'}`);

    // 1. Create states, districts, cities tables if not exist
    const locationTablesSQL = `
      CREATE TABLE IF NOT EXISTS states (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL UNIQUE,
          code VARCHAR(20),
          is_active TINYINT(1) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS districts (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          state_id INT NOT NULL,
          is_active TINYINT(1) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS cities (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          slug VARCHAR(100) NOT NULL UNIQUE,
          district_id INT NOT NULL,
          is_active TINYINT(1) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS skills (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL UNIQUE,
          is_active TINYINT(1) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await connection.query(locationTablesSQL);
    console.log('✅ Created tables: states, districts, cities (if not exist)');

    // 1.5 Auto-migrate existing tables that might be missing the new columns
    try {
      await connection.query('ALTER TABLE states ADD COLUMN code VARCHAR(20) AFTER name');
      console.log('✅ Migrated: Added code column to states');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') {
        // Ignore duplicate field name error, throw otherwise
      }
    }
    
    try {
      await connection.query('ALTER TABLE cities ADD COLUMN slug VARCHAR(100) AFTER name');
      console.log('✅ Migrated: Added slug column to cities');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') {
        // Ignore duplicate field name error, throw otherwise
      }
    }

    // 2. Insert British Columbia state & Metro Vancouver district
    await connection.query(
      `INSERT IGNORE INTO states (id, name, code, is_active) VALUES (1, 'British Columbia', 'BC', 1)`
    );
    await connection.query(
      `INSERT IGNORE INTO districts (id, name, state_id, is_active) VALUES (1, 'Metro Vancouver', 1, 1)`
    );
    console.log('✅ Ensured State (British Columbia) and District (Metro Vancouver)');

    // 3. Insert all 17 cities into cities table
    for (const loc of LOCATIONS) {
      await connection.query(
        `INSERT INTO cities (name, slug, district_id, is_active)
         VALUES (?, ?, 1, 1)
         ON DUPLICATE KEY UPDATE name = VALUES(name), is_active = 1`,
        [loc.name, loc.slug]
      );
    }
    console.log(`✅ Seeded ${LOCATIONS.length} cities into 'cities' table`);

    // 4. Ensure seo_settings table exists
    const createSeoSettingsSQL = `
      CREATE TABLE IF NOT EXISTS seo_settings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          page_name VARCHAR(100) UNIQUE NOT NULL,
          meta_title VARCHAR(255),
          meta_description TEXT,
          keywords TEXT,
          canonical_url VARCHAR(255),
          og_title VARCHAR(255),
          og_description TEXT,
          og_image VARCHAR(255),
          header_scripts TEXT,
          footer_scripts TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
      INSERT IGNORE INTO seo_settings (page_name, meta_title, meta_description)
      VALUES ('global', 'WorkOnTap', 'Find the best local home service professionals');
    `;
    await connection.query(createSeoSettingsSQL);
    console.log('✅ Created table seo_settings (if not exists)');

    // 5. Ensure service_locations table exists
    const createServiceLocationsSQL = `
      CREATE TABLE IF NOT EXISTS service_locations (
          id INT PRIMARY KEY AUTO_INCREMENT,
          service_id INT NOT NULL,
          location_name VARCHAR(200) NOT NULL,
          location_slug VARCHAR(200) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          meta_title VARCHAR(255),
          meta_description TEXT,
          keywords TEXT,
          canonical_url VARCHAR(255),
          custom_heading VARCHAR(255),
          custom_intro TEXT,
          description LONGTEXT,
          is_active TINYINT(1) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
          UNIQUE KEY unique_service_location (service_id, location_slug)
      );
    `;
    await connection.query(createServiceLocationsSQL);
    console.log('✅ Created table service_locations (if not exists)');

    try {
      await connection.query('ALTER TABLE service_locations ADD COLUMN description LONGTEXT AFTER custom_intro');
      console.log('✅ Migrated: Added description column to service_locations');
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME') {
        // Ignore duplicate field name error
      }
    }

    // 6. Query active services
    let [services] = await connection.query('SELECT id, name, slug, description FROM services WHERE is_active = 1');
    
    if (services.length === 0) {
      console.log('ℹ️ No active services found. Seeding default services...');
      await connection.query(
        `INSERT IGNORE INTO service_categories (name, slug, icon, description, display_order, is_active)
         VALUES ('Plumbing', 'plumbing', 'water-outline', 'Plumbing repair & maintenance', 1, 1)`
      );
      const [cats] = await connection.query(`SELECT id FROM service_categories WHERE slug = 'plumbing' LIMIT 1`);
      if (cats.length > 0) {
        await connection.query(
          `INSERT IGNORE INTO services (category_id, name, slug, description, short_description, base_price, is_active)
           VALUES (?, 'Plumbing Services', 'plumbing', 'Professional plumbing services for your home and business.', 'Expert local plumbing fixes', 90.00, 1)`,
          [cats[0].id]
        );
      }
      const [newServices] = await connection.query('SELECT id, name, slug, description FROM services WHERE is_active = 1');
      services = newServices;
    }

    console.log(`📋 Found ${services.length} active service(s)`);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://workontap.com';
    let seededCount = 0;

    for (const service of services) {
      for (const loc of LOCATIONS) {
        const comboSlug = `${service.slug}-${loc.slug}`;
        const metaTitle = `Best ${service.name} Services in ${loc.name}, BC | WorkOnTap`;
        const metaDesc = `Looking for trusted ${service.name.toLowerCase()} in ${loc.name}, BC? Book top-rated local professionals on WorkOnTap. Fast response & guaranteed quality service!`;
        const keywords = `${service.name} ${loc.name}, ${service.name} services ${loc.name} BC, book ${service.name.toLowerCase()} ${loc.name}, local pros ${loc.name}, home services ${loc.name}`;
        const canonical = `${baseUrl}/services/${service.slug}/${loc.slug}`;
        const customHeading = `#1 Rated ${service.name} Pros in ${loc.name}, BC`;
        const customIntro = `Need reliable ${service.name.toLowerCase()} services in ${loc.name}? WorkOnTap connects you with verified local background-checked specialists ready to handle your job.`;

        await connection.query(
          `INSERT INTO service_locations 
            (service_id, location_name, location_slug, slug, meta_title, meta_description, keywords, canonical_url, custom_heading, custom_intro, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
           ON DUPLICATE KEY UPDATE 
            meta_title = COALESCE(meta_title, VALUES(meta_title)),
            meta_description = COALESCE(meta_description, VALUES(meta_description)),
            keywords = COALESCE(keywords, VALUES(keywords)),
            canonical_url = COALESCE(canonical_url, VALUES(canonical_url)),
            custom_heading = COALESCE(custom_heading, VALUES(custom_heading)),
            custom_intro = COALESCE(custom_intro, VALUES(custom_intro))`,
          [
            service.id,
            loc.name,
            loc.slug,
            comboSlug,
            metaTitle,
            metaDesc,
            keywords,
            canonical,
            customHeading,
            customIntro
          ]
        );
        seededCount++;
      }
    }

    console.log(`🎉 Successfully created/updated ${seededCount} service location SEO records!`);
  } catch (error) {
    console.error('❌ Error executing script:', error);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runAlterAndSeed();
