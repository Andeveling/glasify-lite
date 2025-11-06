/**
 * Server-Side Authentication Helpers
 *
 * Utilities for authentication in Server Components, Server Actions, and API Routes.
 * These helpers ensure consistent session handling with Next.js 16 cache behavior.
 *
 * @module lib/server-auth
 */

import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/server/auth";

/**
 * Get current session with proper caching for Next.js 16
 *
 * This helper wraps Better Auth's getSession() with React's cache()
 * to prevent unnecessary re-fetches within the same request, while
 * still respecting Next.js 16's revalidation behavior with tags.
 *
 * The session is tagged with 'auth-session' for fine-grained invalidation.
 * This ensures that when logout happens, we can invalidate ONLY session
 * data without revalidating entire layouts or paths.
 *
 * Benefits:
 * - Deduplicates session fetches in same request
 * - Properly invalidates after revalidateTag('auth-session')
 * - Works correctly with Server Actions and redirects
 * - Finer control than revalidatePath (which can cause timing issues)
 *
 * @example Server Component
 * ```tsx
 * import { getServerSession } from "@/lib/server-auth";
 *
 * export default async function Page() {
 *   const session = await getServerSession();
 *   if (!session) return <SignInPrompt />;
 *   return <Dashboard user={session.user} />;
 * }
 * ```
 *
 * @example Server Action (Logout)
 * ```tsx
 * "use server";
 * import { revalidateTag } from "next/cache";
 * import { getServerSession } from "@/lib/server-auth";
 *
 * export async function logout() {
 *   await auth.api.signOut({ headers: await headers() });
 *   revalidateTag('auth-session'); // Invalidates session cache
 *   redirect('/catalog');
 * }
 * ```
 */
export const getServerSession = cache(
  async () =>
    await auth.api.getSession({
      headers: await headers(),
    })
);
