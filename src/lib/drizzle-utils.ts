/**
 * Drizzle Utilities
 *
 * Utility functions for working with Drizzle ORM types
 */

/**
 * Safely converts a decimal value to number
 * Handles null/undefined values and ensures numeric conversion
 */
export function safeDecimalToNumber(value: number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return Number(value);
}
