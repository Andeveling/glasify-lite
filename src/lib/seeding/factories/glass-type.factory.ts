/**
 * @file GlassType Factory
 * @description Generates type-safe test data for GlassType seeding
 * Pure functions with no ORM dependencies - generates POJOs only
 *
 * Supports realistic glass specifications:
 * - Thermal properties (U-value)
 * - Solar control (solar factor, light transmission)
 * - Physical properties (thickness)
 * - Pricing and supplier information
 */
/** biome-ignore-all lint/style/noMagicNumbers: Domain-specific constants for glass dimensions, thermal and solar properties */

import type { z } from "zod";
import {
  GLASS_TYPE_CONSTRAINTS,
  GLASS_TYPE_FIELD_LENGTHS,
} from "@/server/db/schemas/constants/glass-type.constants";
import { glassTypeInsertSchema } from "@/server/db/schemas/glass-type.schema";
import type { FactoryOptions, FactoryResult } from "../types/base.types";
import { createSuccessResult } from "../utils/validation.utils";

// Infer type from Zod schema (not table schema) to match validation
type GlassTypeInsertInput = z.infer<typeof glassTypeInsertSchema>;

// Constants
const ACTIVE_PROBABILITY = 0.9;
const HAS_DESCRIPTION_PROBABILITY = 0.7;
const HAS_MANUFACTURER_PROBABILITY = 0.8;
const HAS_SERIES_PROBABILITY = 0.6;
const HIGH_U_VALUE_THRESHOLD = 3.0;
const SOLAR_FACTOR_TRANSMISSION_TOLERANCE = 0.2;

// Real-world glass types presets (from Tecnoglass, Vitrolumina, etc.)
const GLASS_MANUFACTURERS = [
  "Tecnoglass",
  "Vitrolumina",
  "Guardian",
  "Saint-Gobain",
  "Pilkington",
  "AGC",
] as const;

const GLASS_SERIES = [
  "ClearView",
  "ThermalGuard",
  "SolarShield",
  "AcousticPlus",
  "SafetyPro",
  "EcoSmart",
] as const;

// Standard thicknesses in mm
const STANDARD_THICKNESSES = [3, 4, 5, 6, 8, 10, 12, 15, 19] as const;

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

function randomDecimal(min: number, max: number, decimals = 2): number {
  const value = Math.random() * (max - min) + min;
  return Number.parseFloat(value.toFixed(decimals));
}

/**
 * Generate realistic glass type name
 */
function generateGlassName(): string {
  const types = [
    "Transparente",
    "Templado",
    "Laminado",
    "Low-E",
    "Reflectivo",
    "Acústico",
    "Control Solar",
  ];
  const qualities = ["", "Premium", "Plus", "Pro", "Eco", "Standard"];

  const type = randomElement(types);
  const quality = randomElement(qualities);

  return quality ? `${type} ${quality}` : type;
}

/**
 * Generate unique glass code
 */
function generateGlassCode(): string {
  const prefix = randomElement(["VTR", "TMP", "LAM", "LWE", "RFL", "ACU"]);
  const suffix = randomInt(1000, 9999);
  return `${prefix}-${suffix}`;
}

/**
 * Generate description
 */
function generateDescription(): string | undefined {
  if (!randomBoolean(HAS_DESCRIPTION_PROBABILITY)) {
    return;
  }

  const templates = [
    "Float glass with excellent optical clarity",
    "Heat-strengthened glass for enhanced durability",
    "Low-emissivity coating for thermal efficiency",
    "Multi-layer laminated for safety and security",
    "High-performance solar control glass",
    "Acoustic interlayer for sound insulation",
  ];

  const description = randomElement(templates);
  return description.substring(0, GLASS_TYPE_FIELD_LENGTHS.DESCRIPTION);
}

/**
 * Generate U-value (thermal transmittance)
 * Lower is better for insulation
 * Range: 0.5 (triple-glazed Low-E) to 6.0 (single clear)
 */
