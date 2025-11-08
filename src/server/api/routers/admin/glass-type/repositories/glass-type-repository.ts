/**
 * Glass Type Repository - Data Access Layer
 *
 * Pure data access functions for GlassType entity using Drizzle ORM.
 * No business logic, only database operations.
 *
 * @module server/api/routers/admin/glass-type/repositories/glass-type-repository
 */
import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  lte,
  or,
  type SQL,
} from "drizzle-orm";
import type { db } from "@/server/db/drizzle";
import {
  glassCharacteristics,
  glassSolutions,
  glassTypeCharacteristics,
  glassTypeSolutions,
  glassTypes,
  quoteItems,
} from "@/server/db/schema";

// Type inference from Drizzle db instance
type DbClient = typeof db;

/**
 * Build where conditions for list query
 */
function buildWhereConditions(filters: {
  search?: string;
  solutionId?: string;
  isActive?: boolean;
  thicknessMin?: number;
  thicknessMax?: number;
}): SQL[] {
  const conditions: SQL[] = [];

  // Search by name, code, or description
  if (filters.search) {
    const searchCondition = or(
      ilike(glassTypes.name, `%${filters.search}%`),
      ilike(glassTypes.code, `%${filters.search}%`),
      ilike(glassTypes.description, `%${filters.search}%`)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  // Filter by active status
  if (filters.isActive !== undefined) {
    conditions.push(
      eq(glassTypes.isActive, filters.isActive ? "true" : "false")
    );
  }

  // Filter by thickness range
  if (filters.thicknessMin !== undefined) {
    conditions.push(
      gte(glassTypes.thicknessMm, filters.thicknessMin.toString())
    );
  }

  if (filters.thicknessMax !== undefined) {
    conditions.push(
      lte(glassTypes.thicknessMm, filters.thicknessMax.toString())
    );
  }

  return conditions;
}

/**
 * Find glass type by ID
 */
export async function findGlassTypeById(client: DbClient, id: string) {
  return await client
    .select()
    .from(glassTypes)
    .where(eq(glassTypes.id, id))
    .then((rows) => rows[0] ?? null);
}

/**
 * Find glass type by name
 */
export async function findGlassTypeByName(
  client: DbClient,
  name: string,
  excludeId?: string
) {
  const conditions = [eq(glassTypes.name, name)];
  if (excludeId) {
    conditions.push(eq(glassTypes.id, excludeId));
  }

  return await client
    .select()
    .from(glassTypes)
    .where(excludeId ? and(...conditions) : conditions[0])
    .then((rows) => rows[0] ?? null);
}

/**
 * Find glass type by ID with full details (solutions, characteristics, counts)
 */
export async function findGlassTypeByIdWithDetails(
  client: DbClient,
  id: string
) {
  // Get base glass type
  const glassType = await findGlassTypeById(client, id);
  if (!glassType) {
    return null;
  }

  // Get solutions with details
  const solutions = await client
    .select({
      id: glassTypeSolutions.id,
      glassTypeId: glassTypeSolutions.glassTypeId,
      solutionId: glassTypeSolutions.solutionId,
      performanceRating: glassTypeSolutions.performanceRating,
      isPrimary: glassTypeSolutions.isPrimary,
      createdAt: glassTypeSolutions.createdAt,
      updatedAt: glassTypeSolutions.updatedAt,
      solution: {
        id: glassSolutions.id,
        key: glassSolutions.key,
        name: glassSolutions.name,
        nameEs: glassSolutions.nameEs,
        icon: glassSolutions.icon,
      },
    })
    .from(glassTypeSolutions)
    .innerJoin(
      glassSolutions,
      eq(glassSolutions.id, glassTypeSolutions.solutionId)
    )
    .where(eq(glassTypeSolutions.glassTypeId, id))
    .orderBy(desc(glassTypeSolutions.isPrimary), glassSolutions.sortOrder);

  // Get characteristics with details
  const characteristics = await client
    .select({
      id: glassTypeCharacteristics.id,
      glassTypeId: glassTypeCharacteristics.glassTypeId,
      characteristicId: glassTypeCharacteristics.characteristicId,
      value: glassTypeCharacteristics.value,
      certification: glassTypeCharacteristics.certification,
      notes: glassTypeCharacteristics.notes,
      createdAt: glassTypeCharacteristics.createdAt,
      updatedAt: glassTypeCharacteristics.updatedAt,
      characteristic: {
        id: glassCharacteristics.id,
        key: glassCharacteristics.key,
        name: glassCharacteristics.name,
        nameEs: glassCharacteristics.nameEs,
        category: glassCharacteristics.category,
      },
    })
    .from(glassTypeCharacteristics)
    .innerJoin(
      glassCharacteristics,
      eq(glassCharacteristics.id, glassTypeCharacteristics.characteristicId)
    )
    .where(eq(glassTypeCharacteristics.glassTypeId, id))
    .orderBy(glassCharacteristics.sortOrder);

  // Get counts
  const solutionsCount = await client
    .select({ count: count() })
    .from(glassTypeSolutions)
    .where(eq(glassTypeSolutions.glassTypeId, id))
    .then((rows) => rows[0]?.count ?? 0);

  const characteristicsCount = await client
    .select({ count: count() })
    .from(glassTypeCharacteristics)
    .where(eq(glassTypeCharacteristics.glassTypeId, id))
    .then((rows) => rows[0]?.count ?? 0);

  const quoteItemsCount = await client
    .select({ count: count() })
    .from(quoteItems)
    .where(eq(quoteItems.glassTypeId, id))
    .then((rows) => rows[0]?.count ?? 0);

  return {
    ...glassType,
    solutions,
    characteristics,
    _count: {
      solutions: solutionsCount,
      characteristics: characteristicsCount,
      quoteItems: quoteItemsCount,
    },
  };
}

/**
 * Count glass types matching filters
 */
export async function countGlassTypes(
  client: DbClient,
  filters: {
    search?: string;
    solutionId?: string;
    isActive?: boolean;
    thicknessMin?: number;
    thicknessMax?: number;
  }
) {
  const conditions = buildWhereConditions(filters);

  // If filtering by solution, we need a subquery
  if (filters.solutionId) {
    const glassTypeIds = await client
      .select({ glassTypeId: glassTypeSolutions.glassTypeId })
      .from(glassTypeSolutions)
      .where(eq(glassTypeSolutions.solutionId, filters.solutionId));

    const ids = glassTypeIds.map((row) => row.glassTypeId);
    if (ids.length === 0) {
      return 0;
    }

    const idsCondition = or(...ids.map((id) => eq(glassTypes.id, id)));
    if (idsCondition) {
      conditions.push(idsCondition);
    }
  }

  const query = client.select({ count: count() }).from(glassTypes);

  if (conditions.length > 0) {
    query.where(and(...conditions));
  }

  return await query.then((rows) => rows[0]?.count ?? 0);
}

/**
 * Find glass types with pagination and filters
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex filtering and sorting logic
export async function findGlassTypes(
  client: DbClient,
  params: {
    page: number;
    limit: number;
    search?: string;
    solutionId?: string;
    isActive?: boolean;
    thicknessMin?: number;
    thicknessMax?: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  }
) {
  const conditions = buildWhereConditions(params);
  const offset = (params.page - 1) * params.limit;

  // If filtering by solution, we need a subquery
  if (params.solutionId) {
    const glassTypeIds = await client
      .select({ glassTypeId: glassTypeSolutions.glassTypeId })
      .from(glassTypeSolutions)
      .where(eq(glassTypeSolutions.solutionId, params.solutionId));

    const ids = glassTypeIds.map((row) => row.glassTypeId);
    if (ids.length === 0) {
      return [];
    }

    const idsCondition = or(...ids.map((id) => eq(glassTypes.id, id)));
    if (idsCondition) {
      conditions.push(idsCondition);
    }
  }

  // Build query
  let query = client.select().from(glassTypes);

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  // Apply sorting
  switch (params.sortBy) {
    case "name":
      query = query.orderBy(
        params.sortOrder === "asc" ? glassTypes.name : desc(glassTypes.name)
      ) as typeof query;
      break;
    case "code":
      query = query.orderBy(
        params.sortOrder === "asc" ? glassTypes.code : desc(glassTypes.code)
      ) as typeof query;
      break;
    case "thicknessMm":
      query = query.orderBy(
        params.sortOrder === "asc"
          ? glassTypes.thicknessMm
          : desc(glassTypes.thicknessMm)
      ) as typeof query;
      break;
    case "manufacturer":
      query = query.orderBy(
        params.sortOrder === "asc"
          ? glassTypes.manufacturer
          : desc(glassTypes.manufacturer)
      ) as typeof query;
      break;
    case "createdAt":
      query = query.orderBy(
        params.sortOrder === "asc"
          ? glassTypes.createdAt
          : desc(glassTypes.createdAt)
      ) as typeof query;
      break;
    default:
      query = query.orderBy(glassTypes.name) as typeof query;
  }

  // Get base glass types
  const glassTypesList = await query.limit(params.limit).offset(offset);

  // For each glass type, get solutions count and details
  const result = await Promise.all(
    glassTypesList.map(async (glassType) => {
      const solutions = await client
        .select({
          id: glassTypeSolutions.id,
          glassTypeId: glassTypeSolutions.glassTypeId,
          solutionId: glassTypeSolutions.solutionId,
          performanceRating: glassTypeSolutions.performanceRating,
          isPrimary: glassTypeSolutions.isPrimary,
          solution: {
            id: glassSolutions.id,
            key: glassSolutions.key,
            nameEs: glassSolutions.nameEs,
          },
        })
        .from(glassTypeSolutions)
        .innerJoin(
          glassSolutions,
          eq(glassSolutions.id, glassTypeSolutions.solutionId)
        )
        .where(eq(glassTypeSolutions.glassTypeId, glassType.id))
        .orderBy(desc(glassTypeSolutions.isPrimary), glassSolutions.sortOrder);

      const solutionsCount = solutions.length;

      const characteristicsCount = await client
        .select({ count: count() })
        .from(glassTypeCharacteristics)
        .where(eq(glassTypeCharacteristics.glassTypeId, glassType.id))
        .then((rows) => rows[0]?.count ?? 0);

      const quoteItemsCount = await client
        .select({ count: count() })
        .from(quoteItems)
        .where(eq(quoteItems.glassTypeId, glassType.id))
        .then((rows) => rows[0]?.count ?? 0);

      return {
        ...glassType,
        solutions,
        _count: {
          solutions: solutionsCount,
          characteristics: characteristicsCount,
          quoteItems: quoteItemsCount,
        },
      };
    })
  );

  return result;
}

/**
 * Create glass type
 */
export async function createGlassType(
  client: DbClient,
  data: {
    name: string;
    code: string;
    series?: string;
    manufacturer?: string;
    glassSupplierId?: string;
    thicknessMm: string;
    pricePerSqm: string;
    uValue?: string;
    description?: string;
    solarFactor?: string;
    lightTransmission?: string;
    isActive?: boolean;
    lastReviewDate?: Date;
  }
) {
  return await client
    .insert(glassTypes)
    .values({
      name: data.name,
      code: data.code,
      series: data.series ?? null,
      manufacturer: data.manufacturer ?? null,
      glassSupplierId: data.glassSupplierId ?? null,
      thicknessMm: data.thicknessMm,
      pricePerSqm: data.pricePerSqm,
      uValue: data.uValue ?? null,
      description: data.description ?? null,
      solarFactor: data.solarFactor ?? null,
      lightTransmission: data.lightTransmission ?? null,
      isActive: data.isActive ? "true" : "false",
      lastReviewDate: data.lastReviewDate ?? null,
    })
    .returning()
    .then((rows) => rows[0] ?? null);
}

/**
 * Update glass type
 */
export async function updateGlassType(
  client: DbClient,
  id: string,
  data: Partial<{
    name: string;
    code: string;
    series: string | null;
    manufacturer: string | null;
    glassSupplierId: string | null;
    thicknessMm: string;
    pricePerSqm: string;
    uValue: string | null;
    description: string | null;
    solarFactor: string | null;
    lightTransmission: string | null;
    isActive: boolean;
    lastReviewDate: Date | null;
  }>
) {
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.code !== undefined) {
    updateData.code = data.code;
  }
  if (data.series !== undefined) {
    updateData.series = data.series;
  }
  if (data.manufacturer !== undefined) {
    updateData.manufacturer = data.manufacturer;
  }
  if (data.glassSupplierId !== undefined) {
    updateData.glassSupplierId = data.glassSupplierId;
  }
  if (data.thicknessMm !== undefined) {
    updateData.thicknessMm = data.thicknessMm;
  }
  if (data.pricePerSqm !== undefined) {
    updateData.pricePerSqm = data.pricePerSqm;
  }
  if (data.uValue !== undefined) {
    updateData.uValue = data.uValue;
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }
  if (data.solarFactor !== undefined) {
    updateData.solarFactor = data.solarFactor;
  }
  if (data.lightTransmission !== undefined) {
    updateData.lightTransmission = data.lightTransmission;
  }
  if (data.isActive !== undefined) {
    updateData.isActive = data.isActive ? "true" : "false";
  }
  if (data.lastReviewDate !== undefined) {
    updateData.lastReviewDate = data.lastReviewDate;
  }

  return await client
    .update(glassTypes)
    .set(updateData)
    .where(eq(glassTypes.id, id))
    .returning()
    .then((rows) => rows[0] ?? null);
}

/**
 * Delete glass type
 */
export async function deleteGlassType(client: DbClient, id: string) {
  return await client
    .delete(glassTypes)
    .where(eq(glassTypes.id, id))
    .returning()
    .then((rows) => rows[0] ?? null);
}

/**
 * Find glass solution by ID
 */
export async function findGlassSolutionById(client: DbClient, id: string) {
  return await client
    .select()
    .from(glassSolutions)
    .where(eq(glassSolutions.id, id))
    .then((rows) => rows[0] ?? null);
}

/**
 * Find multiple glass solutions by IDs
 */
export async function findGlassSolutionsByIds(client: DbClient, ids: string[]) {
  if (ids.length === 0) {
    return [];
  }

  const idsCondition = or(...ids.map((id) => eq(glassSolutions.id, id)));
  if (!idsCondition) {
    return [];
  }

  return await client.select().from(glassSolutions).where(idsCondition);
}

/**
 * Find glass characteristic by ID
 */
export async function findGlassCharacteristicById(
  client: DbClient,
  id: string
) {
  return await client
    .select()
    .from(glassCharacteristics)
    .where(eq(glassCharacteristics.id, id))
    .then((rows) => rows[0] ?? null);
}

/**
 * Find multiple glass characteristics by IDs
 */
export async function findGlassCharacteristicsByIds(
  client: DbClient,
  ids: string[]
) {
  if (ids.length === 0) {
    return [];
  }

  const idsCondition = or(...ids.map((id) => eq(glassCharacteristics.id, id)));
  if (!idsCondition) {
    return [];
  }

  return await client.select().from(glassCharacteristics).where(idsCondition);
}

/**
 * Create glass type solutions
 */
export async function createGlassTypeSolutions(
  client: DbClient,
  solutions: Array<{
    glassTypeId: string;
    solutionId: string;
    performanceRating:
      | "basic"
      | "standard"
      | "good"
      | "very_good"
      | "excellent";
    isPrimary: boolean;
  }>
) {
  if (solutions.length === 0) {
    return [];
  }

  return await client.insert(glassTypeSolutions).values(solutions).returning();
}

/**
 * Create glass type characteristics
 */
export async function createGlassTypeCharacteristics(
  client: DbClient,
  characteristics: Array<{
    glassTypeId: string;
    characteristicId: string;
    value?: string | null;
    certification?: string | null;
    notes?: string | null;
  }>
) {
  if (characteristics.length === 0) {
    return [];
  }

  return await client
    .insert(glassTypeCharacteristics)
    .values(characteristics)
    .returning();
}

/**
 * Delete all solutions for a glass type
 */
export async function deleteGlassTypeSolutions(
  client: DbClient,
  glassTypeId: string
) {
  return await client
    .delete(glassTypeSolutions)
    .where(eq(glassTypeSolutions.glassTypeId, glassTypeId))
    .returning();
}

/**
 * Delete all characteristics for a glass type
 */
export async function deleteGlassTypeCharacteristics(
  client: DbClient,
  glassTypeId: string
) {
  return await client
    .delete(glassTypeCharacteristics)
    .where(eq(glassTypeCharacteristics.glassTypeId, glassTypeId))
    .returning();
}

/**
 * Count quote items for a glass type
 */
export async function countQuoteItemsByGlassType(
  client: DbClient,
  glassTypeId: string
) {
  return await client
    .select({ count: count() })
    .from(quoteItems)
    .where(eq(quoteItems.glassTypeId, glassTypeId))
    .then((rows) => rows[0]?.count ?? 0);
}
