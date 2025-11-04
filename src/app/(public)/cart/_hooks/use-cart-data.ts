"use client";

/**
 * Cart Data Fetching Hook
 *
 * Provides cart data with items including model and glass type relations.
 * Uses TanStack Query for caching and automatic refetching.
 */

import { api } from "@/trpc/react";

/**
 * Hook for fetching cart data
 *
 * Features:
 * - Fetches cart with all items and relations
 * - No caching (staleTime: 0) - cart data changes frequently
 * - Automatic refetch on window focus
 * - Loading and error states
 *
 * @returns Cart data with loading/error states
 *
 * @example
 * ```tsx
 * function CartPage() {
 *   const { data: cart, isLoading, error } = useCartData();
 *
 *   if (isLoading) return <Skeleton />;
 *   if (error) return <Error message={error.message} />;
 *
 *   return <CartItems items={cart.items} />;
 * }
 * ```
 */
export function useCartData() {
	return api.cart.get.useQuery(undefined, {
		// Cart data changes frequently - no stale time
		staleTime: 0,

		// Refetch on window focus to catch external changes
		refetchOnWindowFocus: true,

		// Refetch on mount to ensure fresh data
		refetchOnMount: true,
	});
}
