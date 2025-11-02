import { z } from "zod";

/**
 * Zod validation schemas for Color catalog management
 * Used in admin color CRUD operations (tRPC colors router)
 */

// Validation constants
const MAX_COLOR_NAME_LENGTH = 50;
const RAL_CODE_PATTERN = /^RAL \d{4}$/;
const HEX_CODE_PATTERN = /^#[0-9A-Fa-f]{6}$/;

/**
 * Base color validation schema
 * Reusable fields for create and update operations
 */
const colorBaseSchema = z.object({
	name: z
		.string()
		.min(1, { message: "El nombre del color es requerido" })
		.max(MAX_COLOR_NAME_LENGTH, {
			message: `El nombre no puede exceder ${MAX_COLOR_NAME_LENGTH} caracteres`,
		})
		.trim(),

	ralCode: z
		.string()
		.regex(RAL_CODE_PATTERN, {
			message: "Código RAL inválido. Formato esperado: RAL XXXX (ej: RAL 9010)",
		})
		.nullable()
		.optional(),

	hexCode: z
		.string()
		.regex(HEX_CODE_PATTERN, {
			message: "Formato hexadecimal inválido. Debe ser #RRGGBB (ej: #F3F3E9)",
		})
		.transform((val) => val.toUpperCase()), // Normalize to uppercase

	isActive: z.boolean().default(true),
});

/**
 * Color create schema
 * All fields required except ralCode (optional)
 */
export const colorCreateSchema = colorBaseSchema;

/**
 * Color update schema
 * All fields optional for partial updates
 */
export const colorUpdateSchema = colorBaseSchema.partial();

/**
 * Color ID parameter schema
 * Used in getById, update, delete operations
 */
export const colorIdSchema = z.object({
	id: z.string().cuid({ message: "ID de color inválido" }),
});

/**
 * Color list query schema
 * Used in list operation with filtering, search, and pagination
 */
export const colorListSchema = z.object({
	page: z.number().int().positive().default(1),
	limit: z.number().int().positive().max(100).default(20),
	search: z
		.string()
		.max(100, { message: "La búsqueda no puede exceder 100 caracteres" })
		.optional(),
	isActive: z
		.enum(["all", "active", "inactive"])
		.optional()
		.default("all")
		.transform((val) => {
			if (val === "active") {
				return true;
			}
			if (val === "inactive") {
				return false;
			}
			return;
		}),
	sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("name"),
	sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

/**
 * Color usage check response schema
 * Used to determine if color can be deleted
 */
export const colorUsageSchema = z.object({
	modelCount: z.number().int().min(0),
	quoteCount: z.number().int().min(0),
	canDelete: z.boolean(),
	canHardDelete: z.boolean(),
});

// Type exports for use in tRPC procedures
export type ColorCreateInput = z.infer<typeof colorCreateSchema>;
export type ColorUpdateInput = z.infer<typeof colorUpdateSchema>;
export type ColorIdInput = z.infer<typeof colorIdSchema>;
export type ColorListInput = z.input<typeof colorListSchema>; // Before transform
export type ColorListQuery = z.output<typeof colorListSchema>; // After transform
export type ColorUsage = z.infer<typeof colorUsageSchema>;

// Alias exports for backwards compatibility
export type ColorCreate = ColorCreateInput;
export type ColorUpdate = ColorUpdateInput;
export type ColorId = ColorIdInput;
