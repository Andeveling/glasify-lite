/**
 * @file tRPC Price Calculator Adapter Tests
 * @description Integration tests for the tRPC adapter that bridges old API with domain layer
 *
 * These tests verify:
 * 1. Input transformation (tRPC format → domain format)
 * 2. Output transformation (domain format → tRPC format)
 * 3. Backward compatibility with existing `calculatePriceItem` API
 * 4. Edge case handling (Decimal types, null values, optional fields)
 */
/** biome-ignore-all lint/style/noMagicNumbers: Test file contains expected numeric values for assertions */

import Decimal from "decimal.js";
import { describe, expect, it } from "vitest";
import type { PriceItemCalculationInput } from "@/domain/pricing/adapters/trpc/price-calculator.adapter";
import { calculateItemPriceAdapter } from "@/domain/pricing/adapters/trpc/price-calculator.adapter";

describe("calculateItemPriceAdapter", () => {
  describe("Basic Price Calculation", () => {
    it("should calculate profile cost without color surcharge", () => {
      const input: PriceItemCalculationInput = {
        widthMm: 1000,
        heightMm: 2000,
        model: {
          basePrice: new Decimal(100),
          costPerMmWidth: new Decimal(0.5),
          costPerMmHeight: new Decimal(0.3),
        },
      };

      const result = calculateItemPriceAdapter(input);

      // Profile: 100 + (1000 × 0.5) + (2000 × 0.3) = 100 + 500 + 600 = 1200
      expect(result.dimPrice).toBe(1200);
      expect(result.accPrice).toBe(0);
      expect(result.subtotal).toBe(1200);
      expect(result.colorSurchargePercentage).toBeUndefined();
      expect(result.colorSurchargeAmount).toBeUndefined();
    });

    it("should include accessory when includeAccessory is true", () => {
      const input: PriceItemCalculationInput = {
        widthMm: 1000,
        heightMm: 2000,
        model: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
          accessoryPrice: 50,
        },
        includeAccessory: true,
      };

      const result = calculateItemPriceAdapter(input);

      expect(result.dimPrice).toBe(1200);
      expect(result.accPrice).toBe(50);
      expect(result.subtotal).toBe(1250);
    });
  });

  describe("Color Surcharge", () => {
    it("should apply color surcharge to profile and accessory", () => {
      const input: PriceItemCalculationInput = {
        widthMm: 1000,
        heightMm: 2000,
        model: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
          accessoryPrice: 50,
        },
        includeAccessory: true,
        colorSurchargePercentage: 10, // 10% surcharge
      };

      const result = calculateItemPriceAdapter(input);

      // Profile with color: 1200 × 1.1 = 1320
      // Accessory with color: 50 × 1.1 = 55
      expect(result.dimPrice).toBe(1320);
      expect(result.accPrice).toBe(55);
      expect(result.colorSurchargePercentage).toBe(10);
      expect(result.colorSurchargeAmount).toBe(120); // 1200 × 0.1
      expect(result.subtotal).toBe(1375);
    });

    it("should NOT apply color surcharge to glass", () => {
      const input: PriceItemCalculationInput = {
        widthMm: 1000,
        heightMm: 2000,
        model: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
        },
        glass: {
          pricePerSqm: 50,
          discountWidthMm: 0,
          discountHeightMm: 0,
        },
        colorSurchargePercentage: 10,
      };

      const result = calculateItemPriceAdapter(input);

      // Profile with color: 1200 × 1.1 = 1320
      // Glass WITHOUT color: 1.0 × 2.0 × 50 = 100
      // dimPrice = profile + glass = 1320 + 100 = 1420
      expect(result.dimPrice).toBe(1420);
      expect(result.subtotal).toBe(1420);
    });
  });

  describe("Glass Calculation", () => {
    it("should calculate glass cost with discounts", () => {
      const input: PriceItemCalculationInput = {
        widthMm: 1000,
        heightMm: 2000,
        model: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
        },
        glass: {
          pricePerSqm: new Decimal(50),
          discountWidthMm: 50,
          discountHeightMm: 50,
        },
      };

      const result = calculateItemPriceAdapter(input);

      // Profile: 1200
      // Glass: (950mm × 1950mm) / 1,000,000 × 50 = 1.8525 × 50 = 92.63 (rounded)
      expect(result.dimPrice).toBe(1292.63);
    });
  });

  describe("Services", () => {
    it("should calculate services with different units", () => {
      const input: PriceItemCalculationInput = {
        widthMm: 1000,
        heightMm: 2000,
        model: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
        },
        services: [
          {
            serviceId: "install",
            type: "fixed",
            unit: "unit",
            rate: 50,
          },
          {
            serviceId: "polish",
            type: "variable",
            unit: "sqm",
            rate: 20,
          },
        ],
      };

      const result = calculateItemPriceAdapter(input);

      expect(result.services).toHaveLength(2);
      expect(result.services[0]?.amount).toBe(50); // Fixed: 50 × 1
      expect(result.services[1]?.amount).toBe(40); // Area: 20 × 2.0
      expect(result.subtotal).toBe(1290); // 1200 + 50 + 40
    });

    it("should apply minimum billing unit to services", () => {
      const input: PriceItemCalculationInput = {
        widthMm: 1000,
        heightMm: 1500,
        model: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
        },
        services: [
          {
            serviceId: "polish",
            type: "variable",
            unit: "sqm",
            rate: 50,
            minimumBillingUnit: 2.0, // Minimum 2 m²
          },
        ],
      };

      const result = calculateItemPriceAdapter(input);

      // Actual area: 1.0 × 1.5 = 1.5 m² < 2.0 m²
      // Billed at minimum: 2.0 m² × 50 = 100
      expect(result.services[0]?.quantity).toBe(2.0);
      expect(result.services[0]?.amount).toBe(100);
    });

    it("should handle minimumBillingUnit as Decimal type", () => {
      const input: PriceItemCalculationInput = {
        widthMm: 1000,
        heightMm: 1500,
        model: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
        },
        services: [
          {
            serviceId: "polish",
            type: "variable",
            unit: "sqm",
            rate: 50,
            minimumBillingUnit: new Decimal(2.0), // Decimal type
          },
        ],
      };

      const result = calculateItemPriceAdapter(input);

      expect(result.services[0]?.quantity).toBe(2.0);
      expect(result.services[0]?.amount).toBe(100);
    });
  });

  describe("Adjustments", () => {
    it("should calculate positive adjustments", () => {
      const input: PriceItemCalculationInput = {
        widthMm: 1000,
        heightMm: 2000,
        model: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
        },
        adjustments: [
          {
            concept: "Insurance surcharge",
            unit: "sqm",
            sign: "positive",
            value: 10,
          },
        ],
      };

      const result = calculateItemPriceAdapter(input);

      // Area: 1.0 × 2.0 = 2.0 m²
      // Adjustment: 2.0 × 10 = 20 (positive)
      expect(result.adjustments).toHaveLength(1);
      expect(result.adjustments[0]?.amount).toBe(20);
      expect(result.subtotal).toBe(1220); // 1200 + 20
    });

    it("should calculate negative adjustments", () => {
      const input: PriceItemCalculationInput = {
        widthMm: 1000,
        heightMm: 2000,
        model: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
        },
        adjustments: [
          {
            concept: "Promotional discount",
            unit: "ml",
            sign: "negative",
            value: new Decimal(5),
          },
        ],
      };

      const result = calculateItemPriceAdapter(input);

      // Perimeter: 2 × (1.0 + 2.0) = 6.0 ml
      // Adjustment: -(6.0 × 5) = -30
      expect(result.adjustments).toHaveLength(1);
      expect(result.adjustments[0]?.amount).toBe(-30);
      expect(result.subtotal).toBe(1170); // 1200 - 30
    });
  });

  describe("Backward Compatibility", () => {
    it("should handle all Decimal input types", () => {
      const input: PriceItemCalculationInput = {
        widthMm: 1000,
        heightMm: 2000,
        model: {
          basePrice: new Decimal(100),
          costPerMmWidth: new Decimal(0.5),
          costPerMmHeight: new Decimal(0.3),
          accessoryPrice: new Decimal(50),
        },
        glass: {
          pricePerSqm: new Decimal(50),
          discountWidthMm: 50,
          discountHeightMm: 50,
        },
        includeAccessory: true,
        colorSurchargePercentage: 10,
      };

      const result = calculateItemPriceAdapter(input);

      // Should handle Decimal types without errors
      expect(result.dimPrice).toBeDefined();
      expect(result.accPrice).toBeDefined();
      expect(result.subtotal).toBeDefined();
    });

    it("should handle null/undefined optional fields", () => {
      const input: PriceItemCalculationInput = {
        widthMm: 1000,
        heightMm: 2000,
        model: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
          accessoryPrice: null,
        },
        includeAccessory: false,
        services: undefined,
        adjustments: undefined,
      };

      const result = calculateItemPriceAdapter(input);

      expect(result.accPrice).toBe(0);
      expect(result.services).toEqual([]);
      expect(result.adjustments).toEqual([]);
      expect(result.subtotal).toBe(1200);
    });

    it("should match output structure of original calculatePriceItem", () => {
      const input: PriceItemCalculationInput = {
        widthMm: 1000,
        heightMm: 2000,
        model: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
        },
      };

      const result = calculateItemPriceAdapter(input);

      // Verify output structure matches PriceItemCalculationResult
      expect(result).toHaveProperty("dimPrice");
      expect(result).toHaveProperty("accPrice");
      expect(result).toHaveProperty("services");
      expect(result).toHaveProperty("adjustments");
      expect(result).toHaveProperty("subtotal");
      expect(Array.isArray(result.services)).toBe(true);
      expect(Array.isArray(result.adjustments)).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle zero dimensions gracefully", () => {
      const input: PriceItemCalculationInput = {
        widthMm: 0,
        heightMm: 0,
        model: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
        },
      };

      // Domain layer should throw error for invalid dimensions
      expect(() => calculateItemPriceAdapter(input)).toThrow(
        "Width must be greater than 0"
      );
    });

    it("should handle negative dimensions gracefully", () => {
      const input: PriceItemCalculationInput = {
        widthMm: -1000,
        heightMm: 2000,
        model: {
          basePrice: 100,
          costPerMmWidth: 0.5,
          costPerMmHeight: 0.3,
        },
      };

      expect(() => calculateItemPriceAdapter(input)).toThrow(
        "Width must be greater than 0"
      );
    });

    it("should handle very large numbers without overflow", () => {
      const input: PriceItemCalculationInput = {
        widthMm: 999_999,
        heightMm: 999_999,
        model: {
          basePrice: 999_999,
          costPerMmWidth: 999,
          costPerMmHeight: 999,
        },
      };

      const result = calculateItemPriceAdapter(input);

      // Should calculate without errors (using Decimal for precision)
      expect(result.dimPrice).toBeDefined();
      expect(typeof result.dimPrice).toBe("number");
      expect(Number.isFinite(result.dimPrice)).toBe(true);
    });
  });
});
