/**
 * Dashboard tRPC Router
 * Provides metrics and analytics for dashboard views
 */

import { z } from 'zod';
import logger from '@/lib/logger';
import {
  aggregateQuotesByDate,
  calculateMonetaryMetrics,
  calculateQuoteMetrics,
  getGlassTypeDistribution,
  getPeriodDateRange,
  getSupplierDistribution,
  getTopModels,
  groupQuotesByPriceRange,
} from '@/server/services/dashboard-metrics';
import { createTRPCRouter, protectedProcedure } from '../trpc';

// Time conversion constants
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MS_PER_SECOND = 1000;
const MS_PER_DAY = MS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY;

/**
 * Dashboard period input schema
 */
const dashboardPeriodInput = z.object({
  period: z.enum(['7d', '30d', '90d', 'year']).default('30d'),
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
  getCatalogAnalytics: protectedProcedure.input(dashboardPeriodInput).query(async ({ ctx, input }) => {
    try {
      const { period } = input;
      const { session, db } = ctx;

      // Get date range for period
      const dateRange = getPeriodDateRange(period);

      // RBAC: Admin sees all, seller sees only own via quote.userId
      const quoteWhere =
        session.user.role === 'admin'
          ? { createdAt: { gte: dateRange.start, lte: dateRange.end } }
          : {
              createdAt: { gte: dateRange.start, lte: dateRange.end },
              userId: session.user.id,
            };

      // Fetch quote items with model, profile supplier, and glass type relations
      // Join via Quote to apply RBAC filtering
      const quoteItems = await db.quoteItem.findMany({
        select: {
          glassType: {
            select: {
              code: true,
              manufacturer: true,
              name: true,
            },
          },
          glassTypeId: true,
          model: {
            select: {
              name: true,
              profileSupplier: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          modelId: true,
        },
        where: {
          quote: quoteWhere,
        },
      });

      // Calculate analytics using service layer functions
      const topModels = getTopModels(quoteItems);
      const topGlassTypes = getGlassTypeDistribution(quoteItems);
      const supplierDistribution = getSupplierDistribution(quoteItems);

      logger.info('Catalog analytics calculated', {
        period,
        role: session.user.role,
        supplierCount: supplierDistribution.length,
        topGlassTypesCount: topGlassTypes.length,
        topModelsCount: topModels.length,
        totalItems: quoteItems.length,
        userId: session.user.id,
      });

      return {
        supplierDistribution,
        topGlassTypes,
        topModels,
      };
    } catch (error) {
      logger.error('Error calculating catalog analytics', {
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
  getMonetaryMetrics: protectedProcedure.input(dashboardPeriodInput).query(async ({ ctx, input }) => {
    try {
      const { period } = input;
      const { session, db } = ctx;

      // Get date range for current period
      const dateRange = getPeriodDateRange(period);

      // RBAC: Admin sees all, seller sees only own
      const whereFilter =
        session.user.role === 'admin'
          ? { createdAt: { gte: dateRange.start, lte: dateRange.end } }
          : {
              createdAt: { gte: dateRange.start, lte: dateRange.end },
              userId: session.user.id,
            };

      // Fetch quotes with total field (Decimal type)
      const quotes = await db.quote.findMany({
        select: {
          total: true,
        },
        where: whereFilter,
      });

      // Calculate current period metrics
      const currentMetrics = calculateMonetaryMetrics(quotes);

      // Get previous period for comparison
      const previousEnd = new Date(dateRange.start);
      const previousStart = new Date(previousEnd);
      const periodLength = dateRange.end.getTime() - dateRange.start.getTime();
      previousStart.setTime(previousStart.getTime() - periodLength);

      const previousWhere =
        session.user.role === 'admin'
          ? { createdAt: { gte: previousStart, lte: previousEnd } }
          : {
              createdAt: { gte: previousStart, lte: previousEnd },
              userId: session.user.id,
            };

      const previousQuotes = await db.quote.findMany({
        select: {
          total: true,
        },
        where: previousWhere,
      });

      const previousMetrics = calculateMonetaryMetrics(previousQuotes);

      // Calculate percentage change
      const percentageChange =
        previousMetrics.totalValue === 0
          ? 0
          : (currentMetrics.totalValue - previousMetrics.totalValue) / previousMetrics.totalValue;

      // Get tenant config for currency and locale
      const tenantConfig = await db.tenantConfig.findFirst({
        select: {
          currency: true,
          locale: true,
        },
      });

      logger.info('Monetary metrics calculated', {
        averageValue: currentMetrics.averageValue,
        percentageChange,
        period,
        role: session.user.role,
        totalQuotes: quotes.length,
        totalValue: currentMetrics.totalValue,
        userId: session.user.id,
      });

      return {
        averageValue: currentMetrics.averageValue,
        currency: tenantConfig?.currency ?? 'COP',
        locale: tenantConfig?.locale ?? 'es-CO',
        percentageChange,
        previousPeriodTotal: previousMetrics.totalValue,
        totalValue: currentMetrics.totalValue,
      };
    } catch (error) {
      logger.error('Error calculating monetary metrics', {
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
  getPriceRanges: protectedProcedure.input(dashboardPeriodInput).query(async ({ ctx, input }) => {
    try {
      const { period } = input;
      const { session, db } = ctx;

      // Get date range for period
      const dateRange = getPeriodDateRange(period);

      // RBAC: Admin sees all, seller sees only own
      const whereFilter =
        session.user.role === 'admin'
          ? { createdAt: { gte: dateRange.start, lte: dateRange.end } }
          : {
              createdAt: { gte: dateRange.start, lte: dateRange.end },
              userId: session.user.id,
            };

      // Fetch quotes with total field
      const quotes = await db.quote.findMany({
        select: {
          total: true,
        },
        where: whereFilter,
      });

      // Group quotes by price range
      const rangeDistribution = groupQuotesByPriceRange(quotes);

      // Calculate percentages
      const totalQuotes = quotes.length;
      const rangesWithPercentage = rangeDistribution.map((range) => ({
        ...range,
        percentage: totalQuotes === 0 ? 0 : range.count / totalQuotes,
      }));

      // Get tenant config for currency
      const tenantConfig = await db.tenantConfig.findFirst({
        select: {
          currency: true,
        },
      });

      logger.info('Price range distribution calculated', {
        period,
        ranges: rangesWithPercentage.length,
        role: session.user.role,
        totalQuotes,
        userId: session.user.id,
      });

      return {
        currency: tenantConfig?.currency ?? 'COP',
        ranges: rangesWithPercentage,
      };
    } catch (error) {
      logger.error('Error calculating price ranges', {
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
  getQuotesMetrics: protectedProcedure.input(dashboardPeriodInput).query(async ({ ctx, input }) => {
    try {
      const { period } = input;
      const { session, db } = ctx;

      // Get date range for period
      const dateRange = getPeriodDateRange(period);

      // RBAC: Admin sees all, seller sees only own
      const whereFilter =
        session.user.role === 'admin'
          ? { createdAt: { gte: dateRange.start, lte: dateRange.end } }
          : {
              createdAt: { gte: dateRange.start, lte: dateRange.end },
              userId: session.user.id,
            };

      // Get current period quotes
      const quotes = await db.quote.findMany({
        select: {
          status: true,
        },
        where: whereFilter,
      });

      // Count by status
      const total = quotes.length;
      const draft = quotes.filter((q) => q.status === 'draft').length;
      const sent = quotes.filter((q) => q.status === 'sent').length;
      const canceled = quotes.filter((q) => q.status === 'canceled').length;

      // Get previous period for comparison
      const prevPeriodLength = Math.floor((dateRange.end.getTime() - dateRange.start.getTime()) / MS_PER_DAY);
      const prevStart = new Date(dateRange.start);
      prevStart.setDate(prevStart.getDate() - prevPeriodLength);
      const prevEnd = new Date(dateRange.start);
      prevEnd.setDate(prevEnd.getDate() - 1);

      const prevWhere =
        session.user.role === 'admin'
          ? { createdAt: { gte: prevStart, lte: prevEnd } }
          : {
              createdAt: { gte: prevStart, lte: prevEnd },
              userId: session.user.id,
            };

      const prevTotal = await db.quote.count({ where: prevWhere });

      // Calculate metrics using service layer
      const metrics = calculateQuoteMetrics({
        canceled,
        draft,
        previousTotal: prevTotal,
        sent,
        total,
      });

      logger.info('Dashboard metrics calculated', {
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
      logger.error('Error calculating dashboard metrics', {
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
  getQuotesTrend: protectedProcedure.input(dashboardPeriodInput).query(async ({ ctx, input }) => {
    try {
      const { period } = input;
      const { session, db } = ctx;

      // Get date range for period
      const dateRange = getPeriodDateRange(period);

      // RBAC: Admin sees all, seller sees only own
      const whereFilter =
        session.user.role === 'admin'
          ? { createdAt: { gte: dateRange.start, lte: dateRange.end } }
          : {
              createdAt: { gte: dateRange.start, lte: dateRange.end },
              userId: session.user.id,
            };

      // Fetch quotes with only createdAt (minimal data for performance)
      const quotes = await db.quote.findMany({
        select: {
          createdAt: true,
        },
        where: whereFilter,
      });

      // Get tenant config for date formatting (timezone, locale)
      const tenantConfig = await db.tenantConfig.findFirst({
        select: {
          locale: true,
          timezone: true,
        },
      });

      // Aggregate by date using service layer
      // formatDateShort from @lib/format will use tenant timezone/locale
      const trendData = aggregateQuotesByDate(quotes, dateRange, tenantConfig);

      logger.info('Dashboard trend data calculated', {
        dataPoints: trendData.length,
        period,
        role: session.user.role,
        totalQuotes: quotes.length,
        userId: session.user.id,
      });

      return {
        data: trendData,
        period: dateRange.label,
      };
    } catch (error) {
      logger.error('Error calculating quote trend', {
        error,
        userId: ctx.session.user.id,
      });
      throw error;
    }
  }),
});
