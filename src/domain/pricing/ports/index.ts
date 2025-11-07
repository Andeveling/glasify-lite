/**
 * @file Pricing Domain Ports Public API
 * @description Exports all input/output ports for hexagonal architecture
 */

/**
 * Input Ports (Use Case Interfaces)
 */
export type {
  PriceCalculationInput,
  PriceCalculationResult,
  PriceCalculatorPort,
} from "./input/price-calculator.port";

/**
 * Output Ports (Repository/External Service Interfaces)
 * Note: Currently none needed - pricing domain is pure and self-contained
 */
