/** biome-ignore-all lint/style/noMagicNumbers: Test file with expected numeric literal values for assertions */
import { Dimensions } from "@domain/pricing/core/entities/dimensions";
import { Money } from "@domain/pricing/core/entities/money";
import { PriceCalculation } from "@domain/pricing/core/entities/price-calculation";
import { describe, expect, it } from "vitest";

describe("PriceCalculation", () => {
  describe("calculate - Basic Profile + Glass", () => {
    it("should calculate profile cost with dimensions", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = PriceCalculation.calculate({
        dimensions,
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
        },
        colorMultiplier: 1.0, // no surcharge
      });

      // Profile: 100 + (200mm × 0.5) + (1200mm × 0.3) = 100 + 100 + 360 = 560
      expect(result.profileCost.toNumber()).toBe(560);
      expect(result.glassCost.toNumber()).toBe(0);
      expect(result.accessoryCost.toNumber()).toBe(0);
      expect(result.subtotal.toNumber()).toBe(560);
    });

    it("should calculate glass cost with effective dimensions", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = PriceCalculation.calculate({
        dimensions,
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
        },
        colorMultiplier: 1.0,
        glass: {
          pricePerSqm: new Money(50),
          discountWidthMm: 10,
          discountHeightMm: 10,
        },
      });

      // Glass area: (1000-10) × (2000-10) / 1000000 = 990 × 1990 / 1000000 = 1.9701 m²
      // Glass cost: 1.9701 × 50 = 98.505 ≈ 98.51
      expect(result.glassCost.toNumber()).toBe(98.51);
      expect(result.profileCost.toNumber()).toBe(560);
      expect(result.subtotal.toNumber()).toBe(658.51);
    });
  });

  describe("calculate - Color Surcharge", () => {
    it("should apply color surcharge to profile and accessory", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = PriceCalculation.calculate({
        dimensions,
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
          accessoryPrice: new Money(50),
        },
        colorMultiplier: 1.1, // 10% surcharge
      });

      // Profile before color: 560
      // Profile with color: 560 × 1.1 = 616
      expect(result.profileCost.toNumber()).toBe(616);

      // Accessory with color: 50 × 1.1 = 55
      expect(result.accessoryCost.toNumber()).toBe(55);

      expect(result.subtotal.toNumber()).toBe(671);
    });

    it("should NOT apply color surcharge to glass", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = PriceCalculation.calculate({
        dimensions,
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
        },
        colorMultiplier: 1.1,
        glass: {
          pricePerSqm: new Money(50),
          discountWidthMm: 10,
          discountHeightMm: 10,
        },
      });

      // Profile with color: 616
      // Glass NO color: 98.51
      expect(result.profileCost.toNumber()).toBe(616);
      expect(result.glassCost.toNumber()).toBe(98.51);
      expect(result.subtotal.toNumber()).toBe(714.51);
    });
  });

  describe("calculate - Services", () => {
    it("should calculate service amounts", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = PriceCalculation.calculate({
        dimensions,
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
        },
        colorMultiplier: 1.0,
        services: [
          {
            serviceId: "svc-1",
            name: "Instalación",
            unit: "unit" as const,
            rate: new Money(100),
          },
          {
            serviceId: "svc-2",
            name: "Templado",
            unit: "sqm" as const,
            rate: new Money(50),
          },
        ],
      });

      expect(result.services).toHaveLength(2);

      const svc1 = result.services.find(
        (s: { serviceId: string }) => s.serviceId === "svc-1"
      );
      const svc2 = result.services.find(
        (s: { serviceId: string }) => s.serviceId === "svc-2"
      );

      if (svc1 && svc2) {
        // Service 1: 1 × 100 = 100
        expect(svc1.quantity).toBe(1);
        expect(svc1.amount).toBe(100);

        // Service 2: 2.0 m² × 50 = 100
        expect(svc2.quantity).toBe(2.0);
        expect(svc2.amount).toBe(100);

        // Subtotal: 560 (profile) + 200 (services) = 760
        expect(result.subtotal.toNumber()).toBe(760);
      }
    });

    it("should handle empty services array", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = PriceCalculation.calculate({
        dimensions,
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
        },
        colorMultiplier: 1.0,
        services: [],
      });

      expect(result.services).toHaveLength(0);
      expect(result.subtotal.toNumber()).toBe(560);
    });
  });

  describe("calculate - Adjustments", () => {
    it("should apply positive and negative adjustments", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = PriceCalculation.calculate({
        dimensions,
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
        },
        colorMultiplier: 1.0,
        adjustments: [
          {
            adjustmentId: "adj-1",
            concept: "Recargo especial",
            unit: "sqm" as const,
            value: 10,
            isPositive: true,
          },
          {
            adjustmentId: "adj-2",
            concept: "Descuento",
            unit: "unit" as const,
            value: 50,
            isPositive: false,
          },
        ],
      });

      expect(result.adjustments).toHaveLength(2);

      const adj1 = result.adjustments.find(
        (a: { adjustmentId: string }) => a.adjustmentId === "adj-1"
      );
      const adj2 = result.adjustments.find(
        (a: { adjustmentId: string }) => a.adjustmentId === "adj-2"
      );

      if (adj1 && adj2) {
        // Adjustment 1: +20 (2.0 m² × 10)
        expect(adj1.amount).toBe(20);

        // Adjustment 2: -50 (1 × 50 × -1)
        expect(adj2.amount).toBe(-50);

        // Subtotal: 560 + 20 - 50 = 530
        expect(result.subtotal.toNumber()).toBe(530);
      }
    });

    it("should handle empty adjustments array", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = PriceCalculation.calculate({
        dimensions,
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
        },
        colorMultiplier: 1.0,
        adjustments: [],
      });

      expect(result.adjustments).toHaveLength(0);
      expect(result.subtotal.toNumber()).toBe(560);
    });
  });

  describe("calculate - Full Example", () => {
    it("should calculate complete price with all components", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = PriceCalculation.calculate({
        dimensions,
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
          accessoryPrice: new Money(50),
        },
        colorMultiplier: 1.1, // 10% surcharge
        glass: {
          pricePerSqm: new Money(50),
          discountWidthMm: 10,
          discountHeightMm: 10,
        },
        services: [
          {
            serviceId: "svc-1",
            name: "Instalación",
            unit: "unit" as const,
            rate: new Money(100),
          },
        ],
        adjustments: [
          {
            adjustmentId: "adj-1",
            concept: "Descuento cliente frecuente",
            unit: "unit" as const,
            value: 30,
            isPositive: false,
          },
        ],
      });

      // Profile with color: 616
      // Glass: 98.51
      // Accessory with color: 55
      // Service: 100
      // Adjustment: -30
      // Total: 616 + 98.51 + 55 + 100 - 30 = 839.51

      expect(result.profileCost.toNumber()).toBe(616);
      expect(result.glassCost.toNumber()).toBe(98.51);
      expect(result.accessoryCost.toNumber()).toBe(55);
      expect(result.services).toHaveLength(1);
      expect(result.adjustments).toHaveLength(1);
      expect(result.subtotal.toNumber()).toBe(839.51);
    });
  });
});
