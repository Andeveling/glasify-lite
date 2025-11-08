/**
 * Profile Supplier Service - Business Logic Layer
 *
 * Orchestrates data access and applies business rules.
 * Implements three-tier deletion strategy:
 * - Tier 1: Prevent deletion if used in quotes (hard constraint)
 * - Tier 2: Soft delete if used in models (isActive = false)
 * - Tier 3: Hard delete if no references exist
 *
 * @module server/api/routers/admin/profile-supplier/profile-supplier.service
 */
import { TRPCError } from "@trpc/server";
import type { db } from "@/server/db/drizzle";
import type { MaterialType } from "@/server/db/schemas/enums.schema";
import type {
  GetListInput,
  CreateInput,
  UpdateInput,
  ProfileSupplierWithUsageOutput,
  ProfileSupplierListOutput,
  UsageCheckOutput,
} from "./profile-supplier.schemas";
import {
  countProfileSuppliers,
  createProfileSupplier as createProfileSupplierRepo,
  deleteProfileSupplier as deleteProfileSupplierRepo,
  findProfileSupplierById,
  findProfileSupplierByIdWithUsage,
  findProfileSupplierByName,
  findProfileSuppliers,
  getProfileSupplierUsageCount,
  updateProfileSupplier as updateProfileSupplierRepo,
} from "./repositories/profile-supplier-repository";
import {
  logProfileSupplierCreated,
  logProfileSupplierCreateError,
  logProfileSupplierCreateStart,
  logProfileSupplierDeleteError,
  logProfileSupplierDeleted,
  logProfileSupplierDeleteStart,
  logProfileSupplierFetchError,
  logProfileSupplierFetchStart,
  logProfileSupplierFetchSuccess,
  logProfileSupplierListError,
  logProfileSupplierListStart,
  logProfileSupplierListSuccess,
  logProfileSupplierUpdated,
  logProfileSupplierUpdateError,
  logProfileSupplierUpdateStart,
  logProfileSupplierUsageCheckError,
  logProfileSupplierUsageCheckStart,
  logProfileSupplierUsageCheckSuccess,
} from "./utils/profile-supplier-logger";

// Type inference from Drizzle db instance
type DbClient = typeof db;

// ============================================================================
// LIST OPERATIONS
// ============================================================================

/**
 * Get paginated profile suppliers list with optional filters
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - List parameters (pagination, filters, sorting)
 * @returns Paginated profile suppliers with usage statistics
 * @throws TRPCError if database operation fails
 */
export async function getProfileSuppliersList(
  client: DbClient,
  userId: string,
  input: GetListInput
): Promise<ProfileSupplierListOutput> {
  try {
    logProfileSupplierListStart(userId, {
      search: input.search,
      materialType: input.materialType,
      isActive: input.isActive,
      page: input.page,
    });

    // Parse isActive filter - keep as enum string for repository
    const isActiveFilter = input.isActive; // "all" | "active" | "inactive"

    // Count total matching records
    const total = await countProfileSuppliers(client, {
      search: input.search,
      materialType: input.materialType,
      isActive: isActiveFilter,
    });

    // Calculate pagination
    const totalPages = Math.ceil(total / input.limit);

    // Fetch paginated profile suppliers
    const profileSuppliers = await findProfileSuppliers(client, {
      page: input.page,
      limit: input.limit,
      search: input.search,
      materialType: input.materialType,
      isActive: isActiveFilter,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    });

    logProfileSupplierListSuccess(
      userId,
      profileSuppliers.length,
      total,
      input.page
    );

    // Transform isActive from string to boolean
    const transformedItems = profileSuppliers.map((item) => ({
      ...item,
      isActive: item.isActive === "true",
    }));

    return {
      items: transformedItems,
      total,
      page: input.page,
      limit: input.limit,
      totalPages,
    };
  } catch (error) {
    logProfileSupplierListError(userId, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al obtener la lista de proveedores de perfiles",
    });
  }
}

// ============================================================================
// GET BY ID OPERATIONS
// ============================================================================

/**
 * Get single profile supplier by ID with usage statistics
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param profileSupplierId - Profile supplier ID
 * @returns Profile supplier with usage counts
 * @throws TRPCError if not found or database error
 */
export async function getProfileSupplierById(
  client: DbClient,
  userId: string,
  profileSupplierId: string
): Promise<ProfileSupplierWithUsageOutput> {
  try {
    logProfileSupplierFetchStart(userId, profileSupplierId);

    const profileSupplier = await findProfileSupplierByIdWithUsage(
      client,
      profileSupplierId
    );

    if (!profileSupplier) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Proveedor de perfiles no encontrado",
      });
    }

    logProfileSupplierFetchSuccess(userId, profileSupplierId);

    // Transform isActive from string to boolean
    return {
      ...profileSupplier,
      isActive: profileSupplier.isActive === "true",
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logProfileSupplierFetchError(userId, profileSupplierId, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al obtener el proveedor de perfiles",
    });
  }
}

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create new profile supplier
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - Profile supplier data
 * @returns Created profile supplier with usage counts (always 0)
 * @throws TRPCError if duplicate name or database error
 */
