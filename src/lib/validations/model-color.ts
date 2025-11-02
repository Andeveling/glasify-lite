import { z } from "zod";

/**
 * Zod validation schemas for ModelColor assignment management
 * Used in admin model color configuration operations (tRPC modelColors router)
 */

// Validation constants
const MIN_SURCHARGE = 0;
const MAX_SURCHARGE = 100;

/**
 * Model color assignment schema
 * Used when assigning a color to a model
 */
export const modelColorAssignSchema = z.object({
	modelId: z.string().cuid({ message: "ID de modelo inválido" }),
	colorId: z.string().cuid({ message: "ID de color inválido" }),
	surchargePercentage: z
		.number()
		.min(MIN_SURCHARGE, {
			message: `El recargo debe ser mayor o igual a ${MIN_SURCHARGE}%`,
		})
		.max(MAX_SURCHARGE, {
			message: `El recargo debe estar entre ${MIN_SURCHARGE}% y ${MAX_SURCHARGE}%`,
		})
		.transform((val) => Number(val.toFixed(2))), // Ensure 2 decimal places
	isDefault: z.boolean().optional().default(false),
});

/**
 * Model color surcharge update schema
 * Used when updating only the surcharge percentage
 */
export const modelColorUpdateSurchargeSchema = z.object({
	id: z.string().cuid({ message: "ID de asignación inválido" }),
	surchargePercentage: z
		.number()
		.min(MIN_SURCHARGE, {
			message: `El recargo debe ser mayor o igual a ${MIN_SURCHARGE}%`,
		})
		.max(MAX_SURCHARGE, {
			message: `El recargo debe estar entre ${MIN_SURCHARGE}% y ${MAX_SURCHARGE}%`,
		})
		.transform((val) => Number(val.toFixed(2))),
});

/**
 * Model ID parameter schema
 * Used in listByModel, getAvailableColors operations
 */
export const modelIdSchema = z.object({
	modelId: z.string().cuid({ message: "ID de modelo inválido" }),
});

/**
 * Model color ID parameter schema
 * Used in setDefault, unassign operations
 */
export const modelColorIdSchema = z.object({
	id: z.string().cuid({ message: "ID de asignación inválido" }),
});

/**
 * Bulk color assignment schema
 * Used for quick setup when creating/configuring a model
 */
export const modelColorBulkAssignSchema = z.object({
	modelId: z.string().cuid({ message: "ID de modelo inválido" }),
	assignments: z
		.array(
			z.object({
				colorId: z.string().cuid({ message: "ID de color inválido" }),
				surchargePercentage: z
					.number()
					.min(MIN_SURCHARGE, {
						message: `El recargo debe ser mayor o igual a ${MIN_SURCHARGE}%`,
					})
					.max(MAX_SURCHARGE, {
						message: `El recargo debe estar entre ${MIN_SURCHARGE}% y ${MAX_SURCHARGE}%`,
					})
					.transform((val) => Number(val.toFixed(2))),
			}),
		)
		.min(1, { message: "Debe asignar al menos un color" }),
});

// Type exports for use in tRPC procedures
export type ModelColorAssign = z.infer<typeof modelColorAssignSchema>;
export type ModelColorUpdateSurcharge = z.infer<
	typeof modelColorUpdateSurchargeSchema
>;
export type ModelId = z.infer<typeof modelIdSchema>;
export type ModelColorId = z.infer<typeof modelColorIdSchema>;
export type ModelColorBulkAssign = z.infer<typeof modelColorBulkAssignSchema>;
