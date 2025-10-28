/**
 * TenantConfig tRPC Router
 *
 * Singleton tenant configuration management
 *
 * @see /plan/refactor-manufacturer-to-tenant-config-1.md
 */

import { updateTenantConfigSchema } from "../../../schemas/tenant.schema";
import { getTenantConfig, updateTenantConfig } from "../../../utils/tenant";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "../../trpc";

export const tenantConfigRouter = createTRPCRouter({
  /**
   * Get the singleton TenantConfig
   */
  get: protectedProcedure.query(() => getTenantConfig()),

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

  /**
   * Update the singleton TenantConfig
   * Admin only - modifies global tenant configuration
   */
  update: adminProcedure
    .input(updateTenantConfigSchema)
    .mutation(({ input }) => updateTenantConfig(input)),
});
