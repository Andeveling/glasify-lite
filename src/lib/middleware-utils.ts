/**
 * Middleware Utilities
 * Helper functions for Next.js middleware route matching and authorization
 *
 * @module lib/middleware-utils
 *
 * Flow Diagram:
 * ```
 * Request → shouldSkipMiddleware? → YES → Allow (NextResponse.next())
 *                 ↓ NO
 *           isPublicRoute? → YES → Allow (NextResponse.next())
 *                 ↓ NO
 *           Get Session (auth())
 *                 ↓
 *           isProtectedRoute + !authenticated? → YES → Redirect to /catalog?signin=true
 *                 ↓ NO
 *           isAdminOnlyRoute + role !== 'admin'? → YES → Redirect to /my-quotes
 *                 ↓ NO
 *           isSellerOrAdminRoute + role NOT IN ['admin','seller']? → YES → Redirect to /my-quotes
 *                 ↓ NO
 *           isDashboardHome + role === 'seller'? → YES → Redirect to /dashboard/quotes
 *                 ↓ NO
 *           Allow (NextResponse.next())
 * ```
 *
 * Route Categories:
 * - **Public Routes**: /, /catalog, /api/auth/* → No auth required
 * - **Protected Routes**: /dashboard/*, /my-quotes, /quotes, /quote/* → Auth required
 * - **Admin Only**: /dashboard/models, /dashboard/settings, /dashboard/tenant
 * - **Seller/Admin**: /dashboard/quotes, /dashboard/users
 *//**
 * Public routes that don't require authentication
 * These routes are accessible to all users without auth checks
 */
const PUBLIC_ROUTES = ["/", "/catalog", "/api/auth"] as const;

/**
 * Protected routes that require authentication
 * Unauthenticated users will be redirected to catalog with signin modal
 */
const PROTECTED_ROUTES = [
  "/dashboard",
  "/quotes",
  "/quote",
  "/my-quotes",
] as const;

/**
 * Admin-only routes (requires role: 'admin')
 * Non-admin users will be redirected to /my-quotes
 */
const ADMIN_ONLY_ROUTES = [
  "/dashboard/models",
  "/dashboard/settings",
  "/dashboard/tenant",
] as const;

/**
 * Seller or Admin routes (requires role: 'seller' | 'admin')
 * Regular users will be redirected to /my-quotes
 */
const SELLER_OR_ADMIN_ROUTES = [
  "/dashboard/quotes",
  "/dashboard/users",
] as const;

/**
 * Check if route is public and doesn't require authentication
 * Early return for public routes improves performance
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if route is protected and requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if route is admin-only
 */
export function isAdminOnlyRoute(pathname: string): boolean {
  return ADMIN_ONLY_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if route requires seller or admin role
 */
export function isSellerOrAdminRoute(pathname: string): boolean {
  return SELLER_OR_ADMIN_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if route should skip middleware to prevent loops
 * Includes: NextAuth API routes, static assets, images
 */
export function shouldSkipMiddleware(pathname: string): boolean {
  return (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname === "/favicon.ico"
  );
}

/**
 * Check if pathname is dashboard home (with or without trailing slash)
 */
export function isDashboardHome(pathname: string): boolean {
  return pathname === "/dashboard" || pathname === "/dashboard/";
}

/**
 * User roles in RBAC system
 */
export type UserRole = "admin" | "seller" | "user";

/**
 * Check if user has required role for route
 */
export function hasRequiredRole(
  userRole: UserRole | undefined,
  pathname: string
): boolean {
  if (isAdminOnlyRoute(pathname)) {
    return userRole === "admin";
  }

  if (isSellerOrAdminRoute(pathname)) {
    return userRole === "admin" || userRole === "seller";
  }

  // Protected routes require any authenticated user
  if (isProtectedRoute(pathname)) {
    return !!userRole;
  }

  // Public routes are accessible to everyone
  return true;
}
