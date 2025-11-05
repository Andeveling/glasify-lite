/**
 * Generate Item Name Utility
 *
 * Generates unique sequential names for cart items based on model prefix.
 * Implements "Don't Make Me Think" principle with auto-generated names.
 *
 * Pattern: {MODEL_PREFIX}-{SEQUENCE}
 * Examples: "VEKA-001", "VEKA-002", "GUARDIAN-001"
 *
 * @module lib/utils/generate-item-name
 */

import type { CartItem } from "@/types/cart.types";

// ============================================================================
// Constants
// ============================================================================

const MAX_PREFIX_LENGTH = 10;
const SEQUENCE_PADDING = 3;
const COLLISION_TIMESTAMP_LENGTH = 4;
const FALLBACK_TIMESTAMP_LENGTH = 6;
const MAX_NAME_LENGTH = 50;

// Regex for splitting model name into words
const WORD_SEPARATOR_REGEX = /[\s\-_]/;

// ============================================================================
// Name Generation
// ============================================================================

/**
 * Extract model prefix from model name
 *
 * Rules:
 * 1. Take first word (up to first space, hyphen, or underscore)
 * 2. Convert to uppercase
 * 3. Limit to 10 characters for readability
 *
 * @example
 * extractModelPrefix("VEKA Premium") → "VEKA"
 * extractModelPrefix("Guardian 6mm Templado") → "GUARDIAN"
 * extractModelPrefix("modelo-especial") → "MODELO"
 */
export function extractModelPrefix(modelName: string): string {
  if (!modelName || typeof modelName !== "string") {
    return "ITEM";
  }

  const cleaned = modelName.trim();
  if (cleaned.length === 0) {
    return "ITEM";
  }

  // Extract first word (stop at space, hyphen, underscore)
  const firstWord = cleaned.split(WORD_SEPARATOR_REGEX)[0];

  if (!firstWord) {
    return "ITEM";
  }

  // Convert to uppercase and limit length
  const prefix = firstWord.toUpperCase().slice(0, MAX_PREFIX_LENGTH);

  return prefix;
}

/**
 * Find next available sequence number for a given prefix
 *
 * Scans existing cart items to find the highest sequence number
 * for the given prefix, then returns next available number.
 *
 * @param prefix - Model prefix (e.g., "VEKA")
 * @param existingItems - Current cart items
 * @returns Next sequence number (1-indexed, zero-padded to 3 digits)
 *
 * @example
 * // Cart has "VEKA-001", "VEKA-002"
 * findNextSequence("VEKA", cartItems) → "003"
 *
 * // Cart is empty
 * findNextSequence("VEKA", []) → "001"
 *
 * // Cart has other prefixes only
 * findNextSequence("GUARDIAN", cartItems) → "001"
 */
export function findNextSequence(
  prefix: string,
  existingItems: CartItem[]
): string {
  if (!prefix || typeof prefix !== "string") {
    return "001";
  }

  if (!existingItems || existingItems.length === 0) {
    return "001";
  }

  // Pattern: {PREFIX}-{SEQUENCE}
  const prefixPattern = new RegExp(`^${prefix}-(\\d+)$`, "i");

  // Find all items matching this prefix
  const matchingSequences = existingItems
    .map((item) => {
      const match = item.name.match(prefixPattern);
      return match?.[1] ? Number.parseInt(match[1], 10) : 0;
    })
    .filter((seq) => seq > 0);

  // Find highest sequence number
  const maxSequence =
    matchingSequences.length > 0 ? Math.max(...matchingSequences) : 0;

  // Return next sequence (zero-padded to 3 digits)
  const nextSequence = maxSequence + 1;
  return nextSequence.toString().padStart(SEQUENCE_PADDING, "0");
}

/**
 * Generate unique item name for cart
 *
 * Combines model prefix with sequential number to create unique name.
 * Ensures name doesn't conflict with existing cart items.
 *
 * @param modelName - Full model name from database
 * @param existingItems - Current cart items (to check for conflicts)
 * @returns Generated unique name
 *
 * @example
 * generateItemName("VEKA Premium", []) → "VEKA-001"
 * generateItemName("VEKA Premium", [{ name: "VEKA-001" }]) → "VEKA-002"
 * generateItemName("Guardian 6mm", []) → "GUARDIAN-001"
 *
 * @throws Never - Always returns a valid name (fallback to "ITEM-XXX")
 */
export function generateItemName(
  modelName: string,
  existingItems: CartItem[]
): string {
  try {
    const prefix = extractModelPrefix(modelName);
    const sequence = findNextSequence(prefix, existingItems);
    const generatedName = `${prefix}-${sequence}`;

    // Final safety check: ensure name is unique
    const isUnique = !existingItems.some((item) => item.name === generatedName);

    if (!isUnique) {
      // Extremely unlikely: collision detected, append timestamp
      const timestamp = Date.now()
        .toString()
        .slice(-COLLISION_TIMESTAMP_LENGTH);
      return `${prefix}-${sequence}-${timestamp}`;
    }

    return generatedName;
  } catch {
    // Fallback: use generic name with timestamp
    const timestamp = Date.now().toString().slice(-FALLBACK_TIMESTAMP_LENGTH);
    return `ITEM-${timestamp}`;
  }
}

// ============================================================================
// Name Validation
// ============================================================================

/**
 * Check if a name is unique within cart
 *
 * @param name - Name to validate
 * @param existingItems - Current cart items
 * @param excludeItemId - Optional item ID to exclude from check (for updates)
 * @returns True if name is unique, false if duplicate found
 */
export function isNameUnique(
  name: string,
  existingItems: CartItem[],
  excludeItemId?: string
): boolean {
  if (!name || typeof name !== "string") {
    return false;
  }

  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return false;
  }

  return !existingItems.some((item) => {
    // Skip if this is the item being updated
    if (excludeItemId && item.id === excludeItemId) {
      return false;
    }

    // Case-insensitive comparison
    return item.name.toLowerCase() === trimmedName.toLowerCase();
  });
}

/**
 * Validate item name format and uniqueness
 *
 * @param name - Name to validate
 * @param existingItems - Current cart items
 * @param excludeItemId - Optional item ID to exclude from check
 * @returns Validation result with error message if invalid
 */
export function validateItemName(
  name: string,
  existingItems: CartItem[],
  excludeItemId?: string
): { valid: boolean; error?: string } {
  if (!name || typeof name !== "string") {
    return { error: "El nombre es requerido", valid: false };
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return { error: "El nombre no puede estar vacío", valid: false };
  }

  if (trimmedName.length > MAX_NAME_LENGTH) {
    return { error: "El nombre no puede exceder 50 caracteres", valid: false };
  }

  if (!isNameUnique(trimmedName, existingItems, excludeItemId)) {
    return { error: "Ya existe un item con este nombre", valid: false };
  }

  return { valid: true };
}
