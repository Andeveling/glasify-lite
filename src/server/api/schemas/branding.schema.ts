import { z } from "zod";

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
 * Social media URL regex
 */
const socialUrlRegex = /^https?:\/\/(www\.)?(facebook|instagram|linkedin)\.com/;

/**
 * Social media URL validation
 * Only allows Facebook, Instagram, and LinkedIn URLs
 * Accepts empty string or valid URL
 */
const socialUrlSchema = z
	.string()
	.optional()
	.refine(
		(val) => {
			// Allow empty strings or undefined
			if (!val || val === "") {
				return true;
			}

			// Validate URL format
			try {
				new URL(val);
			} catch {
				return false;
			}

			// Validate domain
			return socialUrlRegex.test(val);
		},
		{
			message: "URL debe ser de Facebook, Instagram o LinkedIn, o vacía",
		},
	);

/**
 * WhatsApp number validation
 * Accepts E.164 format or empty string
 */
const whatsappNumberSchema = z
	.string()
	.optional()
	.refine(
		(val) => {
			// Allow empty strings or undefined
			if (!val || val === "") {
				return true;
			}

			// Validate E.164 format
			return e164PhoneRegex.test(val);
		},
		{
			message:
				"Número WhatsApp inválido. Use formato internacional: +507-1234-5678",
		},
	);

/**
 * Logo URL/path validation
 * Accepts:
 * - External URLs (https://...)
 * - Local paths (/uploads/logo.svg, /public/logo.png)
 * - Empty string
 */
const logoSchema = z
	.string()
	.optional()
	.refine(
		(val) => {
			// Allow empty strings or undefined
			if (!val || val === "") {
				return true;
			}

			// Allow local paths (start with /)
			if (val.startsWith("/")) {
				return true;
			}

			// Validate external URL format
			try {
				new URL(val);
				return true;
			} catch {
				return false;
			}
		},
		{
			message:
				"Debe ser una URL válida o una ruta local (ej: /uploads/logo.svg)",
		},
	);

/**
 * Update Branding Schema
 * Validates branding configuration fields for TenantConfig
 *
 * US-009: Configurar datos de branding del tenant
 * US-010: Botón de WhatsApp en catálogo y cotización
 */
export const updateBrandingSchema = z.object({
	facebookUrl: socialUrlSchema.default(""),
	instagramUrl: socialUrlSchema.default(""),
	linkedinUrl: socialUrlSchema.default(""),
	logoUrl: logoSchema.default(""),
	primaryColor: z
		.string()
		.regex(hexColorRegex, {
			message: "Color debe estar en formato hexadecimal (#RRGGBB)",
		})
		.optional(),
	secondaryColor: z
		.string()
		.regex(hexColorRegex, {
			message: "Color debe estar en formato hexadecimal (#RRGGBB)",
		})
		.optional(),
	whatsappEnabled: z.boolean().default(false),
	whatsappNumber: whatsappNumberSchema.default(""),
});

export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;
