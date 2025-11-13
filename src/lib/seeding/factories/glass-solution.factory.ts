/**
 * @file GlassSolution Factory
 * @description Generates type-safe test data for GlassSolution seeding
 * Pure functions with no ORM dependencies - generates POJOs only
 */

import type { GlassSolutionCreateInput } from "../schemas/glass-solution.schema";
import { glassSolutionCreateSchema } from "../schemas/glass-solution.schema";
import type { FactoryOptions, FactoryResult } from "../types/base.types";
import { createSuccessResult } from "../utils/validation.utils";

// Constants
const ACTIVE_PROBABILITY = 0.95;
const HAS_ICON_PROBABILITY = 0.9;
const MAX_SORT_ORDER = 100;

// Preset solutions (based on industry standards)
const PRESET_SOLUTIONS = [
  {
    key: "general",
    name: "General Purpose",
    nameEs: "Uso General",
    icon: "Home",
  },
  { key: "security", name: "Security", nameEs: "Seguridad", icon: "Shield" },
  {
    key: "thermal_insulation",
    name: "Thermal Insulation",
    nameEs: "Aislamiento Térmico",
    icon: "Snowflake",
  },
  {
    key: "sound_insulation",
    name: "Sound Insulation",
    nameEs: "Aislamiento Acústico",
    icon: "Volume2",
  },
  {
    key: "energy_efficiency",
    name: "Energy Efficiency",
    nameEs: "Eficiencia Energética",
    icon: "Zap",
  },
  {
    key: "decorative",
    name: "Decorative",
    nameEs: "Decorativo",
    icon: "Sparkles",
  },
] as const;

// Helpers
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
 * Generate a random glass solution description in Spanish
 */
function generateDescription(key: string): string {
  const descriptions: Record<string, string> = {
    general: "Vidrio claro simple para uso residencial estándar.",
    security:
      "Vidrio laminado y templado para mayor seguridad contra impactos.",
    thermal_insulation:
      "DVH (Doble Vidrio Hermético) para aislamiento térmico y ahorro energético.",
    sound_insulation:
      "Vidrio laminado acústico para reducción de ruido exterior.",
    energy_efficiency:
      "Vidrio de baja emisividad (Low-E) para control solar y térmico.",
    decorative: "Vidrios tintados y reflectivos para privacidad y estética.",
  };

  return descriptions[key] ?? "Solución de vidrio especializada.";
}

/**
 * Generate a single GlassSolution POJO
 *
 * @param options - Factory options with overrides
 * @returns FactoryResult with generated data or validation error
 *
 * @example
 * ```typescript
 * const result = generateGlassSolution();
 * if (result.success) {
 *   console.log(result.data); // { key: 'security', name: 'Security', ... }
 * }
 * ```
 */
export function generateGlassSolution(
  options?: FactoryOptions<GlassSolutionCreateInput>
): FactoryResult<GlassSolutionCreateInput> {
  const preset = randomElement(PRESET_SOLUTIONS);

  const defaults: GlassSolutionCreateInput = {
    key: preset.key,
    name: preset.name,
    nameEs: preset.nameEs,
    description: generateDescription(preset.key),
    icon: randomBoolean(HAS_ICON_PROBABILITY) ? preset.icon : undefined,
    sortOrder: randomInt(1, MAX_SORT_ORDER),
    isActive: randomBoolean(ACTIVE_PROBABILITY),
    isSeeded: true,
    seedVersion: "1.0",
  };

  const data = {
    ...defaults,
    ...options?.overrides,
  };

  // Validate before returning
  if (!options?.skipValidation) {
    const parsed = glassSolutionCreateSchema.safeParse(data);
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
 * Generate multiple GlassSolutions
 *
 * @param count - Number of GlassSolutions to generate
 * @param options - Factory options for all instances
 * @returns Array of FactoryResult (one per generated entity)
 */
export function generateGlassSolutions(
  count: number,
  options?: FactoryOptions<GlassSolutionCreateInput>
): FactoryResult<GlassSolutionCreateInput>[] {
  return Array.from({ length: count }, () => generateGlassSolution(options));
}

/**
 * Generate a batch of valid GlassSolutions (only successful results)
 *
 * @param count - Number of valid GlassSolutions to generate
 * @param options - Factory options
 * @returns Array of validated GlassSolution data (guaranteed valid)
 */
export function generateGlassSolutionBatch(
  count: number,
  options?: FactoryOptions<GlassSolutionCreateInput>
): GlassSolutionCreateInput[] {
  const results = generateGlassSolutions(count, options);
  const validResults = results
    .filter(
      (
        r
      ): r is FactoryResult<GlassSolutionCreateInput> & {
        success: true;
        data: GlassSolutionCreateInput;
      } => r.success && r.data !== undefined
    )
    .map((r) => r.data);

  return validResults.slice(0, count);
}

/**
 * Generate from a preset solution by key
 *
 * @param key - Solution key (e.g., 'security', 'thermal_insulation')
 * @param options - Additional factory options
 * @returns FactoryResult with preset data
 */
export function generateGlassSolutionByKey(
  key: string,
  options?: FactoryOptions<GlassSolutionCreateInput>
): FactoryResult<GlassSolutionCreateInput> {
  const preset = PRESET_SOLUTIONS.find((s) => s.key === key);
  if (!preset) {
    return {
      success: false,
      errors: [
        {
          code: "INVALID_KEY",
          message: `No preset found for key: ${key}`,
          path: ["key"],
        },
      ],
    };
  }

  return generateGlassSolution({
    ...options,
    overrides: {
      key: preset.key,
      name: preset.name,
      nameEs: preset.nameEs,
      icon: preset.icon,
      ...options?.overrides,
    },
  });
}

/**
 * Generate an inactive glass solution
 *
 * @param options - Additional factory options
 * @returns FactoryResult with inactive solution
 */
export function generateInactiveGlassSolution(
  options?: FactoryOptions<GlassSolutionCreateInput>
): FactoryResult<GlassSolutionCreateInput> {
  return generateGlassSolution({
    ...options,
    overrides: {
      ...options?.overrides,
      isActive: false,
    },
  });
}
