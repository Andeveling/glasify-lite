import { headers } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import {
  isAdminOnlyRoute,
  isDashboardHome,
  isProtectedRoute,
  isPublicRoute,
  isSellerOrAdminRoute,
  shouldSkipMiddleware,
  type UserRole,
} from '@/lib/middleware-utils';
import { auth } from '@/server/auth';

/**
 * Next.js Proxy for Authentication and Role-Based Access Control (RBAC)
 *
 * Flow:
 * 1. Skip proxy for static assets and auth API routes (early return)
 * 2. Skip auth check for public routes (early return)
 * 3. Get session for protected routes
 * 4. Redirect unauthenticated users to /catalog?signin=true
 * 5. Check role-based access (admin, seller, user)
 * 6. Allow authorized requests
 *
 * Note: For Next.js 15.2.0+, proxy runs with Node.js runtime enabled,
 * allowing direct use of auth.api.getSession()
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Early return: Skip middleware for static assets and auth API routes
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  // Early return: Allow public routes without auth check
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Get session for protected routes (includes user.role from Better Auth)
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isLoggedIn = !!session;
  const userRole = session?.user?.role as UserRole | undefined;

  // Redirect unauthenticated users from protected routes to catalog with signin modal
  if (isProtectedRoute(pathname) && !isLoggedIn) {
    const catalogUrl = new URL('/catalog', request.url);
    catalogUrl.searchParams.set('signin', 'true');
    catalogUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(catalogUrl);
  }

  // Block non-admin from admin-only routes (models, settings, tenant config)
  if (isAdminOnlyRoute(pathname) && userRole !== 'admin') {
    // biome-ignore lint/suspicious/noConsole: Console logging is acceptable in middleware for security events
    console.warn('[Middleware] Unauthorized admin-only route access attempt', {
      path: pathname,
      role: userRole,
      timestamp: new Date().toISOString(),
      userId: session?.user?.id,
    });
    return NextResponse.redirect(new URL('/my-quotes', request.url));
  }

  // Block non-seller/non-admin from seller routes (quotes, users)
  if (isSellerOrAdminRoute(pathname) && !['admin', 'seller'].includes(userRole || '')) {
    // biome-ignore lint/suspicious/noConsole: Console logging is acceptable in middleware for security events
    console.warn('[Middleware] Unauthorized seller/admin route access attempt', {
      path: pathname,
      role: userRole,
      timestamp: new Date().toISOString(),
      userId: session?.user?.id,
    });
    return NextResponse.redirect(new URL('/my-quotes', request.url));
  }

  // Redirect sellers from dashboard home to /dashboard/quotes
  if (isDashboardHome(pathname) && userRole === 'seller') {
    return NextResponse.redirect(new URL('/dashboard/quotes', request.url));
  }

  // Allow all other authorized requests
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
  runtime: 'nodejs', // Required for Node.js runtime to use auth.api in middleware
};
