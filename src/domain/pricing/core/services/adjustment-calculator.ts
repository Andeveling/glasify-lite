/**
 * AdjustmentCalculator
 *
 * Calculates adjustment amounts (positive or negative) based on unit and
 * provided per-unit value. Reuses ServiceCalculator quantity logic for
 * area/perimeter/unit calculations to keep behaviour consistent.
 */
import Decimal from "decimal.js"
import { ROUND_MODE, ROUND_SCALE } from "../constants"
import type { Dimensions } from "../entities/dimensions"
import type { AdjustmentInput, AdjustmentResult } from "../types"
import { ServiceUnit } from "../types"
import {
  calculateAreaQuantity,
  calculateFixedQuantity,
  calculatePerimeterQuantity,
} from "./quantity-calculations"

/**
 * Calculate a single adjustment amount
 */
export function calculateAdjustmentAmount(
  adjustment: AdjustmentInput,
  dimensions: Dimensions,
): AdjustmentResult {
  const { adjustmentId, concept, unit, value, isPositive } = adjustment

  // Determine quantity using existing service quantity logic
  let quantity: number
  switch (unit) {
    case ServiceUnit.UNIT:
      quantity = calculateFixedQuantity()
      break
    case ServiceUnit.SQM:
      quantity = calculateAreaQuantity(dimensions)
      break
    case ServiceUnit.ML:
      quantity = calculatePerimeterQuantity(dimensions)
      break
    default:
      quantity = 1
  }

  const raw = new Decimal(value ?? 0).times(new Decimal(quantity))
  const signed = isPositive ? raw : raw.negated()

  const rounded = signed.toDecimalPlaces(ROUND_SCALE, ROUND_MODE).toNumber()

  return {
    adjustmentId,
    concept,
    amount: rounded,
  }
}

/**
 * Calculate multiple adjustments
 */
export function calculateAdjustments(
  adjustments: AdjustmentInput[] | undefined,
  dimensions: Dimensions,
): AdjustmentResult[] {
  if (!adjustments || adjustments.length === 0) {
    return []
  }

  return adjustments.map((a) => calculateAdjustmentAmount(a, dimensions))
}

export const AdjustmentCalculator = {
  calculateAdjustmentAmount,
  calculateAdjustments,
} as const
