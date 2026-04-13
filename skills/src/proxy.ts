import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import {
  isAdminOnlyRoute,
  isDashboardHome,
  isProtectedRoute,
  isPublicRoute,
  isSellerOrAdminRoute,
  shouldSkipMiddleware,
  type UserRole,
} from "@/lib/middleware-utils";
import { auth } from "@/server/auth";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isLoggedIn = !!session;
  const userRole = session?.user?.role as UserRole | undefined;

  if (isAdminOnlyRoute(pathname) && userRole !== "admin") {
    console.warn("[Proxy] Unauthorized admin-only route access attempt", {
      path: pathname,
      role: userRole,
      timestamp: new Date().toISOString(),
      userId: session?.user?.id,
    });
    return NextResponse.redirect(new URL("/my-quotes", request.url));
  }

  if (
    isSellerOrAdminRoute(pathname) &&
    !["admin", "seller"].includes(userRole || "")
  ) {
    // biome-ignore lint/suspicious/noConsole: Console logging is acceptable in proxy for security events
    console.warn("[Proxy] Unauthorized seller/admin route access attempt", {
      path: pathname,
      role: userRole,
      timestamp: new Date().toISOString(),
      userId: session?.user?.id,
    });
    return NextResponse.redirect(new URL("/my-quotes", request.url));
  }

  if (isDashboardHome(pathname) && userRole === "seller") {
    return NextResponse.redirect(new URL("/dashboard/quotes", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
