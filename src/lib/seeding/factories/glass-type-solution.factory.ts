/**
 * @file Glass Type Solution Factory
 * @description Generates type-safe GlassTypeSolution relationships with performance ratings
 * Pure functions with no ORM dependencies - generates POJOs only
 *
 * Calculates ratings based on international standards:
 * - EN 12600: Glass in building - Impact test
 * - ISO 717-1: Acoustics - Sound insulation
 * - ISO 10077: Thermal performance of windows/doors
 * - EN 356: Glass in building - Security glazing
 *
 * Features:
 * - Performance rating calculation (basic, standard, good, very_good, excellent)
 * - Solution assignment based on glass characteristics
 * - Primary/secondary solution designation
 * - Validation with business rules
 */
/** biome-ignore-all lint/style/noMagicNumbers: Domain-specific thresholds based on international standards */

import type { z } from "zod";
import type { PERFORMANCE_RATING_VALUES } from "@/server/db/schemas/enums.schema";
import { glassTypeSolutionInsertSchema } from "@/server/db/schemas/glass-type-solution.schema";
import type { FactoryOptions, FactoryResult } from "../types/base.types";
import { createSuccessResult } from "../utils/validation.utils";

// Infer type from Zod schema (not table schema) to match validation
type GlassTypeSolutionInsertInput = z.infer<
  typeof glassTypeSolutionInsertSchema
>;

// Type alias for performance rating
type PerformanceRating = (typeof PERFORMANCE_RATING_VALUES)[number];

// Rating thresholds
const RATING_EXCELLENT = 5;
const RATING_VERY_GOOD = 4;
const RATING_GOOD = 3;
const RATING_STANDARD = 2;

// Thickness thresholds (mm)
const THICKNESS_STANDARD = 6;
const THICKNESS_DVH_MIN = 10;
const THICKNESS_DVH_THICK = 20;

/**
 * Glass characteristics for rating calculation
 */
export type GlassCharacteristics = {
  isLaminated: boolean;
  isLowE: boolean;
  isTempered: boolean;
  isTripleGlazed: boolean;
  purpose: string;
  thicknessMm: number;
};

/**
 * Solution assignment result
 */
export type SolutionAssignment = {
  isPrimary: boolean;
  performanceRating: PerformanceRating;
  solutionKey: string;
};

/**
 * Calculate security rating based on EN 12600 and EN 356 standards
 *
 * Factors:
 * - Tempered glass: +1 point (EN 12600 Class C)
 * - Laminated: +2 points (EN 356 P1A-P5A)
 * - Thickness >= 6mm: +1 point
 * - Laminated + Tempered: +1 bonus point (EN 356 P6B+)
 *
 * Score mapping:
 * - 1: Basic (single float glass)
 * - 2: Standard (tempered 6mm)
 * - 3: Good (laminated simple)
 * - 4: Very Good (laminated tempered)
 * - 5: Excellent (multi-layer laminated tempered)
 */
export function calculateSecurityRating(
  glass: GlassCharacteristics
): PerformanceRating {
  let score = 1;

  if (glass.isTempered) {
    score += 1;
  }
  if (glass.isLaminated) {
    score += 2;
  }
  if (glass.thicknessMm >= THICKNESS_STANDARD) {
    score += 1;
  }
  if (glass.isLaminated && glass.isTempered) {
    score += 1; // Bonus for combination
  }

  if (score >= RATING_EXCELLENT) {
    return "excellent";
  }
  if (score >= RATING_VERY_GOOD) {
    return "very_good";
  }
  if (score >= RATING_GOOD) {
    return "good";
  }
  if (score >= RATING_STANDARD) {
    return "standard";
  }
  return "basic";
}

/**
 * Calculate sound insulation rating based on ISO 717-1 (Rw index)
 *
 * Estimated Rw values:
 * - Single glazing 4mm: ~28 dB
 * - Single glazing 6mm: ~30 dB
 * - Laminated 6+6mm: ~35 dB
 * - DVH (double glazing): ~32-38 dB
 * - Laminated DVH: ~40-45 dB
 *
 * Rating thresholds:
 * - 1 (Basic): 25-29 dB
 * - 2 (Standard): 30-34 dB
 * - 3 (Good): 35-39 dB
 * - 4 (Very Good): 40-44 dB
 * - 5 (Excellent): 45+ dB
 */
export function calculateSoundInsulationRating(
  glass: GlassCharacteristics
): PerformanceRating {
  let score = 1;

  // Base score from thickness
  if (glass.thicknessMm >= THICKNESS_STANDARD) {
    score += 1;
  }
  if (glass.thicknessMm >= THICKNESS_DVH_MIN) {
    score += 1;
  }

  // Laminated glass significantly improves acoustic performance
  if (glass.isLaminated) {
    score += 2;
  }

  // Triple glazing with air/gas chambers
  if (glass.isTripleGlazed) {
    score += 1;
  }

  if (score >= RATING_EXCELLENT) {
    return "excellent";
  }
  if (score >= RATING_VERY_GOOD) {
    return "very_good";
  }
  if (score >= RATING_GOOD) {
    return "good";
  }
  if (score >= RATING_STANDARD) {
    return "standard";
  }
  return "basic";
}

