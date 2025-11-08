/**
 * Colors Service - Business Logic Layer
 *
 * Orchestrates data access and applies business rules.
 * Implements three-tier deletion strategy:
 * - Tier 1: Prevent deletion if used in quotes (hard constraint)
 * - Tier 2: Soft delete if used in models (isActive = false)
 * - Tier 3: Hard delete if no references exist
 *
 * @module server/api/routers/admin/colors/colors.service
 */
import { TRPCError } from "@trpc/server";
import type { db } from "@/server/db/drizzle";
import type {
  ColorDetailOutput,
  ColorListOutput,
  ColorOutput,
  ColorWithUsageOutput,
  CreateInput,
  DeleteResultOutput,
  GetListInput,
  UpdateInput,
  UsageCheckOutput,
} from "./colors.schemas";
import {
  countColors,
  createColor as createColorRepo,
  deleteColor as deleteColorRepo,
  findColorById,
  findColorByIdWithModels,
  findColorByIdWithUsage,
  findColorByNameAndHexCode,
  findColors,
  getColorUsageCounts,
  updateColor as updateColorRepo,
} from "./repositories/colors-repository";
import {
  logColorCreated,
  logColorCreateError,
  logColorCreateStart,
  logColorDeleteError,
  logColorDeleteStart,
  logColorFetchError,
  logColorFetchStart,
  logColorFetchSuccess,
  logColorHardDeleted,
  logColorListError,
  logColorListStart,
  logColorListSuccess,
  logColorSoftDeleted,
  logColorUpdated,
  logColorUpdateError,
  logColorUpdateStart,
  logUsageCheckError,
  logUsageCheckStart,
  logUsageCheckSuccess,
} from "./utils/colors-logger";

// Type inference from Drizzle db instance
type DbClient = typeof db;

// ============================================================================
// LIST OPERATIONS
// ============================================================================

/**
 * Get paginated colors list with optional filters
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - List parameters (pagination, filters, sorting)
 * @returns Paginated colors with usage statistics
 * @throws TRPCError if database operation fails
 */
export async function getColorsList(
  client: DbClient,
  userId: string,
  input: GetListInput
): Promise<ColorListOutput> {
  try {
    logColorListStart(userId, {
      search: input.search,
      isActive: input.isActive,
      page: input.page,
    });

    // Count total matching records
    const total = await countColors(client, {
      search: input.search,
      isActive: input.isActive,
    });

    // Calculate pagination
    const totalPages = Math.ceil(total / input.limit);

    // Fetch paginated colors
    const colors = await findColors(client, {
      page: input.page,
      limit: input.limit,
      search: input.search,
      isActive: input.isActive,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    });

    logColorListSuccess(userId, colors.length, total, input.page);

    return {
      items: colors,
      total,
      page: input.page,
      limit: input.limit,
      totalPages,
    };
  } catch (error) {
    logColorListError(userId, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al obtener la lista de colores",
    });
  }
}

// ============================================================================
// GET BY ID OPERATIONS
// ============================================================================

/**
 * Get single color by ID with usage statistics
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param colorId - Color ID
 * @returns Color with usage counts
 * @throws TRPCError if not found or database error
 */
export async function getColorById(
  client: DbClient,
  userId: string,
  colorId: string
): Promise<ColorWithUsageOutput> {
  try {
    logColorFetchStart(userId, colorId);

    const color = await findColorByIdWithUsage(client, colorId);

    if (!color) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Color no encontrado",
      });
    }

    logColorFetchSuccess(userId, colorId);

    return color;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logColorFetchError(userId, colorId, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al obtener el color",
    });
  }
}

/**
 * Get color detail with related models
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param colorId - Color ID
 * @returns Color with usage counts and first 10 related models
 * @throws TRPCError if not found or database error
 */
export async function getColorDetail(
  client: DbClient,
  userId: string,
  colorId: string
): Promise<ColorDetailOutput> {
  try {
    logColorFetchStart(userId, colorId);

    const color = await findColorByIdWithModels(client, colorId);

    if (!color) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Color no encontrado",
      });
    }

    logColorFetchSuccess(userId, colorId);

    return color;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logColorFetchError(userId, colorId, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al obtener el detalle del color",
    });
  }
}

// ============================================================================
// CREATE OPERATIONS
// ============================================================================

/**
 * Create new color
 * Validates duplicate name+hexCode combination
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - Color data
 * @returns Created color
 * @throws TRPCError if duplicate found or database error
 */
