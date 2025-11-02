import type { LucideIcon } from "lucide-react";
import { Home } from "lucide-react";
import { useMemo } from "react";
import type {
	GlassTypeOutput,
	PerformanceRating,
} from "@/server/api/routers/catalog";
import {
	buildGlassFeatures,
	calculatePerformanceRatings,
	sortByPerformance,
} from "../_utils/glass-type.utils";

/**
 * Custom Hook: useGlassTypeOptions
 *
 * Encapsulates all business logic for transforming GlassType data into UI-ready options.
 * Follows Single Responsibility Principle: only data transformation logic.
 *
 * @param glassTypes - Raw glass types from tRPC
 * @param selectedSolutionId - Current selected solution (optional)
 * @param basePrice - Model base price for price comparison (optional)
 * @returns Filtered, sorted, and enhanced glass type options ready for UI
 */

// ============================================================================
// Types
// ============================================================================

export type GlassTypeOption = {
	acousticRating: number;
	features: string[];
	icon: LucideIcon;
	id: string;
	isRecommended: boolean;
	name: string;
	performanceRating?: PerformanceRating;
	priceModifier: number;
	pricePerSqm: number;
	securityRating: number;
	thermalRating: number;
	thicknessMm: number;
	title: string;
};

// ============================================================================
// Icon Mapping
// ============================================================================

/**
 * Map solution icon name (from database) to Lucide component
 */
function getSolutionIcon(_iconName: string | null | undefined): LucideIcon {
	// Lazy load icons only when needed
	const _iconMap: Record<string, () => Promise<{ [key: string]: LucideIcon }>> =
		{
			Home: () => import("lucide-react").then((m) => ({ Home: m.Home })),
			Shield: () => import("lucide-react").then((m) => ({ Shield: m.Shield })),
			Snowflake: () =>
				import("lucide-react").then((m) => ({ Snowflake: m.Snowflake })),
			Sparkles: () =>
				import("lucide-react").then((m) => ({ Sparkles: m.Sparkles })),
			Volume2: () =>
				import("lucide-react").then((m) => ({ Volume2: m.Volume2 })),
			Zap: () => import("lucide-react").then((m) => ({ Zap: m.Zap })),
		};

	// For now, return Home as default (icon loading can be optimized later)
	return Home;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useGlassTypeOptions(
	glassTypes: GlassTypeOutput[],
	selectedSolutionId?: string,
	basePrice?: number,
): GlassTypeOption[] {
	// Step 1: Filter glass types by selected solution
	const filteredGlassTypes = useMemo(() => {
		if (!selectedSolutionId) {
			return glassTypes;
		}

		return glassTypes.filter((glassType) =>
			glassType.solutions?.some(
				(sol) => sol.solution.id === selectedSolutionId,
			),
		);
	}, [glassTypes, selectedSolutionId]);

	// Step 2: Sort by performance and mark recommended
	const sortedGlassTypes = useMemo(
		() => sortByPerformance(filteredGlassTypes, selectedSolutionId),
		[filteredGlassTypes, selectedSolutionId],
	);

	// Step 3: Transform to UI options (limit to top 20 to reduce cognitive load)
	const glassOptions = useMemo(() => {
		const MaxOptions = 20;
		const displayedGlassTypes = sortedGlassTypes.slice(0, MaxOptions);

		return displayedGlassTypes.map((glassType): GlassTypeOption => {
			// Get solution data (selected or primary)
			const primarySolution = glassType.solutions?.find((s) => s.isPrimary);
			const selectedSolutionData = selectedSolutionId
				? glassType.solutions?.find((s) => s.solution.id === selectedSolutionId)
				: null;

			const solutionData =
				selectedSolutionData?.solution ??
				primarySolution?.solution ??
				glassType.solutions?.[0]?.solution;

			// Build UI data
			const icon = getSolutionIcon(solutionData?.icon);
			const title = solutionData?.nameEs ?? glassType.name;
			const features = buildGlassFeatures(glassType);
			const performanceRatings = calculatePerformanceRatings(glassType);

			// Get performance rating for selected solution (for badge)
			const performanceRating = selectedSolutionId
				? glassType.solutions?.find((s) => s.solution.id === selectedSolutionId)
						?.performanceRating
				: primarySolution?.performanceRating;

			// Calculate price impact relative to base price
			const priceModifier = basePrice ? glassType.pricePerSqm - basePrice : 0;

			return {
				acousticRating: performanceRatings.acoustic,
				features,
				icon,
				id: glassType.id,
				isRecommended: glassType.isRecommended,
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
	}, [sortedGlassTypes, selectedSolutionId, basePrice]);

	return glassOptions;
}
