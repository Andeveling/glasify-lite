/**
 * Field length limits for ModelColor schema
 */
export const MODEL_COLOR_FIELD_LENGTHS = {
  ID: 36, // CUID length
  MODEL_ID: 36, // CUID length (foreign key)
  COLOR_ID: 36, // CUID length (foreign key)
} as const;

/**
 * Decimal precision constants for ModelColor
 */
export const MODEL_COLOR_DECIMAL_PRECISION = {
  SURCHARGE_PERCENTAGE: { precision: 5, scale: 2 }, // Max: 999.99%
} as const;
