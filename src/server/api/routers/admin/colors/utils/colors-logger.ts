/**
 * Colors Logger - Structured Logging
 *
 * Winston-based logging for audit and debugging.
 * SERVER-SIDE ONLY - Never use in Client Components.
 *
 * @module server/api/routers/admin/colors/utils/colors-logger
 */
import logger from "@/lib/logger";

const MODULE_PREFIX = "[Colors]";

// ============================================================================
// LIST OPERATIONS
// ============================================================================

export function logColorListStart(
  userId: string,
  filters: { search?: string; isActive?: boolean; page: number }
) {
  logger.info(`${MODULE_PREFIX} Listing colors`, {
    userId,
    filters,
  });
}

export function logColorListSuccess(
  userId: string,
  count: number,
  total: number,
  page: number
) {
  logger.info(`${MODULE_PREFIX} Colors list retrieved`, {
    userId,
    count,
    total,
    page,
  });
}

export function logColorListError(userId: string, error: unknown) {
  logger.error(`${MODULE_PREFIX} Failed to list colors`, {
    userId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// ============================================================================
// GET BY ID OPERATIONS
// ============================================================================

export function logColorFetchStart(userId: string, colorId: string) {
  logger.info(`${MODULE_PREFIX} Fetching color`, {
    userId,
    colorId,
  });
}

export function logColorFetchSuccess(userId: string, colorId: string) {
  logger.info(`${MODULE_PREFIX} Color retrieved`, {
    userId,
    colorId,
  });
}

export function logColorFetchError(
  userId: string,
  colorId: string,
  error: unknown
) {
  logger.error(`${MODULE_PREFIX} Failed to get color`, {
    userId,
    colorId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

export function logColorCreateStart(
  userId: string,
  data: { name: string; hexCode: string }
) {
  logger.info(`${MODULE_PREFIX} Creating color`, {
    userId,
    colorName: data.name,
    hexCode: data.hexCode,
  });
}

export function logColorCreated(
  userId: string,
  colorId: string,
  colorName: string,
  hexCode: string
) {
  logger.info(`${MODULE_PREFIX} Color created`, {
    userId,
    colorId,
    colorName,
    hexCode,
  });
}

export function logColorCreateError(
  userId: string,
  data: { name: string; hexCode: string },
  error: unknown
) {
  logger.error(`${MODULE_PREFIX} Failed to create color`, {
    userId,
    colorName: data.name,
    hexCode: data.hexCode,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

export function logColorUpdateStart(
  userId: string,
  colorId: string,
  changes: Record<string, unknown>
) {
  logger.info(`${MODULE_PREFIX} Updating color`, {
    userId,
    colorId,
    changes,
  });
}

export function logColorUpdated(
  userId: string,
  colorId: string,
  changes: Record<string, unknown>
) {
  logger.info(`${MODULE_PREFIX} Color updated`, {
    userId,
    colorId,
    changes,
  });
}

export function logColorUpdateError(
  userId: string,
  colorId: string,
  error: unknown
) {
  logger.error(`${MODULE_PREFIX} Failed to update color`, {
    userId,
    colorId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

export function logColorDeleteStart(userId: string, colorId: string) {
  logger.info(`${MODULE_PREFIX} Attempting to delete color`, {
    userId,
    colorId,
  });
}

export function logColorSoftDeleted(
  userId: string,
  colorId: string,
  modelCount: number
) {
  logger.info(`${MODULE_PREFIX} Color soft deleted (used in models)`, {
    userId,
    colorId,
    modelCount,
  });
}

export function logColorHardDeleted(userId: string, colorId: string) {
  logger.info(`${MODULE_PREFIX} Color hard deleted (no references)`, {
    userId,
    colorId,
  });
}

export function logColorDeleteError(
  userId: string,
  colorId: string,
  error: unknown
) {
  logger.error(`${MODULE_PREFIX} Failed to delete color`, {
    userId,
    colorId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}

// ============================================================================
// USAGE CHECK OPERATIONS
// ============================================================================

export function logUsageCheckStart(userId: string, colorId: string) {
  logger.info(`${MODULE_PREFIX} Checking color usage`, {
    userId,
    colorId,
  });
}

export function logUsageCheckSuccess(
  userId: string,
  colorId: string,
  modelCount: number,
  quoteCount: number
) {
  logger.info(`${MODULE_PREFIX} Color usage checked`, {
    userId,
    colorId,
    modelCount,
    quoteCount,
  });
}

export function logUsageCheckError(
  userId: string,
  colorId: string,
  error: unknown
) {
  logger.error(`${MODULE_PREFIX} Failed to check color usage`, {
    userId,
    colorId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
}
