/**
 * CharacteristicsSection Component (Organism)
 *
 * Wrapper section for CharacteristicSelector component
 *
 * @module _components/sections/characteristics-section
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CharacteristicSelector } from "../characteristic-selector";

/**
 * Characteristics section component (wrapper)
 */
export function CharacteristicsSection() {
	return (
		<Card>
			<CardContent className="pt-6">
				<CharacteristicSelector />
			</CardContent>
		</Card>
	);
}
