/**
 * Glass Solution Factory
 *
 * Creates validated GlassSolution records with:
 * - Unique key validation
 * - Icon name validation (Lucide icons)
 * - Sort order validation
 * - Bilingual naming (English name + Spanish nameEs)
 */

import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { FactoryOptions, FactoryResult, ValidationError } from "./types";
import { validateWithSchema } from "./utils";

/**
 * Valid Lucide icon names for glass solutions
 *
 * Limited to icons that make semantic sense for glass solutions
 */
const VALID_ICONS = [
  "Shield", // Security
  "Snowflake", // Thermal insulation
  "Volume2", // Sound insulation
  "Zap", // Energy efficiency
  "Sparkles", // Decorative
  "Home", // General purpose
  "Lock", // Alternative for security
  "Flame", // Alternative for thermal
  "Speaker", // Alternative for sound
  "Lightbulb", // Alternative for energy
] as const;

// Validation constants
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 200;
const MIN_NAME_LENGTH = 3;
const MAX_NAME_LENGTH = 100;
const MIN_KEY_LENGTH = 3;
const MAX_KEY_LENGTH = 50;
const MIN_SORT_ORDER = 1;
const MAX_SORT_ORDER = 100;

/**
 * Zod schema for GlassSolution input validation
 */
const glassSolutionSchema = z.object({
  description: z
    .string()
    .min(MIN_DESCRIPTION_LENGTH)
    .max(MAX_DESCRIPTION_LENGTH),
  icon: z.enum(VALID_ICONS),
  key: z
    .string()
    .min(MIN_KEY_LENGTH)
    .max(MAX_KEY_LENGTH)
    .regex(
      /^[a-z][a-z0-9_]*$/,
      "Key must be lowercase snake_case (e.g., thermal_insulation)"
    ),
  name: z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH),
  nameEs: z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH),
  sortOrder: z.number().int().min(MIN_SORT_ORDER).max(MAX_SORT_ORDER),
});

/**
 * Helper: Generate URL-friendly slug from key
 *
 * Converts snake_case keys to kebab-case slugs
 * @example 'solar_control' → 'solar-control'
 * @example 'thermal_insulation' → 'thermal-insulation'
 */
function generateSlugFromKey(key: string): string {
  return key.replace(/_/g, "-");
}

/**
 * GlassSolution input type (inferred from schema)
 */
export type GlassSolutionInput = z.infer<typeof glassSolutionSchema>;

/**
 * Create a validated GlassSolution record
 *
 * @param input - Glass solution data (key, name, nameEs, description, icon, sortOrder)
 * @param options - Factory options (skipValidation)
 * @returns FactoryResult with validated data or validation errors
 *
 * @example
 * ```typescript
 * const result = createGlassSolution({
 *   key: 'security',
 *   name: 'Security',
 *   nameEs: 'Seguridad',
 *   description: 'Protección contra impactos y acceso no autorizado',
 *   icon: 'Shield',
 *   sortOrder: 1,
 * });
 *
 * if (result.success) {
 *   await prisma.glassSolution.create({ data: result.data });
 * }
 * ```
 */
