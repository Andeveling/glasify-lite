/**
 * Transportation Queries - tRPC Query Procedures
 *
 * Feature: 001-delivery-address
 *
 * Exposes transportation calculations as read-only tRPC procedures.
 *
 * @module server/api/routers/transportation/transportation.queries
 */

import { protectedProcedure } from "@/server/api/trpc";
import { db } from "@/server/db/drizzle";
import {
  calculateCostInput,
  transportationCostOutput,
  warehouseLocationOutput,
} from "./transportation.schemas";
import {
  calculateTransportationCostService,
  getWarehouseLocationService,
} from "./transportation.service";

/**
 * Calculate transportation cost to delivery location
 *
 * Requires user authentication.
 *
 * @procedure transportation.calculate-cost
 * @input latitude, longitude, city (optional)
 * @output TransportationCost with distance and cost breakdown
 */
export const calculateCostQuery = protectedProcedure
  .input(calculateCostInput)
  .output(transportationCostOutput)
  .query(async ({ input }) =>
    calculateTransportationCostService(
      db,
      input.deliveryLatitude,
      input.deliveryLongitude,
      input.deliveryCity
    )
  );

/**
 * Get warehouse location
 *
 * Requires user authentication.
 *
 * @procedure transportation.warehouse-location
 * @output WarehouseLocation or null if not configured
 */
export const getWarehouseLocationQuery = protectedProcedure
  .output(warehouseLocationOutput.nullable())
  .query(async () => getWarehouseLocationService(db));
