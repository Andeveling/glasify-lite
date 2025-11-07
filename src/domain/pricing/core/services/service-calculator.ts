import Decimal from "decimal.js";
import { SERVICE_QUANTITY_SCALE } from "../constants";
import type { Dimensions } from "../entities/dimensions";
import type { Money } from "../entities/money";
import { type ServiceResult, ServiceUnit } from "../types";

/**
 * Input for service amount calculation
 */
export type ServiceAmountInput = {
  /** Unique service identifier */
  serviceId: string;
  /** Service name */
  name: string;
  /** Unit type for quantity calculation */
  unit: ServiceUnit;
  /** Rate per unit */
  rate: Money;
  /** Minimum billing unit (optional) */
  minimumBillingUnit?: number;
  /** Override quantity for fixed services (optional) */
  quantityOverride?: number;
};

/**
 * Calculate fixed service quantity
 *
 * Fixed services default to quantity of 1, but can be overridden
 * (e.g., 10 screws, 4 hinges).
 *
 * @param quantityOverride - Override quantity (optional)
 * @returns Fixed quantity (1 or override value)
 */
function calculateFixedQuantity(quantityOverride?: number): number {
  return quantityOverride ?? 1;
}

/**
 * Calculate area quantity in square meters
 *
 * Converts dimensions from mm to m and calculates area.
 * Rounds to SERVICE_QUANTITY_SCALE (2 decimals).
 *
 * Formula:
 * area = (widthMm / 1000) × (heightMm / 1000) m²
 *
 * @param dimensions - Glass dimensions
 * @returns Area in m² (rounded to 2 decimals)
 */
function calculateAreaQuantity(dimensions: Dimensions): number {
  const meters = dimensions.toMeters();
  const area = meters.widthM * meters.heightM;

  // Round to 2 decimals
  return new Decimal(area)
    .toDecimalPlaces(SERVICE_QUANTITY_SCALE, Decimal.ROUND_HALF_UP)
    .toNumber();
}

/**
 * Calculate perimeter quantity in linear meters
 *
 * Formula:
 * perimeter = 2 × (width + height) ml
 *
 * Rounds to SERVICE_QUANTITY_SCALE (2 decimals).
 *
 * @param dimensions - Glass dimensions
 * @returns Perimeter in linear meters (rounded to 2 decimals)
 */
function calculatePerimeterQuantity(dimensions: Dimensions): number {
  const meters = dimensions.toMeters();
  const perimeter = 2 * (meters.widthM + meters.heightM);

  // Round to 2 decimals
  return new Decimal(perimeter)
    .toDecimalPlaces(SERVICE_QUANTITY_SCALE, Decimal.ROUND_HALF_UP)
    .toNumber();
}

/**
 * Apply minimum billing unit to quantity
 *
 * If quantity is below minimum, bill at minimum instead.
 * This is common for area and perimeter services (e.g., minimum 2m²).
 *
 * @param quantity - Calculated quantity
 * @param minimumBillingUnit - Minimum quantity to bill (optional)
 * @returns Quantity or minimum (whichever is greater)
 */
function applyMinimumBillingUnit(
  quantity: number,
  minimumBillingUnit?: number
): number {
  if (minimumBillingUnit === undefined || minimumBillingUnit === 0) {
    return quantity;
  }
  return Math.max(quantity, minimumBillingUnit);
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
  quantityOverride?: number
): number {
  switch (unit) {
    case ServiceUnit.UNIT:
      return calculateFixedQuantity(quantityOverride);
    case ServiceUnit.SQM:
      return calculateAreaQuantity(dimensions);
    case ServiceUnit.ML:
      return calculatePerimeterQuantity(dimensions);
    default:
      // This should never happen with proper types, but TypeScript requires it
      throw new Error(`Unknown service unit: ${unit}`);
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
  dimensions: Dimensions
): ServiceResult {
  const { serviceId, name, unit, rate, minimumBillingUnit, quantityOverride } =
    service;

  // Calculate base quantity
  let quantity = calculateQuantity(unit, dimensions, quantityOverride);

  // Apply minimum billing unit
  quantity = applyMinimumBillingUnit(quantity, minimumBillingUnit);

  // Calculate amount (rate × quantity)
  const amount = rate.multiply(quantity);

  return {
    serviceId,
    name,
    unit,
    quantity,
    amount: amount.toNumber(), // Convert Money to number for result
  };
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
} as const;
