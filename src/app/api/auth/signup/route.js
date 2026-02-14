// app/api/auth/signup/route.js
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { 
      first_name, 
      last_name, 
      email, 
      phone, 
      password,
      hear_about,
      receive_offers 
    } = await request.json();

    // Check if user exists
    const existing = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, hear_about, receive_offers)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, hashedPassword, hear_about || null, receive_offers ? 1 : 0]
    );

    // Return user data (without password)
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: result.insertId,
        email,
        first_name,
        last_name,
        phone
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create account' },
      { status: 500 }
    );
  }
}