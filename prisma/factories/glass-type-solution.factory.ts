/**
 * Glass Type Solution Factory
 *
 * Creates validated GlassTypeSolution relationships with performance ratings.
 * Calculates ratings based on international standards:
 * - EN 12600: Glass in building - Impact test
 * - ISO 717-1: Acoustics - Sound insulation
 * - ISO 10077: Thermal performance of windows/doors
 * - EN 356: Glass in building - Security glazing
 */

import type { PerformanceRating } from "@prisma/client";
import { z } from "zod";
import type { FactoryOptions, FactoryResult } from "./types";
import { validateWithSchema } from "./utils";

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
export interface GlassCharacteristics {
  isLaminated: boolean;
  isLowE: boolean;
  isTempered: boolean;
  isTripleGlazed: boolean;
  purpose: string;
  thicknessMm: number;
}

/**
 * Solution assignment result
 */
export interface SolutionAssignment {
  isPrimary: boolean;
  performanceRating: PerformanceRating;
  solutionKey: string;
}

/**
 * Zod schema for GlassTypeSolution input validation
 */
const glassTypeSolutionSchema = z.object({
  glassTypeId: z.string().cuid(),
  isPrimary: z.boolean(),
  performanceRating: z.enum([
    "basic",
    "standard",
    "good",
    "very_good",
    "excellent",
  ]),
  solutionId: z.string().cuid(),
});

/**
 * GlassTypeSolution input type (inferred from schema)
 */
export type GlassTypeSolutionInput = z.infer<typeof glassTypeSolutionSchema>;

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

  if (glass.isTempered) score += 1;
  if (glass.isLaminated) score += 2;
  if (glass.thicknessMm >= THICKNESS_STANDARD) score += 1;
  if (glass.isLaminated && glass.isTempered) score += 1; // Bonus for combination

  if (score >= RATING_EXCELLENT) return "excellent";
  if (score >= RATING_VERY_GOOD) return "very_good";
  if (score >= RATING_GOOD) return "good";
  if (score >= RATING_STANDARD) return "standard";
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
  if (glass.thicknessMm >= THICKNESS_STANDARD) score += 1;
  if (glass.thicknessMm >= THICKNESS_DVH_MIN) score += 1;

  // Laminated glass significantly improves acoustic performance
  if (glass.isLaminated) score += 2;

  // Triple glazing with air/gas chambers
  if (glass.isTripleGlazed) score += 1;

  if (score >= RATING_EXCELLENT) return "excellent";
  if (score >= RATING_VERY_GOOD) return "very_good";
  if (score >= RATING_GOOD) return "good";
  if (score >= RATING_STANDARD) return "standard";
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
  if (glass.thicknessMm >= THICKNESS_DVH_MIN) score += 1; // Likely DVH
  if (glass.thicknessMm >= THICKNESS_DVH_THICK) score += 1; // Definitely DVH

  // Low-E coating significantly reduces U-value
  if (glass.isLowE) score += 2;

  // Triple glazing
  if (glass.isTripleGlazed) score += 1;

  if (score >= RATING_EXCELLENT) return "excellent";
  if (score >= RATING_VERY_GOOD) return "very_good";
  if (score >= RATING_GOOD) return "good";
  if (score >= RATING_STANDARD) return "standard";
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

  if (glass.thicknessMm >= THICKNESS_DVH_MIN) score += 1; // DVH
  if (glass.isLowE) score += 2; // Low-E is key for energy efficiency
  if (glass.isTripleGlazed) score += 1;
  if (glass.isLowE && glass.isTripleGlazed) score += 1; // Bonus

  if (score >= RATING_EXCELLENT) return "excellent";
  if (score >= RATING_VERY_GOOD) return "very_good";
  if (score >= RATING_GOOD) return "good";
  if (score >= RATING_STANDARD) return "standard";
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
    // biome-ignore lint/style/noNonNullAssertion: we check length > 0
    solutions[0]!.isPrimary = true;
  }

  return solutions;
}

/**
 * Create a validated GlassTypeSolution relationship
 *
 * @param input - Glass type solution relationship data
 * @param options - Factory options (skipValidation)
 * @returns FactoryResult with validated data or validation errors
 *
 * @example
 * ```typescript
 * const result = createGlassTypeSolution({
 *   glassTypeId: 'cm123abc',
 *   solutionId: 'cm456def',
 *   performanceRating: 'very_good',
 *   isPrimary: true,
 * });
 *
 * if (result.success) {
 *   await prisma.glassTypeSolution.create({ data: result.data });
 * }
 * ```
 */
export function createGlassTypeSolution(
  input: GlassTypeSolutionInput,
  options: FactoryOptions = {}
): FactoryResult<GlassTypeSolutionInput> {
  // Phase 1: Zod schema validation
  if (!options.skipValidation) {
    const schemaValidation = validateWithSchema(glassTypeSolutionSchema, input);
    if (!schemaValidation.success) {
      return schemaValidation;
    }
  }

  // Phase 2: Business logic validation
  // No additional business rules needed beyond Zod schema

  // Success: return validated data
  return {
    data: input,
    success: true,
  };
}
