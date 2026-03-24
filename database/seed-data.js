// database/seed-data.js
// import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env") });

async function seedData() {
  // Use execute from shared db util - dynamic import to ensure dotenv is loaded
  const { execute } = await import('../src/lib/db.js');


  try {
    console.log('🌱 Seeding database with categories and services...\n');

    // Clear existing data (optional)
    console.log('Clearing existing data...');
    await execute('DELETE FROM services');
    await execute('DELETE FROM service_categories');
    console.log('✓ Existing data cleared\n');

    // Insert categories and store their IDs
    console.log('Inserting categories...');
    const categories = [
      { name: 'Cleaning', slug: 'cleaning', icon: 'brush-outline', description: 'Professional cleaning services for your home', display_order: 1 },
      { name: 'Plumbing', slug: 'plumbing', icon: 'water-outline', description: 'Plumbing repair and installation', display_order: 2 },
      { name: 'Electrical', slug: 'electrical', icon: 'flash-outline', description: 'Electrical maintenance and fix', display_order: 3 },
      { name: 'Repair', slug: 'repair', icon: 'build-outline', description: 'Expert general repair services', display_order: 4 },
      { name: 'Smart Home', slug: 'smart-home', icon: 'hardware-chip-outline', description: 'Security and tech installations', display_order: 5 },
      { name: 'Painting', slug: 'painting', icon: 'color-palette-outline', description: 'Interior and exterior painting', display_order: 6 },
      { name: 'Outdoor', slug: 'outdoor', icon: 'leaf-outline', description: 'Landscaping and outdoor care', display_order: 7 },
      { name: 'HVAC', slug: 'hvac', icon: 'thermometer-outline', description: 'Heating and cooling services', display_order: 8 }
    ];

    const categoryIds = {};

    for (const cat of categories) {
      const result = await execute(
        `INSERT INTO service_categories (name, slug, icon, description, display_order, is_active) 
         VALUES (?, ?, ?, ?, ?, 1)`,
        [cat.name, cat.slug, cat.icon, cat.description, cat.display_order]
      );
      // execute returns array of results, get insertId
      const insertId = Array.isArray(result) && result[0]?.insertId ? result[0].insertId : (result?.insertId || null);
      categoryIds[cat.name] = insertId;
      console.log(`  ✓ Inserted: ${cat.name} (ID: ${insertId})`);
    }
    console.log('');

    // Now insert services with correct category IDs
    console.log('Inserting services...');

    const services = [
      // Category: Cleaning
      [categoryIds['Cleaning'], 'Regular House Cleaning', 'house-cleaning',
        'Standard house cleaning including vacuuming, dusting, and mopping of all living areas.',
        'Trusted weekly cleaning', 80.00, 40.00, 120, 
        'https://images.unsplash.com/photo-1581578731548-c64695cc6958?q=80&w=600', 
        'Vacuuming,Mopping,Dusting', 1, 1, 1, 1],
      [categoryIds['Cleaning'], 'Deep Kitchen Cleaning', 'kitchen-clean',
        'Specialized deep cleaning for your kitchen including appliances, cabinets, and degreasing.',
        'Restore your kitchen sparkle', 120.00, 60.00, 150, 
        'https://images.unsplash.com/photo-1556911220-e15224bbafb0?q=80&w=600', 
        'Oven Cleaning,Degreasing,Cabinets', 0, 0, 1, 1],

      // Category: Plumbing
      [categoryIds['Plumbing'], 'Faucet & Leak Repair', 'faucet-repair',
        'Professional fix for leaky faucets, bathroom fixtures, and minor pipe leaks.',
        'Stop the drip', 90.00, 45.00, 60,
        'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=600',
        'Leaking,Fixtures,Kitchen', 1, 1, 1, 1],
      [categoryIds['Plumbing'], 'Drain Unblocking', 'drain-clear',
        'Safe and effective removal of clogs from sinks, toilets, and showers.',
        'Clear running drains', 110.00, 55.00, 90,
        'https://images.unsplash.com/photo-1542013936693-884638332954?q=80&w=600',
        'Sinks,Toilets,Main Line', 0, 1, 0, 1],

      // Category: Electrical
      [categoryIds['Electrical'], 'Outlet & Switch Repair', 'outlet-repair',
        'Safe repair or replacement of faulty electrical outlets and wall switches.',
        'Safe power connections', 100.00, 40.00, 60,
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600',
        'Outlets,Switches,Safety', 1, 1, 1, 1],
      [categoryIds['Electrical'], 'Lighting Installation', 'light-install',
        'Professional installation of ceiling lights, chandeliers, or outdoor lighting.',
        'Brighten your home', 150.00, 75.00, 120,
        'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?q=80&w=600',
        'Fixtures,Wiring,Mounting', 0, 1, 0, 1],

      // Category: Repair
      [categoryIds['Repair'], 'Appliance Diagnosis', 'appliance-check',
        'Expert inspection of major household appliances to find the root cause of issues.',
        'Expert appliance check', 80.00, 30.00, 45,
        'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=600',
        'Fridge,Washer,Dryer', 1, 0, 1, 1],
      [categoryIds['Repair'], 'Furniture Assembly', 'furniture-assembly',
        'Quick and professional assembly of any flat-pack furniture.',
        'Get it built right', 120.00, 60.00, 120,
        'https://images.unsplash.com/photo-1594489050100-3485d46e9640?q=80&w=600',
        'Desks,Beds,Cabinets', 0, 0, 0, 1],

      // Category: Smart Home
      [categoryIds['Smart Home'], 'Smart Lock Install', 'smart-lock',
        'Installation and app setup for all major smart door lock brands.',
        'Keyless home security', 140.00, 70.00, 90,
        'https://images.unsplash.com/photo-1558002038-1055907df827?q=80&w=600',
        'Security,Mobile App,Digital', 1, 1, 0, 1],
      [categoryIds['Smart Home'], 'Wi-Fi Network Setup', 'wifi-setup',
        'Set up mesh Wi-Fi or extenders for seamless internet coverage at home.',
        'Stronger internet signal', 160.00, 80.00, 120,
        'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=600',
        'Router,Mesh,Coverage', 0, 0, 1, 1],

      // Category: Painting
      [categoryIds['Painting'], 'Single Room Painting', 'room-paint',
        'Full service painting for one room including walls and minor prep.',
        'Fresh color for your room', 300.00, 150.00, 240,
        'https://images.unsplash.com/photo-1562564055-71e051d33c19?q=80&w=600',
        'Walls,Sanding,Prep', 1, 0, 0, 1],
      [categoryIds['Painting'], 'Trim & Door Painting', 'trim-paint',
        'Painting of baseboards, window trims, and internal doors for a crisp finish.',
        'Perfectly finished edges', 180.00, 90.00, 180,
        'https://images.unsplash.com/photo-1481277542470-605612bd2d61?q=80&w=600',
        'Trim,Doors,Detailing', 0, 1, 1, 1],

      // Category: Outdoor
      [categoryIds['Outdoor'], 'Lawn Mowing', 'lawn-mowing',
        'Professional lawn cut with edging and grass removal for a clean look.',
        'Clean manicured lawn', 70.00, 35.00, 90,
        'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=600',
        'Mowing,Edging,Cleanup', 1, 1, 1, 1],
      [categoryIds['Outdoor'], 'Pressure Washing', 'pressure-wash',
        'Deep cleaning of decks, patios, and walkways using high-pressure water.',
        'Restore outdoor surfaces', 120.00, 60.00, 120,
        'https://images.unsplash.com/photo-1627850604058-52e40de1b847?q=80&w=600',
        'Deck,Patio,Driveway', 0, 0, 0, 1],

      // Category: HVAC
      [categoryIds['HVAC'], 'AC Maintenance', 'ac-tuneup',
        'Annual checkup and cleaning of your air conditioning unit for optimal cooling.',
        'Summer ready AC', 110.00, 55.00, 90,
        'https://images.unsplash.com/photo-1631541909061-70e0883556fe?q=80&w=600',
        'Inspection,Cleaning,Filters', 1, 1, 1, 1],
      [categoryIds['HVAC'], 'Furnace Safety Check', 'furnace-check',
        'Essential safety inspection for your heating system before the winter season.',
        'Safe winter heating', 100.00, 50.00, 60,
        'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?q=80&w=600',
        'Safety,Heating,Efficiency', 0, 1, 0, 1]
    ];

    let serviceCount = 0;
    for (const service of services) {
      try {
        await execute(
          `INSERT INTO services (
            category_id, name, slug, description, short_description, 
            base_price, additional_price, duration_minutes, image_url, use_cases,
            is_homepage, is_trending, is_popular, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          service
        );
        serviceCount++;
        if (serviceCount % 3 === 0) process.stdout.write('.'); // Progress indicator
      } catch (error) {
        console.error(`\n❌ Error inserting service: ${service[2]}`, error.message);
      }
    }

    console.log(`\n✓ Inserted ${serviceCount} services\n`);

    // Verify counts
    const categoriesResult = await execute('SELECT COUNT(*) as count FROM service_categories');
    const servicesResult = await execute('SELECT COUNT(*) as count FROM services');

    console.log('✅ Seeding completed successfully!');
    console.log(`📊 Categories: ${categoriesResult[0].count}`);
    console.log(`📊 Services: ${servicesResult[0].count}`);

    // Show sample data
    const sampleCategories = await execute('SELECT id, name FROM service_categories LIMIT 3');
    console.log('\n📋 Sample categories:');
    sampleCategories.forEach(c => console.log(`   ${c.id}: ${c.name}`));

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedData();