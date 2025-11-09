/**
 * Glass Solution Service - Business Logic Layer
 *
 * Orchestrates data access and applies business rules.
 * Handles error management, validation, and structured logging.
 *
 * @module server/api/routers/admin/glass-solution/glass-solution.service
 */
import { TRPCError } from "@trpc/server";
import logger from "@/lib/logger";
import type { db } from "@/server/db/drizzle";
import type {
  CreateProcedureInput,
  CreateProcedureOutput,
  DeleteInput,
  DeleteOutput,
  ListInput,
  ListOutput,
  ReadByIdInput,
  ReadByIdOutput,
  UpdateInput,
  UpdateOutput,
} from "./glass-solution.schemas";
import {
  createGlassSolution,
  deleteGlassSolution,
  findGlassSolutionById,
  findGlassSolutions,
  updateGlassSolution,
} from "./repositories/glass-solution-repository";

// Type inference from Drizzle db instance
type DbClient = typeof db;

const MODULE_PREFIX = "[GlassSolution]";

/**
 * Create glass solution
 *
 * Validates:
 * - Key uniqueness (database constraint)
 * - Slug format and uniqueness (database constraint)
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - Create input with all required fields
 * @returns Created glass solution
 * @throws TRPCError if key already exists or database error
 */
export async function createGlassSolutionService(
  client: DbClient,
  userId: string,
  input: CreateProcedureInput
): Promise<CreateProcedureOutput> {
  try {
    logger.info(`${MODULE_PREFIX} Creating glass solution`, {
      userId,
      key: input.key,
      nameEs: input.nameEs,
    });

    // Check if key already exists
    const existing = await findGlassSolutionById(client, input.key);
    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Ya existe una solución con esta clave",
      });
    }

    // Generate slug from key (snake_case → kebab-case)
    const slug = input.key.replace(/_/g, "-");

    const created = await createGlassSolution(client, {
      ...input,
      slug,
    });

    if (!created) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No se pudo crear la solución",
      });
    }

    logger.info(`${MODULE_PREFIX} Glass solution created successfully`, {
      userId,
      glassSolutionId: created.id,
      key: created.key,
    });

    return created;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error(`${MODULE_PREFIX} Failed to create glass solution`, {
      userId,
      key: input.key,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "No se pudo crear la solución. Intente nuevamente.",
    });
  }
}

/**
 * Get glass solution by ID
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - Input with ID to fetch
 * @returns Glass solution or null if not found
 * @throws TRPCError if database error
 */
export async function getGlassSolutionByIdService(
  client: DbClient,
  userId: string,
  input: ReadByIdInput
): Promise<ReadByIdOutput> {
  try {
    logger.info(`${MODULE_PREFIX} Fetching glass solution by ID`, {
      userId,
      glassSolutionId: input.id,
    });

    const solution = await findGlassSolutionById(client, input.id);

    if (!solution) {
      logger.warn(`${MODULE_PREFIX} Glass solution not found`, {
        userId,
        glassSolutionId: input.id,
      });
      return null;
    }

    logger.info(`${MODULE_PREFIX} Glass solution retrieved`, {
      userId,
      glassSolutionId: solution.id,
    });

    return solution;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error(`${MODULE_PREFIX} Failed to fetch glass solution`, {
      userId,
      glassSolutionId: input.id,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "No se pudo cargar la solución. Intente nuevamente.",
    });
  }
}

/**
 * List glass solutions with pagination, search, and filters
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - List input with pagination, search, isActive filter
 * @returns Paginated list of glass solutions
 * @throws TRPCError if database error
 */
export async function listGlassSolutionsService(
  client: DbClient,
  userId: string,
  input: ListInput
): Promise<ListOutput> {
  try {
    logger.info(`${MODULE_PREFIX} Listing glass solutions`, {
      userId,
      page: input.page,
      limit: input.limit,
      search: input.search ?? undefined,
      isActive: input.isActive ?? undefined,
    });

    // Convert string filter to boolean if needed
    let isActive: boolean | undefined;
    if (input.isActive === "active") {
      isActive = true;
    } else if (input.isActive === "inactive") {
      isActive = false;
    }
    // "all" or undefined means no filter

    const result = await findGlassSolutions(client, {
      isActive,
      limit: input.limit,
      page: input.page,
      search: input.search,
    });

    logger.info(`${MODULE_PREFIX} Glass solutions list retrieved`, {
      userId,
      count: result.items.length,
      total: result.total,
      page: result.page,
    });

    return {
      ...result,
      items: result.items.map((item) => ({
        ...item,
        description: item.description ?? undefined,
        icon: item.icon ?? undefined,
        seedVersion: item.seedVersion ?? undefined,
      })),
    };
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error(`${MODULE_PREFIX} Failed to list glass solutions`, {
      userId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "No se pudieron cargar las soluciones. Intente nuevamente.",
    });
  }
}

/**
 * Update glass solution
 *
 * Validates:
 * - Solution exists
 * - Key uniqueness if updating key
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - Update input with ID and partial data
 * @returns Updated glass solution
 * @throws TRPCError if not found, key conflict, or database error
 */
export async function updateGlassSolutionService(
  client: DbClient,
  userId: string,
  input: UpdateInput
): Promise<UpdateOutput> {
  try {
    logger.info(`${MODULE_PREFIX} Updating glass solution`, {
      userId,
      glassSolutionId: input.id,
    });

    // Check if exists
    const existing = await findGlassSolutionById(client, input.id);
    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Solución de vidrio no encontrada",
      });
    }

    // If updating key, check uniqueness
    if (input.data.key && input.data.key !== existing.key) {
      const conflicting = await findGlassSolutionById(client, input.data.key);
      if (conflicting) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ya existe una solución con esta clave",
        });
      }
    }

    const updated = await updateGlassSolution(client, input.id, input.data);

    if (!updated) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Solución de vidrio no encontrada después de actualizar",
      });
    }

    logger.info(`${MODULE_PREFIX} Glass solution updated successfully`, {
      userId,
      glassSolutionId: updated.id,
      key: updated.key,
    });

    return updated;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error(`${MODULE_PREFIX} Failed to update glass solution`, {
      userId,
      glassSolutionId: input.id,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "No se pudo actualizar la solución. Intente nuevamente.",
    });
  }
}

/**
 * Delete glass solution
 *
 * Validates:
 * - Solution exists
 * - No referential constraints (checked by database foreign keys)
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - Delete input with ID
 * @returns Deleted glass solution
 * @throws TRPCError if not found or database error
 */
export async function deleteGlassSolutionService(
  client: DbClient,
  userId: string,
  input: DeleteInput
): Promise<DeleteOutput> {
  try {
    logger.info(`${MODULE_PREFIX} Deleting glass solution`, {
      userId,
      glassSolutionId: input.id,
    });

    // Check if exists
    const existing = await findGlassSolutionById(client, input.id);
    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Solución de vidrio no encontrada",
      });
    }

    const deleted = await deleteGlassSolution(client, input.id);

    if (!deleted) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Solución de vidrio no encontrada para eliminar",
      });
    }

    logger.info(`${MODULE_PREFIX} Glass solution deleted successfully`, {
      userId,
      glassSolutionId: deleted.id,
      key: deleted.key,
    });

    return deleted;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error(`${MODULE_PREFIX} Failed to delete glass solution`, {
      userId,
      glassSolutionId: input.id,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "No se pudo eliminar la solución. Intente nuevamente.",
    });
  }
}
