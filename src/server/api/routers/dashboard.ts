/**
 * Dashboard tRPC Router
 * Provides metrics and analytics for dashboard views
 */
import { and, eq, gte, lte, type SQLWrapper } from "drizzle-orm";
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
import {
  CatalogAnalyticsOutput,
  getDashboardPeriodInput,
  MonetaryMetricsOutput,
  PriceRangesOutput,
  QuotesMetricsOutput,
  QuotesTrendOutput,
} from "./dashboard/dashboard.schemas";

// Time conversion constants
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MS_PER_SECOND = 1000;
const MS_PER_DAY =
  MS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY;

/**
 * Dashboard Router
 * All procedures require authentication (protectedProcedure).
 */
export const dashboardRouter = createTRPCRouter({
  /**
   * Get catalog analytics (top models, glass types, supplier distribution).
   * Returns aggregated analytics based on quote items in the selected period.
   */
  getCatalogAnalytics: protectedProcedure
    .input(getDashboardPeriodInput)
    .output(CatalogAnalyticsOutput)
    .query(async ({ ctx, input }) => {
      try {
        const { period } = input;
        const { session, db } = ctx;
        const dateRange = getPeriodDateRange(period);

        const whereConditions: SQLWrapper[] = [
          gte(quotes.createdAt, dateRange.start),
          lte(quotes.createdAt, dateRange.end),
        ];
        if (session.user.role !== "admin") {
          whereConditions.push(eq(quotes.userId, session.user.id));
        }

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

        const topModels = getTopModels(mappedQuoteItems);
        const topGlassTypes = getGlassTypeDistribution(mappedQuoteItems);
        const supplierDistribution = getSupplierDistribution(mappedQuoteItems);

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
   * Get monetary metrics (total value, average value).
   * Returns aggregated monetary metrics from Quote.total.
   */
  getMonetaryMetrics: protectedProcedure
    .input(getDashboardPeriodInput)
    .output(MonetaryMetricsOutput)
    .query(async ({ ctx, input }) => {
      try {
        const { period } = input;
        const { session, db } = ctx;
        const dateRange = getPeriodDateRange(period);

        const whereConditions: SQLWrapper[] = [
          gte(quotes.createdAt, dateRange.start),
          lte(quotes.createdAt, dateRange.end),
        ];
        if (session.user.role !== "admin") {
          whereConditions.push(eq(quotes.userId, session.user.id));
        }

        const currentQuotes = await db
          .select({ total: quotes.total })
          .from(quotes)
          .where(and(...whereConditions));

        // Convert Drizzle decimal strings to service format inline
        const currentMetrics = calculateMonetaryMetrics(
          currentQuotes.map((quote) => ({
            total: {
              toNumber: () => Number.parseFloat(quote.total),
            },
          }))
        );

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

        // Convert Drizzle decimal strings to service format inline
        const previousMetrics = calculateMonetaryMetrics(
          previousQuotes.map((quote) => ({
            total: {
              toNumber: () => Number.parseFloat(quote.total),
            },
          }))
        );

        const percentageChange =
          previousMetrics.totalValue === 0
            ? 0
            : (currentMetrics.totalValue - previousMetrics.totalValue) /
              previousMetrics.totalValue;

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
   * Get price range distribution.
   * Groups quotes into configurable price ranges.
   */
  getPriceRanges: protectedProcedure
    .input(getDashboardPeriodInput)
    .output(PriceRangesOutput)
    .query(async ({ ctx, input }) => {
      try {
        const { period } = input;
        const { session, db } = ctx;
        const dateRange = getPeriodDateRange(period);

        const whereConditions: SQLWrapper[] = [
          gte(quotes.createdAt, dateRange.start),
          lte(quotes.createdAt, dateRange.end),
        ];
        if (session.user.role !== "admin") {
          whereConditions.push(eq(quotes.userId, session.user.id));
        }

        const priceRangeQuotes = await db
          .select({ total: quotes.total })
          .from(quotes)
          .where(and(...whereConditions));

        // Convert Drizzle decimal strings to service format inline
        const rangeDistribution = groupQuotesByPriceRange(
          priceRangeQuotes.map((quote) => ({
            total: {
              toNumber: () => Number.parseFloat(quote.total),
            },
          }))
        );

        const totalQuotes = priceRangeQuotes.length;

        const tenantConfig = await db
          .select({ currency: tenantConfigs.currency })
          .from(tenantConfigs)
          .limit(1)
          .then((result) => result[0]);

        logger.info("Price range distribution calculated", {
          period,
          ranges: rangeDistribution.length,
          role: session.user.role,
          totalQuotes,
          userId: session.user.id,
        });

        return {
          currency: tenantConfig?.currency ?? "COP",
          ranges: rangeDistribution.map((range) => ({
            range: range.label, // Transform 'label' to 'range' for schema
            count: range.count,
            percentage: totalQuotes === 0 ? 0 : range.count / totalQuotes,
          })),
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
   * Get quote metrics for the dashboard.
   * Returns aggregated quote statistics based on the selected period.
   */
  getQuotesMetrics: protectedProcedure
    .input(getDashboardPeriodInput)
    .output(QuotesMetricsOutput)
    .query(async ({ ctx, input }) => {
      try {
        const { period } = input;
        const { session, db } = ctx;
        const dateRange = getPeriodDateRange(period);

        const whereConditions: SQLWrapper[] = [
          gte(quotes.createdAt, dateRange.start),
          lte(quotes.createdAt, dateRange.end),
        ];
        if (session.user.role !== "admin") {
          whereConditions.push(eq(quotes.userId, session.user.id));
        }

        const metricsQuotes = await db
          .select({ status: quotes.status })
          .from(quotes)
          .where(and(...whereConditions));

        const total = metricsQuotes.length;
        const draft = metricsQuotes.filter((q) => q.status === "draft").length;
        const sent = metricsQuotes.filter((q) => q.status === "sent").length;
        const canceled = metricsQuotes.filter(
          (q) => q.status === "canceled"
        ).length;

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
   * Get quote trend data for chart visualization.
   * Returns daily aggregated quote counts for the selected period.
   */
  getQuotesTrend: protectedProcedure
    .input(getDashboardPeriodInput)
    .output(QuotesTrendOutput)
    .query(async ({ ctx, input }) => {
      try {
        const { period } = input;
        const { session, db } = ctx;
        const dateRange = getPeriodDateRange(period);

        const whereConditions: SQLWrapper[] = [
          gte(quotes.createdAt, dateRange.start),
          lte(quotes.createdAt, dateRange.end),
        ];
        if (session.user.role !== "admin") {
          whereConditions.push(eq(quotes.userId, session.user.id));
        }

        const trendQuotes = await db
          .select({ createdAt: quotes.createdAt })
          .from(quotes)
          .where(and(...whereConditions));

        const tenantConfig = await db
          .select({
            locale: tenantConfigs.locale,
            timezone: tenantConfigs.timezone,
          })
          .from(tenantConfigs)
          .limit(1)
          .then((result) => result[0]);

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
