/**
 * Colors Repository - Data Access Layer
 *
 * Pure database operations using Drizzle ORM.
 * No business logic, no error handling, no logging.
 *
 * @module server/api/routers/admin/colors/repositories/colors-repository
 */
import { and, count, desc, eq, ilike, ne, type SQL } from "drizzle-orm";
import type { db } from "@/server/db/drizzle";
import { colors, modelColors, models, quoteItems } from "@/server/db/schema";

// Type inference from Drizzle db instance
type DbClient = typeof db;

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
 * Find color by ID with usage counts
 *
 * @param client - Drizzle client instance
 * @param colorId - Color ID
 * @returns Color with counts or null
 */
export async function findColorByIdWithUsage(
  client: DbClient,
  colorId: string
) {
  // Main color data
  const color = await findColorById(client, colorId);
  if (!color) {
    return null;
  }

  // Count model references
  const modelCountResult = await client
    .select({ count: count() })
    .from(modelColors)
    .where(eq(modelColors.colorId, colorId))
    .then((rows) => rows[0]?.count ?? 0);

  // Count quote item references
  const quoteItemCountResult = await client
    .select({ count: count() })
    .from(quoteItems)
    .where(eq(quoteItems.colorId, colorId))
    .then((rows) => rows[0]?.count ?? 0);

  return {
    ...color,
    modelCount: modelCountResult,
    quoteItemCount: quoteItemCountResult,
  };
}

/**
 * Find color by ID with related models
 *
 * @param client - Drizzle client instance
 * @param colorId - Color ID
 * @returns Color with usage and related models or null
 */
export async function findColorByIdWithModels(
  client: DbClient,
  colorId: string
) {
  // Get color with usage
  const colorWithUsage = await findColorByIdWithUsage(client, colorId);
  if (!colorWithUsage) {
    return null;
  }

  // Get first 10 related models using proper Drizzle join
  const relatedModels = await client
    .select({
      id: modelColors.id,
      name: models.name,
      surchargePercentage: modelColors.surchargePercentage,
      isDefault: modelColors.isDefault,
    })
    .from(modelColors)
    .innerJoin(models, eq(models.id, modelColors.modelId))
    .where(eq(modelColors.colorId, colorId))
    .limit(10);

  return {
    ...colorWithUsage,
    relatedModels: relatedModels.map((m) => ({
      ...m,
      surchargePercentage: Number.parseFloat(m.surchargePercentage),
    })),
  };
}

/**
 * Find color by name and hexCode (for duplicate check)
 *
 * @param client - Drizzle client instance
 * @param name - Color name
 * @param hexCode - Hex code
 * @param excludeId - Optional ID to exclude (for updates)
 * @returns Color or null
 */
export async function findColorByNameAndHexCode(
  client: DbClient,
  name: string,
  hexCode: string,
  excludeId?: string
) {
  const conditions: SQL[] = [
    eq(colors.name, name),
    eq(colors.hexCode, hexCode),
  ];

  if (excludeId) {
    conditions.push(ne(colors.id, excludeId));
  }

  return await client
    .select()
    .from(colors)
    .where(and(...conditions))
    .then((rows) => rows[0] ?? null);
}

/**
 * Count colors matching filters
 *
 * @param client - Drizzle client instance
 * @param filters - Search filters
 * @returns Total count
 */
export async function countColors(
  client: DbClient,
  filters: { search?: string; isActive?: boolean }
) {
  const conditions: SQL[] = [];

  if (filters.search) {
    conditions.push(ilike(colors.name, `%${filters.search}%`));
  }

  if (filters.isActive !== undefined) {
    conditions.push(eq(colors.isActive, filters.isActive));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await client
    .select({ count: count() })
    .from(colors)
    .where(whereClause)
    .then((rows) => rows[0]?.count ?? 0);
}

/**
 * Find colors with pagination and filters
 *
 * @param client - Drizzle client instance
 * @param options - Query options (pagination, filters, sorting)
 * @returns Array of colors with usage counts
 */
export async function findColors(
  client: DbClient,
  options: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    sortBy: "name" | "createdAt";
    sortOrder: "asc" | "desc";
  }
) {
  const conditions: SQL[] = [];

  if (options.search) {
    conditions.push(ilike(colors.name, `%${options.search}%`));
  }

  if (options.isActive !== undefined) {
    conditions.push(eq(colors.isActive, options.isActive));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const skip = (options.page - 1) * options.limit;
  const orderColumn =
    options.sortBy === "name" ? colors.name : colors.createdAt;
  const orderFn = options.sortOrder === "desc" ? desc : undefined;

  // Fetch colors
  const colorRows = await client
    .select()
    .from(colors)
    .where(whereClause)
    .orderBy(orderFn ? orderFn(orderColumn) : orderColumn)
    .limit(options.limit)
    .offset(skip);

  // Get usage counts for each color
  const colorsWithUsage = await Promise.all(
    colorRows.map(async (color) => {
      const modelCountResult = await client
        .select({ count: count() })
        .from(modelColors)
        .where(eq(modelColors.colorId, color.id))
        .then((rows) => rows[0]?.count ?? 0);

      const quoteItemCountResult = await client
        .select({ count: count() })
        .from(quoteItems)
        .where(eq(quoteItems.colorId, color.id))
        .then((rows) => rows[0]?.count ?? 0);

      return {
        ...color,
        modelCount: modelCountResult,
        quoteItemCount: quoteItemCountResult,
      };
    })
  );

  return colorsWithUsage;
}

/**
 * Create new color
 *
 * @param client - Drizzle client instance
 * @param data - Color data
 * @returns Created color
 */
export async function createColor(
  client: DbClient,
  data: {
    name: string;
    ralCode?: string | null;
    hexCode: string;
    isActive?: boolean;
  }
) {
  const [color] = await client.insert(colors).values(data).returning();
  return color;
}

/**
 * Update color
 *
 * @param client - Drizzle client instance
 * @param colorId - Color ID
 * @param data - Update data
 * @returns Updated color or null
 */
export async function updateColor(
  client: DbClient,
  colorId: string,
  data: Partial<{
    name: string;
    ralCode: string | null;
    hexCode: string;
    isActive: boolean;
  }>
) {
  const [color] = await client
    .update(colors)
    .set(data)
    .where(eq(colors.id, colorId))
    .returning();
  return color ?? null;
}

/**
 * Delete color (hard delete)
 *
 * @param client - Drizzle client instance
 * @param colorId - Color ID
 * @returns Deleted color or null
 */
export async function deleteColor(client: DbClient, colorId: string) {
  const [color] = await client
    .delete(colors)
    .where(eq(colors.id, colorId))
    .returning();
  return color ?? null;
}

/**
 * Get color usage counts
 *
 * @param client - Drizzle client instance
 * @param colorId - Color ID
 * @returns Usage counts
 */
export async function getColorUsageCounts(client: DbClient, colorId: string) {
  // Count model references
  const modelCountResult = await client
    .select({ count: count() })
    .from(modelColors)
    .where(eq(modelColors.colorId, colorId))
    .then((rows) => rows[0]?.count ?? 0);

  // Count quote item references
  const quoteItemCountResult = await client
    .select({ count: count() })
    .from(quoteItems)
    .where(eq(quoteItems.colorId, colorId))
    .then((rows) => rows[0]?.count ?? 0);

  return {
    modelCount: modelCountResult,
    quoteItemCount: quoteItemCountResult,
  };
}
