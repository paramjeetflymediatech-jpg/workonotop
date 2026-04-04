




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
    pathname !== "/api/admin/login"
  ) {
    const token = request.cookies.get("adminAuth")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      // Admin specific status check if needed
    } catch {
      const response = NextResponse.redirect(new URL("/admin/login", request.url));
      response.cookies.set("adminAuth", "", { maxAge: 0 });
      return response;
    }
  }

  // Provider & Customer Restricted Status Check
  const providerToken = request.cookies.get("provider_token")?.value;
  const customerToken = request.cookies.get("customer_token")?.value;
  const token = providerToken || customerToken;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.status === 'pending_deletion' || payload.status === 'deleted') {
        // Block sensitive actions but allow them to see their restricted profile if we had a page for it
        // For now, if it's an API request, return 403. If it's a page request (excluding logout), we can redirect.
        if (pathname.startsWith('/api/') && !pathname.includes('/auth/logout')) {
          return NextResponse.json(
            { success: false, message: 'Account restricted. Deletion in progress.', status: payload.status },
            { status: 403 }
          );
        }
      }
    } catch (err) {
      // Token invalid, ignore here as other parts of middleware handle redirects
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/provider/:path*"],
};