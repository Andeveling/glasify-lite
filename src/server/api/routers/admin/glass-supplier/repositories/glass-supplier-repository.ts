/**
 * Glass Supplier Repository - Data Access Layer
 *
 * Pure database operations using Drizzle ORM.
 * No business logic, no error handling, no logging.
 *
 * @module server/api/routers/admin/glass-supplier/repositories/glass-supplier-repository
 */
import { and, count, desc, eq, ilike, ne, or, type SQL } from "drizzle-orm";
import type { db } from "@/server/db/drizzle";
import { glassSuppliers, glassTypes } from "@/server/db/schema";

// Type inference from Drizzle db instance
type DbClient = typeof db;

/**
 * Find glass supplier by ID
 *
 * @param client - Drizzle client instance
 * @param supplierId - Glass supplier ID
 * @returns Glass supplier or null
 */
export async function findGlassSupplierById(
  client: DbClient,
  supplierId: string
) {
  return await client
    .select()
    .from(glassSuppliers)
    .where(eq(glassSuppliers.id, supplierId))
    .then((rows) => rows[0] ?? null);
}

/**
 * Find glass supplier by ID with usage count
 *
 * @param client - Drizzle client instance
 * @param supplierId - Glass supplier ID
 * @returns Glass supplier with glass type count or null
 */
export async function findGlassSupplierByIdWithUsage(
  client: DbClient,
  supplierId: string
) {
  const supplier = await findGlassSupplierById(client, supplierId);
  if (!supplier) {
    return null;
  }

  // Count glass types using this supplier via FK
  const glassTypeCountResult = await client
    .select({ count: count() })
    .from(glassTypes)
    .where(eq(glassTypes.glassSupplierId, supplierId))
    .then((rows) => rows[0]?.count ?? 0);

  return {
    ...supplier,
    glassTypeCount: glassTypeCountResult,
  };
}

/**
 * Find glass supplier by name (case-insensitive, exact match)
 *
 * @param client - Drizzle client instance
 * @param name - Glass supplier name
 * @param excludeId - Optional ID to exclude from results (for update checks)
 * @returns Glass supplier or null
 */
export async function findGlassSupplierByName(
  client: DbClient,
  name: string,
  excludeId?: string
) {
  const conditions: SQL[] = [eq(glassSuppliers.name, name)];

  if (excludeId) {
    conditions.push(ne(glassSuppliers.id, excludeId));
  }

  return await client
    .select()
    .from(glassSuppliers)
    .where(and(...conditions))
    .then((rows) => rows[0] ?? null);
}

/**
 * Find glass supplier by code (case-insensitive, exact match)
 *
 * @param client - Drizzle client instance
 * @param code - Glass supplier code
 * @param excludeId - Optional ID to exclude from results (for update checks)
 * @returns Glass supplier or null
 */
export async function findGlassSupplierByCode(
  client: DbClient,
  code: string,
  excludeId?: string
) {
  const conditions: SQL[] = [eq(glassSuppliers.code, code)];

  if (excludeId) {
    conditions.push(ne(glassSuppliers.id, excludeId));
  }

  return await client
    .select()
    .from(glassSuppliers)
    .where(and(...conditions))
    .then((rows) => rows[0] ?? null);
}

/**
 * Count glass suppliers matching filters
 *
 * @param client - Drizzle client instance
 * @param filters - Search filters
 * @returns Total count
 */
