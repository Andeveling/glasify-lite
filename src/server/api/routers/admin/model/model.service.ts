/**
 * Model Service - Business Logic Layer
 *
 * Orchestrates repository calls, validates business rules,
 * handles errors, and logs operations.
 *
 * @module server/api/routers/admin/model/model.service
 */

import { TRPCError } from "@trpc/server";
import logger from "@/lib/logger";
import type { db } from "@/server/db/drizzle";
import {
  createCostBreakdown as createCostBreakdownRepo,
  createModel as createModelRepo,
  createPriceHistory,
  deleteCostBreakdown as deleteCostBreakdownRepo,
  deleteModel as deleteModelRepo,
  findModelById,
  findModels,
  getCostBreakdownsByModelId,
  getPriceHistoryByModelId,
  updateCostBreakdown as updateCostBreakdownRepo,
  updateModel as updateModelRepo,
} from "./repositories/model-repository";

type DbClient = typeof db;

/**
 * Private Helpers - Data Transformation
 */

/**
 * Build update data object converting numbers to strings for Drizzle decimals
 */
function buildModelUpdateData(
  data: Partial<{
    name: string;
    profileSupplierId: string | null;
    basePrice: number;
    costPerMmWidth: number;
    costPerMmHeight: number;
    compatibleGlassTypeIds: string[];
    status: "draft" | "published";
  }>
) {
  const updateData: {
    name?: string;
    profileSupplierId?: string | null;
    basePrice?: string;
    costPerMmWidth?: string;
    costPerMmHeight?: string;
    compatibleGlassTypeIds?: string[];
    status?: "draft" | "published";
  } = {};

  // Copy non-price fields directly
  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.profileSupplierId !== undefined) {
    updateData.profileSupplierId = data.profileSupplierId;
  }
  if (data.compatibleGlassTypeIds !== undefined) {
    updateData.compatibleGlassTypeIds = data.compatibleGlassTypeIds;
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  // Convert price numbers to strings
  if (data.basePrice !== undefined) {
    updateData.basePrice = data.basePrice.toString();
  }
  if (data.costPerMmWidth !== undefined) {
    updateData.costPerMmWidth = data.costPerMmWidth.toString();
  }
  if (data.costPerMmHeight !== undefined) {
    updateData.costPerMmHeight = data.costPerMmHeight.toString();
  }

  return updateData;
}

/**
 * Check if price fields changed in update data
 */
function hasPriceChanges(
  data: Partial<{
    basePrice?: number;
    costPerMmWidth?: number;
    costPerMmHeight?: number;
  }>
): boolean {
  return (
    data.basePrice !== undefined ||
    data.costPerMmWidth !== undefined ||
    data.costPerMmHeight !== undefined
  );
}

/**
 * Transform flat repository model to nested profileSupplier structure
 */
function transformModelWithSupplier<
  T extends {
    profileSupplierId: string | null;
    profileSupplierName?: string | null;
    profileSupplierMaterialType?: string | null;
  },
>(model: T) {
  return {
    ...model,
    profileSupplier: model.profileSupplierId
      ? {
          id: model.profileSupplierId,
          name: model.profileSupplierName ?? "",
          materialType: (model.profileSupplierMaterialType ?? "aluminum") as
            | "aluminum"
            | "pvc"
            | "wood",
        }
      : null,
  };
}

/**
 * Get model by ID with all relations (cost breakdown and price history)
 */
