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
 * 1. Signs out user session via Better Auth API (deletes session cookie)
 * 2. Returns success - client handles redirect with useNavigate
 *
 * IMPORTANT: After sign-out, use router.push() or navigate.push() in the
 * client component. Do NOT use window.location.href - the session cookie
 * is properly invalidated by Better Auth and a clean navigation is sufficient.
 *
 * @example Client Component
 * ```tsx
 * "use client";
 * import { handleSignOut } from "@/app/_actions/auth.actions";
 * import { useNavigate } from "@/hooks/use-navigate";
 * import { useTransition } from "react";
 *
 * const [isPending, startTransition] = useTransition();
 * const navigate = useNavigate();
 *
 * const onSignOut = () => {
 *   startTransition(async () => {
 *     await handleSignOut();
 *     navigate.push("/catalog");
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
