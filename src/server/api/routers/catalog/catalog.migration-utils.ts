/**
 * Migration utilities for backward compatibility between
 * deprecated `purpose` field and new GlassSolution system
 *
 * @deprecated These utilities will be removed in v2.0 along with the purpose field
 */

import type { GlassPurpose, GlassTypeSolution } from '@prisma/client';

/**
 * Maps deprecated GlassPurpose enum values to GlassSolution keys
 * Used as fallback when a GlassType has no solutions assigned
 *
 * @param purpose - The legacy purpose enum value
 * @returns Corresponding solution key
 *
 * @deprecated This mapping will be removed in v2.0
 */
export function mapPurposeToSolutionKey(purpose: GlassPurpose): string {
  const mapping: Record<GlassPurpose, string> = {
    decorative: 'decorative',
    general: 'general',
    insulation: 'thermal_insulation',
    security: 'security',
  };

  return mapping[purpose] ?? 'general';
}

/**
 * Ensures a glass type has at least one solution by falling back to purpose field
 * This maintains backward compatibility during the deprecation period
 *
 * @param glassType - Glass type with purpose and solutions
 * @param availableSolutions - All available glass solutions from database
 * @returns Array of solutions (existing or fallback from purpose)
 *
 * @example
 * ```typescript
 * const solutions = ensureGlassHasSolutions(glassType, allSolutions);
 * // Returns existing solutions or creates fallback from purpose field
 * ```
 *
 * @deprecated This fallback will be removed in v2.0 when purpose field is removed
 */
export function ensureGlassHasSolutions<
  T extends {
    purpose: GlassPurpose;
    solutions?: Array<
      GlassTypeSolution & {
        solution: { id: string; key: string; nameEs: string; icon: string };
      }
    >;
  },
>(glassType: T, availableSolutions: Array<{ id: string; key: string; nameEs: string; icon: string }>): T['solutions'] {
  // If glass already has solutions, return them
  if (glassType.solutions && glassType.solutions.length > 0) {
    return glassType.solutions;
  }

  // Fallback: Derive solution from purpose field
  const solutionKey = mapPurposeToSolutionKey(glassType.purpose);
  const fallbackSolution = availableSolutions.find((s) => s.key === solutionKey);

  if (!fallbackSolution) {
    // Ultimate fallback: return general solution
    const generalSolution = availableSolutions.find((s) => s.key === 'general');
    if (!generalSolution) {
      // No solutions available at all - return empty array
      return [] as T['solutions'];
    }

    return [
      {
        glassTypeId: '',
        id: 'fallback-general',
        isPrimary: true,
        notes: 'Fallback from purpose field (general)',
        performanceRating: 'standard',
        solution: generalSolution,
        solutionId: generalSolution.id,
      },
    ] as T['solutions'];
  }

  // Return synthetic solution based on purpose
  return [
    {
      glassTypeId: '',
      id: `fallback-${solutionKey}`,
      isPrimary: true,
      notes: `Fallback from purpose field (${glassType.purpose})`,
      performanceRating: 'standard',
      solution: fallbackSolution,
      solutionId: fallbackSolution.id,
    },
  ] as T['solutions'];
}

/**
 * Checks if a glass type is using fallback solutions (derived from purpose)
 *
 * @param solutions - Solutions array from glass type
 * @returns True if using fallback, false if using real solutions
 *
 * @deprecated This check will be removed in v2.0
 */
export function isUsingFallbackSolutions(solutions: Array<{ id: string }> | undefined): boolean {
  if (!solutions || solutions.length === 0) return false;
  return solutions.some((s) => s.id.startsWith('fallback-'));
}
