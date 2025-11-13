/**
 * @file GlassCharacteristic Factory
 * @description Generates type-safe test data for GlassCharacteristic seeding
 * Pure functions with no ORM dependencies - generates POJOs only
 *
 * Categories:
 * - safety: Security and protection characteristics (tempered, laminated, etc.)
 * - thermal: Thermal performance (low-e, triple glazed, etc.)
 * - acoustic: Sound insulation properties
 * - coating: Surface treatments and coatings
 * - solar: Solar control properties
 * - privacy: Privacy and obscuration features
 * - substrate: Base glass materials
 */

import { GLASS_CHARACTERISTIC_FIELD_LENGTHS } from "@/server/db/schemas/constants/glass-characteristic.constants";
import type { NewGlassCharacteristic } from "@/server/db/schemas/glass-characteristic.schema";
import { glassCharacteristicInsertSchema } from "@/server/db/schemas/glass-characteristic.schema";
import type { FactoryOptions, FactoryResult } from "../types/base.types";
import { createSuccessResult } from "../utils/validation.utils";

// Constants
const CHARACTERISTIC_CATEGORIES = [
  "safety",
  "thermal",
  "acoustic",
  "coating",
  "solar",
  "privacy",
  "substrate",
] as const;

const ACTIVE_PROBABILITY = 0.9;
const HAS_DESCRIPTION_PROBABILITY = 0.7;
const MAX_SORT_ORDER = 100;

// Real-world characteristics presets
export const ALL_CHARACTERISTICS: NewGlassCharacteristic[] = [
  // Safety
  {
    key: "tempered",
    name: "Tempered",
    nameEs: "Templado",
    category: "safety",
    description:
      "Heat-treated glass that is 4-5 times stronger than regular glass",
    isActive: true,
    sortOrder: 1,
  },
  {
    key: "laminated",
    name: "Laminated",
    nameEs: "Laminado",
    category: "safety",
    description: "Two or more glass layers bonded with interlayer for security",
    isActive: true,
    sortOrder: 2,
  },
  {
    key: "bulletproof",
    name: "Bulletproof",
    nameEs: "Antibalas",
    category: "safety",
    description: "Multi-layer laminated glass resistant to ballistic impact",
    isActive: true,
    sortOrder: 3,
  },
  // Thermal
  {
    key: "low_e",
    name: "Low-E Coating",
    nameEs: "Capa Low-E",
    category: "thermal",
    description:
      "Microscopically thin coating that reflects heat while allowing light",
    isActive: true,
    sortOrder: 10,
  },
  {
    key: "double_glazed",
    name: "Double Glazed",
    nameEs: "Doble Vidriado",
    category: "thermal",
    description: "Two glass panes with insulating air/gas space between them",
    isActive: true,
    sortOrder: 11,
  },
  {
    key: "triple_glazed",
    name: "Triple Glazed",
    nameEs: "Triple Vidriado",
    category: "thermal",
    description: "Three glass panes for maximum thermal insulation",
    isActive: true,
    sortOrder: 12,
  },
  // Acoustic
  {
    key: "acoustic_laminated",
    name: "Acoustic Laminated",
    nameEs: "Laminado Acústico",
    category: "acoustic",
    description: "Laminated glass with acoustic interlayer for sound reduction",
    isActive: true,
    sortOrder: 20,
  },
  {
    key: "sound_control",
    name: "Sound Control",
    nameEs: "Control de Sonido",
    category: "acoustic",
    description: "Specialized glass composition for enhanced sound insulation",
    isActive: true,
    sortOrder: 21,
  },
  // Coating
  {
    key: "reflective",
    name: "Reflective",
    nameEs: "Reflectivo",
    category: "coating",
    description: "Metallic coating that reflects light and reduces glare",
    isActive: true,
    sortOrder: 30,
  },
  {
    key: "self_cleaning",
    name: "Self-Cleaning",
    nameEs: "Autolimpiante",
    category: "coating",
    description: "Photocatalytic coating that breaks down organic dirt",
    isActive: true,
    sortOrder: 31,
  },
  // Solar
  {
    key: "solar_control",
    name: "Solar Control",
    nameEs: "Control Solar",
    category: "solar",
    description: "Reduces solar heat gain while maintaining natural light",
    isActive: true,
    sortOrder: 40,
  },
  {
    key: "uv_protection",
    name: "UV Protection",
    nameEs: "Protección UV",
    category: "solar",
    description: "Blocks harmful ultraviolet radiation",
    isActive: true,
    sortOrder: 41,
  },
  // Privacy
  {
    key: "frosted",
    name: "Frosted",
    nameEs: "Esmerilado",
    category: "privacy",
    description: "Acid-etched or sandblasted glass for translucent privacy",
    isActive: true,
    sortOrder: 50,
  },
  {
    key: "smart_glass",
    name: "Smart Glass",
    nameEs: "Vidrio Inteligente",
    category: "privacy",
    description: "Electronically switchable between transparent and opaque",
    isActive: true,
    sortOrder: 51,
  },
  // Substrate
  {
    key: "clear_glass",
    name: "Clear Glass",
    nameEs: "Vidrio Transparente",
    category: "substrate",
    description: "Standard transparent float glass",
    isActive: true,
    sortOrder: 60,
  },
  {
    key: "ultra_clear",
    name: "Ultra Clear",
    nameEs: "Ultra Transparente",
    category: "substrate",
    description: "Low-iron glass with minimal green tint",
    isActive: true,
    sortOrder: 61,
  },
];

