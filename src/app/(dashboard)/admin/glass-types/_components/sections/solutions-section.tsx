/**
 * SolutionsSection Component (Organism)
 *
 * Wrapper section for SolutionSelector component
 *
 * @module _components/sections/solutions-section
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SolutionSelector } from "../solution-selector";

/**
 * Solutions section component (wrapper)
 */
export function SolutionsSection() {
	return (
		<Card>
			<CardContent className="pt-6">
				<SolutionSelector />
			</CardContent>
		</Card>
	);
}
