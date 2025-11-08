/**
 * Field length limits for Model schema
 */
export const MODEL_FIELD_LENGTHS = {
  ID: 36, // CUID length
  NAME: 255,
  IMAGE_URL: 2048,
  COST_NOTES: 2000,
} as const;

/**
 * Decimal precision constants for Model pricing
 */
export const MODEL_PRECISION = {
  BASE_PRICE: { precision: 12, scale: 4 },
  COST_PER_MM: { precision: 12, scale: 4 },
  ACCESSORY_PRICE: { precision: 12, scale: 4 },
  PROFIT_MARGIN: { precision: 5, scale: 2 }, // Percentage (0.00 to 100.00)
} as const;
