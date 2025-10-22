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

import fs from 'node:fs';
import path from 'node:path';
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
export function createGlassType(input: GlassTypeInput, options?: FactoryOptions): FactoryResult<GlassTypeInput> {
  // Merge overrides if provided
  const data = mergeOverrides(input, options?.overrides);

  // Skip validation if requested (for performance)
  if (options?.skipValidation) {
    return {
      data: data as GlassTypeInput,
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
    data: validated,
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
export function createGlassTypes(inputs: GlassTypeInput[], options?: FactoryOptions): FactoryResult<GlassTypeInput>[] {
  return inputs.map((input) => createGlassType(input, options));
}

/**
 * Filters successful results from a batch creation
 *
 * @param results - Array of FactoryResults
 * @returns Array of successful data objects
 */
export function getSuccessfulGlassTypes(results: FactoryResult<GlassTypeInput>[]): GlassTypeInput[] {
  return results
    .filter(
      (result): result is FactoryResult<GlassTypeInput> & { success: true; data: GlassTypeInput } =>
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

/**
 * Zod schema for seed data JSON validation
 */
const seedGlassTypeSchema = z.object({
  code: z.string().min(1),
  description: z.string().optional(),
  lightTransmission: z.number().min(0).max(1).optional(),
  manufacturer: z.string().optional(),
  name: z.string().min(MIN_GLASS_NAME_LENGTH),
  series: z.string().optional(),
  solarFactor: z.number().min(0).max(1).optional(),
  thicknessMm: z.number().int().min(MIN_THICKNESS_MM).max(MAX_THICKNESS_MM),
  uValue: z.number().positive().optional(),
});

const seedFileSchema = z.object({
  glassTypes: z.array(seedGlassTypeSchema),
  manufacturer: z.string(),
  version: z.string(),
});

/**
 * Loads and seeds glass types from JSON file
 *
 * @param filePath - Path to the seed JSON file relative to prisma/data
 * @returns Object with seeded count and any errors
 *
 * @example
 * ```ts
 * const result = await seedGlassTypesFromFile('glass-types-tecnoglass.json');
 * console.log(`Seeded ${result.seeded} types, skipped ${result.skipped}, ${result.errors.length} errors`);
 * ```
 */
export async function seedGlassTypesFromFile(fileName: string): Promise<{
  errors: ValidationError[];
  seeded: number;
  skipped: number;
}> {
  const dataPath = path.join(process.cwd(), 'prisma', 'data', fileName);

  // Load JSON file
  let rawData: unknown;
  try {
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    rawData = JSON.parse(fileContent);
  } catch (error) {
    return {
      errors: [
        {
          code: 'FILE_READ_ERROR',
          context: { error, fileName },
          message: `Failed to read or parse ${fileName}`,
          path: [],
        },
      ],
      seeded: 0,
      skipped: 0,
    };
  }

  // Validate JSON structure
  const validationResult = seedFileSchema.safeParse(rawData);
  if (!validationResult.success) {
    return {
      errors: validationResult.error.issues.map((err) => ({
        code: 'SCHEMA_VALIDATION_ERROR',
        context: { zodError: err },
        message: err.message,
        path: err.path.map(String),
      })),
      seeded: 0,
      skipped: 0,
    };
  }

  const { glassTypes, manufacturer, version } = validationResult.data;
  const errors: ValidationError[] = [];
  let seeded = 0;
  let skipped = 0;

  // Dynamically import Prisma client to avoid circular dependencies
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  try {
    for (const glassType of glassTypes) {
      try {
        // Check if glass type with this code already exists
        const existing = await prisma.glassType.findUnique({
          where: { code: glassType.code },
        });

        if (existing) {
          // Skip if already seeded with same or newer version
          if (existing.isSeeded && existing.seedVersion === version) {
            skipped++;
            continue;
          }
          // Update if existing but different version
          await prisma.glassType.update({
            data: {
              description: glassType.description,
              isSeeded: true,
              lightTransmission: glassType.lightTransmission,
              manufacturer: glassType.manufacturer || manufacturer,
              name: glassType.name,
              seedVersion: version,
              series: glassType.series,
              solarFactor: glassType.solarFactor,
              thicknessMm: glassType.thicknessMm,
              uValue: glassType.uValue,
            },
            where: { code: glassType.code },
          });
          seeded++;
        } else {
          // Create new glass type with default values for deprecated fields
          await prisma.glassType.create({
            data: {
              code: glassType.code,
              description: glassType.description,
              isSeeded: true,
              lightTransmission: glassType.lightTransmission,
              manufacturer: glassType.manufacturer || manufacturer,
              name: glassType.name,
              // Default values for deprecated fields (will be removed in v2.0)
              pricePerSqm: 0, // Will be managed via TenantGlassTypePrice
              purpose: 'general' as const, // Will be managed via GlassTypeSolution
              seedVersion: version,
              series: glassType.series,
              solarFactor: glassType.solarFactor,
              thicknessMm: glassType.thicknessMm,
              uValue: glassType.uValue,
            },
          });
          seeded++;
        }
      } catch (error) {
        errors.push({
          code: 'DATABASE_ERROR',
          context: { code: glassType.code, error },
          message: `Failed to seed glass type ${glassType.code}`,
          path: ['glassTypes', glassType.code],
        });
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  return { errors, seeded, skipped };
}
