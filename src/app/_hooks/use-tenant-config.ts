/**
 * Tenant Configuration Hook
 *
 * Provides access to tenant configuration with aggressive caching strategy.
 *
 * **Cache Strategy**:
 * - `staleTime: Infinity` - Data never goes stale (tenant config rarely changes)
 * - `gcTime: Infinity` - Keep in cache forever (no garbage collection)
 * - `refetchOnMount: false` - Never refetch on component mount
 * - `refetchOnWindowFocus: false` - Never refetch on window focus
 * - `refetchOnReconnect: false` - Never refetch on network reconnect
 *
 * **Manual Invalidation**:
 * Only invalidate when admin explicitly updates tenant config:
 * ```typescript
 * // After updating tenant config
 * await utils.tenantConfig.get.invalidate();
 * ```
 *
 * @example
 * ```typescript
 * // In Client Component
 * export function PriceDisplay({ amount }: Props) {
 *   const { formatContext } = useTenantConfig();
 *   return <span>{formatCurrency(amount, { context: formatContext })}</span>;
 * }
 * ```
 */

"use client";

import type { TenantConfig } from "@prisma/client";
import { api } from "@/trpc/react";

/**
 * Format context type for centralized formatting system
 */
export type FormatContext = Pick<
	TenantConfig,
	"locale" | "timezone" | "currency"
>;

/**
 * Default format context (fallback when tenant config not loaded)
 */
const DEFAULT_FORMAT_CONTEXT: FormatContext = {
	currency: "COP",
	locale: "es-CO",
	timezone: "America/Bogota",
};

/**
 * Hook return type
 */
type UseTenantConfigReturn = {
	/**
	 * Full tenant configuration (may be undefined during initial load)
	 */
	tenantConfig: TenantConfig | undefined;

	/**
	 * Format context for formatting functions (never undefined, uses defaults)
	 */
	formatContext: FormatContext;

	/**
	 * Loading state (only true on first load, never again due to aggressive cache)
	 */
	isLoading: boolean;

	/**
	 * Has error (rare, only if server fails)
	 */
	hasError: boolean;
};

/**
 * Custom hook to access tenant configuration
 *
 * Uses aggressive caching since tenant config is essentially static.
 * Falls back to Colombian defaults if config not yet loaded.
 */
export function useTenantConfig(): UseTenantConfigReturn {
	const {
		data: tenantConfig,
		isLoading,
		error,
	} = api.tenantConfig.get.useQuery(undefined, {
		gcTime: Number.POSITIVE_INFINITY, // Never garbage collect
		refetchOnMount: false, // Never refetch on mount
		refetchOnReconnect: false, // Never refetch on reconnect
		refetchOnWindowFocus: false, // Never refetch on window focus
		// Aggressive caching - tenant config rarely changes
		staleTime: Number.POSITIVE_INFINITY, // Never consider stale
	});

	// Extract format context with fallback to defaults
	const formatContext: FormatContext = tenantConfig
		? {
				currency: tenantConfig.currency,
				locale: tenantConfig.locale,
				timezone: tenantConfig.timezone,
			}
		: DEFAULT_FORMAT_CONTEXT;

	return {
		formatContext,
		hasError: Boolean(error),
		isLoading,
		tenantConfig,
	};
}
