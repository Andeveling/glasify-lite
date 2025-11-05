/**
 * Model form validation schema
 * Zod schema for model creation and editing
 */

import { z } from "zod";
import {
  MAX_PROFIT_MARGIN,
  MIN_DIMENSION_MM,
} from "../_constants/model-form.constants";

export const modelFormSchema = z.object({
  accessoryPrice: z.number().min(0).optional().nullable(),
  basePrice: z.number().min(0),
  compatibleGlassTypeIds: z
    .array(z.string())
    .min(1, "Debe seleccionar al menos un tipo de vidrio"),
  costNotes: z.string().optional().nullable(),
  costPerMmHeight: z.number().min(0),
  costPerMmWidth: z.number().min(0),
  glassDiscountHeightMm: z.number().int().min(0).default(0),
  glassDiscountWidthMm: z.number().int().min(0).default(0),
  imageUrl: z
    .union([
      z.url("URL de imagen debe ser válida"), // Absolute URLs
      z
        .string()
        .regex(/^\/[^\s]*$/, "La ruta de la imagen debe comenzar con /"), // Relative paths starting with /
      z.literal(""), // Empty string
      z.null(),
      z.undefined(),
    ])
    .optional()
    .nullable()
    .transform((val) => val || undefined),
  lastCostReviewDate: z.date().optional().nullable(),
  maxHeightMm: z.number().int().min(MIN_DIMENSION_MM),
  maxWidthMm: z.number().int().min(MIN_DIMENSION_MM),
  minHeightMm: z.number().int().min(MIN_DIMENSION_MM),
  minWidthMm: z.number().int().min(MIN_DIMENSION_MM),
  name: z.string().min(1, "El nombre es requerido"),
  profileSupplierId: z.string().optional().nullable(),
  profitMarginPercentage: z
    .number()
    .min(0)
    .max(MAX_PROFIT_MARGIN)
    .optional()
    .nullable(),
  status: z.enum(["draft", "published"]),
});