export async function createProfileSupplier(
  client: DbClient,
  userId: string,
  input: CreateInput
): Promise<ProfileSupplierWithUsageOutput> {
  try {
    logProfileSupplierCreateStart(userId, {
      name: input.name,
      materialType: input.materialType,
    });

    // Check for duplicate name
    const existing = await findProfileSupplierByName(
      client,
      input.name,
      input.materialType
    );

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Ya existe un proveedor de perfiles con ese nombre y tipo de material",
      });
    }

    // Create profile supplier
    const profileSupplier = await createProfileSupplierRepo(client, {
      ...input,
      isActive: input.isActive !== undefined ? String(input.isActive) : undefined,
    });

    if (!profileSupplier) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al crear el proveedor de perfiles",
      });
    }

    logProfileSupplierCreated(
      userId,
      profileSupplier.id,
      profileSupplier.name,
      profileSupplier.materialType
    );

    // Return with usage count (always 0 for new records)
    return {
      ...profileSupplier,
      isActive: profileSupplier.isActive === "true",
      modelCount: 0,
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logProfileSupplierCreateError(
      userId,
      { name: input.name, materialType: input.materialType },
      error
    );
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al crear el proveedor de perfiles",
    });
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update existing profile supplier
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - Profile supplier ID and updates
 * @returns Updated profile supplier with current usage counts
 * @throws TRPCError if not found, duplicate name, or database error
 */
export async function updateProfileSupplier(
  client: DbClient,
  userId: string,
  input: UpdateInput
): Promise<ProfileSupplierWithUsageOutput> {
  try {
    logProfileSupplierUpdateStart(userId, input.id, {
      name: input.name,
      materialType: input.materialType,
    });

    // Verify profile supplier exists
    const existing = await findProfileSupplierById(client, input.id);

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Proveedor de perfiles no encontrado",
      });
    }

    // Check for duplicate name (excluding current record)
    if (input.name || input.materialType) {
      const checkName = input.name ?? existing.name;
      const checkMaterialType = input.materialType ?? existing.materialType;
      const duplicate = await findProfileSupplierByName(
        client,
        checkName,
        checkMaterialType,
        input.id
      );

      if (duplicate) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ya existe un proveedor de perfiles con ese nombre y tipo de material",
        });
      }
    }

    // Update profile supplier - convert boolean to string for database
    const updateData: {
      name?: string;
      materialType?: MaterialType;
      isActive?: string;
      notes?: string | null;
    } = {
      name: input.name,
      materialType: input.materialType,
      isActive: input.isActive !== undefined ? String(input.isActive) : undefined,
      notes: input.notes,
    };

    const updated = await updateProfileSupplierRepo(client, input.id, updateData);

    if (!updated) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Proveedor de perfiles no encontrado",
      });
    }

    // Get current usage counts
    const modelCount = await getProfileSupplierUsageCount(client, input.id);

    logProfileSupplierUpdated(userId, input.id, {
      name: input.name,
      materialType: input.materialType,
    });

    return {
      ...updated,
      isActive: updated.isActive === "true",
      modelCount,
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logProfileSupplierUpdateError(userId, input.id, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al actualizar el proveedor de perfiles",
    });
  }
}

// ============================================================================
// DELETE OPERATIONS
// ============================================================================

/**
 * Delete profile supplier (soft or hard based on usage)
 *
 * Implements three-tier deletion strategy:
 * - Tier 1: Check quotes (NOT IMPLEMENTED - no direct relation yet)
 * - Tier 2: If used in models → soft delete (isActive = false)
 * - Tier 3: If no references → hard delete
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param profileSupplierId - Profile supplier ID
 * @throws TRPCError if not found, in use in quotes, or database error
 */
export async function deleteProfileSupplier(
  client: DbClient,
  userId: string,
  profileSupplierId: string
): Promise<void> {
  try {
    logProfileSupplierDeleteStart(userId, profileSupplierId);

    // Verify profile supplier exists
    const profileSupplier = await findProfileSupplierById(
      client,
      profileSupplierId
    );

    if (!profileSupplier) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Proveedor de perfiles no encontrado",
      });
    }

    // Check usage in models
    const modelCount = await getProfileSupplierUsageCount(
      client,
      profileSupplierId
    );

    if (modelCount > 0) {
      // Tier 2: Soft delete if used in models
      await updateProfileSupplierRepo(client, profileSupplierId, {
        isActive: "false",
      });
      logProfileSupplierDeleted(userId, profileSupplierId);
    } else {
      // Tier 3: Hard delete if no references
      await deleteProfileSupplierRepo(client, profileSupplierId);
      logProfileSupplierDeleted(userId, profileSupplierId);
    }
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logProfileSupplierDeleteError(userId, profileSupplierId, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al eliminar el proveedor de perfiles",
    });
  }
}

// ============================================================================
// USAGE CHECK OPERATIONS
// ============================================================================

/**
 * Check profile supplier usage in models
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param profileSupplierId - Profile supplier ID
 * @returns Usage statistics with deletion eligibility
 * @throws TRPCError if not found or database error
 */
export async function checkProfileSupplierUsage(
  client: DbClient,
  userId: string,
  profileSupplierId: string
): Promise<UsageCheckOutput> {
  try {
    logProfileSupplierUsageCheckStart(userId, profileSupplierId);

    // Verify profile supplier exists
    const profileSupplier = await findProfileSupplierById(
      client,
      profileSupplierId
    );

    if (!profileSupplier) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Proveedor de perfiles no encontrado",
      });
    }

    // Get usage counts
    const modelCount = await getProfileSupplierUsageCount(
      client,
      profileSupplierId
    );

    const canDelete = modelCount === 0;

    logProfileSupplierUsageCheckSuccess(userId, profileSupplierId, modelCount);

    return {
      modelCount,
      canDelete,
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logProfileSupplierUsageCheckError(userId, profileSupplierId, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al verificar el uso del proveedor de perfiles",
    });
  }
}
