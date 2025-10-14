import { useMemo } from 'react';
import type { GlassTypeOutput } from '@/server/api/routers/catalog';
import { Home } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { GlassTypeOption } from './use-glass-type-options';
import { buildGlassFeatures, calculatePerformanceRatings } from '../_utils/glass-type.utils';

/**
 * Custom Hook: useGlassTypesByTab
 *
 * Groups glass types by solution for tab-based display.
 * Simplifies UI by categorizing options clearly.
 *
 * @param glassTypes - Raw glass types from tRPC
 * @param basePrice - Model base price for price comparison (optional)
 * @returns Tabs with grouped glass type options
 */

// ============================================================================
// Types
// ============================================================================

export type GlassTab = {
  icon: LucideIcon;
  key: string;
  label: string;
  options: GlassTypeOption[];
};

// ============================================================================
// Icon Mapping
// ============================================================================

function getSolutionIcon(iconName: string | null | undefined): LucideIcon {
  return Home; // Default - can be extended with dynamic imports if needed
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useGlassTypesByTab(
  glassTypes: GlassTypeOutput[],
  basePrice?: number
): GlassTab[] {
  const tabs = useMemo(() => {
    // Step 1: Map glass types to their PRIMARY solution only (deduplicate)
    const primarySolutionsMap = new Map<string, {
      id: string;
      key: string;
      label: string;
      icon: LucideIcon;
      sortOrder: number;
      glassTypes: GlassTypeOutput[];
    }>();

    // Track assigned glass types to avoid duplicates
    const assignedGlassTypes = new Set<string>();

    glassTypes.forEach((glassType) => {
      // Skip if already assigned to a tab
      if (assignedGlassTypes.has(glassType.id)) return;

      // Find primary solution (or first solution if no primary)
      const primarySolution = glassType.solutions?.find((s) => s.isPrimary) ?? glassType.solutions?.[ 0 ];

      if (!primarySolution) return;

      const solution = primarySolution.solution;

      if (!primarySolutionsMap.has(solution.id)) {
        primarySolutionsMap.set(solution.id, {
          glassTypes: [],
          icon: getSolutionIcon(solution.icon),
          id: solution.id,
          key: solution.key,
          label: solution.nameEs,
          sortOrder: solution.sortOrder,
        });
      }

      primarySolutionsMap.get(solution.id)!.glassTypes.push(glassType);
      assignedGlassTypes.add(glassType.id);
    });

    // Step 2: Convert to tabs array and sort by sortOrder
    const tabsArray = Array.from(primarySolutionsMap.values())
      .filter((tab) => tab.glassTypes.length > 0) // Only tabs with glass types
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((tab): GlassTab => {
        // Step 3: Transform glass types to options
        const options = tab.glassTypes.map((glassType): GlassTypeOption => {
          // Get primary solution for this tab
          const primarySolution = glassType.solutions?.find((s) => s.isPrimary) ?? glassType.solutions?.[ 0 ];
          const solution = primarySolution?.solution;

          const icon = getSolutionIcon(solution?.icon);
          const title = solution?.nameEs ?? glassType.name;
          const features = buildGlassFeatures(glassType);
          const performanceRatings = calculatePerformanceRatings(glassType);
          const performanceRating = primarySolution?.performanceRating;
          const priceModifier = basePrice ? glassType.pricePerSqm - basePrice : 0;

          return {
            acousticRating: performanceRatings.acoustic,
            features,
            icon,
            id: glassType.id,
            isRecommended: false,
            name: glassType.name,
            performanceRating,
            priceModifier,
            pricePerSqm: glassType.pricePerSqm,
            securityRating: performanceRatings.security,
            thermalRating: performanceRatings.thermal,
            thicknessMm: glassType.thicknessMm,
            title,
          };
        });

        // Step 4: Sort options by performance rating and price
        const sortedOptions = options.sort((a, b) => {
          const RATING_WEIGHTS: Record<string, number> = {
            basic: 1,
            excellent: 5,
            good: 3,
            standard: 2,
            veryGood: 4,
          };

          const weightA = a.performanceRating ? (RATING_WEIGHTS[ a.performanceRating ] ?? 0) : 0;
          const weightB = b.performanceRating ? (RATING_WEIGHTS[ b.performanceRating ] ?? 0) : 0;

          if (weightB !== weightA) return weightB - weightA;
          return a.pricePerSqm - b.pricePerSqm;
        });

        return {
          icon: tab.icon,
          key: tab.key,
          label: tab.label,
          options: sortedOptions,
        };
      });

    return tabsArray;
  }, [ glassTypes, basePrice ]);

  return tabs;
}
