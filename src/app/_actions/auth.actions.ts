/**
 * Authentication Server Actions
 *
 * Centralized authentication actions for Next.js 16 + Better Auth.
 * Handles logout flow with proper cache invalidation and redirect.
 *
 * @module app/_actions/auth.actions
 */

"use server";

import { headers } from "next/headers";
import { auth } from "@/server/auth";

/**
 * Server Action to handle user sign out
 *
 * Performs complete logout flow for Next.js 16 + Better Auth:
 * 1. Signs out user session via Better Auth API
 * 2. Returns success to trigger client-side full reload
 *
 * Note: We use window.location.href for full page reload instead of
 * Next.js redirect() to avoid "Failed to get session" errors on
 * subsequent navigation. This ensures clean state on logout.
 *
 * @example Client Component
 * ```tsx
 * import { handleSignOut } from "@/app/_actions/auth.actions";
 * import { useTransition } from "react";
 *
 * const [isPending, startTransition] = useTransition();
 *
 * const onSignOut = () => {
 *   startTransition(async () => {
 *     await handleSignOut();
 *     window.location.href = "/catalog";
 *   });
 * };
 * ```
 */
export async function handleSignOut() {
  // Sign out user via Better Auth
  // This deletes the session cookie automatically
  await auth.api.signOut({
    headers: await headers(),
  });

  // Return success - client will handle redirect with full reload
  // This avoids "Failed to get session" errors on navigation
}
