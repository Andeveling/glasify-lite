/**
 * Catalog Repository - Data Access Layer
 *
 * Handles all database operations for the catalog module using Drizzle ORM.
 * Follows Repository pattern for clean separation of concerns.
 *
 * @module server/api/routers/catalog/repositories/catalog-repository
 */

import { and, count, eq, ilike, inArray, sql } from "drizzle-orm";
import {
  glassCharacteristics,
  glassSolutions,
  glassTypeCharacteristics,
  glassTypeSolutions,
  glassTypes,
  models,
  profileSuppliers,
  services,
} from "@/server/db/schema";

// ============================================================================
// Types
// ============================================================================

type DrizzleDb = typeof import("@/server/db/drizzle").db;

/**
 * Model list query params
 */
export type ModelListParams = {
  limit: number;
  page: number;
  search?: string;
  sort: "name-asc" | "name-desc" | "price-asc" | "price-desc";
  profileSupplierId?: string;
};

/**
 * Glass solution list query params
 */
export type GlassSolutionListParams = {
  limit: number;
  page: number;
  search?: string;
};

// ============================================================================
// Model Queries
// ============================================================================

/**
 * Find model by ID with profile supplier info
 */
export async function findModelById(db: DrizzleDb, modelId: string) {
  const result = await db
    .select({
      // Model fields
      accessoryPrice: models.accessoryPrice,
      basePrice: models.basePrice,
      compatibleGlassTypeIds: models.compatibleGlassTypeIds,
      costPerMmHeight: models.costPerMmHeight,
      costPerMmWidth: models.costPerMmWidth,
      createdAt: models.createdAt,
      glassDiscountHeightMm: models.glassDiscountHeightMm,
      glassDiscountWidthMm: models.glassDiscountWidthMm,
      id: models.id,
      imageUrl: models.imageUrl,
      maxHeightMm: models.maxHeightMm,
      maxWidthMm: models.maxWidthMm,
      minHeightMm: models.minHeightMm,
      minWidthMm: models.minWidthMm,
      name: models.name,
      profitMarginPercentage: models.profitMarginPercentage,
      status: models.status,
      updatedAt: models.updatedAt,
      // ProfileSupplier fields
      profileSupplierId: profileSuppliers.id,
      profileSupplierMaterialType: profileSuppliers.materialType,
      profileSupplierName: profileSuppliers.name,
    })
    .from(models)
    .innerJoin(
      profileSuppliers,
      eq(models.profileSupplierId, profileSuppliers.id)
    )
    .where(and(eq(models.id, modelId), eq(models.status, "published")))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Count models with filters
 */
export async function countModels(
  db: DrizzleDb,
  params: Pick<ModelListParams, "search" | "profileSupplierId">
) {
  const conditions = [eq(models.status, "published")];

  if (params.profileSupplierId) {
    conditions.push(eq(models.profileSupplierId, params.profileSupplierId));
  }

  if (params.search) {
    conditions.push(ilike(models.name, `%${params.search}%`));
  }

  const result = await db
    .select({ count: count() })
    .from(models)
    .where(and(...conditions));

  return result[0]?.count ?? 0;
}

/**
 * List models with pagination, filtering, and sorting
 */
export async function listModels(db: DrizzleDb, params: ModelListParams) {
  const conditions = [eq(models.status, "published")];

  if (params.profileSupplierId) {
    conditions.push(eq(models.profileSupplierId, params.profileSupplierId));
  }

  if (params.search) {
    conditions.push(ilike(models.name, `%${params.search}%`));
  }

  // Build orderBy clause
  const orderByClause = (() => {
    switch (params.sort) {
      case "name-desc":
        return sql`${models.name} DESC`;
      case "price-asc":
        return sql`${models.basePrice} ASC`;
      case "price-desc":
        return sql`${models.basePrice} DESC`;
      default: // "name-asc"
        return sql`${models.name} ASC`;
    }
  })();

  const skip = (params.page - 1) * params.limit;

  const result = await db
    .select({
      // Model fields
      accessoryPrice: models.accessoryPrice,
      basePrice: models.basePrice,
      compatibleGlassTypeIds: models.compatibleGlassTypeIds,
      costPerMmHeight: models.costPerMmHeight,
      costPerMmWidth: models.costPerMmWidth,
      createdAt: models.createdAt,
      id: models.id,
      imageUrl: models.imageUrl,
      maxHeightMm: models.maxHeightMm,
      maxWidthMm: models.maxWidthMm,
      minHeightMm: models.minHeightMm,
      minWidthMm: models.minWidthMm,
      name: models.name,
      profitMarginPercentage: models.profitMarginPercentage,
      status: models.status,
      updatedAt: models.updatedAt,
      // ProfileSupplier fields
      profileSupplierId: profileSuppliers.id,
      profileSupplierName: profileSuppliers.name,
    })
    .from(models)
    .innerJoin(
      profileSuppliers,
      eq(models.profileSupplierId, profileSuppliers.id)
    )
    .where(and(...conditions))
    .orderBy(orderByClause)
    .limit(params.limit)
    .offset(skip);

  return result;
}

// ============================================================================
// Profile Supplier Queries
// ============================================================================

/**
 * List profile suppliers that have published models
 */
export async function listProfileSuppliersWithModels(db: DrizzleDb) {
  // Get distinct profile supplier IDs from published models
  const suppliersWithModels = await db
    .selectDistinct({ profileSupplierId: models.profileSupplierId })
    .from(models)
    .where(eq(models.status, "published"));

  const supplierIds = suppliersWithModels.map((s) => s.profileSupplierId);

  if (supplierIds.length === 0) {
    return [];
  }

  // Get full supplier info for these IDs
  const result = await db
    .select({
      id: profileSuppliers.id,
      name: profileSuppliers.name,
    })
    .from(profileSuppliers)
    .where(
      and(
        eq(profileSuppliers.isActive, "true"), // isActive is stored as text "true"/"false"
        inArray(
          profileSuppliers.id,
          supplierIds.filter((id): id is string => id !== null)
        )
      )
    )
    .orderBy(sql`${profileSuppliers.name} ASC`);

  return result;
}

// ============================================================================
// Service Queries
// ============================================================================

/**
 * List all services
 */
export async function listServices(db: DrizzleDb) {
  const result = await db
    .select({
      createdAt: services.createdAt,
      id: services.id,
      name: services.name,
      rate: services.rate,
      type: services.type,
      unit: services.unit,
      updatedAt: services.updatedAt,
    })
    .from(services)
    .orderBy(sql`${services.name} ASC`);

  return result;
}

// ============================================================================
// Glass Type Queries
// ============================================================================

/**
 * Find glass types by IDs with characteristics and solutions
 */
export async function findGlassTypesByIds(
  db: DrizzleDb,
  glassTypeIds: string[]
) {
  if (glassTypeIds.length === 0) {
    return [];
  }

  // Get glass types
  const glassTypesData = await db
    .select({
      code: glassTypes.code,
      createdAt: glassTypes.createdAt,
      description: glassTypes.description,
      id: glassTypes.id,
      isActive: glassTypes.isActive,
      isSeeded: glassTypes.isSeeded,
      manufacturer: glassTypes.manufacturer,
      name: glassTypes.name,
      pricePerSqm: glassTypes.pricePerSqm,
      seedVersion: glassTypes.seedVersion,
      series: glassTypes.series,
      thicknessMm: glassTypes.thicknessMm,
      updatedAt: glassTypes.updatedAt,
      uValue: glassTypes.uValue,
    })
    .from(glassTypes)
    .where(inArray(glassTypes.id, glassTypeIds))
    .orderBy(sql`${glassTypes.name} ASC`);

  // Get characteristics for these glass types
  const characteristicsData = await db
    .select({
      glassTypeId: glassTypeCharacteristics.glassTypeId,
      characteristicId: glassCharacteristics.id,
      characteristicName: glassCharacteristics.name,
      characteristicCategory: glassCharacteristics.category,
      characteristicDescription: glassCharacteristics.description,
    })
    .from(glassTypeCharacteristics)
    .innerJoin(
      glassCharacteristics,
      eq(glassTypeCharacteristics.characteristicId, glassCharacteristics.id)
    )
    .where(inArray(glassTypeCharacteristics.glassTypeId, glassTypeIds))
    .orderBy(sql`${glassCharacteristics.name} ASC`);

  // Get solutions for these glass types
  const solutionsData = await db
    .select({
      glassTypeId: glassTypeSolutions.glassTypeId,
      isPrimary: glassTypeSolutions.isPrimary,
      performanceRating: glassTypeSolutions.performanceRating,
      solutionId: glassSolutions.id,
      solutionIcon: glassSolutions.icon,
      solutionKey: glassSolutions.key,
      solutionName: glassSolutions.name,
      solutionNameEs: glassSolutions.nameEs,
      solutionSortOrder: glassSolutions.sortOrder,
    })
    .from(glassTypeSolutions)
    .innerJoin(
      glassSolutions,
      eq(glassTypeSolutions.solutionId, glassSolutions.id)
    )
    .where(inArray(glassTypeSolutions.glassTypeId, glassTypeIds))
    .orderBy(
      sql`${glassTypeSolutions.isPrimary} DESC, ${glassSolutions.sortOrder} ASC`
    );

  // Combine data
  return glassTypesData.map((glassType) => ({
    ...glassType,
    characteristics: characteristicsData
      .filter((c) => c.glassTypeId === glassType.id)
      .map((c) => ({
        characteristic: {
          category: c.characteristicCategory,
          description: c.characteristicDescription,
          id: c.characteristicId,
          name: c.characteristicName,
        },
      })),
    solutions: solutionsData
      .filter((s) => s.glassTypeId === glassType.id)
      .map((s) => ({
        isPrimary: s.isPrimary,
        performanceRating: s.performanceRating,
        solution: {
          icon: s.solutionIcon,
          id: s.solutionId,
          key: s.solutionKey,
          name: s.solutionName,
          nameEs: s.solutionNameEs,
          sortOrder: s.solutionSortOrder,
        },
      })),
  }));
}

/**
 * Find glass types compatible with a model
 */
export async function findCompatibleGlassTypes(db: DrizzleDb, modelId: string) {
  // Get model's compatible glass type IDs
  const modelData = await db
    .select({ compatibleGlassTypeIds: models.compatibleGlassTypeIds })
    .from(models)
    .where(eq(models.id, modelId))
    .limit(1);

  const model = modelData[0];
  if (!model || model.compatibleGlassTypeIds.length === 0) {
    return [];
  }

  // Get glass types
  const result = await db
    .select({
      description: glassTypes.description,
      id: glassTypes.id,
      name: glassTypes.name,
      pricePerSqm: glassTypes.pricePerSqm,
      thicknessMm: glassTypes.thicknessMm,
    })
    .from(glassTypes)
    .where(inArray(glassTypes.id, model.compatibleGlassTypeIds))
    .orderBy(sql`${glassTypes.pricePerSqm} ASC`); // Cheapest first

  return result;
}

// ============================================================================
// Glass Solution Queries
// ============================================================================

/**
 * Find glass solution by slug with glass types
 */
export async function findGlassSolutionBySlug(db: DrizzleDb, slug: string) {
  // Get solution
  const solutionData = await db
    .select({
      description: glassSolutions.description,
      icon: glassSolutions.icon,
      id: glassSolutions.id,
      isActive: glassSolutions.isActive,
      key: glassSolutions.key,
      name: glassSolutions.name,
      nameEs: glassSolutions.nameEs,
      slug: glassSolutions.slug,
      sortOrder: glassSolutions.sortOrder,
    })
    .from(glassSolutions)
    .where(
      and(eq(glassSolutions.slug, slug), eq(glassSolutions.isActive, true))
    )
    .limit(1);

  const solution = solutionData[0];
  if (!solution) {
    return null;
  }

  // Get glass types for this solution
  const glassTypesData = await db
    .select({
      glassTypeCode: glassTypes.code,
      glassTypeId: glassTypes.id,
      glassTypeName: glassTypes.name,
      glassTypePricePerSqm: glassTypes.pricePerSqm,
      glassTypeThicknessMm: glassTypes.thicknessMm,
      isPrimary: glassTypeSolutions.isPrimary,
      performanceRating: glassTypeSolutions.performanceRating,
    })
    .from(glassTypeSolutions)
    .innerJoin(glassTypes, eq(glassTypeSolutions.glassTypeId, glassTypes.id))
    .where(eq(glassTypeSolutions.solutionId, solution.id))
    .orderBy(sql`${glassTypeSolutions.performanceRating} DESC`);

  return {
    ...solution,
    glassTypes: glassTypesData.map((gt) => ({
      code: gt.glassTypeCode,
      id: gt.glassTypeId,
      isPrimary: gt.isPrimary,
      name: gt.glassTypeName,
      performanceRating: gt.performanceRating,
      pricePerSqm: gt.glassTypePricePerSqm,
      thicknessMm: gt.glassTypeThicknessMm,
    })),
  };
}

/**
 * List glass solutions with pagination and search
 */
export async function listGlassSolutions(
  db: DrizzleDb,
  params: GlassSolutionListParams
) {
  const conditions = [eq(glassSolutions.isActive, true)];

  if (params.search) {
    conditions.push(
      sql`(${ilike(glassSolutions.key, `%${params.search}%`)} OR ${ilike(
        glassSolutions.name,
        `%${params.search}%`
      )} OR ${ilike(glassSolutions.nameEs, `%${params.search}%`)})`
    );
  }

  const skip = (params.page - 1) * params.limit;

  const result = await db
    .select({
      description: glassSolutions.description,
      icon: glassSolutions.icon,
      id: glassSolutions.id,
      isActive: glassSolutions.isActive,
      key: glassSolutions.key,
      name: glassSolutions.name,
      nameEs: glassSolutions.nameEs,
      slug: glassSolutions.slug,
      sortOrder: glassSolutions.sortOrder,
    })
    .from(glassSolutions)
    .where(and(...conditions))
    .orderBy(sql`${glassSolutions.sortOrder} ASC`)
    .limit(params.limit)
    .offset(skip);

  return result;
}

/**
 * List all active glass solutions (no pagination)
 */
export async function listAllGlassSolutions(db: DrizzleDb) {
  const result = await db
    .select({
      createdAt: glassSolutions.createdAt,
      description: glassSolutions.description,
      icon: glassSolutions.icon,
      id: glassSolutions.id,
      isActive: glassSolutions.isActive,
      key: glassSolutions.key,
      name: glassSolutions.name,
      nameEs: glassSolutions.nameEs,
      slug: glassSolutions.slug,
      sortOrder: glassSolutions.sortOrder,
      updatedAt: glassSolutions.updatedAt,
    })
    .from(glassSolutions)
    .where(eq(glassSolutions.isActive, true))
    .orderBy(sql`${glassSolutions.sortOrder} ASC`);

  return result;
}

// ============================================================================
// Model Color Queries
// ============================================================================

/**
 * List colors available for a specific model
 */
export async function listModelColors(db: DrizzleDb, modelId: string) {
  const { colors, modelColors } = await import("@/server/db/schema");
  
  const result = await db
    .select({
      id: modelColors.id,
      colorId: colors.id,
      colorName: colors.name,
      hexCode: colors.hexCode,
      ralCode: colors.ralCode,
      surchargePercentage: modelColors.surchargePercentage,
      isDefault: modelColors.isDefault,
    })
    .from(modelColors)
    .innerJoin(colors, eq(modelColors.colorId, colors.id))
    .where(and(
      eq(modelColors.modelId, modelId),
      eq(colors.isActive, true)
    ))
    .orderBy(modelColors.isDefault); // Default color first

  return result;
}
