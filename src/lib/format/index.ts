/**
 * Centralized Formatting System
 *
 * All formatters connected to TenantConfig for internationalization.
 * Uses @formkit/tempo for dates and Intl APIs for currency/numbers.
 *
 * @module lib/format
 * @server-side-only
 */

import { format as tempoFormat } from "@formkit/tempo";
import type { TenantConfig } from "@prisma/client";

/**
 * Formatting context from TenantConfig
 */
type FormatContext = Pick<TenantConfig, "locale" | "timezone" | "currency">;

/**
 * Default format context (fallback when tenant config not available)
 */
const DEFAULT_CONTEXT: FormatContext = {
  currency: "COP",
  locale: "es-CO",
  timezone: "America/Bogota",
};

/**
 * Get format context or use defaults
 */
function getContext(context?: Partial<FormatContext> | null): FormatContext {
  return {
    currency: context?.currency ?? DEFAULT_CONTEXT.currency,
    locale: context?.locale ?? DEFAULT_CONTEXT.locale,
    timezone: context?.timezone ?? DEFAULT_CONTEXT.timezone,
  };
}

// =============================================================================
// DATE FORMATTING (Tempo-based)
// =============================================================================

/**
 * Format date with tenant locale and timezone
 *
 * @example
 * ```ts
 * formatDate(new Date(), { date: 'long' }, tenantConfig)
 * // Colombia (es-CO): "19 de enero de 2025"
 * // Panama (es-PA): "19 de enero de 2025"
 * // USA (en-US): "January 19, 2025"
 * ```
 */
function formatDate(
  date: Date | string,
  formatStyle: string | { date?: string; time?: string } = { date: "medium" },
  context?: Partial<FormatContext> | null
): string {
  const { locale, timezone } = getContext(context);

  return tempoFormat({
    date,
    format: formatStyle as never,
    locale,
    tz: timezone,
  });
}

/**
 * Format date as full (most detailed)
 *
 * @example
 * ```ts
 * formatDateFull(new Date(), tenantConfig)
 * // es-CO: "domingo, 19 de enero de 2025"
 * // en-US: "Sunday, January 19, 2025"
 * ```
 */
function formatDateFull(
  date: Date | string,
  context?: Partial<FormatContext> | null
): string {
  return formatDate(date, { date: "full" }, context);
}

/**
 * Format date as long
 *
 * @example
 * ```ts
 * formatDateLong(new Date(), tenantConfig)
 * // es-CO: "19 de enero de 2025"
 * // en-US: "January 19, 2025"
 * ```
 */
function formatDateLong(
  date: Date | string,
  context?: Partial<FormatContext> | null
): string {
  return formatDate(date, { date: "long" }, context);
}

/**
 * Format date as medium
 *
 * @example
 * ```ts
 * formatDateMedium(new Date(), tenantConfig)
 * // es-CO: "19 ene 2025"
 * // en-US: "Jan 19, 2025"
 * ```
 */
function formatDateMedium(
  date: Date | string,
  context?: Partial<FormatContext> | null
): string {
  return formatDate(date, { date: "medium" }, context);
}

/**
 * Format date as short
 *
 * @example
 * ```ts
 * formatDateShort(new Date(), tenantConfig)
 * // es-CO: "19/01/2025"
 * // en-US: "1/19/2025"
 * ```
 */
function formatDateShort(
  date: Date | string,
  context?: Partial<FormatContext> | null
): string {
  return formatDate(date, { date: "short" }, context);
}

/**
 * Format datetime (date + time)
 *
 * @example
 * ```ts
 * formatDateTime(new Date(), tenantConfig)
 * // es-CO: "19 ene 2025, 14:30"
 * // en-US: "Jan 19, 2025, 2:30 PM"
 * ```
 */
function formatDateTime(
  date: Date | string,
  dateStyle: "full" | "long" | "medium" | "short" = "medium",
  timeStyle: "full" | "long" | "medium" | "short" = "short",
  context?: Partial<FormatContext> | null
): string {
  return formatDate(date, { date: dateStyle, time: timeStyle }, context);
}

