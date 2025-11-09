/**
 * @file ProfileSupplier Factory
 * @description Generates type-safe test data for ProfileSupplier seeding
 * Pure functions with no ORM dependencies - generates POJOs only
 */

import type { ProfileSupplierCreateInput } from "../schemas/profile-supplier.schema";
import {
  ALL_SUPPLIERS,
  MaterialTypeEnum,
  profileSupplierSchema,
} from "../schemas/profile-supplier.schema";
import type { FactoryOptions, FactoryResult } from "../types/base.types";
import { createSuccessResult } from "../utils/validation.utils";

// Constants
const ACTIVE_PROBABILITY = 0.9;
const HAS_NOTES_PROBABILITY = 0.6;
const NOTES_MAX_LENGTH = 100;
const BRAND_ONLY_PROBABILITY = 0.6;

// Helper: Random array element
function randomElement<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)] as T;
}

// Helper: Random boolean with probability
function randomBoolean(probability = 0.5): boolean {
  return Math.random() < probability;
}

// Helper: Random integer
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate realistic supplier name
 * Combines brand names and material descriptors
 */
function generateSupplierName(): string {
  const brands = [
    "Rehau",
    "Deceuninck",
    "Azembla",
    "Aluminios",
    "Fabricaciones",
    "Perfiles",
    "Sistemas",
    "Marcos",
    "Ventanas",
    "Constructor",
  ];

  const suffixes = ["Pro", "XL", "360", "Plus", "Elite", "Standard"];

  // 60% chance: Brand name only
  if (randomBoolean(BRAND_ONLY_PROBABILITY)) {
    return randomElement(brands);
  }

  // 40% chance: Brand + suffix
  const brand = randomElement(brands);
  const suffix = randomElement(suffixes);

  return `${brand} ${suffix}`;
}

/**
 * Generate random notes
 */
function generateNotes(): string | null {
  if (!randomBoolean(HAS_NOTES_PROBABILITY)) {
    return null;
  }

  const templates = [
    "Premium quality, eco-friendly materials",
    "Industrial aluminum profiles for structural glazing",
    "Thermally optimized frames",
    "Colombian manufacturer, affordable quality",
    "German engineering quality",
    "Architectural systems",
    "Supplies both PVC and aluminum profiles",
  ];

  return randomElement(templates).substring(0, NOTES_MAX_LENGTH);
}

/**
 * Generate a single ProfileSupplier POJO
 *
 * @param options - Factory options with overrides
 * @returns FactoryResult with generated data or validation error
 *
 * @example
 * ```typescript
 * const result = generateProfileSupplier();
 * if (result.success) {
 *   console.log(result.data); // { name: 'Rehau', materialType: 'PVC', ... }
 * }
 * ```
 */
