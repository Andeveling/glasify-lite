import { z } from "zod";

// ============================================================================
// ENUMS
// ============================================================================
export const DashboardPeriod = z.enum(["7d", "30d", "90d", "year"]);

// ============================================================================
// INPUT SCHEMAS
// ============================================================================
export const getDashboardPeriodInput = z.object({
  period: DashboardPeriod.default("30d"),
});

// ============================================================================
// OUTPUT SCHEMAS
// ============================================================================
export const CatalogAnalyticsOutput = z.object({
  topModels: z.array(
    z.object({
      modelId: z.string(),
      modelName: z.string(),
      count: z.number(),
    })
  ),
  topGlassTypes: z.array(
    z.object({
      glassTypeId: z.string(),
      glassTypeName: z.string(),
      count: z.number(),
    })
  ),
  supplierDistribution: z.array(
    z.object({
      supplierId: z.string().nullable(), // null for models without supplier
      supplierName: z.string(),
      count: z.number(),
    })
  ),
});

export const MonetaryMetricsOutput = z.object({
  totalValue: z.number(),
  averageValue: z.number(),
  percentageChange: z.number(),
  previousPeriodTotal: z.number(),
  currency: z.string(),
  locale: z.string(),
});

export const PriceRangesOutput = z.object({
  ranges: z.array(
    z.object({
      range: z.string(),
      count: z.number(),
      percentage: z.number(),
    })
  ),
  currency: z.string(),
});

export const QuotesMetricsOutput = z.object({
  totalQuotes: z.number(),
  draftQuotes: z.number(),
  sentQuotes: z.number(),
  canceledQuotes: z.number(),
  conversionRate: z.number(),
  percentageChange: z.number(),
});

export const QuotesTrendOutput = z.object({
  data: z.array(
    z.object({
      date: z.string(),
      count: z.number(),
    })
  ),
  period: z.string(),
});
