/**
 * @file PriceCalculatorPort - Input Port Interface
 * @description Hexagonal architecture input port for price calculation use case
 *
 * This interface defines the contract for price calculation without coupling
 * to any specific framework or implementation. Adapters (tRPC, REST, GraphQL)
 * will use this interface to interact with the domain layer.
 */

/**
 * Re-export domain types for external use
 */
export type {
  PriceCalculationInput,
  PriceCalculationResult,
} from '@/domain/pricing/core/entities/price-calculation';

/**
 * Input port for price calculation use case
 *
 * This type allows external systems (tRPC, REST, CLI) to calculate
 * item prices without knowing domain implementation details.
 *
 * @example
 * ```typescript
 * import type { PriceCalculatorPort, PriceCalculationInput, PriceCalculationResult } from '@/domain/pricing/ports';
 *
 * const useCase: PriceCalculatorPort = {
 *   async calculateItemPrice(input) {
 *     // Validation and orchestration logic
 *     return PriceCalculation.calculate(input);
 *   }
 * };
 * ```
 */
export type PriceCalculatorPort = {
  /**
   * Calculate complete item price with all components
   *
   * @param input - Complete calculation input (dimensions, prices, config)
   * @returns Price breakdown with all components
   * @throws Error if validation fails (e.g., margin >= 100%)
   */
  calculateItemPrice(
    input: import('@/domain/pricing/core/entities/price-calculation').PriceCalculationInput
  ): Promise<import('@/domain/pricing/core/entities/price-calculation').PriceCalculationResult>;
};


