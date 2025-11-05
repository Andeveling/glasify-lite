/**
 * @deprecated Glass Type Price History Service - DEPRECATED
 *
 * TODO (TK-015): This service is deprecated after static glass taxonomy migration.
 * - GlassTypePriceHistory model has been removed from schema
 * - Price management now uses TenantGlassTypePrice model
 * - This file should be removed or completely rewritten for TenantGlassTypePrice
 *
 * Migration Notes:
 * - pricePerSqm moved from GlassType to TenantGlassTypePrice (per-tenant pricing)
 * - Price history tracking may need to use ModelPriceHistory pattern
 * - Consider if price history is still needed for glass types (vs just models)
 */

import logger from "@/lib/logger";

/**
 * @deprecated - Use TenantGlassTypePrice instead
 */
export type GlassTypePriceChange = {
  glassTypeId: string;
  pricePerSqm: number;
  reason?: string;
  createdBy: string;
};

/**
 * @deprecated - Use TenantGlassTypePrice instead
 */
export type GlassTypePriceHistoryRecord = {
  id: string;
  glassTypeId: string;
  pricePerSqm: number;
  reason: string | null;
  effectiveFrom: Date;
  createdBy: string | null;
  createdAt: Date;
};

/**
 * @deprecated - Model removed from schema
 */
export function createGlassTypePriceHistory(
  change: GlassTypePriceChange
): Promise<GlassTypePriceHistoryRecord> {
  logger.warn(
    "createGlassTypePriceHistory called but GlassTypePriceHistory model no longer exists",
    {
      glassTypeId: change.glassTypeId,
    }
  );

  // Return mock data to prevent crashes in legacy code
  return Promise.resolve({
    createdAt: new Date(),
    createdBy: change.createdBy,
    effectiveFrom: new Date(),
    glassTypeId: change.glassTypeId,
    id: "deprecated",
    pricePerSqm: change.pricePerSqm,
    reason: change.reason ?? null,
  });
}

/**
 * @deprecated - Model removed from schema
 */
export function getGlassTypePriceHistory(
  glassTypeId: string,
  limit = 10
): Promise<GlassTypePriceHistoryRecord[]> {
  logger.warn(
    "getGlassTypePriceHistory called but GlassTypePriceHistory model no longer exists",
    {
      glassTypeId,
      limit,
    }
  );
  return Promise.resolve([]);
}

/**
 * @deprecated - No longer needed with new price model
 */
export function hasPriceChanged(
  currentPrice: number,
  updatedPrice: number
): boolean {
  return currentPrice !== updatedPrice;
}

/**
 * @deprecated - Model removed from schema
 */
export function getLatestGlassTypePrice(
  glassTypeId: string
): Promise<GlassTypePriceHistoryRecord | null> {
  logger.warn(
    "getLatestGlassTypePrice called but GlassTypePriceHistory model no longer exists",
    {
      glassTypeId,
    }
  );
  return Promise.resolve(null);
}
