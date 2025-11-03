/**
 * Authentication Server Actions
 *
 * Centralized authentication actions for Next.js 16 + Better Auth.
 * Handles logout flow with proper cache invalidation and redirect.
 *
 * @module app/_actions/auth.actions
 */

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

/**
 * Server Action to handle user sign out
 *
 * Performs complete logout flow for Next.js 16 + Better Auth:
 * 1. Signs out user session via Better Auth API
 * 2. Revalidates all routes to clear cached session data
 * 3. Redirects to catalog page (public)
 *
 * This ensures:
 * - Session cookie is deleted
 * - Server Components fetch fresh session data
 * - Client-side useSession() refetches
 * - User is redirected away from protected pages
 *
 * @example
 * ```tsx
 * import { handleSignOut } from "@/app/_actions/auth.actions";
 *
 * <form action={handleSignOut}>
 *   <Button type="submit">Cerrar Sesión</Button>
 * </form>
 * ```
 */
export async function handleSignOut() {
	// Sign out user via Better Auth
	await auth.api.signOut({
		headers: await headers(),
	});

	// ✅ CRITICAL: Revalidate all routes to clear cached session data
	// This forces Server Components to re-fetch session on next render
	// Without this, Next.js 16 serves stale cached pages with old session
	revalidatePath("/", "layout");

	// ✅ CRITICAL: Redirect to public page
	// This ensures user leaves protected pages and clears any client state
	redirect("/catalog");
}
