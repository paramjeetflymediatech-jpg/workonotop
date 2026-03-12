const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'aman',
    password: 'aman1234',
    database: 'workontap_db',
  });

  try {
    console.log('Connected to database');
    
    // Check if column exists
    const [rows] = await connection.query("SHOW COLUMNS FROM users LIKE 'image_url'");
    
    if (rows.length === 0) {
      await connection.execute('ALTER TABLE users ADD COLUMN image_url VARCHAR(255) AFTER receive_offers');
      console.log('Column image_url added to users table');
    } else {
      console.log('Column image_url already exists');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

main();
