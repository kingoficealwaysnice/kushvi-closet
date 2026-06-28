import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Retrieve auth cookies (works for both standard Supabase sessions and mock loggers)
  const userId = req.cookies.get("kushvi_user_id")?.value;
  const userRole = req.cookies.get("kushvi_user_role")?.value;

  // Protect Admin Dashboard Routes
  if (pathname.startsWith("/admin")) {
    if (!userId || userRole !== "admin") {
      console.log(`Middleware blocked access to admin path: ${pathname}. Redirecting to /login`);
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect Customer Sensitive Checkout/Orders/Profile Routes
  if (
    pathname.startsWith("/checkout") || 
    pathname.startsWith("/orders") || 
    pathname.startsWith("/profile")
  ) {
    if (!userId) {
      console.log(`Middleware blocked access to customer path: ${pathname}. Redirecting to /login`);
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Config matching rules
export const config = {
  matcher: [
    "/admin/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/profile/:path*",
  ],
};
