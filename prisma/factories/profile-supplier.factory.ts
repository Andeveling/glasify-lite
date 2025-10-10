/**
 * ProfileSupplier Factory
 *
 * Creates validated ProfileSupplier seed data for window/door profile manufacturers.
 *
 * Data sources:
 * - docs/context/alumina.info.md (Alumina specifications)
 * - docs/context/veka-example.info.md (VEKA specifications)
 * - Deceuninck website
 * - Rehau references
 *
 * @version 1.0.0
 */

import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import type { FactoryMetadata, FactoryOptions, FactoryResult } from './types';
import { mergeOverrides, validateWithSchema } from './utils';

// Validation constants
const MIN_SUPPLIER_NAME_LENGTH = 2;
const MAX_SUPPLIER_NAME_LENGTH = 100;
const MAX_NOTES_LENGTH = 500;

/**
 * Zod schema for ProfileSupplier input validation
 */
const profileSupplierInputSchema = z.object({
  isActive: z.boolean().default(true),
  materialType: z.enum([ 'PVC', 'ALUMINUM', 'WOOD', 'MIXED' ]),
  name: z.string().min(MIN_SUPPLIER_NAME_LENGTH).max(MAX_SUPPLIER_NAME_LENGTH),
  notes: z.string().max(MAX_NOTES_LENGTH).optional(),
});

/**
 * Input type for creating a ProfileSupplier
 */
export type ProfileSupplierInput = z.infer<typeof profileSupplierInputSchema>;

/**
 * Creates a validated ProfileSupplier object for seeding
 *
 * @param input - ProfileSupplier data
 * @param options - Factory options
 * @returns FactoryResult with validated ProfileSupplier or errors
 *
 * @example
 * ```ts
 * const result = createProfileSupplier({
 *   name: 'Deceuninck',
 *   materialType: 'PVC',
 *   isActive: true,
 *   notes: 'Belgian manufacturer, premium PVC profiles',
 * });
 *
 * if (result.success) {
 *   await prisma.profileSupplier.create({ data: result.data });
 * }
 * ```
 */
export function createProfileSupplier(
  input: ProfileSupplierInput,
  options?: FactoryOptions
): FactoryResult<Prisma.ProfileSupplierCreateInput> {
  // Merge overrides if provided
  const data = mergeOverrides(input, options?.overrides);

  // Skip validation if requested
  if (options?.skipValidation) {
    return {
      data: data as Prisma.ProfileSupplierCreateInput,
      success: true,
    };
  }

  // Validate with Zod schema
  const schemaResult = validateWithSchema(profileSupplierInputSchema, data);
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

  // Return validated data ready for Prisma
  return {
    data: validated as Prisma.ProfileSupplierCreateInput,
    success: true,
  };
}

/**
 * Creates multiple ProfileSuppliers in batch
 *
 * @param inputs - Array of ProfileSupplier inputs
 * @param options - Factory options
 * @returns Array of FactoryResults
 */
export function createProfileSuppliers(
  inputs: ProfileSupplierInput[],
  options?: FactoryOptions
): FactoryResult<Prisma.ProfileSupplierCreateInput>[] {
  return inputs.map((input) => createProfileSupplier(input, options));
}

/**
 * Filters successful results from a batch creation
 *
 * @param results - Array of FactoryResults
 * @returns Array of successful data objects
 */
export function getSuccessfulProfileSuppliers(
  results: FactoryResult<Prisma.ProfileSupplierCreateInput>[]
): Prisma.ProfileSupplierCreateInput[] {
  return results
    .filter(
      (
        result
      ): result is FactoryResult<Prisma.ProfileSupplierCreateInput> & {
        success: true;
        data: Prisma.ProfileSupplierCreateInput;
      } => result.success && result.data !== undefined
    )
    .map((result) => result.data);
}

/**
 * Factory metadata
 */
export const profileSupplierFactoryMetadata: FactoryMetadata = {
  description: 'Creates validated ProfileSupplier seed data for window/door profile manufacturers',
  name: 'ProfileSupplierFactory',
  sources: [ 'docs/context/alumina.info.md', 'docs/context/veka-example.info.md', 'https://www.deceuninck.co/' ],
  version: '1.0.0',
};
