import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("adminAuth", "", {
    path: "/",
    expires: new Date(0),
  });

  return response;
}
