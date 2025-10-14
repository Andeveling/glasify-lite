/**
 * GlassCharacteristic Factory
 *
 * Creates validated GlassCharacteristic seed data for glass properties.
 * Replaces rigid boolean fields with flexible, extensible characteristic system.
 *
 * Categories:
 * - safety: Security and protection characteristics (tempered, laminated, etc.)
 * - thermal: Thermal performance (low-e, triple glazed, etc.)
 * - acoustic: Sound insulation properties
 * - coating: Surface treatments and coatings
 * - solar: Solar control properties
 * - privacy: Privacy and obscuration features
 *
 * @version 1.0.0
 */

import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import type { FactoryMetadata, FactoryOptions, FactoryResult } from './types';
import { mergeOverrides, validateWithSchema } from './utils';

// Validation constants
const MIN_KEY_LENGTH = 2;
const MAX_KEY_LENGTH = 50;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_CATEGORY_LENGTH = 50;

/**
 * Valid characteristic categories
 */
const CHARACTERISTIC_CATEGORIES = ['safety', 'thermal', 'acoustic', 'coating', 'solar', 'privacy'] as const;

/**
 * Zod schema for GlassCharacteristic input validation
 */
const glassCharacteristicInputSchema = z.object({
  category: z.enum(CHARACTERISTIC_CATEGORIES),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
  isActive: z.boolean().default(true),
  key: z
    .string()
    .min(MIN_KEY_LENGTH)
    .max(MAX_KEY_LENGTH)
    .regex(/^[a-z0-9_]+$/, 'Key must be lowercase alphanumeric with underscores'),
  name: z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH),
  nameEs: z.string().min(MIN_NAME_LENGTH).max(MAX_NAME_LENGTH),
  sortOrder: z.number().int().min(0).default(0),
});

/**
 * Input type for creating a GlassCharacteristic
 */
export type GlassCharacteristicInput = z.infer<typeof glassCharacteristicInputSchema>;

/**
 * Creates a validated GlassCharacteristic object for seeding
 *
 * @param input - GlassCharacteristic data
 * @param options - Factory options
 * @returns FactoryResult with validated GlassCharacteristic or errors
 *
 * @example
 * ```ts
 * const result = createGlassCharacteristic({
 *   key: 'tempered',
 *   name: 'Tempered',
 *   nameEs: 'Templado',
 *   description: 'Heat-treated glass for enhanced strength and safety',
 *   category: 'safety',
 *   sortOrder: 1,
 *   isActive: true,
 * });
 *
 * if (result.success) {
 *   await prisma.glassCharacteristic.create({ data: result.data });
 * }
 * ```
 */
export function createGlassCharacteristic(
  input: GlassCharacteristicInput,
  options?: FactoryOptions
): FactoryResult<Prisma.GlassCharacteristicCreateInput> {
  // Merge overrides if provided
  const data = mergeOverrides(input, options?.overrides);

  // Skip validation if requested
  if (options?.skipValidation) {
    return {
      data: data as Prisma.GlassCharacteristicCreateInput,
      success: true,
    };
  }

  // Validate with Zod schema
  const schemaResult = validateWithSchema(glassCharacteristicInputSchema, data);
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

  // Return validated data ready for Prisma
  return {
    data: validated as Prisma.GlassCharacteristicCreateInput,
    success: true,
  };
}

/**
 * Creates multiple GlassCharacteristics in batch
 *
 * @param inputs - Array of GlassCharacteristic inputs
 * @param options - Factory options
 * @returns Array of FactoryResults
 */
export function createGlassCharacteristics(
  inputs: GlassCharacteristicInput[],
  options?: FactoryOptions
): FactoryResult<Prisma.GlassCharacteristicCreateInput>[] {
  return inputs.map((input) => createGlassCharacteristic(input, options));
}

/**
 * Metadata about this factory
 */
export const glassCharacteristicFactoryMetadata: FactoryMetadata = {
  description: 'Factory for creating validated GlassCharacteristic seed data with category support',
  name: 'GlassCharacteristicFactory',
  version: '1.0.0',
};

/**
 * Standard glass characteristic presets
 * These map to the deprecated boolean fields in GlassType
 */
