/**
 * Quote Validator - Validation logic for quote operations
 *
 * Single Responsibility: Validate quote business rules
 * Dependency Inversion: Depends on abstractions (types), not implementations
 *
 * @module server/api/routers/quote/validators/quote-validator
 */

import { TRPCError } from "@trpc/server";
import type { CartItem } from "@/types/cart.types";

/** Minimum number of items required in cart */
const MIN_CART_ITEMS = 1;

/** Maximum number of items allowed in cart */
const MAX_CART_ITEMS = 20;

/**
 * Quote validation result
 */
export type QuoteValidationResult = {
  isValid: boolean;
  error?: {
    code: string;
    message: string;
  };
};

/**
 * Quote status for validation
 */
export type QuoteForValidation = {
  id: string;
  status: string;
  userId: string | null;
  items: Array<{ id: string }>;
};

/**
 * Validate cart items are not empty
 *
 * @param cartItems - Cart items to validate
 * @throws TRPCError if cart is empty
 */
export function validateCartNotEmpty(cartItems: CartItem[]): void {
  if (cartItems.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "El carrito está vacío. Debe agregar al menos un item.",
    });
  }
}

/**
 * Validate cart items count within limits
 *
 * @param cartItems - Cart items to validate
 * @throws TRPCError if cart exceeds limits
 */
export function validateCartItemsCount(cartItems: CartItem[]): void {
  if (cartItems.length < MIN_CART_ITEMS) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "El carrito debe contener al menos un item.",
    });
  }

  if (cartItems.length > MAX_CART_ITEMS) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `El carrito no puede contener más de ${MAX_CART_ITEMS} items.`,
    });
  }
}

/**
 * Validate quote exists
 *
 * @param quote - Quote to validate (null if not found)
 * @param quoteId - Quote ID for error message
 * @throws TRPCError if quote not found
 */
export function validateQuoteExists(
  quote: QuoteForValidation | null,
  _quoteId: string
): asserts quote is QuoteForValidation {
  if (!quote) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Cotización no encontrada",
    });
  }
}

/**
 * Validate quote ownership
 *
 * @param quote - Quote to validate
 * @param userId - User ID to check ownership
 * @throws TRPCError if user doesn't own the quote
 */
export function validateQuoteOwnership(
  quote: QuoteForValidation,
  userId: string
): void {
  if (quote.userId !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message:
        "No tienes permiso para acceder a esta cotización. Solo puedes ver tus propias cotizaciones.",
    });
  }
}

/**
 * Validate quote is in draft status
 *
 * @param quote - Quote to validate
 * @throws TRPCError if quote is not in draft status
 */
export function validateQuoteIsDraft(quote: QuoteForValidation): void {
  if (quote.status !== "draft") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Solo se pueden enviar cotizaciones en estado borrador",
    });
  }
}

/**
 * Validate quote has items
 *
 * @param quote - Quote to validate
 * @throws TRPCError if quote has no items
 */
export function validateQuoteHasItems(quote: QuoteForValidation): void {
  if (quote.items.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "La cotización no tiene items. Debe agregar al menos un item antes de enviarla.",
    });
  }
}

/**
 * Validate all send-to-vendor requirements
 *
 * Combines all validations for sending a quote to vendor:
 * - Quote exists
 * - User owns the quote
 * - Quote is in draft status
 * - Quote has at least one item
 *
 * @param quote - Quote to validate (null if not found)
 * @param quoteId - Quote ID for error messages
 * @param userId - User ID to check ownership
 * @throws TRPCError if any validation fails
 */
export function validateSendToVendorRequirements(
  quote: QuoteForValidation | null,
  quoteId: string,
  userId: string
): asserts quote is QuoteForValidation {
  validateQuoteExists(quote, quoteId);
  validateQuoteOwnership(quote, userId);
  validateQuoteIsDraft(quote);
  validateQuoteHasItems(quote);
}
