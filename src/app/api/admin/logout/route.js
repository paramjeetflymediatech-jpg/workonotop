// app/api/admin/logout/route.js
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully"
  });

  // Clear the auth cookies
  response.cookies.delete("adminAuth");
  response.cookies.delete("adminLoggedIn");

  return response;
}