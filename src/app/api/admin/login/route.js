import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { execute } from "@/lib/db";
import { logActivity } from "@/lib/logger";
import fs from "fs";
import path from "path";

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-min-32-chars-long-here-change-it';

function cleanString(val) {
  if (!val) return '';
  let s = String(val).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1);
  }
  return s.trim();
}

function getAdminEnvCredentials() {
  const fileEnv = {};
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          fileEnv[key] = val;
        }
      }
    }
  } catch (e) {
    // ignore read error, fallback to process.env
  }

  const rawEmail =
    fileEnv.ADMIN_EMAIL ||
    fileEnv.ADMIN_USER ||
    fileEnv.ADMIN_ID ||
    process.env.ADMIN_EMAIL ||
    process.env.ADMIN_USER ||
    process.env.ADMIN_ID ||
    'admin@workontap.com';

  const rawUsername =
    fileEnv.ADMIN_USERNAME ||
    process.env.ADMIN_USERNAME ||
    'admin';

  const rawPass =
    fileEnv.ADMIN_PASSWORD ||
    fileEnv.ADMIN_PASS ||
    fileEnv.PASSWORD ||
    process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_PASS ||
    process.env.PASSWORD ||
    'admin@123';

  return {
    email: cleanString(rawEmail).toLowerCase(),
    username: cleanString(rawUsername).toLowerCase(),
    password: cleanString(rawPass),
  };
}

async function syncAdminUser(targetEmail, newPlainPass) {
  try {
    const hashedPassword = await bcrypt.hash(newPlainPass, 10);

    const users = await execute(
      "SELECT * FROM users WHERE email = ? OR role = 'admin' OR email = 'admin@workontap.com' LIMIT 1",
      [targetEmail]
    );

    if (users && users.length > 0) {
      const existingUser = users[0];
      await execute(
        "UPDATE users SET password_hash = ?, email = ?, role = 'admin' WHERE id = ?",
        [hashedPassword, targetEmail, existingUser.id]
      );
      console.log(`[Auth] Automatically updated admin user password_hash in DB for: ${targetEmail}`);
      const updated = await execute("SELECT * FROM users WHERE id = ? LIMIT 1", [existingUser.id]);
      return updated[0];
    } else {
      const result = await execute(
        "INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES (?, ?, 'Super', 'Admin', 'admin')",
        [targetEmail, hashedPassword]
      );
      console.log(`[Auth] Created new admin user in DB for: ${targetEmail}`);
      const created = await execute("SELECT * FROM users WHERE id = ? LIMIT 1", [result.insertId]);
      return created[0];
    }
  } catch (err) {
    console.warn('[Auth] Database sync warning:', err?.message || err);
    return null;
  }
}

export async function POST(request) {
  try {
    const { email, password } = await request.json().catch(() => ({}));

    const inputEmail = cleanString(email).toLowerCase();
    const inputPass = cleanString(password);

    if (!inputEmail || !inputPass) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    const adminCreds = getAdminEnvCredentials();

    const isAdminAttempt =
      Boolean(adminCreds.password) &&
      (inputEmail === adminCreds.email ||
        inputEmail === adminCreds.username ||
        inputEmail === 'admin' ||
        inputEmail === 'admin@workontap.com');

    let adminUser = null;

    if (isAdminAttempt) {
      // STRICT CHECK: Admin password must match .env ADMIN_PASSWORD!
      if (inputPass !== adminCreds.password) {
        console.warn(`[Auth] Admin login failed: Password mismatch for ${inputEmail}`);
        return NextResponse.json(
          { success: false, message: "Invalid credentials" },
          { status: 401 }
        );
      }

      // Automatically sync/update the database bcrypt hash
      adminUser = await syncAdminUser(adminCreds.email, adminCreds.password);
      if (!adminUser) {
        return NextResponse.json(
          { success: false, message: "Failed to synchronize admin user" },
          { status: 500 }
        );
      }
      console.log(`[Auth] Admin login successful for ${adminUser.email} (synced to database)`);
    } else {
      const users = await execute(
        "SELECT * FROM users WHERE email = ? AND role = 'admin'",
        [inputEmail]
      );
      adminUser = users[0];

      if (!adminUser) {
        return NextResponse.json(
          { success: false, message: "Invalid credentials" },
          { status: 401 }
        );
      }

      const isMatch = await bcrypt.compare(inputPass, adminUser.password_hash);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: "Invalid credentials" },
          { status: 401 }
        );
      }
    }

    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    // Log Activity
    try {
      logActivity({
        actor_id: adminUser.id,
        actor_type: 'admin',
        actor_name: `${adminUser.first_name || ''} ${adminUser.last_name || ''}`.trim() || 'Admin',
        action: 'ADMIN_LOGGED_IN',
        entity_type: 'admin',
        entity_id: adminUser.id,
        details: { email: adminUser.email }
      });
    } catch (e) {
      // non-blocking
    }

    response.cookies.set("adminAuth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
