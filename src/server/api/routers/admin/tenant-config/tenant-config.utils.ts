/**
 * TenantConfig Utilities - Serialization Helpers
 *
 * Converts Drizzle ORM types (text/decimal strings) to API types (number/boolean)
 *
 * @module server/api/routers/admin/tenant-config/tenant-config.utils
 */

import type { UpdateTenantConfigInput } from "./tenant-config.schemas";

/**
 * Serialize tenant config - Convert Drizzle text/decimal strings to proper types
 */
export function serializeTenantConfig<
  T extends {
    quoteValidityDays: string;
    whatsappEnabled: string;
    warehouseLatitude: string | null;
    warehouseLongitude: string | null;
    transportBaseRate: string | null;
    transportPerKmRate: string | null;
  },
>(config: T) {
  return {
    ...config,
    quoteValidityDays: Number(config.quoteValidityDays),
    whatsappEnabled: config.whatsappEnabled === "true",
    warehouseLatitude: config.warehouseLatitude
      ? Number(config.warehouseLatitude)
      : undefined,
    warehouseLongitude: config.warehouseLongitude
      ? Number(config.warehouseLongitude)
      : undefined,
    transportBaseRate: config.transportBaseRate
      ? Number(config.transportBaseRate)
      : undefined,
    transportPerKmRate: config.transportPerKmRate
      ? Number(config.transportPerKmRate)
      : undefined,
  };
}

/**
 * Prepare tenant config update data - Convert API types to Drizzle types
 * Converts numbers to strings for decimals/text fields
 */
export function prepareTenantConfigUpdate(input: UpdateTenantConfigInput) {
  const stringFields = [
    "businessName",
    "currency",
    "locale",
    "timezone",
    "contactEmail",
    "contactPhone",
    "businessAddress",
    "logoUrl",
    "primaryColor",
    "secondaryColor",
    "facebookUrl",
    "instagramUrl",
    "linkedinUrl",
    "whatsappNumber",
    "warehouseCity",
  ] as const;

  const numberFields = [
    "quoteValidityDays",
    "warehouseLatitude",
    "warehouseLongitude",
    "transportBaseRate",
    "transportPerKmRate",
  ] as const;

  const result: Record<string, string | null> = {};

  // Copy string fields directly
  for (const field of stringFields) {
    if (input[field] !== undefined) {
      result[field] = input[field] as string;
    }
  }

  // Convert number fields to strings
  for (const field of numberFields) {
    if (input[field] !== undefined) {
      result[field] = String(input[field]);
    }
  }

  // Convert boolean to string
  if (input.whatsappEnabled !== undefined) {
    result.whatsappEnabled = input.whatsappEnabled ? "true" : "false";
  }

  return result;
}
