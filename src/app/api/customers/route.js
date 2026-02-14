import { NextResponse } from 'next/server'
import { query } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET all customers
export async function GET() {
  try {
    const customers = await query(
      `SELECT 
        id, first_name, last_name, email, phone, address, city, postal_code, 
        is_verified, created_at
       FROM customers 
       ORDER BY created_at DESC`
    )

    return NextResponse.json({ 
      success: true, 
      data: customers 
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

// POST create new customer (registration)
export async function POST(request) {
  try {
    const { 
      first_name,
      last_name,
      email,
      phone,
      password,
      address,
      city,
      postal_code
    } = await request.json()

    if (!first_name || !last_name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be filled' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existing = await query('SELECT id FROM customers WHERE email = ?', [email])
    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    const result = await query(
      `INSERT INTO customers 
       (first_name, last_name, email, phone, password_hash, address, city, postal_code) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        email,
        phone,
        password_hash,
        address || null,
        city || null,
        postal_code || null
      ]
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Customer registered successfully',
      id: result.insertId 
    })
  } catch (error) {
    console.error('Error creating customer:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to create customer' },
      { status: 500 }
    )
  }
}

// PUT update customer
export async function PUT(request) {
  try {
    const { 
      id,
      first_name,
      last_name,
      phone,
      address,
      city,
      postal_code,
      is_verified
    } = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      )
    }

    await query(
      `UPDATE customers 
       SET first_name = ?, last_name = ?, phone = ?, address = ?, city = ?, postal_code = ?, is_verified = ?
       WHERE id = ?`,
      [first_name, last_name, phone, address, city, postal_code, is_verified, id]
    )

    return NextResponse.json({ success: true, message: 'Customer updated' })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

// DELETE customer
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      )
    }

    await query('DELETE FROM customers WHERE id = ?', [id])
    return NextResponse.json({ success: true, message: 'Customer deleted' })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}