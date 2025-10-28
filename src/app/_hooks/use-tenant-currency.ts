/**
 * useTenantCurrency Hook
 *
 * Custom hook to fetch and use tenant currency configuration
 * Provides locale-aware currency formatting
 */

"use client";

import { api } from "@/trpc/react";

const SECONDS_IN_MINUTE = 60;
const MILLISECONDS_IN_SECOND = 1000;
const CURRENCY_CACHE_MINUTES = 5;

const CURRENCY_CACHE_TIME_MS =
  CURRENCY_CACHE_MINUTES * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND; // 5 minutes

export function useTenantCurrency() {
  const { data: tenantConfig, isLoading } = api.tenantConfig.get.useQuery(
    undefined,
    {
      // Cache for 5 minutes - currency doesn't change often
      staleTime: CURRENCY_CACHE_TIME_MS,
    }
  );

  const currency = tenantConfig?.currency ?? "COP";
  const locale = tenantConfig?.locale ?? "es-CO";

  return {
    currency,
    isLoading,
    locale,
  };
}
