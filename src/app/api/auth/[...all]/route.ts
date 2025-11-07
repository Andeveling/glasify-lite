import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/server/auth";

/**
 * Better Auth API route handler for Next.js App Router
 * Handles all authentication endpoints: signin, signout, callback, etc.
 */
export const { GET, POST } = toNextJsHandler(auth);
