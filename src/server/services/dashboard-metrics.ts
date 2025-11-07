/**
 * Dashboard Metrics Service - Pure business logic
 */

import { formatDateShort } from "@/lib/format";
import type {
  DashboardPeriodType,
  DateRange,
  QuoteMetrics,
  SupplierDistribution,
  TopGlassType,
  TopModel,
  TrendDataPoint,
} from "@/types/dashboard";

const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30;
const DAYS_IN_QUARTER = 90;

// Time conversion constants
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MS_PER_SECOND = 1000;
const MS_PER_DAY =
  MS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY;

// Catalog analytics constants
const TOP_ITEMS_LIMIT = 5;

export function getPeriodDateRange(period: DashboardPeriodType): DateRange {
  const end = new Date();
  const start = new Date();
  let label: string;

  if (period === "7d") {
    start.setDate(start.getDate() - DAYS_IN_WEEK);
    label = "Últimos 7 días";
  } else if (period === "30d") {
    start.setDate(start.getDate() - DAYS_IN_MONTH);
    label = "Últimos 30 días";
  } else if (period === "90d") {
    start.setDate(start.getDate() - DAYS_IN_QUARTER);
    label = "Últimos 90 días";
  } else {
    start.setFullYear(end.getFullYear(), 0, 1);
    label = `Año ${end.getFullYear()}`;
  }

  return { end, label, start };
}

export function calculateConversionRate(sent: number, total: number): number {
  return total === 0 ? 0 : sent / total;
}

export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  return previous === 0 ? 0 : (current - previous) / previous;
}

export function calculateQuoteMetrics(data: {
  total: number;
  draft: number;
  sent: number;
  canceled: number;
  previousTotal: number;
}): QuoteMetrics {
  return {
    canceledQuotes: data.canceled,
    conversionRate: calculateConversionRate(data.sent, data.total),
    draftQuotes: data.draft,
    percentageChange: calculatePercentageChange(data.total, data.previousTotal),
    previousPeriodTotal: data.previousTotal,
    sentQuotes: data.sent,
    totalQuotes: data.total,
  };
}

/**
 * Aggregate quotes by date for trend chart visualization
 *
 * Groups quotes by creation date and fills gaps with zero counts.
 * Dates are formatted using tenant timezone and locale via @lib/format.
 *
 * @param quotes - Array of quotes with createdAt dates
 * @param dateRange - Period start and end dates
 * @param tenantConfig - Tenant configuration for date formatting (timezone, locale)
 * @returns Array of data points with date, count, and pre-formatted label
 *
 * @example
 * ```ts
 * const quotes = [
 *   { createdAt: new Date('2025-01-15') },
 *   { createdAt: new Date('2025-01-15') },
 *   { createdAt: new Date('2025-01-17') },
 * ];
 * const range = { start: new Date('2025-01-15'), end: new Date('2025-01-18') };
 * aggregateQuotesByDate(quotes, range, tenantConfig);
 * // Returns:
 * // [
 * //   { date: '2025-01-15', count: 2, label: '15 Ene' },
 * //   { date: '2025-01-16', count: 0, label: '16 Ene' },
 * //   { date: '2025-01-17', count: 1, label: '17 Ene' },
 * //   { date: '2025-01-18', count: 0, label: '18 Ene' },
 * // ]
 * ```
 */
