/**
 * Transportation Utilities - Helper Functions
 *
 * Serialization and transformation functions
 *
 * @module server/api/routers/transportation/transportation.utils
 */

import type { TenantConfig } from "@/server/db/schemas/tenant-config.schema";

export type SerializedTenantConfig = {
  transportBaseRate: number;
  transportPerKmRate: number;
  warehouseLatitude: number | null;
  warehouseLongitude: number | null;
  warehouseCity: string | null;
};

/**
 * Serialize TenantConfig from Drizzle types (text/decimal strings) to service types (numbers)
 *
 * @param config - TenantConfig from Drizzle database
 * @returns SerializedTenantConfig with numeric types
 */
export function serializeTenantConfig(
  config: TenantConfig
): SerializedTenantConfig {
  return {
    transportBaseRate: config.transportBaseRate
      ? Number(config.transportBaseRate)
      : 0,
    transportPerKmRate: config.transportPerKmRate
      ? Number(config.transportPerKmRate)
      : 0,
    warehouseLatitude: config.warehouseLatitude
      ? Number(config.warehouseLatitude)
      : null,
    warehouseLongitude: config.warehouseLongitude
      ? Number(config.warehouseLongitude)
      : null,
    warehouseCity: config.warehouseCity,
  };
}
