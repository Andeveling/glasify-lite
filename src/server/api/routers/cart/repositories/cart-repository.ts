/**
 * Cart Repository - Data Access Layer
 *
 * Handles all database operations for cart (quote items) using Drizzle ORM.
 * Pure data access with no business logic.
 *
 * @module server/api/routers/cart/repositories/cart-repository
 */

import { and, eq } from "drizzle-orm";
import type { db } from "@/server/db/drizzle";
import {
  colors,
  glassTypes,
  models,
  quoteItems,
  quotes,
} from "@/server/db/schema";

// Type inference from Drizzle db instance
type DbClient = typeof db;

// ============================================================================
// CART (QUOTE) OPERATIONS
// ============================================================================

/**
 * Find or create a draft cart (quote) for a user
 *
 * @param db - Drizzle client instance
 * @param userId - User ID
 * @returns Cart (quote) record
 */
export async function findOrCreateCart(client: DbClient, userId: string) {
  // Try to find existing draft cart
  const existingCart = await client
    .select()
    .from(quotes)
    .where(and(eq(quotes.userId, userId), eq(quotes.status, "draft")))
    .then((rows) => rows[0] ?? null);

  if (existingCart) {
    return existingCart;
  }

  // Create new cart
  const [newCart] = await client
    .insert(quotes)
    .values({
      userId,
      status: "draft",
      total: "0",
      currency: "USD",
    })
    .returning();

  return newCart;
}

/**
 * Find a draft cart for a user
 *
 * @param db - Drizzle client instance
 * @param userId - User ID
 * @returns Cart (quote) record or null
 */
export async function findDraftCart(client: DbClient, userId: string) {
  return await client
    .select()
    .from(quotes)
    .where(and(eq(quotes.userId, userId), eq(quotes.status, "draft")))
    .then((rows) => rows[0] ?? null);
}

// ============================================================================
// CART ITEM OPERATIONS
// ============================================================================

/**
 * Create a new cart item
 *
 * @param db - Drizzle client instance
 * @param data - Cart item data
 * @returns Created cart item
 */
export async function createCartItem(
  client: DbClient,
  data: {
    quoteId: string;
    modelId: string;
    glassTypeId: string;
    heightMm: number;
    widthMm: number;
    quantity: number;
    name: string;
    colorId?: string | null;
    subtotal: string;
  }
) {
  const [item] = await client.insert(quoteItems).values(data).returning();
  return item;
}

/**
 * Find a cart item by ID
 *
 * @param db - Drizzle client instance
 * @param itemId - Cart item ID
 * @returns Cart item or null
 */
export async function findCartItemById(client: DbClient, itemId: string) {
  return await client
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.id, itemId))
    .then((rows) => rows[0] ?? null);
}

/**
 * Update a cart item
 *
 * @param db - Drizzle client instance
 * @param itemId - Cart item ID
 * @param data - Update data
 * @returns Updated cart item
 */
export async function updateCartItem(
  client: DbClient,
  itemId: string,
  data: Partial<{
    name: string;
    quantity: number;
    heightMm: number;
    widthMm: number;
    subtotal: string;
  }>
) {
  const [item] = await client
    .update(quoteItems)
    .set(data)
    .where(eq(quoteItems.id, itemId))
    .returning();
  return item;
}

/**
 * Delete a cart item
 *
 * @param db - Drizzle client instance
 * @param itemId - Cart item ID
 * @returns Deleted cart item
 */
export async function deleteCartItem(client: DbClient, itemId: string) {
  const [item] = await client
    .delete(quoteItems)
    .where(eq(quoteItems.id, itemId))
    .returning();
  return item;
}

/**
 * Delete all items in a cart
 *
 * @param db - Drizzle client instance
 * @param cartId - Cart (quote) ID
 * @returns Number of deleted items
 */
export async function deleteAllCartItems(client: DbClient, cartId: string) {
  const deleted = await client
    .delete(quoteItems)
    .where(eq(quoteItems.quoteId, cartId))
    .returning();
  return deleted.length;
}

/**
 * List all items in a cart with related data
 *
 * @param db - Drizzle client instance
 * @param cartId - Cart (quote) ID
 * @returns List of cart items with model and glass type data
 */
export async function listCartItems(client: DbClient, cartId: string) {
  return await client
    .select({
      // Cart item fields
      id: quoteItems.id,
      quoteId: quoteItems.quoteId,
      modelId: quoteItems.modelId,
      glassTypeId: quoteItems.glassTypeId,
      colorId: quoteItems.colorId,
      heightMm: quoteItems.heightMm,
      widthMm: quoteItems.widthMm,
      quantity: quoteItems.quantity,
      name: quoteItems.name,
      roomLocation: quoteItems.roomLocation,
      accessoryApplied: quoteItems.accessoryApplied,
      subtotal: quoteItems.subtotal,
      colorSurchargePercentage: quoteItems.colorSurchargePercentage,
      colorHexCode: quoteItems.colorHexCode,
      colorName: quoteItems.colorName,
      createdAt: quoteItems.createdAt,
      updatedAt: quoteItems.updatedAt,
      // Model data
      modelName: models.name,
      modelImageUrl: models.imageUrl,
      // Glass type data
      glassTypeName: glassTypes.name,
      glassTypeCode: glassTypes.code,
    })
    .from(quoteItems)
    .leftJoin(models, eq(quoteItems.modelId, models.id))
    .leftJoin(glassTypes, eq(quoteItems.glassTypeId, glassTypes.id))
    .where(eq(quoteItems.quoteId, cartId))
    .orderBy(quoteItems.createdAt);
}

// ============================================================================
// VALIDATION QUERIES
// ============================================================================

/**
 * Find a model by ID
 *
 * @param db - Drizzle client instance
 * @param modelId - Model ID
 * @returns Model record or null
 */
export async function findModelById(client: DbClient, modelId: string) {
  return await client
    .select({
      id: models.id,
      name: models.name,
      basePrice: models.basePrice,
      costPerMmHeight: models.costPerMmHeight,
      costPerMmWidth: models.costPerMmWidth,
      status: models.status,
    })
    .from(models)
    .where(eq(models.id, modelId))
    .then((rows) => rows[0] ?? null);
}

/**
 * Find a glass type by ID
 *
 * @param db - Drizzle client instance
 * @param glassTypeId - Glass type ID
 * @returns Glass type record or null
 */
export async function findGlassTypeById(client: DbClient, glassTypeId: string) {
  return await client
    .select({
      id: glassTypes.id,
      name: glassTypes.name,
      code: glassTypes.code,
      pricePerSqm: glassTypes.pricePerSqm,
    })
    .from(glassTypes)
    .where(eq(glassTypes.id, glassTypeId))
    .then((rows) => rows[0] ?? null);
}

/**
 * Find a color by ID
 *
 * @param db - Drizzle client instance
 * @param colorId - Color ID
 * @returns Color record or null
 */
export async function findColorById(client: DbClient, colorId: string) {
  return await client
    .select({
      id: colors.id,
      name: colors.name,
      hexCode: colors.hexCode,
    })
    .from(colors)
    .where(eq(colors.id, colorId))
    .then((rows) => rows[0] ?? null);
}
