/**
 * useServerParams Hook
 *
 * Client-side hook for managing URL search parameters that trigger server-side data fetching.
 * Follows Next.js 15 best practices for URL state management with Server Components.
 *
 * Features:
 * - Type-safe parameter updates
 * - Automatic URL synchronization
 * - History management (replaceState for filters, pushState for navigation)
 * - Deep linking support
 *
 * Usage:
 * ```tsx
 * const { updateParam, getParam, deleteParam, resetParams } = useServerParams();
 *
 * // Update a single parameter (replaces current history entry)
 * updateParam('status', 'published');
 *
 * // Get current parameter value
 * const status = getParam('status');
 *
 * // Delete a parameter
 * deleteParam('search');
 *
 * // Reset all parameters
 * resetParams();
 * ```
 *
 * @see https://nextjs.org/docs/app/api-reference/functions/use-search-params
 */

"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export type ParamValue = string | number | boolean | null | undefined;

export type UseServerParamsReturn = {
  /**
   * Update a single URL parameter
   * Uses replaceState to avoid polluting browser history
   */
  updateParam: (key: string, value: ParamValue) => void;

  /**
   * Update multiple URL parameters at once
   * Uses replaceState to avoid polluting browser history
   */
  updateParams: (params: Record<string, ParamValue>) => void;

  /**
   * Get current value of a parameter
   */
  getParam: (key: string) => string | null;

  /**
   * Delete a parameter from URL
   */
  deleteParam: (key: string) => void;

  /**
   * Reset all parameters (clear search params)
   */
  resetParams: () => void;

  /**
   * Navigate to new page (uses pushState for browser history)
   */
  navigateTo: (page: number) => void;

  /**
   * Get all current search params as object
   */
  getAllParams: () => Record<string, string>;
};

/**
 * Custom hook for managing server-side URL parameters
 */
export function useServerParams(): UseServerParamsReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Create URL with updated parameters
   */
  const createQueryString = useCallback(
    (updates: Record<string, ParamValue>): string => {
      const params = new URLSearchParams(searchParams.toString());

      // Apply all updates
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      }

      return params.toString();
    },
    [searchParams]
  );

  /**
   * Update a single parameter
   */
  const updateParam = useCallback(
    (key: string, value: ParamValue) => {
      const queryString = createQueryString({ [key]: value });
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      // Use router.replace to ensure Next.js triggers a re-render
      router.replace(newUrl, { scroll: false });
    },
    [pathname, createQueryString, router]
  );

  /**
   * Update multiple parameters at once
   */
  const updateParams = useCallback(
    (params: Record<string, ParamValue>) => {
      const queryString = createQueryString(params);
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      // Use router.replace to ensure Next.js triggers a re-render
      router.replace(newUrl, { scroll: false });
    },
    [pathname, createQueryString, router]
  );

  /**
   * Get current parameter value
   */
  const getParam = useCallback(
    (key: string): string | null => searchParams.get(key),
    [searchParams]
  );

  /**
   * Delete a parameter
   */
  const deleteParam = useCallback(
    (key: string) => {
      updateParam(key, null);
    },
    [updateParam]
  );

  /**
   * Reset all parameters
   */
  const resetParams = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  /**
   * Navigate to new page (pagination)
   * Uses pushState for browser history
   */
  const navigateTo = useCallback(
    (page: number) => {
      const queryString = createQueryString({ page });
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

      // Use router.push for pagination to enable back/forward navigation
      router.push(newUrl);
    },
    [router, pathname, createQueryString]
  );

  /**
   * Get all parameters as object
   */
  const getAllParams = useCallback((): Record<string, string> => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  return {
    deleteParam,
    getAllParams,
    getParam,
    navigateTo,
    resetParams,
    updateParam,
    updateParams,
  };
}
