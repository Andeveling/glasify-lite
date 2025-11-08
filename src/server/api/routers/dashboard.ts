/**
 * Dashboard tRPC Router
 * Provides metrics and analytics for dashboard views
 */

import { and, eq, gte, lte, type SQLWrapper } from "drizzle-orm";
import { z } from "zod";
import logger from "@/lib/logger";
import {
  glassTypes,
  models,
  profileSuppliers,
  quoteItems,
  quotes,
  tenantConfigs,
} from "@/server/db/schema";
import {
  aggregateQuotesByDate,
  calculateMonetaryMetrics,
  calculateQuoteMetrics,
  getGlassTypeDistribution,
  getPeriodDateRange,
  getSupplierDistribution,
  getTopModels,
  groupQuotesByPriceRange,
} from "@/server/services/dashboard-metrics";
import { createTRPCRouter, protectedProcedure } from "../trpc";

// Time conversion constants
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MS_PER_SECOND = 1000;
const MS_PER_DAY =
  MS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY;

/**
 * Helper to convert Drizzle decimal strings to Prisma-like objects
 * Drizzle returns decimal fields as strings, but services expect objects with toNumber()
 */
function mapDecimalString(value: string): { toNumber: () => number } {
  return {
    toNumber: () => Number.parseFloat(value),
  };
}

/**
 * Helper to convert array of Drizzle quote objects to service-compatible format
 */
function mapQuotesTotalForService(
  quoteData: Array<{ total: string }>
): Array<{ total: { toNumber: () => number } }> {
  return quoteData.map((quote) => ({
    total: mapDecimalString(quote.total),
  }));
}

/**
 * Temporary type for mapped quote items to avoid 'any'
 * TODO: Refactor service functions to accept Drizzle format natively
 */
type MappedQuoteItem = {
  glassType: {
    code: string;
    manufacturer: string;
    name: string;
  };
  glassTypeId: string;
  model: {
    name: string;
    profileSupplier: {
      id: string;
      name: string;
    };
  };
  modelId: string;
};

/**
 * Dashboard period input schema
 */
const dashboardPeriodInput = z.object({
  period: z.enum(["7d", "30d", "90d", "year"]).default("30d"),
});

/**
 * Dashboard Router
 * All procedures require authentication (protectedProcedure)
 */
