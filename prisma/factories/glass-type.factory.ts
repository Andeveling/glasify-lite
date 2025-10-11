/**
 * GlassType Factory
 *
 * Creates validated GlassType seed data based on Colombian market specifications.
 *
 * Data sources:
 * - docs/context/glassess.catalog.md (Colombian glass market data)
 * - Prisma schema GlassType model
 *
 * @version 1.0.0
 */

import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import type { FactoryMetadata, FactoryOptions, FactoryResult, ValidationError } from './types';
import { mergeOverrides, validatePrice, validateWithSchema } from './utils';

// Validation constants
const MIN_GLASS_NAME_LENGTH = 3;
const MAX_GLASS_NAME_LENGTH = 100;
const MIN_THICKNESS_MM = 3;
const MAX_THICKNESS_MM = 50;
const MAX_PRICE_PER_SQM_COP = 500_000; // 500k COP/sqm
const MIN_TRIPLE_GLAZED_THICKNESS = 20;

/**
 * Zod schema for GlassType input validation
 */
const glassTypeInputSchema = z.object({
  isLaminated: z.boolean().default(false),
  isLowE: z.boolean().default(false),
  isTempered: z.boolean().default(false),
  isTripleGlazed: z.boolean().default(false),
  name: z.string().min(MIN_GLASS_NAME_LENGTH).max(MAX_GLASS_NAME_LENGTH),
  pricePerSqm: z.number().positive(),
  purpose: z.enum(['general', 'insulation', 'security', 'decorative']),
  thicknessMm: z.number().int().min(MIN_THICKNESS_MM).max(MAX_THICKNESS_MM),
  uValue: z.number().positive().optional(),
});

/**
 * Input type for creating a GlassType
 */
export type GlassTypeInput = z.infer<typeof glassTypeInputSchema>;

/**
 * Creates a validated GlassType object for seeding
 *
 * @param input - GlassType data
 * @param options - Factory options
 * @returns FactoryResult with validated GlassType or errors
 *
 * @example
 * ```ts
 * const result = createGlassType({
 *   name: 'Vidrio Templado 6mm',
 *   purpose: 'security',
 *   thicknessMm: 6,
 *   pricePerSqm: 65000,
 *   isTempered: true,
 * });
 *
 * if (result.success) {
 *   await prisma.glassType.create({ data: result.data });
 * }
 * ```
 */
export function createGlassType(
  input: GlassTypeInput,
  options?: FactoryOptions
): FactoryResult<Prisma.GlassTypeCreateInput> {
  // Merge overrides if provided
  const data = mergeOverrides(input, options?.overrides);

  // Skip validation if requested (for performance)
  if (options?.skipValidation) {
    return {
      data: data as Prisma.GlassTypeCreateInput,
      success: true,
    };
  }

  // Validate with Zod schema
  const schemaResult = validateWithSchema(glassTypeInputSchema, data);
  if (!schemaResult.success) {
    return schemaResult;
  }

  const validated = schemaResult.data;
  if (!validated) {
    return {
      errors: [{ code: 'VALIDATION_ERROR', message: 'Validation failed', path: [] }],
      success: false,
    };
  }

  // Additional business logic validations
  const additionalErrors: ValidationError[] = [];

  // Validate price is reasonable for Colombian market
  const priceError = validatePrice(validated.pricePerSqm, 'pricePerSqm', MAX_PRICE_PER_SQM_COP);
  if (priceError) {
    additionalErrors.push(priceError);
  }

  // Validate thickness is appropriate for glass type
  if (validated.isTripleGlazed && validated.thicknessMm < MIN_TRIPLE_GLAZED_THICKNESS) {
    additionalErrors.push({
      code: 'INVALID_THICKNESS_FOR_TYPE',
      context: { isTripleGlazed: true, thicknessMm: validated.thicknessMm },
      message: 'Triple glazed glass should be at least 20mm thick',
      path: ['thicknessMm'],
    });
  }

  // Validate Low-E glass typically has U-value specified
  if (validated.isLowE && !validated.uValue) {
    additionalErrors.push({
      code: 'MISSING_U_VALUE',
      context: { isLowE: true },
      message: 'Low-E glass should have a U-value specified',
      path: ['uValue'],
    });
  }

  if (additionalErrors.length > 0) {
    return {
      errors: additionalErrors,
      success: false,
    };
  }

  // Return validated data ready for Prisma
  return {
    data: validated as Prisma.GlassTypeCreateInput,
    success: true,
  };
}

/**
 * Creates multiple GlassTypes in batch
 *
 * @param inputs - Array of GlassType inputs
 * @param options - Factory options
 * @returns Array of FactoryResults
 */
export function createGlassTypes(
  inputs: GlassTypeInput[],
  options?: FactoryOptions
): FactoryResult<Prisma.GlassTypeCreateInput>[] {
  return inputs.map((input) => createGlassType(input, options));
}

/**
 * Filters successful results from a batch creation
 *
 * @param results - Array of FactoryResults
 * @returns Array of successful data objects
 */
export function getSuccessfulGlassTypes(
  results: FactoryResult<Prisma.GlassTypeCreateInput>[]
): Prisma.GlassTypeCreateInput[] {
  return results
    .filter(
      (
        result
      ): result is FactoryResult<Prisma.GlassTypeCreateInput> & { success: true; data: Prisma.GlassTypeCreateInput } =>
        result.success && result.data !== undefined
    )
    .map((result) => result.data);
}

/**
 * Factory metadata
 */
export const glassTypeFactoryMetadata: FactoryMetadata = {
  description: 'Creates validated GlassType seed data based on Colombian market specifications',
  name: 'GlassTypeFactory',
  sources: [
    'docs/context/glassess.catalog.md',
    'https://www.aluviarte.com/tipos-de-vidrio-aluviarte.html',
    'https://vitrolit.com/productos/vidrio-templado-incoloro/',
  ],
  version: '1.0.0',
};
