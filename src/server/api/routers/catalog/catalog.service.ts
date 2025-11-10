/**
 * Catalog Service - Business Logic Orchestration
 *
 * Clean, modular architecture following SOLID principles:
 * - Single Responsibility: Each module has one clear purpose
 * - Open/Closed: Open for extension, closed for modification
 * - Dependency Inversion: Depends on abstractions
 * - Interface Segregation: Specific interfaces for specific needs
 *
 * Architecture:
 * - repositories/: Data access layer (CRUD operations with Drizzle)
 * - services/: Business logic (this file - orchestration)
 * - utils/: Cross-cutting concerns (logging)
 *
 * @module server/api/routers/catalog/catalog.service
 */

import { TRPCError } from "@trpc/server";
import { serializeDecimalFields } from "./catalog.utils";
import type {
  GlassSolutionListParams,
  ModelListParams,
} from "./repositories/catalog-repository";
import {
  countModels,
  findCompatibleGlassTypes,
  findGlassSolutionBySlug,
  findGlassTypesByIds,
  findModelById,
  listAllGlassSolutions,
  listGlassSolutions,
  listModels,
  listProfileSuppliersWithModels,
  listServices,
} from "./repositories/catalog-repository";
import {
  logAllGlassSolutionsListError,
  logAllGlassSolutionsListStart,
  logAllGlassSolutionsListSuccess,
  logCompatibilityValidationError,
  logCompatibilityValidationStart,
  logCompatibilityValidationSuccess,
  logCompatibleGlassTypesError,
  logCompatibleGlassTypesStart,
  logCompatibleGlassTypesSuccess,
  logGlassSolutionFetchError,
  logGlassSolutionFetchStart,
  logGlassSolutionFetchSuccess,
  logGlassSolutionListError,
  logGlassSolutionListStart,
  logGlassSolutionListSuccess,
  logGlassTypesListError,
  logGlassTypesListStart,
  logGlassTypesListSuccess,
  logModelFetchError,
  logModelFetchStart,
  logModelFetchSuccess,
  logModelListError,
  logModelListStart,
  logModelListSuccess,
  logProfileSuppliersListError,
  logProfileSuppliersListStart,
  logProfileSuppliersListSuccess,
  logServicesListError,
  logServicesListStart,
  logServicesListSuccess,
} from "./utils/catalog-logger";

// ============================================================================
// Types
// ============================================================================

type DrizzleDb = typeof import("@/server/db/drizzle").db;

// ============================================================================
// Model Services
// ============================================================================

/**
 * Get a single model by ID with profile supplier info
 *
 * @param db - Drizzle client instance
 * @param modelId - Model ID (CUID)
 * @returns Model with nested profile supplier data
 * @throws TRPCError if model not found or not published
 */
export async function getModelById(db: DrizzleDb, modelId: string) {
  try {
    logModelFetchStart(modelId);

    const modelData = await findModelById(db, modelId);

    if (!modelData) {
      logModelFetchError(modelId, new Error("Model not found"));
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "El modelo solicitado no existe o no está disponible.",
      });
    }

    // Map Drizzle flattened result to expected nested structure
    const modelWithProfileSupplier = {
      ...modelData,
      profileSupplier: {
        id: modelData.profileSupplierId,
        materialType: modelData.profileSupplierMaterialType,
        name: modelData.profileSupplierName,
      },
      // Remove flattened fields to avoid duplication
      profileSupplierId: undefined,
      profileSupplierMaterialType: undefined,
      profileSupplierName: undefined,
    };

    const serializedModel = serializeDecimalFields(modelWithProfileSupplier);

    logModelFetchSuccess(modelId, modelData.name);

    return serializedModel;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logModelFetchError(modelId, error);
    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "No se pudo cargar el modelo. Intente nuevamente.",
    });
  }
}

/**
 * List models with pagination, filtering, and sorting
 *
 * @param db - Drizzle client instance
 * @param params - List parameters (pagination, search, sort, filter)
 * @returns Paginated list of models with total count
 * @throws TRPCError if database query fails
 */
