/**
 * Model (Window/Door Product) Validation Schemas
 *
 * Zod schemas for Model entity CRUD operations
 *
 * Entity: Model (window/door products with pricing and dimensions)
 * Fields: name, status, dimensions, pricing, compatibleGlassTypeIds, profileSupplierId
 * Relations: profileSupplier (Many-to-One), costBreakdown (One-to-Many), priceHistory (One-to-Many)
 */

import { ModelStatus, ModelType } from '@prisma/client';
import { z } from 'zod';
import {
  optionalSpanishText,
  paginationSchema,
  priceValidator,
  searchQuerySchema,
  sortOrderSchema,
  spanishText,
} from '../shared.schema';

/**
 * Constants
 */
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 100;
export const MIN_DIMENSION_MM = 100;
export const MAX_DIMENSION_MM = 10_000;
export const MIN_GLASS_DISCOUNT_MM = 0;
export const MAX_GLASS_DISCOUNT_MM = 500;
export const MIN_PROFIT_MARGIN = 0;
export const MAX_PROFIT_MARGIN = 100;
export const MAX_COST_NOTES_LENGTH = 500;

/**
 * ModelStatus enum schema (Prisma enum)
 */
const modelStatusSchema = z.nativeEnum(ModelStatus, {
  message: 'El estado del modelo debe ser: draft o published',
});

/**
 * ModelType enum schema (Prisma enum)
 * Used for categorizing models and validating design compatibility
 */
const modelTypeSchema = z.nativeEnum(ModelType, {
  message: 'El tipo de modelo debe ser uno de los valores permitidos',
});

/**
 * Dimension validation helper
 * Ensures min <= max for dimensions
 */
function createDimensionRefinement(
  data: { minWidthMm: number; maxWidthMm: number; minHeightMm: number; maxHeightMm: number },
  ctx: z.RefinementCtx
) {
  if (data.minWidthMm > data.maxWidthMm) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El ancho mínimo no puede ser mayor que el ancho máximo',
      path: ['minWidthMm'],
    });
  }

  if (data.minHeightMm > data.maxHeightMm) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El alto mínimo no puede ser mayor que el alto máximo',
      path: ['minHeightMm'],
    });
  }
}

/**
 * Base Model Schema
 * Shared fields for create/update operations
 */
