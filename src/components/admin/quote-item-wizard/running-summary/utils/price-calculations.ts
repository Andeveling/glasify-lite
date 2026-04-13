import type {
  ColorData,
  GlassTypeData,
  ModelData,
  PriceBreakdown,
  ServiceData,
  WatchedFields,
} from "../types"

export function calculateAreaM2(widthMm: number, heightMm: number): number {
  return (widthMm * heightMm) / 1_000_000
}

export function calculateGlassPrice(
  glassTypeData: GlassTypeData | undefined,
  areaM2: number,
): number {
  return glassTypeData ? glassTypeData.pricePerSqm * areaM2 : 0
}

export function calculateColorSurcharge(
  colorData: ColorData | undefined,
  modelData: ModelData | undefined,
): number {
  return colorData && modelData ? (modelData.basePrice * colorData.surchargePercentage) / 100 : 0
}

export function calculateServicesTotal(selectedServices: ServiceData[]): number {
  return selectedServices.reduce((sum, s) => sum + s.rate, 0)
}

export function calculateSubtotalPerUnit(
  basePrice: number,
  glassPrice: number,
  colorSurcharge: number,
  servicesTotal: number,
): number {
  return basePrice + glassPrice + colorSurcharge + servicesTotal
}

export function calculateTotal(subtotalPerUnit: number, quantity: number): number {
  return subtotalPerUnit * (quantity ?? 1)
}

export function calculatePriceBreakdown(
  watchedFields: Pick<WatchedFields, "widthMm" | "heightMm" | "quantity">,
  modelData: ModelData | undefined,
  glassTypeData: GlassTypeData | undefined,
  colorData: ColorData | undefined,
  selectedServices: ServiceData[],
): PriceBreakdown {
  const { widthMm, heightMm, quantity } = watchedFields

  const areaM2 = calculateAreaM2(widthMm ?? 0, heightMm ?? 0)
  const basePrice = modelData?.basePrice ?? 0
  const glassPrice = calculateGlassPrice(glassTypeData, areaM2)
  const colorSurcharge = calculateColorSurcharge(colorData, modelData)
  const servicesTotal = calculateServicesTotal(selectedServices)
  const subtotalPerUnit = calculateSubtotalPerUnit(
    basePrice,
    glassPrice,
    colorSurcharge,
    servicesTotal,
  )
  const total = calculateTotal(subtotalPerUnit, quantity ?? 1)

  return {
    areaM2,
    basePrice,
    glassPrice,
    colorSurcharge,
    servicesTotal,
    subtotalPerUnit,
    total,
  }
}