export async function getModelsList(db: DrizzleDb, params: ModelListParams) {
  try {
    logModelListStart(params);

    // Get total count
    const total = await countModels(db, params);

    // Fetch models
    const modelsData = await listModels(db, params);

    // Map to nested structure and serialize
    const serializedModels = modelsData.map((model) => {
      const modelWithSupplier = {
        ...model,
        profileSupplier: model.profileSupplierId
          ? {
              id: model.profileSupplierId,
              name: model.profileSupplierName,
            }
          : null,
        profileSupplierId: undefined,
        profileSupplierName: undefined,
      };

      return serializeDecimalFields(modelWithSupplier);
    });

    logModelListSuccess({
      count: serializedModels.length,
      page: params.page,
      profileSupplierId: params.profileSupplierId,
      sort: params.sort,
      total,
    });

    return {
      items: serializedModels,
      total,
    };
  } catch (error) {
    logModelListError(error, params.profileSupplierId);
    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "No se pudieron cargar los modelos. Intente nuevamente.",
    });
  }
}

// ============================================================================
// Profile Supplier Services
// ============================================================================

/**
 * List profile suppliers that have published models
 *
 * @param db - Drizzle client instance
 * @returns List of profile suppliers with models
 * @throws TRPCError if database query fails
 */
export async function getProfileSuppliersList(db: DrizzleDb) {
  try {
    logProfileSuppliersListStart();

    const suppliers = await listProfileSuppliersWithModels(db);

    logProfileSuppliersListSuccess(suppliers.length);

    return suppliers;
  } catch (error) {
    logProfileSuppliersListError(error);
    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message:
        "No se pudieron cargar los proveedores de perfiles. Intente nuevamente.",
    });
  }
}

// ============================================================================
// Service Services
// ============================================================================

/**
 * List all services
 *
 * @param db - Drizzle client instance
 * @returns List of services with serialized rates
 * @throws TRPCError if database query fails
 */
export async function getServicesList(db: DrizzleDb) {
  try {
    logServicesListStart();

    const servicesData = await listServices(db);

    // Serialize Decimal fields (rate is stored as string in Drizzle)
    const serializedServices = servicesData.map((service) => ({
      ...service,
      rate: Number.parseFloat(service.rate),
    }));

    logServicesListSuccess(serializedServices.length);

    return serializedServices;
  } catch (error) {
    logServicesListError(error);
    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "No se pudieron cargar los servicios. Intente nuevamente.",
    });
  }
}

// ============================================================================
// Glass Type Services
// ============================================================================

/**
 * List glass types by IDs with characteristics and solutions
 *
 * @param db - Drizzle client instance
 * @param glassTypeIds - Array of glass type IDs
 * @returns List of glass types with nested data
 * @throws TRPCError if database query fails
 */
export async function getGlassTypesList(db: DrizzleDb, glassTypeIds: string[]) {
  try {
    logGlassTypesListStart(glassTypeIds.length);

    const glassTypesData = await findGlassTypesByIds(db, glassTypeIds);

    // Serialize numeric and boolean fields
    const serializedGlassTypes = glassTypesData.map((glassType) =>
      serializeDecimalFields(glassType)
    );

    logGlassTypesListSuccess(serializedGlassTypes.length);

    return serializedGlassTypes;
  } catch (error) {
    logGlassTypesListError(error);
    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "No se pudieron cargar los tipos de vidrio. Intente nuevamente.",
    });
  }
}

/**
 * Get compatible glass types for a model
 *
 * @param db - Drizzle client instance
 * @param modelId - Model ID (CUID)
 * @returns List of compatible glass types sorted by price
 * @throws TRPCError if model not found or database query fails
 */
export async function getCompatibleGlassTypes(db: DrizzleDb, modelId: string) {
  try {
    logCompatibleGlassTypesStart(modelId);

    const glassTypes = await findCompatibleGlassTypes(db, modelId);

    // Serialize numeric fields
    const serializedGlassTypes = glassTypes.map((gt) =>
      serializeDecimalFields(gt)
    );

    logCompatibleGlassTypesSuccess(modelId, serializedGlassTypes.length);

    return serializedGlassTypes;
  } catch (error) {
    logCompatibleGlassTypesError(modelId, error);
    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "No se pudieron cargar los tipos de vidrio. Intente nuevamente.",
    });
  }
}

// ============================================================================
// Glass Solution Services
// ============================================================================

/**
 * Get glass solution by slug with glass types
 *
 * @param db - Drizzle client instance
 * @param slug - Solution slug (URL-friendly)
 * @returns Glass solution with nested glass types
 * @throws TRPCError if solution not found
 */