const baseModelSchema = z
  .object({
    accessoryPrice: priceValidator.optional().nullable().describe('Optional flat accessory fee'),

    basePrice: priceValidator.describe('Base price in tenant currency'),

    compatibleGlassTypeIds: z
      .array(z.string().cuid('ID de tipo de vidrio inválido'))
      .min(1, 'Debe seleccionar al menos un tipo de vidrio compatible')
      .describe('Array of compatible GlassType IDs'),

    costNotes: optionalSpanishText
      .pipe(z.string().max(MAX_COST_NOTES_LENGTH, `Las notas no pueden exceder ${MAX_COST_NOTES_LENGTH} caracteres`))
      .describe('Notes about cost structure'),

    costPerMmHeight: z
      .number()
      .nonnegative('El costo por mm de alto no puede ser negativo')
      .describe('Additional cost per millimeter of height'),

    costPerMmWidth: z
      .number()
      .nonnegative('El costo por mm de ancho no puede ser negativo')
      .describe('Additional cost per millimeter of width'),

    designId: z
      .string()
      .cuid('ID de diseño inválido')
      .optional()
      .nullable()
      .describe('Optional ModelDesign ID for visual representation'),

    glassDiscountHeightMm: z
      .number()
      .int('El descuento de alto debe ser un número entero')
      .min(MIN_GLASS_DISCOUNT_MM, `El descuento de alto mínimo es ${MIN_GLASS_DISCOUNT_MM}mm`)
      .max(MAX_GLASS_DISCOUNT_MM, `El descuento de alto máximo es ${MAX_GLASS_DISCOUNT_MM}mm`)
      .default(0)
      .describe('Glass discount per side (height)'),

    glassDiscountWidthMm: z
      .number()
      .int('El descuento de ancho debe ser un número entero')
      .min(MIN_GLASS_DISCOUNT_MM, `El descuento de ancho mínimo es ${MIN_GLASS_DISCOUNT_MM}mm`)
      .max(MAX_GLASS_DISCOUNT_MM, `El descuento de ancho máximo es ${MAX_GLASS_DISCOUNT_MM}mm`)
      .default(0)
      .describe('Glass discount per side (width)'),

    lastCostReviewDate: z
      .date()
      .optional()
      .nullable()
      .or(
        z
          .string()
          .datetime()
          .transform((str) => new Date(str))
      )
      .describe('Last cost review date'),

    maxHeightMm: z
      .number()
      .int('El alto máximo debe ser un número entero')
      .min(MIN_DIMENSION_MM, `El alto máximo debe ser al menos ${MIN_DIMENSION_MM}mm`)
      .max(MAX_DIMENSION_MM, `El alto máximo no puede exceder ${MAX_DIMENSION_MM}mm`)
      .describe('Maximum height in millimeters'),

    maxWidthMm: z
      .number()
      .int('El ancho máximo debe ser un número entero')
      .min(MIN_DIMENSION_MM, `El ancho máximo debe ser al menos ${MIN_DIMENSION_MM}mm`)
      .max(MAX_DIMENSION_MM, `El ancho máximo no puede exceder ${MAX_DIMENSION_MM}mm`)
      .describe('Maximum width in millimeters'),

    minHeightMm: z
      .number()
      .int('El alto mínimo debe ser un número entero')
      .min(MIN_DIMENSION_MM, `El alto mínimo debe ser al menos ${MIN_DIMENSION_MM}mm`)
      .max(MAX_DIMENSION_MM, `El alto mínimo no puede exceder ${MAX_DIMENSION_MM}mm`)
      .describe('Minimum height in millimeters'),

    minWidthMm: z
      .number()
      .int('El ancho mínimo debe ser un número entero')
      .min(MIN_DIMENSION_MM, `El ancho mínimo debe ser al menos ${MIN_DIMENSION_MM}mm`)
      .max(MAX_DIMENSION_MM, `El ancho mínimo no puede exceder ${MAX_DIMENSION_MM}mm`)
      .describe('Minimum width in millimeters'),

    name: spanishText
      .min(MIN_NAME_LENGTH, `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`)
      .max(MAX_NAME_LENGTH, `El nombre no puede exceder ${MAX_NAME_LENGTH} caracteres`)
      .describe('Model name (e.g., Ventana Corrediza PVC)'),

    profileSupplierId: z
      .string()
      .cuid('ID de proveedor inválido')
      .optional()
      .nullable()
      .describe('Profile supplier (manufacturer) ID'),

    profitMarginPercentage: z
      .number()
      .min(MIN_PROFIT_MARGIN, `El margen de ganancia mínimo es ${MIN_PROFIT_MARGIN}%`)
      .max(MAX_PROFIT_MARGIN, `El margen de ganancia máximo es ${MAX_PROFIT_MARGIN}%`)
      .optional()
      .nullable()
      .describe('Profit margin percentage (0-100)'),

    status: modelStatusSchema.describe('Model status (draft or published)'),

    type: modelTypeSchema.optional().nullable().describe('Model type category (window, door, etc.)'),
  })
  .superRefine(createDimensionRefinement);

/**
 * Create Model Schema
 */
export const createModelSchema = baseModelSchema;

export type CreateModelInput = z.infer<typeof createModelSchema>;

/**
 * Update Model Schema
 * Wraps partial data with id
 */
