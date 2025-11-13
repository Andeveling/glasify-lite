/**
 * Tenant Configuration Utilities
 *
 * Helper functions to access the singleton TenantConfig using Drizzle ORM
 *
 * @see /plan/refactor-manufacturer-to-tenant-config-1.md
 */

import { env } from "@/env";
import logger from "@/lib/logger";
import { db } from "../db/drizzle";
import { tenantConfigs } from "../db/schema";

const DEFAULT_QUOTE_VALIDITY_DAYS = 15 as const;

// Default values used when no TenantConfig exists yet
const DEFAULTS = {
  businessName: "Glasify Lite",
  currency: (env.TENANT_CURRENCY as string | undefined) ?? "COP",
  locale: (env.TENANT_LOCALE as string | undefined) ?? "es-CO",
  quoteValidityDays:
    (env.TENANT_QUOTE_VALIDITY_DAYS as number | undefined) ??
    DEFAULT_QUOTE_VALIDITY_DAYS,
  timezone: (env.TENANT_TIMEZONE as string | undefined) ?? "America/Bogota",
  contactEmail: (env.TENANT_CONTACT_EMAIL as string | undefined) ?? null,
  contactPhone: (env.TENANT_CONTACT_PHONE as string | undefined) ?? null,
  businessAddress: (env.TENANT_BUSINESS_ADDRESS as string | undefined) ?? null,
  logoUrl: null as string | null,
  primaryColor: "#3B82F6",
  secondaryColor: "#1E40AF",
} as const;

async function ensureTenantConfig(): Promise<Record<string, unknown>> {
  const result = await db.select().from(tenantConfigs).limit(1);
  if (result[0]) {
    return result[0] as Record<string, unknown>;
  }

  // Attempt lazy bootstrap with safe defaults (id defaults to "1")
  try {
    await db.insert(tenantConfigs).values({
      businessName: env.TENANT_BUSINESS_NAME ?? DEFAULTS.businessName,
      currency: DEFAULTS.currency,
      locale: DEFAULTS.locale,
      quoteValidityDays: DEFAULTS.quoteValidityDays,
      timezone: DEFAULTS.timezone,
      contactEmail: DEFAULTS.contactEmail,
      contactPhone: DEFAULTS.contactPhone,
      businessAddress: DEFAULTS.businessAddress,
      logoUrl: DEFAULTS.logoUrl,
      primaryColor: DEFAULTS.primaryColor,
      secondaryColor: DEFAULTS.secondaryColor,
    });

    logger.warn("TenantConfig was missing. Inserted a default configuration.", {
      action: "bootstrap-tenant-config",
    });

    const afterInsert = await db.select().from(tenantConfigs).limit(1);
    if (afterInsert[0]) {
      return afterInsert[0] as Record<string, unknown>;
    }
  } catch (error) {
    logger.error("Failed to bootstrap TenantConfig", {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // If insertion failed for any reason, throw explicit error as before
  throw new Error(
    "No TenantConfig found in database. Run migration script to create one."
  );
}

/**
 * Get the singleton TenantConfig
 *
 * @throws {Error} If no TenantConfig exists in the database
 * @returns Promise<Record<string, unknown>> The tenant configuration
 */
export async function getTenantConfig(
  _client?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  return await ensureTenantConfig();
}

/**
 * Get currency from TenantConfig
 *
 * @returns Promise<string> ISO 4217 currency code
 */
export async function getTenantCurrency(
  _client?: Record<string, unknown>
): Promise<string> {
  const cfg = (await ensureTenantConfig()) as { currency?: string };
  return cfg.currency ?? DEFAULTS.currency;
}

/**
 * Get quote validity days from TenantConfig
 *
 * @returns Promise<number> Quote validity in days
 */
export async function getQuoteValidityDays(
  _client?: Record<string, unknown>
): Promise<number> {
  const cfg = (await ensureTenantConfig()) as { quoteValidityDays?: number };
  return cfg.quoteValidityDays ?? DEFAULTS.quoteValidityDays;
}
