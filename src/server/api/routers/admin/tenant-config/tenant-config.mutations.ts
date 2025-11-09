/**
 * TenantConfig Mutations - Write Operations
 *
 * tRPC procedures for updating tenant configuration.
 * All procedures use adminProcedure (admin-only access).
 *
 * @module server/api/routers/admin/tenant-config/tenant-config.mutations
 */

import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import logger from "@/lib/logger";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { tenantConfigs } from "@/server/db/schema";
import {
  tenantConfigOutput,
  updateBrandingInput,
  updateTenantConfigInput,
} from "./tenant-config.schemas";
import {
  prepareTenantConfigUpdate,
  serializeTenantConfig,
} from "./tenant-config.utils";

/**
 * Build update data object for branding - only include present fields
 * Reduces cognitive complexity by extracting conditional logic
 */
function buildBrandingUpdateData(input: z.infer<typeof updateBrandingInput>) {
  return {
    ...(input.facebookUrl !== undefined && {
      facebookUrl: input.facebookUrl || null,
    }),
    ...(input.instagramUrl !== undefined && {
      instagramUrl: input.instagramUrl || null,
    }),
    ...(input.linkedinUrl !== undefined && {
      linkedinUrl: input.linkedinUrl || null,
    }),
    ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl || null }),
    ...(input.primaryColor !== undefined && {
      primaryColor: input.primaryColor,
    }),
    ...(input.secondaryColor !== undefined && {
      secondaryColor: input.secondaryColor,
    }),
    // Convert boolean to string for DB
    ...(input.whatsappEnabled !== undefined && {
      whatsappEnabled: input.whatsappEnabled ? "true" : "false",
    }),
    ...(input.whatsappNumber !== undefined && {
      whatsappNumber: input.whatsappNumber || null,
    }),
  };
}

export const tenantConfigMutations = createTRPCRouter({
  /**
   * Update tenant configuration (admin only)
   */
  update: adminProcedure
    .input(updateTenantConfigInput)
    .output(tenantConfigOutput)
    .mutation(async ({ ctx, input }) => {
      const updateData = prepareTenantConfigUpdate(input);

      const [updated] = await ctx.db
        .update(tenantConfigs)
        .set(updateData)
        .where(eq(tenantConfigs.id, "1"))
        .returning();

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Configuración de tenant no encontrada",
        });
      }

      // Serialize to API types
      return serializeTenantConfig(
        updated as Parameters<typeof serializeTenantConfig>[0]
      );
    }),

  /**
   * Update branding configuration
   * Admin only - modifies branding settings
   * US-009: Configurar datos de branding del tenant
   * POST /api/trpc/admin.tenantConfig.updateBranding
   */
  updateBranding: adminProcedure
    .input(updateBrandingInput)
    .output(tenantConfigOutput)
    .mutation(async ({ ctx, input }) => {
      const tenantId = "1"; // Singleton tenant ID

      logger.info("Updating branding configuration", {
        changes: Object.keys(input),
        input,
        tenantId,
        userId: ctx.session.user.id,
      });

      const updateData = buildBrandingUpdateData(input);

      logger.info("Prepared update data", {
        tenantId,
        updateData,
        userId: ctx.session.user.id,
      });

      const [updated] = await ctx.db
        .update(tenantConfigs)
        .set(updateData)
        .where(eq(tenantConfigs.id, tenantId))
        .returning();

      if (!updated) {
        throw new Error("Error al actualizar configuración de branding");
      }

      logger.info("Branding configuration updated successfully", {
        tenantId,
        userId: ctx.session.user.id,
      });

      // Type assertion safe because Drizzle returns tenant config shape
      return serializeTenantConfig(
        updated as Parameters<typeof serializeTenantConfig>[0]
      );
    }),

  /**
   * Upload logo file
   * Admin only - handles file upload and optimization
   * US-009: Configurar datos de branding del tenant
   *
   * Note: Logo field not yet in schema, update when schema is migrated
   * POST /api/trpc/admin.tenantConfig.uploadLogo
   */
  uploadLogo: adminProcedure
    .input(z.object({ file: z.instanceof(File) }))
    .mutation(({ input: _input }) => {
      // TODO: Implement when logoUrl field is added to TenantConfig schema
      throw new Error("Logo upload not yet implemented in schema");
    }),
});
