import type { GlassTypeOutput } from "@/server/api/routers/catalog";

/**
 * Glass Type Utilities
 *
 * Pure functions for glass type data transformations.
 * These functions have no side effects and are easily testable.
 */

// ============================================================================
// Type Definitions
// ============================================================================

export type PerformanceRatings = {
  acoustic: number;
  security: number;
  thermal: number;
};

export type GlassFeatures = string[];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if glass type has a specific characteristic
 */
function hasCharacteristic(
  glassType: GlassTypeOutput,
  characteristicName: string
): boolean {
  return (
    glassType.characteristics?.some(
      (gc) => gc.characteristic.name === characteristicName
    ) ?? false
  );
}

/**
 * Get numeric value from characteristic (e.g., thickness, U-value)
 */
function _getCharacteristicValue(
  glassType: GlassTypeOutput,
  characteristicName: string
): number | null {
  const characteristic = glassType.characteristics?.find(
    (gc) => gc.characteristic.name === characteristicName
  );
  return characteristic?.value ? Number(characteristic.value) : null;
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Build human-readable features list from glass characteristics
 *
 * @example
 * buildGlassFeatures(glassType) // ['Templado', 'Laminado', 'Bajo emisivo']
 */
export function buildGlassFeatures(glassType: GlassTypeOutput): GlassFeatures {
  const features: string[] = [];

  // Check characteristics using the new Many-to-Many relationship
  if (hasCharacteristic(glassType, "tempered")) features.push("Templado");
  if (hasCharacteristic(glassType, "laminated")) features.push("Laminado");
  if (hasCharacteristic(glassType, "low-e"))
    features.push("Bajo emisivo (Low-E)");
  if (hasCharacteristic(glassType, "triple-glazed"))
    features.push("Triple acristalamiento");

  // Note: v2.0 - deprecated boolean fields removed
  // Use characteristics relationships for feature detection

  return features;
}

/**
 * Calculate performance ratings (1-5 scale) from glass characteristics
 *
 * Security: tempered + laminated + thickness
 * Thermal: Low-E + triple glazing + U-value
 * Acoustic: laminated + triple glazing + thickness
 *
 * @example
 * calculatePerformanceRatings(glassType) // { security: 4, thermal: 5, acoustic: 3 }
 */
const MAX_RATING = 5;
const MIN_U_VALUE_THRESHOLD = 1.5;
const THICK_GLASS_SECURITY = 8;
const THICK_GLASS_ACOUSTIC = 10;

export function calculatePerformanceRatings(
  glassType: GlassTypeOutput
): PerformanceRatings {
  // v2.0: Always use characteristics system
  // All glass types now have characteristics relationships
  const isTempered = hasCharacteristic(glassType, "tempered");
  const isLaminated = hasCharacteristic(glassType, "laminated");
  const isLowE = hasCharacteristic(glassType, "low-e");
  const isTripleGlazed = hasCharacteristic(glassType, "triple-glazed");
  const thickness = glassType.thicknessMm;

  let security = 2;
  let thermal = 2;
  let acoustic = 2;

  // Security calculation
  if (isTempered) security += 1;
  if (isLaminated) security += 2;
  if (thickness >= THICK_GLASS_SECURITY) security += 1;

  // Thermal calculation
  if (isLowE) thermal += 2;
  if (isTripleGlazed) thermal += 1;
  if (glassType.uValue && glassType.uValue < MIN_U_VALUE_THRESHOLD)
    thermal += 1;

  // Acoustic calculation
  if (isLaminated) acoustic += 2;
  if (isTripleGlazed) acoustic += 1;
  if (thickness >= THICK_GLASS_ACOUSTIC) acoustic += 1;

  return {
    acoustic: Math.min(MAX_RATING, acoustic),
    security: Math.min(MAX_RATING, security),
    thermal: Math.min(MAX_RATING, thermal),
  };
}

/**
 * Sort glass types by performance rating (best first)
 *
 * Sorts based on:
 * 1. Performance rating weight (excellent > veryGood > good > standard > basic)
 * 2. Thickness (thicker first for same rating - more durable)
 */
export function sortByPerformance(
  glassTypes: GlassTypeOutput[],
  selectedSolutionId?: string
): Array<GlassTypeOutput & { isRecommended: boolean }> {
  const RatingWeights: Record<string, number> = {
    basic: 1,
    excellent: 5,
    good: 3,
    standard: 2,
    veryGood: 4,
  };

  const sorted = [...glassTypes].sort((a, b) => {
    // Get performance rating for selected or primary solution
    const ratingA = selectedSolutionId
      ? a.solutions?.find((s) => s.solution.id === selectedSolutionId)
          ?.performanceRating
      : a.solutions?.find((s) => s.isPrimary)?.performanceRating;

    const ratingB = selectedSolutionId
      ? b.solutions?.find((s) => s.solution.id === selectedSolutionId)
          ?.performanceRating
      : b.solutions?.find((s) => s.isPrimary)?.performanceRating;

    const weightA = ratingA ? (RatingWeights[ratingA] ?? 0) : 0;
    const weightB = ratingB ? (RatingWeights[ratingB] ?? 0) : 0;

    // Sort by performance (highest first)
    if (weightB !== weightA) return weightB - weightA;

    // Tie-break by thickness (thicker first - more durable)
    return b.thicknessMm - a.thicknessMm;
  });

  // Mark top option as recommended (if there are multiple options)
  return sorted.map((glass, index) => ({
    ...glass,
    isRecommended: index === 0 && sorted.length > 1,
  }));
}
