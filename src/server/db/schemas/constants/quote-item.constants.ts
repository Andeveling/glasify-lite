/**
 * Field length limits for QuoteItem schema
 */
export const QUOTE_ITEM_FIELD_LENGTHS = {
  ID: 36, // CUID length
  QUOTE_ID: 36, // CUID length (foreign key)
  MODEL_ID: 36, // CUID length (foreign key)
  GLASS_TYPE_ID: 36, // CUID length (foreign key)
  COLOR_ID: 36, // CUID length (foreign key, optional)
  NAME: 50,
  ROOM_LOCATION: 100,
  COLOR_HEX_CODE: 7, // Format: #RRGGBB
  COLOR_NAME: 50,
} as const;

/**
 * Decimal precision constants for QuoteItem
 */
export const QUOTE_ITEM_DECIMAL_PRECISION = {
  SUBTOTAL: { precision: 12, scale: 4 }, // Max: 99,999,999.9999
  COLOR_SURCHARGE_PERCENTAGE: { precision: 5, scale: 2 }, // Max: 999.99%
} as const;
