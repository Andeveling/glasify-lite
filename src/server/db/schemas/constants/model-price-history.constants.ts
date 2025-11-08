/**
 * Field length limits for ModelPriceHistory schema
 */
export const MODEL_PRICE_HISTORY_FIELD_LENGTHS = {
  ID: 36, // CUID length
  MODEL_ID: 36, // CUID length (foreign key)
  REASON: 255,
  CREATED_BY: 36, // CUID length (foreign key, optional)
} as const;

/**
 * Decimal precision constants for ModelPriceHistory
 */
export const MODEL_PRICE_HISTORY_DECIMAL_PRECISION = {
  BASE_PRICE: { precision: 12, scale: 4 }, // Max: 99,999,999.9999
  COST_PER_MM_WIDTH: { precision: 12, scale: 4 }, // Max: 99,999,999.9999
  COST_PER_MM_HEIGHT: { precision: 12, scale: 4 }, // Max: 99,999,999.9999
} as const;
