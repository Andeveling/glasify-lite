/**
 * Session Header (Server Component)
 *
 * This is a Server Component that fetches the current user session from Better Auth.
 * It passes the session to the client-side AppSidebar component as props.
 *
 * Why this matters:
 * - When logout happens, revalidatePath() forces this component to re-render
 * - This component refetches the session (will be null after logout)
 * - The Sidebar receives the updated session via props
 * - Sidebar re-renders with logged-out state
 *
 * @module app/_components/session-header
 */

import { headers } from "next/headers";
import { AppSidebar } from "@/components/app-sidebar";
import { auth } from "@/server/auth";

/**
 * SessionHeader: Fetches session and renders Sidebar with current user
 *
 * Server Component that:
 * 1. Calls auth.api.getSession() to get fresh session
 * 2. Passes user data to AppSidebar
 * 3. Will re-render on logout due to revalidatePath()
 */
export async function SessionHeader() {
  // This will be called on EVERY render, so after logout it returns null
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <AppSidebar
      user={
        session?.user
          ? {
              name: session.user.name || "Usuario",
              email: session.user.email || "",
              avatar: session.user.image || "/avatars/shadcn.jpg",
            }
          : null
      }
    />
  );
}
