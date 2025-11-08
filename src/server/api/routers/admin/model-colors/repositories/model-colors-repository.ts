/**
 * Model Colors Repository - Data Access Layer
 *
 * Pure database operations using Drizzle ORM.
 * No business logic, no error handling, no logging.
 *
 * @module server/api/routers/admin/model-colors/repositories/model-colors-repository
 */
import { and, count, desc, eq, notInArray } from "drizzle-orm";
import type { db } from "@/server/db/drizzle";
import { colors, modelColors, models } from "@/server/db/schema";

// Type inference from Drizzle db instance
type DbClient = typeof db;

/**
 * Find all colors assigned to a specific model
 *
 * @param client - Drizzle client instance
 * @param modelId - Model ID
 * @returns Array of model colors with color details
 */
export async function findModelColorsByModelId(
  client: DbClient,
  modelId: string
) {
  return await client
    .select({
      id: modelColors.id,
      modelId: modelColors.modelId,
      colorId: modelColors.colorId,
      surchargePercentage: modelColors.surchargePercentage,
      isDefault: modelColors.isDefault,
      createdAt: modelColors.createdAt,
      updatedAt: modelColors.updatedAt,
      color: {
        id: colors.id,
        name: colors.name,
        ralCode: colors.ralCode,
        hexCode: colors.hexCode,
        isActive: colors.isActive,
        createdAt: colors.createdAt,
        updatedAt: colors.updatedAt,
      },
    })
    .from(modelColors)
    .innerJoin(colors, eq(colors.id, modelColors.colorId))
    .where(and(eq(modelColors.modelId, modelId), eq(colors.isActive, true)))
    .orderBy(desc(modelColors.isDefault), colors.name);
}

/**
 * Find available colors for assignment (not yet assigned to this model)
 *
 * @param client - Drizzle client instance
 * @param modelId - Model ID
 * @returns Array of available colors
 */
export async function findAvailableColorsForModel(
  client: DbClient,
  modelId: string
) {
  // Get IDs of colors already assigned to this model
  const assignedColorIds = await client
    .select({ colorId: modelColors.colorId })
    .from(modelColors)
    .where(eq(modelColors.modelId, modelId));

  const assignedIds = assignedColorIds.map((mc) => mc.colorId);

  // Find all active colors NOT in the assigned list
  if (assignedIds.length === 0) {
    return await client
      .select()
      .from(colors)
      .where(eq(colors.isActive, true))
      .orderBy(colors.name);
  }

  return await client
    .select()
    .from(colors)
    .where(and(eq(colors.isActive, true), notInArray(colors.id, assignedIds)))
    .orderBy(colors.name);
}

/**
 * Find model by ID
 *
 * @param client - Drizzle client instance
 * @param modelId - Model ID
 * @returns Model or null if not found
 */
export async function findModelById(client: DbClient, modelId: string) {
  return await client
    .select()
    .from(models)
    .where(eq(models.id, modelId))
    .then((rows) => rows[0] ?? null);
}

/**
 * Find color by ID
 *
 * @param client - Drizzle client instance
 * @param colorId - Color ID
 * @returns Color or null if not found
 */
export async function findColorById(client: DbClient, colorId: string) {
  return await client
    .select()
    .from(colors)
    .where(eq(colors.id, colorId))
    .then((rows) => rows[0] ?? null);
}

/**
 * Count model colors for a specific model
 *
 * @param client - Drizzle client instance
 * @param modelId - Model ID
 * @returns Count of assigned colors
 */
export async function countModelColors(client: DbClient, modelId: string) {
  return await client
    .select({ count: count() })
    .from(modelColors)
    .where(eq(modelColors.modelId, modelId))
    .then((rows) => rows[0]?.count ?? 0);
}

/**
 * Create a model color assignment
 *
 * @param client - Drizzle client instance
 * @param data - Model color data
 * @returns Created model color
 */
export async function createModelColor(
  client: DbClient,
  data: {
    modelId: string;
    colorId: string;
    surchargePercentage: number;
    isDefault: boolean;
  }
) {
  return await client
    .insert(modelColors)
    .values({
      modelId: data.modelId,
      colorId: data.colorId,
      surchargePercentage: data.surchargePercentage.toString(),
      isDefault: data.isDefault,
    })
    .returning()
    .then((rows) => rows[0] ?? null);
}

/**
 * Create multiple model color assignments
 *
 * @param client - Drizzle client instance
 * @param data - Array of model color data
 * @returns Array of created model colors
 */
