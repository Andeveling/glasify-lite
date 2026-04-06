/**
 * Compatible Glass Types Utility
 *
 * Handles JSON serialization/deserialization of the Model.compatibleGlassTypeIds field.
 * SQLite stores this as a JSON string, but the API expects string[].
 *
 * @module lib/utils/compatible-glass-types
 */

/**
 * Parse JSON string from DB → string[] for runtime use
 *
 * @param value - JSON string from DB (e.g., '["glass-1","glass-2"]') or null
 * @returns Array of glass type IDs, or empty array if invalid/empty
 */
export function parseCompatibleGlassTypeIds(value: string | null): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Serialize string[] → JSON string for DB storage
 *
 * @param ids - Array of glass type IDs
 * @returns JSON string for DB storage (e.g., '["glass-1","glass-2"]')
 */
export function stringifyCompatibleGlassTypeIds(ids: string[]): string {
  return JSON.stringify(ids);
}
