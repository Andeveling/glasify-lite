import type { GlassType, Model, Service } from '@prisma/generated/client'

import type { CalculateItemPriceOutput } from '../use-cases/calculate-item-price'

/**
 * TrpcPriceInput — shared adapter input type.
 * All price calculation use-cases accept this shape.
 */
export type TrpcPriceInput = {
  widthMm: number
  heightMm: number
  modelPrices: {
    basePrice: number
    costPerMmWidth: number
    costPerMmHeight: number
    minWidthMm: number
    minHeightMm: number
    accessoryPrice?: number
  }
  colorSurchargePercentage?: number
  profitMarginPercentage?: number
  glass?: {
    pricePerSqm: number
    discountWidthMm?: number
    discountHeightMm?: number
  }
  services?: Array<{
    serviceId: string
    name: string
    unit: 'unit' | 'sqm' | 'ml'
    rate: number
    minimumBillingUnit?: number
    quantityOverride?: number
  }>
  adjustments?: Array<{
    adjustmentId: string
    concept: string
    unit: 'unit' | 'sqm' | 'ml'
    value: number
    sign: 'positive' | 'negative'
  }>
}

/**
 * Price calculation result shape that all use-cases expect.
 */
export type PriceCalculationResult = {
  dimPrice: number
  accPrice: number
  colorSurchargePercentage?: number
  colorSurchargeAmount?: number
  services: Array<{
    serviceId: string
    unit: 'unit' | 'sqm' | 'ml'
    quantity: number
    amount: number
  }>
  adjustments: Array<{ concept: string; amount: number }>
  subtotal: number
}

/**
 * PriceCalculatorFn — signature for the price calculation adapter.
 */
export type PriceCalculatorFn = (input: TrpcPriceInput) => PriceCalculationResult

/**
 * ModelWithProfile — Model type optionally including profileSupplier.
 */
export type ModelWithProfile =
  | (Model & { profileSupplier?: { id: string; name: string } | null })
  | null

/**
 * PricingRepo — unified repository interface for all pricing use-cases.
 *
 * Each use-case takes a subset of this via `Pick<>` to declare
 * exactly which dependencies it needs.
 */
export interface PricingRepo {
  findModel: (id: string) => Promise<ModelWithProfile>
  findGlassType: (id: string) => Promise<GlassType | null>
  findServices: (ids: string[]) => Promise<Service[]>
  calculatePrice: PriceCalculatorFn
}
