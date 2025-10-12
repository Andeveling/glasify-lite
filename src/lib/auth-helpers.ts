import type { Session } from 'next-auth';

/**
 * Determines the redirect URL after successful sign in based on user role
 * @param session - NextAuth session object
 * @returns Redirect URL path
 */
export const getRedirectAfterSignIn = (session: Session | null): string => {
  if (!session?.user) return '/catalog';

  // Admin users go to dashboard
  if (session.user.role === 'admin') return '/dashboard';

  // Regular users go to their quotes
  return '/my-quotes';
};
