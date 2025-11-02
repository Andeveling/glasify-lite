/**
 * Price Breakdown Formatting Hook
 * Builds formatted price breakdown items from calculation results
 */

import { useMemo } from "react";
import type {
	GlassTypeOutput,
	ModelDetailOutput,
	ServiceOutput,
} from "@/server/api/routers/catalog";
import type { PriceItemCalculationResult } from "@/server/price/price-item";
import {
	buildPriceBreakdown,
	type PriceBreakdownItem,
} from "../_utils/price-breakdown-builder";

type UsePriceBreakdownParams = {
	breakdown: PriceItemCalculationResult | undefined;
	glassArea: number;
	model: ModelDetailOutput;
	selectedGlassType: GlassTypeOutput | undefined;
	services: ServiceOutput[];
};

/**
 * Format price breakdown for display
 *
 * @param params - Breakdown data and context
 * @returns Formatted breakdown items (memoized)
 *
 * @example
 * const priceBreakdown = usePriceBreakdown({
 *   breakdown,
 *   model,
 *   glassArea,
 *   selectedGlassType,
 *   services
 * });
 */
export function usePriceBreakdown({
	breakdown,
	glassArea,
	model,
	selectedGlassType,
	services,
}: UsePriceBreakdownParams): PriceBreakdownItem[] {
	return useMemo(
		() =>
			buildPriceBreakdown({
				breakdown: breakdown ?? null,
				glassArea,
				model,
				selectedGlassType,
				services,
			}),
		[breakdown, glassArea, model, selectedGlassType, services],
	);
}
