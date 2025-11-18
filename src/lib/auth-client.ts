"use client";

import { createAuthClient } from "better-auth/react";
import { env } from "@/env";

/**
 * Better Auth client for client-side authentication operations
 * Used in React components, hooks, and client-side actions
 */
export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
});

export const { signIn, signOut, useSession } = authClient;
