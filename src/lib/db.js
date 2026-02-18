
// src/lib/db.js
import mysql from 'mysql2/promise';

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'workontap',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// For SELECT, INSERT, UPDATE, DELETE - use execute (prepared statements)
export async function execute(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

// For transactions and commands that don't support prepared statements
export async function query(sql, params = []) {
  try {
    const connection = await pool.getConnection();
    try {
      // Use query() instead of execute() for START TRANSACTION, COMMIT, ROLLBACK
      const [results] = await connection.query(sql, params);
      return results;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// For transactions - get a connection
export async function getConnection() {
  return await pool.getConnection();
}

export default { execute, query, getConnection };
