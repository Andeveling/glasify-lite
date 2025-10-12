/**
 * Quote Service - Business Logic for Quote Generation
 *
 * Implements quote generation from cart with Prisma transactions.
 * Follows SOLID principles: Single Responsibility for quote creation logic.
 *
 * @module server/api/routers/quote/quote.service
 */

import type { PrismaClient } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import logger from '@/lib/logger';
import { getQuoteValidityDays, getTenantCurrency } from '@/server/utils/tenant';
import type { CartItem } from '@/types/cart.types';
import type { GenerateQuoteInput } from '@/types/quote.types';

/** Correlation ID prefix length for userId truncation */
const CORRELATION_ID_USER_PREFIX_LENGTH = 8;

/**
 * Generate quote result (success case)
 */
export type GenerateQuoteResult = {
  quoteId: string;
  validUntil: Date;
  total: number;
  itemCount: number;
};

/**
 * Generate a formal quote from cart items
 *
 * This function:
 * 1. Gets tenant configuration for currency and quote validity period
 * 2. Calculates validUntil date (createdAt + quoteValidityDays)
 * 3. Creates Quote and QuoteItems in a single transaction
 * 4. Locks prices at quote generation time (not cart add time)
 *
 * @param db - Prisma client instance
 * @param userId - Authenticated user ID (required for quote ownership)
 * @param input - Cart items and project details
 * @returns Quote creation result with ID and metadata
 * @throws TRPCError - If cart empty or transaction fails
 *
 * @example
 * ```typescript
 * const result = await generateQuoteFromCart(prisma, 'user123', {
 *   cartItems: [...],
 *   projectAddress: { ... },
 * });
 * ```
 */
export async function generateQuoteFromCart(
  db: PrismaClient,
  userId: string,
  input: GenerateQuoteInput
): Promise<GenerateQuoteResult> {
  const startTime = Date.now();
  const correlationId = `quote-gen-${Date.now()}-${userId.slice(0, CORRELATION_ID_USER_PREFIX_LENGTH)}`;

  try {
    logger.info('[QuoteService] Starting quote generation', {
      correlationId,
      itemCount: input.cartItems.length,
      userId,
    });

    // Validation: Cart must not be empty
    if (input.cartItems.length === 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'El carrito está vacío. Agrega items antes de generar una cotización.',
      });
    }

    // Execute quote creation in a transaction
    const result = await db.$transaction(async (tx) => {
      // 1. Get tenant configuration for currency and quote validity period
      const currency = await getTenantCurrency(tx);
      const quoteValidityDays = await getQuoteValidityDays(tx);

      // 2. Calculate validUntil date
      const now = new Date();
      const validUntil = new Date(now);
      validUntil.setDate(validUntil.getDate() + quoteValidityDays);

      // 3. Calculate total from cart items
      const total = input.cartItems.reduce((sum, item) => sum + item.subtotal, 0);

      logger.info('[QuoteService] Quote metadata calculated', {
        correlationId,
        currency,
        total,
        validUntil: validUntil.toISOString(),
      });

      // 4. Create Quote with project address
      const quote = await tx.quote.create({
        data: {
          contactPhone: input.contactPhone,
          currency,
          manufacturerId: input.manufacturerId || null, // REFACTOR: Deprecated field, kept for backward compatibility
          projectCity: input.projectAddress.projectCity,
          projectName: input.projectAddress.projectName,
          projectPostalCode: input.projectAddress.projectPostalCode,
          projectState: input.projectAddress.projectState,
          projectStreet: input.projectAddress.projectStreet,
          status: 'draft', // Initial status is draft
          total,
          userId,
          validUntil,
          // Items will be created below
        },
      });

      logger.info('[QuoteService] Quote record created', {
        correlationId,
        quoteId: quote.id,
      });

      // 5. Create QuoteItems from CartItems
      const quoteItemsData = input.cartItems.map((cartItem) => ({
        accessoryApplied: false, // Default value
        glassTypeId: cartItem.glassTypeId,
        heightMm: cartItem.heightMm,
        modelId: cartItem.modelId,
        name: cartItem.name, // User-editable name from cart
        quantity: cartItem.quantity,
        quoteId: quote.id,
        // Note: solutionId is not stored in QuoteItem - solution is associated with GlassType
        subtotal: cartItem.subtotal, // Price locked at quote generation time
        widthMm: cartItem.widthMm,
      }));

      await tx.quoteItem.createMany({
        data: quoteItemsData,
      });

      logger.info('[QuoteService] QuoteItems created', {
        correlationId,
        itemCount: quoteItemsData.length,
        quoteId: quote.id,
      });

      // Note: Additional services handling skipped for MVP
      // Services from cart (additionalServiceIds) would require fetching service details
      // to calculate amount and determine unit. This will be implemented in a future iteration.
      // For now, quote items are created without services.

      logger.info('[QuoteService] Quote generation completed successfully', {
        correlationId,
        duration: `${Date.now() - startTime}ms`,
        quoteId: quote.id,
        total: quote.total.toString(),
      });

      return {
        itemCount: quoteItemsData.length,
        quoteId: quote.id,
        total: Number(quote.total),
        validUntil: quote.validUntil ?? validUntil,
      };
    });

    return result;
  } catch (error) {
    // Handle known TRPC errors
    if (error instanceof TRPCError) {
      logger.error('[QuoteService] Quote generation failed - Known error', {
        code: error.code,
        correlationId,
        duration: `${Date.now() - startTime}ms`,
        message: error.message,
      });
      throw error;
    }

    // Handle unknown errors
    logger.error('[QuoteService] Quote generation failed - Unknown error', {
      correlationId,
      duration: `${Date.now() - startTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw new TRPCError({
      cause: error,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Error al generar la cotización. Por favor intenta nuevamente.',
    });
  }
}

/**
 * Validate cart items consistency
 *
 * @deprecated This function is deprecated and will be removed in a future version.
 * Manufacturer consistency validation is no longer needed with the new TenantConfig architecture.
 *
 * @param cartItems - Array of cart items to validate
 * @param expectedManufacturerId - Expected manufacturer ID (deprecated parameter)
 */
export function validateCartManufacturerConsistency(cartItems: CartItem[], expectedManufacturerId: string): void {
  // REFACTOR: This function is deprecated
  // With the new TenantConfig architecture, there's no manufacturer association
  // All quotes use the tenant's configuration for currency and validity

  logger.info('[QuoteService] Cart validation (deprecated)', {
    itemCount: cartItems.length,
    note: 'Manufacturer consistency validation is deprecated',
  });

  // Function kept for backward compatibility but does nothing
  // Will be removed in Phase 5 when UI is updated
}
