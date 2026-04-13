import type { RouterOutputs } from '@/trpc/react'

const mockModel: RouterOutputs['catalog']['filter-models-by-dimensions'][number] = {
  basePrice: 150000,
  description: 'Ventana corrediza de 2 hojas',
  id: 'model-1',
  imageUrl: null,
  maxHeightMm: 2000,
  maxWidthMm: 2000,
  minHeightMm: 400,
  minWidthMm: 400,
  name: 'Corrediza 2 Hojas',
}

const mockModel2: RouterOutputs['catalog']['filter-models-by-dimensions'][number] = {
  basePrice: 200000,
  description: 'Ventana proyectante',
  id: 'model-2',
  imageUrl: null,
  maxHeightMm: 1800,
  maxWidthMm: 1500,
  minHeightMm: 500,
  minWidthMm: 500,
  name: 'Proyectante',
}

const mockModels = [mockModel, mockModel2]

const mockColor = {
  color: {
    hexCode: '#FF0000',
    id: 'color-red',
    name: 'Rojo',
  },
  id: 'model-color-1',
  surchargePercentage: 0,
}

const mockColorWithSurcharge = {
  color: {
    hexCode: '#000000',
    id: 'color-black',
    name: 'Negro Mate',
  },
  id: 'model-color-2',
  surchargePercentage: 1500,
}

const mockColorsData = {
  colors: [mockColor, mockColorWithSurcharge],
}

const mockGlassType = {
  description: 'Vidrio transparente de 3mm',
  id: 'glass-clear-3mm',
  name: 'Clear 3mm',
  pricePerSqm: 45000,
  thicknessMm: 3,
}

const mockGlassType2 = {
  description: 'Vidrio bronce de 4mm',
  id: 'glass-bronze-4mm',
  name: 'Bronze 4mm',
  pricePerSqm: 55000,
  thicknessMm: 4,
}

const mockGlassTypes = [mockGlassType, mockGlassType2]

const mockService = {
  id: 'service-installation',
  name: 'Instalación',
  rate: 50000,
  type: 'installation',
  unit: 'unit',
}

const mockService2 = {
  id: 'service-transport',
  name: 'Transporte',
  rate: 30000,
  type: 'transport',
  unit: 'unit',
}

const mockServices = [mockService, mockService2]

const mockValidFormValues = {
  widthMm: 1000,
  heightMm: 1500,
  quantity: 2,
  roomLocation: 'Sala',
  modelId: 'model-1',
  configuredWidthMm: 1000,
  configuredHeightMm: 1500,
  colorId: 'model-color-1',
  glassTypeId: 'glass-clear-3mm',
  serviceIds: ['service-installation'],
}

const mockMinimalFormValues = {
  widthMm: 800,
  heightMm: 1200,
  quantity: 1,
  modelId: 'model-1',
  configuredWidthMm: 800,
  configuredHeightMm: 1200,
  glassTypeId: 'glass-clear-3mm',
  serviceIds: [],
}

export {
  mockModel,
  mockModel2,
  mockModels,
  mockColor,
  mockColorWithSurcharge,
  mockColorsData,
  mockGlassType,
  mockGlassType2,
  mockGlassTypes,
  mockService,
  mockService2,
  mockServices,
  mockValidFormValues,
  mockMinimalFormValues,
}
