/**
 * Quote Container - Dependency Injection
 *
 * Provee las dependencias concretas para los use-cases de quotes.
 * Actúa como fábrica que ensambla las implementaciones de Prisma
 * con los use-cases agnósticos de framework.
 *
 * Este módulo ES la única parte que conoce tanto Prisma como los use-cases.
 */

import { Dimensions } from '@domain/pricing/core/entities/dimensions'
import { Money } from '@domain/pricing/core/entities/money'
import type { PriceCalculationResult } from '@domain/pricing/core/entities/price-calculation'
import type { ServiceUnit } from '@domain/pricing/core/types'
import { CalculateItemPrice } from '@domain/pricing/use-cases/calculate-item-price'
import type { PrismaClient } from '@prisma/generated/client'
import {
  getQuoteValidityDays,
  getTenantConfigSelect,
  getTenantCurrency,
} from '@/server/utils/tenant'

import type { AddItemToQuoteDeps } from '../use-cases/add-item-to-quote'
import type { CalculateItemPriceDeps } from '../use-cases/calculate-item-price'
import type { CalculatePriceWithColorDeps } from '../use-cases/calculate-price-with-color'
import type { GetQuoteByIdDeps } from '../use-cases/get-quote-by-id'
import type { ListUserQuotesDeps, QuoteListFilters } from '../use-cases/list-user-quotes'
import type { SendQuoteToVendorDeps } from '../use-cases/send-quote-to-vendor'

// =============================================================================
// Internal Price Adaptation Functions (formerly in @/server/api/routers/quote/price-adapter)
// =============================================================================
// These functions transform between tRPC/Prisma formats and domain format.
// Kept internal to this module to avoid circular dependencies with the server layer.

const PERCENTAGE_DIVISOR = 100
const BASE_MULTIPLIER = 1.0

// Type for the input that CalculateItemPrice.execute expects
type DomainPriceInput = Parameters<typeof CalculateItemPrice.execute>[0]

