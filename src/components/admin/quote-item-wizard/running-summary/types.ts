import type { FormatContext } from "@/app/_hooks/use-tenant-config"

export interface WatchedFields {
  widthMm: number | undefined
  heightMm: number | undefined
  quantity: number | undefined
  modelId: string | undefined
  colorId: string | undefined
  glassTypeId: string | undefined
  serviceIds: string[] | undefined
  roomLocation: string | undefined
}

export interface ModelData {
  id: string
  name: string
  basePrice: number
}

export interface ColorData {
  id: string
  name: string
  hexCode: string
  surchargePercentage: number
}

export interface GlassTypeData {
  id: string
  name: string
  pricePerSqm: number
}

export interface ServiceData {
  id: string
  name: string
  rate: number
}

export interface PriceBreakdown {
  areaM2: number
  basePrice: number
  glassPrice: number
  colorSurcharge: number
  servicesTotal: number
  subtotalPerUnit: number
  total: number
}

export interface UseRunningSummaryDataReturn {
  watchedFields: WatchedFields
  modelData: ModelData | undefined
  colorData: ColorData | undefined
  glassTypeData: GlassTypeData | undefined
  selectedServices: ServiceData[]
  formatContext: FormatContext
}

export type { FormatContext }
