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
import type { DrizzleClient } from "@/server/db/index";
import {
  glassTypes,
  models,
  profileSuppliers,
  projectAddresses,
  quoteItems,
  quotes,
  users,
} from "@/server/db/schema";
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
    .returning();

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
    .returning();

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

/**
 * Find quote by ID with full details for export
 *
 * Returns complete quote data including user, items with all relations,
 * adjustments, and calculated totals for PDF/Excel export.
 *
 * @param db - Drizzle client
 * @param quoteId - Quote ID
 * @returns Complete quote data or null
 */
export async function findQuoteForExport(db: DrizzleClient, quoteId: string) {
  const results = await db
    .select({
      // Quote fields
      quoteId: quotes.id,
      contactPhone: quotes.contactPhone,
      createdAt: quotes.createdAt,
      currency: quotes.currency,
      projectName: quotes.projectName,
      status: quotes.status,
      total: quotes.total,
      userId: quotes.userId,
      validUntil: quotes.validUntil,
      // Quote item fields
      itemColorHexCode: quoteItems.colorHexCode,
      itemColorName: quoteItems.colorName,
      itemColorSurchargePercentage: quoteItems.colorSurchargePercentage,
      itemHeightMm: quoteItems.heightMm,
      itemId: quoteItems.id,
      itemName: quoteItems.name,
      itemQuantity: quoteItems.quantity,
      itemSubtotal: quoteItems.subtotal,
      itemWidthMm: quoteItems.widthMm,
      // Related entity names
      glassTypeName: glassTypes.name,
      modelName: models.name,
      profileSupplierName: profileSuppliers.name,
      // User fields
      userEmail: users.email,
      userName: users.name,
    })
    .from(quotes)
    .leftJoin(quoteItems, eq(quotes.id, quoteItems.quoteId))
    .leftJoin(glassTypes, eq(quoteItems.glassTypeId, glassTypes.id))
    .leftJoin(models, eq(quoteItems.modelId, models.id))
    .leftJoin(
      profileSuppliers,
      eq(models.profileSupplierId, profileSuppliers.id)
    )
    .leftJoin(users, eq(quotes.userId, users.id))
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
    .filter((row) => row.itemId !== null)
    .map((row) => ({
      colorHexCode: row.itemColorHexCode,
      colorName: row.itemColorName,
      colorSurchargePercentage: row.itemColorSurchargePercentage,
      glassTypeName: row.glassTypeName,
      heightMm: row.itemHeightMm,
      id: row.itemId ?? "",
      modelName: row.modelName,
      name: row.itemName,
      profileSupplierName: row.profileSupplierName,
      quantity: row.itemQuantity,
      subtotal: row.itemSubtotal,
      widthMm: row.itemWidthMm,
    }));

  return {
    contactPhone: firstRow.contactPhone,
    createdAt: firstRow.createdAt,
    currency: firstRow.currency,
    id: firstRow.quoteId,
    items,
    projectName: firstRow.projectName,
    status: firstRow.status,
    total: firstRow.total,
    user: {
      email: firstRow.userEmail,
      name: firstRow.userName,
    },
    userId: firstRow.userId,
    validUntil: firstRow.validUntil,
  };
}
