/**
 * Quote Service - Business Logic Orchestration
 *
 * Clean, modular architecture following SOLID principles:
 * - Single Responsibility: Each module has one clear purpose
 * - Open/Closed: Open for extension, closed for modification
 * - Dependency Inversion: Depends on abstractions
 * - Interface Segregation: Specific interfaces for specific needs
 *
 * Architecture:
 * - validators/: Business rules validation
 * - services/: Business logic (metadata calculation)
 * - repositories/: Data access layer (CRUD operations)
 * - utils/: Cross-cutting concerns (logging)
 *
 * @module server/api/routers/quote/quote.service
 */

import { TRPCError } from "@trpc/server";
import type { DrizzleClient } from "@/server/db";
import type { CartItem } from "@/types/cart.types";
import type { GenerateQuoteInput } from "@/types/quote.types";
import {
  createDeliveryAddress,
  createQuoteItems,
  createQuoteRecord,
  findQuoteByIdWithItems,
  updateQuoteToSent,
} from "./repositories/quote-repository";
import { calculateQuoteMetadata } from "./services/quote-metadata-calculator";
import {
  generateCorrelationId,
  logDeliveryAddressCreated,
  logDeliveryAddressError,
  logQuoteGenerationError,
  logQuoteGenerationStart,
  logQuoteGenerationSuccess,
  logQuoteValidationPassed,
  logSendToVendorError,
  logSendToVendorStart,
  logSendToVendorSuccess,
} from "./utils/quote-logger";
import {
  validateCartNotEmpty,
  validateSendToVendorRequirements,
} from "./validators/quote-validator";

// ============================================================================
// Types
// ============================================================================

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
  status: "sent";
  sentAt: Date;
  contactPhone: string;
  contactEmail?: string;
  total: number;
  currency: string;
};

// ============================================================================
// Quote Generation Service
// ============================================================================

/**
 * Generate a formal quote from cart items
 *
 * Clean architecture with separated concerns:
 * 1. Validation (validators/quote-validator)
 * 2. Metadata calculation (services/quote-metadata-calculator)
 * 3. Data persistence (repositories/quote-repository)
 * 4. Logging (utils/quote-logger)
 *
 * Transaction flow:
 * 1. Validate cart not empty
 * 2. Calculate metadata (currency, validity, total)
 * 3. Create quote record
 * 4. Create delivery address (optional)
 * 5. Create quote items
 *
 * @param db - Prisma client instance
 * @param userId - Authenticated user ID
 * @param input - Cart items and project details
 * @returns Quote creation result
 * @throws TRPCError if validation or transaction fails
 *
 * @example
 * ```typescript
 * const result = await generateQuoteFromCart(prisma, 'user123', {
 *   cartItems: [...],
 *   projectAddress: { ... },
 *   deliveryAddress: { ... }
 * });
 * ```
 */
export async function generateQuoteFromCart(
  db: DrizzleClient,
  userId: string,
  input: GenerateQuoteInput
): Promise<GenerateQuoteResult> {
  const startTime = Date.now();
  const correlationId = generateCorrelationId("quote-gen", userId);

  try {
    // Log operation start
    logQuoteGenerationStart(correlationId, userId, input.cartItems.length);

    // Validate cart not empty
    validateCartNotEmpty(input.cartItems);

    // Calculate metadata
    const metadata = await calculateQuoteMetadata(db, input.cartItems);

    // Create quote record
    const quote = await createQuoteRecord(db, userId, input, metadata);

    // Create delivery address (optional)
    try {
      await createDeliveryAddress(db, quote.id, input.deliveryAddress);
      logDeliveryAddressCreated(correlationId, quote.id);
    } catch (error) {
      logDeliveryAddressError(correlationId, quote.id, error);
      // Continue without delivery address - it's optional
    }

    // Create quote items
    const itemCount = await createQuoteItems(db, quote.id, input.cartItems);

    // Return result (total is string in Drizzle)
    const total = Number.parseFloat(quote.total);

    const result = {
      itemCount,
      quoteId: quote.id,
      total,
      validUntil: quote.validUntil ?? metadata.validUntil,
    };

    // Log success
    logQuoteGenerationSuccess(
      correlationId,
      result.quoteId,
      result.itemCount,
      Date.now() - startTime
    );

    return result;
  } catch (error) {
    // Log error
    logQuoteGenerationError(correlationId, error, Date.now() - startTime);

    // Re-throw known errors
    if (error instanceof TRPCError) {
      throw error;
    }

    // Wrap unknown errors
    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al generar la cotización. Por favor intenta nuevamente.",
    });
  }
}

