/**
 * Field length limits for Quote schema
 */
export const QUOTE_FIELD_LENGTHS = {
  ID: 36, // CUID length
  USER_ID: 36, // CUID length (foreign key)
  CURRENCY: 3, // ISO 4217 currency code (e.g., "USD", "COP")
  PROJECT_NAME: 100,
  PROJECT_STREET: 200, // Deprecated field
  PROJECT_CITY: 100, // Deprecated field
  PROJECT_STATE: 100, // Deprecated field
  PROJECT_POSTAL_CODE: 20, // Deprecated field
} as const;

/**
 * Decimal precision constants for Quote
 */
export const QUOTE_DECIMAL_PRECISION = {
  TOTAL: { precision: 12, scale: 4 }, // Max: 99,999,999.9999
} as const;
