/** biome-ignore-all lint/style/noMagicNumbers: Test file with expected numeric literal values for assertions */
import { Dimensions } from "@domain/pricing/core/entities/dimensions";
import { Money } from "@domain/pricing/core/entities/money";
import { CalculateItemPrice } from "@domain/pricing/use-cases/calculate-item-price";
import { describe, expect, it } from "vitest";

describe("CalculateItemPrice", () => {
  describe("Input Validation", () => {
    it("should reject dimensions with zero width", () => {
      const invalidInput = {
        dimensions: new Dimensions({
          widthMm: 0,
          heightMm: 2000,
          minWidthMm: 800,
          minHeightMm: 800,
        }),
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
        },
        colorMultiplier: 1.0,
      };

      expect(() => CalculateItemPrice.execute(invalidInput)).toThrow(
        "Width must be greater than 0"
      );
    });

    it("should reject dimensions with negative width", () => {
      const invalidInput = {
        dimensions: new Dimensions({
          widthMm: -1000,
          heightMm: 2000,
          minWidthMm: 800,
          minHeightMm: 800,
        }),
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
        },
        colorMultiplier: 1.0,
      };

      expect(() => CalculateItemPrice.execute(invalidInput)).toThrow(
        "Width must be greater than 0"
      );
    });

    it("should reject dimensions with zero height", () => {
      const invalidInput = {
        dimensions: new Dimensions({
          widthMm: 1000,
          heightMm: 0,
          minWidthMm: 800,
          minHeightMm: 800,
        }),
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
        },
        colorMultiplier: 1.0,
      };

      expect(() => CalculateItemPrice.execute(invalidInput)).toThrow(
        "Height must be greater than 0"
      );
    });

    it("should reject dimensions with negative height", () => {
      const invalidInput = {
        dimensions: new Dimensions({
          widthMm: 1000,
          heightMm: -2000,
          minWidthMm: 800,
          minHeightMm: 800,
        }),
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
        },
        colorMultiplier: 1.0,
      };

      expect(() => CalculateItemPrice.execute(invalidInput)).toThrow(
        "Height must be greater than 0"
      );
    });

    it("should reject color multiplier less than 1.0", () => {
      const invalidInput = {
        dimensions: new Dimensions({
          widthMm: 1000,
          heightMm: 2000,
          minWidthMm: 800,
          minHeightMm: 800,
        }),
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
        },
        colorMultiplier: 0.9,
      };

      expect(() => CalculateItemPrice.execute(invalidInput)).toThrow(
        "Color multiplier must be at least 1.0"
      );
    });

    it("should accept color multiplier equal to 1.0", () => {
      const validInput = {
        dimensions: new Dimensions({
          widthMm: 1000,
          heightMm: 2000,
          minWidthMm: 800,
          minHeightMm: 800,
        }),
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
        },
        colorMultiplier: 1.0,
      };

      expect(() => CalculateItemPrice.execute(validInput)).not.toThrow();
    });

    it("should accept color multiplier greater than 1.0", () => {
      const validInput = {
        dimensions: new Dimensions({
          widthMm: 1000,
          heightMm: 2000,
          minWidthMm: 800,
          minHeightMm: 800,
        }),
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
        },
        colorMultiplier: 1.1,
      };

      expect(() => CalculateItemPrice.execute(validInput)).not.toThrow();
    });
  });

  describe("Delegation to PriceCalculation", () => {
    it("should delegate to PriceCalculation.calculate with valid input", () => {
      const input = {
        dimensions: new Dimensions({
          widthMm: 1000,
          heightMm: 2000,
          minWidthMm: 800,
          minHeightMm: 800,
        }),
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
        },
        colorMultiplier: 1.0,
      };

      const result = CalculateItemPrice.execute(input);

      // Verify result structure
      expect(result).toHaveProperty("profileCost");
      expect(result).toHaveProperty("glassCost");
      expect(result).toHaveProperty("accessoryCost");
      expect(result).toHaveProperty("services");
      expect(result).toHaveProperty("adjustments");
      expect(result).toHaveProperty("subtotal");

      // Verify result values (delegation worked)
      expect(result.profileCost.toNumber()).toBe(560);
      expect(result.glassCost.toNumber()).toBe(0);
      expect(result.accessoryCost.toNumber()).toBe(0);
      expect(result.subtotal.toNumber()).toBe(560);
    });

    it("should pass through glass pricing if provided", () => {
      const input = {
        dimensions: new Dimensions({
          widthMm: 1000,
          heightMm: 2000,
          minWidthMm: 800,
          minHeightMm: 800,
        }),
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
      };

      const result = CalculateItemPrice.execute(input);

      expect(result.glassCost.toNumber()).toBe(98.51);
      expect(result.subtotal.toNumber()).toBe(658.51);
    });

    it("should pass through services if provided", () => {
      const input = {
        dimensions: new Dimensions({
          widthMm: 1000,
          heightMm: 2000,
          minWidthMm: 800,
          minHeightMm: 800,
        }),
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
        ],
      };

      const result = CalculateItemPrice.execute(input);

      expect(result.services).toHaveLength(1);
      expect(result.subtotal.toNumber()).toBe(660);
    });

    it("should pass through adjustments if provided", () => {
      const input = {
        dimensions: new Dimensions({
          widthMm: 1000,
          heightMm: 2000,
          minWidthMm: 800,
          minHeightMm: 800,
        }),
        modelPrices: {
          basePrice: new Money(100),
          costPerMmWidth: new Money(0.5),
          costPerMmHeight: new Money(0.3),
        },
        colorMultiplier: 1.0,
        adjustments: [
          {
            adjustmentId: "adj-1",
            concept: "Descuento",
            unit: "unit" as const,
            value: 50,
            isPositive: false,
          },
        ],
      };

      const result = CalculateItemPrice.execute(input);

      expect(result.adjustments).toHaveLength(1);
      expect(result.subtotal.toNumber()).toBe(510);
    });
  });
});
