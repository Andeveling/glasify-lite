/**
 * useCurrencyFormatter Hook
 *
 * Custom hook that uses tenant configuration to format currency values
 * Respects tenant's currency and locale settings
 */

"use client";

import { formatCurrency } from "@/lib/format";
import { useTenantConfig } from "@/providers/tenant-config-provider";

export function useCurrencyFormatter() {
  const tenantConfig = useTenantConfig();

  const formatPrice = (value: number, showDecimals = false): string =>
    formatCurrency(value, {
      context: tenantConfig,
      decimals: showDecimals ? 2 : 0,
    });

  const formatPriceCompact = (value: number): string =>
    formatCurrency(value, {
      context: tenantConfig,
    });

  return {
    currency: tenantConfig.currency,
    formatPrice,
    formatPriceCompact,
    locale: tenantConfig.locale,
  };
}
