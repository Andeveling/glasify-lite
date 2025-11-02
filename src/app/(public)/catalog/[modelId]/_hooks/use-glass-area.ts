/**
 * Glass Area Calculation Hook
 * Reactive hook for calculating billable glass area with profile discounts
 */

import { useMemo } from "react";
import {
	calculateGlassArea,
	type GlassDiscounts,
} from "../_utils/glass-area-calculator";

type UseGlassAreaParams = {
	heightMm: number;
	widthMm: number;
	discounts: GlassDiscounts;
};

/**
 * Calculate glass area reactively when dimensions change
 *
 * @param params - Width, height, and profile discounts
 * @returns Billable area in m² (memoized)
 *
 * @example
 * const glassArea = useGlassArea({
 *   widthMm: width,
 *   heightMm: height,
 *   discounts: {
 *     widthMm: model.glassDiscountWidthMm,
 *     heightMm: model.glassDiscountHeightMm
 *   }
 * });
 */
export function useGlassArea({
	discounts,
	heightMm,
	widthMm,
}: UseGlassAreaParams): number {
	const { widthMm: discountWidthMm, heightMm: discountHeightMm } = discounts;

	return useMemo(
		() =>
			calculateGlassArea(widthMm, heightMm, {
				heightMm: discountHeightMm,
				widthMm: discountWidthMm,
			}),
		[widthMm, heightMm, discountWidthMm, discountHeightMm],
	);
}
