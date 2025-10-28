import { z } from 'zod';

/**
 * Hex color regex: #RRGGBB or #RGB
 */
const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/**
 * E.164 phone format: +[country code][number]
 * Examples: +507-6123-4567, +573001234567
 */
const e164PhoneRegex = /^\+[1-9]\d{1,14}$/;

/**
 * Social media URL validation
 * Only allows Facebook, Instagram, and LinkedIn URLs
 */
const socialUrlSchema = z
	.string()
	.url({ message: 'URL inválida' })
	.regex(/^https?:\/\/(www\.)?(facebook|instagram|linkedin)\.com/, {
		message: 'URL debe ser de Facebook, Instagram o LinkedIn',
	})
	.optional()
	.or(z.literal(''));

/**
 * Update Branding Schema
 * Validates branding configuration fields for TenantConfig
 *
 * US-009: Configurar datos de branding del tenant
 * US-010: Botón de WhatsApp en catálogo y cotización
 */
export const updateBrandingSchema = z.object({
	logoUrl: z.string().url().optional(),
	primaryColor: z
		.string()
		.regex(hexColorRegex, {
			message: 'Color debe estar en formato hexadecimal (#RRGGBB)',
		})
		.optional(),
	secondaryColor: z
		.string()
		.regex(hexColorRegex, {
			message: 'Color debe estar en formato hexadecimal (#RRGGBB)',
		})
		.optional(),
	facebookUrl: socialUrlSchema,
	instagramUrl: socialUrlSchema,
	linkedinUrl: socialUrlSchema,
	whatsappNumber: z
		.string()
		.regex(e164PhoneRegex, {
			message:
				'Número WhatsApp inválido. Use formato internacional: +507-1234-5678',
		})
		.optional()
		.or(z.literal('')),
	whatsappEnabled: z.boolean().optional(),
});

export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;
