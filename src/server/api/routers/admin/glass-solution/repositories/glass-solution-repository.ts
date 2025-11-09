/**
 * Glass Solution Repository - Data Access Layer (Drizzle)
 *
 * Solo acceso a datos, sin lógica de negocio ni validaciones
 *
 * @module server/api/routers/admin/glass-solution/repositories/glass-solution-repository
 */
import { and, eq, ilike, or, type SQL, sql } from "drizzle-orm";
import type { db } from "@/server/db/drizzle";
import { glassSolutions } from "@/server/db/schemas/glass-solution.schema";

// Type inference from Drizzle db instance
export type DbClient = typeof db;

/**
 * Find glass solution by ID
 */
export async function findGlassSolutionById(client: DbClient, id: string) {
  const [solution] = await client
    .select()
    .from(glassSolutions)
    .where(eq(glassSolutions.id, id));
  return solution ?? null;
}

/**
 * List glass solutions with filters, sorting, and pagination
 */
export async function findGlassSolutions(
  client: DbClient,
  {
    search,
    isActive,
    page = 1,
    limit = 20,
  }: {
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }
) {
  // Build where clause
  const conditions: (SQL<unknown> | undefined)[] = [];
  if (search) {
    conditions.push(
      or(
        ilike(glassSolutions.key, `%${search}%`),
        ilike(glassSolutions.name, `%${search}%`),
        ilike(glassSolutions.nameEs, `%${search}%`)
      )
    );
  }
  if (isActive !== undefined) {
    conditions.push(eq(glassSolutions.isActive, isActive));
  }
  const where = conditions.length
    ? and(...conditions.filter(Boolean))
    : undefined;

  // Solo se permite ordenar por sortOrder (número)
  const orderCol = glassSolutions.sortOrder;

  // Get total count
  const total = await countGlassSolutions(client, { search, isActive });

  // Get paginated items
  const items = await client
    .select()
    .from(glassSolutions)
    .where(where)
    .orderBy(orderCol)
    .limit(limit)
    .offset((page - 1) * limit);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Count glass solutions matching filters
 */
export async function countGlassSolutions(
  client: DbClient,
  { search, isActive }: { search?: string; isActive?: boolean }
) {
  // Build where clause
  const conditions: (SQL<unknown> | undefined)[] = [];
  if (search) {
    conditions.push(
      or(
        ilike(glassSolutions.key, `%${search}%`),
        ilike(glassSolutions.name, `%${search}%`),
        ilike(glassSolutions.nameEs, `%${search}%`)
      )
    );
  }
  if (isActive !== undefined) {
    conditions.push(eq(glassSolutions.isActive, isActive));
  }
  const where = conditions.length
    ? and(...conditions.filter(Boolean))
    : undefined;

  const [result] = await client
    .select({ count: sql<number>`count(*)` })
    .from(glassSolutions)
    .where(where);
  return Number(result?.count ?? 0);
}

/**
 * Create new glass solution
 */
export async function createGlassSolution(
  client: DbClient,
  data: Omit<typeof glassSolutions.$inferInsert, "id"> & { id?: string }
) {
  const [solution] = await client
    .insert(glassSolutions)
    .values(data)
    .returning();
  return solution;
}

/**
 * Update glass solution
 */
export async function updateGlassSolution(
  client: DbClient,
  id: string,
  data: Partial<typeof glassSolutions.$inferInsert>
) {
  const [solution] = await client
    .update(glassSolutions)
    .set(data)
    .where(eq(glassSolutions.id, id))
    .returning();
  return solution ?? null;
}

/**
 * Delete glass solution
 */
export async function deleteGlassSolution(client: DbClient, id: string) {
  const [solution] = await client
    .delete(glassSolutions)
    .where(eq(glassSolutions.id, id))
    .returning();
  return solution ?? null;
}
