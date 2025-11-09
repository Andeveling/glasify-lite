/**
 * Service Service - Business Logic Layer
 *
 * Orchestrates repository operations with business rules and error handling.
 * Converts raw Drizzle types to API output types.
 *
 * @module server/api/routers/admin/service/service.service
 */

import { TRPCError } from "@trpc/server";
import logger from "@/lib/logger";
import type { db } from "@/server/db/drizzle";
import {
  countServices as countServicesRepo,
  createService as createServiceRepo,
  deleteService as deleteServiceRepo,
  findServiceById as findServiceByIdRepo,
  findServices as findServicesRepo,
  updateService as updateServiceRepo,
} from "./repositories/service-repository";
import type {
  ServiceCreateInput,
  ServiceFilterInput,
  ServiceListOutput,
  ServiceOutput,
  ServiceUpdateInput,
} from "./service.schemas";

type DbClient = typeof db;

/**
 * Helper: Build update data - Only include fields that changed
 * Cleaner than: if (input.name) updates.name = input.name;
 */
function buildUpdateData(
  input: ServiceUpdateInput
): Record<string, string | null | undefined> {
  return {
    ...(input.name && { name: input.name }),
    ...(input.type && { type: input.type }),
    ...(input.unit && { unit: input.unit }),
    ...(input.rate && { rate: String(input.rate) }),
    ...(input.minimumBillingUnit !== undefined && {
      minimumBillingUnit: input.minimumBillingUnit
        ? String(input.minimumBillingUnit)
        : null,
    }),
  };
}

/**
 * Serialize service - Convert Drizzle types to API output
 * Handles decimal (string) → number conversion
 */
function serializeService(raw: Record<string, unknown>): ServiceOutput {
  return {
    ...raw,
    rate: Number.parseFloat(String(raw.rate)),
    minimumBillingUnit: raw.minimumBillingUnit
      ? Number.parseFloat(String(raw.minimumBillingUnit))
      : null,
  } as ServiceOutput;
}

/**
 * Get service by ID
 */
export async function getServiceById(
  client: DbClient,
  id: string
): Promise<ServiceOutput> {
  try {
    const service = await findServiceByIdRepo(client, id);
    if (!service) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Servicio no encontrado",
      });
    }

    logger.info("[Service] Retrieved service", { id });
    return serializeService(service);
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logger.error("[Service] Failed to retrieve service", { id, error });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al obtener el servicio",
    });
  }
}

/**
 * List services with filters and pagination
 */
export async function listServices(
  client: DbClient,
  filters: ServiceFilterInput
): Promise<ServiceListOutput> {
  try {
    const [total, items] = await Promise.all([
      countServicesRepo(client, {
        search: filters.search,
        type: filters.type,
        isActive: filters.isActive,
      }),
      findServicesRepo(client, {
        search: filters.search,
        type: filters.type,
        isActive: filters.isActive,
        page: filters.page,
        limit: filters.limit,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      }),
    ]);

    const totalPages = Math.ceil(total / filters.limit);

    logger.info("[Service] Listed services", {
      total,
      page: filters.page,
      limit: filters.limit,
    });

    return {
      items: items.map(serializeService),
      total,
      page: filters.page,
      totalPages,
    };
  } catch (error) {
    logger.error("[Service] Failed to list services", { filters, error });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al listar servicios",
    });
  }
}

/**
 * Create new service
 */
export async function createService(
  client: DbClient,
  input: ServiceCreateInput
): Promise<ServiceOutput> {
  try {
    const data = {
      name: input.name,
      type: input.type,
      unit: input.unit,
      rate: String(input.rate),
      minimumBillingUnit: input.minimumBillingUnit
        ? String(input.minimumBillingUnit)
        : null,
      isActive: "true",
    };

    const created = await createServiceRepo(client, data);
    if (!created) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al crear el servicio",
      });
    }

    logger.info("[Service] Service created", {
      id: created.id,
      name: input.name,
    });
    return serializeService(created);
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logger.error("[Service] Failed to create service", { input, error });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al crear el servicio",
    });
  }
}

/**
 * Update service
 */
export async function updateService(
  client: DbClient,
  id: string,
  input: ServiceUpdateInput
): Promise<ServiceOutput> {
  try {
    const existing = await findServiceByIdRepo(client, id);
    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Servicio no encontrado",
      });
    }

    const updates = buildUpdateData(input);

    const updated = await updateServiceRepo(client, id, updates);
    if (!updated) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al actualizar el servicio",
      });
    }

    logger.info("[Service] Service updated", { id });
    return serializeService(updated);
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logger.error("[Service] Failed to update service", { id, input, error });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al actualizar el servicio",
    });
  }
}

/**
 * Delete service
 */
export async function deleteService(
  client: DbClient,
  id: string
): Promise<void> {
  try {
    const existing = await findServiceByIdRepo(client, id);
    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Servicio no encontrado",
      });
    }

    const deleted = await deleteServiceRepo(client, id);
    if (!deleted) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al eliminar el servicio",
      });
    }

    logger.info("[Service] Service deleted", { id });
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
    logger.error("[Service] Failed to delete service", { id, error });
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al eliminar el servicio",
    });
  }
}