export async function getGlassSolutionBySlug(db: DrizzleDb, slug: string) {
  try {
    logGlassSolutionFetchStart(slug);

    const solution = await findGlassSolutionBySlug(db, slug);

    if (!solution) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "La solución de vidrio solicitada no existe.",
      });
    }

    // Serialize glass type numeric fields
    const solutionWithSerializedGlassTypes = {
      ...solution,
      glassTypes: solution.glassTypes.map((gt) => {
        const serialized = serializeDecimalFields(gt);
        return {
          ...serialized,
          // Keep pricePerSqm as string for precision (revert serialization)
          pricePerSqm: gt.pricePerSqm.toString(),
        };
      }),
    };

    logGlassSolutionFetchSuccess({
      glassTypeCount: solution.glassTypes.length,
      slug,
      solutionName: solution.nameEs,
    });

    return solutionWithSerializedGlassTypes;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logGlassSolutionFetchError(slug, error);
    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "No se pudo cargar la solución de vidrio. Intente nuevamente.",
    });
  }
}

/**
 * List glass solutions with pagination and search
 *
 * @param db - Drizzle client instance
 * @param params - List parameters (pagination, search)
 * @returns Paginated list of glass solutions
 * @throws TRPCError if database query fails
 */
export async function getGlassSolutionsList(
  db: DrizzleDb,
  params: GlassSolutionListParams
) {
  try {
    logGlassSolutionListStart(params);

    const items = await listGlassSolutions(db, params);

    logGlassSolutionListSuccess(items.length, params.page);

    return { items };
  } catch (error) {
    logGlassSolutionListError(error);
    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message:
        "No se pudieron cargar las soluciones de vidrio. Intente nuevamente.",
    });
  }
}

/**
 * List all active glass solutions (no pagination)
 *
 * @param db - Drizzle client instance
 * @param modelId - Optional model ID to filter compatible solutions
 * @returns List of all active glass solutions
 * @throws TRPCError if database query fails
 */
export async function getAllGlassSolutions(db: DrizzleDb, modelId?: string) {
  try {
    logAllGlassSolutionsListStart(modelId);

    // TODO: If modelId is provided, filter solutions by compatible glass types
    // This requires complex join logic - for now, return all solutions
    const solutions = await listAllGlassSolutions(db);

    logAllGlassSolutionsListSuccess(solutions.length, modelId);

    return solutions;
  } catch (error) {
    logAllGlassSolutionsListError(error, modelId);
    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message:
        "No se pudieron cargar las soluciones de vidrio. Intente nuevamente.",
    });
  }
}

// ============================================================================
// Compatibility Validation Services
// ============================================================================

/**
 * Validate if a glass type is compatible with a model
 *
 * @param db - Drizzle client instance
 * @param modelId - Model ID (CUID)
 * @param glassTypeId - Glass type ID (CUID)
 * @returns Compatibility result with message
 * @throws TRPCError if model not found or database query fails
 */
export async function validateGlassCompatibility(
  db: DrizzleDb,
  modelId: string,
  glassTypeId: string
) {
  try {
    logCompatibilityValidationStart(modelId, glassTypeId);

    // Get model with compatible glass type IDs
    const modelData = await findModelById(db, modelId);

    if (!modelData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Modelo no encontrado",
      });
    }

    // Check if glass type ID is in the compatible list
    const compatible = modelData.compatibleGlassTypeIds.includes(glassTypeId);

    logCompatibilityValidationSuccess(modelId, glassTypeId, compatible);

    return {
      compatible,
      message: compatible
        ? "Este vidrio es compatible"
        : "Este vidrio no es compatible con el modelo",
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logCompatibilityValidationError(modelId, glassTypeId, error);
    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message:
        "No se pudo validar la compatibilidad del vidrio. Intente nuevamente.",
    });
  }
}

// ============================================================================
// Model Color Services
// ============================================================================

/**
 * Get colors available for a model
 *
 * @param db - Drizzle client instance
 * @param modelId - UUID of the model
 * @returns List of colors with surcharge information
 * @throws TRPCError if database query fails
 */
export async function getModelColors(db: DrizzleDb, modelId: string) {
  try {
    const { listModelColors } = await import(
      "./repositories/catalog-repository"
    );

    const rawColors = await listModelColors(db, modelId);

    // Transform to expected format
    const colors = rawColors.map((color) => ({
      id: color.id,
      color: {
        id: color.colorId,
        name: color.colorName,
        hexCode: color.hexCode,
        ralCode: color.ralCode,
      },
      surchargePercentage: Number(color.surchargePercentage) || 0,
      isDefault: color.isDefault,
    }));

    // Find default color
    const defaultColor = colors.find((c) => c.isDefault);

    return {
      hasColors: colors.length > 0,
      defaultColorId: defaultColor?.color.id,
      colors,
    };
  } catch (error) {
    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message:
        "No se pudieron cargar los colores del modelo. Intente nuevamente.",
    });
  }
}