export function aggregateQuotesByDate(
  quotes: Array<{ createdAt: Date }>,
  dateRange: DateRange,
  tenantConfig?: { timezone?: string; locale?: string } | null
): TrendDataPoint[] {
  // Create map of date string -> count
  const countsByDate = new Map<string, number>();

  // Aggregate existing quotes
  for (const quote of quotes) {
    const dateKey = quote.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
    if (dateKey) {
      countsByDate.set(dateKey, (countsByDate.get(dateKey) ?? 0) + 1);
    }
  }

  // Calculate number of days in range
  const daysDiff = Math.ceil(
    (dateRange.end.getTime() - dateRange.start.getTime()) / MS_PER_DAY
  );

  // Fill gaps with zero counts
  const result: TrendDataPoint[] = [];
  const currentDate = new Date(dateRange.start);

  for (let i = 0; i <= daysDiff; i++) {
    const dateKey = currentDate.toISOString().split("T")[0];

    if (dateKey) {
      result.push({
        count: countsByDate.get(dateKey) ?? 0,
        date: dateKey,
        label: formatDateShort(currentDate, tenantConfig),
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
}

// =============================================================================
// CATALOG ANALYTICS (US2)
// =============================================================================

/**
 * Get top 5 most quoted models with supplier information
 *
 * Aggregates QuoteItems by modelId, joins with Model and ProfileSupplier,
 * calculates percentages, and limits to top 5 by count.
 *
 * @param quoteItems - Array of quote items with model and supplier relations
 * @returns Top 5 models sorted by count descending
 *
 * @example
 * ```ts
 * const items = [
 *   { modelId: 'm1', model: { name: 'Corrediza', profileSupplier: { name: 'Aluminio XYZ' } } },
 *   { modelId: 'm1', model: { name: 'Corrediza', profileSupplier: { name: 'Aluminio XYZ' } } },
 *   { modelId: 'm2', model: { name: 'Proyectante', profileSupplier: null } },
 * ];
 * getTopModels(items);
 * // Returns:
 * // [
 * //   { modelId: 'm1', modelName: 'Corrediza', supplierName: 'Aluminio XYZ', count: 2, percentage: 0.667 },
 * //   { modelId: 'm2', modelName: 'Proyectante', supplierName: null, count: 1, percentage: 0.333 },
 * // ]
 * ```
 */
export function getTopModels(
  quoteItems: Array<{
    modelId: string;
    model: {
      name: string;
      profileSupplier: { name: string } | null;
    };
  }>
): TopModel[] {
  // Count items by modelId
  const countsByModel = new Map<
    string,
    { count: number; modelName: string; supplierName: string | null }
  >();

  for (const item of quoteItems) {
    const existing = countsByModel.get(item.modelId);
    if (existing) {
      existing.count += 1;
    } else {
      countsByModel.set(item.modelId, {
        count: 1,
        modelName: item.model.name,
        supplierName: item.model.profileSupplier?.name ?? null,
      });
    }
  }

  const totalItems = quoteItems.length;

  // Convert to array, calculate percentages, sort by count desc, limit to 5
  return Array.from(countsByModel.entries())
    .map(([modelId, data]) => ({
      count: data.count,
      modelId,
      modelName: data.modelName,
      percentage: totalItems === 0 ? 0 : data.count / totalItems,
      supplierName: data.supplierName,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_ITEMS_LIMIT);
}

/**
 * Get top 5 glass types with usage counts
 *
 * Aggregates QuoteItems by glassTypeId, joins with GlassType,
 * calculates percentages, and limits to top 5 by count.
 *
 * @param quoteItems - Array of quote items with glass type relations
 * @returns Top 5 glass types sorted by count descending
 *
 * @example
 * ```ts
 * const items = [
 *   { glassTypeId: 'g1', glassType: { name: 'Claro 6mm', code: 'C6', manufacturer: 'Vitro' } },
 *   { glassTypeId: 'g1', glassType: { name: 'Claro 6mm', code: 'C6', manufacturer: 'Vitro' } },
 *   { glassTypeId: 'g2', glassType: { name: 'Bronce 4mm', code: 'B4', manufacturer: 'Guardian' } },
 * ];
 * getGlassTypeDistribution(items);
 * // Returns:
 * // [
 * //   { glassTypeId: 'g1', glassTypeName: 'Claro 6mm', glassTypeCode: 'C6', manufacturer: 'Vitro', count: 2, percentage: 0.667 },
 * //   { glassTypeId: 'g2', glassTypeName: 'Bronce 4mm', glassTypeCode: 'B4', manufacturer: 'Guardian', count: 1, percentage: 0.333 },
 * // ]
 * ```
 */
export function getGlassTypeDistribution(
  quoteItems: Array<{
    glassTypeId: string;
    glassType: {
      name: string;
      code: string;
      manufacturer: string | null;
    };
  }>
): TopGlassType[] {
  // Count items by glassTypeId
  const countsByGlassType = new Map<
    string,
    {
      count: number;
      glassTypeCode: string;
      glassTypeName: string;
      manufacturer: string | null;
    }
  >();

  for (const item of quoteItems) {
    const existing = countsByGlassType.get(item.glassTypeId);
    if (existing) {
      existing.count += 1;
    } else {
      countsByGlassType.set(item.glassTypeId, {
        count: 1,
        glassTypeCode: item.glassType.code,
        glassTypeName: item.glassType.name,
        manufacturer: item.glassType.manufacturer,
      });
    }
  }

  const totalItems = quoteItems.length;

  // Convert to array, calculate percentages, sort by count desc, limit to 5
  return Array.from(countsByGlassType.entries())
    .map(([glassTypeId, data]) => ({
      count: data.count,
      glassTypeCode: data.glassTypeCode,
      glassTypeId,
      glassTypeName: data.glassTypeName,
      manufacturer: data.manufacturer,
      percentage: totalItems === 0 ? 0 : data.count / totalItems,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_ITEMS_LIMIT);
}

/**
 * Get supplier distribution from quote items
 *
 * Aggregates QuoteItems via Model.profileSupplierId, groups by supplier,
 * and handles null case with "Sin fabricante" label.
 *
 * @param quoteItems - Array of quote items with model and supplier relations
 * @returns Supplier distribution sorted by count descending
 *
 * @example
 * ```ts
 * const items = [
 *   { model: { profileSupplier: { id: 's1', name: 'Aluminio XYZ' } } },
 *   { model: { profileSupplier: { id: 's1', name: 'Aluminio XYZ' } } },
 *   { model: { profileSupplier: null } },
 * ];
 * getSupplierDistribution(items);
 * // Returns:
 * // [
 * //   { supplierId: 's1', supplierName: 'Aluminio XYZ', count: 2, percentage: 0.667 },
 * //   { supplierId: null, supplierName: 'Sin fabricante', count: 1, percentage: 0.333 },
 * // ]
 * ```
 */
export function getSupplierDistribution(
  quoteItems: Array<{
    model: {
      profileSupplier: { id: string; name: string } | null;
    };
  }>
): SupplierDistribution[] {
  // Count items by supplierId (null for models without supplier)
  const countsBySupplier = new Map<
    string | null,
    { count: number; supplierName: string }
  >();

  for (const item of quoteItems) {
    const supplierId = item.model.profileSupplier?.id ?? null;
    const supplierName = item.model.profileSupplier?.name ?? "Sin fabricante";

    const existing = countsBySupplier.get(supplierId);
    if (existing) {
      existing.count += 1;
    } else {
      countsBySupplier.set(supplierId, {
        count: 1,
        supplierName,
      });
    }
  }

  const totalItems = quoteItems.length;

  // Convert to array, calculate percentages, sort by count desc
  return Array.from(countsBySupplier.entries())
    .map(([supplierId, data]) => ({
      count: data.count,
      percentage: totalItems === 0 ? 0 : data.count / totalItems,
      supplierId,
      supplierName: data.supplierName,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate monetary metrics from quotes
 *
 * Aggregates Quote.total to calculate:
 * - Total value across all quotes
 * - Average quote value (total/count)
 *
 * Handles Prisma Decimal type conversion.
 *
 * @param quotes - Array of quotes with total field (Decimal)
 * @returns MonetaryMetrics with totalValue and averageValue as numbers
 *
 * @example
 * ```ts
 * const quotes = [
 *   { total: new Decimal('1500000') },
 *   { total: new Decimal('2500000') },
 *   { total: new Decimal('3000000') },
 * ];
 * calculateMonetaryMetrics(quotes);
 * // Returns: { totalValue: 7000000, averageValue: 2333333.33 }
 * ```
 */
export function calculateMonetaryMetrics(
  quotes: Array<{ total: { toNumber: () => number } }>
): {
  averageValue: number;
  totalValue: number;
} {
  if (quotes.length === 0) {
    return { averageValue: 0, totalValue: 0 };
  }

  const totalValue = quotes.reduce(
    (sum, quote) => sum + quote.total.toNumber(),
    0
  );
  const averageValue = totalValue / quotes.length;

  return { averageValue, totalValue };
}

/**
 * Group quotes by price range
 *
 * Configurable price ranges for distribution analysis.
 * Default ranges: 0-1M, 1M-5M, 5M-10M, 10M+
 *
 * @param quotes - Array of quotes with total field (Decimal)
 * @param ranges - Optional custom price ranges (defaults to 1M, 5M, 10M thresholds)
 * @returns Array of PriceRange objects with count and label
 *
 * @example
 * ```ts
 * const quotes = [
 *   { total: new Decimal('500000') },    // 0-1M
 *   { total: new Decimal('3000000') },   // 1M-5M
 *   { total: new Decimal('7000000') },   // 5M-10M
 *   { total: new Decimal('15000000') },  // 10M+
 * ];
 * groupQuotesByPriceRange(quotes);
 * // Returns:
 * // [
 * //   { label: '0 - 1M', count: 1, min: 0, max: 1000000 },
 * //   { label: '1M - 5M', count: 1, min: 1000000, max: 5000000 },
 * //   { label: '5M - 10M', count: 1, min: 5000000, max: 10000000 },
 * //   { label: '10M+', count: 1, min: 10000000, max: null },
 * // ]
 * ```
 */
export function groupQuotesByPriceRange(
  quotes: Array<{ total: { toNumber: () => number } }>,
  ranges: Array<{ label: string; max: number | null; min: number }> = [
    { label: "0 - 1M", max: 1_000_000, min: 0 },
    { label: "1M - 5M", max: 5_000_000, min: 1_000_000 },
    { label: "5M - 10M", max: 10_000_000, min: 5_000_000 },
    { label: "10M+", max: null, min: 10_000_000 },
  ]
): Array<{ count: number; label: string; max: number | null; min: number }> {
  // Initialize counts
  const rangeCounts = ranges.map((range) => ({
    count: 0,
    label: range.label,
    max: range.max,
    min: range.min,
  }));

  // Group quotes into ranges
  for (const quote of quotes) {
    const value = quote.total.toNumber();

    for (const range of rangeCounts) {
      const meetsMin = value >= range.min;
      const meetsMax = range.max === null || value < range.max;

      if (meetsMin && meetsMax) {
        range.count += 1;
        break; // Quote belongs to only one range
      }
    }
  }

  return rangeCounts;
}

/**
 * Calculate period comparison metrics
 *
 * Compares current period metrics against previous period to show trends.
 * Handles zero division edge cases (returns 0 when previous is 0).
 *
 * @param current - Current period value
 * @param previous - Previous period value
 * @returns Comparison object with percentage change and trend direction
 *
 * @example
 * ```ts
 * calculatePeriodComparison(150, 120);
 * // Returns: { current: 150, previous: 120, percentageChange: 0.25, isPositive: true }
 *
 * calculatePeriodComparison(80, 100);
 * // Returns: { current: 80, previous: 100, percentageChange: -0.20, isPositive: false }
 *
 * calculatePeriodComparison(50, 0);
 * // Returns: { current: 50, previous: 0, percentageChange: 0, isPositive: true }
 * ```
 */
export function calculatePeriodComparison(
  current: number,
  previous: number
): {
  current: number;
  isPositive: boolean;
  percentageChange: number;
  previous: number;
} {
  const percentageChange = calculatePercentageChange(current, previous);
  const isPositive = percentageChange >= 0;

  return {
    current,
    isPositive,
    percentageChange,
    previous,
  };
}
