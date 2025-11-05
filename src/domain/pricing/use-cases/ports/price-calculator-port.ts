/**
 * PriceCalculatorPort - Port interface for price calculation
 *
 * Defines the contract for price calculation operations in the use case layer.
 * This port follows the Hexagonal Architecture pattern, allowing the domain
 * to remain independent of infrastructure details.
 */

import type {
  PriceCalculationInput,
  PriceCalculationResult,
} from "../../core/entities/price-calculation";

/**
 * Port type for price calculation operations
 *
 * This port is implemented by adapters (e.g., PriceCalculation aggregate)
 * and consumed by use cases (e.g., CalculateItemPrice).
 */
export type PriceCalculatorPort = {
  /**
   * Calculate item price with complete breakdown
   *
   * @param input - Price calculation input with all required data
   * @returns Complete price breakdown with all components
   */
  calculateItemPrice(input: PriceCalculationInput): PriceCalculationResult;
};
