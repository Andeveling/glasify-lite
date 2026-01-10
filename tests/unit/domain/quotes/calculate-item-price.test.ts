/**
 * Tests unitarios para CalculateItemPriceUseCase
 *
 * Estos tests NO requieren base de datos.
 * Solo validan lógica de negocio pura con mocks.
 */

import type { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it, vi } from "vitest";
import {
  calculateItemPriceUseCase,
  type CalculateItemPriceDeps,
  type CalculateItemPriceInput,
} from "@/domain/quotes/use-cases/calculate-item-price";

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
    basePrice: mockDecimal(100),
    costPerMmWidth: mockDecimal(0.1),
    costPerMmHeight: mockDecimal(0.15),
    minWidthMm: 500,
    maxWidthMm: 2000,
    minHeightMm: 600,
    maxHeightMm: 2500,
    accessoryPrice: mockDecimal(50),
    profitMarginPercentage: mockDecimal(10),
    glassDiscountWidthMm: 20,
    glassDiscountHeightMm: 20,
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
    pricePerSqm: mockDecimal(80),
    ...overrides,
  };
}

// Mock de servicio válido
function createMockService(overrides = {}) {
  return {
    id: "service-1",
    name: "Instalación",
    unit: "sqm" as const,
    rate: mockDecimal(25),
    minimumBillingUnit: mockDecimal(1),
    ...overrides,
  };
}

// Input válido base
function createValidInput(overrides: Partial<CalculateItemPriceInput> = {}): CalculateItemPriceInput {
  return {
    modelId: "model-1",
    glassTypeId: "glass-1",
    widthMm: 1000,
    heightMm: 1200,
    quantity: 2,
    unit: "unit" as const,
    services: [],
    adjustments: [],
    ...overrides,
  };
}

// Dependencies mock factory
function createMockDeps(overrides: Partial<CalculateItemPriceDeps> = {}): CalculateItemPriceDeps {
  return {
    findModel: vi.fn().mockResolvedValue(createMockModel()),
    findGlassType: vi.fn().mockResolvedValue(createMockGlassType()),
    findServices: vi.fn().mockResolvedValue([]),
    calculatePrice: vi.fn().mockReturnValue({
      dimPrice: 300,
      accPrice: 50,
      services: [],
      adjustments: [],
      subtotal: 350,
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
        findModel: vi.fn().mockResolvedValue(
          createMockModel({ status: "draft" })
        ),
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
          services: [{ serviceId: "service-1", unit: "sqm", quantity: 2, amount: 50 }],
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
          { concept: "Descuento promocional", sign: "negative" as const, unit: "unit" as const, value: 10 },
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

      expect(result.colorSurchargePercentage).toBe(20);
      expect(result.colorSurchargeAmount).toBe(70);
    });
  });
});