// ============================================================================
// Send to Vendor Service
// ============================================================================

/**
 * Send a draft quote to the vendor
 *
 * Clean architecture with separated concerns:
 * 1. Validation (validators/quote-validator)
 * 2. Data fetching and update (repositories/quote-repository)
 * 3. Logging (utils/quote-logger)
 *
 * Validation flow:
 * 1. Quote exists
 * 2. User owns the quote
 * 3. Quote is in draft status
 * 4. Quote has at least one item
 *
 * Status transition: draft → sent (immutable, no rollback)
 *
 * @param db - Prisma client instance
 * @param params - Quote ID, user ID, contact info
 * @returns Updated quote with sent status
 * @throws TRPCError if validation fails
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
  db: DrizzleClient,
  params: SendQuoteToVendorParams
): Promise<SendQuoteToVendorResult> {
  const startTime = Date.now();
  const correlationId = generateCorrelationId("quote-send", params.userId);

  try {
    // Log operation start
    logSendToVendorStart(correlationId, params.quoteId, params.userId);

    // Fetch quote with items
    const quote = await findQuoteByIdWithItems(db, params.quoteId);

    // Validate all requirements
    validateSendToVendorRequirements(quote, params.quoteId, params.userId);

    // Log validation passed
    logQuoteValidationPassed(
      correlationId,
      params.quoteId,
      quote.items.length,
      quote.status
    );

    // Update quote to sent
    const now = new Date();
    const updatedQuote = await updateQuoteToSent(db, params.quoteId, {
      contactPhone: params.contactPhone,
      sentAt: now,
      status: "sent",
    });

    // Build result
    const result: SendQuoteToVendorResult = {
      contactEmail: params.contactEmail,
      contactPhone: updatedQuote.contactPhone ?? params.contactPhone,
      currency: updatedQuote.currency,
      id: updatedQuote.id,
      sentAt: updatedQuote.sentAt ?? now,
      status: updatedQuote.status as "sent",
      total: Number(updatedQuote.total),
    };

    // Log success
    logSendToVendorSuccess({
      correlationId,
      duration: Date.now() - startTime,
      quoteId: result.id,
      sentAt: result.sentAt,
      total: result.total.toString(),
    });

    return result;
  } catch (error) {
    // Log error
    logSendToVendorError(correlationId, error, Date.now() - startTime);

    // Re-throw known errors
    if (error instanceof TRPCError) {
      throw error;
    }

    // Wrap unknown errors
    throw new TRPCError({
      cause: error,
      code: "INTERNAL_SERVER_ERROR",
      message: "Error al enviar la cotización. Por favor intenta nuevamente.",
    });
  }
}

// ============================================================================
// Deprecated Functions (for backward compatibility)
// ============================================================================

/**
 * @deprecated This function is deprecated - manufacturer validation no longer needed
 * Will be removed when UI is updated to use TenantConfig
 *
 * @param _cartItems - Cart items (unused)
 * @param _expectedManufacturerId - Manufacturer ID (unused)
 */
export function validateCartManufacturerConsistency(
  _cartItems: CartItem[],
  _expectedManufacturerId: string
): void {
  // No-op for backward compatibility
  // This function will be removed in a future version
}
