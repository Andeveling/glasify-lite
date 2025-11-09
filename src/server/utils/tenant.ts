/**
 * Tenant Configuration Utilities
 *
 * Helper functions to access the singleton TenantConfig using Drizzle ORM
 *
 * @see /plan/refactor-manufacturer-to-tenant-config-1.md
 */

import { db } from "../db/drizzle";
import { tenantConfigs } from "../db/schema";

/**
 * Get the singleton TenantConfig
 *
 * @throws {Error} If no TenantConfig exists in the database
 * @returns Promise<Record<string, unknown>> The tenant configuration
 */
export async function getTenantConfig(
  _client?: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const result = await db.select().from(tenantConfigs).limit(1);

  if (!result[0]) {
    throw new Error(
      "No TenantConfig found in database. Run migration script to create one."
    );
  }

  return result[0] as Record<string, unknown>;
}

/**
 * Get currency from TenantConfig
 *
 * @returns Promise<string> ISO 4217 currency code
 */
export async function getTenantCurrency(
  _client?: Record<string, unknown>
): Promise<string> {
  const result = await db
    .select({ currency: tenantConfigs.currency })
    .from(tenantConfigs)
    .limit(1);

  if (!result[0]) {
    throw new Error(
      "No TenantConfig found in database. Run migration script to create one."
    );
  }

  return result[0].currency;
}

/**
 * Get quote validity days from TenantConfig
 *
 * @returns Promise<number> Quote validity in days
 */
export async function getQuoteValidityDays(
  _client?: Record<string, unknown>
): Promise<number> {
  const result = await db
    .select({ quoteValidityDays: tenantConfigs.quoteValidityDays })
    .from(tenantConfigs)
    .limit(1);

  const tenantConfig = result[0];
  if (!tenantConfig?.quoteValidityDays) {
    throw new Error(
      "No TenantConfig found in database. Run migration script to create one."
    );
  }

  return tenantConfig.quoteValidityDays;
}
