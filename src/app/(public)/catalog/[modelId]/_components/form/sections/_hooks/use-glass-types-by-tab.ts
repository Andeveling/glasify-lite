import type { LucideIcon } from "lucide-react";
import { Home, Shield, Snowflake, Sparkles, Volume2, Zap } from "lucide-react";
import { useMemo } from "react";
import type { GlassTypeOutput } from "@/server/api/routers/catalog";
import {
  buildGlassFeatures,
  calculatePerformanceRatings,
} from "../_utils/glass-type.utils";
import type { GlassTypeOption } from "./use-glass-type-options";

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
  const iconMap: Record<string, LucideIcon> = {
    Home,
    Shield,
    Snowflake,
    Sparkles,
    Volume2,
    Zap,
  };

  return iconName && iconMap[iconName] ? iconMap[iconName] : Home;
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
    const primarySolutionsMap = new Map<
      string,
      {
        id: string;
        key: string;
        label: string;
        icon: LucideIcon;
        sortOrder: number;
        glassTypes: GlassTypeOutput[];
      }
    >();

    // Track assigned glass types to avoid duplicates
    const assignedGlassTypes = new Set<string>();

    // Track glass types WITHOUT solutions for fallback tab
    const glassTypesWithoutSolution: GlassTypeOutput[] = [];

    for (const glassType of glassTypes) {
      // Skip if already assigned to a tab
      if (assignedGlassTypes.has(glassType.id)) {
        continue;
      }

      // Find primary solution (or first solution if no primary)
      const primarySolution =
        glassType.solutions?.find((s) => s.isPrimary) ??
        glassType.solutions?.[0];

      // ✅ FIX: If no solution, add to fallback list instead of skipping
      if (!primarySolution) {
        glassTypesWithoutSolution.push(glassType);
        continue;
      }

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

      const solutionTab = primarySolutionsMap.get(solution.id);
      if (solutionTab) {
        solutionTab.glassTypes.push(glassType);
      }
      assignedGlassTypes.add(glassType.id);
    }

    // ✅ FIX: Add fallback "General" tab for glass types without solutions
    if (glassTypesWithoutSolution.length > 0) {
      primarySolutionsMap.set("general", {
        glassTypes: glassTypesWithoutSolution,
        icon: Home,
        id: "general",
        key: "general",
        label: "General",
        sortOrder: 999, // Show last
      });
    }

    // Step 2: Convert to tabs array and sort by sortOrder
    const tabsArray = Array.from(primarySolutionsMap.values())
      .filter((tab) => tab.glassTypes.length > 0) // Only tabs with glass types
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((tab): GlassTab => {
        // Step 3: Transform glass types to options
        const options = tab.glassTypes.map((glassType): GlassTypeOption => {
          // Get primary solution for this tab
          const primarySolution =
            glassType.solutions?.find((s) => s.isPrimary) ??
            glassType.solutions?.[0];
          const solution = primarySolution?.solution;

          const icon = getSolutionIcon(solution?.icon);
          const title = solution?.nameEs ?? glassType.name;
          const features = buildGlassFeatures(glassType);
          const performanceRatings = calculatePerformanceRatings(glassType);
          const performanceRating = primarySolution?.performanceRating;
          const priceModifier = basePrice
            ? glassType.pricePerSqm - basePrice
            : 0;

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
          const RatingWeights: Record<string, number> = {
            basic: 1,
            excellent: 5,
            good: 3,
            standard: 2,
            veryGood: 4,
          };

          const weightA = a.performanceRating
            ? (RatingWeights[a.performanceRating] ?? 0)
            : 0;
          const weightB = b.performanceRating
            ? (RatingWeights[b.performanceRating] ?? 0)
            : 0;

          if (weightB !== weightA) {
            return weightB - weightA;
          }
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
  }, [glassTypes, basePrice]);

  return tabs;
}
