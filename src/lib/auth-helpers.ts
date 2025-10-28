import type { auth } from "@/server/auth";

type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

/**
 * Determines the redirect URL after successful sign in based on user role
 * @param session - Better Auth session object
 * @returns Redirect URL path
 */
export const getRedirectAfterSignIn = (session: Session): string => {
  if (!session?.user) return "/catalog";

  // Admin users go to dashboard
  if (session.user.role === "admin") return "/dashboard";

  // Regular users go to their quotes
  return "/my-quotes";
};
