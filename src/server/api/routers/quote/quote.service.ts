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
          status: 'draft', // Initial status: pending review/send (read-only, not editable after creation)
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
export function validateCartManufacturerConsistency(cartItems: CartItem[], _expectedManufacturerId: string): void {
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

// ============================================================================
// Feature 005: Send Quote to Vendor
// ============================================================================

/**
 * Send quote to vendor parameters
 */
export type SendQuoteToVendorParams = {
  quoteId: string;
  userId: string;
  contactPhone: string;
  contactEmail?: string;
};

/**
 * Send quote to vendor result
 */
export type SendQuoteToVendorResult = {
  id: string;
  status: 'sent';
  sentAt: Date;
  contactPhone: string;
  contactEmail?: string;
  total: number;
  currency: string;
};

/**
 * Send a draft quote to the vendor for professional review
 *
 * This function:
 * 1. Validates the quote exists and belongs to the user
 * 2. Validates the quote is in 'draft' status
 * 3. Validates the quote has at least one item
 * 4. Updates quote status to 'sent' and records sentAt timestamp
 * 5. Logs the submission for audit trail
 *
 * IMPORTANT: Status transition is immutable (draft → sent only, no rollback)
 *
 * @param db - Prisma client instance
 * @param params - Quote ID, user ID, and contact information
 * @returns Updated quote with 'sent' status
 * @throws TRPCError - If validation fails or quote not found
 *
 * @example
 * ```typescript
 * const result = await sendQuoteToVendor(prisma, {
 *   quoteId: 'cuid123',
 *   userId: 'user456',
 *   contactPhone: '+573001234567',
 *   contactEmail: 'user@example.com'
 * });
 * ```
 */
export async function sendQuoteToVendor(
  db: PrismaClient,
  params: SendQuoteToVendorParams
): Promise<SendQuoteToVendorResult> {
  const startTime = Date.now();
  const correlationId = `quote-send-${Date.now()}-${params.userId.slice(0, CORRELATION_ID_USER_PREFIX_LENGTH)}`;

  try {
    logger.info('[QuoteService] Starting quote submission to vendor', {
      correlationId,
      quoteId: params.quoteId,
      userId: params.userId,
    });

    // 1. Fetch quote with items to validate
    const quote = await db.quote.findUnique({
      include: {
        items: {
          select: { id: true }, // Only need count
        },
      },
      where: { id: params.quoteId },
    });

    // 2. Validate quote exists
    if (!quote) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Cotización no encontrada.',
      });
    }

    // 3. Validate quote ownership
    if (quote.userId !== params.userId) {
      logger.warn('[QuoteService] Unauthorized quote access attempt', {
        correlationId,
        quoteId: params.quoteId,
        quoteUserId: quote.userId,
        requestUserId: params.userId,
      });

      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'No tienes permiso para enviar esta cotización.',
      });
    }

    // 4. Validate quote status is 'draft'
    if (quote.status !== 'draft') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Esta cotización ya fue enviada el ${quote.sentAt?.toLocaleDateString('es-CO') ?? 'anteriormente'}.`,
      });
    }

    // 5. Validate quote has at least one item
    if (quote.items.length === 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No puedes enviar una cotización vacía. Agrega al menos un producto.',
      });
    }

    logger.info('[QuoteService] Quote validation passed', {
      correlationId,
      itemCount: quote.items.length,
      quoteId: params.quoteId,
      status: quote.status,
    });

    // 6. Execute status update with timestamp
    const now = new Date();
    const updatedQuote = await db.quote.update({
      data: {
        contactPhone: params.contactPhone, // Update/set contact phone
        sentAt: now,
        status: 'sent',
        // contactEmail is optional and not stored in Quote model currently
        // This field would need to be added to schema in a future iteration
      },
      select: {
        contactPhone: true,
        currency: true,
        id: true,
        sentAt: true,
        status: true,
        total: true,
      },
      where: { id: params.quoteId },
    });

    logger.info('[QuoteService] Quote sent to vendor successfully', {
      correlationId,
      duration: `${Date.now() - startTime}ms`,
      quoteId: updatedQuote.id,
      sentAt: updatedQuote.sentAt?.toISOString(),
      status: updatedQuote.status,
      total: updatedQuote.total.toString(),
    });

    return {
      contactEmail: params.contactEmail, // Pass through (not persisted in MVP)
      contactPhone: updatedQuote.contactPhone ?? params.contactPhone,
      currency: updatedQuote.currency,
      id: updatedQuote.id,
      sentAt: updatedQuote.sentAt!, // Non-null after update
      status: updatedQuote.status as 'sent',
      total: Number(updatedQuote.total),
    };
  } catch (error) {
    // Handle known TRPC errors
    if (error instanceof TRPCError) {
      logger.error('[QuoteService] Quote submission failed - Known error', {
        code: error.code,
        correlationId,
        duration: `${Date.now() - startTime}ms`,
        message: error.message,
      });
      throw error;
    }

    // Handle unknown errors
    logger.error('[QuoteService] Quote submission failed - Unknown error', {
      correlationId,
      duration: `${Date.now() - startTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw new TRPCError({
      cause: error,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Error al enviar la cotización. Por favor intenta nuevamente.',
    });
  }
}
