/**
 * CalculatePriceWithColorUseCase - Use Case
 *
 * Orquesta el cálculo de precio con recargo de color:
 * 1. Validar modelo y dimensiones
 * 2. Obtener datos de vidrio, servicios y color
 * 3. Calcular precio base
 * 4. Aplicar recargo de color al dimPrice
 *
 * Este use-case NO depende de Prisma directamente.
 * Usa repositories (ports) para acceso a datos.
 */

import type { GlassType, Model, Service } from '@prisma/generated/client'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'
import type { PriceCalculatorFn, PricingRepo, TrpcPriceInput } from '../ports/pricing-repo'
import {
  validateDimensions,
  validateGlassTypeCompatibility,
  validateModelAvailability,
} from '../services/quote-validator.service'

/**
 * Input para calcular precio con color
 */
export type CalculatePriceWithColorInput = {
  modelId: string
  glassTypeId: string
  widthMm: number
  heightMm: number
  quantity: number
  unit: 'unit' | 'sqm' | 'ml'
  services: Array<{
    serviceId: string
    quantity?: number
  }>
  adjustments: Array<{
    concept: string
    sign: 'positive' | 'negative'
    unit: 'unit' | 'sqm' | 'ml'
    value: number
  }>
  colorId?: string
}

/**
 * Service output en el breakdown
 */
type ServiceBreakdown = {
  serviceId: string
  unit: 'unit' | 'sqm' | 'ml'
  quantity: number
  amount: number
}

/**
 * Adjustment output en el breakdown
 */
type AdjustmentBreakdown = {
  concept: string
  amount: number
}

/**
 * Output del use-case
 */
export type CalculatePriceWithColorOutput = {
  basePrice: number
  colorSurcharge: number
  totalWithColor: number
  breakdown: {
    dimPrice: number
    accPrice: number
    color: number
    services: ServiceBreakdown[]
    adjustments: AdjustmentBreakdown[]
  }
}

/**
 * Color con surcharge
 */
type ModelColorWithData = {
  surchargePercentage: number
  color: {
    id: string
    name: string
    hexCode: string
    isActive: boolean
  }
}

/**
 * Dependencies (ports) que necesita el use-case
 */
export type CalculatePriceWithColorDeps = Pick<
  PricingRepo,
  'findModel' | 'findGlassType' | 'findServices'
> & {
  findModelColor: (modelId: string, colorId: string) => Promise<ModelColorWithData | null>
  calculatePrice: (input: TrpcPriceInput) => {
    dimPrice: number
    accPrice: number
    services: ServiceBreakdown[]
    adjustments: AdjustmentBreakdown[]
    subtotal: number
  }
}

/**
 * Divisor para porcentajes
 */
const PERCENTAGE_DIVISOR = 100

/**
 * CalculatePriceWithColorUseCase
 *
 * Esta función NO tiene efectos secundarios directos.
 * Todas las operaciones de I/O se pasan como dependencies.
 */
export async function calculatePriceWithColorUseCase(
  input: CalculatePriceWithColorInput,
  deps: CalculatePriceWithColorDeps,
): Promise<CalculatePriceWithColorOutput> {
  const eitherContext = await pipe(
    TE.Do,
    TE.bind('model', () =>
      pipe(
        TE.tryCatch(
          () => deps.findModel(input.modelId),
          () => new Error('Error fetching model'),
        ),
        TE.chain((model) =>
          pipe(
            O.fromNullable(model),
            O.fold(
              () => TE.left(new Error('Modelo no encontrado')),
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
    TE.bind('glassType', () =>
      pipe(
        TE.tryCatch(
          () => deps.findGlassType(input.glassTypeId),
          () => new Error('Error fetching glass type'),
        ),
        TE.chain((glassType) =>
          pipe(
            O.fromNullable(glassType),
            O.fold(
              () => TE.left(new Error('Tipo de vidrio no encontrado')),
              (g: GlassType) => TE.right(g),
            ),
          ),
        ),
      ),
    ),
    TE.bind('services', () => {
      const serviceIds = input.services.map((s) => s.serviceId)
      if (serviceIds.length === 0) {
        return TE.right([])
      }
      return pipe(
        TE.tryCatch(
          () => deps.findServices(serviceIds),
          () => new Error('Error fetching services'),
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
      unit: service.unit as 'unit' | 'sqm' | 'ml',
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

  const calculation = deps.calculatePrice({
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
    colorSurchargePercentage: 0,
    glass: {
      pricePerSqm: glassType.pricePerSqm.toNumber(),
      discountWidthMm: model.glassDiscountWidthMm ?? undefined,
      discountHeightMm: model.glassDiscountHeightMm ?? undefined,
    },
    services: domainServices,
    adjustments: domainAdjustments,
  })

  let colorSurcharge = 0
  let colorSurchargePercentage = 0

  if (input.colorId) {
    const modelColor = await deps.findModelColor(input.modelId, input.colorId)

    if (!modelColor) {
      throw new Error('Color no asignado a este modelo')
    }

    if (!modelColor.color.isActive) {
      throw new Error('Color no disponible')
    }

    colorSurchargePercentage = modelColor.surchargePercentage
    colorSurcharge = calculation.dimPrice * (colorSurchargePercentage / 100)
  }

  const totalWithColor = calculation.subtotal + colorSurcharge

  return {
    basePrice: calculation.subtotal,
    colorSurcharge,
    totalWithColor,
    breakdown: {
      dimPrice: calculation.dimPrice,
      accPrice: calculation.accPrice,
      color: colorSurcharge,
      services: calculation.services,
      adjustments: calculation.adjustments,
    },
  }
}