function generateUValue(): number | undefined {
  if (!randomBoolean(0.7)) {
    return;
  }

  return randomDecimal(1.0, 5.8, 2);
}

/**
 * Generate solar factor (g-value)
 * 0.0 (fully reflective) to 1.0 (clear glass)
 */
function generateSolarFactor(): number | undefined {
  if (!randomBoolean(0.6)) {
    return;
  }

  return randomDecimal(
    GLASS_TYPE_CONSTRAINTS.SOLAR_FACTOR.min,
    GLASS_TYPE_CONSTRAINTS.SOLAR_FACTOR.max,
    2
  );
}

/**
 * Generate light transmission
 * 0.0 (opaque) to 1.0 (ultra-clear)
 */
function generateLightTransmission(): number | undefined {
  if (!randomBoolean(0.6)) {
    return;
  }

  return randomDecimal(
    GLASS_TYPE_CONSTRAINTS.LIGHT_TRANSMISSION.min,
    GLASS_TYPE_CONSTRAINTS.LIGHT_TRANSMISSION.max,
    2
  );
}

/**
 * Generate price per square meter
 */
function generatePricePerSqm(): number {
  const basePrice = 50_000; // COP
  const variation = randomInt(-20_000, 100_000);
  return basePrice + variation;
}

/**
 * Generate a single GlassType POJO
 *
 * @param options - Factory options with overrides
 * @returns FactoryResult with generated data or validation error
 *
 * @example
 * ```typescript
 * const result = generateGlassType();
 * if (result.success) {
 *   console.log(result.data); // { name: 'Templado Premium', code: 'TMP-1234', ... }
 * }
 * ```
 */
export function generateGlassType(
  options?: FactoryOptions<GlassTypeInsertInput>
): FactoryResult<GlassTypeInsertInput> {
  const thickness = randomElement(STANDARD_THICKNESSES);

  const defaults: GlassTypeInsertInput = {
    name: generateGlassName(),
    code: generateGlassCode(),
    thicknessMm: thickness,
    pricePerSqm: generatePricePerSqm(),
    manufacturer: randomBoolean(HAS_MANUFACTURER_PROBABILITY)
      ? randomElement(GLASS_MANUFACTURERS)
      : undefined,
    series: randomBoolean(HAS_SERIES_PROBABILITY)
      ? randomElement(GLASS_SERIES)
      : undefined,
    glassSupplierId: undefined,
    description: generateDescription(),
    uValue: generateUValue(),
    solarFactor: generateSolarFactor(),
    lightTransmission: generateLightTransmission(),
    isActive: randomBoolean(ACTIVE_PROBABILITY),
    lastReviewDate: undefined,
    isSeeded: false,
    seedVersion: undefined,
  };

  const data = {
    ...defaults,
    ...options?.overrides,
  };

  // Validate before returning
  if (!options?.skipValidation) {
    const parsed = glassTypeInsertSchema.safeParse(data);
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

    // Additional business logic validation
    const validatedData = parsed.data;

    // Warn about high U-value (poor insulation)
    if (validatedData.uValue && validatedData.uValue > HIGH_U_VALUE_THRESHOLD) {
      // This is a warning, not an error - still return success
      // You could log this if needed: console.warn('High U-value detected')
    }

    // Check solar factor vs light transmission consistency
    if (validatedData.solarFactor && validatedData.lightTransmission) {
      const solarFactor = validatedData.solarFactor;
      const lightTrans = validatedData.lightTransmission;

      if (solarFactor > lightTrans + SOLAR_FACTOR_TRANSMISSION_TOLERANCE) {
        return {
          success: false,
          errors: [
            {
              code: "INCONSISTENT_SOLAR_PROPERTIES",
              context: {
                solarFactor,
                lightTransmission: lightTrans,
              },
              message:
                "Solar factor should not exceed light transmission by more than 0.2",
              path: ["solarFactor", "lightTransmission"],
            },
          ],
        };
      }
    }

    return createSuccessResult(validatedData);
  }

  return createSuccessResult(data);
}

/**
 * Generate multiple GlassTypes
 */
