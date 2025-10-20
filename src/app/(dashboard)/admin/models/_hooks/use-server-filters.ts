/**
 * useServerFilters Hook
 *
 * Custom hook for managing server-side filters via URL search params
 * Follows Next.js 15 pattern for server-side filtering
 *
 * Features:
 * - Syncs filters with URL search params
 * - Triggers server-side data fetch on filter change
 * - Maintains type-safe filter updates
 * - Resets to page 1 when filters change
 */

'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export function useServerFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /**
   * Updates a single filter parameter in URL
   * Resets to page 1 when filter changes
   */
  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      // Remove param if default value
      if (value === 'all' || value === '' || !value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }

      // Reset to page 1 when filtering (except for page param itself)
      if (key !== 'page') {
        params.delete('page');
      }

      // Update URL (triggers server-side refetch)
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  /**
   * Gets current value of a filter from URL
   */
  const getFilterValue = useCallback(
    (key: string, defaultValue = 'all') => searchParams.get(key) ?? defaultValue,
    [searchParams]
  );

  /**
   * Updates page number in URL
   */
  const updatePage = useCallback(
    (page: number) => {
      updateFilter('page', page.toString());
    },
    [updateFilter]
  );

  return {
    getFilterValue,
    updateFilter,
    updatePage,
  };
}