export async function getModelById(
  client: DbClient,
  modelId: string,
  userId: string
) {
  try {
    logger.info("Fetching model by ID", { modelId, userId });

    // Fetch model with basic info
    const model = await findModelById(client, modelId);

    if (!model) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Modelo con ID ${modelId} no encontrado`,
      });
    }

    // Fetch cost breakdown and price history in parallel
    const [costBreakdown, priceHistory] = await Promise.all([
      getCostBreakdownsByModelId(client, modelId),
      getPriceHistoryByModelId(client, modelId),
    ]);

    logger.info("Model retrieved successfully", {
      modelId: model.id,
      userId,
    });

    return {
      ...transformModelWithSupplier(model),
      costBreakdown,
      priceHistory,
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error("Error fetching model by ID", {
      error: error instanceof Error ? error.message : String(error),
      modelId,
      userId,
    });

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al obtener el modelo",
    });
  }
}

/**
 * List models with pagination, filtering, and sorting
 */
export async function listModels(
  client: DbClient,
  filters: {
    search?: string;
    status?: "all" | "draft" | "published";
    profileSupplierId?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  },
  userId: string
) {
  try {
    logger.info("Listing models", {
      filters,
      userId,
    });

    const { items, total } = await findModels(client, filters);

    const totalPages = Math.ceil(total / filters.limit);

    logger.info("Models listed successfully", {
      count: items.length,
      total,
      userId,
    });

    return {
      items: items.map((item) => transformModelWithSupplier(item)),
      totalPages,
      total,
    };
  } catch (error) {
    logger.error("Error listing models", {
      error: error instanceof Error ? error.message : String(error),
      filters,
      userId,
    });

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al listar los modelos",
    });
  }
}

/**
 * Create new model
 */
export async function createModel(
  client: DbClient,
  data: {
    name: string;
    profileSupplierId?: string | null;
    basePrice: number;
    costPerMmWidth: number;
    costPerMmHeight: number;
    compatibleGlassTypeIds: string[];
    status: "draft" | "published";
  },
  userId: string
) {
  try {
    logger.info("Creating model", {
      data,
      userId,
    });

    // Validate all compatible glass types exist and are active
    // Note: This validation should be done in a separate glass-type service
    // For now, we'll skip it and let the database constraints handle it

    // Convert numbers to strings (Drizzle decimals)
    const model = await createModelRepo(client, {
      name: data.name,
      profileSupplierId: data.profileSupplierId,
      basePrice: data.basePrice.toString(),
      costPerMmWidth: data.costPerMmWidth.toString(),
      costPerMmHeight: data.costPerMmHeight.toString(),
      compatibleGlassTypeIds: data.compatibleGlassTypeIds,
      status: data.status,
      // Required fields with defaults
      minWidthMm: "0",
      maxWidthMm: "0",
      minHeightMm: "0",
      maxHeightMm: "0",
    });

    if (!model) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al crear el modelo",
      });
    }

    return transformModelWithSupplier(model);
  } catch (error) {
    logger.error("Error creating model", {
      error: error instanceof Error ? error.message : String(error),
      data,
      userId,
    });

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al crear el modelo",
    });
  }
}

/**
 * Update model
 */
export async function updateModel(
  client: DbClient,
  modelId: string,
  data: Partial<{
    name: string;
    profileSupplierId: string | null;
    basePrice: number;
    costPerMmWidth: number;
    costPerMmHeight: number;
    compatibleGlassTypeIds: string[];
    status: "draft" | "published";
  }>,
  userId: string
) {
  try {
    logger.info("Updating model", {
      data,
      modelId,
      userId,
    });

    // Verify model exists
    const existingModel = await findModelById(client, modelId);

    if (!existingModel) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Modelo con ID ${modelId} no encontrado`,
      });
    }

    // Build update data with type conversion
    const updateData = buildModelUpdateData(data);

    // Update model
    const updatedModel = await updateModelRepo(client, modelId, updateData);

    if (!updatedModel) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al actualizar el modelo",
      });
    }

    // Check if price changed - create price history entry
    if (hasPriceChanges(data)) {
      await createPriceHistory(client, {
        modelId: updatedModel.id,
        basePrice: updatedModel.basePrice,
        costPerMmWidth: updatedModel.costPerMmWidth,
        costPerMmHeight: updatedModel.costPerMmHeight,
        reason: "Actualización de precios",
        createdBy: userId,
      });
    }

    logger.info("Model updated successfully", {
      modelId: updatedModel.id,
      modelName: updatedModel.name,
      priceChanged: hasPriceChanges(data),
      userId,
    });

    return transformModelWithSupplier(updatedModel);
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error("Error updating model", {
      error: error instanceof Error ? error.message : String(error),
      data,
      modelId,
      userId,
    });

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al actualizar el modelo",
    });
  }
}

/**
 * Delete model
 */
