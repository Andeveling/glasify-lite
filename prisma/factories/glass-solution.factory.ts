/**
 * Glass Solution Factory
 *
 * Creates validated GlassSolution records with:
 * - Unique key validation
 * - Icon name validation (Lucide icons)
 * - Sort order validation
 * - Bilingual naming (English name + Spanish nameEs)
 */

import { z } from 'zod';
import type { FactoryOptions, FactoryResult } from './types';
import { validateWithSchema } from './utils';

/**
 * Valid Lucide icon names for glass solutions
 *
 * Limited to icons that make semantic sense for glass solutions
 */
const VALID_ICONS = [
  'Shield', // Security
  'Snowflake', // Thermal insulation
  'Volume2', // Sound insulation
  'Zap', // Energy efficiency
  'Sparkles', // Decorative
  'Home', // General purpose
  'Lock', // Alternative for security
  'Flame', // Alternative for thermal
  'Speaker', // Alternative for sound
  'Lightbulb', // Alternative for energy
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
  description: z.string().min(MIN_DESCRIPTION_LENGTH).max(MAX_DESCRIPTION_LENGTH),
  icon: z.enum(VALID_ICONS),
  key: z
    .string()
    .min(MIN_KEY_LENGTH)
    .max(MAX_KEY_LENGTH)
    .regex(/^[a-z][a-z0-9_]*$/, 'Key must be lowercase snake_case (e.g., thermal_insulation)'),
  name: z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH),
  nameEs: z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH),
  sortOrder: z.number().int().min(MIN_SORT_ORDER).max(MAX_SORT_ORDER),
});

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
    'security',
    'thermal_insulation',
    'sound_insulation',
    'energy_efficiency',
    'decorative',
    'general',
  ];
  if (!validKeys.includes(input.key)) {
    errors.push({
      code: 'INVALID_KEY',
      message: `Invalid key "${input.key}". Expected one of: ${validKeys.join(', ')}`,
      path: ['key'],
    });
  }

  // Validate nameEs is actually in Spanish (basic check)
  if (input.nameEs === input.name) {
    errors.push({
      code: 'INVALID_TRANSLATION',
      message: 'nameEs should be Spanish translation, not identical to English name',
      path: ['nameEs'],
    });
  }

  // Validate description is in Spanish
  const spanishIndicators = ['ción', 'dad', 'ento', 'ante', 'para', 'con', 'de', 'y'];
  const hasSpanishIndicator = spanishIndicators.some((indicator) =>
    input.description.toLowerCase().includes(indicator)
  );
  if (!hasSpanishIndicator) {
    errors.push({
      code: 'INVALID_LANGUAGE',
      message: 'description should be in Spanish (es-LA)',
      path: ['description'],
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