export function generateGlassTypes(
  count: number,
  options?: FactoryOptions<GlassTypeInsertInput>
): FactoryResult<GlassTypeInsertInput>[] {
  return Array.from({ length: count }, () => generateGlassType(options));
}

/**
 * Generate a batch of valid GlassTypes (only successful results)
 */
export function generateGlassTypeBatch(
  count: number,
  options?: FactoryOptions<GlassTypeInsertInput>
): GlassTypeInsertInput[] {
  const results = generateGlassTypes(count, options);
  const validResults = results
    .filter(
      (
        r
      ): r is FactoryResult<GlassTypeInsertInput> & {
        success: true;
        data: GlassTypeInsertInput;
      } => r.success && r.data !== undefined
    )
    .map((r) => r.data);

  return validResults.slice(0, count);
}

/**
 * Generate glass type with specific thickness
 */
export function generateGlassTypeWithThickness(
  thicknessMm: number,
  options?: FactoryOptions<GlassTypeInsertInput>
): FactoryResult<GlassTypeInsertInput> {
  return generateGlassType({
    ...options,
    overrides: {
      ...options?.overrides,
      thicknessMm,
    },
  });
}

/**
 * Generate Low-E glass (thermal efficiency)
 */
export function generateLowEGlassType(
  options?: FactoryOptions<GlassTypeInsertInput>
): FactoryResult<GlassTypeInsertInput> {
  return generateGlassType({
    ...options,
    overrides: {
      name: "Low-E Coating",
      uValue: randomDecimal(0.8, 1.5, 2), // Excellent thermal performance
      solarFactor: randomDecimal(0.3, 0.5, 2), // Medium solar control
      lightTransmission: randomDecimal(0.6, 0.8, 2), // Good light transmission
      ...options?.overrides,
    },
  });
}

/**
 * Generate solar control glass
 */
export function generateSolarControlGlassType(
  options?: FactoryOptions<GlassTypeInsertInput>
): FactoryResult<GlassTypeInsertInput> {
  return generateGlassType({
    ...options,
    overrides: {
      name: "Control Solar",
      solarFactor: randomDecimal(0.15, 0.35, 2), // Strong solar blocking
      lightTransmission: randomDecimal(0.3, 0.6, 2), // Moderate light
      ...options?.overrides,
    },
  });
}

/**
 * Generate clear glass (standard)
 */
export function generateClearGlassType(
  options?: FactoryOptions<GlassTypeInsertInput>
): FactoryResult<GlassTypeInsertInput> {
  const DEFAULT_PRICE = 50_000;
  return generateGlassType({
    ...options,
    overrides: {
      name: "Transparente",
      solarFactor: randomDecimal(0.75, 0.87, 2), // High solar transmission
      lightTransmission: randomDecimal(0.85, 0.92, 2), // Excellent clarity
      pricePerSqm: DEFAULT_PRICE,
      ...options?.overrides,
    },
  });
}

/**
 * Generate inactive glass type
 */
export function generateInactiveGlassType(
  options?: FactoryOptions<GlassTypeInsertInput>
): FactoryResult<GlassTypeInsertInput> {
  return generateGlassType({
    ...options,
    overrides: {
      ...options?.overrides,
      isActive: false,
    },
  });
}

/**
 * Generate seeded glass type (from seed data)
 */
export function generateSeededGlassType(
  seedVersion = "1.0",
  options?: FactoryOptions<GlassTypeInsertInput>
): FactoryResult<GlassTypeInsertInput> {
  return generateGlassType({
    ...options,
    overrides: {
      ...options?.overrides,
      isSeeded: true,
      seedVersion,
    },
  });
}

/**
 * Generate glass type with supplier
 */
export function generateGlassTypeWithSupplier(
  glassSupplierId: string,
  options?: FactoryOptions<GlassTypeInsertInput>
): FactoryResult<GlassTypeInsertInput> {
  return generateGlassType({
    ...options,
    overrides: {
      ...options?.overrides,
      glassSupplierId,
    },
  });
}
