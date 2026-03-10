// tests/db-connection.js
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../.env') })

import { execute, query } from '../src/lib/db.js'  

async function testDatabase() {
  console.log('🔍 Testing Database Connection...\n')
  console.log('📡 Using database:', process.env.DB_NAME || 'workontap_db')
  console.log('📡 Connecting as:', process.env.DB_USER || 'root')
  
  try {
    // Basic connection test
    console.log('\n📡 Testing basic connection...')
    const result = await execute('SELECT 1 as test')
    console.log('✅ Basic connection: OK', result)
    
    // Check which databases exist
    console.log('\n📡 Checking available databases...')
    const dbs = await execute('SHOW DATABASES')
    const dbList = dbs.map(db => db.Database || Object.values(db)[0])
    console.log('✅ Available databases:', dbList.join(', '))
    
    // Check for your database
    const yourDB = process.env.DB_NAME || 'workontap_db'
    if (dbList.includes(yourDB)) {
      console.log(`✅ Database "${yourDB}" exists`)
      
      // ✅ FIX: Use query() instead of execute() for USE command
      console.log(`\n📡 Switching to database "${yourDB}"...`)
      await query(`USE ${yourDB}`)  // query() use karo, execute() nahi
      console.log(`✅ Successfully switched to ${yourDB}`)
      
    } else {
      console.log(`\n⚠️ Database "${yourDB}" does NOT exist`)
      console.log('\n🔧 Create database:')
      console.log(`mysql> CREATE DATABASE ${yourDB};`)
    }
    
    // Get MySQL version
    const version = await execute('SELECT VERSION() as version')
    console.log('\n✅ MySQL version:', version[0].version)
    
    // Test table access
    console.log('\n📡 Checking tables...')
    const tables = await execute('SHOW TABLES')
    if (tables.length > 0) {
      console.log('✅ Tables found:', tables.map(t => Object.values(t)[0]).join(', '))
    } else {
      console.log('⚠️ No tables found in database')
    }
    
    console.log('\n✅ Test completed!')
    
  } catch(error) {
    console.error('\n❌ Test Failed:', error)
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n🔧 FIX: Database missing!')
      console.log(`1. MySQL mein login: mysql -u root -p`)
      console.log(`2. Database banao: CREATE DATABASE ${process.env.DB_NAME || 'workontap_db'};`)
    }
    
    if (error.code === 'ER_UNSUPPORTED_PS') {
      console.log('\n🔧 FIX: Use query() instead of execute() for this command')
    }
  }
}

testDatabase()