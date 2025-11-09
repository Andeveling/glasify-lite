/**
 * Transportation Router - Composed Procedures
 *
 * Feature: 001-delivery-address
 *
 * Composes transportation queries into a single router namespace.
 * Exports as "transportation.*" procedures in tRPC API.
 *
 * @module server/api/routers/transportation/index
 */

import { createTRPCRouter } from "@/server/api/trpc";
import {
  calculateCostQuery,
  getWarehouseLocationQuery,
} from "./transportation.queries";

export const transportationRouter = createTRPCRouter({
  "calculate-cost": calculateCostQuery,
  "warehouse-location": getWarehouseLocationQuery,
});
