/**
 * Address Autocomplete Hook
 *
 * Feature: 001-delivery-address
 * Created: 2025-11-01
 *
 * Purpose:
 * Debounced address search with geocoding API integration
 *
 * Usage:
 * const { results, isLoading, query, setQuery } = useAddressAutocomplete();
 */

"use client";

import { useState } from "react";
import type { GeocodingResult } from "@/app/(dashboard)/admin/quotes/_types/address.types";
import { useDebounce } from "@/hooks/use-debounce-value";
import { api } from "@/trpc/react";

const DEBOUNCE_DELAY_MS = 300;
const MIN_QUERY_LENGTH = 3;
const DEFAULT_RESULT_LIMIT = 5;

/**
 * Hook for address autocomplete with debounced search
 *
 * @param options - Configuration options
 * @returns Autocomplete state and control functions
 *
 * @example
 * function AddressInput() {
 *   const { results, isLoading, query, setQuery } = useAddressAutocomplete();
 *
 *   return (
 *     <input
 *       value={query}
 *       onChange={(e) => setQuery(e.target.value)}
 *       placeholder="Buscar dirección..."
 *     />
 *   );
 * }
 */
export function useAddressAutocomplete(options?: {
  limit?: number;
  minQueryLength?: number;
  debounceMs?: number;
}) {
  const [query, setQuery] = useState("");

  // Debounce query to reduce API calls
  const debouncedQuery = useDebounce(
    query,
    options?.debounceMs ?? DEBOUNCE_DELAY_MS
  );

  // Determine if query is valid for search
  const minLength = options?.minQueryLength ?? MIN_QUERY_LENGTH;
  const shouldSearch = debouncedQuery.length >= minLength;

  // Call geocoding API with debounced query
  const { data, isLoading, error } = api.geocoding.search.useQuery(
    {
      query: debouncedQuery,
      limit: options?.limit ?? DEFAULT_RESULT_LIMIT,
    },
    {
      enabled: shouldSearch,
      staleTime: 300_000, // 5 minutes - addresses don't change frequently
      retry: 1, // Only retry once on failure
    }
  );

  // Extract results from response
  const results: GeocodingResult[] = data?.results ?? [];
  const totalResults = data?.totalResults ?? 0;
  const queryTime = data?.queryTime ?? 0;

  return {
    // Search results
    results,
    totalResults,
    queryTime,

    // Loading states
    isLoading,
    isSearching: shouldSearch && isLoading,
    hasError: Boolean(error),
    error: error?.message,

    // Query control
    query,
    setQuery,
    debouncedQuery,

    // Helper states
    hasResults: results.length > 0,
    isEmpty: shouldSearch && !isLoading && results.length === 0,
    isIdle: !shouldSearch,
  };
}

/**
 * Hook variant that returns only the selected result
 *
 * @param options - Configuration options
 * @returns Autocomplete state with selection handling
 *
 * @example
 * function AddressPicker() {
 *   const { results, selectedResult, selectResult, clearSelection } = useAddressAutocompleteWithSelection();
 *
 *   return (
 *     <>
 *       {results.map((result) => (
 *         <button key={result.placeId} onClick={() => selectResult(result)}>
 *           {result.displayName}
 *         </button>
 *       ))}
 *     </>
 *   );
 * }
 */
export function useAddressAutocompleteWithSelection(options?: {
  limit?: number;
  minQueryLength?: number;
  debounceMs?: number;
  onSelect?: (result: GeocodingResult) => void;
}) {
  const autocomplete = useAddressAutocomplete(options);
  const [selectedResult, setSelectedResult] = useState<GeocodingResult | null>(
    null
  );

  const selectResult = (result: GeocodingResult) => {
    setSelectedResult(result);
    options?.onSelect?.(result);
  };

  const clearSelection = () => {
    setSelectedResult(null);
  };

  return {
    ...autocomplete,
    selectedResult,
    selectResult,
    clearSelection,
    hasSelection: selectedResult !== null,
  };
}
