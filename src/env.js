/**
 * Environment Variables
 *
 * Simple direct access to environment variables without complex validation.
 * Variables are read from process.env with sensible defaults.
 */

// Constants
const DEFAULT_QUOTE_VALIDITY_DAYS = 15;
const DEFAULT_EXPORT_MAX_ITEMS = 100;

// Helper to get env var with default
const getEnv = (key, defaultValue = "") => process.env[key] || defaultValue;

// Helper to parse int with default
const getEnvInt = (key, defaultValue) => {
  const val = process.env[key];
  return val ? Number.parseInt(val, 10) : defaultValue;
};

// Export simple env object
export const env = {
  // Client-side variables (NEXT_PUBLIC_*)
  NEXT_PUBLIC_BASE_URL: getEnv("NEXT_PUBLIC_BASE_URL"),
  NEXT_PUBLIC_BETTER_AUTH_URL: getEnv("NEXT_PUBLIC_BETTER_AUTH_URL"),
  NEXT_PUBLIC_TENANT_BUSINESS_NAME: getEnv(
    "NEXT_PUBLIC_TENANT_BUSINESS_NAME",
    "Vitro Rojas Panamá"
  ),
  NEXT_PUBLIC_TENANT_CONTACT_EMAIL: getEnv("NEXT_PUBLIC_TENANT_CONTACT_EMAIL"),
  NEXT_PUBLIC_TENANT_CONTACT_PHONE: getEnv("NEXT_PUBLIC_TENANT_CONTACT_PHONE"),
  NEXT_PUBLIC_TENANT_BUSINESS_ADDRESS: getEnv(
    "NEXT_PUBLIC_TENANT_BUSINESS_ADDRESS"
  ),
  NEXT_PUBLIC_TENANT_CURRENCY: getEnv("NEXT_PUBLIC_TENANT_CURRENCY", "USD"),
  NEXT_PUBLIC_TENANT_LOCALE: getEnv("NEXT_PUBLIC_TENANT_LOCALE", "es-PA"),
  NEXT_PUBLIC_TENANT_QUOTE_VALIDITY_DAYS: getEnvInt(
    "NEXT_PUBLIC_TENANT_QUOTE_VALIDITY_DAYS",
    DEFAULT_QUOTE_VALIDITY_DAYS
  ),
  NEXT_PUBLIC_TENANT_TIMEZONE: getEnv(
    "NEXT_PUBLIC_TENANT_TIMEZONE",
    "America/Panama"
  ),
  NEXT_PUBLIC_VERCEL_ENV: getEnv("NEXT_PUBLIC_VERCEL_ENV"),
  NEXT_PUBLIC_VERCEL_URL: getEnv("NEXT_PUBLIC_VERCEL_URL"),
  NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: getEnv(
    "NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL"
  ),

  // Server-side variables
  ADMIN_EMAIL: getEnv("ADMIN_EMAIL"),
  AUTH_GOOGLE_ID: getEnv("AUTH_GOOGLE_ID"),
  AUTH_GOOGLE_SECRET: getEnv("AUTH_GOOGLE_SECRET"),
  BASE_URL: getEnv("BASE_URL"),
  BETTER_AUTH_SECRET: getEnv("BETTER_AUTH_SECRET"),
  BETTER_AUTH_URL: getEnv("BETTER_AUTH_URL"),
  DATABASE_URL: getEnv("DATABASE_URL"),
  PRISMA_CONNECTION_LIMIT: getEnvInt("PRISMA_CONNECTION_LIMIT", undefined),
  NODE_ENV: getEnv("NODE_ENV", "development"),

  // Tenant aliases (server-side access to NEXT_PUBLIC_*)
  TENANT_BUSINESS_ADDRESS: getEnv("NEXT_PUBLIC_TENANT_BUSINESS_ADDRESS"),
  TENANT_BUSINESS_NAME: getEnv(
    "NEXT_PUBLIC_TENANT_BUSINESS_NAME",
    "Vitro Rojas Panamá"
  ),
  TENANT_CONTACT_EMAIL: getEnv("NEXT_PUBLIC_TENANT_CONTACT_EMAIL"),
  TENANT_CONTACT_PHONE: getEnv("NEXT_PUBLIC_TENANT_CONTACT_PHONE"),
  TENANT_CURRENCY: getEnv("NEXT_PUBLIC_TENANT_CURRENCY", "USD"),
  TENANT_LOCALE: getEnv("NEXT_PUBLIC_TENANT_LOCALE", "es-PA"),
  TENANT_QUOTE_VALIDITY_DAYS: getEnvInt(
    "NEXT_PUBLIC_TENANT_QUOTE_VALIDITY_DAYS",
    DEFAULT_QUOTE_VALIDITY_DAYS
  ),
  TENANT_TIMEZONE: getEnv("NEXT_PUBLIC_TENANT_TIMEZONE", "America/Panama"),

  // Export configuration
  RESEND_API_KEY: getEnv("RESEND_API_KEY"),
  FROM_EMAIL: getEnv("FROM_EMAIL"),
  EXPORT_PDF_PAGE_SIZE: getEnv("EXPORT_PDF_PAGE_SIZE", "A4"),
  EXPORT_MAX_ITEMS: getEnvInt("EXPORT_MAX_ITEMS", DEFAULT_EXPORT_MAX_ITEMS),
};
