/**
 * Field length limits for Service schema
 */
export const SERVICE_FIELD_LENGTHS = {
  ID: 36, // CUID length
  NAME: 255,
} as const;

/**
 * Decimal precision constants for Service
 */
export const SERVICE_DECIMAL_PRECISION = {
  RATE: { precision: 12, scale: 4 },
  MINIMUM_BILLING_UNIT: { precision: 10, scale: 4 },
} as const;