export function createGlassSolution(
  input: GlassSolutionInput,
  options: FactoryOptions = {}
): FactoryResult<GlassSolutionInput> {
  // Phase 1: Zod schema validation
  if (!options.skipValidation) {
    const schemaValidation = validateWithSchema(glassSolutionSchema, input);
    if (!schemaValidation.success) {
      return schemaValidation;
    }
  }

  // Phase 2: Business logic validation
  const errors: Array<{ code: string; message: string; path: string[] }> = [];

  // Validate key uniqueness (should be checked at database level, but good practice)
  const validKeys = [
    "security",
    "thermal_insulation",
    "sound_insulation",
    "energy_efficiency",
    "decorative",
    "general",
  ];
  if (!validKeys.includes(input.key)) {
    errors.push({
      code: "INVALID_KEY",
      message: `Invalid key "${input.key}". Expected one of: ${validKeys.join(", ")}`,
      path: ["key"],
    });
  }

  // Validate nameEs is actually in Spanish (basic check)
  if (input.nameEs === input.name) {
    errors.push({
      code: "INVALID_TRANSLATION",
      message:
        "nameEs should be Spanish translation, not identical to English name",
      path: ["nameEs"],
    });
  }

  // Validate description is in Spanish
  const spanishIndicators = [
    "ción",
    "dad",
    "ento",
    "ante",
    "para",
    "con",
    "de",
    "y",
  ];
  const hasSpanishIndicator = spanishIndicators.some((indicator) =>
    input.description.toLowerCase().includes(indicator)
  );
  if (!hasSpanishIndicator) {
    errors.push({
      code: "INVALID_LANGUAGE",
      message: "description should be in Spanish (es-LA)",
      path: ["description"],
    });
  }

  if (errors.length > 0) {
    return {
      errors,
      success: false,
    };
  }

  // Success: return validated data
  return {
    data: input,
    success: true,
  };
}

/**
 * Seed file schema validation
 */
const seedSolutionSchema = z.object({
  description: z.string(),
  icon: z.string(),
  key: z.string(),
  name: z.string(),
  nameEs: z.string(),
  sortOrder: z.number(),
});

const seedFileSchema = z.object({
  solutions: z.array(seedSolutionSchema),
  version: z.string(),
});

/**
 * Loads and seeds glass solutions from JSON file
 *
 * @param fileName - Name of the seed JSON file in prisma/data
 * @returns Result with counts and any errors
 *
 * @example
 * ```ts
 * const result = await seedGlassSolutionsFromFile('glass-solutions.json');
 * console.log(`Seeded ${result.seeded} solutions, skipped ${result.skipped}`);
 * ```
 */
export async function seedGlassSolutionsFromFile(fileName: string): Promise<{
  errors: ValidationError[];
  seeded: number;
  skipped: number;
}> {
  const dataPath = path.join(process.cwd(), "prisma", "data", fileName);

  // Load JSON file
  let rawData: unknown;
  try {
    const fileContent = fs.readFileSync(dataPath, "utf-8");
    rawData = JSON.parse(fileContent);
  } catch (error) {
    return {
      errors: [
        {
          code: "FILE_READ_ERROR",
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
        code: "SCHEMA_VALIDATION_ERROR",
        context: { zodError: err },
        message: err.message,
        path: err.path.map(String),
      })),
      seeded: 0,
      skipped: 0,
    };
  }

  const { solutions, version } = validationResult.data;
  const errors: ValidationError[] = [];
  let seeded = 0;
  let skipped = 0;

  // Dynamically import Prisma client
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    for (const solution of solutions) {
      try {
        // Check if solution with this key already exists
        const existing = await prisma.glassSolution.findUnique({
          where: { key: solution.key },
        });

        if (existing) {
          // Skip if already seeded with same or newer version
          if (existing.isSeeded && existing.seedVersion === version) {
            skipped++;
            continue;
          }
          // Update if existing but different version
          await prisma.glassSolution.update({
            data: {
              description: solution.description,
              icon: solution.icon,
              isSeeded: true,
              name: solution.name,
              nameEs: solution.nameEs,
              seedVersion: version,
              slug: generateSlugFromKey(solution.key),
              sortOrder: solution.sortOrder,
            },
            where: { key: solution.key },
          });
          seeded++;
        } else {
          // Create new solution
          await prisma.glassSolution.create({
            data: {
              description: solution.description,
              icon: solution.icon,
              isSeeded: true,
              key: solution.key,
              name: solution.name,
              nameEs: solution.nameEs,
              seedVersion: version,
              slug: generateSlugFromKey(solution.key),
              sortOrder: solution.sortOrder,
            },
          });
          seeded++;
        }
      } catch (error) {
        errors.push({
          code: "DATABASE_ERROR",
          context: { error, key: solution.key },
          message: `Failed to seed glass solution ${solution.key}`,
          path: ["solutions", solution.key],
        });
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  return { errors, seeded, skipped };
}
