import { describe, expect, it } from 'vitest'
import type { ColorData, GlassTypeData, ModelData, ServiceData } from '../types'
import {
  calculateAreaM2,
  calculateColorSurcharge,
  calculateGlassPrice,
  calculatePriceBreakdown,
  calculateServicesTotal,
  calculateSubtotalPerUnit,
  calculateTotal,
} from '../utils/price-calculations'

const modelStub: ModelData = { id: 'm1', name: 'Modelo A', basePrice: 1000 }
const colorStub: ColorData = {
  id: 'c1',
  name: 'Blanco',
  hexCode: '#ffffff',
  surchargePercentage: 50,
}
const glassStub: GlassTypeData = { id: 'g1', name: 'Claro 6mm', pricePerSqm: 200 }
const serviceStub: ServiceData = { id: 's1', name: 'Instalación', rate: 150 }

describe('calculateAreaM2', () => {
  it('returns 0 for zero dimensions', () => {
    expect(calculateAreaM2(0, 0)).toBe(0)
  })

  it('returns 1 m² for 1000×1000 mm', () => {
    expect(calculateAreaM2(1000, 1000)).toBe(1)
  })

  it('handles non-square rectangles', () => {
    expect(calculateAreaM2(2000, 500)).toBe(1)
  })
})

describe('calculateGlassPrice', () => {
  it('returns 0 when glassTypeData is undefined', () => {
    expect(calculateGlassPrice(undefined, 1)).toBe(0)
  })

  it('returns 0 when areaM2 is 0', () => {
    expect(calculateGlassPrice(glassStub, 0)).toBe(0)
  })

  it('calculates correctly: pricePerSqm × areaM2', () => {
    expect(calculateGlassPrice(glassStub, 2)).toBe(400)
  })
})

describe('calculateColorSurcharge', () => {
  it('returns 0 when colorData is undefined', () => {
    expect(calculateColorSurcharge(undefined, modelStub)).toBe(0)
  })

  it('returns 0 when modelData is undefined', () => {
    expect(calculateColorSurcharge(colorStub, undefined)).toBe(0)
  })

  it('returns 0 when both are undefined', () => {
    expect(calculateColorSurcharge(undefined, undefined)).toBe(0)
  })

  it('calculates 50% surcharge correctly', () => {
    expect(calculateColorSurcharge(colorStub, modelStub)).toBe(500)
  })

  it('calculates 0% surcharge', () => {
    const zeroSurcharge: ColorData = { ...colorStub, surchargePercentage: 0 }
    expect(calculateColorSurcharge(zeroSurcharge, modelStub)).toBe(0)
  })
})

describe('calculateServicesTotal', () => {
  it('returns 0 for empty services', () => {
    expect(calculateServicesTotal([])).toBe(0)
  })

  it('sums service rates correctly', () => {
    const s2: ServiceData = { id: 's2', name: 'Limpieza', rate: 50 }
    expect(calculateServicesTotal([serviceStub, s2])).toBe(200)
  })

  it('handles single service', () => {
    expect(calculateServicesTotal([serviceStub])).toBe(150)
  })
})

describe('calculateSubtotalPerUnit', () => {
  it('sums all components', () => {
    expect(calculateSubtotalPerUnit(1000, 200, 500, 150)).toBe(1850)
  })

  it('returns 0 when all inputs are 0', () => {
    expect(calculateSubtotalPerUnit(0, 0, 0, 0)).toBe(0)
  })
})

describe('calculateTotal', () => {
  it('multiplies subtotal by quantity', () => {
    expect(calculateTotal(100, 5)).toBe(500)
  })

  it('returns subtotal unchanged for quantity=1', () => {
    expect(calculateTotal(100, 1)).toBe(100)
  })
})

describe('calculatePriceBreakdown', () => {
  it('returns zeroed breakdown for undefined fields and no data', () => {
    const result = calculatePriceBreakdown(
      { widthMm: undefined, heightMm: undefined, quantity: undefined },
      undefined,
      undefined,
      undefined,
      [],
    )
    expect(result).toEqual({
      areaM2: 0,
      basePrice: 0,
      glassPrice: 0,
      colorSurcharge: 0,
      servicesTotal: 0,
      subtotalPerUnit: 0,
      total: 0,
    })
  })

  it('calculates full breakdown with all data', () => {
    const result = calculatePriceBreakdown(
      { widthMm: 1000, heightMm: 1000, quantity: 2 },
      modelStub,
      glassStub,
      colorStub,
      [serviceStub],
    )
    expect(result.areaM2).toBe(1)
    expect(result.basePrice).toBe(1000)
    expect(result.glassPrice).toBe(200)
    expect(result.colorSurcharge).toBe(500)
    expect(result.servicesTotal).toBe(150)
    expect(result.subtotalPerUnit).toBe(1850)
    expect(result.total).toBe(3700)
  })

  it('applies quantity > 1 to total only', () => {
    const result = calculatePriceBreakdown(
      { widthMm: 1000, heightMm: 1000, quantity: 3 },
      modelStub,
      undefined,
      undefined,
      [],
    )
    expect(result.subtotalPerUnit).toBe(1000)
    expect(result.total).toBe(3000)
  })

  it('defaults quantity to 1 when undefined', () => {
    const result = calculatePriceBreakdown(
      { widthMm: 1000, heightMm: 1000, quantity: undefined },
      modelStub,
      undefined,
      undefined,
      [],
    )
    expect(result.total).toBe(1000)
  })
})
