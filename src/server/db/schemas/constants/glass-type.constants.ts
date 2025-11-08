/**
 * Field length limits for GlassType schema
 */
export const GLASS_TYPE_FIELD_LENGTHS = {
  ID: 36, // CUID length
  NAME: 255,
  CODE: 100, // Manufacturer product code
  SERIES: 100, // Product line grouping
  MANUFACTURER: 255, // Manufacturer name
  DESCRIPTION: 2000,
  SEED_VERSION: 10, // Seed data version (e.g., "1.0", "1.1")
} as const;

/**
 * Decimal precision constants for GlassType
 */
export const GLASS_TYPE_PRECISION = {
  PRICE_PER_SQM: { precision: 12, scale: 4 },
  U_VALUE: { precision: 5, scale: 2 }, // Transmitancia térmica (W/m²·K)
  SOLAR_FACTOR: { precision: 4, scale: 2 }, // 0.00 to 1.00
  LIGHT_TRANSMISSION: { precision: 4, scale: 2 }, // 0.00 to 1.00
} as const;

/**
 * Validation constraints for GlassType numeric fields
 */
export const GLASS_TYPE_CONSTRAINTS = {
  SOLAR_FACTOR: { min: 0, max: 1 },
  LIGHT_TRANSMISSION: { min: 0, max: 1 },
  THICKNESS_MM: { min: 1, max: 100 },
} as const;