export async function createManyModelColors(
  client: DbClient,
  data: Array<{
    modelId: string;
    colorId: string;
    surchargePercentage: number;
    isDefault: boolean;
  }>
) {
  return await client
    .insert(modelColors)
    .values(
      data.map((item) => ({
        modelId: item.modelId,
        colorId: item.colorId,
        surchargePercentage: item.surchargePercentage.toString(),
        isDefault: item.isDefault,
      }))
    )
    .returning();
}

/**
 * Update surcharge percentage for a model color
 *
 * @param client - Drizzle client instance
 * @param id - Model color ID
 * @param surchargePercentage - New surcharge percentage
 * @returns Updated model color
 */
export async function updateModelColorSurcharge(
  client: DbClient,
  id: string,
  surchargePercentage: number
) {
  return await client
    .update(modelColors)
    .set({ surchargePercentage: surchargePercentage.toString() })
    .where(eq(modelColors.id, id))
    .returning()
    .then((rows) => rows[0] ?? null);
}

/**
 * Find model color by ID
 *
 * @param client - Drizzle client instance
 * @param id - Model color ID
 * @returns Model color or null if not found
 */
export async function findModelColorById(client: DbClient, id: string) {
  return await client
    .select()
    .from(modelColors)
    .where(eq(modelColors.id, id))
    .then((rows) => rows[0] ?? null);
}

/**
 * Find model color by ID with color and model details
 *
 * @param client - Drizzle client instance
 * @param id - Model color ID
 * @returns Model color with relations or null
 */
export async function findModelColorByIdWithDetails(
  client: DbClient,
  id: string
) {
  return await client
    .select({
      id: modelColors.id,
      modelId: modelColors.modelId,
      colorId: modelColors.colorId,
      surchargePercentage: modelColors.surchargePercentage,
      isDefault: modelColors.isDefault,
      createdAt: modelColors.createdAt,
      updatedAt: modelColors.updatedAt,
      color: {
        id: colors.id,
        name: colors.name,
        ralCode: colors.ralCode,
        hexCode: colors.hexCode,
        isActive: colors.isActive,
      },
      model: {
        id: models.id,
        name: models.name,
      },
    })
    .from(modelColors)
    .innerJoin(colors, eq(colors.id, modelColors.colorId))
    .innerJoin(models, eq(models.id, modelColors.modelId))
    .where(eq(modelColors.id, id))
    .then((rows) => rows[0] ?? null);
}

/**
 * Unset all default flags for a specific model
 *
 * @param client - Drizzle client instance
 * @param modelId - Model ID
 * @returns Number of updated records
 */
export async function unsetAllDefaultsForModel(
  client: DbClient,
  modelId: string
) {
  return await client
    .update(modelColors)
    .set({ isDefault: false })
    .where(eq(modelColors.modelId, modelId))
    .returning()
    .then((rows) => rows.length);
}

/**
 * Set a model color as default
 *
 * @param client - Drizzle client instance
 * @param id - Model color ID
 * @returns Updated model color
 */
export async function setModelColorAsDefault(client: DbClient, id: string) {
  return await client
    .update(modelColors)
    .set({ isDefault: true })
    .where(eq(modelColors.id, id))
    .returning()
    .then((rows) => rows[0] ?? null);
}

/**
 * Delete a model color assignment
 *
 * @param client - Drizzle client instance
 * @param id - Model color ID
 * @returns Deleted model color
 */
export async function deleteModelColor(client: DbClient, id: string) {
  return await client
    .delete(modelColors)
    .where(eq(modelColors.id, id))
    .returning()
    .then((rows) => rows[0] ?? null);
}

/**
 * Find first model color for a model (for auto-promoting to default)
 *
 * @param client - Drizzle client instance
 * @param modelId - Model ID
 * @returns First model color or null
 */
export async function findFirstModelColorByModelId(
  client: DbClient,
  modelId: string
) {
  return await client
    .select()
    .from(modelColors)
    .where(eq(modelColors.modelId, modelId))
    .orderBy(modelColors.createdAt)
    .limit(1)
    .then((rows) => rows[0] ?? null);
}

/**
 * Check if model has a default color
 *
 * @param client - Drizzle client instance
 * @param modelId - Model ID
 * @returns True if default exists, false otherwise
 */
export async function hasDefaultColor(client: DbClient, modelId: string) {
  return await client
    .select({ id: modelColors.id })
    .from(modelColors)
    .where(
      and(eq(modelColors.modelId, modelId), eq(modelColors.isDefault, true))
    )
    .limit(1)
    .then((rows) => rows.length > 0);
}
