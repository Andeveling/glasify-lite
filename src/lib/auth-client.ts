"use client";

import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

/**
 * Better Auth client for client-side authentication operations
 * Used in React components, hooks, and client-side actions
 * 
 * Note: Better Auth will auto-detect baseURL from NEXT_PUBLIC_BETTER_AUTH_URL
 * @see https://www.better-auth.com/docs/concepts/base-url
 */
export const authClient = createAuthClient({
  // Optional: Only needed if client and server are on different domains
  baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL || undefined,
});

export const { signIn, signOut, useSession } = authClient;
