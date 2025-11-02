/**
 * Currency formatting utility using Intl.NumberFormat
 * Provides consistent currency formatting across the application
 *
 * @deprecated Consider migrating to @/lib/format for tenant-aware formatting
 * This file is kept for backward compatibility with existing code
 */

import {
	formatCurrencyCompact as formatCurrencyCompactCore,
	formatCurrency as formatCurrencyCore,
} from "@/lib/format";

type FormatCurrencyOptions = {
	/**
	 * Currency code (ISO 4217)
	 * @default 'COP' (Colombian Peso)
	 */
	currency?: string;
	/**
	 * Locale for formatting
	 * @default 'es-CO' (Spanish - Colombia)
	 */
	locale?: string;
	/**
	 * Number of decimal places
	 * @default 0
	 */
	decimals?: number;
	/**
	 * Display mode for currency (not fully supported in new system)
	 * - 'symbol': Show currency symbol (e.g., $)
	 * - 'code': Show currency code (e.g., COP)
	 * - 'name': Show currency name (e.g., Colombian Peso)
	 * @default 'symbol'
	 */
	display?: "symbol" | "code" | "name";
	/**
	 * Whether to use grouping separators (always enabled in new system)
	 * @default true
	 */
	useGrouping?: boolean;
};

const DEFAULT_OPTIONS: Required<FormatCurrencyOptions> = {
	currency: "COP",
	decimals: 0,
	display: "symbol",
	locale: "es-CO",
	useGrouping: true,
};

/**
 * Formats a number as currency using centralized formatting system
 *
 * @param value - The numeric value to format
 * @param options - Formatting options
 * @returns Formatted currency string
 *
 * @example
 * ```ts
 * formatCurrency(285000) // "$285.000"
 * formatCurrency(285000, { currency: 'USD', locale: 'en-US' }) // "$285,000"
 * formatCurrency(285000, { decimals: 2 }) // "$285.000,00"
 * formatCurrency(285000, { display: 'code' }) // "285.000 COP"
 * ```
 */
export const formatCurrency = (
	value: number,
	options: FormatCurrencyOptions = {},
): string => {
	const config = { ...DEFAULT_OPTIONS, ...options };

	return formatCurrencyCore(value, {
		context: {
			currency: config.currency,
			locale: config.locale,
			timezone: "America/Bogota", // Default timezone, not used for currency
		},
		decimals: config.decimals,
	});
};

/**
 * Formats a price specifically for Colombian Pesos (COP)
 * Optimized for the Colombian market with default settings
 *
 * @param value - The numeric value to format
 * @param showDecimals - Whether to show decimal places
 * @returns Formatted COP currency string
 *
 * @example
 * ```ts
 * formatCOP(285000) // "$285.000"
 * formatCOP(285000.50, true) // "$285.000,50"
 * ```
 */
export const formatCOP = (value: number, showDecimals = false): string =>
	formatCurrency(value, {
		currency: "COP",
		decimals: showDecimals ? 2 : 0,
		display: "symbol",
		locale: "es-CO",
	});

/**
 * Formats a price specifically for US Dollars (USD) - Panama
 * Optimized for the Panamanian market with default settings
 *
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 2, use 4 for precise pricing)
 * @returns Formatted USD currency string
 *
 * @example
 * ```ts
 * formatUSD(1250) // "$1,250.00"
 * formatUSD(1250, 4) // "$1,250.0000"
 * formatUSD(0.015, 4) // "$0.0150"
 * ```
 */
export const formatUSD = (value: number, decimals = 2): string =>
	formatCurrency(value, {
		currency: "USD",
		decimals,
		display: "symbol",
		locale: "es-PA",
	});

/**
 * Formats a price with compact notation for large numbers
 *
 * @param value - The numeric value to format
 * @param options - Formatting options
 * @returns Compact formatted currency string
 *
 * @example
 * ```ts
 * formatCurrencyCompact(1500000) // "$1,5 M"
 * formatCurrencyCompact(2500) // "$2,5 mil"
 * ```
 */
export const formatCurrencyCompact = (
	value: number,
	options: Omit<FormatCurrencyOptions, "decimals"> = {},
): string => {
	const config = { ...DEFAULT_OPTIONS, ...options };

	return formatCurrencyCompactCore(value, {
		currency: config.currency,
		locale: config.locale,
		timezone: "America/Bogota", // Default timezone, not used for currency
	});
};

/**
 * Parses a formatted currency string back to a number
 *
 * @param formattedValue - The formatted currency string
 * @param locale - The locale used for formatting
 * @returns Parsed number value
 *
 * @example
 * ```ts
 * parseCurrency("$285.000") // 285000
 * parseCurrency("$285,000", "en-US") // 285000
 * ```
 */
export const parseCurrency = (
	formattedValue: string,
	locale = "es-CO",
): number => {
	try {
		// Sample number to detect separators
		const sampleNumber = 1234.56;

		// Remove currency symbols and non-numeric characters except decimal separators
		const parts = new Intl.NumberFormat(locale).formatToParts(sampleNumber);
		const groupSeparator =
			parts.find((part) => part.type === "group")?.value || ".";
		const decimalSeparator =
			parts.find((part) => part.type === "decimal")?.value || ",";

		const cleaned = formattedValue
			.replace(/[^\d.,]/g, "") // Remove non-numeric except . and ,
			.replace(new RegExp(`\\${groupSeparator}`, "g"), "") // Remove group separators
			.replace(decimalSeparator, "."); // Normalize decimal separator

		return Number.parseFloat(cleaned) || 0;
	} catch {
		return 0;
	}
};

/**
 * Currency codes commonly used in the application
 */
export const CurrencyCodes = {
	cop: "COP", // Colombian Peso
	eur: "EUR", // Euro
	mxn: "MXN", // Mexican Peso
	pab: "PAB", // Panamanian Balboa
	usd: "USD", // US Dollar
} as const;

/**
 * Locale codes commonly used in the application
 */
export const LocaleCodes = {
	enUs: "en-US", // English (United States)
	esCo: "es-CO", // Spanish (Colombia)
	esEs: "es-ES", // Spanish (Spain)
	esMx: "es-MX", // Spanish (Mexico)
	esPa: "es-PA", // Spanish (Panama)
} as const;
