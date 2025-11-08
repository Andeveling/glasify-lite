/**
 * Field length limits for Adjustment schema
 */
export const ADJUSTMENT_FIELD_LENGTHS = {
  ID: 36, // CUID length
  QUOTE_ID: 36, // CUID length (foreign key, optional)
  QUOTE_ITEM_ID: 36, // CUID length (foreign key, optional)
  CONCEPT: 255,
} as const;

/**
 * Decimal precision constants for Adjustment
 */
export const ADJUSTMENT_DECIMAL_PRECISION = {
  VALUE: { precision: 12, scale: 4 }, // Max: 99,999,999.9999
  AMOUNT: { precision: 12, scale: 4 }, // Max: 99,999,999.9999
} as const;
