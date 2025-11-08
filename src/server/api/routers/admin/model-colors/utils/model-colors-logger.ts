/**
 * Model Colors Logger
 *
 * Winston logging utilities for model-color assignment operations
 * Server-side ONLY - Never import in Client Components
 *
 * Log Levels:
 * - info: Successful operations, list retrievals
 * - warn: Business rule violations, duplicate assignments
 * - error: Unexpected failures, database errors
 *
 * All logs include userId for audit trail
 */

import logger from "@/lib/logger";

/**
 * Log successful model colors list retrieval
 */
export function logModelColorsListSuccess(
  userId: string,
  modelId: string,
  count: number
): void {
  logger.info("Model colors list retrieved", {
    userId,
    modelId,
    count,
  });
}

/**
 * Log model colors list retrieval error
 */
export function logModelColorsListError(
  error: unknown,
  userId: string,
  modelId: string
): void {
  logger.error("Failed to list model colors", {
    error,
    userId,
    modelId,
  });
}

/**
 * Log successful available colors retrieval
 */
export function logAvailableColorsSuccess(
  userId: string,
  modelId: string,
  count: number
): void {
  logger.info("Available colors retrieved", {
    userId,
    modelId,
    count,
  });
}

/**
 * Log available colors retrieval error
 */
export function logAvailableColorsError(
  error: unknown,
  userId: string,
  modelId: string
): void {
  logger.error("Failed to get available colors", {
    error,
    userId,
    modelId,
  });
}

/**
 * Log successful color assignment to model
 */
export function logColorAssignedSuccess(
  userId: string,
  data: {
    modelId: string;
    colorId: string;
    colorName: string;
    surchargePercentage: number;
    isDefault: boolean;
  }
): void {
  logger.info("Color assigned to model", {
    userId,
    ...data,
  });
}

/**
 * Log color assignment error
 */
export function logColorAssignError(
  error: unknown,
  userId: string,
  input: {
    modelId: string;
    colorId: string;
    surchargePercentage: number;
    isDefault?: boolean;
  }
): void {
  logger.error("Failed to assign color to model", {
    error,
    userId,
    input,
  });
}

/**
 * Log successful surcharge update
 */
export function logSurchargeUpdateSuccess(
  userId: string,
  data: {
    modelColorId: string;
    modelName: string;
    colorName: string;
    newSurcharge: number;
  }
): void {
  logger.info("Model color surcharge updated", {
    userId,
    ...data,
  });
}

/**
 * Log surcharge update error
 */
export function logSurchargeUpdateError(
  error: unknown,
  userId: string,
  input: {
    id: string;
    surchargePercentage: number;
  }
): void {
  logger.error("Failed to update surcharge", {
    error,
    userId,
    input,
  });
}

/**
 * Log successful default color assignment
 */
export function logSetDefaultSuccess(
  userId: string,
  data: {
    modelColorId: string;
    modelId: string;
    colorName: string;
  }
): void {
  logger.info("Default color set for model", {
    userId,
    ...data,
  });
}

/**
 * Log set default error
 */
export function logSetDefaultError(
  error: unknown,
  userId: string,
  input: { id: string }
): void {
  logger.error("Failed to set default color", {
    error,
    userId,
    input,
  });
}

/**
 * Log successful color unassignment
 */
export function logColorUnassignedSuccess(
  userId: string,
  data: {
    modelColorId: string;
    modelId: string;
    colorName: string;
    wasDefault: boolean;
  }
): void {
  logger.info("Color unassigned from model", {
    userId,
    ...data,
  });
}

/**
 * Log color unassignment error
 */
export function logColorUnassignError(
  error: unknown,
  userId: string,
  input: { id: string }
): void {
  logger.error("Failed to unassign color", {
    error,
    userId,
    input,
  });
}

/**
 * Log successful bulk color assignment
 */
export function logBulkAssignSuccess(
  userId: string,
  data: {
    modelId: string;
    assignedCount: number;
    totalRequested: number;
  }
): void {
  logger.info("Bulk color assignment completed", {
    userId,
    ...data,
  });
}

/**
 * Log bulk assignment error
 */
export function logBulkAssignError(
  error: unknown,
  userId: string,
  input: {
    modelId: string;
    assignments: Array<{ colorId: string; surchargePercentage: number }>;
  }
): void {
  logger.error("Failed to bulk assign colors", {
    error,
    userId,
    input,
  });
}
