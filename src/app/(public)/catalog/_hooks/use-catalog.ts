/**
 * Custom Hooks for Catalog
 *
 * Reusable hooks that encapsulate business logic and state management.
 * Following Single Responsibility Principle - each hook has one clear purpose.
 */

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';

/**
 * Hook for managing URL search parameters
 *
 * Provides utilities to read and update URL query strings
 * without polluting browser history.
 *
 * @returns Object with utilities for managing search params
 */
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams?.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      return params.toString();
    },
    [searchParams]
  );

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>, shouldReplace = true) => {
      const queryString = createQueryString(updates);
      const url = queryString ? `${pathname}?${queryString}` : pathname;

      if (shouldReplace) {
        router.replace(url);
      } else {
        router.push(url);
      }
    },
    [createQueryString, pathname, router]
  );

  const getParam = useCallback((key: string) => searchParams.get(key), [searchParams]);

  return {
    createQueryString,
    getParam,
    searchParams,
    updateQueryParams,
  };
}

/**
 * Hook for managing debounced search
 *
 * Handles search input state, debouncing, and URL synchronization.
 *
 * @param initialValue - Initial search query
 * @param debounceMs - Debounce delay in milliseconds
 * @returns Search state and handlers
 */
export function useDebouncedSearch(initialValue = '', debounceMs = 300) {
  const [query, setQuery] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  const { searchParams, updateQueryParams } = useQueryParams();

  // Sync input value when URL search params change externally
  useEffect(() => {
    const urlQuery = searchParams.get('q') ?? '';
    setQuery(urlQuery);
  }, [searchParams]);

  // Debounced search handler
  const debouncedUpdate = useDebouncedCallback((value: string) => {
    startTransition(() => {
      updateQueryParams({
        page: null, // Reset to page 1 when searching
        q: value || null,
      });
    });
  }, debounceMs);

  const handleSearchChange = useCallback(
    (value: string) => {
      setQuery(value);
      debouncedUpdate(value);
    },
    [debouncedUpdate]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    startTransition(() => {
      updateQueryParams({
        page: null,
        q: null,
      });
    });
  }, [updateQueryParams]);

  return {
    handleClear,
    handleSearchChange,
    isPending,
    query,
  };
}

/**
 * Hook for creating pagination URLs
 *
 * Generates URL strings for pagination links while preserving
 * other query parameters.
 *
 * @param currentPage - Current page number
 * @param totalPages - Total number of pages
 * @returns Pagination utilities
 */
export function usePagination(currentPage: number, totalPages: number) {
  const { createQueryString } = useQueryParams();

  const createPageUrl = useCallback(
    (page: number) => {
      const queryString = createQueryString({
        page: page === 1 ? null : page.toString(),
      });
      return queryString ? `?${queryString}` : '';
    },
    [createQueryString]
  );

  const getVisiblePages = useCallback(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1).filter((page) => {
      // Show first page, last page, current page, and 1 page on each side
      return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
    });
  }, [currentPage, totalPages]);

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return {
    createPageUrl,
    getVisiblePages,
    hasNext,
    hasPrevious,
  };
}

/**
 * Hook for managing catalog filters
 *
 * Encapsulates all filter logic (profile supplier, sort) and query string management.
 * Prevents code duplication and follows Single Responsibility Principle.
 *
 * Memory Leak Fix:
 * - Receives current params as props instead of calling useSearchParams()
 * - Prevents EventEmitter memory leak warning
 *
 * @param params - Current filter parameters
 * @param profileSuppliers - Available profile suppliers for name lookup
 * @returns Filter state and handlers
 */
export function useCatalogFilters(
  params: {
    currentProfileSupplier?: string;
    currentSort?: string;
    currentSearchQuery?: string;
  },
  profileSuppliers: Array<{ id: string; name: string }> = []
) {
  const router = useRouter();
  const pathname = usePathname();

  const { currentProfileSupplier = 'all', currentSort = 'name-asc', currentSearchQuery } = params;

  // Get profile supplier name for badge display
  const selectedProfileSupplierName = useMemo(() => {
    if (currentProfileSupplier === 'all') {
      return null;
    }
    return profileSuppliers.find((s) => s.id === currentProfileSupplier)?.name;
  }, [currentProfileSupplier, profileSuppliers]);

  // Utility to create query string following Next.js best practices
  // Build params from current state instead of using useSearchParams()
  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const urlParams = new URLSearchParams();

      // Preserve current parameters
      if (currentSearchQuery) {
        urlParams.set('q', currentSearchQuery);
      }
      if (currentProfileSupplier && currentProfileSupplier !== 'all') {
        urlParams.set('manufacturer', currentProfileSupplier);
      }
      if (currentSort && currentSort !== 'name-asc') {
        urlParams.set('sort', currentSort);
      }

      // Apply updates
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          urlParams.delete(key);
        } else {
          urlParams.set(key, value);
        }
      }

      return urlParams.toString();
    },
    [currentSearchQuery, currentProfileSupplier, currentSort]
  );

  const handleProfileSupplierChange = useCallback(
    (value: string) => {
      const queryString = createQueryString({
        manufacturer: value === 'all' ? null : value,
        page: null, // Reset to page 1 when filtering
      });

      router.push(`${pathname}?${queryString}`);
    },
    [pathname, router, createQueryString]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      const queryString = createQueryString({
        page: null, // Reset to page 1 when sorting
        sort: value,
      });

      router.push(`${pathname}?${queryString}`);
    },
    [pathname, router, createQueryString]
  );

  const handleRemoveProfileSupplier = useCallback(() => {
    handleProfileSupplierChange('all');
  }, [handleProfileSupplierChange]);

  const handleRemoveSort = useCallback(() => {
    handleSortChange('name-asc');
  }, [handleSortChange]);

  const handleRemoveSearch = useCallback(() => {
    const queryString = createQueryString({
      page: null, // Reset to page 1
      q: null, // Remove search query
    });

    router.push(`${pathname}?${queryString}`);
  }, [pathname, router, createQueryString]);

  const handleClearFilters = useCallback(() => {
    router.push(pathname);
  }, [pathname, router]);

  const hasActiveParameters =
    currentProfileSupplier !== 'all' || currentSort !== 'name-asc' || Boolean(currentSearchQuery);

  return {
    currentProfileSupplier,
    currentSearchQuery,
    currentSort,
    handleClearFilters,
    handleProfileSupplierChange,
    handleRemoveProfileSupplier,
    handleRemoveSearch,
    handleRemoveSort,
    handleSortChange,
    hasActiveParameters,
    selectedProfileSupplierName,
  };
}
