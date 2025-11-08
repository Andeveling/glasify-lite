/**
 * Catalog Logger Utilities
 *
 * Logging helpers for catalog operations.
 * Uses Winston for server-side structured logging.
 *
 * @module server/api/routers/catalog/utils/catalog-logger
 */

import logger from "@/lib/logger";

// ============================================================================
// Model Operations Logging
// ============================================================================

export function logModelFetchStart(modelId: string) {
  logger.info("Fetching model by ID", { modelId });
}

export function logModelFetchSuccess(modelId: string, modelName: string) {
  logger.info("Successfully retrieved model", { modelId, modelName });
}

export function logModelFetchError(modelId: string, error: unknown) {
  logger.error("Error fetching model by ID", {
    error: error instanceof Error ? error.message : "Unknown error",
    modelId,
  });
}

export function logModelListStart(params: {
  page: number;
  limit: number;
  search?: string;
  profileSupplierId?: string;
  sort: string;
}) {
  logger.info("Listing models", params);
}

export function logModelListSuccess(params: {
  count: number;
  total: number;
  page: number;
  sort: string;
  profileSupplierId?: string;
}) {
  logger.info("Successfully retrieved models", params);
}

export function logModelListError(error: unknown, profileSupplierId?: string) {
  logger.error("Error listing models", {
    error: error instanceof Error ? error.message : "Unknown error",
    profileSupplierId,
  });
}

// ============================================================================
// Glass Type Operations Logging
// ============================================================================

export function logGlassTypesListStart(count: number) {
  logger.info("Listing glass types by IDs", { count });
}

export function logGlassTypesListSuccess(count: number) {
  logger.info("Successfully retrieved glass types", { count });
}

export function logGlassTypesListError(error: unknown) {
  logger.error("Error listing glass types", {
    error: error instanceof Error ? error.message : "Unknown error",
  });
}

export function logCompatibleGlassTypesStart(modelId: string) {
  logger.info("Fetching compatible glass types for model", { modelId });
}

export function logCompatibleGlassTypesSuccess(modelId: string, count: number) {
  logger.info("Successfully fetched compatible glass types", {
    modelId,
    count,
  });
}

export function logCompatibleGlassTypesError(modelId: string, error: unknown) {
  logger.error("Error fetching compatible glass types", {
    error: error instanceof Error ? error.message : "Unknown error",
    modelId,
  });
}

// ============================================================================
// Glass Solution Operations Logging
// ============================================================================

export function logGlassSolutionFetchStart(slug: string) {
  logger.info("Fetching glass solution by slug", { slug });
}

export function logGlassSolutionFetchSuccess(params: {
  slug: string;
  solutionName: string;
  glassTypeCount: number;
}) {
  logger.info("Successfully retrieved glass solution by slug", params);
}

export function logGlassSolutionFetchError(slug: string, error: unknown) {
  logger.error("Error fetching glass solution by slug", {
    error: error instanceof Error ? error.message : "Unknown error",
    slug,
  });
}

export function logGlassSolutionListStart(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  logger.info("Fetching glass solutions list", params);
}

export function logGlassSolutionListSuccess(count: number, page: number) {
  logger.info("Successfully retrieved glass solutions list", { count, page });
}

export function logGlassSolutionListError(error: unknown) {
  logger.error("Error fetching glass solutions list", {
    error: error instanceof Error ? error.message : "Unknown error",
  });
}

export function logAllGlassSolutionsListStart(modelId?: string) {
  logger.info("Listing all glass solutions", { modelId });
}

export function logAllGlassSolutionsListSuccess(
  count: number,
  modelId?: string
) {
  logger.info("Successfully retrieved glass solutions", { count, modelId });
}

export function logAllGlassSolutionsListError(
  error: unknown,
  modelId?: string
) {
  logger.error("Error listing glass solutions", {
    error: error instanceof Error ? error.message : "Unknown error",
    modelId,
  });
}

// ============================================================================
// Profile Supplier Operations Logging
// ============================================================================

export function logProfileSuppliersListStart() {
  logger.info("Listing profile suppliers with published models");
}

export function logProfileSuppliersListSuccess(count: number) {
  logger.info(
    "Successfully retrieved profile suppliers with published models",
    {
      count,
    }
  );
}

export function logProfileSuppliersListError(error: unknown) {
  logger.error("Error listing profile suppliers", {
    error: error instanceof Error ? error.message : "Unknown error",
  });
}

// ============================================================================
// Service Operations Logging
// ============================================================================

export function logServicesListStart() {
  logger.info("Listing services");
}

export function logServicesListSuccess(count: number) {
  logger.info("Successfully retrieved services", { count });
}

export function logServicesListError(error: unknown) {
  logger.error("Error listing services", {
    error: error instanceof Error ? error.message : "Unknown error",
  });
}

// ============================================================================
// Compatibility Validation Logging
// ============================================================================

export function logCompatibilityValidationStart(
  modelId: string,
  glassTypeId: string
) {
  logger.info("Validating glass compatibility", { modelId, glassTypeId });
}

export function logCompatibilityValidationSuccess(
  modelId: string,
  glassTypeId: string,
  compatible: boolean
) {
  logger.info("Glass compatibility validation result", {
    compatible,
    glassTypeId,
    modelId,
  });
}

export function logCompatibilityValidationError(
  modelId: string,
  glassTypeId: string,
  error: unknown
) {
  logger.error("Error validating glass compatibility", {
    error: error instanceof Error ? error.message : "Unknown error",
    glassTypeId,
    modelId,
  });
}
