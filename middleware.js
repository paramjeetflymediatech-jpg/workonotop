




// // middleware.js
// import { NextResponse } from "next/server";

// export function middleware(request) {
//   const { pathname } = request.nextUrl;

//   // Admin routes protection
//   if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
//     const adminAuth = request.cookies.get("adminAuth")?.value;
//     if (!adminAuth) {
//       return NextResponse.redirect(new URL("/admin/login", request.url));
//     }
//   }

//   // Provider routes protection
//   if (pathname.startsWith("/provider") && 
//       !pathname.includes("/login") && 
//       !pathname.includes("/register") && 
//       !pathname.includes("/verify-email") &&
//       !pathname.includes("/rejected")) {
    
//     const token = request.cookies.get("provider_token")?.value;
//     if (!token) {
//       return NextResponse.redirect(new URL("/provider/login", request.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/admin/:path*", "/provider/:path*"],
// };
















// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    pathname !== "/api/admin/login"  // ✅ don't block login API
  ) {
    const token = request.cookies.get("adminAuth")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
    } catch {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.set("adminAuth", "", { maxAge: 0 });
      return response;
    }
  }

  // Provider routes unchanged
  if (
    pathname.startsWith("/provider") &&
    !pathname.includes("/login") &&
    !pathname.includes("/register") &&
    !pathname.includes("/verify-email") &&
    !pathname.includes("/rejected")
  ) {
    const token = request.cookies.get("provider_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/provider/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/provider/:path*"],
};