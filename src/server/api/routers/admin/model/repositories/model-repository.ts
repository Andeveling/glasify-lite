/**
 * Model Repository - Data Access Layer
 *
 * Pure database operations using Drizzle ORM.
 * No business logic, no error handling, no logging.
 *
 * @module server/api/routers/admin/model/repositories/model-repository
 */

import { and, desc, eq, ilike, sql } from "drizzle-orm";
import type { db } from "@/server/db/drizzle";
import {
  modelCostBreakdowns,
  modelPriceHistories,
  models,
  profileSuppliers,
} from "@/server/db/schema";

type DbClient = typeof db;

/**
 * Find model by ID with all relations
 */
export async function findModelById(client: DbClient, modelId: string) {
  return await client
    .select({
      id: models.id,
      name: models.name,
      imageUrl: models.imageUrl,
      status: models.status,
      minWidthMm: models.minWidthMm,
      maxWidthMm: models.maxWidthMm,
      minHeightMm: models.minHeightMm,
      maxHeightMm: models.maxHeightMm,
      profileSupplierId: models.profileSupplierId,
      basePrice: models.basePrice,
      costPerMmWidth: models.costPerMmWidth,
      costPerMmHeight: models.costPerMmHeight,
      accessoryPrice: models.accessoryPrice,
      glassDiscountWidthMm: models.glassDiscountWidthMm,
      glassDiscountHeightMm: models.glassDiscountHeightMm,
      compatibleGlassTypeIds: models.compatibleGlassTypeIds,
      profitMarginPercentage: models.profitMarginPercentage,
      lastCostReviewDate: models.lastCostReviewDate,
      costNotes: models.costNotes,
      createdAt: models.createdAt,
      updatedAt: models.updatedAt,
      profileSupplierName: profileSuppliers.name,
      profileSupplierMaterialType: profileSuppliers.materialType,
    })
    .from(models)
    .leftJoin(
      profileSuppliers,
      eq(models.profileSupplierId, profileSuppliers.id)
    )
    .where(eq(models.id, modelId))
    .then((rows) => rows[0] ?? null);
}

/**
 * Find models with pagination, filtering and sorting
 */
