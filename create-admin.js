import bcrypt from 'bcryptjs'
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function createAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'workontap_db'
    })

    const password = 'admin123' // 👈 change if needed
    const hashedPassword = await bcrypt.hash(password, 10)

    await connection.execute(
      `INSERT INTO users 
      (email, password_hash, first_name, last_name, role) 
      VALUES (?, ?, ?, ?, ?)`,
      [
        'admin@workontap.com',
        hashedPassword,
        'Admin',
        'User',
        'admin'
      ]
    )

    console.log('✅ Admin created successfully')
    process.exit()

  } catch (error) {
    console.error('❌ Error creating admin:', error)
    process.exit(1)
  }
}

createAdmin()
