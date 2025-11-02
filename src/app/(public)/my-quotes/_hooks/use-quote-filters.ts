"use client";

import { usePathname, useRouter } from "next/navigation";
import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	useTransition,
} from "react";

/**
 * Quote filter types
 */
export type QuoteStatus = "draft" | "sent" | "canceled";

export type QuoteSortOption = "newest" | "oldest" | "price-high" | "price-low";

export type QuoteFilters = {
	status?: QuoteStatus;
	searchQuery: string;
	sortBy: QuoteSortOption;
};

/**
 * Custom hook for managing quote filters with URL synchronization
 *
 * Memory Leak Fix:
 * - Receives current params as props instead of calling useSearchParams()
 * - Prevents EventEmitter memory leak warning
 *
 * Features:
 * - Manages filter state (status, search, sort)
 * - Syncs filters with URL search params
 * - Debounces search input (300ms)
 * - Provides helper methods for filter updates
 * - Tracks active filters count
 *
 * @param currentParams - Current URL search params from Server Component
 * @example
 * ```tsx
 * function QuoteFilters({ currentStatus, currentSort, currentSearchQuery }) {
 *   const { filters, setStatus, setSearchQuery, clearFilters } = useQuoteFilters({
 *     currentStatus,
 *     currentSort,
 *     currentSearchQuery,
 *   });
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
export function useQuoteFilters(currentParams: {
	currentStatus?: QuoteStatus;
	currentSort?: QuoteSortOption;
	currentSearchQuery?: string;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const [isPending, startTransition] = useTransition();

	const {
		currentStatus,
		currentSort = "newest",
		currentSearchQuery = "",
	} = currentParams;

	// Initialize filters from props (received from Server Component)
	const [filters, setFilters] = useState<QuoteFilters>({
		searchQuery: currentSearchQuery,
		sortBy: currentSort,
		status: currentStatus,
	});

	// Debounce timer for search
	const [searchDebounceTimer, setSearchDebounceTimer] =
		useState<NodeJS.Timeout | null>(null);

	/**
	 * Build query string from current state
	 * Avoids multiple useSearchParams() calls
	 */
	const createQueryString = useCallback(
		(updates: Record<string, string | null>) => {
			const params = new URLSearchParams();

			// Preserve current parameters
			if (currentSearchQuery) {
				params.set("q", currentSearchQuery);
			}
			if (currentStatus) {
				params.set("status", currentStatus);
			}
			if (currentSort && currentSort !== "newest") {
				params.set("sort", currentSort);
			}

			// Apply updates
			for (const [key, value] of Object.entries(updates)) {
				if (value === null || value === "") {
					params.delete(key);
				} else {
					params.set(key, value);
				}
			}

			return params.toString();
		},
		[currentSearchQuery, currentStatus, currentSort],
	);

	/**
	 * Update URL with current filters
	 */
	const updateURL = useCallback(
		(newFilters: QuoteFilters) => {
			const updates: Record<string, string | null> = {};

			// Update or remove status param
			updates.status = newFilters.status || null;

			// Update or remove search param
			updates.q = newFilters.searchQuery || null;

			// Update or remove sort param (don't add if default)
			updates.sort =
				newFilters.sortBy && newFilters.sortBy !== "newest"
					? newFilters.sortBy
					: null;

			const queryString = createQueryString(updates);
			const newURL = queryString ? `${pathname}?${queryString}` : pathname;

			// Use replace to avoid adding to browser history
			startTransition(() => {
				router.replace(newURL, { scroll: false });
			});
		},
		[pathname, router, createQueryString],
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
		[filters, updateURL],
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

			const DEBOUNCE_DELAY_MS = 300;
			// Set new timer for URL update (debounce 300ms)
			const timer = setTimeout(() => {
				updateURL(newFilters);
			}, DEBOUNCE_DELAY_MS);

			setSearchDebounceTimer(timer);
		},
		[filters, searchDebounceTimer, updateURL],
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
		[filters, updateURL],
	);

	/**
	 * Clear all filters
	 */
	const clearFilters = useCallback(() => {
		const newFilters: QuoteFilters = {
			searchQuery: "",
			sortBy: "newest",
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

		if (filters.status) {
			count++;
		}
		if (filters.searchQuery) {
			count++;
		}
		if (filters.sortBy && filters.sortBy !== "newest") {
			count++;
		}

		return count;
	}, [filters]);

	/**
	 * Check if any filters are active
	 */
	const hasActiveFilters = useMemo(
		() => activeFiltersCount > 0,
		[activeFiltersCount],
	);

	// Cleanup debounce timer on unmount
	useEffect(
		() => () => {
			if (searchDebounceTimer) {
				clearTimeout(searchDebounceTimer);
			}
		},
		[searchDebounceTimer],
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