export async function deleteModel(
  client: DbClient,
  modelId: string,
  userId: string
) {
  try {
    logger.info("Deleting model", {
      modelId,
      userId,
    });

    // Verify model exists
    const existingModel = await findModelById(client, modelId);

    if (!existingModel) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Modelo con ID ${modelId} no encontrado`,
      });
    }

    // TODO: Check referential integrity when service is available
    // const integrityCheck = await canDeleteModel(modelId);
    // if (!integrityCheck.canDelete) {
    //   throw new TRPCError({
    //     code: "PRECONDITION_FAILED",
    //     message: `No se puede eliminar el modelo porque está siendo utilizado: ${integrityCheck.reasons.join(", ")}`,
    //   });
    // }

    // Delete model (cascade deletes costBreakdown and priceHistory)
    const deletedModel = await deleteModelRepo(client, modelId);

    logger.info("Model deleted successfully", {
      modelId: deletedModel?.id,
      modelName: deletedModel?.name,
      userId,
    });

    return { success: true as const };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error("Error deleting model", {
      error: error instanceof Error ? error.message : String(error),
      modelId,
      userId,
    });

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al eliminar el modelo",
    });
  }
}

/**
 * Add cost breakdown component
 */
export async function addCostBreakdown(
  client: DbClient,
  modelId: string,
  data: {
    component: string;
    costType: "fixed" | "per_mm_width" | "per_mm_height" | "per_sqm";
    unitCost: number;
  },
  userId: string
) {
  try {
    logger.info("Adding cost breakdown component", {
      data,
      modelId,
      userId,
    });

    // Verify model exists
    const model = await findModelById(client, modelId);

    if (!model) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Modelo con ID ${modelId} no encontrado`,
      });
    }

    // Create cost breakdown component
    const costBreakdown = await createCostBreakdownRepo(client, {
      modelId,
      component: data.component,
      costType: data.costType,
      unitCost: data.unitCost.toString(),
    });

    if (!costBreakdown) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al agregar el componente de desglose de costos",
      });
    }

    return costBreakdown;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error("Error adding cost breakdown component", {
      data,
      error: error instanceof Error ? error.message : String(error),
      modelId,
      userId,
    });

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al agregar el componente de desglose de costos",
    });
  }
}

/**
 * Update cost breakdown component
 */
export async function updateCostBreakdown(
  client: DbClient,
  costBreakdownId: string,
  data: Partial<{
    component: string;
    costType: "fixed" | "per_mm_width" | "per_mm_height" | "per_sqm";
    unitCost: number;
  }>,
  userId: string
) {
  try {
    logger.info("Updating cost breakdown component", {
      costBreakdownId,
      data,
      userId,
    });

    // Convert amount to string if present
    const updateData: {
      component?: string;
      costType?: "fixed" | "per_mm_width" | "per_mm_height" | "per_sqm";
      amount?: string;
    } = {};

    if (data.component !== undefined) {
      updateData.component = data.component;
    }
    if (data.costType !== undefined) {
      updateData.costType = data.costType;
    }
    if (data.unitCost !== undefined) {
      updateData.amount = data.unitCost.toString();
    }

    const costBreakdown = await updateCostBreakdownRepo(
      client,
      costBreakdownId,
      updateData
    );

    if (!costBreakdown) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Componente de desglose de costos con ID ${costBreakdownId} no encontrado`,
      });
    }

    // Fetch model info for logging
    const model = await findModelById(client, costBreakdown.modelId);

    logger.info("Cost breakdown component updated successfully", {
      component: costBreakdown.component,
      costBreakdownId: costBreakdown.id,
      modelId: costBreakdown.modelId,
      modelName: model?.name ?? "Unknown",
      userId,
    });

    return costBreakdown;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error("Error updating cost breakdown component", {
      costBreakdownId,
      data,
      error: error instanceof Error ? error.message : String(error),
      userId,
    });

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al actualizar el componente de desglose de costos",
    });
  }
}

/**
 * Delete cost breakdown component
 */
export async function deleteCostBreakdown(
  client: DbClient,
  costBreakdownId: string,
  userId: string
) {
  try {
    logger.info("Deleting cost breakdown component", {
      costBreakdownId,
      userId,
    });

    const costBreakdown = await deleteCostBreakdownRepo(
      client,
      costBreakdownId
    );

    if (!costBreakdown) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Componente de desglose de costos con ID ${costBreakdownId} no encontrado`,
      });
    }

    // Fetch model info for logging
    const model = await findModelById(client, costBreakdown.modelId);

    logger.info("Cost breakdown component deleted successfully", {
      component: costBreakdown.component,
      costBreakdownId: costBreakdown.id,
      modelId: costBreakdown.modelId,
      modelName: model?.name ?? "Unknown",
      userId,
    });

    return { success: true as const };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error("Error deleting cost breakdown component", {
      costBreakdownId,
      error: error instanceof Error ? error.message : String(error),
      userId,
    });

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al eliminar el componente de desglose de costos",
    });
  }
}
