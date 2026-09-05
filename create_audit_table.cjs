require('dotenv').config();
const mysql = require('mysql2/promise');
async function run() {
  const db = await mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  await db.query(`CREATE TABLE IF NOT EXISTS booking_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    admin_id INT,
    old_worker_count INT,
    new_worker_count INT,
    old_actual_duration INT,
    new_actual_duration INT,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  console.log('Table created');
  db.end();
}
run();
