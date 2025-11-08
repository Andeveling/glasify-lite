/**
 * Glass Supplier Service
 *
 * Business logic layer for glass supplier management operations
 *
 * Handles:
 * - CRUD operations with validation
 * - Three-tier deletion strategy (soft delete if in use, hard delete if clean)
 * - Usage tracking via foreign key relationships with glass types
 * - isActive boolean ↔ string transformation for database compatibility
 */

import { TRPCError } from "@trpc/server";
import type { db } from "@/server/db/drizzle";
import type {
  CreateInput,
  GetListInput,
  GlassSupplierListOutput,
  GlassSupplierWithUsageOutput,
  UpdateInput,
  UsageCheckOutput,
} from "./glass-supplier.schemas";
import {
  countGlassSuppliers,
  createGlassSupplier as createGlassSupplierRepo,
  deleteGlassSupplier as deleteGlassSupplierRepo,
  findGlassSupplierById,
  findGlassSupplierByIdWithUsage,
  findGlassSupplierByName,
  findGlassSuppliers,
  getGlassSupplierUsageCount,
  updateGlassSupplier as updateGlassSupplierRepo,
} from "./repositories/glass-supplier-repository";
import {
  logGlassSupplierCreated,
  logGlassSupplierCreateError,
  logGlassSupplierCreateStart,
  logGlassSupplierDeleted,
  logGlassSupplierDeleteError,
  logGlassSupplierDeleteStart,
  logGlassSupplierFetchError,
  logGlassSupplierFetchStart,
  logGlassSupplierFetchSuccess,
  logGlassSupplierListError,
  logGlassSupplierListStart,
  logGlassSupplierListSuccess,
  logGlassSupplierUpdated,
  logGlassSupplierUpdateError,
  logGlassSupplierUpdateStart,
  logGlassSupplierUsageCheckError,
  logGlassSupplierUsageCheckStart,
  logGlassSupplierUsageCheckSuccess,
} from "./utils/glass-supplier-logger";

// Type inference from Drizzle db instance
type DbClient = typeof db;

// ============================================================================
// LIST OPERATIONS
// ============================================================================

/**
 * Get paginated glass suppliers list with optional filters
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - List parameters (pagination, filters, sorting)
 * @returns Paginated glass suppliers with usage statistics
 * @throws TRPCError if database operation fails
 */
export async function getGlassSuppliersList(
  client: DbClient,
  userId: string,
  input: GetListInput
): Promise<GlassSupplierListOutput> {
  try {
    logGlassSupplierListStart(userId, {
      search: input.search,
      country: input.country,
      isActive: input.isActive,
      page: input.page,
    });

    // Parse isActive filter - keep as enum string for repository
    const isActiveFilter = input.isActive; // "all" | "active" | "inactive"

    // Count total matching records
    const total = await countGlassSuppliers(client, {
      search: input.search,
      country: input.country,
      isActive: isActiveFilter,
    });

    // Fetch paginated glass suppliers
    const glassSuppliers = await findGlassSuppliers(client, {
      page: input.page,
      limit: input.limit,
      search: input.search,
      country: input.country,
      isActive: isActiveFilter,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    });

    // Transform isActive string ("true"/"false") to boolean
    const transformedSuppliers = glassSuppliers.map((supplier) => ({
      ...supplier,
      isActive: supplier.isActive === "true",
      tenantConfigId: supplier.tenantConfigId ?? undefined,
      code: supplier.code ?? undefined,
      country: supplier.country ?? undefined,
      website: supplier.website ?? undefined,
      contactEmail: supplier.contactEmail ?? undefined,
      contactPhone: supplier.contactPhone ?? undefined,
      notes: supplier.notes ?? undefined,
    }));

    logGlassSupplierListSuccess(
      userId,
      transformedSuppliers.length,
      total,
      input.page
    );

    const totalPages = Math.ceil(total / input.limit);

    return {
      items: transformedSuppliers,
      total,
      page: input.page,
      limit: input.limit,
      totalPages,
    };
  } catch (error) {
    logGlassSupplierListError(userId, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al obtener lista de proveedores de vidrio",
      cause: error,
    });
  }
}