/**
 * Format time only
 *
 * @example
 * ```ts
 * formatTime(new Date(), tenantConfig)
 * // es-CO: "14:30"
 * // en-US: "2:30 PM"
 * ```
 */
function formatTime(
  date: Date | string,
  style: "full" | "long" | "medium" | "short" = "short",
  context?: Partial<FormatContext> | null
): string {
  return formatDate(date, { time: style }, context);
}

/**
 * Format with custom tokens
 *
 * @example
 * ```ts
 * formatDateCustom(new Date(), 'YYYY-MM-DD', tenantConfig)
 * // "2025-01-19"
 *
 * formatDateCustom(new Date(), 'DD/MM/YYYY HH:mm', tenantConfig)
 * // "19/01/2025 14:30"
 * ```
 */
function formatDateCustom(
  date: Date | string,
  formatTokens: string,
  context?: Partial<FormatContext> | null
): string {
  return formatDate(date, formatTokens, context);
}

// =============================================================================
// CURRENCY FORMATTING (Intl-based)
// =============================================================================

/**
 * Format number as currency with tenant configuration
 *
 * @example
 * ```ts
 * formatCurrency(285000, tenantConfig)
 * // COP (es-CO): "$285.000"
 * // USD (en-US): "$285,000"
 * // EUR (es-ES): "285.000 €"
 * ```
 */
function formatCurrency(
  amount: number,
  options?: {
    decimals?: number;
    context?: Partial<FormatContext> | null;
  }
): string {
  const { currency, locale } = getContext(options?.context);
  // Default: COP (0 decimals), USD/EUR (2 decimals)
  // Can be overridden with options.decimals for precision cases (e.g., pricing with 3-4 decimals)
  const decimals = options?.decimals ?? (currency === "COP" ? 0 : 2);

  try {
    return new Intl.NumberFormat(locale, {
      currency,
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
      style: "currency",
    }).format(amount);
  } catch {
    // Fallback if Intl fails
    return `${currency} ${amount.toFixed(decimals)}`;
  }
}

/**
 * Format currency with compact notation for large numbers
 *
 * @example
 * ```ts
 * formatCurrencyCompact(1500000, tenantConfig)
 * // es-CO: "$1,5 M"
 * // en-US: "$1.5M"
 * ```
 */
function formatCurrencyCompact(
  amount: number,
  context?: Partial<FormatContext> | null
): string {
  const { currency, locale } = getContext(context);

  try {
    return new Intl.NumberFormat(locale, {
      compactDisplay: "short",
      currency,
      maximumFractionDigits: 1,
      notation: "compact",
      style: "currency",
    }).format(amount);
  } catch {
    return formatCurrency(amount, { context });
  }
}

// =============================================================================
// NUMBER FORMATTING (Intl-based)
// =============================================================================

/**
 * Format number with locale-aware thousand separators
 *
 * @example
 * ```ts
 * formatNumber(285000, tenantConfig)
 * // es-CO: "285.000"
 * // en-US: "285,000"
 * ```
 */
function formatNumber(
  value: number,
  options?: {
    decimals?: number;
    context?: Partial<FormatContext> | null;
  }
): string {
  const { locale } = getContext(options?.context);
  const decimals = options?.decimals ?? 0;

  try {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(value);
  } catch {
    return value.toFixed(decimals);
  }
}

/**
 * Format percentage
 *
 * @example
 * ```ts
 * formatPercent(0.19, tenantConfig)
 * // "19%"
 * ```
 */
function formatPercent(
  value: number,
  options?: {
    decimals?: number;
    context?: Partial<FormatContext> | null;
  }
): string {
  const percentMultiplier = 100;
  const { locale } = getContext(options?.context);
  const decimals = options?.decimals ?? 0;

  try {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
      style: "percent",
    }).format(value);
  } catch {
    return `${(value * percentMultiplier).toFixed(decimals)}%`;
  }
}

// =============================================================================
// UNIT FORMATTING
// =============================================================================

/**
 * Format dimensions (millimeters)
 *
 * @example
 * ```ts
 * formatDimensions(2500, 1800, tenantConfig)
 * // "2.500mm × 1.800mm"
 * ```
 */