/**
 * Calculate thermal insulation rating based on ISO 10077 (U-value)
 *
 * Typical U-values (W/m²·K):
 * - Single glazing: 5.8
 * - Double glazing (DVH): 2.8-3.0
 * - DVH with Low-E: 1.6-2.0
 * - Triple glazing: 1.2-1.6
 * - Triple Low-E with argon: 0.5-1.0
 *
 * Rating thresholds:
 * - 1 (Basic): U > 4.5
 * - 2 (Standard): U 2.8-4.5
 * - 3 (Good): U 2.0-2.7
 * - 4 (Very Good): U 1.2-1.9
 * - 5 (Excellent): U < 1.2
 */
export function calculateThermalInsulationRating(
  glass: GlassCharacteristics
): PerformanceRating {
  let score = 1;

  // Thicker glass or DVH configuration
  if (glass.thicknessMm >= THICKNESS_DVH_MIN) {
    score += 1; // Likely DVH
  }
  if (glass.thicknessMm >= THICKNESS_DVH_THICK) {
    score += 1; // Definitely DVH
  }

  // Low-E coating significantly reduces U-value
  if (glass.isLowE) {
    score += 2;
  }

  // Triple glazing
  if (glass.isTripleGlazed) {
    score += 1;
  }

  if (score >= RATING_EXCELLENT) {
    return "excellent";
  }
  if (score >= RATING_VERY_GOOD) {
    return "very_good";
  }
  if (score >= RATING_GOOD) {
    return "good";
  }
  if (score >= RATING_STANDARD) {
    return "standard";
  }
  return "basic";
}

/**
 * Calculate energy efficiency rating based on Low-E coating and glazing configuration
 *
 * Factors:
 * - Low-E coating: Primary factor
 * - Triple glazing: Enhanced performance
 * - DVH (double glazing): Standard improvement
 */
export function calculateEnergyEfficiencyRating(
  glass: GlassCharacteristics
): PerformanceRating {
  let score = 1;

  if (glass.thicknessMm >= THICKNESS_DVH_MIN) {
    score += 1; // DVH
  }
  if (glass.isLowE) {
    score += 2; // Low-E is key for energy efficiency
  }
  if (glass.isTripleGlazed) {
    score += 1;
  }
  if (glass.isLowE && glass.isTripleGlazed) {
    score += 1; // Bonus
  }

  if (score >= RATING_EXCELLENT) {
    return "excellent";
  }
  if (score >= RATING_VERY_GOOD) {
    return "very_good";
  }
  if (score >= RATING_GOOD) {
    return "good";
  }
  if (score >= RATING_STANDARD) {
    return "standard";
  }
  return "basic";
}

/**
 * Calculate which solutions apply to a glass type and their ratings
 *
 * Returns array of { solutionKey, performanceRating, isPrimary }
 *
 * @param glass - Glass type characteristics
 * @returns Array of solution assignments with ratings
 *
 * @example
 * ```typescript
 * const assignments = calculateGlassSolutions({
 *   purpose: 'security',
 *   isTempered: true,
 *   isLaminated: true,
 *   isLowE: false,
 *   isTripleGlazed: false,
 *   thicknessMm: 6,
 * });
 * // Returns: [
 * //   { solutionKey: 'security', performanceRating: 'very_good', isPrimary: true },
 * //   { solutionKey: 'sound_insulation', performanceRating: 'good', isPrimary: false }
 * // ]
 * ```
 */
export function calculateGlassSolutions(
  glass: GlassCharacteristics
): SolutionAssignment[] {
  const solutions: SolutionAssignment[] = [];

  // Security rating (all glasses have some level of security)
  const securityRating = calculateSecurityRating(glass);
  if (securityRating !== "basic" || glass.purpose === "security") {
    solutions.push({
      isPrimary: glass.purpose === "security",
      performanceRating: securityRating,
      solutionKey: "security",
    });
  }

  // Sound insulation (laminated or thick glass)
  if (glass.isLaminated || glass.thicknessMm >= THICKNESS_STANDARD) {
    const soundRating = calculateSoundInsulationRating(glass);
    solutions.push({
      isPrimary: false, // Rarely the primary purpose
      performanceRating: soundRating,
      solutionKey: "sound_insulation",
    });
  }

  // Thermal insulation (DVH, Low-E, triple glazing)
  if (
    glass.thicknessMm >= THICKNESS_DVH_MIN ||
    glass.isLowE ||
    glass.isTripleGlazed
  ) {
    const thermalRating = calculateThermalInsulationRating(glass);
    solutions.push({
      isPrimary: glass.purpose === "insulation",
      performanceRating: thermalRating,
      solutionKey: "thermal_insulation",
    });
  }

  // Energy efficiency (Low-E is key indicator)
  if (glass.isLowE || glass.isTripleGlazed) {
    const energyRating = calculateEnergyEfficiencyRating(glass);
    solutions.push({
      isPrimary: false, // Related to thermal but distinct
      performanceRating: energyRating,
      solutionKey: "energy_efficiency",
    });
  }

  // Decorative
  if (glass.purpose === "decorative") {
    solutions.push({
      isPrimary: true,
      performanceRating: "standard", // Decorative doesn't have performance grades
      solutionKey: "decorative",
    });
  }

  // General purpose (fallback for simple glasses)
  if (glass.purpose === "general" || solutions.length === 0) {
    solutions.push({
      isPrimary: glass.purpose === "general",
      performanceRating: "standard",
      solutionKey: "general",
    });
  }

  // Ensure at least one solution is primary
  if (!solutions.some((s) => s.isPrimary) && solutions.length > 0) {
    const firstSolution = solutions[0];
    if (firstSolution) {
      firstSolution.isPrimary = true;
    }
  }

  return solutions;
}

