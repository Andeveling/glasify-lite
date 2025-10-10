/**
 * Tenant Configuration Utilities
 * 
 * Helper functions to access the singleton TenantConfig
 * 
 * @see /plan/refactor-manufacturer-to-tenant-config-1.md
 */

import type { Prisma, PrismaClient, TenantConfig } from '@prisma/client';
import type { DefaultArgs } from '@prisma/client/runtime/library';
import { db } from '../db';

type TransactionClient = Omit<PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>;

/**
 * Get the singleton TenantConfig
 * 
 * @param client Optional Prisma client (for transactions)
 * @throws {Error} If no TenantConfig exists in the database
 * @returns Promise<TenantConfig> The tenant configuration
 */
export async function getTenantConfig(client?: TransactionClient): Promise<TenantConfig> {
  const prisma = client ?? db;
  const config = await prisma.tenantConfig.findFirst();

  if (!config) {
    throw new Error(
      'No TenantConfig found in database. Run migration script to create one.'
    );
  }

  return config;
}

/**
 * Get TenantConfig with custom selection
 * 
 * @param select Prisma select object
 * @param client Optional Prisma client (for transactions)
 * @returns Promise<Partial<TenantConfig>> Selected fields
 */
export async function getTenantConfigSelect<T extends Prisma.TenantConfigSelect>(
  select: T,
  client?: TransactionClient
): Promise<Prisma.TenantConfigGetPayload<{ select: T }>> {
  const prisma = client ?? db;
  const config = await prisma.tenantConfig.findFirst({
    select,
  });

  if (!config) {
    throw new Error(
      'No TenantConfig found in database. Run migration script to create one.'
    );
  }

  return config;
}

/**
 * Update TenantConfig
 * 
 * @param data Updated data
 * @param client Optional Prisma client (for transactions)
 * @returns Promise<TenantConfig> Updated configuration
 */
export async function updateTenantConfig(
  data: Prisma.TenantConfigUpdateInput,
  client?: TransactionClient
): Promise<TenantConfig> {
  const prisma = client ?? db;
  const existing = await getTenantConfig(prisma);

  return prisma.tenantConfig.update({
    data,
    where: { id: existing.id },
  });
}

/**
 * Get currency from TenantConfig
 * 
 * @param client Optional Prisma client (for transactions)
 * @returns Promise<string> ISO 4217 currency code
 */
export async function getTenantCurrency(client?: TransactionClient): Promise<string> {
  const config = await getTenantConfigSelect(
    { currency: true },
    client
  );

  return config.currency;
}

/**
 * Get quote validity days from TenantConfig
 * 
 * @param client Optional Prisma client (for transactions)
 * @returns Promise<number> Quote validity in days
 */
export async function getQuoteValidityDays(client?: TransactionClient): Promise<number> {
  const config = await getTenantConfigSelect(
    { quoteValidityDays: true },
    client
  );

  return config.quoteValidityDays;
}
