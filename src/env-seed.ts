/**
 * Seed Environment Variables
 *
 * Simple access to environment variables for seed scripts.
 * Variables are read from process.env with sensible defaults.
 */

import "dotenv/config";

// Constants
const DEFAULT_QUOTE_VALIDITY_DAYS = 15;
const DEFAULT_TAX_RATE = 0;

// Helper to get env var with default
const getEnv = (key: string, defaultValue = ""): string =>
  process.env[key] || defaultValue;

// Helper to parse int with default
const getEnvInt = (key: string, defaultValue: number): number => {
  const val = process.env[key];
  return val ? Number.parseInt(val, 10) : defaultValue;
};

// Helper to parse float with default
const getEnvFloat = (key: string, defaultValue: number): number => {
  const val = process.env[key];
  return val ? Number.parseFloat(val) : defaultValue;
};

// Helper to parse boolean with default
const getEnvBool = (key: string, defaultValue: boolean): boolean => {
  const val = process.env[key];
  if (!val) {
    return defaultValue;
  }
  return val.toLowerCase() === "true" || val === "1";
};

export const envSeed = {
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

  // Tax configuration
  /** Tax name (e.g., "IVA", "ITBMS", "IGV") */
  TENANT_TAX_NAME: getEnv("NEXT_PUBLIC_TENANT_TAX_NAME") || null,
  /** Tax rate as decimal (e.g., 0.19 for 19%, 0.07 for 7%) */
  TENANT_TAX_RATE: getEnvFloat("NEXT_PUBLIC_TENANT_TAX_RATE", DEFAULT_TAX_RATE),
  /** Whether tax is enabled for quotes and invoices */
  TENANT_TAX_ENABLED: getEnvBool("NEXT_PUBLIC_TENANT_TAX_ENABLED", false),
  /** Legal description for tax (e.g., "ITBMS según Ley 9 de 1964") */
  TENANT_TAX_DESCRIPTION: getEnv("NEXT_PUBLIC_TENANT_TAX_DESCRIPTION") || null,
};