/**
 * Parameters for generateGlassTypeSolution
 */
export type GenerateGlassTypeSolutionParams = {
  glassTypeId: string;
  solutionId: string;
  performanceRating: PerformanceRating;
  isPrimary?: boolean;
  options?: FactoryOptions<GlassTypeSolutionInsertInput>;
};

/**
 * Generate a single GlassTypeSolution POJO
 *
 * @param params - Generation parameters
 * @returns FactoryResult with generated data or validation error
 *
 * @example
 * ```typescript
 * const result = generateGlassTypeSolution({
 *   glassTypeId: 'glass-type-uuid',
 *   solutionId: 'solution-uuid',
 *   performanceRating: 'very_good',
 *   isPrimary: true
 * });
 * if (result.success) {
 *   console.log(result.data);
 * }
 * ```
 */
export function generateGlassTypeSolution(
  params: GenerateGlassTypeSolutionParams
): FactoryResult<GlassTypeSolutionInsertInput> {
  const {
    glassTypeId,
    solutionId,
    performanceRating,
    isPrimary = false,
    options,
  } = params;

  const defaults: GlassTypeSolutionInsertInput = {
    glassTypeId,
    solutionId,
    performanceRating,
    isPrimary,
  };

  const data = {
    ...defaults,
    ...options?.overrides,
  };

  // Validate before returning
  if (!options?.skipValidation) {
    const parsed = glassTypeSolutionInsertSchema.safeParse(data);
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
 * Generate multiple GlassTypeSolutions
 */
export function generateGlassTypeSolutions(
  count: number,
  params: Omit<GenerateGlassTypeSolutionParams, "options">
): FactoryResult<GlassTypeSolutionInsertInput>[] {
  return Array.from({ length: count }, () => generateGlassTypeSolution(params));
}

/**
 * Generate a batch of valid GlassTypeSolutions (only successful results)
 */
export function generateGlassTypeSolutionBatch(
  count: number,
  params: Omit<GenerateGlassTypeSolutionParams, "options">
): GlassTypeSolutionInsertInput[] {
  const results = generateGlassTypeSolutions(count, params);
  const validResults = results
    .filter(
      (
        r
      ): r is FactoryResult<GlassTypeSolutionInsertInput> & {
        success: true;
        data: GlassTypeSolutionInsertInput;
      } => r.success && r.data !== undefined
    )
    .map((r) => r.data);

  return validResults.slice(0, count);
}

/**
 * Generate GlassTypeSolution with specific rating
 */
export function generateGlassTypeSolutionWithRating(
  params: Omit<GenerateGlassTypeSolutionParams, "performanceRating"> & {
    performanceRating: PerformanceRating;
  }
): FactoryResult<GlassTypeSolutionInsertInput> {
  return generateGlassTypeSolution({
    ...params,
    isPrimary: false,
  });
}

/**
 * Generate primary GlassTypeSolution
 */
export function generatePrimaryGlassTypeSolution(
  params: Omit<GenerateGlassTypeSolutionParams, "isPrimary">
): FactoryResult<GlassTypeSolutionInsertInput> {
  return generateGlassTypeSolution({
    ...params,
    isPrimary: true,
  });
}

/**
 * Generate secondary GlassTypeSolution
 */
export function generateSecondaryGlassTypeSolution(
  params: Omit<GenerateGlassTypeSolutionParams, "isPrimary">
): FactoryResult<GlassTypeSolutionInsertInput> {
  return generateGlassTypeSolution({
    ...params,
    isPrimary: false,
  });
}

/**
 * Generate excellent rated GlassTypeSolution
 */
export function generateExcellentGlassTypeSolution(
  params: Omit<GenerateGlassTypeSolutionParams, "performanceRating">
): FactoryResult<GlassTypeSolutionInsertInput> {
  return generateGlassTypeSolution({
    ...params,
    performanceRating: "excellent",
  });
}

/**
 * Generate basic rated GlassTypeSolution
 */
export function generateBasicGlassTypeSolution(
  params: Omit<GenerateGlassTypeSolutionParams, "performanceRating">
): FactoryResult<GlassTypeSolutionInsertInput> {
  return generateGlassTypeSolution({
    ...params,
    performanceRating: "basic",
  });
}