export const updateModelSchema = z.object({
  data: baseModelSchema.partial().superRefine((data, ctx) => {
    // Only validate dimension refinement if all dimension fields are present
    if (
      data.minWidthMm !== undefined &&
      data.maxWidthMm !== undefined &&
      data.minHeightMm !== undefined &&
      data.maxHeightMm !== undefined
    ) {
      createDimensionRefinement(
        {
          maxHeightMm: data.maxHeightMm,
          maxWidthMm: data.maxWidthMm,
          minHeightMm: data.minHeightMm,
          minWidthMm: data.minWidthMm,
        },
        ctx
      );
    }
  }),
  id: z.string().cuid('ID de modelo inválido'),
});

export type UpdateModelInput = z.infer<typeof updateModelSchema>;

/**
 * List Models Schema
 * Pagination + search + filters + sorting
 */
export const listModelsSchema = paginationSchema.extend({
  profileSupplierId: z.string().cuid('ID de proveedor inválido').optional().describe('Filter by profile supplier'),

  search: searchQuerySchema.describe('Search by name'),

  sortBy: z.enum(['name', 'createdAt', 'updatedAt', 'basePrice']).default('createdAt').describe('Sort field'),

  sortOrder: sortOrderSchema.describe('Sort order'),

  status: z.enum(['all', 'draft', 'published']).default('all').describe('Filter by status'),
});

export type ListModelsInput = z.infer<typeof listModelsSchema>;

/**
 * Get Model by ID Schema
 */
export const getModelByIdSchema = z.object({
  id: z.string().cuid('ID de modelo inválido'),
});

export type GetModelByIdInput = z.infer<typeof getModelByIdSchema>;

/**
 * Delete Model Schema
 */
export const deleteModelSchema = z.object({
  id: z.string().cuid('ID de modelo inválido'),
});

export type DeleteModelInput = z.infer<typeof deleteModelSchema>;

/**
 * Cost Breakdown Schemas
 */

/**
 * CostType enum schema (Prisma enum)
 */
const costTypeSchema = z.enum(['fixed', 'per_mm_width', 'per_mm_height', 'per_sqm'], {
  message: 'El tipo de costo debe ser: fixed, per_mm_width, per_mm_height o per_sqm',
});

export const MAX_COMPONENT_NAME_LENGTH = 100;
export const MAX_COST_BREAKDOWN_NOTES_LENGTH = 500;

/**
 * Base Cost Breakdown Schema
 */
const baseCostBreakdownSchema = z.object({
  component: spanishText
    .min(1, 'El nombre del componente es requerido')
    .max(MAX_COMPONENT_NAME_LENGTH, `El nombre del componente no puede exceder ${MAX_COMPONENT_NAME_LENGTH} caracteres`)
    .describe('Component name (e.g., perfil_vertical, herrajes)'),

  costType: costTypeSchema.describe('Cost type (fixed, per_mm_width, per_mm_height, per_sqm)'),

  notes: optionalSpanishText
    .pipe(
      z
        .string()
        .max(
          MAX_COST_BREAKDOWN_NOTES_LENGTH,
          `Las notas no pueden exceder ${MAX_COST_BREAKDOWN_NOTES_LENGTH} caracteres`
        )
    )
    .describe('Additional notes about this component'),

  unitCost: priceValidator.describe('Unit cost for this component'),
});

/**
 * Add Cost Breakdown Schema
 */
export const addCostBreakdownSchema = z.object({
  data: baseCostBreakdownSchema,
  modelId: z.string().cuid('ID de modelo inválido'),
});

export type AddCostBreakdownInput = z.infer<typeof addCostBreakdownSchema>;

/**
 * Update Cost Breakdown Schema
 */
export const updateCostBreakdownSchema = z.object({
  data: baseCostBreakdownSchema.partial(),
  id: z.string().cuid('ID de componente de costo inválido'),
});

export type UpdateCostBreakdownInput = z.infer<typeof updateCostBreakdownSchema>;

/**
 * Delete Cost Breakdown Schema
 */
export const deleteCostBreakdownSchema = z.object({
  id: z.string().cuid('ID de componente de costo inválido'),
});

export type DeleteCostBreakdownInput = z.infer<typeof deleteCostBreakdownSchema>;
