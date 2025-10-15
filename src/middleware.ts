import { type NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { auth } from '@/server/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session (includes user.role from NextAuth callback)
  const session = await auth();
  const isLoggedIn = !!session;
  const userRole = session?.user?.role;

  // Define route patterns
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/quotes') ||
    pathname.startsWith('/quote') ||
    pathname.startsWith('/my-quotes');

  const isAdminOnlyRoute =
    pathname.startsWith('/dashboard/models') ||
    pathname.startsWith('/dashboard/settings') ||
    pathname.startsWith('/dashboard/tenant');
  const isSellerOrAdminRoute = pathname.startsWith('/dashboard/quotes') || pathname.startsWith('/dashboard/users');
  const isDashboardHome = pathname === '/dashboard' || pathname === '/dashboard/';
  const isAuthRoute = pathname.startsWith('/signin');
  const isAuthCallback = pathname === '/auth/callback';

  // 1. Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isLoggedIn) {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  // 2. Block non-admin from admin-only routes (models, settings, tenant config)
  if (isAdminOnlyRoute && userRole !== 'admin') {
    logger.warn('Unauthorized admin-only route access attempt', {
      path: pathname,
      role: userRole,
      timestamp: new Date().toISOString(),
      userId: session?.user?.id,
    });
    return NextResponse.redirect(new URL('/my-quotes', request.url));
  }

  // 3. Block non-seller/non-admin from seller routes (quotes, users)
  if (isSellerOrAdminRoute && !['admin', 'seller'].includes(userRole || '')) {
    logger.warn('Unauthorized seller/admin route access attempt', {
      path: pathname,
      role: userRole,
      timestamp: new Date().toISOString(),
      userId: session?.user?.id,
    });
    return NextResponse.redirect(new URL('/my-quotes', request.url));
  }

  // 4. Redirect sellers from dashboard home to /dashboard/quotes
  if (isDashboardHome && userRole === 'seller') {
    return NextResponse.redirect(new URL('/dashboard/quotes', request.url));
  }

  // 4. Redirect sellers from dashboard home to /dashboard/quotes
  if (isDashboardHome && userRole === 'seller') {
    return NextResponse.redirect(new URL('/dashboard/quotes', request.url));
  }

  // 5. Redirect logged-in users away from signin page
  if (isAuthRoute && isLoggedIn && !isAuthCallback) {
    return NextResponse.redirect(new URL('/auth/callback', request.url));
  }

  // Allow all other requests to continue
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
};
