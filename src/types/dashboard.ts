/**
 * Dashboard Types and Interfaces
 *
 * Aggregated data structures for dashboard metrics and analytics.
 * No database schema changes - read-only operations only.
 *
 * @module types/dashboard
 */

import type { TenantConfig } from "@prisma/client";

// =============================================================================
// ENUMS
// =============================================================================

/**
 * Period selection for temporal filtering
 */
export const DashboardPeriod = {
	CURRENT_YEAR: "year",
	LAST_7_DAYS: "7d",
	LAST_30_DAYS: "30d",
	LAST_90_DAYS: "90d",
} as const;

export type DashboardPeriodType =
	(typeof DashboardPeriod)[keyof typeof DashboardPeriod];

/**
 * Chart rendering types
 */
export const ChartType = {
	AREA: "area",
	BAR: "bar",
	LINE: "line",
	PIE: "pie",
} as const;

export type ChartTypeValue = (typeof ChartType)[keyof typeof ChartType];

// =============================================================================
// QUOTE METRICS (US1)
// =============================================================================

/**
 * Quote performance metrics aggregation
 *
 * @example
 * ```ts
 * {
 *   totalQuotes: 150,
 *   draftQuotes: 45,
 *   sentQuotes: 100,
 *   canceledQuotes: 5,
 *   conversionRate: 0.667, // 66.7%
 *   previousPeriodTotal: 120,
 *   percentageChange: 0.25, // +25%
 * }
 * ```
 */
export type QuoteMetrics = {
	canceledQuotes: number;
	conversionRate: number; // (sent / total) * 100, 0-1 decimal
	draftQuotes: number;
	percentageChange: number; // ((current - previous) / previous), 0-1 decimal
	previousPeriodTotal: number;
	sentQuotes: number;
	totalQuotes: number;
};

/**
 * Single data point for trend chart
 */
export type TrendDataPoint = {
	count: number;
	date: string; // ISO 8601 format
	label: string; // Pre-formatted date (e.g., "15 Ene") from formatDateShort
};

/**
 * Quote trend data for time-series visualization
 */
export type QuotesTrendData = {
	dataPoints: TrendDataPoint[];
	period: DashboardPeriodType;
};

// =============================================================================
// CATALOG ANALYTICS (US2)
// =============================================================================

/**
 * Top quoted model
 */
export type TopModel = {
	count: number;
	modelId: string;
	modelName: string;
	percentage: number; // (count / totalItems) * 100, 0-1 decimal
	supplierName: string | null;
};

/**
 * Top glass type
 */
export type TopGlassType = {
	count: number;
	glassTypeCode: string;
	glassTypeId: string;
	glassTypeName: string;
	manufacturer: string | null;
	percentage: number; // (count / totalItems) * 100, 0-1 decimal
};

/**
 * Supplier distribution aggregation
 */
export type SupplierDistribution = {
	count: number;
	percentage: number;
	supplierId: string | null; // null for models without supplier
	supplierName: string;
};

/**
 * Catalog analytics aggregation (top models, glass types, suppliers)
 */
export type CatalogAnalytics = {
	supplierDistribution: SupplierDistribution[];
	topGlassTypes: TopGlassType[]; // Max 5
	topModels: TopModel[]; // Max 5
};

// =============================================================================
// MONETARY METRICS (US3)
// =============================================================================

/**
 * Monetary metrics aggregation
 *
 * @example
 * ```ts
 * {
 *   totalValue: 50000000, // $50M COP
 *   averageValue: 333333,
 *   currency: "COP",
 *   locale: "es-CO",
 *   previousPeriodTotal: 40000000,
 *   percentageChange: 0.25, // +25%
 * }
 * ```
 */
export type MonetaryMetrics = {
	averageValue: number;
	currency: string; // From TenantConfig
	locale: string; // From TenantConfig
	percentageChange: number;
	previousPeriodTotal: number;
	totalValue: number; // Sum of Quote.total (as number, not Decimal)
};

/**
 * Price range bucket
 */
export type PriceRange = {
	count: number;
	label: string; // Pre-formatted range (e.g., "$1M - $5M") from formatCurrency
	max: number | null; // null for open-ended range (e.g., "10M+")
	min: number;
	percentage: number;
};

/**
 * Price range distribution
 */
export type PriceRangeDistribution = {
	currency: string;
	ranges: PriceRange[];
};

// =============================================================================
// PERIOD COMPARISON (US4)
// =============================================================================

/**
 * Date range with human-readable label
 */
export type DateRange = {
	end: Date;
	label: string; // Human-readable (e.g., "Últimos 30 días")
	start: Date;
};

/**
 * Period comparison with percentage change
 */
export type PeriodComparison = {
	currentPeriod: DateRange;
	currentValue: number;
	isPositive: boolean; // true if increase, false if decrease
	percentageChange: number; // 0-1 decimal
	previousPeriod: DateRange;
	previousValue: number;
};

// =============================================================================
// CHART CONFIGURATION
// =============================================================================

/**
 * Chart rendering configuration
 */
export type ChartConfig = {
	dataKey: string;
	description?: string;
	title: string;
	type: ChartTypeValue;
	xAxisKey?: string;
	yAxisKey?: string;
};

// =============================================================================
// CONTEXT & CONFIGURATION
// =============================================================================

/**
 * Dashboard rendering context with tenant configuration
 *
 * Used by components and formatters to respect tenant settings:
 * - Currency formatting
 * - Date/time formatting with locale
 * - Timezone handling
 */
export type DashboardContext = {
	tenantConfig: Pick<TenantConfig, "currency" | "locale" | "timezone">;
};

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Generic metric card data
 */
export type MetricCardData = {
	comparison?: {
		isPositive: boolean;
		percentage: number; // Formatted via formatPercent
	};
	label: string;
	value: string; // Pre-formatted value using @lib/format
};

/**
 * Generic chart data point
 */
export type ChartDataPoint = {
	[key: string]: string | number;
};
