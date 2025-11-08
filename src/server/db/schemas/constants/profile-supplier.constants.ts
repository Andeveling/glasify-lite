/**
 * Field length limits for ProfileSupplier schema
 */
export const PROFILE_SUPPLIER_FIELD_LENGTHS = {
  ID: 36, // CUID length
  NAME: 255,
  NOTES: 1000,
} as const;