export async function countGlassSuppliers(
  client: DbClient,
  filters: {
    search?: string;
    country?: string;
    isActive?: "all" | "active" | "inactive";
  }
) {
  const conditions: SQL[] = [];

  if (filters.search) {
    const searchCondition = or(
      ilike(glassSuppliers.name, `%${filters.search}%`),
      ilike(glassSuppliers.code, `%${filters.search}%`),
      ilike(glassSuppliers.country, `%${filters.search}%`)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (filters.country) {
    conditions.push(ilike(glassSuppliers.country, `%${filters.country}%`));
  }

  if (filters.isActive && filters.isActive !== "all") {
    const isActiveValue = filters.isActive === "active" ? "true" : "false";
    conditions.push(eq(glassSuppliers.isActive, isActiveValue));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await client
    .select({ count: count() })
    .from(glassSuppliers)
    .where(whereClause)
    .then((rows) => rows[0]?.count ?? 0);
}

/**
 * Find glass suppliers with pagination and filters
 *
 * @param client - Drizzle client instance
 * @param options - Query options
 * @returns Array of glass suppliers with usage counts
 */
export async function findGlassSuppliers(
  client: DbClient,
  options: {
    page: number;
    limit: number;
    search?: string;
    country?: string;
    isActive?: "all" | "active" | "inactive";
    sortBy: "name" | "code" | "country" | "createdAt";
    sortOrder: "asc" | "desc";
  }
) {
  const conditions: SQL[] = [];

  if (options.search) {
    const searchCondition = or(
      ilike(glassSuppliers.name, `%${options.search}%`),
      ilike(glassSuppliers.code, `%${options.search}%`),
      ilike(glassSuppliers.country, `%${options.search}%`)
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (options.country) {
    conditions.push(ilike(glassSuppliers.country, `%${options.country}%`));
  }

  if (options.isActive && options.isActive !== "all") {
    const isActiveValue = options.isActive === "active" ? "true" : "false";
    conditions.push(eq(glassSuppliers.isActive, isActiveValue));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const skip = (options.page - 1) * options.limit;

  // Determine sort column
  let orderColumn:
    | typeof glassSuppliers.name
    | typeof glassSuppliers.code
    | typeof glassSuppliers.country
    | typeof glassSuppliers.createdAt;
  if (options.sortBy === "name") {
    orderColumn = glassSuppliers.name;
  } else if (options.sortBy === "code") {
    orderColumn = glassSuppliers.code;
  } else if (options.sortBy === "country") {
    orderColumn = glassSuppliers.country;
  } else {
    orderColumn = glassSuppliers.createdAt;
  }

  const orderFn = options.sortOrder === "desc" ? desc : undefined;

  // Fetch suppliers
  const supplierRows = await client
    .select()
    .from(glassSuppliers)
    .where(whereClause)
    .orderBy(orderFn ? orderFn(orderColumn) : orderColumn)
    .limit(options.limit)
    .offset(skip);

  // Get usage counts for each supplier via FK
  const suppliersWithUsage = await Promise.all(
    supplierRows.map(async (supplier) => {
      const glassTypeCountResult = await client
        .select({ count: count() })
        .from(glassTypes)
        .where(eq(glassTypes.glassSupplierId, supplier.id))
        .then((rows) => rows[0]?.count ?? 0);

      return {
        ...supplier,
        glassTypeCount: glassTypeCountResult,
      };
    })
  );

  return suppliersWithUsage;
}

/**
 * Create new glass supplier
 *
 * @param client - Drizzle client instance
 * @param data - Glass supplier data
 * @returns Created glass supplier
 */
export async function createGlassSupplier(
  client: DbClient,
  data: {
    name: string;
    code?: string | null;
    country?: string | null;
    website?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    isActive?: string;
    notes?: string | null;
    tenantConfigId?: string;
  }
) {
  const [supplier] = await client
    .insert(glassSuppliers)
    .values(data)
    .returning();
  return supplier;
}

/**
 * Update glass supplier
 *
 * @param client - Drizzle client instance
 * @param supplierId - Glass supplier ID
 * @param data - Update data
 * @returns Updated glass supplier or null
 */
export async function updateGlassSupplier(
  client: DbClient,
  supplierId: string,
  data: {
    name?: string;
    code?: string | null;
    country?: string | null;
    website?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    isActive?: string;
    notes?: string | null;
  }
) {
  const [supplier] = await client
    .update(glassSuppliers)
    .set(data)
    .where(eq(glassSuppliers.id, supplierId))
    .returning();
  return supplier ?? null;
}

/**
 * Delete glass supplier (hard delete)
 *
 * @param client - Drizzle client instance
 * @param supplierId - Glass supplier ID
 * @returns Deleted glass supplier or null
 */
export async function deleteGlassSupplier(
  client: DbClient,
  supplierId: string
) {
  const [supplier] = await client
    .delete(glassSuppliers)
    .where(eq(glassSuppliers.id, supplierId))
    .returning();
  return supplier ?? null;
}

/**
 * Get glass supplier usage count
 *
 * @param client - Drizzle client instance
 * @param supplierId - Glass supplier ID
 * @returns Glass type count
 */
export async function getGlassSupplierUsageCount(
  client: DbClient,
  supplierId: string
) {
  return await client
    .select({ count: count() })
    .from(glassTypes)
    .where(eq(glassTypes.glassSupplierId, supplierId))
    .then((rows) => rows[0]?.count ?? 0);
}
