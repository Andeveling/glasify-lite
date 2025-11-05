/** biome-ignore-all lint/style/noMagicNumbers: Test file with expected numeric literal values for assertions */
import { Dimensions } from "@domain/pricing/core/entities/dimensions";
import { Money } from "@domain/pricing/core/entities/money";
import type { ServiceUnit } from "@domain/pricing/core/types";
import { describe, expect, it } from "vitest";
import { adaptTRPCToDomain } from "@/server/api/routers/quote/price-adapter";

describe("adaptTRPCToDomain", () => {
  describe("Basic Adaptation", () => {
    it("should adapt minimal tRPC input to domain input", () => {
      const trpcInput = {
        widthMm: 1000,
        heightMm: 2000,
        modelPrices: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
          minWidthMm: 800,
          minHeightMm: 800,
        },
        colorSurchargePercentage: 0, // No surcharge
      };

      const domainInput = adaptTRPCToDomain(trpcInput);

      // Verify dimensions
      expect(domainInput.dimensions).toBeInstanceOf(Dimensions);
      expect(domainInput.dimensions.widthMm).toBe(1000);
      expect(domainInput.dimensions.heightMm).toBe(2000);
      expect(domainInput.dimensions.minWidthMm).toBe(800);
      expect(domainInput.dimensions.minHeightMm).toBe(800);

      // Verify model prices (Money instances)
      expect(domainInput.modelPrices.basePrice).toBeInstanceOf(Money);
      expect(domainInput.modelPrices.basePrice.toNumber()).toBe(100);
      expect(domainInput.modelPrices.costPerMmWidth.toNumber()).toBe(0.5);
      expect(domainInput.modelPrices.costPerMmHeight.toNumber()).toBe(0.3);

      // Verify color multiplier (0% → 1.0)
      expect(domainInput.colorMultiplier).toBe(1.0);

      // Verify optional fields are undefined
      expect(domainInput.glass).toBeUndefined();
      expect(domainInput.services).toBeUndefined();
      expect(domainInput.adjustments).toBeUndefined();
    });

    it("should convert percentage (10%) to multiplier (1.1)", () => {
      const trpcInput = {
        widthMm: 1000,
        heightMm: 2000,
        modelPrices: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
          minWidthMm: 800,
          minHeightMm: 800,
        },
        colorSurchargePercentage: 10, // 10% surcharge
      };

      const domainInput = adaptTRPCToDomain(trpcInput);

      expect(domainInput.colorMultiplier).toBe(1.1);
    });

    it("should convert percentage (50%) to multiplier (1.5)", () => {
      const trpcInput = {
        widthMm: 1000,
        heightMm: 2000,
        modelPrices: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
          minWidthMm: 800,
          minHeightMm: 800,
        },
        colorSurchargePercentage: 50,
      };

      const domainInput = adaptTRPCToDomain(trpcInput);

      expect(domainInput.colorMultiplier).toBe(1.5);
    });

    it("should handle undefined colorSurchargePercentage as no surcharge", () => {
      const trpcInput = {
        widthMm: 1000,
        heightMm: 2000,
        modelPrices: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
          minWidthMm: 800,
          minHeightMm: 800,
        },
        // colorSurchargePercentage omitted
      };

      const domainInput = adaptTRPCToDomain(trpcInput);

      expect(domainInput.colorMultiplier).toBe(1.0);
    });
  });

  describe("Glass Adaptation", () => {
    it("should adapt glass pricing if provided", () => {
      const trpcInput = {
        widthMm: 1000,
        heightMm: 2000,
        modelPrices: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
          minWidthMm: 800,
          minHeightMm: 800,
        },
        colorSurchargePercentage: 0,
        glass: {
          pricePerSqm: 50,
          discountWidthMm: 10,
          discountHeightMm: 10,
        },
      };

      const domainInput = adaptTRPCToDomain(trpcInput);

      expect(domainInput.glass).toBeDefined();
      if (domainInput.glass) {
        expect(domainInput.glass.pricePerSqm).toBeInstanceOf(Money);
        expect(domainInput.glass.pricePerSqm.toNumber()).toBe(50);
        expect(domainInput.glass.discountWidthMm).toBe(10);
        expect(domainInput.glass.discountHeightMm).toBe(10);
      }
    });

    it("should handle optional accessoryPrice", () => {
      const trpcInput = {
        widthMm: 1000,
        heightMm: 2000,
        modelPrices: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
          minWidthMm: 800,
          minHeightMm: 800,
          accessoryPrice: 50,
        },
        colorSurchargePercentage: 0,
      };

      const domainInput = adaptTRPCToDomain(trpcInput);

      expect(domainInput.modelPrices.accessoryPrice).toBeInstanceOf(Money);
      expect(domainInput.modelPrices.accessoryPrice?.toNumber()).toBe(50);
    });
  });

  describe("Services Adaptation", () => {
    it("should adapt services array", () => {
      const trpcInput = {
        widthMm: 1000,
        heightMm: 2000,
        modelPrices: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
          minWidthMm: 800,
          minHeightMm: 800,
        },
        colorSurchargePercentage: 0,
        services: [
          {
            serviceId: "svc-1",
            name: "Instalación",
            unit: "unit" as ServiceUnit,
            rate: 100,
          },
          {
            serviceId: "svc-2",
            name: "Templado",
            unit: "sqm" as ServiceUnit,
            rate: 50,
            minimumBillingUnit: 2,
          },
        ],
      };

      const domainInput = adaptTRPCToDomain(trpcInput);

      expect(domainInput.services).toBeDefined();
      expect(domainInput.services).toHaveLength(2);

      if (domainInput.services) {
        const svc1 = domainInput.services[0];
        expect(svc1?.serviceId).toBe("svc-1");
        expect(svc1?.name).toBe("Instalación");
        expect(svc1?.unit).toBe("unit");
        expect(svc1?.rate).toBeInstanceOf(Money);
        expect(svc1?.rate.toNumber()).toBe(100);

        const svc2 = domainInput.services[1];
        expect(svc2?.serviceId).toBe("svc-2");
        expect(svc2?.minimumBillingUnit).toBe(2);
        expect(svc2?.rate.toNumber()).toBe(50);
      }
    });

    it("should handle empty services array", () => {
      const trpcInput = {
        widthMm: 1000,
        heightMm: 2000,
        modelPrices: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
          minWidthMm: 800,
          minHeightMm: 800,
        },
        colorSurchargePercentage: 0,
        services: [],
      };

      const domainInput = adaptTRPCToDomain(trpcInput);

      expect(domainInput.services).toEqual([]);
    });
  });

  describe("Adjustments Adaptation", () => {
    it("should adapt positive adjustment", () => {
      const trpcInput = {
        widthMm: 1000,
        heightMm: 2000,
        modelPrices: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
          minWidthMm: 800,
          minHeightMm: 800,
        },
        colorSurchargePercentage: 0,
        adjustments: [
          {
            adjustmentId: "adj-1",
            concept: "Recargo especial",
            unit: "sqm" as ServiceUnit,
            value: 10,
            sign: "positive" as const,
          },
        ],
      };

      const domainInput = adaptTRPCToDomain(trpcInput);

      expect(domainInput.adjustments).toBeDefined();
      expect(domainInput.adjustments).toHaveLength(1);

      if (domainInput.adjustments) {
        const adj = domainInput.adjustments[0];
        expect(adj?.adjustmentId).toBe("adj-1");
        expect(adj?.concept).toBe("Recargo especial");
        expect(adj?.unit).toBe("sqm");
        expect(adj?.value).toBe(10);
        expect(adj?.isPositive).toBe(true);
      }
    });

    it("should adapt negative adjustment", () => {
      const trpcInput = {
        widthMm: 1000,
        heightMm: 2000,
        modelPrices: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
          minWidthMm: 800,
          minHeightMm: 800,
        },
        colorSurchargePercentage: 0,
        adjustments: [
          {
            adjustmentId: "adj-1",
            concept: "Descuento",
            unit: "unit" as ServiceUnit,
            value: 50,
            sign: "negative" as const,
          },
        ],
      };

      const domainInput = adaptTRPCToDomain(trpcInput);

      if (domainInput.adjustments) {
        const adj = domainInput.adjustments[0];
        expect(adj?.isPositive).toBe(false);
      }
    });

    it("should handle empty adjustments array", () => {
      const trpcInput = {
        widthMm: 1000,
        heightMm: 2000,
        modelPrices: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
          minWidthMm: 800,
          minHeightMm: 800,
        },
        colorSurchargePercentage: 0,
        adjustments: [],
      };

      const domainInput = adaptTRPCToDomain(trpcInput);

      expect(domainInput.adjustments).toEqual([]);
    });
  });

  describe("Complete Adaptation", () => {
    it("should adapt complete input with all optional fields", () => {
      const trpcInput = {
        widthMm: 1000,
        heightMm: 2000,
        modelPrices: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
          minWidthMm: 800,
          minHeightMm: 800,
          accessoryPrice: 50,
        },
        colorSurchargePercentage: 10,
        glass: {
          pricePerSqm: 50,
          discountWidthMm: 10,
          discountHeightMm: 10,
        },
        services: [
          {
            serviceId: "svc-1",
            name: "Instalación",
            unit: "unit" as ServiceUnit,
            rate: 100,
          },
        ],
        adjustments: [
          {
            adjustmentId: "adj-1",
            concept: "Descuento",
            unit: "unit" as ServiceUnit,
            value: 30,
            sign: "negative" as const,
          },
        ],
      };

      const domainInput = adaptTRPCToDomain(trpcInput);

      // Verify all fields are adapted
      expect(domainInput.dimensions.widthMm).toBe(1000);
      expect(domainInput.colorMultiplier).toBe(1.1);
      expect(domainInput.glass?.pricePerSqm.toNumber()).toBe(50);
      expect(domainInput.services).toHaveLength(1);
      expect(domainInput.adjustments).toHaveLength(1);
      expect(domainInput.modelPrices.accessoryPrice?.toNumber()).toBe(50);
    });
  });
});
