/**
 * Field length limits for Color schema
 */
export const COLOR_FIELD_LENGTHS = {
  ID: 36, // CUID length
  NAME: 50,
  RAL_CODE: 10, // e.g., "RAL 9010"
  HEX_CODE: 7, // Format: #RRGGBB
} as const;
