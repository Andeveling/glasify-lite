/**
 * Quote Metadata Calculator - Calculate quote metadata
 *
 * Single Responsibility: Calculate currency, validity, and totals
 * Open/Closed: Open for extension (new metadata fields), closed for modification
 *
 * NOTE: Currently uses Prisma types during migration to Drizzle.
 * This module will be updated once Drizzle migration is complete.
 *
 * @module server/api/routers/quote/services/quote-metadata-calculator
 */

import type { TransactionClient } from "@/server/utils/tenant";
import { getQuoteValidityDays, getTenantCurrency } from "@/server/utils/tenant";
import type { CartItem } from "@/types/cart.types";

/**
 * Quote metadata for creation
 */
export type QuoteMetadata = {
  currency: string;
  validUntil: Date;
  total: number;
};

/**
 * Calculate quote total from cart items
 *
 * @param cartItems - Cart items to sum
 * @returns Total amount
 */
function calculateTotal(cartItems: CartItem[]): number {
  return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
}

/**
 * Calculate validity date from current date and tenant configuration
 *
 * @param quoteValidityDays - Number of days the quote is valid
 * @returns Validity date
 */
function calculateValidityDate(quoteValidityDays: number): Date {
  const now = new Date();
  const validUntil = new Date(now);
  validUntil.setDate(validUntil.getDate() + quoteValidityDays);
  return validUntil;
}

/**
 * Calculate quote metadata (currency, validity, total)
 *
 * Fetches tenant configuration and calculates:
 * - Currency from tenant config
 * - Validity date (current date + configured days)
 * - Total from cart items subtotals
 *
 * @param db - Database transaction client (Prisma during migration, Drizzle later)
 * @param cartItems - Cart items to calculate total
 * @returns Quote metadata
 */
export async function calculateQuoteMetadata(
  db: TransactionClient,
  cartItems: CartItem[]
): Promise<QuoteMetadata> {
  const [currency, quoteValidityDays] = await Promise.all([
    getTenantCurrency(db),
    getQuoteValidityDays(db),
  ]);

  const validUntil = calculateValidityDate(quoteValidityDays);
  const total = calculateTotal(cartItems);

  return { currency, validUntil, total };
}
