/**
 * TenantConfig tRPC Router
 * 
 * Singleton tenant configuration management
 * 
 * @see /plan/refactor-manufacturer-to-tenant-config-1.md
 */

import { createTRPCRouter, protectedProcedure } from '../../trpc';
import { updateTenantConfigSchema } from '../../../schemas/tenant.schema';
import { getTenantConfig, updateTenantConfig } from '../../../utils/tenant';

export const tenantConfigRouter = createTRPCRouter({
  /**
   * Get the singleton TenantConfig
   */
  get: protectedProcedure.query(() => getTenantConfig()),

  /**
   * Update the singleton TenantConfig
   */
  update: protectedProcedure
    .input(updateTenantConfigSchema)
    .mutation(({ input }) => updateTenantConfig(input)),

  /**
   * Get only currency from TenantConfig
   */
  getCurrency: protectedProcedure.query(async () => {
    const config = await getTenantConfig();
    return config.currency;
  }),

  /**
   * Get only quote validity days from TenantConfig
   */
  getQuoteValidityDays: protectedProcedure.query(async () => {
    const config = await getTenantConfig();
    return config.quoteValidityDays;
  }),
});
