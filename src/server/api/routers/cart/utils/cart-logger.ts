/**
 * Cart Logger Utilities
 *
 * Structured logging for cart operations.
 * Uses Winston for server-side logging.
 *
 * @module server/api/routers/cart/utils/cart-logger
 */

import logger from "@/lib/logger";

// ============================================================================
// CART OPERATIONS LOGGING
// ============================================================================

export function logCartCreated(userId: string, cartId: string) {
  logger.info("Cart created", { userId, cartId });
}

export function logCartNotFound(userId: string) {
  logger.warn("Cart not found for user", { userId });
}

// ============================================================================
// ITEM OPERATIONS LOGGING
// ============================================================================

export function logItemAddStart(userId: string, modelId: string) {
  logger.info("Adding item to cart", { userId, modelId });
}

export function logItemAddSuccess(
  userId: string,
  itemId: string,
  modelName: string
) {
  logger.info("Item added to cart successfully", {
    userId,
    itemId,
    modelName,
  });
}

export function logItemAddError(userId: string, error: unknown) {
  logger.error("Failed to add item to cart", {
    userId,
    error: error instanceof Error ? error.message : "Unknown error",
  });
}

export function logItemUpdateStart(itemId: string) {
  logger.info("Updating cart item", { itemId });
}

export function logItemUpdateSuccess(itemId: string) {
  logger.info("Cart item updated successfully", { itemId });
}

export function logItemUpdateError(itemId: string, error: unknown) {
  logger.error("Failed to update cart item", {
    itemId,
    error: error instanceof Error ? error.message : "Unknown error",
  });
}

export function logItemRemoveStart(itemId: string) {
  logger.info("Removing item from cart", { itemId });
}

export function logItemRemoveSuccess(itemId: string) {
  logger.info("Item removed from cart successfully", { itemId });
}

export function logItemRemoveError(itemId: string, error: unknown) {
  logger.error("Failed to remove item from cart", {
    itemId,
    error: error instanceof Error ? error.message : "Unknown error",
  });
}

export function logCartClearStart(userId: string) {
  logger.info("Clearing cart", { userId });
}

export function logCartClearSuccess(userId: string, itemCount: number) {
  logger.info("Cart cleared successfully", { userId, itemCount });
}

export function logCartClearError(userId: string, error: unknown) {
  logger.error("Failed to clear cart", {
    userId,
    error: error instanceof Error ? error.message : "Unknown error",
  });
}

export function logCartFetchStart(userId: string) {
  logger.info("Fetching cart items", { userId });
}

export function logCartFetchSuccess(userId: string, itemCount: number) {
  logger.info("Cart items fetched successfully", { userId, itemCount });
}

export function logCartFetchError(userId: string, error: unknown) {
  logger.error("Failed to fetch cart items", {
    userId,
    error: error instanceof Error ? error.message : "Unknown error",
  });
}

// ============================================================================
// VALIDATION LOGGING
// ============================================================================

export function logModelNotFound(modelId: string) {
  logger.warn("Model not found", { modelId });
}

export function logGlassTypeNotFound(glassTypeId: string) {
  logger.warn("Glass type not found", { glassTypeId });
}

export function logColorNotFound(colorId: string) {
  logger.warn("Color not found", { colorId });
}

// ============================================================================
// PRICE CALCULATION LOGGING
// ============================================================================

export function logPriceCalculation(data: {
  modelId: string;
  basePrice: number;
  heightMm: number;
  widthMm: number;
  quantity: number;
  subtotal: number;
}) {
  logger.debug("Price calculated for cart item", data);
}
