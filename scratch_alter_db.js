const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root123',
    database: process.env.DB_NAME || 'workontap_db',
  });

  try {
    console.log('Altering bookings table...');
    await pool.query('ALTER TABLE bookings MODIFY job_date VARCHAR(255) NOT NULL;');
    console.log('Altering invoices table...');
    await pool.query('ALTER TABLE invoices MODIFY job_date VARCHAR(255) NOT NULL;');
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    process.exit(0);
  }
}

run();
