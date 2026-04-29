import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth(async (req) => {
  const pathname = req.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/api/auth",
    "/_next",
    "/favicon.ico",
    "/images",
  ];

  // Check if the path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Protected paths that require authentication
  const protectedPaths = [
    "/user",
    "/admin",
    "/api/user/order",
    "/api/user/payment",
  ];

  if (protectedPaths.some(path => pathname.startsWith(path))) {
    if (!req.auth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
