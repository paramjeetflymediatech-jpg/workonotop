const mysql = require('mysql2/promise');
require('dotenv').config({path: './.env'});
(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root123',
            database: process.env.DB_NAME || 'workontap_db'
        });
        const sql = `
          SELECT 
            b.id,
            (SELECT COUNT(*) FROM provider_reviews pr WHERE pr.booking_id = b.id) as has_review,
            (SELECT i.status FROM invoices i WHERE i.booking_id = b.id LIMIT 1) as invoice_status
          FROM bookings b
          LIMIT 1
        `;
        const [res] = await conn.query(sql);
        console.log("SQL OK", res);
        await conn.end();
    } catch (e) {
        console.error("SQL ERROR", e);
    }
})();
