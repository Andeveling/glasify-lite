/**
 * Seed Environment Variables
 *
 * Simple access to environment variables for seed scripts.
 * Variables are read from process.env with sensible defaults.
 */

import "dotenv/config";

// Constants
const DEFAULT_QUOTE_VALIDITY_DAYS = 15;

// Helper to get env var with default
const getEnv = (key: string, defaultValue = ""): string =>
  process.env[key] || defaultValue;

// Helper to parse int with default
const getEnvInt = (key: string, defaultValue: number): number => {
  const val = process.env[key];
  return val ? Number.parseInt(val, 10) : defaultValue;
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
};