// ============================================================================
// READ OPERATIONS
// ============================================================================

/**
 * Get single glass supplier by ID with usage statistics
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param supplierId - Glass supplier unique identifier
 * @returns Glass supplier with usage count
 * @throws TRPCError if supplier not found or database error
 */
export async function getGlassSupplierById(
  client: DbClient,
  userId: string,
  supplierId: string
): Promise<GlassSupplierWithUsageOutput> {
  try {
    logGlassSupplierFetchStart(userId, supplierId);

    const supplier = await findGlassSupplierByIdWithUsage(client, supplierId);

    if (!supplier) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Proveedor de vidrio no encontrado",
      });
    }

    // Transform isActive string to boolean
    const transformed = {
      ...supplier,
      isActive: supplier.isActive === "true",
      tenantConfigId: supplier.tenantConfigId ?? undefined,
      code: supplier.code ?? undefined,
      country: supplier.country ?? undefined,
      website: supplier.website ?? undefined,
      contactEmail: supplier.contactEmail ?? undefined,
      contactPhone: supplier.contactPhone ?? undefined,
      notes: supplier.notes ?? undefined,
    };

    logGlassSupplierFetchSuccess(userId, supplierId);

    return transformed;
  } catch (error) {
    logGlassSupplierFetchError(userId, supplierId, error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al obtener proveedor de vidrio",
      cause: error,
    });
  }
}

/**
 * Check usage count for glass supplier (used for delete confirmations)
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param supplierId - Glass supplier unique identifier
 * @returns Usage statistics
 * @throws TRPCError if supplier not found or database error
 */
