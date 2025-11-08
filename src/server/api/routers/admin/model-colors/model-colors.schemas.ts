/**
 * Model Colors Schemas
 *
 * Zod validation schemas for model-color assignment operations
 *
 * Business Rules:
 * - Surcharge percentage: 0-100% applied to model base price only
 * - First assigned color automatically becomes default
 * - Only one color can be marked as default per model
 */

import { z } from "zod";

/**
 * Constants
 */
const MAX_SURCHARGE_PERCENTAGE = 100;

/**
 * Model ID validation
 */
export const modelIdSchema = z.object({
  modelId: z.string().cuid("ID de modelo inválido"),
});

/**
 * Model Color ID validation
 */
export const modelColorIdSchema = z.object({
  id: z.string().cuid("ID de asignación de color inválido"),
});

/**
 * Assign color to model input
 */
export const modelColorAssignSchema = z.object({
  modelId: z.string().cuid("ID de modelo inválido"),
  colorId: z.string().cuid("ID de color inválido"),
  surchargePercentage: z
    .number()
    .min(0, "El recargo no puede ser negativo")
    .max(MAX_SURCHARGE_PERCENTAGE, "El recargo no puede exceder 100%"),
  isDefault: z.boolean().optional().default(false),
});

/**
 * Update surcharge input
 */
export const modelColorUpdateSurchargeSchema = z.object({
  id: z.string().cuid("ID de asignación de color inválido"),
  surchargePercentage: z
    .number()
    .min(0, "El recargo no puede ser negativo")
    .max(MAX_SURCHARGE_PERCENTAGE, "El recargo no puede exceder 100%"),
});

/**
 * Bulk assign colors input
 */
export const bulkAssignSchema = z.object({
  modelId: z.string().cuid("ID de modelo inválido"),
  assignments: z
    .array(
      z.object({
        colorId: z.string().cuid("ID de color inválido"),
        surchargePercentage: z
          .number()
          .min(0, "El recargo no puede ser negativo")
          .max(MAX_SURCHARGE_PERCENTAGE, "El recargo no puede exceder 100%"),
      })
    )
    .min(1, "Debe proporcionar al menos un color"),
});

/**
 * Output types
 */
export const modelColorOutputSchema = z.object({
  id: z.string(),
  modelId: z.string(),
  colorId: z.string(),
  surchargePercentage: z.number(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  color: z.object({
    id: z.string(),
    name: z.string(),
    hexCode: z.string(),
    isActive: z.boolean(),
  }),
});

export const modelColorListOutputSchema = z.array(modelColorOutputSchema);

export const availableColorsOutputSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    hexCode: z.string(),
    isActive: z.boolean(),
  })
);

// Type exports
export type ModelColorAssignInput = z.infer<typeof modelColorAssignSchema>;
export type ModelColorUpdateSurchargeInput = z.infer<
  typeof modelColorUpdateSurchargeSchema
>;
export type BulkAssignInput = z.infer<typeof bulkAssignSchema>;
export type ModelColorOutput = z.infer<typeof modelColorOutputSchema>;
