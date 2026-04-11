import Decimal from 'decimal.js'
import { SERVICE_QUANTITY_SCALE } from '../constants'
import type { Dimensions } from '../entities/dimensions'

export function calculateFixedQuantity(quantityOverride?: number): number {
  return quantityOverride ?? 1
}

export function calculateAreaQuantity(dimensions: Dimensions): number {
  const meters = dimensions.toMeters()
  const area = meters.widthM * meters.heightM
  return new Decimal(area).toDecimalPlaces(SERVICE_QUANTITY_SCALE, Decimal.ROUND_HALF_UP).toNumber()
}

export function calculatePerimeterQuantity(dimensions: Dimensions): number {
  const meters = dimensions.toMeters()
  const perimeter = 2 * (meters.widthM + meters.heightM)
  return new Decimal(perimeter)
    .toDecimalPlaces(SERVICE_QUANTITY_SCALE, Decimal.ROUND_HALF_UP)
    .toNumber()
}

export function applyMinimumBillingUnit(quantity: number, minimumBillingUnit?: number): number {
  if (minimumBillingUnit === undefined || minimumBillingUnit === 0) {
    return quantity
  }
  return Math.max(quantity, minimumBillingUnit)
}
