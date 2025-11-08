/**
 * Glass Type Service - Business Logic Layer
 *
 * Orchestrates data access and applies business rules for Glass Types.
 * Handles complex operations with solutions and characteristics.
 *
 * @module server/api/routers/admin/glass-type/glass-type.service
 */
import { TRPCError } from "@trpc/server";
import logger from "@/lib/logger";
import type { db } from "@/server/db/drizzle";
import {
  countGlassTypes,
  countQuoteItemsByGlassType,
  createGlassType,
  createGlassTypeCharacteristics,
  createGlassTypeSolutions,
  deleteGlassType,
  deleteGlassTypeCharacteristics,
  deleteGlassTypeSolutions,
  findGlassCharacteristicsByIds,
  findGlassSolutionsByIds,
  findGlassTypeById,
  findGlassTypeByIdWithDetails,
  findGlassTypeByName,
  findGlassTypes,
  updateGlassType,
} from "./repositories/glass-type-repository";

// Type inference from Drizzle db instance
type DbClient = typeof db;

/**
 * Create glass type with solutions and characteristics
 */
export async function createGlassTypeWithRelations(
  client: DbClient,
  userId: string,
  input: {
    name: string;
    code: string;
    series?: string;
    manufacturer?: string;
    glassSupplierId?: string;
    thicknessMm: number;
    pricePerSqm: number;
    uValue?: number;
    description?: string;
    solarFactor?: number;
    lightTransmission?: number;
    isActive?: boolean;
    lastReviewDate?: Date;
    solutions: Array<{
      solutionId: string;
      performanceRating:
        | "basic"
        | "standard"
        | "good"
        | "very_good"
        | "excellent";
      isPrimary: boolean;
      notes?: string;
    }>;
    characteristics: Array<{
      characteristicId: string;
      value?: string;
      certification?: string;
      notes?: string;
    }>;
  }
) {
  // Check for duplicate name
  const existingByName = await findGlassTypeByName(client, input.name);

  if (existingByName) {
    throw new TRPCError({
      code: "CONFLICT",
      message: "Ya existe un tipo de vidrio con este nombre",
    });
  }

  // Validate all solution IDs exist and are active
  if (input.solutions.length > 0) {
    const solutionIds = input.solutions.map((s) => s.solutionId);
    const foundSolutions = await findGlassSolutionsByIds(client, solutionIds);

    if (foundSolutions.length !== solutionIds.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Una o más soluciones no fueron encontradas",
      });
    }

    const inactiveSolution = foundSolutions.find((s) => !s.isActive);
    if (inactiveSolution) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `La solución "${inactiveSolution.nameEs}" está inactiva`,
      });
    }
  }

  // Validate all characteristic IDs exist and are active
  if (input.characteristics.length > 0) {
    const characteristicIds = input.characteristics.map(
      (c) => c.characteristicId
    );
    const foundCharacteristics = await findGlassCharacteristicsByIds(
      client,
      characteristicIds
    );

    if (foundCharacteristics.length !== characteristicIds.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Una o más características no fueron encontradas",
      });
    }

    const inactiveCharacteristic = foundCharacteristics.find(
      (c) => !c.isActive
    );
    if (inactiveCharacteristic) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `La característica "${inactiveCharacteristic.nameEs}" está inactiva`,
      });
    }
  }

  // Create glass type
  const glassType = await createGlassType(client, {
    name: input.name,
    code: input.code,
    series: input.series,
    manufacturer: input.manufacturer,
    glassSupplierId: input.glassSupplierId,
    thicknessMm: input.thicknessMm.toString(),
    pricePerSqm: input.pricePerSqm.toString(),
    uValue: input.uValue?.toString(),
    description: input.description,
    solarFactor: input.solarFactor?.toString(),
    lightTransmission: input.lightTransmission?.toString(),
    isActive: input.isActive ?? true,
    lastReviewDate: input.lastReviewDate,
  });

  if (!glassType) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al crear el tipo de vidrio",
    });
  }

  // Create solutions
  if (input.solutions.length > 0) {
    await createGlassTypeSolutions(
      client,
      input.solutions.map((sol) => ({
        glassTypeId: glassType.id,
        solutionId: sol.solutionId,
        performanceRating: sol.performanceRating,
        isPrimary: sol.isPrimary,
      }))
    );
  }

  // Create characteristics
  if (input.characteristics.length > 0) {
    await createGlassTypeCharacteristics(
      client,
      input.characteristics.map((char) => ({
        glassTypeId: glassType.id,
        characteristicId: char.characteristicId,
        value: char.value ?? null,
        certification: char.certification ?? null,
        notes: char.notes ?? null,
      }))
    );
  }

  // Fetch complete data
  const result = await findGlassTypeByIdWithDetails(client, glassType.id);

  logger.info("Glass type created", {
    characteristicsCount: input.characteristics.length,
    glassTypeId: glassType.id,
    glassTypeName: glassType.name,
    solutionsCount: input.solutions.length,
    userId,
  });

  return result;
}

/**
 * Update glass type with optional solutions/characteristics replacement
 */
// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex update logic with validations
export async function updateGlassTypeWithRelations(
  client: DbClient,
  userId: string,
  input: {
    id: string;
    data: {
      name?: string;
      code?: string;
      series?: string | null;
      manufacturer?: string | null;
      glassSupplierId?: string | null;
      thicknessMm?: number;
      pricePerSqm?: number;
      uValue?: number | null;
      description?: string | null;
      solarFactor?: number | null;
      lightTransmission?: number | null;
      isActive?: boolean;
      lastReviewDate?: Date | null;
      solutions?: Array<{
        solutionId: string;
        performanceRating:
          | "basic"
          | "standard"
          | "good"
          | "very_good"
          | "excellent";
        isPrimary: boolean;
        notes?: string;
      }>;
      characteristics?: Array<{
        characteristicId: string;
        value?: string;
        certification?: string;
        notes?: string;
      }>;
    };
  }
) {
  const { id, data } = input;

  // Check if exists
  const existing = await findGlassTypeById(client, id);

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Tipo de vidrio no encontrado",
    });
  }

  // Check for duplicate name (excluding current)
  if (data.name) {
    const existingByName = await findGlassTypeByName(client, data.name, id);

    if (existingByName) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Ya existe un tipo de vidrio con este nombre",
      });
    }
  }

  // Validate solutions (if provided)
  if (data.solutions && data.solutions.length > 0) {
    const solutionIds = data.solutions.map((s) => s.solutionId);
    const updatedSolutions = await findGlassSolutionsByIds(client, solutionIds);

    if (updatedSolutions.length !== solutionIds.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Una o más soluciones no fueron encontradas",
      });
    }

    const inactiveSolution = updatedSolutions.find((s) => !s.isActive);
    if (inactiveSolution) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `La solución "${inactiveSolution.nameEs}" está inactiva`,
      });
    }
  }

  // Validate characteristics (if provided)
  if (data.characteristics && data.characteristics.length > 0) {
    const characteristicIds = data.characteristics.map(
      (c) => c.characteristicId
    );
    const updatedCharacteristics = await findGlassCharacteristicsByIds(
      client,
      characteristicIds
    );

    if (updatedCharacteristics.length !== characteristicIds.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Una o más características no fueron encontradas",
      });
    }

    const inactiveCharacteristic = updatedCharacteristics.find(
      (c) => !c.isActive
    );
    if (inactiveCharacteristic) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `La característica "${inactiveCharacteristic.nameEs}" está inactiva`,
      });
    }
  }

  // Update base glass type
  await updateGlassType(client, id, {
    name: data.name,
    code: data.code,
    series: data.series,
    manufacturer: data.manufacturer,
    glassSupplierId: data.glassSupplierId,
    thicknessMm: data.thicknessMm?.toString(),
    pricePerSqm: data.pricePerSqm?.toString(),
    uValue: data.uValue?.toString() ?? null,
    description: data.description,
    solarFactor: data.solarFactor?.toString() ?? null,
    lightTransmission: data.lightTransmission?.toString() ?? null,
    isActive: data.isActive,
    lastReviewDate: data.lastReviewDate,
  });

  // Replace solutions (if provided)
  if (data.solutions !== undefined) {
    // Delete existing
    await deleteGlassTypeSolutions(client, id);

    // Create new
    if (data.solutions.length > 0) {
      await createGlassTypeSolutions(
        client,
        data.solutions.map((sol) => ({
          glassTypeId: id,
          solutionId: sol.solutionId,
          performanceRating: sol.performanceRating,
          isPrimary: sol.isPrimary,
        }))
      );
    }
  }

  // Replace characteristics (if provided)
  if (data.characteristics !== undefined) {
    // Delete existing
    await deleteGlassTypeCharacteristics(client, id);

    // Create new
    if (data.characteristics.length > 0) {
      await createGlassTypeCharacteristics(
        client,
        data.characteristics.map((char) => ({
          glassTypeId: id,
          characteristicId: char.characteristicId,
          value: char.value ?? null,
          certification: char.certification ?? null,
          notes: char.notes ?? null,
        }))
      );
    }
  }

  // Fetch complete updated data
  const result = await findGlassTypeByIdWithDetails(client, id);

  logger.info("Glass type updated", {
    characteristicsReplaced: data.characteristics !== undefined,
    glassTypeId: id,
    glassTypeName: data.name ?? existing.name,
    solutionsReplaced: data.solutions !== undefined,
    userId,
  });

  return result;
}

/**
 * Delete glass type (checks referential integrity)
 */
export async function deleteGlassTypeWithIntegrityCheck(
  client: DbClient,
  userId: string,
  id: string
) {
  // Check if exists
  const existing = await findGlassTypeById(client, id);

  if (!existing) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Tipo de vidrio no encontrado",
    });
  }

  // Check referential integrity - count quote items
  const quoteItemsCount = await countQuoteItemsByGlassType(client, id);

  if (quoteItemsCount > 0) {
    throw new TRPCError({
      code: "CONFLICT",
      message: `No se puede eliminar: El tipo de vidrio está asociado a ${quoteItemsCount} ${quoteItemsCount === 1 ? "ítem de cotización" : "ítems de cotización"}`,
    });
  }

  // Delete glass type (cascades to solutions, characteristics)
  await deleteGlassType(client, id);

  logger.warn("Glass type deleted", {
    glassTypeId: id,
    glassTypeName: existing.name,
    userId,
  });

  return { success: true };
}

/**
 * Get paginated glass types list
 */
export async function getGlassTypesList(
  client: DbClient,
  userId: string,
  input: {
    page: number;
    limit: number;
    search?: string;
    solutionId?: string;
    isActive?: "all" | "active" | "inactive";
    thicknessMin?: number;
    thicknessMax?: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  }
) {
  const { isActive, ...restFilters } = input;

  // Count total matching records
  const total = await countGlassTypes(client, {
    ...restFilters,
    isActive: isActive === "all" ? undefined : isActive === "active",
  });

  // Get paginated items
  const items = await findGlassTypes(client, {
    ...input,
    isActive: isActive === "all" ? undefined : isActive === "active",
  });

  const totalPages = Math.ceil(total / input.limit);

  logger.info("Glass types listed", {
    itemCount: items.length,
    page: input.page,
    total,
    userId,
  });

  return {
    items,
    limit: input.limit,
    page: input.page,
    total,
    totalPages,
  };
}
