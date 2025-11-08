/**
 * Profile Supplier Logger - Structured Logging
 *
 * Winston-based logging for audit and debugging.
 * SERVER-SIDE ONLY - Never use in Client Components.
 *
 * @module server/api/routers/admin/profile-supplier/utils/profile-supplier-logger
 */
import logger from "@/lib/logger";
import type { MaterialType } from "@/server/db/schemas/enums.schema";

const MODULE_PREFIX = "[ProfileSupplier]";

// ============================================================================
// LIST OPERATIONS
// ============================================================================

export function logProfileSupplierListStart(
  userId: string,
  filters: {
    search?: string;
    materialType?: MaterialType;
    isActive?: string;
    page: number;
  }
) {
  logger.info(`${MODULE_PREFIX} Listing profile suppliers`, {
    userId,
    filters,
  });
}

export function logProfileSupplierListSuccess(
  userId: string,
  count: number,
  total: number,
  page: number
) {
  logger.info(`${MODULE_PREFIX} Profile suppliers list retrieved`, {
    userId,
    count,
    total,
    page,
  });
}

export function logProfileSupplierListError(userId: string, error: unknown) {
  logger.error(`${MODULE_PREFIX} Failed to list profile suppliers`, {
    userId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// ============================================================================
// GET BY ID OPERATIONS
// ============================================================================

export function logProfileSupplierFetchStart(
  userId: string,
  profileSupplierId: string
) {
  logger.info(`${MODULE_PREFIX} Fetching profile supplier`, {
    userId,
    profileSupplierId,
  });
}

export function logProfileSupplierFetchSuccess(
  userId: string,
  profileSupplierId: string
) {
  logger.info(`${MODULE_PREFIX} Profile supplier retrieved`, {
    userId,
    profileSupplierId,
  });
}

export function logProfileSupplierFetchError(
  userId: string,
  profileSupplierId: string,
  error: unknown
) {
  logger.error(`${MODULE_PREFIX} Failed to get profile supplier`, {
    userId,
    profileSupplierId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

export function logProfileSupplierCreateStart(
  userId: string,
  data: { name: string; materialType: MaterialType }
) {
  logger.info(`${MODULE_PREFIX} Creating profile supplier`, {
    userId,
    profileSupplierName: data.name,
    materialType: data.materialType,
  });
}

export function logProfileSupplierCreated(
  userId: string,
  profileSupplierId: string,
  profileSupplierName: string,
  materialType: MaterialType
) {
  logger.info(`${MODULE_PREFIX} Profile supplier created successfully`, {
    userId,
    profileSupplierId,
    profileSupplierName,
    materialType,
  });
}

export function logProfileSupplierCreateError(
  userId: string,
  data: { name: string; materialType: MaterialType },
  error: unknown
) {
  logger.error(`${MODULE_PREFIX} Failed to create profile supplier`, {
    userId,
    profileSupplierName: data.name,
    materialType: data.materialType,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

export function logProfileSupplierUpdateStart(
  userId: string,
  profileSupplierId: string,
  updates: Partial<{ name: string; materialType: MaterialType }>
) {
  logger.info(`${MODULE_PREFIX} Updating profile supplier`, {
    userId,
    profileSupplierId,
    updates,
  });
}

export function logProfileSupplierUpdated(
  userId: string,
  profileSupplierId: string,
  updates: Partial<{ name: string; materialType: MaterialType }>
) {
  logger.info(`${MODULE_PREFIX} Profile supplier updated successfully`, {
    userId,
    profileSupplierId,
    updates,
  });
}

export function logProfileSupplierUpdateError(
  userId: string,
  profileSupplierId: string,
  error: unknown
) {
  logger.error(`${MODULE_PREFIX} Failed to update profile supplier`, {
    userId,
    profileSupplierId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

export function logProfileSupplierDeleteStart(
  userId: string,
  profileSupplierId: string
) {
  logger.info(`${MODULE_PREFIX} Deleting profile supplier`, {
    userId,
    profileSupplierId,
  });
}

export function logProfileSupplierDeleted(
  userId: string,
  profileSupplierId: string
) {
  logger.info(`${MODULE_PREFIX} Profile supplier deleted successfully`, {
    userId,
    profileSupplierId,
  });
}

export function logProfileSupplierDeleteError(
  userId: string,
  profileSupplierId: string,
  error: unknown
) {
  logger.error(`${MODULE_PREFIX} Failed to delete profile supplier`, {
    userId,
    profileSupplierId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// ============================================================================
// USAGE CHECK OPERATIONS
// ============================================================================

export function logProfileSupplierUsageCheckStart(
  userId: string,
  profileSupplierId: string
) {
  logger.info(`${MODULE_PREFIX} Checking profile supplier usage`, {
    userId,
    profileSupplierId,
  });
}

export function logProfileSupplierUsageCheckSuccess(
  userId: string,
  profileSupplierId: string,
  modelCount: number
) {
  logger.info(`${MODULE_PREFIX} Profile supplier usage checked`, {
    userId,
    profileSupplierId,
    modelCount,
  });
}

export function logProfileSupplierUsageCheckError(
  userId: string,
  profileSupplierId: string,
  error: unknown
) {
  logger.error(`${MODULE_PREFIX} Failed to check profile supplier usage`, {
    userId,
    profileSupplierId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}
