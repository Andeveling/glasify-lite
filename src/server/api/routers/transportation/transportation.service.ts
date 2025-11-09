/**
 * Transportation Service - Business Logic Layer
 *
 * Feature: 001-delivery-address
 *
 * Orchestrates transportation cost calculations and warehouse location management.
 * Handles distance calculations, cost breakdowns, and error handling.
 *
 * @module server/api/routers/transportation/transportation.service
 */

import { TRPCError } from "@trpc/server";
import {
  DISTANCE_PRECISION_DIVISOR,
  DISTANCE_PRECISION_MULTIPLIER,
  EARTH_RADIUS_METERS,
  TRANSPORTATION_MAX_DISTANCE_KM,
} from "@/app/(dashboard)/admin/quotes/_constants/geocoding.constants";
import type {
  TransportationCost,
  WarehouseLocation,
} from "@/app/(dashboard)/admin/quotes/_types/address.types";
import logger from "@/lib/logger";
import { haversineDistance } from "@/lib/utils/coordinates";
import type { db } from "@/server/db/drizzle";
import { getTenantConfig } from "./repositories/transportation-repository";
import {
  type SerializedTenantConfig,
  serializeTenantConfig,
} from "./transportation.utils";

type DbClient = typeof db;

/**
 * Calculate transportation cost from warehouse to delivery location
 *
 * @param client - Drizzle database client
 * @param deliveryLatitude - Delivery location latitude
 * @param deliveryLongitude - Delivery location longitude
 * @param deliveryCity - Optional delivery city name for display
 * @returns TransportationCost with distance and cost breakdown
 *
 * @throws TRPCError if warehouse not configured or coordinates invalid
 */
export async function calculateTransportationCostService(
  client: DbClient,
  deliveryLatitude: number,
  deliveryLongitude: number,
  deliveryCity?: string | null
): Promise<TransportationCost> {
  try {
    logger.info("Calculating transportation cost", {
      deliveryLatitude,
      deliveryLongitude,
      deliveryCity,
    });

    // Get tenant configuration from database
    const tenantConfig = await getTenantConfig(client);

    if (!tenantConfig) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Configuración del sistema no encontrada",
      });
    }

    // Serialize Drizzle types (text/decimal strings) to numeric types
    const serializedConfig = serializeTenantConfig(tenantConfig);

    // Calculate cost
    const cost = doCalculateTransportationCost(
      deliveryLatitude,
      deliveryLongitude,
      serializedConfig,
      deliveryCity
    );

    logger.info("Transportation cost calculated", {
      totalCost: cost.cost.totalCost,
      distance: cost.distance.kilometers,
    });

    return cost;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error("Transportation cost calculation failed", {
      deliveryLatitude,
      deliveryLongitude,
      deliveryCity,
      error: error instanceof Error ? error.message : String(error),
    });

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al calcular costo de transporte",
    });
  }
}

/**
 * Get warehouse location from tenant configuration
 *
 * @param client - Drizzle database client
 * @returns WarehouseLocation or null if not configured
 *
 * @throws TRPCError if system configuration not found
 */
export async function getWarehouseLocationService(
  client: DbClient
): Promise<WarehouseLocation | null> {
  try {
    logger.info("Getting warehouse location");

    // Get tenant configuration
    const tenantConfig = await getTenantConfig(client);

    if (!tenantConfig) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Configuración del sistema no encontrada",
      });
    }

    // Serialize Drizzle types
    const serializedConfig = serializeTenantConfig(tenantConfig);

    // Extract warehouse location
    const warehouse = extractWarehouseLocation(serializedConfig);

    if (!warehouse) {
      logger.warn("Warehouse location not configured");
      return null;
    }

    logger.info("Warehouse location retrieved", {
      city: warehouse.city,
    });

    return warehouse;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error("Failed to get warehouse location", {
      error: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

/**
 * Calculate transportation cost internal implementation
 *
 * @param deliveryLatitude - Delivery location latitude
 * @param deliveryLongitude - Delivery location longitude
 * @param tenantConfig - Serialized tenant configuration
 * @param deliveryCity - Optional delivery city name
 * @returns TransportationCost with breakdown
 *
 * @throws Error if warehouse not configured or distance exceeds maximum
 */
function doCalculateTransportationCost(
  deliveryLatitude: number,
  deliveryLongitude: number,
  tenantConfig: SerializedTenantConfig,
  deliveryCity?: string | null
): TransportationCost {
  // Validate warehouse configuration
  const warehouse = extractWarehouseLocation(tenantConfig);

  if (!warehouse) {
    throw new Error(
      "La ubicación del almacén no está configurada. Por favor, configure las coordenadas del almacén en la configuración del sistema."
    );
  }

  // Calculate distance using Haversine formula
  const distanceMeters = haversineDistance(
    { latitude: warehouse.latitude, longitude: warehouse.longitude },
    { latitude: deliveryLatitude, longitude: deliveryLongitude }
  );

  const distanceKm = distanceMeters / EARTH_RADIUS_METERS;

  // Validate distance is within reasonable range
  if (distanceKm > TRANSPORTATION_MAX_DISTANCE_KM) {
    logger.warn("Transportation distance exceeds maximum", {
      distanceKm,
      maxDistanceKm: TRANSPORTATION_MAX_DISTANCE_KM,
      warehouse: warehouse.city,
      delivery: deliveryCity,
    });

    throw new Error(
      `La distancia de transporte (${Math.round(distanceKm)} km) excede el máximo permitido (${TRANSPORTATION_MAX_DISTANCE_KM} km)`
    );
  }

  // Calculate cost components
  const baseRate = tenantConfig.transportBaseRate;
  const perKmRate = tenantConfig.transportPerKmRate;

  const distanceCost = distanceKm * perKmRate;
  const totalCost = baseRate + distanceCost;

  // Format display text
  const displayText = `${warehouse.city} → ${deliveryCity ?? "Destino"} (${Math.round(distanceKm)} km)`;

  logger.info("Transportation cost calculated", {
    warehouse: warehouse.city,
    delivery: deliveryCity,
    distanceKm:
      Math.round(distanceKm * DISTANCE_PRECISION_MULTIPLIER) /
      DISTANCE_PRECISION_DIVISOR,
    baseRate,
    perKmRate,
    totalCost,
  });

  return {
    warehouse: {
      city: warehouse.city,
      latitude: warehouse.latitude,
      longitude: warehouse.longitude,
    },
    delivery: {
      city: deliveryCity ?? null,
      latitude: deliveryLatitude,
      longitude: deliveryLongitude,
    },
    distance: {
      meters: Math.round(distanceMeters),
      kilometers:
        Math.round(distanceKm * DISTANCE_PRECISION_MULTIPLIER) /
        DISTANCE_PRECISION_DIVISOR,
    },
    cost: {
      baseRate,
      perKmRate,
      distanceCost: Math.round(distanceCost),
      totalCost: Math.round(totalCost),
      displayText,
    },
  };
}

/**
 * Extract warehouse location from tenant configuration
 *
 * @param tenantConfig - Serialized tenant configuration
 * @returns WarehouseLocation if configured, null otherwise
 */
export function extractWarehouseLocation(
  tenantConfig: SerializedTenantConfig
): WarehouseLocation | null {
  // Check if warehouse coordinates are configured
  if (
    tenantConfig.warehouseLatitude === null ||
    tenantConfig.warehouseLongitude === null ||
    tenantConfig.warehouseCity === null
  ) {
    return null;
  }

  return {
    latitude: tenantConfig.warehouseLatitude,
    longitude: tenantConfig.warehouseLongitude,
    city: tenantConfig.warehouseCity,
  };
}
