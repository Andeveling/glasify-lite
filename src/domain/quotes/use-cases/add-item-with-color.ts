import { Dimensions } from "@domain/pricing/core/entities/dimensions"
import { Money } from "@domain/pricing/core/entities/money"
import type { PriceCalculationResult } from "@domain/pricing/core/entities/price-calculation"
import type { ServiceUnit } from "@domain/pricing/core/types"
import { CalculateItemPrice } from "@domain/pricing/use-cases/calculate-item-price"
import type { Model, PrismaClient, Service } from "@prisma/generated/client"

export type AddItemWithColorInput = {
  clientId: string
  quoteId?: string
  modelId: string
  glassTypeId: string
  widthMm: number
  heightMm: number
  quantity: number
  colorId?: string
  colorSurchargePercentage?: number
  roomLocation?: string
  services: Array<{
    serviceId: string
    quantity?: number
  }>
  adjustments: Array<{
    concept: string
    unit: "unit" | "sqm" | "ml"
    value: number
    sign: "positive" | "negative"
  }>
}

export type AddItemWithColorDependencies = {
  db: PrismaClient
}

export type AddItemWithColorResult = {
  itemId: string
  quoteId: string
  subtotal: number
}

function calculateItemPriceDomain(
  widthMm: number,
  heightMm: number,
  model: Model,
  colorSurchargePercentage: number | undefined,
  glassTypePricePerSqm: number,
  services: Service[],
  adjustments: AddItemWithColorInput["adjustments"],
): PriceCalculationResult {
  const dimensions = new Dimensions({
    widthMm,
    heightMm,
    minWidthMm: model.minWidthMm,
    minHeightMm: model.minHeightMm,
  })

  const modelPrices = {
    basePrice: new Money(model.basePrice.toNumber()),
    costPerMmWidth: new Money(model.costPerMmWidth.toNumber()),
    costPerMmHeight: new Money(model.costPerMmHeight.toNumber()),
    accessoryPrice: model.accessoryPrice ? new Money(model.accessoryPrice.toNumber()) : undefined,
  }

  const multiplier = 1 + (colorSurchargePercentage ?? 0) / 100

  const glass = {
    pricePerSqm: new Money(glassTypePricePerSqm),
    discountWidthMm: model.glassDiscountWidthMm ?? undefined,
    discountHeightMm: model.glassDiscountHeightMm ?? undefined,
  }

  const domainServices = services.map((s) => ({
    serviceId: s.id,
    name: s.name,
    unit: s.unit as ServiceUnit,
    rate: new Money(s.rate.toNumber()),
    minimumBillingUnit: s.minimumBillingUnit?.toNumber(),
  }))

  const domainAdjustments = adjustments.map((adj, i) => ({
    adjustmentId: `adj-${i}`,
    concept: adj.concept,
    unit: adj.unit as ServiceUnit,
    value: adj.value,
    isPositive: adj.sign === "positive",
  }))

  return CalculateItemPrice.execute({
    dimensions,
    modelPrices,
    colorMultiplier: multiplier,
    profitMarginPercentage: model.profitMarginPercentage?.toNumber() ?? 0,
    glass,
    services: domainServices,
    adjustments: domainAdjustments,
  })
}

export async function addItemWithColorUseCase(
  input: AddItemWithColorInput,
  deps: AddItemWithColorDependencies,
): Promise<AddItemWithColorResult> {
  const { db } = deps

  const model = await db.model.findUnique({
    where: { id: input.modelId },
  })

  if (!model) {
    throw new Error("Modelo no encontrado")
  }

  let colorSnapshot: {
    colorId: string | null
    colorHexCode: string | null
    colorName: string | null
    colorSurchargePercentage: number
  } = {
    colorId: null,
    colorHexCode: null,
    colorName: null,
    colorSurchargePercentage: 0,
  }

  if (input.colorId) {
    const modelColor = await db.modelColor.findFirst({
      where: {
        modelId: input.modelId,
        colorId: input.colorId,
      },
      include: {
        color: true,
      },
    })

    if (modelColor) {
      const surchargePercentage = modelColor.surchargePercentage.toNumber()
      colorSnapshot = {
        colorId: input.colorId,
        colorHexCode: modelColor.color.hexCode,
        colorName: modelColor.color.name,
        colorSurchargePercentage: surchargePercentage,
      }
    }
  }

  const effectiveSurchargePercentage =
    input.colorSurchargePercentage ?? colorSnapshot.colorSurchargePercentage

  const result = await db.$transaction(async (tx) => {
    let quoteId: string

    if (input.quoteId) {
      const existingQuote = await tx.quote.findUnique({
        where: { id: input.quoteId },
      })

      if (!existingQuote) {
        throw new Error("Cotización no encontrada")
      }

      if (existingQuote.status !== "draft") {
        throw new Error("Solo se pueden agregar ítems a cotizaciones en estado borrador")
      }

      quoteId = existingQuote.id
    } else {
      const tenant = await tx.tenantConfig.findFirst({})
      const currency = tenant?.currency ?? "COP"
      const validityDays = tenant?.quoteValidityDays ?? 15

      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + validityDays)

      const newQuote = await tx.quote.create({
        data: {
          clientId: input.clientId,
          currency,
          status: "draft",
          validUntil,
        },
      })

      quoteId = newQuote.id
    }

    const glassType = await tx.glassType.findUnique({
      where: { id: input.glassTypeId },
    })

    if (!glassType) {
      throw new Error("Tipo de vidrio no encontrado")
    }

    const services: Service[] = []
    if (input.services.length > 0) {
      const serviceIds = input.services.map((s) => s.serviceId)
      const foundServices = await tx.service.findMany({
        where: { id: { in: serviceIds } },
      })
      services.push(...foundServices)
    }

    const calculation = calculateItemPriceDomain(
      input.widthMm,
      input.heightMm,
      model,
      effectiveSurchargePercentage,
      glassType.pricePerSqm.toNumber(),
      services,
      input.adjustments,
    )

    const subtotal = calculation.subtotal.toNumber()

    const quoteItem = await tx.quoteItem.create({
      data: {
        quoteId,
        modelId: input.modelId,
        glassTypeId: input.glassTypeId,
        widthMm: input.widthMm,
        heightMm: input.heightMm,
        quantity: input.quantity,
        subtotal,
        roomLocation: input.roomLocation ?? null,
        name: `Item ${model.name}`,
        accessoryApplied: false,
        colorId: colorSnapshot.colorId,
        colorHexCode: colorSnapshot.colorHexCode,
        colorName: colorSnapshot.colorName,
        colorSurchargePercentage: colorSnapshot.colorSurchargePercentage,
      },
    })

    for (const serviceInput of input.services) {
      const service = services.find((s) => s.id === serviceInput.serviceId)
      if (service) {
        const quantity = serviceInput.quantity ?? 1
        const amount = service.rate.toNumber() * quantity

        await tx.quoteItemService.create({
          data: {
            quoteItemId: quoteItem.id,
            serviceId: service.id,
            unit: service.unit,
            quantity,
            amount,
          },
        })
      }
    }

    const allItems = await tx.quoteItem.findMany({
      where: { quoteId },
    })

    const newTotal = allItems.reduce((acc, item) => acc + Number(item.subtotal), 0)

    await tx.quote.update({
      where: { id: quoteId },
      data: { total: newTotal },
    })

    return {
      itemId: quoteItem.id,
      quoteId,
      subtotal,
    }
  })

  return result
}
