/**
 * Field length limits and constants for database schema
 * Centralized to maintain consistency across all schemas
 */

export const FIELD_LENGTHS = {
  // User
  USER: {
    ID: 36, // CUID length
    NAME: 255,
    EMAIL: 320, // RFC 5321 limit
    IMAGE_URL: 2048,
  },
  // Account (OAuth)
  ACCOUNT: {
    ID: 36,
    ACCOUNT_ID: 255,
    PROVIDER_ID: 255,
    ACCESS_TOKEN: 4096,
    REFRESH_TOKEN: 4096,
    ID_TOKEN: 4096,
    SCOPE: 1024,
    PASSWORD: 255,
  },
  // Session
  SESSION: {
    ID: 36,
    TOKEN: 1024,
    IP_ADDRESS: 45, // IPv6 max length
    USER_AGENT: 512,
  },
  // Verification Token
  VERIFICATION_TOKEN: {
    IDENTIFIER: 255,
    TOKEN: 1024,
  },
  // Verification
  VERIFICATION: {
    ID: 36,
    IDENTIFIER: 255,
    VALUE: 1024,
  },
  // Tenant Config
  TENANT_CONFIG: {
    ID: 1, // Fixed singleton ID
    BUSINESS_NAME: 255,
    CURRENCY: 3, // ISO 4217 code
    LOCALE: 10, // IETF BCP 47 format (e.g., "es-CO")
    TIMEZONE: 50, // IANA timezone identifier
    CONTACT_EMAIL: 320,
    CONTACT_PHONE: 20,
    BUSINESS_ADDRESS: 500,
    LOGO_URL: 2048,
    SOCIAL_URL: 2048,
    WHATSAPP_NUMBER: 15, // E.164 format
    WAREHOUSE_CITY: 100,
  },
} as const;

/**
 * Geographic and numeric constraints for validation
 */
export const GEO_CONSTRAINTS = {
  LATITUDE: {
    MIN: -90,
    MAX: 90,
  },
  LONGITUDE: {
    MIN: -180,
    MAX: 180,
  },
} as const;

/**
 * ISO standards and format constraints
 */
export const ISO_CONSTRAINTS = {
  CURRENCY_CODE_LENGTH: 3, // ISO 4217
} as const;