export async function findModels(
  client: DbClient,
  filters: {
    search?: string;
    status?: "all" | "draft" | "published";
    profileSupplierId?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  }
) {
  const { page, limit, search, status, profileSupplierId, sortBy, sortOrder } =
    filters;

  // Build WHERE clause
  const conditions: ReturnType<typeof eq | typeof ilike>[] = [];

  if (search) {
    conditions.push(ilike(models.name, `%${search}%`));
  }

  if (status && status !== "all") {
    conditions.push(eq(models.status, status));
  }

  if (profileSupplierId) {
    conditions.push(eq(models.profileSupplierId, profileSupplierId));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // Build ORDER BY clause
  let orderByClause:
    | ReturnType<typeof desc>
    | (typeof models)[keyof typeof models];
  switch (sortBy) {
    case "name":
      orderByClause = sortOrder === "asc" ? models.name : desc(models.name);
      break;
    case "basePrice":
      orderByClause =
        sortOrder === "asc" ? models.basePrice : desc(models.basePrice);
      break;
    case "updatedAt":
      orderByClause =
        sortOrder === "asc" ? models.updatedAt : desc(models.updatedAt);
      break;
    default:
      orderByClause =
        sortOrder === "asc" ? models.createdAt : desc(models.createdAt);
  }

  // Execute count and find queries in parallel
  const [countResult, items] = await Promise.all([
    client
      .select({ count: sql<number>`cast(count(*) as integer)` })
      .from(models)
      .where(where)
      .then((rows) => rows[0]?.count ?? 0),

    client
      .select({
        id: models.id,
        name: models.name,
        imageUrl: models.imageUrl,
        status: models.status,
        minWidthMm: models.minWidthMm,
        maxWidthMm: models.maxWidthMm,
        minHeightMm: models.minHeightMm,
        maxHeightMm: models.maxHeightMm,
        profileSupplierId: models.profileSupplierId,
        basePrice: models.basePrice,
        costPerMmWidth: models.costPerMmWidth,
        costPerMmHeight: models.costPerMmHeight,
        accessoryPrice: models.accessoryPrice,
        glassDiscountWidthMm: models.glassDiscountWidthMm,
        glassDiscountHeightMm: models.glassDiscountHeightMm,
        compatibleGlassTypeIds: models.compatibleGlassTypeIds,
        profitMarginPercentage: models.profitMarginPercentage,
        lastCostReviewDate: models.lastCostReviewDate,
        costNotes: models.costNotes,
        createdAt: models.createdAt,
        updatedAt: models.updatedAt,
        profileSupplierName: profileSuppliers.name,
        profileSupplierMaterialType: profileSuppliers.materialType,
      })
      .from(models)
      .leftJoin(
        profileSuppliers,
        eq(models.profileSupplierId, profileSuppliers.id)
      )
      .where(where)
      .orderBy(orderByClause)
      .limit(limit)
      .offset((page - 1) * limit),
  ]);

  return { items, total: countResult };
}

/**
 * Create new model
 */
export async function createModel(
  client: DbClient,
  data: {
    name: string;
    profileSupplierId?: string | null;
    imageUrl?: string;
    status?: "draft" | "published";
    minWidthMm: string;
    maxWidthMm: string;
    minHeightMm: string;
    maxHeightMm: string;
    basePrice: string;
    costPerMmWidth: string;
    costPerMmHeight: string;
    accessoryPrice?: string;
    glassDiscountWidthMm?: string;
    glassDiscountHeightMm?: string;
    compatibleGlassTypeIds: string[];
    profitMarginPercentage?: string;
    lastCostReviewDate?: Date;
    costNotes?: string;
  }
) {
  const [model] = await client
    .insert(models)
    .values({
      ...data,
      imageUrl: data.imageUrl ?? "",
      status: data.status ?? "draft",
      glassDiscountWidthMm: data.glassDiscountWidthMm ?? "0",
      glassDiscountHeightMm: data.glassDiscountHeightMm ?? "0",
      compatibleGlassTypeIds: data.compatibleGlassTypeIds,
    })
    .returning();

  // Fetch complete model with profile supplier info using join
  if (!model?.id) {
    throw new Error("Failed to create model");
  }

  return await findModelById(client, model.id);
}

/**
 * Update model
 */
export async function updateModel(
  client: DbClient,
  modelId: string,
  data: Partial<{
    name: string;
    description: string | null;
    profileSupplierId: string | null;
    basePrice: string;
    costPerMmWidth: string;
    costPerMmHeight: string;
    compatibleGlassTypeIds: string[];
    status: "draft" | "published";
  }>
) {
  const [model] = await client
    .update(models)
    .set(data)
    .where(eq(models.id, modelId))
    .returning();

  if (!model) {
    return null;
  }

  // Fetch complete model with profile supplier info using join
  return await findModelById(client, model.id);
}

/**
 * Delete model
 */
export async function deleteModel(client: DbClient, modelId: string) {
  const [model] = await client
    .delete(models)
    .where(eq(models.id, modelId))
    .returning();
  return model ?? null;
}

/**
 * Get cost breakdown components for a model
 */
export async function getCostBreakdownsByModelId(
  client: DbClient,
  modelId: string
) {
  return await client
    .select({
      id: modelCostBreakdowns.id,
      modelId: modelCostBreakdowns.modelId,
      component: modelCostBreakdowns.component,
      costType: modelCostBreakdowns.costType,
      unitCost: modelCostBreakdowns.unitCost,
      notes: modelCostBreakdowns.notes,
      createdAt: modelCostBreakdowns.createdAt,
      updatedAt: modelCostBreakdowns.updatedAt,
    })
    .from(modelCostBreakdowns)
    .where(eq(modelCostBreakdowns.modelId, modelId))
    .orderBy(modelCostBreakdowns.createdAt);
}

/**
 * Create cost breakdown component
 */
export async function createCostBreakdown(
  client: DbClient,
  data: {
    modelId: string;
    component: string;
    costType: "fixed" | "per_mm_width" | "per_mm_height" | "per_sqm";
    unitCost: string;
  }
) {
  const [costBreakdown] = await client
    .insert(modelCostBreakdowns)
    .values(data)
    .returning();
  return costBreakdown;
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
    unitCost: string;
  }>
) {
  const [costBreakdown] = await client
    .update(modelCostBreakdowns)
    .set(data)
    .where(eq(modelCostBreakdowns.id, costBreakdownId))
    .returning();
  return costBreakdown ?? null;
}

/**
 * Delete cost breakdown component
 */
export async function deleteCostBreakdown(
  client: DbClient,
  costBreakdownId: string
) {
  const [costBreakdown] = await client
    .delete(modelCostBreakdowns)
    .where(eq(modelCostBreakdowns.id, costBreakdownId))
    .returning();
  return costBreakdown ?? null;
}

/**
 * Get price history for a model (last 10 entries)
 */
export async function getPriceHistoryByModelId(
  client: DbClient,
  modelId: string
) {
  return await client
    .select({
      id: modelPriceHistories.id,
      modelId: modelPriceHistories.modelId,
      basePrice: modelPriceHistories.basePrice,
      costPerMmWidth: modelPriceHistories.costPerMmWidth,
      costPerMmHeight: modelPriceHistories.costPerMmHeight,
      reason: modelPriceHistories.reason,
      effectiveFrom: modelPriceHistories.effectiveFrom,
      createdBy: modelPriceHistories.createdBy,
      createdAt: modelPriceHistories.createdAt,
    })
    .from(modelPriceHistories)
    .where(eq(modelPriceHistories.modelId, modelId))
    .orderBy(desc(modelPriceHistories.createdAt))
    .limit(10);
}

/**
 * Create price history entry
 */
export async function createPriceHistory(
  client: DbClient,
  data: {
    modelId: string;
    basePrice: string;
    costPerMmWidth: string;
    costPerMmHeight: string;
    reason: string;
    createdBy: string;
  }
) {
  const [priceHistory] = await client
    .insert(modelPriceHistories)
    .values({
      ...data,
      effectiveFrom: new Date(),
    })
    .returning();
  return priceHistory;
}