// Type for tRPC-style input used in the container
type TrpcPriceInput = {
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
 * Transform tRPC input to domain PriceCalculationInput
 */
function adaptTRPCToDomain(input: TrpcPriceInput): DomainPriceInput {
  const dimensions = new Dimensions({
    widthMm: input.widthMm,
    heightMm: input.heightMm,
    minWidthMm: input.modelPrices.minWidthMm,
    minHeightMm: input.modelPrices.minHeightMm,
  })

  const modelPrices = {
    basePrice: new Money(input.modelPrices.basePrice),
    costPerMmWidth: new Money(input.modelPrices.costPerMmWidth),
    costPerMmHeight: new Money(input.modelPrices.costPerMmHeight),
    accessoryPrice: input.modelPrices.accessoryPrice
      ? new Money(input.modelPrices.accessoryPrice)
      : undefined,
  }

  const colorMultiplier = input.colorSurchargePercentage
    ? BASE_MULTIPLIER + input.colorSurchargePercentage / PERCENTAGE_DIVISOR
    : BASE_MULTIPLIER

  const glass = input.glass
    ? {
        pricePerSqm: new Money(input.glass.pricePerSqm),
        discountWidthMm: input.glass.discountWidthMm,
        discountHeightMm: input.glass.discountHeightMm,
      }
    : undefined

  const services = input.services?.map((s) => ({
    serviceId: s.serviceId,
    name: s.name,
    unit: s.unit as ServiceUnit,
    rate: new Money(s.rate),
    minimumBillingUnit: s.minimumBillingUnit,
    quantityOverride: s.quantityOverride,
  }))

  const adjustments = input.adjustments?.map((adj) => ({
    adjustmentId: adj.adjustmentId,
    concept: adj.concept,
    unit: adj.unit as ServiceUnit,
    value: adj.value,
    isPositive: adj.sign === 'positive',
  }))

  return {
    dimensions,
    modelPrices,
    colorMultiplier,
    profitMarginPercentage: input.profitMarginPercentage,
    glass,
    services,
    adjustments,
  }
}

/**
 * Transform domain result to tRPC output format
 */
function adaptDomainToTRPC(
  result: PriceCalculationResult,
  colorSurchargePercentage?: number,
): {
  dimPrice: number
  accPrice: number
  colorSurchargePercentage?: number
  colorSurchargeAmount?: number
  services: Array<{
    serviceId: string
    unit: ServiceUnit
    quantity: number
    amount: number
  }>
  adjustments: Array<{ concept: string; amount: number }>
  subtotal: number
} {
  const dimPrice = result.profileCost.add(result.glassCost).toNumber()

  const services = result.services.map((svc) => ({
    serviceId: svc.serviceId,
    unit: svc.unit,
    quantity: svc.quantity,
    amount: svc.amount,
  }))

  const adjustments = result.adjustments.map((adj) => ({
    concept: adj.concept,
    amount: adj.amount,
  }))

  const output: {
    dimPrice: number
    accPrice: number
    colorSurchargePercentage?: number
    colorSurchargeAmount?: number
    services: Array<{
      serviceId: string
      unit: ServiceUnit
      quantity: number
      amount: number
    }>
    adjustments: Array<{ concept: string; amount: number }>
    subtotal: number
  } = {
    dimPrice,
    accPrice: result.accessoryCost.toNumber(),
    services,
    adjustments,
    subtotal: result.subtotal.toNumber(),
  }

  if (colorSurchargePercentage !== undefined && colorSurchargePercentage > 0) {
    output.colorSurchargePercentage = colorSurchargePercentage
    const multiplier = BASE_MULTIPLIER + colorSurchargePercentage / PERCENTAGE_DIVISOR
    const profilePlusAccessory = result.profileCost.add(result.accessoryCost)
    const surchargeMultiplier = 1 - 1 / multiplier
    const surchargeAmount = profilePlusAccessory.multiply(surchargeMultiplier)
    output.colorSurchargeAmount = surchargeAmount.toNumber()
  }

  return output
}

/**
 * Crea las dependencias para AddItemToQuote use-case
 */
export function createAddItemToQuoteDeps(db: PrismaClient): AddItemToQuoteDeps {
  return {
    findModel: (id) =>
      db.model.findUnique({
        where: { id },
        include: { profileSupplier: true },
      }),

    findGlassType: (id) =>
      db.glassType.findUnique({
        where: { id },
      }),

    findServices: (ids) =>
      db.service.findMany({
        where: { id: { in: ids } },
      }),

    findQuote: (id) =>
      db.quote.findUnique({
        where: { id },
      }),

    createQuote: async (input) =>
      db.quote.create({
        data: {
          currency: input.currency,
          status: 'draft',
          validUntil: input.validUntil,
        },
      }),

    createQuoteItem: (input) =>
      db.quoteItem.create({
        data: {
          quoteId: input.quoteId,
          modelId: input.modelId,
          glassTypeId: input.glassTypeId,
          widthMm: input.widthMm,
          heightMm: input.heightMm,
          quantity: input.quantity,
          subtotal: input.subtotal,
          roomLocation: input.roomLocation,
          name: `Item ${input.modelId}`,
          accessoryApplied: false,
        },
      }),

    updateQuoteTotal: (quoteId, total) =>
      db.quote.update({
        where: { id: quoteId },
        data: { total },
      }),

    listQuoteItems: (quoteId) =>
      db.quoteItem.findMany({
        where: { quoteId },
        orderBy: { createdAt: 'asc' },
      }),

    getTenantCurrency: () => getTenantCurrency(db),
    getQuoteValidityDays: () => getQuoteValidityDays(db),

    calculatePrice: (input) => {
      const adapterInput = {
        widthMm: input.widthMm,
        heightMm: input.heightMm,
        modelPrices: {
          basePrice: input.model.basePrice.toNumber(),
          costPerMmWidth: input.model.costPerMmWidth.toNumber(),
          costPerMmHeight: input.model.costPerMmHeight.toNumber(),
          minWidthMm: input.model.minWidthMm,
          minHeightMm: input.model.minHeightMm,
          accessoryPrice: input.model.accessoryPrice?.toNumber(),
        },
        colorSurchargePercentage: input.colorSurchargePercentage,
        glass: {
          pricePerSqm: input.glassType.pricePerSqm.toNumber(),
          discountWidthMm: input.model.glassDiscountWidthMm ?? undefined,
          discountHeightMm: input.model.glassDiscountHeightMm ?? undefined,
        },
        services: input.services.map((s) => ({
          serviceId: s.id,
          name: s.name,
          unit: s.unit as 'unit' | 'sqm' | 'ml',
          rate: s.rate.toNumber(),
          minimumBillingUnit: s.minimumBillingUnit?.toNumber(),
        })),
        adjustments: input.adjustments.map((adj) => ({
          adjustmentId: `adj-${performance.now()}-${Math.random()}`,
          concept: adj.concept,
          unit: adj.unit,
          value: adj.value,
          sign: adj.sign,
        })),
      }

      const domainInput = adaptTRPCToDomain(adapterInput)
      const domainResult = CalculateItemPrice.execute(domainInput)
      const result = adaptDomainToTRPC(domainResult, input.colorSurchargePercentage)

      return {
        subtotal: result.subtotal,
        profilePrice: result.dimPrice,
        glassPrice: 0, // Incluido en dimPrice
        accPrice: result.accPrice,
        servicesTotal: result.services.reduce((sum, s) => sum + s.amount, 0),
      }
    },
  }
}

/**
 * Crea las dependencias para CalculateItemPrice use-case
 */
export function createCalculateItemPriceDeps(db: PrismaClient): CalculateItemPriceDeps {
  return {
    findModel: (id) =>
      db.model.findUnique({
        where: { id },
        include: { profileSupplier: true },
      }),

    findGlassType: (id) =>
      db.glassType.findUnique({
        where: { id },
      }),

    findServices: (ids) =>
      db.service.findMany({
        where: { id: { in: ids } },
      }),

    calculatePrice: (input) => {
      const domainInput = adaptTRPCToDomain(input)
      const domainResult = CalculateItemPrice.execute(domainInput)
      return adaptDomainToTRPC(domainResult, input.colorSurchargePercentage)
    },
  }
}

/**
 * Crea las dependencias para GetQuoteById use-case
 */
export function createGetQuoteByIdDeps(db: PrismaClient): GetQuoteByIdDeps {
  return {
    findQuoteWithDetails: (id) =>
      db.quote.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              glassType: {
                select: { id: true, name: true },
              },
              model: {
                select: { id: true, name: true, imageUrl: true },
              },
              services: {
                include: {
                  service: {
                    select: { id: true, name: true },
                  },
                },
              },
            },
          },
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),

    getTenantBusinessName: async () => {
      const tenant = await getTenantConfigSelect({ businessName: true }, db)
      return tenant.businessName
    },

    getTenantContactPhone: async () => {
      const tenant = await getTenantConfigSelect({ contactPhone: true }, db)
      return tenant.contactPhone
    },
  }
}

