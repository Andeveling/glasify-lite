/**
 * Quote Repository - Data access layer with Drizzle ORM
 *
 * Clean separation of concerns:
 * - Single Responsibility: Database operations for quotes
 * - Dependency Inversion: Depends on Drizzle abstractions
 * - Pure data access: No business logic
 *
 * @module server/api/routers/quote/repositories/quote-repository
 */

import { eq } from "drizzle-orm";
import type { DrizzleClient } from "@/server/db";
import { projectAddresses, quoteItems, quotes } from "@/server/db/schema";
import type { CartItem } from "@/types/cart.types";
import type { GenerateQuoteInput } from "@/types/quote.types";
import type { QuoteMetadata } from "../services/quote-metadata-calculator";
import type { QuoteForValidation } from "../validators/quote-validator";

// ============================================================================
// Types
// ============================================================================

/**
 * Created quote result
 */
export type CreatedQuote = {
  id: string;
  userId: string | null;
  status: string;
  currency: string;
  total: string;
  validUntil: Date | null;
  createdAt: Date;
};

/**
 * Quote update data for status change
 */
export type QuoteUpdateData = {
  status: "sent";
  sentAt: Date;
  contactPhone: string;
};

// ============================================================================
// Write Operations
// ============================================================================

/**
 * Create quote record in database
 *
 * @param db - Drizzle client
 * @param userId - User ID
 * @param input - Quote input with project address
 * @param metadata - Quote metadata (currency, validity, total)
 * @returns Created quote
 */
export async function createQuoteRecord(
  db: DrizzleClient,
  userId: string,
  input: GenerateQuoteInput,
  metadata: QuoteMetadata
): Promise<CreatedQuote> {
  const [quote] = await db
    .insert(quotes)
    .values({
      contactPhone: input.contactPhone,
      currency: metadata.currency,
      projectCity: input.projectAddress.projectCity,
      projectName: input.projectAddress.projectName,
      projectState: input.projectAddress.projectState,
      projectStreet: input.projectAddress.projectStreet,
      status: "draft",
      total: metadata.total.toString(),
      userId,
      validUntil: metadata.validUntil,
    })
    .returning();

  if (!quote) {
    throw new Error("Failed to create quote");
  }

  return quote;
}

/**
 * Create delivery address record in database (optional)
 *
 * @param db - Drizzle client
 * @param quoteId - Quote ID
 * @param deliveryAddress - Delivery address input
 */
export async function createDeliveryAddress(
  db: DrizzleClient,
  quoteId: string,
  deliveryAddress: GenerateQuoteInput["deliveryAddress"]
): Promise<void> {
  if (!deliveryAddress) {
    return;
  }

  await db.insert(projectAddresses).values({
    city: deliveryAddress.city ?? null,
    country: deliveryAddress.country ?? "Colombia",
    district: deliveryAddress.district ?? null,
    label: deliveryAddress.label ?? null,
    latitude: deliveryAddress.latitude?.toString() ?? null,
    longitude: deliveryAddress.longitude?.toString() ?? null,
    postalCode: deliveryAddress.postalCode ?? null,
    quoteId,
    reference: deliveryAddress.reference ?? null,
    region: deliveryAddress.region ?? null,
    street: deliveryAddress.street ?? null,
  });
}

/**
 * Create quote items from cart items
 *
 * @param db - Drizzle client
 * @param quoteId - Quote ID
 * @param cartItems - Cart items
 * @returns Number of items created
 */
export async function createQuoteItems(
  db: DrizzleClient,
  quoteId: string,
  cartItems: CartItem[]
): Promise<number> {
  // Insert quote items only (services will be added later when cart includes full service data)
  const quoteItemsData = cartItems.map((cartItem) => ({
    glassTypeId: cartItem.glassTypeId,
    heightMm: cartItem.heightMm,
    modelId: cartItem.modelId,
    name: cartItem.name,
    quantity: cartItem.quantity,
    quoteId,
    subtotal: cartItem.subtotal.toString(),
    widthMm: cartItem.widthMm,
  }));

  const insertedItems = await db
    .insert(quoteItems)
    .values(quoteItemsData)
    .returning({ id: quoteItems.id });

  // TODO: Insert services when CartItem includes full service data (quantity, unit, amount)
  // Currently additionalServiceIds only contains service IDs

  return insertedItems.length;
}

/**
 * Update quote to sent status
 *
 * @param db - Drizzle client
 * @param quoteId - Quote ID
 * @param updateData - Update data
 * @returns Updated quote
 */
export async function updateQuoteToSent(
  db: DrizzleClient,
  quoteId: string,
  updateData: QuoteUpdateData
): Promise<{
  id: string;
  status: string;
  sentAt: Date | null;
  contactPhone: string | null;
  currency: string;
  total: string;
}> {
  const [updated] = await db
    .update(quotes)
    .set({
      contactPhone: updateData.contactPhone,
      sentAt: updateData.sentAt,
      status: updateData.status,
    })
    .where(eq(quotes.id, quoteId))
    .returning({
      contactPhone: quotes.contactPhone,
      currency: quotes.currency,
      id: quotes.id,
      sentAt: quotes.sentAt,
      status: quotes.status,
      total: quotes.total,
    });

  if (!updated) {
    throw new Error("Failed to update quote");
  }

  return updated;
}

// ============================================================================
// Read Operations
// ============================================================================

/**
 * Find quote by ID with items (for validation)
 *
 * @param db - Drizzle client
 * @param quoteId - Quote ID
 * @returns Quote with items or null
 */
export async function findQuoteByIdWithItems(
  db: DrizzleClient,
  quoteId: string
): Promise<QuoteForValidation | null> {
  const results = await db
    .select({
      id: quotes.id,
      itemId: quoteItems.id,
      status: quotes.status,
      userId: quotes.userId,
    })
    .from(quotes)
    .leftJoin(quoteItems, eq(quotes.id, quoteItems.quoteId))
    .where(eq(quotes.id, quoteId));

  if (results.length === 0) {
    return null;
  }

  const firstRow = results[0];
  if (!firstRow) {
    return null;
  }

  // Group items
  const items = results
    .map((row) => row.itemId)
    .filter((id): id is string => id !== null)
    .map((id) => ({ id }));

  return {
    id: firstRow.id,
    items,
    status: firstRow.status,
    userId: firstRow.userId,
  };
}
