/**
 * Model Factory
 *
 * Creates validated Model seed data for window/door models with pricing and dimensions.
 *
 * Data sources:
 * - docs/context/alumina.info.md (Alumina model specifications)
 * - docs/context/veka-example.info.md (VEKA model specifications)
 * - https://www.deceuninck.co/correderas.html
 * - https://www.deceuninck.co/doble_contacto.html
 *
 * @version 1.0.0
 */

import type { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { z } from 'zod';
import type { FactoryMetadata, FactoryOptions, FactoryResult, ValidationError } from './types';
import { mergeOverrides, validateMinMax, validateNonEmpty, validatePrice, validateWithSchema } from './utils';

// Validation constants
const MIN_MODEL_NAME_LENGTH = 3;
const MAX_MODEL_NAME_LENGTH = 150;
const MIN_DIMENSION_MM = 100; // 10cm minimum
const MAX_DIMENSION_MM = 10_000; // 10m maximum
const MAX_BASE_PRICE_COP = 10_000_000; // 10M COP
const MAX_COST_PER_MM = 1000; // 1000 COP per mm
const MAX_ACCESSORY_PRICE_COP = 500_000; // 500k COP
const MIN_PROFIT_MARGIN = 0;
const MAX_PROFIT_MARGIN = 100;
const MAX_DISCOUNT_MM = 200; // Max 20cm discount

/**
 * Zod schema for Model input validation
 */
const modelInputSchema = z.object({
  accessoryPrice: z.number().nonnegative().optional(),
  basePrice: z.number().positive(),
  compatibleGlassTypeIds: z.array(z.string()).min(1),
  costNotes: z.string().optional(),
  costPerMmHeight: z.number().nonnegative(),
  costPerMmWidth: z.number().nonnegative(),
  glassDiscountHeightMm: z.number().int().nonnegative().max(MAX_DISCOUNT_MM).default(0),
  glassDiscountWidthMm: z.number().int().nonnegative().max(MAX_DISCOUNT_MM).default(0),
  lastCostReviewDate: z.date().optional(),
  maxHeightMm: z.number().int().min(MIN_DIMENSION_MM).max(MAX_DIMENSION_MM),
  maxWidthMm: z.number().int().min(MIN_DIMENSION_MM).max(MAX_DIMENSION_MM),
  minHeightMm: z.number().int().min(MIN_DIMENSION_MM).max(MAX_DIMENSION_MM),
  minWidthMm: z.number().int().min(MIN_DIMENSION_MM).max(MAX_DIMENSION_MM),
  name: z.string().min(MIN_MODEL_NAME_LENGTH).max(MAX_MODEL_NAME_LENGTH),
  profileSupplierName: z.string(), // Used to find ProfileSupplier
  profitMarginPercentage: z.number().nonnegative().max(MAX_PROFIT_MARGIN).optional(),
  status: z.enum([ 'draft', 'published' ]).default('published'),
});

/**
 * Input type for creating a Model
 */
export type ModelInput = z.infer<typeof modelInputSchema>;

/**
 * Output type for Model with ProfileSupplier connection
 */
export type ModelCreateData = Omit<Prisma.ModelCreateInput, 'profileSupplier'> & {
  profileSupplierName: string;
};

/**
 * Validates business logic for Model data
 */
function validateModelBusinessLogic(validated: z.infer<typeof modelInputSchema>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate width constraints (min < max)
  const widthError = validateMinMax(validated.minWidthMm, validated.maxWidthMm, 'width');
  if (widthError) errors.push(widthError);

  // Validate height constraints (min < max)
  const heightError = validateMinMax(validated.minHeightMm, validated.maxHeightMm, 'height');
  if (heightError) errors.push(heightError);

  // Validate base price
  const basePriceError = validatePrice(validated.basePrice, 'basePrice', MAX_BASE_PRICE_COP);
  if (basePriceError) errors.push(basePriceError);

  // Validate cost per mm values
  if (validated.costPerMmWidth > MAX_COST_PER_MM) {
    errors.push({
      code: 'COST_TOO_HIGH',
      context: { costPerMmWidth: validated.costPerMmWidth, max: MAX_COST_PER_MM },
      message: `costPerMmWidth seems too high: ${validated.costPerMmWidth} COP/mm`,
      path: [ 'costPerMmWidth' ],
    });
  }

  if (validated.costPerMmHeight > MAX_COST_PER_MM) {
    errors.push({
      code: 'COST_TOO_HIGH',
      context: { costPerMmHeight: validated.costPerMmHeight, max: MAX_COST_PER_MM },
      message: `costPerMmHeight seems too high: ${validated.costPerMmHeight} COP/mm`,
      path: [ 'costPerMmHeight' ],
    });
  }

  // Validate accessory price
  if (validated.accessoryPrice !== undefined && validated.accessoryPrice !== null) {
    const accessoryError = validatePrice(validated.accessoryPrice, 'accessoryPrice', MAX_ACCESSORY_PRICE_COP);
    if (accessoryError) errors.push(accessoryError);
  }

  // Validate compatible glass types
  const glassTypesError = validateNonEmpty(validated.compatibleGlassTypeIds, 'compatibleGlassTypeIds');
  if (glassTypesError) errors.push(glassTypesError);

  // Validate profit margin
  if (
    validated.profitMarginPercentage !== undefined &&
    validated.profitMarginPercentage !== null &&
    (validated.profitMarginPercentage < MIN_PROFIT_MARGIN || validated.profitMarginPercentage > MAX_PROFIT_MARGIN)
  ) {
    errors.push({
      code: 'OUT_OF_RANGE',
      context: {
        max: MAX_PROFIT_MARGIN,
        min: MIN_PROFIT_MARGIN,
        profitMarginPercentage: validated.profitMarginPercentage,
      },
      message: `profitMarginPercentage must be between ${MIN_PROFIT_MARGIN} and ${MAX_PROFIT_MARGIN}`,
      path: [ 'profitMarginPercentage' ],
    });
  }

  return errors;
}

/**
 * Converts validated input to ModelCreateData with Decimal types
 */
function toModelCreateData(validated: z.infer<typeof modelInputSchema>): ModelCreateData {
  return {
    accessoryPrice: validated.accessoryPrice !== undefined ? new Decimal(validated.accessoryPrice) : undefined,
    basePrice: new Decimal(validated.basePrice),
    compatibleGlassTypeIds: validated.compatibleGlassTypeIds,
    costNotes: validated.costNotes,
    costPerMmHeight: new Decimal(validated.costPerMmHeight),
    costPerMmWidth: new Decimal(validated.costPerMmWidth),
    glassDiscountHeightMm: validated.glassDiscountHeightMm,
    glassDiscountWidthMm: validated.glassDiscountWidthMm,
    lastCostReviewDate: validated.lastCostReviewDate,
    maxHeightMm: validated.maxHeightMm,
    maxWidthMm: validated.maxWidthMm,
    minHeightMm: validated.minHeightMm,
    minWidthMm: validated.minWidthMm,
    name: validated.name,
    profileSupplierName: validated.profileSupplierName,
    profitMarginPercentage:
      validated.profitMarginPercentage !== undefined ? new Decimal(validated.profitMarginPercentage) : undefined,
    status: validated.status,
  };
}

/**
 * Creates a validated Model object for seeding
 *
 * @param input - Model data
 * @param options - Factory options
 * @returns FactoryResult with validated Model or errors
 *
 * @example
 * ```ts
 * const result = createModel({
 *   name: 'Ventana Corrediza Estándar',
 *   profileSupplierName: 'Rehau',
 *   status: 'published',
 *   minWidthMm: 600,
 *   maxWidthMm: 2000,
 *   minHeightMm: 400,
 *   maxHeightMm: 1800,
 *   basePrice: 120000,
 *   costPerMmWidth: 45,
 *   costPerMmHeight: 55,
 *   accessoryPrice: 15000,
 *   compatibleGlassTypeIds: ['glass-id-1', 'glass-id-2'],
 * });
 *
 * if (result.success) {
 *   // Find ProfileSupplier and create Model
 *   const supplier = await prisma.profileSupplier.findUnique({
 *     where: { name: result.data.profileSupplierName }
 *   });
 *
 *   if (supplier) {
 *     await prisma.model.create({
 *       data: {
 *         ...result.data,
 *         profileSupplier: { connect: { id: supplier.id } }
 *       }
 *     });
 *   }
 * }
 * ```
 */
export function createModel(input: ModelInput, options?: FactoryOptions): FactoryResult<ModelCreateData> {
  // Merge overrides if provided
  const data = mergeOverrides(input, options?.overrides);

  // Skip validation if requested
  if (options?.skipValidation) {
    return {
      data: data as ModelCreateData,
      success: true,
    };
  }

  // Validate with Zod schema
  const schemaResult = validateWithSchema(modelInputSchema, data);
  if (!schemaResult.success) {
    return schemaResult;
  }

  const validated = schemaResult.data;
  if (!validated) {
    return {
      errors: [ { code: 'VALIDATION_ERROR', message: 'Validation failed', path: [] } ],
      success: false,
    };
  }

  // Additional business logic validations
  const additionalErrors = validateModelBusinessLogic(validated);

  if (additionalErrors.length > 0) {
    return {
      errors: additionalErrors,
      success: false,
    };
  }

  // Convert to ModelCreateData
  const modelData = toModelCreateData(validated);

  // Return validated data
  return {
    data: modelData,
    success: true,
  };
}

/**
 * Creates multiple Models in batch
 *
 * @param inputs - Array of Model inputs
 * @param options - Factory options
 * @returns Array of FactoryResults
 */
export function createModels(inputs: ModelInput[], options?: FactoryOptions): FactoryResult<ModelCreateData>[] {
  return inputs.map((input) => createModel(input, options));
}

/**
 * Filters successful results from a batch creation
 *
 * @param results - Array of FactoryResults
 * @returns Array of successful data objects
 */
export function getSuccessfulModels(results: FactoryResult<ModelCreateData>[]): ModelCreateData[] {
  return results
    .filter(
      (result): result is FactoryResult<ModelCreateData> & { success: true; data: ModelCreateData } =>
        result.success && result.data !== undefined
    )
    .map((result) => result.data);
}

/**
 * Factory metadata
 */
export const modelFactoryMetadata: FactoryMetadata = {
  description: 'Creates validated Model seed data for window/door models with pricing and dimensions',
  name: 'ModelFactory',
  sources: [
    'docs/context/alumina.info.md',
    'docs/context/veka-example.info.md',
    'https://www.deceuninck.co/correderas.html',
    'https://www.deceuninck.co/doble_contacto.html',
  ],
  version: '1.0.0',
};
