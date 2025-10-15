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

  const isAdminRoute = pathname.startsWith('/dashboard');
  const isSellerRoute = pathname.startsWith('/quotes') && pathname !== '/my-quotes';
  const isAuthRoute = pathname.startsWith('/signin');
  const isAuthCallback = pathname === '/auth/callback';

  // 1. Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isLoggedIn) {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  // 2. Block non-admin from admin routes
  if (isAdminRoute && userRole !== 'admin') {
    logger.warn('Unauthorized dashboard access attempt', {
      path: pathname,
      role: userRole,
      timestamp: new Date().toISOString(),
      userId: session?.user?.id,
    });
    return NextResponse.redirect(new URL('/my-quotes', request.url));
  }

  // 3. Block non-seller from seller routes
  if (isSellerRoute && !['admin', 'seller'].includes(userRole || '')) {
    logger.warn('Unauthorized seller route access attempt', {
      path: pathname,
      role: userRole,
      timestamp: new Date().toISOString(),
      userId: session?.user?.id,
    });
    return NextResponse.redirect(new URL('/my-quotes', request.url));
  }

  // 4. Redirect logged-in users away from signin page
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