export function generateProfileSupplier(
  options?: FactoryOptions<ProfileSupplierCreateInput>
): FactoryResult<ProfileSupplierCreateInput> {
  const materialTypes = MaterialTypeEnum.options;

  const defaults: ProfileSupplierCreateInput = {
    name: generateSupplierName(),
    materialType: randomElement(materialTypes),
    isActive: randomBoolean(ACTIVE_PROBABILITY),
    notes: generateNotes(),
  };

  const data = {
    ...defaults,
    ...options?.overrides,
  };

  // Validate before returning
  if (!options?.skipValidation) {
    const parsed = profileSupplierSchema.safeParse(data);
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
 * Generate multiple ProfileSuppliers
 *
 * @param count - Number of ProfileSuppliers to generate
 * @param options - Factory options for all instances
 * @returns Array of FactoryResult (one per generated entity)
 *
 * @example
 * ```typescript
 * const results = generateProfileSuppliers(5);
 * const successful = results.filter(r => r.success);
 * const data = successful.map(r => r.data);
 * ```
 */
export function generateProfileSuppliers(
  count: number,
  options?: FactoryOptions<ProfileSupplierCreateInput>
): FactoryResult<ProfileSupplierCreateInput>[] {
  return Array.from({ length: count }, () => generateProfileSupplier(options));
}

/**
 * Generate a batch of valid ProfileSuppliers (only successful results)
 * Filters out validation failures automatically
 *
 * @param count - Number of valid ProfileSuppliers to generate
 * @param options - Factory options
 * @returns Array of validated ProfileSupplier data (guaranteed valid)
 *
 * @example
 * ```typescript
 * const suppliers = generateProfileSupplierBatch(10);
 * // All 10 are guaranteed to be valid
 * ```
 */
export function generateProfileSupplierBatch(
  count: number,
  options?: FactoryOptions<ProfileSupplierCreateInput>
): ProfileSupplierCreateInput[] {
  const results = generateProfileSuppliers(count, options);
  const validResults = results
    .filter(
      (
        r
      ): r is FactoryResult<ProfileSupplierCreateInput> & {
        success: true;
        data: ProfileSupplierCreateInput;
      } => r.success && r.data !== undefined
    )
    .map((r) => r.data);

  return validResults.slice(0, count);
}

/**
 * Generate a ProfileSupplier with known material type
 *
 * @param materialType - Specific material type to use
 * @param options - Additional factory options
 * @returns FactoryResult with generated data
 *
 * @example
 * ```typescript
 * const pvc = generateProfileSupplierWithMaterial('PVC');
 * const aluminum = generateProfileSupplierWithMaterial('ALUMINUM');
 * ```
 */
export function generateProfileSupplierWithMaterial(
  materialType: "PVC" | "ALUMINUM" | "WOOD" | "MIXED",
  options?: FactoryOptions<ProfileSupplierCreateInput>
): FactoryResult<ProfileSupplierCreateInput> {
  return generateProfileSupplier({
    ...options,
    overrides: {
      ...options?.overrides,
      materialType,
    },
  });
}

/**
 * Generate from preset suppliers (real-world examples)
 *
 * @param presetIndex - Index in ALL_SUPPLIERS (or undefined for random)
 * @param options - Additional factory options
 * @returns FactoryResult with preset data
 *
 * @example
 * ```typescript
 * const rehau = generateProfileSupplierFromPreset(0); // First preset
 * const random = generateProfileSupplierFromPreset(); // Random preset
 * ```
 */
export function generateProfileSupplierFromPreset(
  presetIndex?: number,
  options?: FactoryOptions<ProfileSupplierCreateInput>
): FactoryResult<ProfileSupplierCreateInput> {
  const index = presetIndex ?? randomInt(0, ALL_SUPPLIERS.length - 1);
  const preset = ALL_SUPPLIERS[index];

  return generateProfileSupplier({
    ...options,
    overrides: {
      ...preset,
      ...options?.overrides,
    },
  });
}

/**
 * Generate an inactive supplier
 *
 * @param options - Additional factory options
 * @returns FactoryResult with inactive supplier
 *
 * @example
 * ```typescript
 * const inactive = generateInactiveProfileSupplier();
 * ```
 */
export function generateInactiveProfileSupplier(
  options?: FactoryOptions<ProfileSupplierCreateInput>
): FactoryResult<ProfileSupplierCreateInput> {
  return generateProfileSupplier({
    ...options,
    overrides: {
      ...options?.overrides,
      isActive: false,
    },
  });
}

/**
 * Generate a supplier with custom name
 *
 * @param name - Custom supplier name
 * @param options - Additional factory options
 * @returns FactoryResult with custom name
 *
 * @example
 * ```typescript
 * const custom = generateProfileSupplierWithName('Custom Supplier');
 * ```
 */
export function generateProfileSupplierWithName(
  name: string,
  options?: FactoryOptions<ProfileSupplierCreateInput>
): FactoryResult<ProfileSupplierCreateInput> {
  return generateProfileSupplier({
    ...options,
    overrides: {
      ...options?.overrides,
      name,
    },
  });
}

/**
 * Generate a supplier with custom notes
 *
 * @param notes - Custom notes
 * @param options - Additional factory options
 * @returns FactoryResult with custom notes
 *
 * @example
 * ```typescript
 * const withNotes = generateProfileSupplierWithNotes('Custom notes here');
 * ```
 */
export function generateProfileSupplierWithNotes(
  notes: string,
  options?: FactoryOptions<ProfileSupplierCreateInput>
): FactoryResult<ProfileSupplierCreateInput> {
  return generateProfileSupplier({
    ...options,
    overrides: {
      ...options?.overrides,
      notes,
    },
  });
}
