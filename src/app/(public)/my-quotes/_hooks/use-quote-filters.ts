'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';

/**
 * Quote filter types
 */
export type QuoteStatus = 'draft' | 'sent' | 'canceled';

export type QuoteSortOption = 'newest' | 'oldest' | 'price-high' | 'price-low';

export interface QuoteFilters {
  status?: QuoteStatus;
  searchQuery: string;
  sortBy: QuoteSortOption;
}

/**
 * Custom hook for managing quote filters with URL synchronization
 *
 * Features:
 * - Manages filter state (status, search, sort)
 * - Syncs filters with URL search params
 * - Debounces search input (300ms)
 * - Provides helper methods for filter updates
 * - Tracks active filters count
 *
 * @example
 * ```tsx
 * function QuoteFilters() {
 *   const { filters, setStatus, setSearchQuery, clearFilters } = useQuoteFilters();
 *
 *   return (
 *     <div>
 *       <select onChange={(e) => setStatus(e.target.value)}>...</select>
 *       <input value={filters.searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
 *       <button onClick={clearFilters}>Clear</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useQuoteFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Initialize filters from URL params
  const [filters, setFilters] = useState<QuoteFilters>(() => {
    const statusParam = searchParams.get('status');
    const searchParam = searchParams.get('q') ?? '';
    const sortParam = searchParams.get('sort') ?? 'newest';

    // Validate status param
    const validStatuses: QuoteStatus[] = ['draft', 'sent', 'canceled'];
    const status = validStatuses.includes(statusParam as QuoteStatus) ? (statusParam as QuoteStatus) : undefined;

    // Validate sort param
    const validSorts: QuoteSortOption[] = ['newest', 'oldest', 'price-high', 'price-low'];
    const sortBy = validSorts.includes(sortParam as QuoteSortOption) ? (sortParam as QuoteSortOption) : 'newest';

    return {
      searchQuery: searchParam,
      sortBy,
      status,
    };
  });

  // Debounce timer for search
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  /**
   * Update URL with current filters
   */
  const updateURL = useCallback(
    (newFilters: QuoteFilters) => {
      const params = new URLSearchParams(searchParams.toString());

      // Update or remove status param
      if (newFilters.status) {
        params.set('status', newFilters.status);
      } else {
        params.delete('status');
      }

      // Update or remove search param
      if (newFilters.searchQuery) {
        params.set('q', newFilters.searchQuery);
      } else {
        params.delete('q');
      }

      // Update or remove sort param (don't add if default)
      if (newFilters.sortBy && newFilters.sortBy !== 'newest') {
        params.set('sort', newFilters.sortBy);
      } else {
        params.delete('sort');
      }

      // Use replace to avoid adding to browser history
      const newURL = `${pathname}?${params.toString()}`;
      startTransition(() => {
        router.replace(newURL, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  /**
   * Set status filter
   */
  const setStatus = useCallback(
    (status: QuoteStatus | undefined) => {
      const newFilters = { ...filters, status };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  /**
   * Set search query (debounced)
   */
  const setSearchQuery = useCallback(
    (query: string) => {
      const newFilters = { ...filters, searchQuery: query };
      setFilters(newFilters);

      // Clear existing timer
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }

      // Set new timer for URL update (debounce 300ms)
      const timer = setTimeout(() => {
        updateURL(newFilters);
      }, 300);

      setSearchDebounceTimer(timer);
    },
    [filters, searchDebounceTimer, updateURL]
  );

  /**
   * Set sort option
   */
  const setSortBy = useCallback(
    (sortBy: QuoteSortOption) => {
      const newFilters = { ...filters, sortBy };
      setFilters(newFilters);
      updateURL(newFilters);
    },
    [filters, updateURL]
  );

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    const newFilters: QuoteFilters = {
      searchQuery: '',
      sortBy: 'newest',
      status: undefined,
    };
    setFilters(newFilters);
    updateURL(newFilters);
  }, [updateURL]);

  /**
   * Count active filters (excluding defaults)
   */
  const activeFiltersCount = useMemo(() => {
    let count = 0;

    if (filters.status) count++;
    if (filters.searchQuery) count++;
    if (filters.sortBy && filters.sortBy !== 'newest') count++;

    return count;
  }, [filters]);

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = useMemo(() => activeFiltersCount > 0, [activeFiltersCount]);

  // Cleanup debounce timer on unmount
  useEffect(
    () => () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }
    },
    [searchDebounceTimer]
  );

  return {
    activeFiltersCount,
    clearFilters,
    filters,
    hasActiveFilters,
    isPending,
    setSearchQuery,
    setSortBy,
    setStatus,
  };
}
