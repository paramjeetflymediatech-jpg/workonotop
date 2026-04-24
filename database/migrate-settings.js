import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
dotenv.config()

async function migrate() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    })

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        \`key\` VARCHAR(191) PRIMARY KEY,
        \`value\` TEXT
      )
    `)

    await connection.execute(`
      INSERT IGNORE INTO system_settings (\`key\`, \`value\`) 
      VALUES ('default_commission', '5')
    `)

    console.log('✅ System settings table initialized')
    process.exit()
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

migrate()
