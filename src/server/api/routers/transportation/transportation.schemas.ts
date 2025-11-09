/**
 * Transportation Schemas - Input Validation & Type Inference
 *
 * Zod schemas for transportation procedures
 * Using drizzle-zod for database schema consistency
 *
 * @module server/api/routers/transportation/transportation.schemas
 */

import { z } from "zod";
import {
  LATITUDE_MAX,
  LATITUDE_MIN,
  LONGITUDE_MAX,
  LONGITUDE_MIN,
} from "./transportation.constants";

/**
 * Calculate transportation cost request
 * Input validation for calculateCost procedure
 */
export const calculateCostInput = z.object({
  deliveryLatitude: z
    .number()
    .min(LATITUDE_MIN, "Latitud debe estar entre -90 y 90")
    .max(LATITUDE_MAX, "Latitud debe estar entre -90 y 90"),
  deliveryLongitude: z
    .number()
    .min(LONGITUDE_MIN, "Longitud debe estar entre -180 y 180")
    .max(LONGITUDE_MAX, "Longitud debe estar entre -180 y 180"),
  deliveryCity: z.string().optional().nullable(),
});

export type CalculateCostInput = z.infer<typeof calculateCostInput>;

/**
 * Transportation cost response
 * Output validation for calculateCost procedure
 */
export const transportationCostOutput = z.object({
  warehouse: z.object({
    city: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  delivery: z.object({
    city: z.string().nullable(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  distance: z.object({
    meters: z.number().int(),
    kilometers: z.number(),
  }),
  cost: z.object({
    baseRate: z.number(),
    perKmRate: z.number(),
    distanceCost: z.number(),
    totalCost: z.number(),
    displayText: z.string(),
  }),
});

export type TransportationCostOutput = z.infer<typeof transportationCostOutput>;

/**
 * Warehouse location response
 * Output validation for getWarehouseLocation procedure
 */
export const warehouseLocationOutput = z.object({
  city: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

export type WarehouseLocationOutput = z.infer<typeof warehouseLocationOutput>;