/**
 * Crea las dependencias para ListUserQuotes use-case
 */
export function createListUserQuotesDeps(db: PrismaClient): ListUserQuotesDeps {
  return {
    listQuotes: async (filters: QuoteListFilters) => {
      const skip = (filters.page - 1) * filters.limit

      // Build where clause
      type WhereInput = {
        userId?: string
        status?: typeof filters.status
        AND?: Record<string, unknown>[]
      }

      const where: WhereInput = {
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.status && { status: filters.status }),
      }

      const andConditions: Record<string, unknown>[] = []

      // Filter expired quotes if not including them
      if (!filters.includeExpired) {
        andConditions.push({
          OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
        })
      }

      // Search filter
      if (filters.search) {
        andConditions.push({
          OR: [
            { projectName: { contains: filters.search, mode: 'insensitive' } },
            {
              projectStreet: { contains: filters.search, mode: 'insensitive' },
            },
            {
              items: {
                some: {
                  name: { contains: filters.search, mode: 'insensitive' },
                },
              },
            },
          ],
        })
      }

      if (andConditions.length > 0) {
        where.AND = andConditions
      }

      const [quotes, total] = await Promise.all([
        db.quote.findMany({
          where,
          include: {
            _count: { select: { items: true } },
          },
          orderBy: { [filters.sortBy]: filters.sortOrder },
          skip,
          take: filters.limit,
        }),
        db.quote.count({ where }),
      ])

      return {
        quotes: quotes.map((q) => ({
          id: q.id,
          status: q.status,
          currency: q.currency,
          total: Number(q.total),
          createdAt: q.createdAt,
          sentAt: q.sentAt,
          validUntil: q.validUntil,
          projectName: q.projectName,
          itemCount: q._count.items,
        })),
        total,
      }
    },
  }
}

