/**
 * GlassSupplier Factory
 *
 * Creates validated GlassSupplier seed data for glass manufacturers.
 *
 * Data sources:
 * - Guardian Glass specifications
 * - Saint-Gobain product catalog
 * - Pilkington technical data
 * - AGC Glass Europe
 * - Vitro Architectural Glass
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
const MAX_CODE_LENGTH = 10;
const MAX_COUNTRY_LENGTH = 100;
const MAX_NOTES_LENGTH = 500;

/**
 * Zod schema for GlassSupplier input validation
 */
const glassSupplierInputSchema = z.object({
  code: z.string().max(MAX_CODE_LENGTH).optional(),
  contactEmail: z.string().email().optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  country: z.string().max(MAX_COUNTRY_LENGTH).optional(),
  isActive: z.boolean().default(true),
  name: z.string().min(MIN_SUPPLIER_NAME_LENGTH).max(MAX_SUPPLIER_NAME_LENGTH),
  notes: z.string().max(MAX_NOTES_LENGTH).optional(),
  website: z.string().url().optional().or(z.literal('')),
});

/**
 * Input type for creating a GlassSupplier
 */
export type GlassSupplierInput = z.infer<typeof glassSupplierInputSchema>;

/**
 * Creates a validated GlassSupplier object for seeding
 *
 * @param input - GlassSupplier data
 * @param options - Factory options
 * @returns FactoryResult with validated GlassSupplier or errors
 *
 * @example
 * ```ts
 * const result = createGlassSupplier({
 *   name: 'Guardian Glass',
 *   code: 'GRD',
 *   country: 'United States',
 *   website: 'https://www.guardianglass.com',
 *   contactEmail: 'info@guardianglass.com',
 *   isActive: true,
 *   notes: 'Leading manufacturer of float glass and fabricated glass products',
 * });
 *
 * if (result.success) {
 *   await prisma.glassSupplier.create({ data: result.data });
 * }
 * ```
 */
export function createGlassSupplier(
  input: GlassSupplierInput,
  options?: FactoryOptions
): FactoryResult<Prisma.GlassSupplierCreateInput> {
  // Merge overrides if provided
  const data = mergeOverrides(input, options?.overrides);

  // Skip validation if requested
  if (options?.skipValidation) {
    return {
      data: data as Prisma.GlassSupplierCreateInput,
      success: true,
    };
  }

  // Validate with Zod schema
  const schemaResult = validateWithSchema(glassSupplierInputSchema, data);
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
    data: validated as Prisma.GlassSupplierCreateInput,
    success: true,
  };
}

/**
 * Creates multiple GlassSuppliers in batch
 *
 * @param inputs - Array of GlassSupplier inputs
 * @param options - Factory options
 * @returns Array of FactoryResults
 *
 * @example
 * ```ts
 * const suppliers = [
 *   { name: 'Guardian Glass', code: 'GRD', country: 'United States' },
 *   { name: 'Saint-Gobain', code: 'SGG', country: 'France' },
 * ];
 *
 * const results = createGlassSuppliers(suppliers);
 * const successful = results.filter(r => r.success).map(r => r.data);
 * ```
 */
export function createGlassSuppliers(
  inputs: GlassSupplierInput[],
  options?: FactoryOptions
): FactoryResult<Prisma.GlassSupplierCreateInput>[] {
  return inputs.map((input) => createGlassSupplier(input, options));
}

/**
 * Metadata about this factory
 */
export const glassSupplierFactoryMetadata: FactoryMetadata = {
  description: 'Factory for creating validated GlassSupplier seed data',
  name: 'GlassSupplierFactory',
  version: '1.0.0',
};

/**
 * Common glass supplier presets
 */
export const GLASS_SUPPLIER_PRESETS = {
  AGC: {
    code: 'AGC',
    contactEmail: 'info@agc-glass.eu',
    country: 'Belgium',
    isActive: true,
    name: 'AGC Glass Europe',
    notes: 'Leading global glass manufacturer with presence in Europe',
    website: 'https://www.agc-glass.eu',
  },
  GUARDIAN: {
    code: 'GRD',
    contactEmail: 'info@guardianglass.com',
    country: 'United States',
    isActive: true,
    name: 'Guardian Glass',
    notes: 'Leading manufacturer of float glass and fabricated glass products',
    website: 'https://www.guardianglass.com',
  },
  PILKINGTON: {
    code: 'PLK',
    contactEmail: 'pilkington@nsg.com',
    country: 'United Kingdom',
    isActive: true,
    name: 'Pilkington',
    notes: 'Pioneer in float glass manufacturing, part of NSG Group',
    website: 'https://www.pilkington.com',
  },
  SAINT_GOBAIN: {
    code: 'SGG',
    contactEmail: 'contact@saint-gobain-glass.com',
    country: 'France',
    isActive: true,
    name: 'Saint-Gobain',
    notes: 'World leader in glass manufacturing and distribution',
    website: 'https://www.saint-gobain-glass.com',
  },
  VITRO: {
    code: 'VIT',
    contactEmail: 'info@vitro.com',
    country: 'Mexico',
    isActive: true,
    name: 'Vitro Architectural Glass',
    notes: 'Leading glass manufacturer in North and South America',
    website: 'https://www.vitroglazings.com',
  },
} as const;
