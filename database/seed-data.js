// database/seed-data.js
// import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../.env") });

async function seedData() {

  // Use execute from shared db util
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
      { name: 'Cleaning', slug: 'cleaning', icon: '🧹', description: 'Professional cleaning services for your home', display_order: 1 },
      { name: 'Indoors', slug: 'indoors', icon: '🏠', description: 'Interior maintenance and repairs', display_order: 2 },
      { name: 'Install', slug: 'install', icon: '🔧', description: 'Installation services for appliances and fixtures', display_order: 3 },
      { name: 'Repair', slug: 'repair', icon: '🛠️', description: 'Expert repair services', display_order: 4 },
      { name: 'Outdoors', slug: 'outdoors', icon: '🌳', description: 'Outdoor maintenance and landscaping', display_order: 5 },
      { name: 'Seasonal', slug: 'seasonal', icon: '❄️', description: 'Seasonal services and maintenance', display_order: 6 }
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
      // Category: Install (ID: categoryIds['Install'])
      [categoryIds['Install'], 'Appliance Install', 'appliance-install', 
       'Professional appliance installation including dishwashers, washers, dryers, fridges, and more',
       'Install dishwashers, washers, dryers, and more', 180.00, 90.00, 120, null, null, 0, 0, 0, 1],
      
      [categoryIds['Install'], 'Dishwasher Install', 'dishwasher-install',
       'Expert dishwasher installation with proper plumbing connections',
       'Professional dishwasher installation', 180.00, 0.00, 90, null, null, 0, 0, 0, 1],
      
      [categoryIds['Install'], 'Washer/Dryer Install', 'washer-dryer-install',
       'Complete washer and dryer installation service',
       'Washer and dryer setup', 200.00, 100.00, 120, null, null, 0, 0, 0, 1],
      
      [categoryIds['Install'], 'Range/Oven Install', 'range-oven-install',
       'Safe installation of ranges and ovens',
       'Range and oven installation', 220.00, 0.00, 120, null, null, 0, 0, 0, 1],
      
      // Category: Repair
      [categoryIds['Repair'], 'Appliance Repair', 'appliance-repair',
       'Technicians will diagnose and advise on the best solution for your troubled appliance. For gas stoves/ranges, please request in the Gas Services category.',
       'Appliance Repair in Calgary', 150.00, 100.00, 60,
       'https://d1yejvhi932hco.cloudfront.net/production/service/images/26/und_image_328/f0c51697-8edf-4cee-8fed-91523c995ce3.png',
       'Dishwasher Repair,Washer Repair,Dryer Repair,Range Repair,Fridge Repair,Hood Repair,Fan Repair,And much more!', 1, 0, 0, 1],
      
      [categoryIds['Repair'], 'Bathtub & Shower Caulking', 'bathtub-&-shower-caulking',
       'Recaulking joints around your bathtub, shower, backsplash & vanity ensures you\'re not letting water seep through, along with limiting dirt and mould build up. Pros remove old caulking and apply a fresh silicone caulk.',
       'Bathtub & Shower Caulking in Calgary', 120.00, 60.00, 60,
       'https://d1yejvhi932hco.cloudfront.net/production/service/images/80/und_image_328/c9641306-f647-41ad-895c-1ff4188d8614.jpg',
       'Bathtub,Shower,Backsplash,Vanity,And much more!', 1, 0, 0, 1],
      
      [categoryIds['Repair'], 'Decks & Fences', 'decks-&-fences',
       'Design, new builds and repair of decks and fences of all shapes, sizes and types of material preferred.',
       'Decks & Fences in Calgary', 35.00, 10.00, 30,
       'https://d1yejvhi932hco.cloudfront.net/production/service/images/42/und_image_328/53f5e849-f0fb-4944-82d6-e993a6223cd5.jpg',
       'Deck Repair,New Deck Build,Fence Repair,New Fence Build,Deck & Fence Extensions,Post Replacement,Board Replacement,And much more!', 0, 0, 0, 1],
      
      // Category: Cleaning
      [categoryIds['Cleaning'], 'Appliance Install', 'Appliance-Install',
       'Appliance Install in Calgary',
       'Appliance Install', 180.00, 90.00, 120,
       'https://d1yejvhi932hco.cloudfront.net/production/service/images/34/und_image_328/57e5cfb2-5d12-481b-97de-c826e6b53e65.png',
       'Dishwasher Install,Washer Install,Dryer Install,Range Install,Garbage Disposal Install,Fridge Install,Hood Fan Install,Appliance Uninstallation', 1, 0, 0, 1],
      
      [categoryIds['Cleaning'], 'Ac Installation', 'ac-installation',
       'testing the service page creating test data',
       'fix ac problem', 40.00, 90.00, 1, null, null, 0, 0, 0, 1],
      
      // Category: Indoors
      [categoryIds['Indoors'], 'Bathtub & Shower Caulking', 'bathtub-shower-caulking',
       'Professional caulking services for bathrooms',
       'Seal and waterproof your bathroom', 100.00, 0.00, 60, null, null, 0, 0, 0, 1],
      
      [categoryIds['Indoors'], 'Furniture Assembly', 'furniture-assembly',
       'Expert furniture assembly service',
       'Assemble any furniture', 80.00, 40.00, 90, null, null, 0, 0, 0, 1],
      
      // Category: Outdoors
      [categoryIds['Outdoors'], 'Carpet & Upholstery', 'Carpet-&-Upholstery',
       '$60/room is based on wall-to-wall carpet in bedrooms. Area rugs are $1.75/sqf (on-site), upholstery is $40/seat and steps are $4/step. Large common rooms, special stain treatments and off-site rug cleaning (if necessary) are extra and will be quoted by your Pro. $180 minimum applies to all jobs.',
       'Carpet & Upholstery Cleaning in Calgary', 180.00, 60.00, 60,
       'https://d1yejvhi932hco.cloudfront.net/production/service/images/10/und_image_328/8477d4a2-4db3-4fca-90bd-555ac20bdf2c.png',
       'Carpets,Area Rugs,Sofa,Loveseats,Chairs,Sectional Couches,Stairs,Outdoor Furniture,And much more!', 0, 0, 0, 1],
      
      [categoryIds['Outdoors'], 'Carpet & Upholstery Cleaning', 'carpet-&-upholstery-cleaning',
       '$60/room is based on wall-to-wall carpet in bedrooms. Area rugs are $1.75/sqf (on-site), upholstery is $40/seat and steps are $4/step. Large common rooms, special stain treatments and off-site rug cleaning (if necessary) are extra and will be quoted by your Pro. $180 minimum applies to all jobs.',
       'Carpet & Upholstery Cleaning in Calgary', 180.00, 60.00, 180,
       'https://d1yejvhi932hco.cloudfront.net/production/service/images/10/und_image_328/8477d4a2-4db3-4fca-90bd-555ac20bdf2c.png',
       'Carpets,Area Rugs,Sofa,Loveseats,Chairs,Sectional Couches,Stairs,Outdoor Furniture,And much more', 1, 0, 0, 1]
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
    const [categoriesResult] = await execute('SELECT COUNT(*) as count FROM service_categories');
    const [servicesResult] = await execute('SELECT COUNT(*) as count FROM services');
    
    console.log('✅ Seeding completed successfully!');
    console.log(`📊 Categories: ${categoriesResult[0].count}`);
    console.log(`📊 Services: ${servicesResult[0].count}`);
    
    // Show sample data
    const [sampleCategories] = await execute('SELECT id, name FROM service_categories LIMIT 3');
    console.log('\n📋 Sample categories:');
    sampleCategories.forEach(c => console.log(`   ${c.id}: ${c.name}`));

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

seedData();