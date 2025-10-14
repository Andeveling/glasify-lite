import type { GlassTypeOutput } from '@/server/api/routers/catalog';

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
function hasCharacteristic(glassType: GlassTypeOutput, characteristicName: string): boolean {
  return glassType.characteristics?.some((gc) => gc.characteristic.name === characteristicName) ?? false;
}

/**
 * Get numeric value from characteristic (e.g., thickness, U-value)
 */
function getCharacteristicValue(glassType: GlassTypeOutput, characteristicName: string): number | null {
  const characteristic = glassType.characteristics?.find((gc) => gc.characteristic.name === characteristicName);
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
  if (hasCharacteristic(glassType, 'tempered')) features.push('Templado');
  if (hasCharacteristic(glassType, 'laminated')) features.push('Laminado');
  if (hasCharacteristic(glassType, 'low-e')) features.push('Bajo emisivo (Low-E)');
  if (hasCharacteristic(glassType, 'triple-glazed')) features.push('Triple acristalamiento');

  // Fallback to deprecated fields if characteristics not available
  if (features.length === 0) {
    if (glassType.isTempered) features.push('Templado');
    if (glassType.isLaminated) features.push('Laminado');
    if (glassType.isLowE) features.push('Bajo emisivo (Low-E)');
    if (glassType.isTripleGlazed) features.push('Triple acristalamiento');
  }

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
export function calculatePerformanceRatings(glassType: GlassTypeOutput): PerformanceRatings {
  // Check if using new characteristics system
  const hasNewSystem = glassType.characteristics && glassType.characteristics.length > 0;

  let security = 2;
  let thermal = 2;
  let acoustic = 2;

  if (hasNewSystem) {
    // Use new Many-to-Many characteristics
    const isTempered = hasCharacteristic(glassType, 'tempered');
    const isLaminated = hasCharacteristic(glassType, 'laminated');
    const isLowE = hasCharacteristic(glassType, 'low-e');
    const isTripleGlazed = hasCharacteristic(glassType, 'triple-glazed');
    const thickness = glassType.thicknessMm;

    // Security calculation
    if (isTempered) security += 1;
    if (isLaminated) security += 2;
    if (thickness >= 8) security += 1;

    // Thermal calculation
    if (isLowE) thermal += 2;
    if (isTripleGlazed) thermal += 1;
    if (glassType.uValue && glassType.uValue < 1.5) thermal += 1;

    // Acoustic calculation
    if (isLaminated) acoustic += 2;
    if (isTripleGlazed) acoustic += 1;
    if (thickness >= 10) acoustic += 1;
  } else {
    // Fallback to deprecated boolean fields
    if (glassType.isTempered) security += 1;
    if (glassType.isLaminated) security += 2;
    if (glassType.thicknessMm >= 8) security += 1;

    if (glassType.isLowE) thermal += 2;
    if (glassType.isTripleGlazed) thermal += 1;
    if (glassType.uValue && glassType.uValue < 1.5) thermal += 1;

    if (glassType.isLaminated) acoustic += 2;
    if (glassType.isTripleGlazed) acoustic += 1;
    if (glassType.thicknessMm >= 10) acoustic += 1;
  }

  return {
    acoustic: Math.min(5, acoustic),
    security: Math.min(5, security),
    thermal: Math.min(5, thermal),
  };
}

/**
 * Sort glass types by performance rating (best first)
 *
 * Sorts based on:
 * 1. Performance rating weight (excellent > veryGood > good > standard > basic)
 * 2. Price (lowest first for same rating)
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
      ? a.solutions?.find((s) => s.solution.id === selectedSolutionId)?.performanceRating
      : a.solutions?.find((s) => s.isPrimary)?.performanceRating;

    const ratingB = selectedSolutionId
      ? b.solutions?.find((s) => s.solution.id === selectedSolutionId)?.performanceRating
      : b.solutions?.find((s) => s.isPrimary)?.performanceRating;

    const weightA = ratingA ? (RatingWeights[ratingA] ?? 0) : 0;
    const weightB = ratingB ? (RatingWeights[ratingB] ?? 0) : 0;

    // Sort by performance (highest first)
    if (weightB !== weightA) return weightB - weightA;

    // Tie-break by price (lowest first)
    return a.pricePerSqm - b.pricePerSqm;
  });

  // Mark top option as recommended (if there are multiple options)
  return sorted.map((glass, index) => ({
    ...glass,
    isRecommended: index === 0 && sorted.length > 1,
  }));
}
