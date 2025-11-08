/**
 * Field length limits for ModelCostBreakdown schema
 */
export const MODEL_COST_BREAKDOWN_FIELD_LENGTHS = {
  ID: 36, // CUID length
  MODEL_ID: 36, // CUID length (foreign key)
  COMPONENT: 255,
  NOTES: 1000,
} as const;

/**
 * Decimal precision constants for ModelCostBreakdown
 */
export const MODEL_COST_BREAKDOWN_DECIMAL_PRECISION = {
  UNIT_COST: { precision: 12, scale: 4 }, // Max: 99,999,999.9999
} as const;
