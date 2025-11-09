/**
 * Service Repository - Data Access Layer
 *
 * Pure database operations using Drizzle ORM.
 * No business logic, no error handling, no logging.
 *
 * @module server/api/routers/admin/service/repositories/service-repository
 */

import { and, count, desc, eq, ilike, type SQL } from "drizzle-orm";
import type { db } from "@/server/db/drizzle";
import { services } from "@/server/db/schema";

type DbClient = typeof db;

/**
 * Column lookup table - Strategy Pattern
 * Maps sort keys to column references
 */
const SORT_COLUMNS = {
  name: services.name,
  rate: services.rate,
  createdAt: services.createdAt,
  updatedAt: services.updatedAt,
} as const;

/**
 * Build order by expression for sorting
 *
 * Uses Strategy Pattern (lookup table) to eliminate nested conditionals.
 * Returns the appropriate column with direction applied.
 */
function buildOrderByExpression(
  sortBy: keyof typeof SORT_COLUMNS,
  sortOrder: "asc" | "desc"
) {
  const column = SORT_COLUMNS[sortBy];
  return sortOrder === "desc" ? desc(column) : column;
}

/**
 * Find service by ID
 */
export async function findServiceById(client: DbClient, id: string) {
  return await client
    .select()
    .from(services)
    .where(eq(services.id, id))
    .then((rows) => rows[0] ?? null);
}

/**
 * Count services matching filters
 */
export async function countServices(
  client: DbClient,
  filters: {
    search?: string;
    type?: "area" | "perimeter" | "fixed";
    isActive?: boolean;
  }
) {
  const whereConditions: SQL[] = [];

  if (filters.search) {
    whereConditions.push(ilike(services.name, `%${filters.search}%`));
  }

  if (filters.type) {
    whereConditions.push(eq(services.type, filters.type));
  }

  if (filters.isActive !== undefined) {
    whereConditions.push(
      eq(services.isActive, filters.isActive ? "true" : "false")
    );
  }

  const whereClause =
    whereConditions.length > 0 ? and(...whereConditions) : undefined;

  return await client
    .select({ count: count() })
    .from(services)
    .where(whereClause)
    .then((rows) => rows[0]?.count ?? 0);
}

/**
 * Find services with pagination, filtering and sorting
 */
export async function findServices(
  client: DbClient,
  filters: {
    search?: string;
    type?: "area" | "perimeter" | "fixed";
    isActive?: boolean;
    page: number;
    limit: number;
    sortBy: keyof typeof SORT_COLUMNS;
    sortOrder: "asc" | "desc";
  }
) {
  const { page, limit, search, type, isActive, sortBy, sortOrder } = filters;

  const whereConditions: SQL[] = [];

  if (search) {
    whereConditions.push(ilike(services.name, `%${search}%`));
  }

  if (type) {
    whereConditions.push(eq(services.type, type));
  }

  if (isActive !== undefined) {
    whereConditions.push(eq(services.isActive, isActive ? "true" : "false"));
  }

  const whereClause =
    whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const orderByExpression = buildOrderByExpression(sortBy, sortOrder);

  return await client
    .select()
    .from(services)
    .where(whereClause)
    .orderBy(orderByExpression)
    .limit(limit)
    .offset((page - 1) * limit);
}

/**
 * Create service
 */
export async function createService(
  client: DbClient,
  data: {
    name: string;
    type: "area" | "perimeter" | "fixed";
    unit: "sqm" | "ml" | "unit";
    rate: string;
    minimumBillingUnit?: string | null;
    isActive?: string;
  }
) {
  const [service] = await client.insert(services).values(data).returning();
  return service;
}

/**
 * Update service
 */
export async function updateService(
  client: DbClient,
  id: string,
  data: Partial<{
    name: string;
    type: "area" | "perimeter" | "fixed";
    unit: "sqm" | "ml" | "unit";
    rate: string;
    minimumBillingUnit: string | null;
    isActive: string;
  }>
) {
  const [service] = await client
    .update(services)
    .set(data)
    .where(eq(services.id, id))
    .returning();
  return service ?? null;
}

/**
 * Delete service
 */
export async function deleteService(client: DbClient, id: string) {
  const [service] = await client
    .delete(services)
    .where(eq(services.id, id))
    .returning();
  return service ?? null;
}
