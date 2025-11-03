"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

/**
 * Server Action to handle user sign out
 *
 * Performs complete logout flow:
 * 1. Signs out user session via Better Auth
 * 2. Revalidates all routes to clear cached session data
 * 3. Redirects to catalog page
 *
 * This ensures UI updates immediately after logout without stale cache
 */
export async function handleSignOut() {
	// Sign out user
	await auth.api.signOut({
		headers: await headers(),
	});

	// ✅ Revalidate all routes to clear cached session data
	// This forces Server Components to re-fetch session on next render
	revalidatePath("/", "layout");

	// Redirect to catalog (public page)
	redirect("/catalog");
}
