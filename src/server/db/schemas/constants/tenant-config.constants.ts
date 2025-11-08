/**
 * Field length limits for TenantConfig schema
 */
export const TENANT_CONFIG_FIELD_LENGTHS = {
  ID: 1, // Fixed singleton ID
  BUSINESS_NAME: 255,
  LOCALE: 10, // IETF BCP 47 format (e.g., "es-CO")
  TIMEZONE: 50, // IANA timezone identifier
  CONTACT_EMAIL: 320,
  CONTACT_PHONE: 20,
  BUSINESS_ADDRESS: 500,
  LOGO_URL: 2048,
  SOCIAL_URL: 2048,
  WHATSAPP_NUMBER: 15, // E.164 format
  WAREHOUSE_CITY: 100,
} as const;

/**
 * Decimal precision constants for TenantConfig
 */
export const TENANT_CONFIG_PRECISION = {
  WAREHOUSE_COORDINATES: { precision: 10, scale: 7 }, // WGS84 coordinates
  TRANSPORT_RATES: { precision: 10, scale: 2 }, // Currency amounts
} as const;
