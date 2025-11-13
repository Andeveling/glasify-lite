"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Create Supabase Browser Client for Client Components
 *
 * This client is used for Supabase features like Auth, Storage, Realtime.
 * For database queries, use tRPC procedures instead.
 *
 * @returns Supabase Browser Client
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!(supabaseUrl && supabaseKey)) {
    throw new Error(
      "Missing Supabase environment variables. " +
        "Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are set."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
