/**
 * useNavigate Hook
 *
 * Centralized client-side navigation hook for Next.js App Router.
 * Provides type-safe navigation methods wrapping useRouter.
 *
 * WHY:
 * - Avoids window.location which bypasses Next.js router and loses SSR/SSG benefits
 * - Provides consistent API across the app
 * - Enables proper prefetching and client-side caching
 *
 * @example
 * ```tsx
 * import { useNavigate } from "@/hooks/use-navigate";
 *
 * function MyComponent() {
 *   const navigate = useNavigate();
 *
 *   // Navigate to a new page
 *   navigate.push("/admin");
 *
 *   // Replace current page (no history entry)
 *   navigate.replace("/login");
 *
 *   // Go back in history
 *   navigate.back();
 * }
 * ```
 */

'use client'

import { useRouter } from 'next/navigation'

type NavigateMethods = {
  /**
   * Navigate to a new page (adds to history stack)
   */
  push: (href: string) => void
  /**
   * Navigate to a new page (replaces current entry in history)
   */
  replace: (href: string) => void
  /**
   * Go back in browser history
   */
  back: () => void
  /**
   * Reload the current page (full refresh)
   * Use sparingly - this bypasses the router entirely
   */
  reload: () => void
}

export function useNavigate(): NavigateMethods {
  const router = useRouter()

  return {
    push: (href: string) => router.push(href),
    replace: (href: string) => router.replace(href),
    back: () => router.back(),
    reload: () => window.location.reload(),
  }
}
