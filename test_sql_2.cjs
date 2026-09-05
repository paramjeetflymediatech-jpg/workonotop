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
        const sql = `SELECT (SELECT COALESCE(SUM((service_price + ROUND((COALESCE(additional_price, 0) / 60) * COALESCE(overtime_minutes, 0), 2)) * COALESCE(worker_count, 1)), 0) FROM bookings WHERE user_id = u.id AND status != 'cancelled') as total_spent FROM users u WHERE u.id = 12`;
        const [res] = await conn.query(sql);
        console.log("RESULT", res);
        await conn.end();
    } catch (e) {
        console.error("SQL ERROR", e);
    }
})();
