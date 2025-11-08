/**
 * Field length limits for GlassSupplier schema
 */
export const GLASS_SUPPLIER_FIELD_LENGTHS = {
  ID: 36, // CUID length
  TENANT_CONFIG_ID: 1, // Fixed singleton ID reference
  NAME: 255,
  CODE: 20, // Short code (e.g., 'GRD', 'SGG')
  COUNTRY: 100,
  WEBSITE: 2048,
  CONTACT_EMAIL: 320, // RFC 5321 limit
  CONTACT_PHONE: 20,
  NOTES: 2000,
} as const;
