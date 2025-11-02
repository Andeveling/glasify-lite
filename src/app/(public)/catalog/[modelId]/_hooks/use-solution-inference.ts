/** biome-ignore-all lint/style/noMagicNumbers: It is not required */
import { useMemo } from "react";
import type {
	GlassSolutionOutput,
	GlassTypeOutput,
} from "@/server/api/routers/catalog";

// ============================================================================
// Types
// ============================================================================

type InferredSolution = {
	acousticRating: number; // 1-5 scale
	description: string | null;
	icon: string | null;
	id: string;
	name: string;
	nameEs: string;
	securityRating: number; // 1-5 scale
	thermalRating: number; // 1-5 scale
};

// ============================================================================
// Helpers
// ============================================================================

/**
 * Convert performance rating enum to numeric scale (1-5)
 */
function performanceToNumeric(rating: string | undefined): number {
	switch (rating) {
		case "excellent":
			return 5;
		case "very_good":
			return 4;
		case "good":
			return 3;
		case "standard":
			return 2;
		case "basic":
			return 1;
		default:
			return 3; // Default to "good" if undefined
	}
}

/**
 * Calculate acoustic rating based on glass characteristics
 */
function calculateAcousticRating(glassType: GlassTypeOutput | null): number {
	if (!glassType) {
		return 3;
	}

	let rating = 2; // Base rating
	const characteristics = glassType.characteristics ?? [];

	// Laminated glass provides better sound insulation
	const hasLaminated = characteristics.some((c) =>
		c.characteristic?.key?.includes("laminated"),
	);
	if (hasLaminated) {
		rating += 2;
	}

	// Triple glazing significantly improves acoustic performance
	const hasTripleGlazed = characteristics.some((c) =>
		c.characteristic?.key?.includes("triple"),
	);
	if (hasTripleGlazed) {
		rating += 1;
	}

	// Thicker glass improves sound reduction
	const MinThickAcoustic = 10;
	const MaxRating = 5;
	if (glassType.thicknessMm >= MinThickAcoustic) {
		rating += 1;
	}

	return Math.min(MaxRating, rating);
}

/**
 * Calculate thermal rating based on glass characteristics
 */
function calculateThermalRating(glassType: GlassTypeOutput | null): number {
	if (!glassType) {
		return 3;
	}

	let rating = 2; // Base rating
	const characteristics = glassType.characteristics ?? [];

	// Low-E coating significantly improves thermal performance
	const hasLowE = characteristics.some(
		(c) =>
			c.characteristic?.key?.includes("low_e") ||
			c.characteristic?.key?.includes("lowE"),
	);
	if (hasLowE) {
		rating += 2;
	}

	// Triple glazing provides excellent insulation
	const hasTripleGlazed = characteristics.some((c) =>
		c.characteristic?.key?.includes("triple"),
	);
	if (hasTripleGlazed) {
		rating += 1;
	}

	// U-value (lower is better for thermal insulation)
	const ExcellentUvalue = 1.5;
	const GoodUvalue = 2.5;
	const MaxRating = 5;
	if (glassType.uValue && glassType.uValue < ExcellentUvalue) {
		rating += 1;
	} else if (glassType.uValue && glassType.uValue < GoodUvalue) {
		rating += 0;
	}

	return Math.min(MaxRating, rating);
}

/**
 * Calculate security rating based on glass characteristics
 */
function calculateSecurityRating(glassType: GlassTypeOutput | null): number {
	if (!glassType) {
		return 3;
	}

	let rating = 2; // Base rating

	// Check for laminated or tempered characteristics
	const characteristics = glassType.characteristics ?? [];
	const hasLaminated = characteristics.some((c) =>
		c.characteristic?.key?.includes("laminated"),
	);
	const hasTempered = characteristics.some((c) =>
		c.characteristic?.key?.includes("tempered"),
	);

	// Tempered glass provides safety (but not security against intrusion)
	if (hasTempered) {
		rating += 1;
	}

	// Laminated glass is the best for security (holds together when broken)
	if (hasLaminated) {
		rating += 2;
	}

	// Thickness adds to security
	const MinThickSecurity = 8;
	const MaxRating = 5;
	if (glassType.thicknessMm >= MinThickSecurity) {
		rating += 1;
	}
	return Math.min(MaxRating, rating);
}

