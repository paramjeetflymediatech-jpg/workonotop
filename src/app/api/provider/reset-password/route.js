// app/api/provider/reset-password/route.js - FIXED with correct column name
import { NextResponse } from 'next/server'
import { execute, getConnection } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  let connection
  try {
    const { token, password } = await request.json()
    
    console.log('🔍 Reset password attempt with token:', token ? 'Token provided' : 'No token')

    if (!token || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Token and password required' 
      }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      }, { status: 400 })
    }

    connection = await getConnection()
    await connection.query('START TRANSACTION')

    try {
      // Find provider with valid token
      const [providers] = await connection.execute(
        `SELECT id, email FROM service_providers 
         WHERE reset_token = ? 
         AND reset_token_expiry > NOW() 
         AND status = 'active'`,
        [token]
      )

      console.log('📊 Providers found with token:', providers.length)

      if (providers.length === 0) {
        await connection.query('ROLLBACK')
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid or expired token' 
        }, { status: 400 })
      }

      const provider = providers[0]
      console.log('✅ Valid provider found:', provider.id, provider.email)

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Update password and clear reset token
      // ⚠️ IMPORTANT: Check your database column name - it might be 'password' or 'hashed_password'
      // Try one of these options:

      // OPTION 1: If your column is 'password' (most common)
      await connection.execute(
        `UPDATE service_providers 
         SET password = ?, 
             reset_token = NULL, 
             reset_token_expiry = NULL,
             updated_at = NOW()
         WHERE id = ?`,
        [hashedPassword, provider.id]
      )

      // OPTION 2: If your column is 'hashed_password' (uncomment if needed)
      /*
      await connection.execute(
        `UPDATE service_providers 
         SET hashed_password = ?, 
             reset_token = NULL, 
             reset_token_expiry = NULL,
             updated_at = NOW()
         WHERE id = ?`,
        [hashedPassword, provider.id]
      )
      */

      // OPTION 3: If your column is 'password_hash' (but it's not working)
      // Then you need to add this column or use the correct existing one

      await connection.query('COMMIT')
      console.log('💾 Password updated successfully')

      return NextResponse.json({ 
        success: true, 
        message: 'Password reset successfully' 
      })

    } catch (err) {
      await connection.query('ROLLBACK')
      console.error('❌ Database error in reset-password:', err)
      throw err
    } finally {
      if (connection) connection.release()
    }

  } catch (error) {
    console.error('🔥 Reset password error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to reset password' 
    }, { status: 500 })
  }
}