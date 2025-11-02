/**
 * TenantConfig tRPC Router
 *
 * Singleton tenant configuration management
 *
 * @see /plan/refactor-manufacturer-to-tenant-config-1.md
 * @see /plan/feature-branding-communication-1.md (US-009, US-010)
 */

import { z } from "zod";
import logger from "@/lib/logger";
import { updateTenantConfigSchema } from "../../../schemas/tenant.schema";
import { getTenantConfig, updateTenantConfig } from "../../../utils/tenant";
import { updateBrandingSchema } from "../../schemas/branding.schema";
import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
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

	/**
	 * Get branding configuration (public, for layouts)
	 * US-009: Configurar datos de branding del tenant
	 */
	getBranding: publicProcedure.query(async ({ ctx }) => {
		const config = await ctx.db.tenantConfig.findFirst({
			select: {
				businessName: true,
				facebookUrl: true,
				instagramUrl: true,
				linkedinUrl: true,
				logoUrl: true,
				primaryColor: true,
				secondaryColor: true,
				whatsappEnabled: true,
				whatsappNumber: true,
			},
		});

		if (!config) {
			throw new Error("Configuración de tenant no encontrada");
		}

		return config;
	}),

	/**
	 * Update branding configuration
	 * Admin only - modifies branding settings
	 * US-009: Configurar datos de branding del tenant
	 */
	updateBranding: adminProcedure
		.input(updateBrandingSchema)
		.mutation(async ({ ctx, input }) => {
			const tenantId = "1"; // Singleton tenant ID

			logger.info("Updating branding configuration", {
				changes: Object.keys(input),
				input,
				tenantId,
				userId: ctx.session.user.id,
			});

			// Build update data object - only include fields that are present in input
			const updateData: {
				facebookUrl?: string | null;
				instagramUrl?: string | null;
				linkedinUrl?: string | null;
				logoUrl?: string | null;
				primaryColor?: string;
				secondaryColor?: string;
				whatsappEnabled?: boolean;
				whatsappNumber?: string | null;
			} = {};

			// Social media URLs (convert empty strings to null)
			if (input.facebookUrl !== undefined) {
				updateData.facebookUrl = input.facebookUrl || null;
			}
			if (input.instagramUrl !== undefined) {
				updateData.instagramUrl = input.instagramUrl || null;
			}
			if (input.linkedinUrl !== undefined) {
				updateData.linkedinUrl = input.linkedinUrl || null;
			}

			// Logo URL
			if (input.logoUrl !== undefined) {
				updateData.logoUrl = input.logoUrl || null;
			}

			// Colors (optional, for future use)
			if (input.primaryColor !== undefined) {
				updateData.primaryColor = input.primaryColor;
			}
			if (input.secondaryColor !== undefined) {
				updateData.secondaryColor = input.secondaryColor;
			}

			// WhatsApp settings
			if (input.whatsappEnabled !== undefined) {
				updateData.whatsappEnabled = input.whatsappEnabled;
			}
			if (input.whatsappNumber !== undefined) {
				updateData.whatsappNumber = input.whatsappNumber || null;
			}

			logger.info("Prepared update data", {
				tenantId,
				updateData,
				userId: ctx.session.user.id,
			});

			const updated = await ctx.db.tenantConfig.update({
				data: updateData,
				where: { id: tenantId },
			});

			logger.info("Branding configuration updated successfully", {
				tenantId,
				userId: ctx.session.user.id,
			});

			return updated;
		}),

	/**
	 * Upload logo file
	 * Admin only - handles file upload and optimization
	 * US-009: Configurar datos de branding del tenant
	 *
	 * Note: Logo field not yet in schema, update when schema is migrated
	 */
	uploadLogo: adminProcedure
		.input(z.object({ file: z.instanceof(File) }))
		.mutation(async ({ input }) => {
			// TODO: Implement when logoUrl field is added to TenantConfig schema
			throw new Error("Logo upload not yet implemented in schema");
		}),
});
