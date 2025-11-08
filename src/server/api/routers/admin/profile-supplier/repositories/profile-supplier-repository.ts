/**
 * Profile Supplier Repository - Data Access Layer
 *
 * Pure database operations using Drizzle ORM.
 * No business logic, no error handling, no logging.
 *
 * @module server/api/routers/admin/profile-supplier/repositories/profile-supplier-repository
 */
import { and, count, desc, eq, ilike, ne, type SQL } from "drizzle-orm";
import type { db } from "@/server/db/drizzle";
import { models, profileSuppliers } from "@/server/db/schema";
import type { MaterialType } from "@/server/db/schemas/enums.schema";

// Type inference from Drizzle db instance
type DbClient = typeof db;

/**
 * Find profile supplier by ID
 *
 * @param client - Drizzle client instance
 * @param supplierId - Profile supplier ID
 * @returns Profile supplier or null
 */
export async function findProfileSupplierById(
  client: DbClient,
  supplierId: string
) {
  return await client
    .select()
    .from(profileSuppliers)
    .where(eq(profileSuppliers.id, supplierId))
    .then((rows) => rows[0] ?? null);
}

/**
 * Find profile supplier by ID with usage count
 *
 * @param client - Drizzle client instance
 * @param supplierId - Profile supplier ID
 * @returns Profile supplier with model count or null
 */
export async function findProfileSupplierByIdWithUsage(
  client: DbClient,
  supplierId: string
) {
  const supplier = await findProfileSupplierById(client, supplierId);
  if (!supplier) {
    return null;
  }

  // Count models using this supplier
  const modelCountResult = await client
    .select({ count: count() })
    .from(models)
    .where(eq(models.profileSupplierId, supplierId))
    .then((rows) => rows[0]?.count ?? 0);

  return {
    ...supplier,
    modelCount: modelCountResult,
  };
}

/**
 * Find profile supplier by name and material type (case-insensitive, exact match)
 *
 * @param client - Drizzle client instance
 * @param name - Profile supplier name
 * @param materialType - Material type
 * @param excludeId - Optional ID to exclude from results (for update checks)
 * @returns Profile supplier or null
 */
export async function findProfileSupplierByName(
  client: DbClient,
  name: string,
  materialType: MaterialType,
  excludeId?: string
) {
  const conditions: SQL[] = [
    eq(profileSuppliers.name, name),
    eq(profileSuppliers.materialType, materialType),
  ];

  if (excludeId) {
    conditions.push(ne(profileSuppliers.id, excludeId));
  }

  return await client
    .select()
    .from(profileSuppliers)
    .where(and(...conditions))
    .then((rows) => rows[0] ?? null);
}

/**
 * Count profile suppliers matching filters
 *
 * @param client - Drizzle client instance
 * @param filters - Search filters
 * @returns Total count
 */
