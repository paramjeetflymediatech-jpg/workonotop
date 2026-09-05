require('dotenv').config({ path: '.env' });
const mysql = require('mysql2/promise');

async function fix() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  // Just delete the invoices for booking 77 so they can be regenerated cleanly
  await pool.query('DELETE FROM invoices WHERE booking_id = 77');
  console.log('Deleted invoices for booking 77');

  process.exit(0);
}

fix();
