import type { Dimensions } from "../entities/dimensions";
import type { Money } from "../entities/money";

/**
 * Input for profile cost calculation
 */
export type ProfileCostInput = {
  /**
   * Base price for the profile (minimum billable cost)
   */
  basePrice: Money;

  /**
   * Cost per additional millimeter of width beyond minimum
   */
  costPerMmWidth: Money;

  /**
   * Cost per additional millimeter of height beyond minimum
   */
  costPerMmHeight: Money;

  /**
   * Dimensions including width, height, and their minimums
   */
  dimensions: Dimensions;

  /**
   * Color multiplier to apply to all costs (1 = no surcharge, 1.1 = 10% surcharge)
   */
  colorMultiplier: number;
};

/**
 * Calculate base cost with color surcharge
 *
 * @param basePrice - Base price for the profile
 * @param colorMultiplier - Color multiplier (1 = no surcharge, 1.1 = 10% surcharge)
 * @returns Base cost with color applied
 */
function calculateBaseCost(basePrice: Money, colorMultiplier: number): Money {
  return basePrice.multiply(colorMultiplier);
}

/**
 * Calculate cost for extra width millimeters
 *
 * @param costPerMmWidth - Cost per millimeter of width
 * @param extraWidthMm - Extra millimeters beyond minimum width
 * @param colorMultiplier - Color multiplier
 * @returns Width cost with color applied
 */
function calculateWidthCost(
  costPerMmWidth: Money,
  extraWidthMm: number,
  colorMultiplier: number
): Money {
  // Apply color to per-mm cost, then multiply by millimeters
  const perMmWithColor = costPerMmWidth.multiply(colorMultiplier);
  return perMmWithColor.multiply(extraWidthMm);
}

/**
 * Calculate cost for extra height millimeters
 *
 * @param costPerMmHeight - Cost per millimeter of height
 * @param extraHeightMm - Extra millimeters beyond minimum height
 * @param colorMultiplier - Color multiplier
 * @returns Height cost with color applied
 */
function calculateHeightCost(
  costPerMmHeight: Money,
  extraHeightMm: number,
  colorMultiplier: number
): Money {
  // Apply color to per-mm cost, then multiply by millimeters
  const perMmWithColor = costPerMmHeight.multiply(colorMultiplier);
  return perMmWithColor.multiply(extraHeightMm);
}

/**
 * Calculate total profile cost
 *
 * Applies the profile pricing formula:
 * 1. Calculate base cost with color surcharge
 * 2. Calculate width cost for extra mm (with color)
 * 3. Calculate height cost for extra mm (with color)
 * 4. Sum all components
 *
 * Formula (US1):
 * profileCost = (basePrice × colorMultiplier) +
 *               (costPerMmWidth × colorMultiplier × extraWidth) +
 *               (costPerMmHeight × colorMultiplier × extraHeight)
 *
 * Where:
 * - extraWidth = max(actualWidth - minWidth, 0)
 * - extraHeight = max(actualHeight - minHeight, 0)
 *
 * Extra dimensions are clamped to zero by Dimensions.getEffectiveWidth/Height()
 * The color multiplier is applied BEFORE addition (US4 requirement)
 *
 * @param input - Profile cost calculation input
 * @returns Total profile cost with all surcharges applied
 */
function calculateProfileCost(input: ProfileCostInput): Money {
  const {
    basePrice,
    costPerMmWidth,
    costPerMmHeight,
    dimensions,
    colorMultiplier,
  } = input;

  // Get extra millimeters (clamped to 0 if below minimum)
  const extraWidthMm = dimensions.getEffectiveWidth();
  const extraHeightMm = dimensions.getEffectiveHeight();

  // Calculate each component with color surcharge
  const baseCost = calculateBaseCost(basePrice, colorMultiplier);
  const widthCost = calculateWidthCost(
    costPerMmWidth,
    extraWidthMm,
    colorMultiplier
  );
  const heightCost = calculateHeightCost(
    costPerMmHeight,
    extraHeightMm,
    colorMultiplier
  );

  // Sum all components
  return baseCost.add(widthCost).add(heightCost);
}

/**
 * ProfileCalculator - Pure functions for profile cost calculations
 *
 * Provides methods to calculate profile costs with minimum dimensions logic.
 * All functions are pure (no side effects) and use Money value objects.
 */
export const ProfileCalculator = {
  calculateBaseCost,
  calculateWidthCost,
  calculateHeightCost,
  calculateProfileCost,
} as const;