export async function countProfileSuppliers(
  client: DbClient,
  filters: {
    search?: string;
    materialType?: MaterialType;
    isActive?: "all" | "active" | "inactive";
  }
) {
  const conditions: SQL[] = [];

  if (filters.search) {
    conditions.push(ilike(profileSuppliers.name, `%${filters.search}%`));
  }

  if (filters.materialType) {
    conditions.push(eq(profileSuppliers.materialType, filters.materialType));
  }

  if (filters.isActive && filters.isActive !== "all") {
    const isActiveValue = filters.isActive === "active" ? "true" : "false";
    conditions.push(eq(profileSuppliers.isActive, isActiveValue));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await client
    .select({ count: count() })
    .from(profileSuppliers)
    .where(whereClause)
    .then((rows) => rows[0]?.count ?? 0);
}

/**
 * Find profile suppliers with pagination and filters
 *
 * @param client - Drizzle client instance
 * @param options - Query options
 * @returns Array of profile suppliers with usage counts
 */
export async function findProfileSuppliers(
  client: DbClient,
  options: {
    page: number;
    limit: number;
    search?: string;
    materialType?: MaterialType;
    isActive?: "all" | "active" | "inactive";
    sortBy: "name" | "materialType" | "createdAt";
    sortOrder: "asc" | "desc";
  }
) {
  const conditions: SQL[] = [];

  if (options.search) {
    conditions.push(ilike(profileSuppliers.name, `%${options.search}%`));
  }

  if (options.materialType) {
    conditions.push(eq(profileSuppliers.materialType, options.materialType));
  }

  if (options.isActive && options.isActive !== "all") {
    const isActiveValue = options.isActive === "active" ? "true" : "false";
    conditions.push(eq(profileSuppliers.isActive, isActiveValue));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const skip = (options.page - 1) * options.limit;

  // Determine sort column
  let orderColumn:
    | typeof profileSuppliers.name
    | typeof profileSuppliers.materialType
    | typeof profileSuppliers.createdAt;
  if (options.sortBy === "name") {
    orderColumn = profileSuppliers.name;
  } else if (options.sortBy === "materialType") {
    orderColumn = profileSuppliers.materialType;
  } else {
    orderColumn = profileSuppliers.createdAt;
  }

  const orderFn = options.sortOrder === "desc" ? desc : undefined;

  // Fetch suppliers
  const supplierRows = await client
    .select()
    .from(profileSuppliers)
    .where(whereClause)
    .orderBy(orderFn ? orderFn(orderColumn) : orderColumn)
    .limit(options.limit)
    .offset(skip);

  // Get usage counts for each supplier
  const suppliersWithUsage = await Promise.all(
    supplierRows.map(async (supplier) => {
      const modelCountResult = await client
        .select({ count: count() })
        .from(models)
        .where(eq(models.profileSupplierId, supplier.id))
        .then((rows) => rows[0]?.count ?? 0);

      return {
        ...supplier,
        modelCount: modelCountResult,
      };
    })
  );

  return suppliersWithUsage;
}

/**
 * Create new profile supplier
 *
 * @param client - Drizzle client instance
 * @param data - Profile supplier data
 * @returns Created profile supplier
 */
export async function createProfileSupplier(
  client: DbClient,
  data: {
    name: string;
    materialType: MaterialType;
    isActive?: string;
    notes?: string | null;
  }
) {
  const [supplier] = await client
    .insert(profileSuppliers)
    .values(data)
    .returning();
  return supplier;
}

/**
 * Update profile supplier
 *
 * @param client - Drizzle client instance
 * @param supplierId - Profile supplier ID
 * @param data - Update data
 * @returns Updated profile supplier or null
 */
export async function updateProfileSupplier(
  client: DbClient,
  supplierId: string,
  data: {
    name?: string;
    materialType?: MaterialType;
    isActive?: string;
    notes?: string | null;
  }
) {
  const [supplier] = await client
    .update(profileSuppliers)
    .set(data)
    .where(eq(profileSuppliers.id, supplierId))
    .returning();
  return supplier ?? null;
}

/**
 * Delete profile supplier (hard delete)
 *
 * @param client - Drizzle client instance
 * @param supplierId - Profile supplier ID
 * @returns Deleted profile supplier or null
 */
export async function deleteProfileSupplier(
  client: DbClient,
  supplierId: string
) {
  const [supplier] = await client
    .delete(profileSuppliers)
    .where(eq(profileSuppliers.id, supplierId))
    .returning();
  return supplier ?? null;
}

/**
 * Get profile supplier usage count
 *
 * @param client - Drizzle client instance
 * @param supplierId - Profile supplier ID
 * @returns Model count
 */
export async function getProfileSupplierUsageCount(
  client: DbClient,
  supplierId: string
) {
  return await client
    .select({ count: count() })
    .from(models)
    .where(eq(models.profileSupplierId, supplierId))
    .then((rows) => rows[0]?.count ?? 0);
}
