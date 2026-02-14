import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      password,
      confirm_password,
      hear_about_us,
      receive_offers
    } = body;

    // Validation
    if (!first_name || !last_name || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    if (password !== confirm_password) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Check if email exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, phone, password, hear_about_us, receive_offers)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, hashedPassword, hear_about_us || null, receive_offers || false]
    );

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      data: {
        user_id: result.insertId,
        name: `${first_name} ${last_name}`,
        email: email,
        phone: phone
      }
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create account' },
      { status: 500 }
    );
  }
}