// Helper functions
function randomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)] as T;
}

function randomBoolean(probability = 0.5): boolean {
  return Math.random() < probability;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate realistic characteristic key
 */
function generateKey(): string {
  const prefixes = ["auto", "eco", "smart", "ultra", "super", "high", "low"];
  const bases = [
    "clear",
    "tint",
    "coat",
    "shield",
    "guard",
    "protect",
    "insulate",
  ];

  const prefix = randomElement(prefixes);
  const base = randomElement(bases);

  return `${prefix}_${base}`;
}

/**
 * Generate realistic characteristic name
 */
function generateName(): string {
  const adjectives = [
    "Premium",
    "Advanced",
    "Enhanced",
    "Professional",
    "Standard",
    "Economy",
  ];
  const types = [
    "Glass",
    "Coating",
    "Treatment",
    "System",
    "Protection",
    "Control",
  ];

  return `${randomElement(adjectives)} ${randomElement(types)}`;
}

/**
 * Generate Spanish name
 */
function generateNameEs(name: string): string {
  const translations: Record<string, string> = {
    Premium: "Premium",
    Advanced: "Avanzado",
    Enhanced: "Mejorado",
    Professional: "Profesional",
    Standard: "Estándar",
    Economy: "Económico",
    Glass: "Vidrio",
    Coating: "Recubrimiento",
    Treatment: "Tratamiento",
    System: "Sistema",
    Protection: "Protección",
    Control: "Control",
  };

  return name
    .split(" ")
    .map((word) => translations[word] ?? word)
    .join(" ");
}

/**
 * Generate description
 */
function generateDescription(): string | undefined {
  if (!randomBoolean(HAS_DESCRIPTION_PROBABILITY)) {
    return;
  }

  const templates = [
    "Advanced glass technology for superior performance",
    "Industry-leading solution for modern architecture",
    "Cost-effective option for standard applications",
    "Eco-friendly material with excellent properties",
    "Professional-grade glass for demanding projects",
    "Innovative coating for enhanced functionality",
  ];

  const description = randomElement(templates);
  return description.substring(
    0,
    GLASS_CHARACTERISTIC_FIELD_LENGTHS.DESCRIPTION
  );
}

/**
 * Generate a single GlassCharacteristic POJO
 *
 * @param options - Factory options with overrides
 * @returns FactoryResult with generated data or validation error
 *
 * @example
 * ```typescript
 * const result = generateGlassCharacteristic();
 * if (result.success) {
 *   console.log(result.data); // { key: 'auto_clear', name: 'Premium Glass', ... }
 * }
 * ```
 */
export function generateGlassCharacteristic(
  options?: FactoryOptions<NewGlassCharacteristic>
): FactoryResult<NewGlassCharacteristic> {
  const name = generateName();

  const defaults: NewGlassCharacteristic = {
    key: generateKey(),
    name,
    nameEs: generateNameEs(name),
    category: randomElement(CHARACTERISTIC_CATEGORIES),
    description: generateDescription(),
    isActive: randomBoolean(ACTIVE_PROBABILITY),
    sortOrder: randomInt(0, MAX_SORT_ORDER),
    isSeeded: false,
    seedVersion: undefined,
  };

  const data = {
    ...defaults,
    ...options?.overrides,
  };

  // Validate before returning
  if (!options?.skipValidation) {
    const parsed = glassCharacteristicInsertSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        errors: parsed.error.issues.map((err) => ({
          code: err.code,
          context: {
            expected: "expected" in err ? err.expected : undefined,
            received: "received" in err ? err.received : undefined,
          },
          message: err.message,
          path: err.path.map(String),
        })),
      };
    }
    return createSuccessResult(parsed.data);
  }

  return createSuccessResult(data);
}