export async function createColor(
  client: DbClient,
  userId: string,
  input: CreateInput
): Promise<ColorOutput> {
  try {
    logColorCreateStart(userId, { name: input.name, hexCode: input.hexCode });

    // Check for duplicate name+hexCode combination
    const existing = await findColorByNameAndHexCode(
      client,
      input.name,
      input.hexCode
    );

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Ya existe un color con este nombre y código hexadecimal",
      });
    }

    const color = await createColorRepo(client, {
      name: input.name,
      ralCode: input.ralCode ?? null,
      hexCode: input.hexCode,
      isActive: input.isActive ?? true,
    });

    if (!color) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al crear el color",
      });
    }

    logColorCreated(userId, color.id, color.name, color.hexCode);

    return color;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logColorCreateError(
      userId,
      { name: input.name, hexCode: input.hexCode },
      error
    );
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al crear el color",
    });
  }
}

// ============================================================================
// UPDATE OPERATIONS
// ============================================================================

/**
 * Update existing color
 * Validates duplicate name+hexCode if changed
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - Update data with color ID
 * @returns Updated color
 * @throws TRPCError if not found, duplicate, or database error
 */
export async function updateColor(
  client: DbClient,
  userId: string,
  input: UpdateInput
): Promise<ColorOutput> {
  try {
    const { id, ...data } = input;

    logColorUpdateStart(userId, id, data);

    // Check if color exists
    const existing = await findColorById(client, id);

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Color no encontrado",
      });
    }

    // Check for duplicate if name or hexCode changed
    if (data.name || data.hexCode) {
      const duplicate = await findColorByNameAndHexCode(
        client,
        data.name ?? existing.name,
        data.hexCode ?? existing.hexCode,
        id // Exclude current color
      );

      if (duplicate) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ya existe un color con este nombre y código hexadecimal",
        });
      }
    }

    const updated = await updateColorRepo(client, id, data);

    if (!updated) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al actualizar el color",
      });
    }

    logColorUpdated(userId, id, data);

    return updated;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logColorUpdateError(userId, input.id, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al actualizar el color",
    });
  }
}

// ============================================================================
// DELETE OPERATIONS (THREE-TIER STRATEGY)
// ============================================================================

/**
 * Delete color using three-tier strategy
 *
 * Strategy:
 * - Tier 1: If used in quote items → PREVENT deletion (throw error)
 * - Tier 2: If used in models → SOFT DELETE (isActive = false)
 * - Tier 3: If no references → HARD DELETE (remove from database)
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param colorId - Color ID to delete
 * @returns Deletion result with action type
 * @throws TRPCError if not found, in use in quotes, or database error
 */
export async function deleteColor(
  client: DbClient,
  userId: string,
  colorId: string
): Promise<DeleteResultOutput> {
  try {
    logColorDeleteStart(userId, colorId);

    // Get color with usage counts
    const color = await findColorByIdWithUsage(client, colorId);

    if (!color) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Color no encontrado",
      });
    }

    // TIER 1: Prevent deletion if used in quotes (hard constraint)
    if (color.quoteItemCount > 0) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: `No se puede eliminar. Color usado en ${color.quoteItemCount} cotización(es)`,
      });
    }

    // TIER 2: Soft delete if used in models
    if (color.modelCount > 0) {
      const softDeleted = await updateColorRepo(client, colorId, {
        isActive: false,
      });

      if (!softDeleted) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al desactivar el color",
        });
      }

      logColorSoftDeleted(userId, colorId, color.modelCount);

      return {
        success: true,
        action: "soft_delete",
        message: `Color desactivado. Usado en ${color.modelCount} modelo(s)`,
        color: softDeleted,
      };
    }

    // TIER 3: Hard delete if no references
    const hardDeleted = await deleteColorRepo(client, colorId);

    if (!hardDeleted) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al eliminar el color",
      });
    }

    logColorHardDeleted(userId, colorId);

    return {
      success: true,
      action: "hard_delete",
      message: "Color eliminado exitosamente",
      color: null,
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logColorDeleteError(userId, colorId, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al eliminar el color",
    });
  }
}

// ============================================================================
// USAGE CHECK OPERATIONS
// ============================================================================

/**
 * Check color usage statistics
 * Used to determine deletion strategy before attempting delete
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param colorId - Color ID
 * @returns Usage counts and deletion flags
 * @throws TRPCError if not found or database error
 */
export async function checkColorUsage(
  client: DbClient,
  userId: string,
  colorId: string
): Promise<UsageCheckOutput> {
  try {
    logUsageCheckStart(userId, colorId);

    // Verify color exists
    const color = await findColorById(client, colorId);

    if (!color) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Color no encontrado",
      });
    }

    // Get usage counts
    const { modelCount, quoteItemCount } = await getColorUsageCounts(
      client,
      colorId
    );

    logUsageCheckSuccess(userId, colorId, modelCount, quoteItemCount);

    return {
      modelCount,
      quoteItemCount,
      canDelete: quoteItemCount === 0, // Can delete (soft or hard) if not in quotes
      canHardDelete: quoteItemCount === 0 && modelCount === 0, // Can hard delete only if no references
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logUsageCheckError(userId, colorId, error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al verificar el uso del color",
    });
  }
}
