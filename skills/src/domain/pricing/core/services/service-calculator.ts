import type { Dimensions } from '../entities/dimensions'
import type { Money } from '../entities/money'
import { type ServiceResult, ServiceUnit } from '../types'
import {
  applyMinimumBillingUnit,
  calculateAreaQuantity,
  calculateFixedQuantity,
  calculatePerimeterQuantity,
} from './quantity-calculations'

/**
 * Input for service amount calculation
 */
export type ServiceAmountInput = {
  /** Unique service identifier */
  serviceId: string
  /** Service name */
  name: string
  /** Unit type for quantity calculation */
  unit: ServiceUnit
  /** Rate per unit */
  rate: Money
  /** Minimum billing unit (optional) */
  minimumBillingUnit?: number
  /** Override quantity for fixed services (optional) */
  quantityOverride?: number
}

/**
 * Calculate quantity based on service unit type
 *
 * @param unit - Service unit type
 * @param dimensions - Glass dimensions
 * @param quantityOverride - Override for fixed services
 * @returns Calculated quantity
 */
function calculateQuantity(
  unit: ServiceUnit,
  dimensions: Dimensions,
  quantityOverride?: number,
): number {
  switch (unit) {
    case ServiceUnit.UNIT:
      return calculateFixedQuantity(quantityOverride)
    case ServiceUnit.SQM:
      return calculateAreaQuantity(dimensions)
    case ServiceUnit.ML:
      return calculatePerimeterQuantity(dimensions)
    default:
      // This should never happen with proper types, but TypeScript requires it
      throw new Error(`Unknown service unit: ${unit}`)
  }
}

/**
 * Calculate service amount with quantity and rate
 *
 * Orchestrates the full service calculation:
 * 1. Calculate quantity based on unit type
 * 2. Apply minimum billing unit (if specified)
 * 3. Calculate amount (rate × quantity)
 *
 * @param service - Service configuration
 * @param dimensions - Glass dimensions
 * @returns Service result with quantity and amount
 */
function calculateServiceAmount(
  service: ServiceAmountInput,
  dimensions: Dimensions,
): ServiceResult {
  const { serviceId, name, unit, rate, minimumBillingUnit, quantityOverride } = service

  // Calculate base quantity
  let quantity = calculateQuantity(unit, dimensions, quantityOverride)

  // Apply minimum billing unit
  quantity = applyMinimumBillingUnit(quantity, minimumBillingUnit)

  // Calculate amount (rate × quantity)
  const amount = rate.multiply(quantity)

  return {
    serviceId,
    name,
    unit,
    quantity,
    amount: amount.toNumber(), // Convert Money to number for result
  }
}

/**
 * ServiceCalculator - Pure functions for service cost calculations
 *
 * Provides methods to calculate service costs based on unit type:
 * - Fixed (UNIT): Quantity = 1 or override
 * - Area (SQM): Quantity = area in m²
 * - Perimeter (ML): Quantity = perimeter in linear meters
 *
 * All functions are pure (no side effects) and use Money value objects.
 *
 * Key concepts:
 * - Minimum billing units (e.g., minimum 2m²)
 * - Quantity rounding (2 decimals for area/perimeter, 4 for fixed)
 * - Services are NOT affected by color surcharge
 * - Services are added AFTER margin calculation
 */
export const ServiceCalculator = {
  calculateFixedQuantity,
  calculateAreaQuantity,
  calculatePerimeterQuantity,
  applyMinimumBillingUnit,
  calculateServiceAmount,
} as const