export const GLASS_CHARACTERISTIC_PRESETS: GlassCharacteristicInput[] = [
  // Safety characteristics
  {
    category: 'safety',
    description: 'Heat-treated glass that is 4-5 times stronger than regular glass. Breaks into small, safe pieces.',
    isActive: true,
    key: 'tempered',
    name: 'Tempered',
    nameEs: 'Templado',
    sortOrder: 1,
  },
  {
    category: 'safety',
    description: 'Two or more glass layers bonded with interlayer (PVB). Holds together when shattered.',
    isActive: true,
    key: 'laminated',
    name: 'Laminated',
    nameEs: 'Laminado',
    sortOrder: 2,
  },
  {
    category: 'safety',
    description:
      'Wire mesh embedded in glass for fire resistance and security. Not commonly used in modern construction.',
    isActive: true,
    key: 'wired',
    name: 'Wired',
    nameEs: 'Armado',
    sortOrder: 3,
  },

  // Thermal characteristics
  {
    category: 'thermal',
    description: 'Microscopically thin coating that reflects heat back into the room while allowing light to pass.',
    isActive: true,
    key: 'low_e',
    name: 'Low-E (Low Emissivity)',
    nameEs: 'Bajo Emisivo',
    sortOrder: 10,
  },
  {
    category: 'thermal',
    description: 'Two glass panes separated by air or gas space for improved thermal insulation.',
    isActive: true,
    key: 'double_glazed',
    name: 'Double Glazed',
    nameEs: 'Doble Vidriado Hermético',
    sortOrder: 11,
  },
  {
    category: 'thermal',
    description: 'Three glass panes with two insulating spaces. Superior thermal performance for extreme climates.',
    isActive: true,
    key: 'triple_glazed',
    name: 'Triple Glazed',
    nameEs: 'Triple Vidriado Hermético',
    sortOrder: 12,
  },
  {
    category: 'thermal',
    description: 'Argon or krypton gas fill between panes for enhanced thermal performance.',
    isActive: true,
    key: 'gas_filled',
    name: 'Gas-Filled',
    nameEs: 'Con Gas Aislante',
    sortOrder: 13,
  },

  // Acoustic characteristics
  {
    category: 'acoustic',
    description: 'Specialized laminated glass with acoustic PVB interlayer for superior sound reduction.',
    isActive: true,
    key: 'acoustic',
    name: 'Acoustic',
    nameEs: 'Acústico',
    sortOrder: 20,
  },
  {
    category: 'acoustic',
    description: 'Asymmetric glass thickness configuration to reduce sound transmission at different frequencies.',
    isActive: true,
    key: 'asymmetric_glazing',
    name: 'Asymmetric Glazing',
    nameEs: 'Vidriado Asimétrico',
    sortOrder: 21,
  },

  // Solar control characteristics
  {
    category: 'solar',
    description: 'Reflective coating that reduces solar heat gain while maintaining visible light transmission.',
    isActive: true,
    key: 'solar_control',
    name: 'Solar Control',
    nameEs: 'Control Solar',
    sortOrder: 30,
  },
  {
    category: 'solar',
    description: 'Body-tinted glass that absorbs solar energy. Available in bronze, gray, green, blue.',
    isActive: true,
    key: 'tinted',
    name: 'Tinted',
    nameEs: 'Tintado',
    sortOrder: 31,
  },
  {
    category: 'solar',
    description: 'Mirror-like reflective coating for high solar control and privacy.',
    isActive: true,
    key: 'reflective',
    name: 'Reflective',
    nameEs: 'Reflectivo',
    sortOrder: 32,
  },

  // Privacy characteristics
  {
    category: 'privacy',
    description: 'Translucent glass that obscures view while transmitting light. Acid-etched or sandblasted finish.',
    isActive: true,
    key: 'frosted',
    name: 'Frosted',
    nameEs: 'Esmerilado',
    sortOrder: 40,
  },
  {
    category: 'privacy',
    description: 'Glass with patterns or textures for decorative effect and privacy. Various designs available.',
    isActive: true,
    key: 'patterned',
    name: 'Patterned',
    nameEs: 'Decorado',
    sortOrder: 41,
  },
  {
    category: 'privacy',
    description: 'Electronically switchable glass that changes from clear to opaque with applied voltage.',
    isActive: true,
    key: 'smart_glass',
    name: 'Smart Glass',
    nameEs: 'Vidrio Inteligente',
    sortOrder: 42,
  },

  // Coating characteristics
  {
    category: 'coating',
    description:
      'Self-cleaning coating that uses photocatalytic and hydrophilic properties to break down and wash away dirt.',
    isActive: true,
    key: 'self_cleaning',
    name: 'Self-Cleaning',
    nameEs: 'Autolimpiable',
    sortOrder: 50,
  },
  {
    category: 'coating',
    description: 'UV-blocking coating that protects interior furnishings and reduces fading.',
    isActive: true,
    key: 'uv_blocking',
    name: 'UV Blocking',
    nameEs: 'Bloqueador UV',
    sortOrder: 51,
  },
  {
    category: 'coating',
    description: 'Anti-reflective coating for reduced glare and maximum clarity.',
    isActive: true,
    key: 'anti_reflective',
    name: 'Anti-Reflective',
    nameEs: 'Anti-Reflectivo',
    sortOrder: 52,
  },
];