/**
 * Generate multiple GlassCharacteristics
 *
 * @param count - Number of characteristics to generate
 * @param options - Factory options for all instances
 * @returns Array of FactoryResult (one per generated entity)
 */
export function generateGlassCharacteristics(
  count: number,
  options?: FactoryOptions<NewGlassCharacteristic>
): FactoryResult<NewGlassCharacteristic>[] {
  return Array.from({ length: count }, () =>
    generateGlassCharacteristic(options)
  );
}

/**
 * Generate a batch of valid GlassCharacteristics (only successful results)
 */
export function generateGlassCharacteristicBatch(
  count: number,
  options?: FactoryOptions<NewGlassCharacteristic>
): NewGlassCharacteristic[] {
  const results = generateGlassCharacteristics(count, options);
  const validResults = results
    .filter(
      (
        r
      ): r is FactoryResult<NewGlassCharacteristic> & {
        success: true;
        data: NewGlassCharacteristic;
      } => r.success && r.data !== undefined
    )
    .map((r) => r.data);

  return validResults.slice(0, count);
}

/**
 * Generate from preset characteristics (real-world examples)
 */
export function generateGlassCharacteristicFromPreset(
  presetIndex?: number,
  options?: FactoryOptions<NewGlassCharacteristic>
): FactoryResult<NewGlassCharacteristic> {
  const index = presetIndex ?? randomInt(0, ALL_CHARACTERISTICS.length - 1);
  const preset = ALL_CHARACTERISTICS[index];

  return generateGlassCharacteristic({
    ...options,
    overrides: {
      ...preset,
      ...options?.overrides,
    },
  });
}

/**
 * Generate characteristic with specific category
 */
export function generateGlassCharacteristicWithCategory(
  category: (typeof CHARACTERISTIC_CATEGORIES)[number],
  options?: FactoryOptions<NewGlassCharacteristic>
): FactoryResult<NewGlassCharacteristic> {
  return generateGlassCharacteristic({
    ...options,
    overrides: {
      ...options?.overrides,
      category,
    },
  });
}

/**
 * Generate inactive characteristic
 */
export function generateInactiveGlassCharacteristic(
  options?: FactoryOptions<NewGlassCharacteristic>
): FactoryResult<NewGlassCharacteristic> {
  return generateGlassCharacteristic({
    ...options,
    overrides: {
      ...options?.overrides,
      isActive: false,
    },
  });
}

/**
 * Generate seeded characteristic (from seed data)
 */
export function generateSeededGlassCharacteristic(
  seedVersion = "1.0",
  options?: FactoryOptions<NewGlassCharacteristic>
): FactoryResult<NewGlassCharacteristic> {
  return generateGlassCharacteristic({
    ...options,
    overrides: {
      ...options?.overrides,
      isSeeded: true,
      seedVersion,
    },
  });
}

/**
 * Generate characteristic with custom sort order
 */
export function generateGlassCharacteristicWithSortOrder(
  sortOrder: number,
  options?: FactoryOptions<NewGlassCharacteristic>
): FactoryResult<NewGlassCharacteristic> {
  return generateGlassCharacteristic({
    ...options,
    overrides: {
      ...options?.overrides,
      sortOrder,
    },
  });
}
