import { PERCENTAGE_TO_DECIMAL } from "../constants";
import type { Money } from "../entities/money";

/**
 * Input for model sales price calculation
 */
export type ModelSalesPriceInput = {
  /**
   * Total model cost (profile + glass)
   * Services are NOT included - they are added AFTER margin
   */
  modelCost: Money;

  /**
   * Profit margin percentage (0-100)
   * Example: 20 = 20% margin
   */
  marginPercentage: number;
};

/**
 * Calculate sales price from cost and margin percentage
 *
 * Formula (US2):
 * salesPrice = cost / (1 - marginPercentage/100)
 *
 * This is the reverse calculation of:
 * margin = (salesPrice - cost) / salesPrice
 *
 * Example:
 * - cost = $100, margin = 20%
 * - salesPrice = 100 / (1 - 0.2) = 100 / 0.8 = $125
 * - verification: (125 - 100) / 125 = 25/125 = 0.2 = 20% ✓
 *
 * @param cost - Total cost (Money value object)
 * @param marginPercentage - Profit margin as percentage (0-100)
 * @returns Sales price with margin applied
 */
function calculateSalesPrice(cost: Money, marginPercentage: number): Money {
  // Convert percentage to decimal (20% → 0.20)
  const marginDecimal = marginPercentage / PERCENTAGE_TO_DECIMAL;

  // Calculate divisor (1 - margin)
  const divisor = 1 - marginDecimal;

  // Divide cost by (1 - margin)
  return cost.divide(divisor);
}

/**
 * Calculate model sales price with profit margin
 *
 * Applies profit margin ONLY to model costs (profile + glass).
 * Services are NOT included in this calculation - they are added
 * to the final quote AFTER margin is calculated.
 *
 * The color surcharge is already included in modelCost, so margin
 * does not compound with color.
 *
 * @param input - Model sales price calculation input
 * @returns Model sales price with margin applied
 */
function calculateModelSalesPrice(input: ModelSalesPriceInput): Money {
  const { modelCost, marginPercentage } = input;
  return calculateSalesPrice(modelCost, marginPercentage);
}

/**
 * MarginCalculator - Pure functions for profit margin calculations
 *
 * Provides methods to calculate sales prices from costs using profit margins.
 * All functions are pure (no side effects) and use Money value objects.
 *
 * Key business rules:
 * - Margin is applied ONLY to model costs (profile + glass)
 * - Services are added AFTER margin calculation
 * - Color surcharge is applied BEFORE margin (in profile/glass)
 * - Margin does not compound with color
 */
export const MarginCalculator = {
  calculateSalesPrice,
  calculateModelSalesPrice,
} as const;
