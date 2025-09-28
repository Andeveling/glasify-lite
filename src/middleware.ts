import NextAuth from 'next-auth';

import { authConfig } from '@/server/auth/config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Protected routes that require authentication
  const isProtectedRoute = nextUrl.pathname.startsWith('/dashboard');

  // Auth routes
  const isAuthRoute = nextUrl.pathname.startsWith('/signin');

  // If trying to access protected route without being logged in
  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL('/signin', nextUrl));
  }

  // If logged in and trying to access signin page, redirect to dashboard
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL('/dashboard', nextUrl));
  }

  // Allow all other requests to continue
  return;
});

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
