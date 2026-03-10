
// src/lib/db.js
import mysql from 'mysql2/promise';

// Create connection pool with sensible defaults.  We set a small
// connectionLimit and make the pool wait if all connections are in use so
// we don't hit "Too many connections" errors.  The original problem
// reported by the user was that connections were never released when
// callers used `getConnection()` manually, so every API handler needs to
// either release or, preferably, run inside the helper below.
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root123',
  database: process.env.DB_NAME || 'workontap_db',
  // ✨ adjusted per request
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Helper that gives you a connection, automatically releases it when the
// callback finishes (even if it throws).  All API routes should use this
// instead of calling `getConnection()` themselves whenever possible.
//
// Example:
//   await withConnection(async (conn) => {
//     const [rows] = await conn.execute('SELECT ...');
//     ...
//   });
export async function withConnection(fn) {
  const connection = await pool.getConnection();
  try {
    return await fn(connection);
  } finally {
    connection.release();
  }
}

// For SELECT, INSERT, UPDATE, DELETE - use execute (prepared statements)
// this version grabs a connection and releases it in a finally block so
// callers don't have to worry about leaking.
export async function execute(sql, params = []) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// For transactions and commands that don't support prepared statements.
// This helper also acquires and releases the connection for you.
export async function query(sql, params = []) {
  let connection;
  try {
    connection = await pool.getConnection();
    // Use query() instead of execute() for START TRANSACTION, COMMIT, ROLLBACK
    const [results] = await connection.query(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// For transactions - get a connection
export async function getConnection() {
  return await pool.getConnection();
}

export default { execute, query, getConnection };