/**
 * Crea las dependencias para SendQuoteToVendor use-case
 */
export function createSendQuoteToVendorDeps(db: PrismaClient): SendQuoteToVendorDeps {
  return {
    findQuoteWithItemCount: async (id) => {
      const quote = await db.quote.findUnique({
        where: { id },
        include: {
          _count: { select: { items: true } },
        },
      })

      if (!quote) {
        return null
      }

      return {
        ...quote,
        itemCount: quote._count.items,
      }
    },

    updateQuoteToSent: async (id, contactPhone, sentAt) => {
      const updated = await db.quote.update({
        where: { id },
        data: {
          status: 'sent',
          sentAt,
          contactPhone,
        },
        select: {
          id: true,
          status: true,
          sentAt: true,
          contactPhone: true,
          total: true,
          currency: true,
        },
      })

      return {
        ...updated,
        total: Number(updated.total),
      }
    },
  }
}

/**
 * Crea las dependencias para CalculatePriceWithColor use-case
 */
export function createCalculatePriceWithColorDeps(db: PrismaClient): CalculatePriceWithColorDeps {
  return {
    findModel: (id) =>
      db.model.findUnique({
        where: { id },
        include: { profileSupplier: true },
      }),

    findGlassType: (id) =>
      db.glassType.findUnique({
        where: { id },
      }),

    findServices: (ids) =>
      db.service.findMany({
        where: { id: { in: ids } },
      }),

    findModelColor: async (modelId, colorId) => {
      const modelColor = await db.modelColor.findFirst({
        where: {
          modelId,
          colorId,
        },
        include: {
          color: true,
        },
      })

      if (!modelColor) {
        return null
      }

      return {
        surchargePercentage: modelColor.surchargePercentage.toNumber(),
        color: {
          id: modelColor.color.id,
          name: modelColor.color.name,
          hexCode: modelColor.color.hexCode,
          isActive: modelColor.color.isActive,
        },
      }
    },

    calculatePrice: (input) => {
      const domainInput = adaptTRPCToDomain(input)
      const domainResult = CalculateItemPrice.execute(domainInput)
      return adaptDomainToTRPC(domainResult)
    },
  }
}

/**
 * Crea las dependencias para AddItemWithColor use-case (placeholder)
 * TODO Phase D: Implementar después de extender QuoteRepository
 */
export function createAddItemWithColorDeps(
  _db: PrismaClient,
  // biome-ignore lint/suspicious/noExplicitAny: placeholder implementation
): any {
  throw new Error(
    'createAddItemWithColorDeps: En desarrollo (Phase D) - extender QuoteRepository primero',
  )
}

/**
 * Crea las dependencias para GetModelColorsForQuote use-case
 * NOTE: Temporary direct implementation until QuoteRepository is extended in Phase D
 */
export function createGetModelColorsForQuoteDeps(db: PrismaClient) {
  return {
    quoteRepository: {
      findModelColorsByModelId: async (modelId: string) => {
        const modelColors = await db.modelColor.findMany({
          where: {
            modelId,
            color: {
              isActive: true,
            },
          },
          include: {
            color: true,
          },
          orderBy: [{ isDefault: 'desc' }, { color: { name: 'asc' } }],
        })

        return modelColors.map((mc) => ({
          id: mc.id,
          isDefault: mc.isDefault,
          surchargePercentage: mc.surchargePercentage.toNumber(),
          color: {
            id: mc.color.id,
            name: mc.color.name,
            hexCode: mc.color.hexCode,
            ralCode: mc.color.ralCode,
          },
        }))
      },
    },
  }
}
