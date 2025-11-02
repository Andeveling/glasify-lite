"use client";

import { useCallback, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import type { GlassSolutionOutput } from "@/server/api/routers/catalog";

type UseSolutionSelectorProps = {
	solutions: GlassSolutionOutput[];
};

/**
 * Custom hook for solution selector state management
 * Handles solution selection and form field updates
 *
 * @param solutions - Array of available glass solutions
 * @returns Solution selector state and handlers
 */
export function useSolutionSelector({ solutions }: UseSolutionSelectorProps) {
	const { setValue, watch } = useFormContext();

	// Watch both solution and glassType fields
	const selectedSolutionId = watch("solution") as string | undefined;
	const currentGlassType = watch("glassType") as string | undefined;

	// Find the selected solution object
	const selectedSolution = useMemo(
		() => solutions.find((s) => s.id === selectedSolutionId),
		[solutions, selectedSolutionId],
	);

	/**
	 * Handle solution selection
	 * Clears glass type selection when solution changes
	 */
	const handleSolutionChange = useCallback(
		(solutionId: string) => {
			setValue("solution", solutionId, { shouldValidate: true });

			// Reset glass type when solution changes
			if (currentGlassType) {
				setValue("glassType", "", { shouldValidate: false });
			}
		},
		[setValue, currentGlassType],
	);

	/**
	 * Check if a solution is currently selected
	 */
	const isSolutionSelected = useCallback(
		(solutionId: string) => selectedSolutionId === solutionId,
		[selectedSolutionId],
	);

	return {
		handleSolutionChange,
		isSolutionSelected,
		selectedSolution,
		selectedSolutionId,
	};
}