export const dashboardRouter = createTRPCRouter({
  /**
   * Get catalog analytics (top models, glass types, supplier distribution)
   * Returns aggregated analytics based on quote items in selected period
   */
  getCatalogAnalytics: protectedProcedure
    .input(dashboardPeriodInput)
    .query(async ({ ctx, input }) => {
      try {
        const { period } = input;
        const { session, db } = ctx;

        // Get date range for period
        const dateRange = getPeriodDateRange(period);

        // Build where conditions for quotes based on RBAC
        const whereConditions: SQLWrapper[] = [
          gte(quotes.createdAt, dateRange.start),
          lte(quotes.createdAt, dateRange.end),
        ];
        if (session.user.role !== "admin") {
          whereConditions.push(eq(quotes.userId, session.user.id));
        }

        // Fetch quote items joined with quotes, models, and glass types
        // Note: Drizzle doesn't have built-in find().select().where() with relations like Prisma
        // We need to use join queries or fetch separately and filter/map
        const fetchedQuoteItems = await db
          .select({
            glassTypeCode: glassTypes.code,
            glassTypeManufacturer: glassTypes.manufacturer,
            glassTypeName: glassTypes.name,
            glassTypeId: quoteItems.glassTypeId,
            modelName: models.name,
            modelId: quoteItems.modelId,
            profileSupplierId: profileSuppliers.id,
            profileSupplierName: profileSuppliers.name,
          })
          .from(quoteItems)
          .innerJoin(quotes, eq(quoteItems.quoteId, quotes.id))
          .innerJoin(models, eq(quoteItems.modelId, models.id))
          .innerJoin(glassTypes, eq(quoteItems.glassTypeId, glassTypes.id))
          .innerJoin(
            profileSuppliers,
            eq(models.profileSupplierId, profileSuppliers.id)
          )
          .where(and(...whereConditions));

        // FIXME: Drizzle returns nested objects vs flat Prisma structure
        // Service functions expect Prisma shape {model: {name, profileSupplier: {id, name}}}
        // But Drizzle flattens to {modelName, profileSupplierId, profileSupplierName}
        // Need to reshape data or refactor service functions for Drizzle compatibility
        const mappedQuoteItems = fetchedQuoteItems.map((item) => ({
          glassType: {
            code: item.glassTypeCode,
            manufacturer: item.glassTypeManufacturer,
            name: item.glassTypeName,
          },
          glassTypeId: item.glassTypeId,
          model: {
            name: item.modelName,
            profileSupplier: {
              id: item.profileSupplierId,
              name: item.profileSupplierName,
            },
          },
          modelId: item.modelId,
        }));

        // Calculate analytics using service layer functions
        const topModels = getTopModels(mappedQuoteItems as MappedQuoteItem[]);
        const topGlassTypes = getGlassTypeDistribution(mappedQuoteItems as MappedQuoteItem[]);
        const supplierDistribution = getSupplierDistribution(
          mappedQuoteItems as MappedQuoteItem[]
        );

        logger.info("Catalog analytics calculated", {
          period,
          role: session.user.role,
          supplierCount: supplierDistribution.length,
          topGlassTypesCount: topGlassTypes.length,
          topModelsCount: topModels.length,
          totalItems: fetchedQuoteItems.length,
          userId: session.user.id,
        });

        return {
          supplierDistribution,
          topGlassTypes,
          topModels,
        };
      } catch (error) {
        logger.error("Error calculating catalog analytics", {
          error,
          userId: ctx.session.user.id,
        });
        throw error;
      }
    }),

  /**
   * Get monetary metrics (total value, average value)
   * Returns aggregated monetary metrics from Quote.total
   */
  getMonetaryMetrics: protectedProcedure
    .input(dashboardPeriodInput)
    .query(async ({ ctx, input }) => {
      try {
        const { period } = input;
        const { session, db } = ctx;

        // Get date range for current period
        const dateRange = getPeriodDateRange(period);

        // Build where conditions based on RBAC
        const whereConditions: SQLWrapper[] = [
          gte(quotes.createdAt, dateRange.start),
          lte(quotes.createdAt, dateRange.end),
        ];
        if (session.user.role !== "admin") {
          whereConditions.push(eq(quotes.userId, session.user.id));
        }

        // Fetch quotes with total field (Decimal type)
        const currentQuotes = await db
          .select({ total: quotes.total })
          .from(quotes)
          .where(and(...whereConditions));

        // Calculate current period metrics
        const currentMetrics = calculateMonetaryMetrics(
          mapQuotesTotalForService(currentQuotes)
        );

        // Get previous period for comparison
        const previousEnd = new Date(dateRange.start);
        const previousStart = new Date(previousEnd);
        const periodLength =
          dateRange.end.getTime() - dateRange.start.getTime();
        previousStart.setTime(previousStart.getTime() - periodLength);

        const previousConditions: SQLWrapper[] = [
          gte(quotes.createdAt, previousStart),
          lte(quotes.createdAt, previousEnd),
        ];
        if (session.user.role !== "admin") {
          previousConditions.push(eq(quotes.userId, session.user.id));
        }

        const previousQuotes = await db
          .select({ total: quotes.total })
          .from(quotes)
          .where(and(...previousConditions));

        const previousMetrics = calculateMonetaryMetrics(
          mapQuotesTotalForService(previousQuotes)
        );

        // Calculate percentage change
        const percentageChange =
          previousMetrics.totalValue === 0
            ? 0
            : (currentMetrics.totalValue - previousMetrics.totalValue) /
              previousMetrics.totalValue;

        // Get tenant config for currency and locale
        const tenantConfig = await db
          .select({
            currency: tenantConfigs.currency,
            locale: tenantConfigs.locale,
          })
          .from(tenantConfigs)
          .limit(1)
          .then((result) => result[0]);

        logger.info("Monetary metrics calculated", {
          averageValue: currentMetrics.averageValue,
          percentageChange,
          period,
          role: session.user.role,
          totalQuotes: currentQuotes.length,
          totalValue: currentMetrics.totalValue,
          userId: session.user.id,
        });

        return {
          averageValue: currentMetrics.averageValue,
          currency: tenantConfig?.currency ?? "COP",
          locale: tenantConfig?.locale ?? "es-CO",
          percentageChange,
          previousPeriodTotal: previousMetrics.totalValue,
          totalValue: currentMetrics.totalValue,
        };
      } catch (error) {
        logger.error("Error calculating monetary metrics", {
          error,
          userId: ctx.session.user.id,
        });
        throw error;
      }
    }),

  /**
   * Get price range distribution
   * Groups quotes into configurable price ranges
   */
  getPriceRanges: protectedProcedure
    .input(dashboardPeriodInput)
    .query(async ({ ctx, input }) => {
      try {
        const { period } = input;
        const { session, db } = ctx;

        // Get date range for period
        const dateRange = getPeriodDateRange(period);

        // Build where conditions based on RBAC
        const whereConditions: SQLWrapper[] = [
          gte(quotes.createdAt, dateRange.start),
          lte(quotes.createdAt, dateRange.end),
        ];
        if (session.user.role !== "admin") {
          whereConditions.push(eq(quotes.userId, session.user.id));
        }

        // Fetch quotes with total field
        const priceRangeQuotes = await db
          .select({ total: quotes.total })
          .from(quotes)
          .where(and(...whereConditions));

        // Group quotes by price range
        const rangeDistribution = groupQuotesByPriceRange(
          mapQuotesTotalForService(priceRangeQuotes)
        );

        // Calculate percentages
        const totalQuotes = priceRangeQuotes.length;
        const rangesWithPercentage = rangeDistribution.map((range) => ({
          ...range,
          percentage: totalQuotes === 0 ? 0 : range.count / totalQuotes,
        }));

        // Get tenant config for currency
        const tenantConfig = await db
          .select({ currency: tenantConfigs.currency })
          .from(tenantConfigs)
          .limit(1)
          .then((result) => result[0]);

        logger.info("Price range distribution calculated", {
          period,
          ranges: rangesWithPercentage.length,
          role: session.user.role,
          totalQuotes,
          userId: session.user.id,
        });

        return {
          currency: tenantConfig?.currency ?? "COP",
          ranges: rangesWithPercentage,
        };
      } catch (error) {
        logger.error("Error calculating price ranges", {
          error,
          userId: ctx.session.user.id,
        });
        throw error;
      }
    }),
  /**
   * Get quote metrics for dashboard
   * Returns aggregated quote statistics based on selected period
   */
  getQuotesMetrics: protectedProcedure
    .input(dashboardPeriodInput)
    .query(async ({ ctx, input }) => {
      try {
        const { period } = input;
        const { session, db } = ctx;

        // Get date range for period
        const dateRange = getPeriodDateRange(period);

        // Build where conditions based on RBAC
        const whereConditions: SQLWrapper[] = [
          gte(quotes.createdAt, dateRange.start),
          lte(quotes.createdAt, dateRange.end),
        ];
        if (session.user.role !== "admin") {
          whereConditions.push(eq(quotes.userId, session.user.id));
        }

        // Get current period quotes
        const metricsQuotes = await db
          .select({ status: quotes.status })
          .from(quotes)
          .where(and(...whereConditions));

        // Count by status
        const total = metricsQuotes.length;
        const draft = metricsQuotes.filter((q) => q.status === "draft").length;
        const sent = metricsQuotes.filter((q) => q.status === "sent").length;
        const canceled = metricsQuotes.filter(
          (q) => q.status === "canceled"
        ).length;

        // Get previous period for comparison
        const prevPeriodLength = Math.floor(
          (dateRange.end.getTime() - dateRange.start.getTime()) / MS_PER_DAY
        );
        const prevStart = new Date(dateRange.start);
        prevStart.setDate(prevStart.getDate() - prevPeriodLength);
        const prevEnd = new Date(dateRange.start);
        prevEnd.setDate(prevEnd.getDate() - 1);

        const prevConditions: SQLWrapper[] = [
          gte(quotes.createdAt, prevStart),
          lte(quotes.createdAt, prevEnd),
        ];
        if (session.user.role !== "admin") {
          prevConditions.push(eq(quotes.userId, session.user.id));
        }

        const prevTotal = await db
          .select()
          .from(quotes)
          .where(and(...prevConditions))
          .then((result) => result.length);

        // Calculate metrics using service layer
        const metrics = calculateQuoteMetrics({
          canceled,
          draft,
          previousTotal: prevTotal,
          sent,
          total,
        });

        logger.info("Dashboard metrics calculated", {
          metrics: {
            conversionRate: metrics.conversionRate,
            total: metrics.totalQuotes,
          },
          period,
          role: session.user.role,
          userId: session.user.id,
        });

        return metrics;
      } catch (error) {
        logger.error("Error calculating dashboard metrics", {
          error,
          userId: ctx.session.user.id,
        });
        throw error;
      }
    }),

  /**
   * Get quote trend data for chart visualization
   * Returns daily aggregated quote counts for the selected period
   *
   * Features:
   * - RBAC filtering (admin sees all, seller sees own)
   * - Zero-filling for days without quotes
   * - Pre-formatted dates using @lib/format (tenant timezone/locale)
   * - Winston logging for monitoring
   */
  getQuotesTrend: protectedProcedure
    .input(dashboardPeriodInput)
    .query(async ({ ctx, input }) => {
      try {
        const { period } = input;
        const { session, db } = ctx;

        // Get date range for period
        const dateRange = getPeriodDateRange(period);

        // Build where conditions based on RBAC
        const whereConditions: SQLWrapper[] = [
          gte(quotes.createdAt, dateRange.start),
          lte(quotes.createdAt, dateRange.end),
        ];
        if (session.user.role !== "admin") {
          whereConditions.push(eq(quotes.userId, session.user.id));
        }

        // Fetch quotes with only createdAt (minimal data for performance)
        const trendQuotes = await db
          .select({ createdAt: quotes.createdAt })
          .from(quotes)
          .where(and(...whereConditions));

        // Get tenant config for date formatting (timezone, locale)
        const tenantConfig = await db
          .select({
            locale: tenantConfigs.locale,
            timezone: tenantConfigs.timezone,
          })
          .from(tenantConfigs)
          .limit(1)
          .then((result) => result[0]);

        // Aggregate by date using service layer
        // formatDateShort from @lib/format will use tenant timezone/locale
        const trendData = aggregateQuotesByDate(
          trendQuotes,
          dateRange,
          tenantConfig
        );

        logger.info("Dashboard trend data calculated", {
          dataPoints: trendData.length,
          period,
          role: session.user.role,
          totalQuotes: trendQuotes.length,
          userId: session.user.id,
        });

        return {
          data: trendData,
          period: dateRange.label,
        };
      } catch (error) {
        logger.error("Error calculating quote trend", {
          error,
          userId: ctx.session.user.id,
        });
        throw error;
      }
    }),
});