/**
 * Infer primary solution from glass type characteristics
 * Priority: Primary solution > Highest performance rating
 */
function inferPrimarySolution(
	glassType: GlassTypeOutput | null,
	availableSolutions: GlassSolutionOutput[],
): GlassSolutionOutput | null {
	if (!glassType) {
		return null;
	}

	// Priority 1: Use primary solution if defined
	const primarySolution = glassType.solutions?.find(
		(s) => s.isPrimary,
	)?.solution;
	if (primarySolution) {
		return primarySolution;
	}

	// Priority 2: Find solution with highest performance rating
	// Safety check: only reduce if array has elements
	const solutions = glassType.solutions ?? [];
	if (solutions.length > 0) {
		const bestSolution = solutions.reduce((best, current) => {
			const bestRating = performanceToNumeric(best.performanceRating);
			const currentRating = performanceToNumeric(current.performanceRating);
			return currentRating > bestRating ? current : best;
		})?.solution;
		if (bestSolution) {
			return bestSolution;
		}
	}

	// Fallback: return first available solution
	return availableSolutions.length > 0 ? (availableSolutions[0] ?? null) : null;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Infer Glass Solution from Glass Type Characteristics
 *
 * Auto-calculates the appropriate solution based on glass type features,
 * eliminating the need for manual user selection. Calculates performance
 * ratings (security, thermal, acoustic) on a 1-5 scale.
 *
 * ## Logic Priority
 * 1. **Primary Solution**: Uses isPrimary flag if set
 * 2. **Best Performance**: Selects solution with highest performanceRating
 * 3. **Purpose Fallback**: Maps purpose to solution key
 *
 * ## Rating Calculation
 * - **Security**: Based on tempered + laminated + thickness
 * - **Thermal**: Based on Low-E + triple glazing + U-value
 * - **Acoustic**: Based on laminated + triple glazing + thickness
 *
 * @param glassType - Selected glass type (from form state)
 * @param availableSolutions - All available solutions (from tRPC)
 * @returns Inferred solution with performance ratings (1-5 scale)
 *
 * @example
 * ```tsx
 * const { inferredSolution } = useSolutionInference(
 *   selectedGlassType,
 *   allSolutions
 * );
 *
 * // Result: { name: "Seguridad", securityRating: 5, ... }
 * ```
 */
export function useSolutionInference(
	glassType: GlassTypeOutput | null,
	availableSolutions: GlassSolutionOutput[],
): {
	acousticRating: number;
	inferredSolution: InferredSolution | null;
	securityRating: number;
	thermalRating: number;
} {
	const inferredSolution = useMemo(() => {
		const primarySolution = inferPrimarySolution(glassType, availableSolutions);
		if (!primarySolution) {
			return null;
		}

		const securityRating = calculateSecurityRating(glassType);
		const thermalRating = calculateThermalRating(glassType);
		const acousticRating = calculateAcousticRating(glassType);

		return {
			acousticRating,
			description: primarySolution.description,
			icon: primarySolution.icon,
			id: primarySolution.id,
			name: primarySolution.name,
			nameEs: primarySolution.nameEs,
			securityRating,
			thermalRating,
		};
	}, [glassType, availableSolutions]);

	return {
		acousticRating: inferredSolution?.acousticRating ?? 3,
		inferredSolution,
		securityRating: inferredSolution?.securityRating ?? 3,
		thermalRating: inferredSolution?.thermalRating ?? 3,
	};
}
