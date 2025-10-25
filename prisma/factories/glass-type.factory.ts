/**
 * GlassType Factory
 *
 * Creates validated GlassType seed data from JSON files.
 * Supports idempotent seeding with isSeeded flag and seedVersion tracking.
 *
 * Data sources:
 * - prisma/data/glass-types-tecnoglass.json
 * - Prisma schema GlassType model (v2.0 - clean schema)
 *
 * @version 2.0.0 (Static Glass Taxonomy - TK-015-012)
 */

import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import type { FactoryMetadata, FactoryOptions, FactoryResult, ValidationError } from './types';
import { mergeOverrides, validateWithSchema } from './utils';

// Validation constants
const MIN_GLASS_NAME_LENGTH = 3;
const MAX_GLASS_NAME_LENGTH = 100;
const MIN_CODE_LENGTH = 2;
const MAX_CODE_LENGTH = 50;
const MAX_SERIES_LENGTH = 50;
const MAX_MANUFACTURER_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MIN_THICKNESS_MM = 3;
const MAX_THICKNESS_MM = 50;
const MIN_U_VALUE = 0.5; // W/m²K (triple-glazed with argon + Low-E)
const MAX_U_VALUE = 6.0; // W/m²K (single-glazed)
const HIGH_U_VALUE_THRESHOLD = 3.0; // Poor thermal insulation warning threshold
const MIN_SOLAR_FACTOR = 0.0; // g-value (fully reflective)
const MAX_SOLAR_FACTOR = 1.0; // g-value (clear glass)
const SOLAR_FACTOR_TRANSMISSION_TOLERANCE = 0.2; // Maximum difference between solar factor and light transmission
const MIN_LIGHT_TRANSMISSION = 0.0; // 0% (opaque)
const MAX_LIGHT_TRANSMISSION = 1.0; // 100% (ultra-clear)

/**
 * Zod schema for GlassType seed data input validation
 * Matches glass-type-seed.schema.json contract
 */
const glassTypeInputSchema = z.object({
  code: z.string().min(MIN_CODE_LENGTH).max(MAX_CODE_LENGTH),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
  lightTransmission: z.number().min(MIN_LIGHT_TRANSMISSION).max(MAX_LIGHT_TRANSMISSION).optional(),
  manufacturer: z.string().max(MAX_MANUFACTURER_LENGTH).optional(),
  name: z.string().min(MIN_GLASS_NAME_LENGTH).max(MAX_GLASS_NAME_LENGTH),
  pricePerSqm: z.number().min(0).optional(), // Optional for seed data, will use default
  series: z.string().max(MAX_SERIES_LENGTH).optional(),
  solarFactor: z.number().min(MIN_SOLAR_FACTOR).max(MAX_SOLAR_FACTOR).optional(),
  thicknessMm: z.number().int().min(MIN_THICKNESS_MM).max(MAX_THICKNESS_MM),
  uValue: z.number().min(MIN_U_VALUE).max(MAX_U_VALUE).optional(),
});

/**
 * Input type for creating a GlassType from seed data
 */
export type GlassTypeInput = z.infer<typeof glassTypeInputSchema>;

/**
 * Creates a validated GlassType object for seeding
 *
 * @param input - GlassType data from JSON seed file
 * @param options - Factory options (overrides, skipValidation)
 * @returns FactoryResult with validated GlassType or errors
 *
 * @example
 * ```ts
 * const result = createGlassType({
 *   code: 'N70/38',
 *   name: 'Neutral Low-E N70/38',
 *   series: 'Serie-N',
 *   manufacturer: 'Tecnoglass',
 *   thicknessMm: 6,
 *   uValue: 1.8,
 *   solarFactor: 0.43,
 *   lightTransmission: 0.70,
 * });
 *
 * if (result.success) {
 *   await prisma.glassType.upsert({
 *     where: { code: result.data.code },
 *     update: {},
 *     create: {
 *       ...result.data,
 *       isSeeded: true,
 *       seedVersion: '1.0',
 *     },
 *   });
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

  // Validate U-value range warnings
  if (validated.uValue && validated.uValue > HIGH_U_VALUE_THRESHOLD) {
    additionalErrors.push({
      code: 'HIGH_U_VALUE_WARNING',
      context: { uValue: validated.uValue },
      message: 'U-value above 3.0 indicates poor thermal insulation',
      path: ['uValue'],
    });
  }

  // Validate solar factor consistency with light transmission
  if (
    validated.solarFactor &&
    validated.lightTransmission &&
    validated.solarFactor > validated.lightTransmission + SOLAR_FACTOR_TRANSMISSION_TOLERANCE
  ) {
    additionalErrors.push({
      code: 'INCONSISTENT_SOLAR_PROPERTIES',
      context: { lightTransmission: validated.lightTransmission, solarFactor: validated.solarFactor },
      message: 'Solar factor should not exceed light transmission by more than 0.2',
      path: ['solarFactor', 'lightTransmission'],
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
    'https://www.aluviarte.com/tipos-de-cristal-aluviarte.html',
    'https://vitrolit.com/productos/cristal-templado-incoloro/',
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
              pricePerSqm: (glassType as GlassTypeInput & { pricePerSqm?: number }).pricePerSqm ?? existing.pricePerSqm,
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
          // Create new glass type (v2.0 clean schema - no deprecated fields)
          await prisma.glassType.create({
            data: {
              code: glassType.code,
              description: glassType.description,
              isSeeded: true,
              lightTransmission: glassType.lightTransmission,
              manufacturer: glassType.manufacturer || manufacturer,
              name: glassType.name,
              pricePerSqm: (glassType as GlassTypeInput & { pricePerSqm?: number }).pricePerSqm ?? 50_000.0,
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
