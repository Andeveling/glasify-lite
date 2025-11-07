/**
 * CalculateItemPrice - Use Case
 *
 * Validates input and delegates to PriceCalculation aggregate for computing
 * the complete price breakdown of a single quote item.
 *
 * Validation Rules:
 * - Width must be > 0
 * - Height must be > 0
 * - Color multiplier must be >= 1.0 (no discounts, only surcharges)
 */

import {
  PriceCalculation,
  type PriceCalculationInput,
  type PriceCalculationResult,
} from "../core/entities/price-calculation";

/**
 * Minimum allowed color multiplier
 *
 * Color multiplier must be at least 1.0 (no color surcharge).
 * Values < 1.0 would represent discounts, which are not allowed via color multiplier.
 */
const MIN_COLOR_MULTIPLIER = 1.0;

/**
 * Execute price calculation with input validation
 *
 * This use case validates business rules before delegating to the domain layer.
 * It ensures that:
 * 1. Dimensions are positive (width > 0, height > 0)
 * 2. Color multiplier is >= 1.0 (only surcharges allowed, no discounts)
 *
 * @param input - Price calculation input
 * @returns Complete price breakdown
 * @throws Error if validation fails
 */
function execute(input: PriceCalculationInput): PriceCalculationResult {
  // Validate width
  if (input.dimensions.widthMm <= 0) {
    throw new Error("Width must be greater than 0");
  }

  // Validate height
  if (input.dimensions.heightMm <= 0) {
    throw new Error("Height must be greater than 0");
  }

  // Validate color multiplier
  if (input.colorMultiplier < MIN_COLOR_MULTIPLIER) {
    throw new Error("Color multiplier must be at least 1.0");
  }

  // Delegate to domain aggregate
  return PriceCalculation.calculate(input);
}

/**
 * CalculateItemPrice namespace
 *
 * Provides the execute function as a static-like member.
 */
export const CalculateItemPrice = {
  execute,
} as const;
