require('dotenv').config();
const mysql = require('mysql2/promise');
async function run() {
  const db = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  const [rows] = await db.query('DESCRIBE invoices');
  console.log(rows.map(r => r.Field));
  db.end();
}
run();
