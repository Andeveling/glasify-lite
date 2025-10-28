/**
 * TenantConfig tRPC Router
 *
 * Singleton tenant configuration management
 *
 * @see /plan/refactor-manufacturer-to-tenant-config-1.md
 * @see /plan/feature-branding-communication-1.md (US-009, US-010)
 */

import { z } from 'zod';
import logger from '@/lib/logger';
import { updateBrandingSchema } from '../../schemas/branding.schema';
import { FileUploadService } from '../../../services/file-upload.service';
import { updateTenantConfigSchema } from '../../../schemas/tenant.schema';
import { getTenantConfig, updateTenantConfig } from '../../../utils/tenant';
import {
	adminProcedure,
	createTRPCRouter,
	protectedProcedure,
	publicProcedure,
} from '../../trpc';

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
				id: true,
				businessName: true,
				logoUrl: true,
				primaryColor: true,
				secondaryColor: true,
				facebookUrl: true,
				instagramUrl: true,
				linkedinUrl: true,
				whatsappNumber: true,
				whatsappEnabled: true,
			},
		});

		if (!config) {
			throw new Error('Configuración de tenant no encontrada');
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
			const tenantId = '1'; // Singleton tenant ID

			// If new logo uploaded, delete old one
			if (input.logoUrl) {
				const currentConfig = await ctx.db.tenantConfig.findUnique({
					where: { id: tenantId },
					select: { logoUrl: true },
				});

				if (
					currentConfig?.logoUrl &&
					currentConfig.logoUrl !== input.logoUrl
				) {
					await FileUploadService.deleteLogo(currentConfig.logoUrl);
				}
			}

			// Update tenant config
			const updated = await ctx.db.tenantConfig.update({
				where: { id: tenantId },
				data: input,
			});

			logger.info('Branding actualizado', {
				tenantId,
				userId: ctx.session.user.id,
				changes: Object.keys(input),
			});

			return updated;
		}),

	/**
	 * Upload logo file
	 * Admin only - handles file upload and optimization
	 * US-009: Configurar datos de branding del tenant
	 */
	uploadLogo: adminProcedure
		.input(z.object({ file: z.instanceof(File) }))
		.mutation(async ({ input }) => {
			const tenantId = '1'; // Singleton tenant ID
			const logoUrl = await FileUploadService.uploadLogo(input.file, tenantId);

			logger.info('Logo subido exitosamente', { tenantId, logoUrl });

			return { logoUrl };
		}),
});
