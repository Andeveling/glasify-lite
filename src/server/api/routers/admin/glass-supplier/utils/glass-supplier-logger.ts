/**
 * Glass Supplier Logger - Structured Logging
 *
 * Winston-based logging for audit and debugging.
 * SERVER-SIDE ONLY - Never use in Client Components.
 *
 * @module server/api/routers/admin/glass-supplier/utils/glass-supplier-logger
 */
import logger from "@/lib/logger";

const MODULE_PREFIX = "[GlassSupplier]";

// ============================================================================
// LIST OPERATIONS
// ============================================================================

export function logGlassSupplierListStart(
  userId: string,
  filters: {
    search?: string;
    country?: string;
    isActive?: string;
    page: number;
  }
) {
  logger.info(`${MODULE_PREFIX} Listing glass suppliers`, {
    userId,
    filters,
  });
}

export function logGlassSupplierListSuccess(
  userId: string,
  count: number,
  total: number,
  page: number
) {
  logger.info(`${MODULE_PREFIX} Glass suppliers list retrieved`, {
    userId,
    count,
    total,
    page,
  });
}

export function logGlassSupplierListError(userId: string, error: unknown) {
  logger.error(`${MODULE_PREFIX} Failed to list glass suppliers`, {
    userId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// ============================================================================
// GET BY ID OPERATIONS
// ============================================================================

export function logGlassSupplierFetchStart(
  userId: string,
  glassSupplierId: string
) {
  logger.info(`${MODULE_PREFIX} Fetching glass supplier`, {
    userId,
    glassSupplierId,
  });
}

export function logGlassSupplierFetchSuccess(
  userId: string,
  glassSupplierId: string
) {
  logger.info(`${MODULE_PREFIX} Glass supplier retrieved`, {
    userId,
    glassSupplierId,
  });
}

export function logGlassSupplierFetchError(
  userId: string,
  glassSupplierId: string,
  error: unknown
) {
  logger.error(`${MODULE_PREFIX} Failed to get glass supplier`, {
    userId,
    glassSupplierId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

export function logGlassSupplierCreateStart(
  userId: string,
  data: { name: string; code?: string | null; country?: string | null }
) {
  logger.info(`${MODULE_PREFIX} Creating glass supplier`, {
    userId,
    glassSupplierName: data.name,
    code: data.code,
    country: data.country,
  });
}

export function logGlassSupplierCreated(
  userId: string,
  glassSupplierId: string,
  data: {
    name: string;
    code?: string | null;
    country?: string | null;
  }
) {
  logger.info(`${MODULE_PREFIX} Glass supplier created successfully`, {
    userId,
    glassSupplierId,
    glassSupplierName: data.name,
    code: data.code,
    country: data.country,
  });
}

export function logGlassSupplierCreateError(
  userId: string,
  data: { name: string; code?: string | null },
  error: unknown
) {
  logger.error(`${MODULE_PREFIX} Failed to create glass supplier`, {
    userId,
    glassSupplierName: data.name,
    code: data.code,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

export function logGlassSupplierUpdateStart(
  userId: string,
  glassSupplierId: string,
  updates: Partial<{
    name: string;
    code: string | null;
    country: string | null;
  }>
) {
  logger.info(`${MODULE_PREFIX} Updating glass supplier`, {
    userId,
    glassSupplierId,
    updates,
  });
}

export function logGlassSupplierUpdated(
  userId: string,
  glassSupplierId: string,
  updates: Partial<{
    name: string;
    code: string | null;
    country: string | null;
  }>
) {
  logger.info(`${MODULE_PREFIX} Glass supplier updated successfully`, {
    userId,
    glassSupplierId,
    updates,
  });
}

export function logGlassSupplierUpdateError(
  userId: string,
  glassSupplierId: string,
  error: unknown
) {
  logger.error(`${MODULE_PREFIX} Failed to update glass supplier`, {
    userId,
    glassSupplierId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

export function logGlassSupplierDeleteStart(
  userId: string,
  glassSupplierId: string
) {
  logger.info(`${MODULE_PREFIX} Deleting glass supplier`, {
    userId,
    glassSupplierId,
  });
}

export function logGlassSupplierDeleted(
  userId: string,
  glassSupplierId: string
) {
  logger.info(`${MODULE_PREFIX} Glass supplier deleted successfully`, {
    userId,
    glassSupplierId,
  });
}

export function logGlassSupplierDeleteError(
  userId: string,
  glassSupplierId: string,
  error: unknown
) {
  logger.error(`${MODULE_PREFIX} Failed to delete glass supplier`, {
    userId,
    glassSupplierId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// ============================================================================
// USAGE CHECK OPERATIONS
// ============================================================================

export function logGlassSupplierUsageCheckStart(
  userId: string,
  glassSupplierId: string
) {
  logger.info(`${MODULE_PREFIX} Checking glass supplier usage`, {
    userId,
    glassSupplierId,
  });
}

export function logGlassSupplierUsageCheckSuccess(
  userId: string,
  glassSupplierId: string,
  glassTypeCount: number
) {
  logger.info(`${MODULE_PREFIX} Glass supplier usage checked`, {
    userId,
    glassSupplierId,
    glassTypeCount,
  });
}

export function logGlassSupplierUsageCheckError(
  userId: string,
  glassSupplierId: string,
  error: unknown
) {
  logger.error(`${MODULE_PREFIX} Failed to check glass supplier usage`, {
    userId,
    glassSupplierId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}
