import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    console.log("USERNAME",username);
    console.log("PASSWORD",password);

    

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required" },
        { status: 400 }
      );
    }

    // Query the database for the admin user
    const [users] = await query(
      "SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE",
      [username]
    );

    const user = users; // query returns the first element directly in some mysql2 wrappers or as the first element of an array

    // Fallback if query returns an array (depends on lib/db.js implementation)
    const adminUser = Array.isArray(users) ? users[0] : users;

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

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role
      }
    });

    // Set cookie for authentication
    response.cookies.set("adminAuth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}









