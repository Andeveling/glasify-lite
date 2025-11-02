/**
 * useCurrencyFormatter Hook
 *
 * Custom hook that uses tenant configuration to format currency values
 * Respects tenant's currency and locale settings
 */

"use client";

import { formatCurrency } from "@/app/_utils/format-currency.util";
import { useTenantCurrency } from "./use-tenant-currency";

export function useCurrencyFormatter() {
	const { currency, locale, isLoading } = useTenantCurrency();

	const formatPrice = (value: number, showDecimals = false): string =>
		formatCurrency(value, {
			currency,
			decimals: showDecimals ? 2 : 0,
			display: "symbol",
			locale,
		});

	const formatPriceCompact = (value: number): string =>
		formatCurrency(value, {
			currency,
			display: "symbol",
			locale,
		});

	return {
		currency,
		formatPrice,
		formatPriceCompact,
		isLoadingConfig: isLoading,
		locale,
	};
}
