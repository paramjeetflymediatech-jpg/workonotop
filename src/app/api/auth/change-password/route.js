import { NextResponse } from 'next/server';
import { execute as query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { verifyToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ success: false, message: 'Current and new passwords are required' }, { status: 400 });
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json({ success: false, message: 'Password must be at least 8 characters and contain both alphabets and special characters' }, { status: 400 });
    }

    // 1. Fetch user to check current password
    // We check both tables just in case, similar to login
    let user = null;
    let table = 'users';
    let passCol = 'password_hash';

    const users = await query('SELECT id, password_hash FROM users WHERE id = ?', [decoded.id]);
    if (users.length > 0) {
      user = users[0];
    } else {
      const providers = await query('SELECT id, password FROM service_providers WHERE id = ?', [decoded.id]);
      if (providers.length > 0) {
        user = providers[0];
        table = 'service_providers';
        passCol = 'password';
      }
    }

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // 2. Verify current password
    const currentHash = user.password_hash || user.password;
    const isMatch = await bcrypt.compare(oldPassword, currentHash);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Incorrect current password' }, { status: 401 });
    }

    // 3. Hash new password and update
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await query(`UPDATE ${table} SET ${passCol} = ?, updated_at = NOW() WHERE id = ?`, [newHash, decoded.id]);

    return NextResponse.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    console.error('Error changing password:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
