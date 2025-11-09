/**
 * Transportation Repository - Data Access Layer
 *
 * Pure Drizzle queries for tenant configuration (warehouse location & rates)
 * No business logic - only data retrieval
 *
 * @module server/api/routers/transportation/repositories/transportation-repository
 */

import type { db } from "@/server/db/drizzle";
import { tenantConfigs } from "@/server/db/schema";

type DbClient = typeof db;

/**
 * Get first tenant configuration (warehouse location and transportation rates)
 *
 * @param client - Drizzle database client
 * @returns TenantConfig record or null if not found
 */
export async function getTenantConfig(client: DbClient) {
  const result = await client.select().from(tenantConfigs).limit(1);

  return result[0] ?? null;
}
