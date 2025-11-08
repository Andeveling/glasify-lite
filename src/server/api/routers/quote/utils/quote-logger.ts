/**
 * Quote Logger - Centralized logging for quote operations
 *
 * Single Responsibility: Quote-specific logging
 * Open/Closed: Open for new log methods, closed for modification
 *
 * @module server/api/routers/quote/utils/quote-logger
 */

import logger from "@/lib/logger";

/** Correlation ID prefix length for userId truncation */
const CORRELATION_ID_USER_PREFIX_LENGTH = 8;

/**
 * Generate correlation ID for quote operations
 *
 * @param operation - Operation name (quote-gen, quote-send, etc.)
 * @param userId - User ID
 * @returns Correlation ID
 */
export function generateCorrelationId(
  operation: string,
  userId: string
): string {
  const timestamp = Date.now();
  const userPrefix = userId.slice(0, CORRELATION_ID_USER_PREFIX_LENGTH);
  return `${operation}-${timestamp}-${userPrefix}`;
}

/**
 * Log quote generation start
 *
 * @param correlationId - Correlation ID
 * @param userId - User ID
 * @param itemCount - Number of items in cart
 */
export function logQuoteGenerationStart(
  correlationId: string,
  userId: string,
  itemCount: number
): void {
  logger.info("[QuoteService] Starting quote generation", {
    correlationId,
    itemCount,
    userId,
  });
}

/**
 * Log quote generation success
 *
 * @param correlationId - Correlation ID
 * @param quoteId - Created quote ID
 * @param itemCount - Number of items created
 * @param duration - Operation duration in ms
 */
export function logQuoteGenerationSuccess(
  correlationId: string,
  quoteId: string,
  itemCount: number,
  duration: number
): void {
  logger.info("[QuoteService] Quote generated successfully", {
    correlationId,
    duration: `${duration}ms`,
    itemCount,
    quoteId,
  });
}

/**
 * Log quote generation error
 *
 * @param correlationId - Correlation ID
 * @param error - Error instance
 * @param duration - Operation duration in ms
 */
export function logQuoteGenerationError(
  correlationId: string,
  error: unknown,
  duration: number
): void {
  logger.error("[QuoteService] Quote generation failed", {
    correlationId,
    duration: `${duration}ms`,
    error: error instanceof Error ? error.message : "Unknown error",
  });
}

/**
 * Log delivery address creation
 *
 * @param correlationId - Correlation ID
 * @param quoteId - Quote ID
 */
export function logDeliveryAddressCreated(
  correlationId: string,
  quoteId: string
): void {
  logger.info("[QuoteService] ProjectAddress created", {
    correlationId,
    quoteId,
  });
}

/**
 * Log delivery address creation failure
 *
 * @param correlationId - Correlation ID
 * @param quoteId - Quote ID
 * @param error - Error instance
 */
export function logDeliveryAddressError(
  correlationId: string,
  quoteId: string,
  error: unknown
): void {
  logger.warn("[QuoteService] Failed to create ProjectAddress", {
    correlationId,
    error: error instanceof Error ? error.message : "Unknown error",
    quoteId,
  });
}

/**
 * Log send to vendor start
 *
 * @param correlationId - Correlation ID
 * @param quoteId - Quote ID
 * @param userId - User ID
 */
export function logSendToVendorStart(
  correlationId: string,
  quoteId: string,
  userId: string
): void {
  logger.info("[QuoteService] Starting quote submission to vendor", {
    correlationId,
    quoteId,
    userId,
  });
}

/**
 * Log quote validation passed
 *
 * @param correlationId - Correlation ID
 * @param quoteId - Quote ID
 * @param itemCount - Number of items
 * @param status - Quote status
 */
export function logQuoteValidationPassed(
  correlationId: string,
  quoteId: string,
  itemCount: number,
  status: string
): void {
  logger.info("[QuoteService] Quote validation passed", {
    correlationId,
    itemCount,
    quoteId,
    status,
  });
}

/**
 * Log send to vendor success
 *
 * @param params - Success log parameters
 */
export function logSendToVendorSuccess(params: {
  correlationId: string;
  quoteId: string;
  sentAt: Date;
  total: string;
  duration: number;
}): void {
  logger.info("[QuoteService] Quote sent to vendor successfully", {
    correlationId: params.correlationId,
    duration: `${params.duration}ms`,
    quoteId: params.quoteId,
    sentAt: params.sentAt.toISOString(),
    status: "sent",
    total: params.total,
  });
}

/**
 * Log send to vendor error
 *
 * @param correlationId - Correlation ID
 * @param error - Error instance
 * @param duration - Operation duration in ms
 */
export function logSendToVendorError(
  correlationId: string,
  error: unknown,
  duration: number
): void {
  logger.error("[QuoteService] Quote submission failed", {
    correlationId,
    duration: `${duration}ms`,
    error: error instanceof Error ? error.message : "Unknown error",
  });
}