function formatDimensions(
  width: number,
  height: number,
  context?: Partial<FormatContext> | null
): string {
  const { locale } = getContext(context);

  try {
    const formatter = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });

    return `${formatter.format(width)}mm × ${formatter.format(height)}mm`;
  } catch {
    return `${width}mm × ${height}mm`;
  }
}

/**
 * Format area (square meters)
 *
 * @example
 * ```ts
 * formatArea(4.5, tenantConfig)
 * // "4,50 m²"
 * ```
 */
function formatArea(
  value: number,
  context?: Partial<FormatContext> | null
): string {
  return `${formatNumber(value, { context, decimals: 2 })} m²`;
}

/**
 * Format thickness (millimeters)
 *
 * @example
 * ```ts
 * formatThickness(6, tenantConfig)
 * // "6mm"
 * formatThickness(10.5, tenantConfig)
 * // "10,5mm"
 * ```
 */
function formatThickness(
  value: number,
  context?: Partial<FormatContext> | null
): string {
  const hasDecimals = value % 1 !== 0;
  return `${formatNumber(value, { context, decimals: hasDecimals ? 1 : 0 })}mm`;
}

// =============================================================================
// TAX FORMATTING
// =============================================================================

/**
 * Tax configuration context (extends FormatContext with tax fields)
 */
type TaxContext = FormatContext & {
  taxName?: string | null;
  taxRate?: number | null;
  taxEnabled?: boolean;
  taxDescription?: string | null;
};

/**
 * Format tax label with name and percentage
 *
 * @example
 * ```ts
 * formatTaxLabel({ taxName: 'IVA', taxRate: 0.19, taxEnabled: true })
 * // "IVA (19%)"
 *
 * formatTaxLabel({ taxName: 'ITBMS', taxRate: 0.07, taxEnabled: true })
 * // "ITBMS (7%)"
 *
 * formatTaxLabel({ taxEnabled: false })
 * // null
 * ```
 */
function formatTaxLabel(context?: Partial<TaxContext> | null): string | null {
  // Validate all required fields exist
  if (!context?.taxEnabled) {
    return null;
  }

  const taxName = context.taxName;
  const taxRate = context.taxRate;

  if (taxName == null || taxRate == null) {
    return null;
  }

  const percentMultiplier = 100;
  const percentage = taxRate * percentMultiplier;
  // Show decimal only if needed (e.g., 7% not 7.00%, but 10.5% if applicable)
  const formattedPercentage =
    percentage % 1 === 0 ? percentage.toFixed(0) : percentage.toFixed(1);

  return `${taxName} (${formattedPercentage}%)`;
}

/**
 * Calculate tax amount from subtotal
 *
 * @example
 * ```ts
 * calculateTax(100000, { taxRate: 0.19, taxEnabled: true })
 * // 19000
 *
 * calculateTax(100000, { taxRate: 0.07, taxEnabled: true })
 * // 7000
 *
 * calculateTax(100000, { taxEnabled: false })
 * // 0
 * ```
 */
function calculateTax(
  subtotal: number,
  context?: Partial<TaxContext> | null
): number {
  if (!context?.taxEnabled || context.taxRate == null) {
    return 0;
  }

  return subtotal * context.taxRate;
}

/**
 * Calculate total with tax
 *
 * @example
 * ```ts
 * calculateTotalWithTax(100000, { taxRate: 0.19, taxEnabled: true })
 * // 119000
 *
 * calculateTotalWithTax(100000, { taxEnabled: false })
 * // 100000
 * ```
 */
function calculateTotalWithTax(
  subtotal: number,
  context?: Partial<TaxContext> | null
): number {
  return subtotal + calculateTax(subtotal, context);
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  formatDate,
  formatDateCustom,
  formatDateFull,
  formatDateLong,
  formatDateMedium,
  formatDateShort,
  formatDateTime,
  formatTime,
  formatCurrency,
  formatCurrencyCompact,
  formatNumber,
  formatPercent,
  formatDimensions,
  formatArea,
  formatThickness,
  // Tax utilities
  formatTaxLabel,
  calculateTax,
  calculateTotalWithTax,
};

export type { FormatContext, TaxContext };
