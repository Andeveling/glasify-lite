/**
 * Address Repository - Data Access Layer
 *
 * Pure Drizzle ORM queries for ProjectAddress entity.
 * No business logic, error handling, or logging.
 *
 * @module server/api/routers/admin/address/repositories/address-repository
 */
import { and, desc, eq } from "drizzle-orm";
import type { db } from "@/server/db/drizzle";
import { projectAddresses } from "@/server/db/schema";

// Type inference from Drizzle db instance
type DbClient = typeof db;

/**
 * Find address by ID
 *
 * @param client - Drizzle client instance
 * @param id - Address ID
 * @returns Address or undefined if not found
 */
export async function findAddressById(
  client: DbClient,
  id: string
): Promise<typeof projectAddresses.$inferSelect | undefined> {
  return await client
    .select()
    .from(projectAddresses)
    .where(eq(projectAddresses.id, id))
    .limit(1)
    .then((result) => result[0]);
}

/**
 * Find addresses by quote ID
 *
 * @param client - Drizzle client instance
 * @param quoteId - Quote ID to filter by
 * @returns Array of addresses for the quote
 */
export async function findAddressesByQuoteId(
  client: DbClient,
  quoteId: string
): Promise<(typeof projectAddresses.$inferSelect)[]> {
  return await client
    .select()
    .from(projectAddresses)
    .where(eq(projectAddresses.quoteId, quoteId))
    .orderBy(desc(projectAddresses.createdAt));
}

/**
 * Create new address
 *
 * @param client - Drizzle client instance
 * @param data - Address data to insert
 * @returns Created address
 */
export async function createAddress(
  client: DbClient,
  data: typeof projectAddresses.$inferInsert
): Promise<typeof projectAddresses.$inferSelect | undefined> {
  const result = await client.insert(projectAddresses).values(data).returning();

  return result[0];
}

/**
 * Update existing address
 *
 * @param client - Drizzle client instance
 * @param id - Address ID to update
 * @param data - Partial address data
 * @returns Updated address or undefined if not found
 */
export async function updateAddress(
  client: DbClient,
  id: string,
  data: Partial<typeof projectAddresses.$inferInsert>
): Promise<typeof projectAddresses.$inferSelect | undefined> {
  const result = await client
    .update(projectAddresses)
    .set(data)
    .where(eq(projectAddresses.id, id))
    .returning();

  return result[0];
}

/**
 * Delete address
 *
 * @param client - Drizzle client instance
 * @param id - Address ID to delete
 * @returns Deleted address or undefined if not found
 */
export async function deleteAddress(
  client: DbClient,
  id: string
): Promise<typeof projectAddresses.$inferSelect | undefined> {
  const result = await client
    .delete(projectAddresses)
    .where(eq(projectAddresses.id, id))
    .returning();

  return result[0];
}

/**
 * Check if address exists for quote
 *
 * @param client - Drizzle client instance
 * @param addressId - Address ID
 * @param quoteId - Quote ID (to verify ownership)
 * @returns true if address belongs to quote, false otherwise
 */
export async function addressBelongsToQuote(
  client: DbClient,
  addressId: string,
  quoteId: string
): Promise<boolean> {
  const result = await client
    .select()
    .from(projectAddresses)
    .where(
      and(
        eq(projectAddresses.id, addressId),
        eq(projectAddresses.quoteId, quoteId)
      )
    )
    .limit(1)
    .then((rows) => rows.length > 0);

  return result;
}
