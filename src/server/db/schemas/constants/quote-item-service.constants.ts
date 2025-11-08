/**
 * Field length limits for QuoteItemService schema
 */
export const QUOTE_ITEM_SERVICE_FIELD_LENGTHS = {
  ID: 36, // CUID length
  QUOTE_ITEM_ID: 36, // CUID length (foreign key)
  SERVICE_ID: 36, // CUID length (foreign key)
} as const;

/**
 * Decimal precision constants for QuoteItemService
 */
export const QUOTE_ITEM_SERVICE_DECIMAL_PRECISION = {
  QUANTITY: { precision: 12, scale: 4 }, // Max: 99,999,999.9999
  AMOUNT: { precision: 12, scale: 4 }, // Max: 99,999,999.9999
} as const;
