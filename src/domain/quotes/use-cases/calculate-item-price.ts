/**
 * CalculateItemPriceUseCase - Use Case
 *
 * Orquesta el cálculo de precio de un ítem para cotización:
 * 1. Validar modelo y dimensiones
 * 2. Obtener datos de vidrio y servicios
 * 3. Calcular precio usando el dominio pricing
 *
 * Este use-case NO depende de Prisma directamente.
 * Usa repositories (ports) para acceso a datos.
 */

import type { GlassType } from "@prisma/generated/client"
import * as E from "fp-ts/Either"
import { pipe } from "fp-ts/function"
import * as O from "fp-ts/Option"
import * as TE from "fp-ts/TaskEither"
import type { PriceCalculatorFn, PricingRepo } from "../ports/pricing-repo"
import {
  validateColorSurcharge,
  validateDimensions,
  validateGlassTypeCompatibility,
  validateModelAvailability,
  validateQuantity,
} from "../services/quote-validator.service"

/**
 * Input para calcular precio de un ítem
 */
export type CalculateItemPriceInput = {
  modelId: string
  glassTypeId: string
  widthMm: number
  heightMm: number
  quantity: number
  unit: "unit" | "sqm" | "ml"
  services: Array<{
    serviceId: string
    quantity?: number
  }>
  adjustments: Array<{
    concept: string
    sign: "positive" | "negative"
    unit: "unit" | "sqm" | "ml"
    value: number
  }>
  colorSurchargePercentage?: number
}

/**
 * Output del cálculo de precio
 */
export type CalculateItemPriceOutput = {
  dimPrice: number
  accPrice: number
  colorSurchargePercentage?: number
  colorSurchargeAmount?: number
  services: Array<{
    serviceId: string
    unit: "unit" | "sqm" | "ml"
    quantity: number
    amount: number
  }>
  adjustments: Array<{
    concept: string
    amount: number
  }>
  subtotal: number
}

/**
 * Dependencies (ports) que necesita el use-case
 */
export type CalculateItemPriceDeps = Pick<
  PricingRepo,
  "findModel" | "findGlassType" | "findServices"
> & {
  calculatePrice: PriceCalculatorFn
}

/**
 * CalculateItemPriceUseCase
 *
 * Esta función NO tiene efectos secundarios directos.
 * Todas las operaciones de I/O se pasan como dependencies.
 * Esto la hace 100% testeable sin mocks complejos.
 */
export async function calculateItemPriceUseCase(
  input: CalculateItemPriceInput,
  deps: CalculateItemPriceDeps,
): Promise<CalculateItemPriceOutput> {
  validateQuantity(input.quantity)
  validateColorSurcharge(input.colorSurchargePercentage)

  const eitherContext = await pipe(
    TE.Do,
    TE.bind("model", () =>
      pipe(
        TE.tryCatch(
          () => deps.findModel(input.modelId),
          () => new Error("Error fetching model"),
        ),
        TE.chain((model) =>
          pipe(
            O.fromNullable(model),
            O.fold(
              () => TE.left(new Error("Modelo no encontrado")),
              (m) => {
                validateModelAvailability(m)
                validateGlassTypeCompatibility(m, input.glassTypeId)
                validateDimensions(m, {
                  widthMm: input.widthMm,
                  heightMm: input.heightMm,
                })
                return TE.right(m)
              },
            ),
          ),
        ),
      ),
    ),
    TE.bind("glassType", () =>
      pipe(
        TE.tryCatch(
          () => deps.findGlassType(input.glassTypeId),
          () => new Error("Error fetching glass type"),
        ),
        TE.chain((glassType) =>
          pipe(
            O.fromNullable(glassType),
            O.fold(
              () => TE.left(new Error("Tipo de vidrio no encontrado")),
              (g: GlassType) => TE.right(g),
            ),
          ),
        ),
      ),
    ),
    TE.bind("services", () => {
      const serviceIds = input.services.map((s) => s.serviceId)
      if (serviceIds.length === 0) {
        return TE.right([])
      }
      return pipe(
        TE.tryCatch(
          () => deps.findServices(serviceIds),
          () => new Error("Error fetching services"),
        ),
        TE.chain((services) => {
          for (const serviceInput of input.services) {
            const service = services.find((s) => s.id === serviceInput.serviceId)
            if (!service) {
              return TE.left(new Error(`Servicio ${serviceInput.serviceId} no encontrado`))
            }
          }
          return TE.right(services)
        }),
      )
    }),
  )()

  const validatedContext = pipe(
    eitherContext,
    E.getOrElseW((err: Error) => {
      throw err
    }),
  )

  const domainServices = input.services.map((serviceInput) => {
    const service = validatedContext.services.find((s) => s.id === serviceInput.serviceId)!
    return {
      serviceId: service.id,
      name: service.name,
      unit: service.unit as "unit" | "sqm" | "ml",
      rate: service.rate.toNumber(),
      minimumBillingUnit: service.minimumBillingUnit?.toNumber(),
      quantityOverride: serviceInput.quantity,
    }
  })

  const domainAdjustments = input.adjustments.map((adj) => ({
    adjustmentId: `adj-${performance.now()}-${Math.random()}`,
    concept: adj.concept,
    unit: adj.unit,
    value: adj.value,
    sign: adj.sign,
  }))

  const { model, glassType } = validatedContext

  return deps.calculatePrice({
    widthMm: input.widthMm,
    heightMm: input.heightMm,
    modelPrices: {
      basePrice: model.basePrice.toNumber(),
      costPerMmWidth: model.costPerMmWidth.toNumber(),
      costPerMmHeight: model.costPerMmHeight.toNumber(),
      minWidthMm: model.minWidthMm,
      minHeightMm: model.minHeightMm,
      accessoryPrice: model.accessoryPrice?.toNumber(),
    },
    colorSurchargePercentage: input.colorSurchargePercentage,
    profitMarginPercentage: model.profitMarginPercentage?.toNumber(),
    glass: {
      pricePerSqm: glassType.pricePerSqm.toNumber(),
      discountWidthMm: model.glassDiscountWidthMm ?? undefined,
      discountHeightMm: model.glassDiscountHeightMm ?? undefined,
    },
    services: domainServices,
    adjustments: domainAdjustments,
  })
}
