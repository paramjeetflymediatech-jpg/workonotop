// import { NextResponse } from "next/server";

// export function middleware(request) {
//   const { pathname } = request.nextUrl;

//   if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
//     const adminAuth = request.cookies.get("adminAuth")?.value;

//     if (!adminAuth) {
//       return NextResponse.redirect(new URL("/admin/login", request.url));
//     }
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/admin/:path*"],
// };



import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Protect all admin routes except login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminAuth = request.cookies.get("adminAuth")?.value;

    if (!adminAuth || adminAuth !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Redirect to dashboard if already logged in and trying to access login
  if (pathname === "/admin/login") {
    const adminAuth = request.cookies.get("adminAuth")?.value;
    if (adminAuth === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};