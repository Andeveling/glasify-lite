/**
 * TenantConfig Queries - Read Operations
 *
 * tRPC procedures for fetching tenant configuration data.
 * Uses publicProcedure (no authentication required) - tenant config is global.
 *
 * @module server/api/routers/admin/tenant-config/tenant-config.queries
 */

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { getTenantConfig } from "@/server/utils/tenant";
import { brandingOutput, tenantConfigOutput } from "./tenant-config.schemas";
import { serializeTenantConfig } from "./tenant-config.utils";

export const tenantConfigQueries = createTRPCRouter({
  /**
   * Get the singleton TenantConfig
   * Public - used by layouts, price formatters, cart indicators
   * GET /api/trpc/admin.tenantConfig.get
   */
  get: publicProcedure.output(tenantConfigOutput).query(async () => {
    const config = await getTenantConfig();
    // Type assertion safe because getTenantConfig always returns tenant config shape
    return serializeTenantConfig(
      config as Parameters<typeof serializeTenantConfig>[0]
    );
  }),

  /**
   * Get only currency from TenantConfig
   * Public - needed for price display on public pages
   * GET /api/trpc/admin.tenantConfig.getCurrency
   */
  getCurrency: publicProcedure.query(async () => {
    const config = await getTenantConfig();
    return (config as { currency: string }).currency;
  }),

  /**
   * Get only quote validity days from TenantConfig
   * Public - shown to users before they create quotes
   * GET /api/trpc/admin.tenantConfig.getQuoteValidityDays
   */
  getQuoteValidityDays: publicProcedure.query(async () => {
    const config = await getTenantConfig();
    // Return number type (converted from DB string)
    return Number.parseInt(
      (config as { quoteValidityDays: string }).quoteValidityDays,
      10
    );
  }),

  /**
   * Get branding configuration (public, for layouts)
   * US-009: Configurar datos de branding del tenant
   * GET /api/trpc/admin.tenantConfig.getBranding
   */
  getBranding: publicProcedure.output(brandingOutput).query(async () => {
    const config = await getTenantConfig();

    if (!config) {
      throw new Error("Configuración de tenant no encontrada");
    }

    // Type assertion safe because we know the shape
    return serializeTenantConfig(
      config as Parameters<typeof serializeTenantConfig>[0]
    );
  }),
});
