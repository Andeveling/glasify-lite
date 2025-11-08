/**
 * Transportation tRPC Router
 *
 * Feature: 001-delivery-address
 * Created: 2025-11-01
 *
 * Purpose:
 * Transportation cost calculations and warehouse location
 *
 * Endpoints:
 * - calculateCost: Calculate transportation cost from warehouse to delivery
 * - getWarehouseLocation: Get configured warehouse location
 */

import { TRPCError } from "@trpc/server";
import { transportationCostSchema } from "@/app/(dashboard)/admin/quotes/_schemas/project-address.schema";
import logger from "@/lib/logger";
import { tenantConfigs } from "@/server/db/schema";
import {
  calculateTransportationCost,
  extractWarehouseLocation,
} from "@/server/services/transportation.service";
import { adminProcedure, createTRPCRouter } from "../trpc";

/**
 * Transportation Router
 *
 * Authorization: All procedures require adminProcedure (admin/seller only)
 */
export const transportationRouter = createTRPCRouter({
  /**
   * Calculate transportation cost
   *
   * Input: { deliveryLatitude: number, deliveryLongitude: number, deliveryCity?: string }
   * Output: TransportationCost with distance and cost breakdown
   *
   * Authorization: adminProcedure
   * Task: T032 [US2] (User Story 2 - Visualize Transportation Cost)
   */
  calculateCost: adminProcedure
    .input(transportationCostSchema)
    .query(async ({ ctx, input }) => {
      try {
        logger.info("Calculating transportation cost", {
          userId: ctx.session.user.id,
          deliveryLatitude: input.deliveryLatitude,
          deliveryLongitude: input.deliveryLongitude,
        });

        // Get tenant configuration with warehouse location
        const tenantConfigList = await ctx.db
          .select()
          .from(tenantConfigs)
          .limit(1);

        const tenantConfig = tenantConfigList[0];

        if (!tenantConfig) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Configuración del sistema no encontrada",
          });
        }

        // Calculate cost using transportation service
        // TODO: Fix type mismatch between Drizzle schema and service expectations
        // Drizzle returns string types for dates/decimals, service expects Date/number
        // FIXME: tenant-config schema using text() instead of timestamp() for dates
        const cost = calculateTransportationCost(
          input.deliveryLatitude,
          input.deliveryLongitude,
          tenantConfig as unknown as Parameters<
            typeof calculateTransportationCost
          >[2],
          input.deliveryCity
        );

        logger.info("Transportation cost calculated", {
          userId: ctx.session.user.id,
          totalCost: cost.cost.totalCost,
          distance: cost.distance.kilometers,
        });

        return cost;
      } catch (error) {
        logger.error("Transportation cost calculation failed", {
          error: error instanceof Error ? error.message : String(error),
          userId: ctx.session.user.id,
        });

        // Transform service errors to user-friendly messages
        if (error instanceof Error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error.message,
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al calcular costo de transporte",
        });
      }
    }),

  /**
   * Get warehouse location
   *
   * Input: None
   * Output: WarehouseLocation or null if not configured
   *
   * Authorization: adminProcedure
   * Task: T032 [US2]
   */
  getWarehouseLocation: adminProcedure.query(async ({ ctx }) => {
    try {
      logger.info("Getting warehouse location", {
        userId: ctx.session.user.id,
      });

      // Get tenant configuration
      const tenantConfigList = await ctx.db
        .select()
        .from(tenantConfigs)
        .limit(1);

      const tenantConfig = tenantConfigList[0];

      if (!tenantConfig) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Configuración del sistema no encontrada",
        });
      }

      // Extract warehouse location
      // TODO: Fix type mismatch between Drizzle schema and service expectations
      // Drizzle returns string types for dates/decimals, service expects Date/number
      // FIXME: tenant-config schema using text() instead of timestamp() for dates
      const warehouse = extractWarehouseLocation(
        tenantConfig as unknown as Parameters<
          typeof extractWarehouseLocation
        >[0]
      );

      if (!warehouse) {
        logger.warn("Warehouse location not configured", {
          userId: ctx.session.user.id,
        });
        return null;
      }

      logger.info("Warehouse location retrieved", {
        userId: ctx.session.user.id,
        city: warehouse.city,
      });

      return warehouse;
    } catch (error) {
      logger.error("Failed to get warehouse location", {
        error: error instanceof Error ? error.message : String(error),
        userId: ctx.session.user.id,
      });

      throw error;
    }
  }),
});
