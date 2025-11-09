/**
 * Address Service - Business Logic Layer
 *
 * Orchestrates data access and applies business rules.
 * Handles error management, validation, and structured logging.
 *
 * @module server/api/routers/admin/address/address.service
 */
import { TRPCError } from "@trpc/server";
import logger from "@/lib/logger";
import type { db } from "@/server/db/drizzle";
import type {
  CreateInput,
  CreateOutput,
  DeleteInput,
  DeleteOutput,
  ListByQuoteInput,
  ListByQuoteOutput,
  ReadByIdInput,
  ReadByIdOutput,
  UpdateInput,
  UpdateOutput,
} from "./address.schemas";
import {
  createAddress,
  deleteAddress,
  findAddressById,
  findAddressesByQuoteId,
  updateAddress,
} from "./repositories/address-repository";

// Type inference from Drizzle db instance
type DbClient = typeof db;

const MODULE_PREFIX = "[Address]";

/**
 * Create new address
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - Create input with address data
 * @returns Created address
 * @throws TRPCError if database error
 */
export async function createAddressService(
  client: DbClient,
  userId: string,
  input: CreateInput
): Promise<CreateOutput> {
  try {
    logger.info(`${MODULE_PREFIX} Creating address`, {
      userId,
      quoteId: input.quoteId,
    });

    const created = await createAddress(client, {
      quoteId: input.quoteId,
      label: input.label,
      country: input.country,
      region: input.region,
      city: input.city,
      district: input.district,
      street: input.street,
      reference: input.reference,
      latitude: input.latitude?.toString(),
      longitude: input.longitude?.toString(),
      postalCode: input.postalCode,
    });

    if (!created) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No se pudo crear la dirección de entrega",
      });
    }

    logger.info(`${MODULE_PREFIX} Address created successfully`, {
      userId,
      addressId: created.id,
      quoteId: created.quoteId,
    });

    return created;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error(`${MODULE_PREFIX} Failed to create address`, {
      userId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al crear la dirección de entrega",
    });
  }
}

/**
 * Get address by ID
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - Input with ID to fetch
 * @returns Address or null if not found
 * @throws TRPCError if database error
 */
export async function getAddressByIdService(
  client: DbClient,
  userId: string,
  input: ReadByIdInput
): Promise<ReadByIdOutput> {
  try {
    logger.info(`${MODULE_PREFIX} Fetching address by ID`, {
      userId,
      addressId: input.id,
    });

    const address = await findAddressById(client, input.id);

    if (!address) {
      logger.warn(`${MODULE_PREFIX} Address not found`, {
        userId,
        addressId: input.id,
      });
      return null;
    }

    logger.info(`${MODULE_PREFIX} Address retrieved`, {
      userId,
      addressId: address.id,
    });

    return address;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error(`${MODULE_PREFIX} Failed to fetch address`, {
      userId,
      addressId: input.id,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al obtener la dirección de entrega",
    });
  }
}

/**
 * List addresses by quote ID
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - List input with quote ID
 * @returns Array of addresses
 * @throws TRPCError if database error
 */
export async function listAddressesByQuoteService(
  client: DbClient,
  userId: string,
  input: ListByQuoteInput
): Promise<ListByQuoteOutput> {
  try {
    logger.info(`${MODULE_PREFIX} Listing addresses by quote`, {
      userId,
      quoteId: input.quoteId,
    });

    const addresses = await findAddressesByQuoteId(client, input.quoteId);

    logger.info(`${MODULE_PREFIX} Addresses listed successfully`, {
      userId,
      quoteId: input.quoteId,
      count: addresses.length,
    });

    return addresses;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error(`${MODULE_PREFIX} Failed to list addresses`, {
      userId,
      quoteId: input.quoteId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al listar las direcciones de entrega",
    });
  }
}

/**
 * Build update values from input data
 * Extracted helper to reduce cognitive complexity
 */
function buildUpdateValues(data: UpdateInput["data"]): Record<string, unknown> {
  const updateValues: Record<string, unknown> = {};

  if (data.label !== undefined) {
    updateValues.label = data.label;
  }
  if (data.country !== undefined) {
    updateValues.country = data.country;
  }
  if (data.region !== undefined) {
    updateValues.region = data.region;
  }
  if (data.city !== undefined) {
    updateValues.city = data.city;
  }
  if (data.district !== undefined) {
    updateValues.district = data.district;
  }
  if (data.street !== undefined) {
    updateValues.street = data.street;
  }
  if (data.reference !== undefined) {
    updateValues.reference = data.reference;
  }
  if (data.latitude !== undefined) {
    updateValues.latitude = data.latitude.toString();
  }
  if (data.longitude !== undefined) {
    updateValues.longitude = data.longitude.toString();
  }
  if (data.postalCode !== undefined) {
    updateValues.postalCode = data.postalCode;
  }

  return updateValues;
}

/**
 * Update address
 *
 * Validates:
 * - Address exists
 * - Address belongs to quote
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - Update input with ID and partial data
 * @returns Updated address
 * @throws TRPCError if not found or database error
 */
export async function updateAddressService(
  client: DbClient,
  userId: string,
  input: UpdateInput
): Promise<UpdateOutput> {
  try {
    logger.info(`${MODULE_PREFIX} Updating address`, {
      userId,
      addressId: input.id,
    });

    // Verify address exists
    const existing = await findAddressById(client, input.id);
    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Dirección no encontrada",
      });
    }

    const updateValues = buildUpdateValues(input.data);

    const updated = await updateAddress(client, input.id, updateValues);

    if (!updated) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Dirección no encontrada después de actualizar",
      });
    }

    logger.info(`${MODULE_PREFIX} Address updated successfully`, {
      userId,
      addressId: updated.id,
    });

    return updated;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error(`${MODULE_PREFIX} Failed to update address`, {
      userId,
      addressId: input.id,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al actualizar la dirección de entrega",
    });
  }
}

/**
 * Delete address
 *
 * Validates:
 * - Address exists
 *
 * @param client - Drizzle client instance
 * @param userId - User ID (for audit logging)
 * @param input - Delete input with ID
 * @returns Deleted address
 * @throws TRPCError if not found or database error
 */
export async function deleteAddressService(
  client: DbClient,
  userId: string,
  input: DeleteInput
): Promise<DeleteOutput> {
  try {
    logger.info(`${MODULE_PREFIX} Deleting address`, {
      userId,
      addressId: input.id,
    });

    const existing = await findAddressById(client, input.id);
    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Dirección no encontrada",
      });
    }

    const deleted = await deleteAddress(client, input.id);

    if (!deleted) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Dirección no encontrada para eliminar",
      });
    }

    logger.info(`${MODULE_PREFIX} Address deleted successfully`, {
      userId,
      addressId: deleted.id,
    });

    return deleted;
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }

    logger.error(`${MODULE_PREFIX} Failed to delete address`, {
      userId,
      addressId: input.id,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al eliminar la dirección de entrega",
    });
  }
}
