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
 * still respecting Next.js 16's revalidation behavior.
 *
 * Benefits:
 * - Deduplicates session fetches in same request
 * - Properly invalidates after revalidatePath()
 * - Works correctly with Server Actions and redirects
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
 * @example Server Action
 * ```tsx
 * "use server";
 * import { getServerSession } from "@/lib/server-auth";
 *
 * export async function createQuote() {
 *   const session = await getServerSession();
 *   if (!session) throw new Error("Unauthorized");
 *   // ... create quote
 * }
 * ```
 */
export const getServerSession = cache(async () => {
	return await auth.api.getSession({
		headers: await headers(),
	});
});
