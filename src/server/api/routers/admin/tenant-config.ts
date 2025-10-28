/**
 * TenantConfig tRPC Router
 *
 * Singleton tenant configuration management
 *
 * @see /plan/refactor-manufacturer-to-tenant-config-1.md
 * @see /plan/feature-branding-communication-1.md (US-009, US-010)
 */

import logger from '@/lib/logger';
import { z } from 'zod';
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
			},
		});

		if (!config) {
			throw new Error('Configuración de tenant no encontrada');
		}

		return {
			...config,
			logoUrl: null as string | null,
			primaryColor: null as string | null,
			secondaryColor: null as string | null,
			facebookUrl: null as string | null,
			instagramUrl: null as string | null,
			linkedinUrl: null as string | null,
			whatsappNumber: null as string | null,
			whatsappEnabled: false,
		};
	}),

	/**
	 * Update branding configuration
	 * Admin only - modifies branding settings
	 * US-009: Configurar datos de branding del tenant
	 * 
	 * Note: Branding fields not yet in schema, update when schema is migrated
	 */
	updateBranding: adminProcedure
		.input(updateBrandingSchema)
		.mutation(async ({ ctx, input }) => {
			const tenantId = '1'; // Singleton tenant ID

			// TODO: Implement when branding fields are added to TenantConfig schema
			logger.info('Branding update requested (not yet implemented)', {
				tenantId,
				userId: ctx.session.user.id,
				changes: Object.keys(input),
			});

			throw new Error('Branding fields not yet implemented in schema');
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
			throw new Error('Logo upload not yet implemented in schema');
		}),
});