export async function checkGlassSupplierUsage(
  client: DbClient,
  userId: string,
  supplierId: string
): Promise<UsageCheckOutput> {
  try {
    logGlassSupplierUsageCheckStart(userId, supplierId);

    // Verify supplier exists
    const supplier = await findGlassSupplierById(client, supplierId);
    if (!supplier) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Proveedor de vidrio no encontrado",
      });
    }

    // Get usage count from glass types
    const glassTypeCount = await getGlassSupplierUsageCount(client, supplierId);

    const canDelete = glassTypeCount === 0;

    logGlassSupplierUsageCheckSuccess(userId, supplierId, glassTypeCount);

    return {
      glassTypeCount,
      canDelete,
    };
  } catch (error) {
    logGlassSupplierUsageCheckError(userId, supplierId, error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al verificar uso del proveedor de vidrio",
      cause: error,
    });
  }
}

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create new glass supplier
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - Glass supplier creation data
 * @returns Created glass supplier with usage count
 * @throws TRPCError if name exists or database error
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Business logic requires multiple validation branches
export async function createGlassSupplier(
  client: DbClient,
  userId: string,
  input: CreateInput
): Promise<GlassSupplierWithUsageOutput> {
  try {
    logGlassSupplierCreateStart(userId, {
      name: input.name,
      code: input.code ?? null,
      country: input.country ?? null,
    });

    // Check for duplicate name
    const existing = await findGlassSupplierByName(client, input.name);
    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: `Ya existe un proveedor con el nombre "${input.name}"`,
      });
    }

    // Create supplier (transform isActive boolean to string for DB)
    const created = await createGlassSupplierRepo(client, {
      ...input,
      isActive: input.isActive ? "true" : "false",
    });

    if (!created) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al crear proveedor de vidrio",
      });
    }

    // Transform back to boolean for response
    const transformed = {
      ...created,
      isActive: created.isActive === "true",
      glassTypeCount: 0, // New supplier has no usage
      tenantConfigId: created.tenantConfigId ?? undefined,
      code: created.code ?? undefined,
      country: created.country ?? undefined,
      website: created.website ?? undefined,
      contactEmail: created.contactEmail ?? undefined,
      contactPhone: created.contactPhone ?? undefined,
      notes: created.notes ?? undefined,
    };

    logGlassSupplierCreated(userId, created.id, {
      name: input.name,
      code: input.code ?? null,
      country: input.country ?? null,
    });

    return transformed;
  } catch (error) {
    logGlassSupplierCreateError(
      userId,
      {
        name: input.name,
        code: input.code ?? null,
      },
      error
    );
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al crear proveedor de vidrio",
      cause: error,
    });
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update glass supplier
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - Glass supplier update data
 * @returns Updated glass supplier with usage count
 * @throws TRPCError if not found, name conflict, or database error
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Update logic requires validation and conflict checks
export async function updateGlassSupplier(
  client: DbClient,
  userId: string,
  input: UpdateInput
): Promise<GlassSupplierWithUsageOutput> {
  try {
    logGlassSupplierUpdateStart(userId, input.id, {
      name: input.name,
      code: input.code ?? null,
      country: input.country ?? null,
    });

    // Verify supplier exists
    const existing = await findGlassSupplierById(client, input.id);
    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Proveedor de vidrio no encontrado",
      });
    }

    // Check for name conflict (if name is being changed)
    if (input.name && input.name !== existing.name) {
      const duplicate = await findGlassSupplierByName(client, input.name);
      if (duplicate && duplicate.id !== input.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Ya existe un proveedor con el nombre "${input.name}"`,
        });
      }
    }

    // Transform isActive boolean to string if present
    let isActiveString: string | undefined;
    if (input.isActive !== undefined) {
      isActiveString = input.isActive ? "true" : "false";
    } else {
      isActiveString = undefined;
    }

    // Update supplier
    const updated = await updateGlassSupplierRepo(client, input.id, {
      name: input.name,
      code: input.code,
      country: input.country,
      website: input.website,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      isActive: isActiveString,
      notes: input.notes,
    });

    if (!updated) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Error al actualizar: proveedor de vidrio no encontrado",
      });
    }

    // Get usage count
    const glassTypeCount = await getGlassSupplierUsageCount(client, input.id);

    // Transform back to boolean for response
    const transformed = {
      ...updated,
      isActive: updated.isActive === "true",
      glassTypeCount,
      tenantConfigId: updated.tenantConfigId ?? undefined,
      code: updated.code ?? undefined,
      country: updated.country ?? undefined,
      website: updated.website ?? undefined,
      contactEmail: updated.contactEmail ?? undefined,
      contactPhone: updated.contactPhone ?? undefined,
      notes: updated.notes ?? undefined,
    };

    logGlassSupplierUpdated(userId, input.id, {
      name: input.name,
      code: input.code ?? null,
      country: input.country ?? null,
    });

    return transformed;
  } catch (error) {
    logGlassSupplierUpdateError(userId, input.id, error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al actualizar proveedor de vidrio",
      cause: error,
    });
  }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete glass supplier (three-tier strategy)
 *
 * Three-tier deletion:
 * - Tier 1: Prevent deletion if used in glass types (hard constraint via FK)
 * - Tier 2: Soft delete if used in glass types (isActive = false)
 * - Tier 3: Hard delete if no references exist
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param supplierId - Glass supplier unique identifier
 * @throws TRPCError if not found, used in glass types, or database error
 */
export async function deleteGlassSupplier(
  client: DbClient,
  userId: string,
  supplierId: string
): Promise<void> {
  try {
    logGlassSupplierDeleteStart(userId, supplierId);

    // Verify supplier exists
    const existing = await findGlassSupplierById(client, supplierId);
    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Proveedor de vidrio no encontrado",
      });
    }

    // Check usage in glass types
    const glassTypeCount = await getGlassSupplierUsageCount(client, supplierId);

    // Tier 2: Soft delete if used in glass types
    if (glassTypeCount > 0) {
      await updateGlassSupplierRepo(client, supplierId, {
        isActive: "false",
      });

      logGlassSupplierDeleted(userId, supplierId);

      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: `No se puede eliminar: proveedor usado en ${glassTypeCount} tipo(s) de vidrio. Se ha desactivado en su lugar.`,
      });
    }

    // Tier 3: Hard delete if no references
    await deleteGlassSupplierRepo(client, supplierId);

    logGlassSupplierDeleted(userId, supplierId);
  } catch (error) {
    logGlassSupplierDeleteError(userId, supplierId, error);
    if (error instanceof TRPCError) {
      throw error;
    }
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al eliminar proveedor de vidrio",
      cause: error,
    });
  }
}
