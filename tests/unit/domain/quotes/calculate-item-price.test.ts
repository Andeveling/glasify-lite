/**
 * Tests unitarios para CalculateItemPriceUseCase
 *
 * Estos tests NO requieren base de datos.
 * Solo validan lógica de negocio pura con mocks.
 */

import type { Decimal } from "@prisma/generated/client/runtime/library";
import { describe, expect, it, vi } from "vitest";
import {
  type CalculateItemPriceDeps,
  type CalculateItemPriceInput,
  calculateItemPriceUseCase,
} from "@/domain/quotes/use-cases/calculate-item-price";

// Constantes reutilizables para evitar números mágicos
const DEFAULT_BASE_PRICE = 100;
const DEFAULT_COST_PER_MM_WIDTH = 0.1;
const DEFAULT_COST_PER_MM_HEIGHT = 0.15;
const DEFAULT_MIN_WIDTH_MM = 500;
const DEFAULT_MAX_WIDTH_MM = 2000;
const DEFAULT_MIN_HEIGHT_MM = 600;
const DEFAULT_MAX_HEIGHT_MM = 2500;
const DEFAULT_ACCESSORY_PRICE = 50;
const DEFAULT_PROFIT_MARGIN_PERCENTAGE = 10;
const DEFAULT_GLASS_DISCOUNT_WIDTH_MM = 20;
const DEFAULT_GLASS_DISCOUNT_HEIGHT_MM = 20;
const DEFAULT_GLASS_PRICE_PER_SQM = 80;
const DEFAULT_SERVICE_RATE = 25;
const DEFAULT_SERVICE_MIN_BILLING_UNIT = 1;
const DEFAULT_DIM_PRICE = 300;
const DEFAULT_ACC_PRICE = 50;
const DEFAULT_SUBTOTAL = 350;
const DEFAULT_WIDTH = 1000;
const DEFAULT_HEIGHT = 1200;
const DEFAULT_QUANTITY = 2;

// Constantes para pruebas relacionadas con recargos por color
const TEST_COLOR_SURCHARGE_PERCENTAGE = 20;
const TEST_COLOR_SURCHARGE_AMOUNT = 70;

// Helper para crear mocks de Decimal
function mockDecimal(value: number): Decimal {
  return {
    toNumber: () => value,
  } as Decimal;
}

// Mock de modelo válido
function createMockModel(overrides = {}) {
  return {
    id: "model-1",
    name: "Ventana Corrediza",
    status: "published",
    basePrice: mockDecimal(DEFAULT_BASE_PRICE),
    costPerMmWidth: mockDecimal(DEFAULT_COST_PER_MM_WIDTH),
    costPerMmHeight: mockDecimal(DEFAULT_COST_PER_MM_HEIGHT),
    minWidthMm: DEFAULT_MIN_WIDTH_MM,
    maxWidthMm: DEFAULT_MAX_WIDTH_MM,
    minHeightMm: DEFAULT_MIN_HEIGHT_MM,
    maxHeightMm: DEFAULT_MAX_HEIGHT_MM,
    accessoryPrice: mockDecimal(DEFAULT_ACCESSORY_PRICE),
    profitMarginPercentage: mockDecimal(DEFAULT_PROFIT_MARGIN_PERCENTAGE),
    glassDiscountWidthMm: DEFAULT_GLASS_DISCOUNT_WIDTH_MM,
    glassDiscountHeightMm: DEFAULT_GLASS_DISCOUNT_HEIGHT_MM,
    compatibleGlassTypeIds: ["glass-1", "glass-2"],
    profileSupplier: { id: "supplier-1", name: "Proveedor A" },
    ...overrides,
  };
}

// Mock de tipo de vidrio válido
function createMockGlassType(overrides = {}) {
  return {
    id: "glass-1",
    name: "Vidrio Templado 6mm",
    pricePerSqm: mockDecimal(DEFAULT_GLASS_PRICE_PER_SQM),
    ...overrides,
  };
}

// Mock de servicio válido
function createMockService(overrides = {}) {
  return {
    id: "service-1",
    name: "Instalación",
    unit: "sqm" as const,
    rate: mockDecimal(DEFAULT_SERVICE_RATE),
    minimumBillingUnit: mockDecimal(DEFAULT_SERVICE_MIN_BILLING_UNIT),
    ...overrides,
  };
}

// Input válido base
function createValidInput(
  overrides: Partial<CalculateItemPriceInput> = {}
): CalculateItemPriceInput {
  return {
    modelId: "model-1",
    glassTypeId: "glass-1",
    widthMm: DEFAULT_WIDTH,
    heightMm: DEFAULT_HEIGHT,
    quantity: DEFAULT_QUANTITY,
    unit: "unit" as const,
    services: [],
    adjustments: [],
    ...overrides,
  };
}

// Dependencies mock factory
function createMockDeps(
  overrides: Partial<CalculateItemPriceDeps> = {}
): CalculateItemPriceDeps {
  return {
    findModel: vi.fn().mockResolvedValue(createMockModel()),
    findGlassType: vi.fn().mockResolvedValue(createMockGlassType()),
    findServices: vi.fn().mockResolvedValue([]),
    calculatePrice: vi.fn().mockReturnValue({
      dimPrice: DEFAULT_DIM_PRICE,
      accPrice: DEFAULT_ACC_PRICE,
      services: [],
      adjustments: [],
      subtotal: DEFAULT_SUBTOTAL,
    }),
    ...overrides,
  };
}

describe("CalculateItemPriceUseCase", () => {
  describe("Input Validation", () => {
    it("should throw error when quantity is 0", async () => {
      const input = createValidInput({ quantity: 0 });
      const deps = createMockDeps();

      await expect(calculateItemPriceUseCase(input, deps)).rejects.toThrow(
        "La cantidad debe ser mayor a 0"
      );
    });

    it("should throw error when quantity is negative", async () => {
      const input = createValidInput({ quantity: -1 });
      const deps = createMockDeps();

      await expect(calculateItemPriceUseCase(input, deps)).rejects.toThrow(
        "La cantidad debe ser mayor a 0"
      );
    });

    it("should throw error when quantity is not integer", async () => {
      const input = createValidInput({ quantity: 1.5 });
      const deps = createMockDeps();

      await expect(calculateItemPriceUseCase(input, deps)).rejects.toThrow(
        "La cantidad debe ser un número entero"
      );
    });

    it("should throw error when color surcharge is over 100%", async () => {
      const input = createValidInput({ colorSurchargePercentage: 150 });
      const deps = createMockDeps();

      await expect(calculateItemPriceUseCase(input, deps)).rejects.toThrow(
        "El recargo por color debe estar entre 0% y 100%"
      );
    });

    it("should throw error when color surcharge is negative", async () => {
      const input = createValidInput({ colorSurchargePercentage: -10 });
      const deps = createMockDeps();

      await expect(calculateItemPriceUseCase(input, deps)).rejects.toThrow(
        "El recargo por color debe estar entre 0% y 100%"
      );
    });
  });

  describe("Model Validation", () => {
    it("should throw error when model not found", async () => {
      const input = createValidInput();
      const deps = createMockDeps({
        findModel: vi.fn().mockResolvedValue(null),
      });

      await expect(calculateItemPriceUseCase(input, deps)).rejects.toThrow(
        "Modelo no encontrado"
      );
    });

    it("should throw error when model is not published", async () => {
      const input = createValidInput();
      const deps = createMockDeps({
        findModel: vi
          .fn()
          .mockResolvedValue(createMockModel({ status: "draft" })),
      });

      await expect(calculateItemPriceUseCase(input, deps)).rejects.toThrow(
        "no está disponible"
      );
    });

    it("should throw error when glass type is not compatible", async () => {
      const input = createValidInput({ glassTypeId: "incompatible-glass" });
      const deps = createMockDeps();

      await expect(calculateItemPriceUseCase(input, deps)).rejects.toThrow(
        "Tipo de vidrio no compatible"
      );
    });

    it("should throw error when width is below minimum", async () => {
      const input = createValidInput({ widthMm: 300 });
      const deps = createMockDeps();

      await expect(calculateItemPriceUseCase(input, deps)).rejects.toThrow(
        "Ancho debe estar entre 500mm y 2000mm"
      );
    });

    it("should throw error when width is above maximum", async () => {
      const input = createValidInput({ widthMm: 3000 });
      const deps = createMockDeps();

      await expect(calculateItemPriceUseCase(input, deps)).rejects.toThrow(
        "Ancho debe estar entre 500mm y 2000mm"
      );
    });

    it("should throw error when height is below minimum", async () => {
      const input = createValidInput({ heightMm: 400 });
      const deps = createMockDeps();

      await expect(calculateItemPriceUseCase(input, deps)).rejects.toThrow(
        "Alto debe estar entre 600mm y 2500mm"
      );
    });

    it("should throw error when height is above maximum", async () => {
      const input = createValidInput({ heightMm: 3000 });
      const deps = createMockDeps();

      await expect(calculateItemPriceUseCase(input, deps)).rejects.toThrow(
        "Alto debe estar entre 600mm y 2500mm"
      );
    });
  });

  describe("Glass Type Validation", () => {
    it("should throw error when glass type not found", async () => {
      const input = createValidInput();
      const deps = createMockDeps({
        findGlassType: vi.fn().mockResolvedValue(null),
      });

      await expect(calculateItemPriceUseCase(input, deps)).rejects.toThrow(
        "Tipo de vidrio no encontrado"
      );
    });
  });

  describe("Service Validation", () => {
    it("should throw error when service not found", async () => {
      const input = createValidInput({
        services: [{ serviceId: "non-existent-service" }],
      });
      const deps = createMockDeps({
        findServices: vi.fn().mockResolvedValue([]),
      });

      await expect(calculateItemPriceUseCase(input, deps)).rejects.toThrow(
        "Servicio non-existent-service no encontrado"
      );
    });

    it("should pass with valid services", async () => {
      const input = createValidInput({
        services: [{ serviceId: "service-1", quantity: 2 }],
      });
      const deps = createMockDeps({
        findServices: vi.fn().mockResolvedValue([createMockService()]),
        calculatePrice: vi.fn().mockReturnValue({
          dimPrice: 300,
          accPrice: 50,
          services: [
            { serviceId: "service-1", unit: "sqm", quantity: 2, amount: 50 },
          ],
          adjustments: [],
          subtotal: 400,
        }),
      });

      const result = await calculateItemPriceUseCase(input, deps);

      expect(result.services).toHaveLength(1);
      expect(result.services[0]?.serviceId).toBe("service-1");
    });
  });

  describe("Price Calculation", () => {
    it("should call calculatePrice with correct parameters", async () => {
      const input = createValidInput({
        colorSurchargePercentage: 15,
        adjustments: [
          {
            concept: "Descuento promocional",
            sign: "negative" as const,
            unit: "unit" as const,
            value: 10,
          },
        ],
      });
      const calculatePriceMock = vi.fn().mockReturnValue({
        dimPrice: 300,
        accPrice: 50,
        colorSurchargePercentage: 15,
        colorSurchargeAmount: 52.5,
        services: [],
        adjustments: [{ concept: "Descuento promocional", amount: -10 }],
        subtotal: 392.5,
      });
      const deps = createMockDeps({ calculatePrice: calculatePriceMock });

      await calculateItemPriceUseCase(input, deps);

      expect(calculatePriceMock).toHaveBeenCalledWith(
        expect.objectContaining({
          widthMm: 1000,
          heightMm: 1200,
          colorSurchargePercentage: 15,
        })
      );
    });

    it("should return complete price breakdown", async () => {
      const input = createValidInput();
      const deps = createMockDeps({
        calculatePrice: vi.fn().mockReturnValue({
          dimPrice: 300,
          accPrice: 50,
          services: [],
          adjustments: [],
          subtotal: 350,
        }),
      });

      const result = await calculateItemPriceUseCase(input, deps);

      expect(result).toEqual({
        dimPrice: 300,
        accPrice: 50,
        services: [],
        adjustments: [],
        subtotal: 350,
      });
    });

    it("should include color surcharge when provided", async () => {
      const input = createValidInput({ colorSurchargePercentage: 20 });
      const deps = createMockDeps({
        calculatePrice: vi.fn().mockReturnValue({
          dimPrice: 300,
          accPrice: 50,
          colorSurchargePercentage: 20,
          colorSurchargeAmount: 70,
          services: [],
          adjustments: [],
          subtotal: 420,
        }),
      });

      const result = await calculateItemPriceUseCase(input, deps);

      expect(result.colorSurchargePercentage).toBe(
        TEST_COLOR_SURCHARGE_PERCENTAGE
      );
      expect(result.colorSurchargeAmount).toBe(TEST_COLOR_SURCHARGE_AMOUNT);
    });
  });
});
