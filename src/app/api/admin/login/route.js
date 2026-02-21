// app/api/admin/auth/login/route.js - FIXED
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { execute } from "@/lib/db";  // ✅ CHANGE: query → execute

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // ✅ CHANGE: query → execute
    const users = await execute(
      "SELECT * FROM users WHERE email = ? AND role = 'admin'",
      [email]
    );

    const adminUser = users[0];

    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, adminUser.password_hash);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Set cookie for middleware
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      token: "admin-logged-in"
    });

    response.cookies.set("adminAuth", "admin", {
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