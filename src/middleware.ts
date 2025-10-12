import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if user has auth session token
  const sessionToken =
    request.cookies.get('authjs.session-token') || request.cookies.get('__Secure-authjs.session-token');

  const isLoggedIn = !!sessionToken;

  // Protected routes that require authentication
  const isProtectedRoute =
    pathname.startsWith('/dashboard') || pathname.startsWith('/quotes') || pathname.startsWith('/quote');

  // Auth routes
  const isAuthRoute = pathname.startsWith('/signin');

  // Auth callback route
  const isAuthCallback = pathname === '/auth/callback';

  // If trying to access protected route without being logged in
  if (isProtectedRoute && !isLoggedIn) {
    const signinUrl = new URL('/signin', request.url);
    signinUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signinUrl);
  }

  // If logged in and trying to access signin page, redirect to callback for role-based redirect
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
