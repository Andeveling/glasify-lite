/** biome-ignore-all lint/style/noMagicNumbers: Test file with expected numeric literal values for assertions */
import { Money } from "@domain/pricing/core/entities/money";
import { AccessoryCalculator } from "@domain/pricing/core/services/accessory-calculator";
import { describe, expect, it } from "vitest";

describe("AccessoryCalculator", () => {
  describe("calculateAccessoryCost", () => {
    it("should calculate accessory cost without color surcharge", () => {
      const result = AccessoryCalculator.calculateAccessoryCost(
        new Money(50),
        1
      );
      expect(result.toNumber()).toBe(50);
    });

    it("should calculate accessory cost with color surcharge", () => {
      const result = AccessoryCalculator.calculateAccessoryCost(
        new Money(50),
        1.1
      );
      // 50 × 1.1 = 55
      expect(result.toNumber()).toBe(55);
    });

    it("should return zero when accessory price is zero", () => {
      const result = AccessoryCalculator.calculateAccessoryCost(
        new Money(0),
        1.1
      );
      expect(result.toNumber()).toBe(0);
    });

    it("should handle high color surcharge", () => {
      const result = AccessoryCalculator.calculateAccessoryCost(
        new Money(100),
        1.5
      );
      // 100 × 1.5 = 150
      expect(result.toNumber()).toBe(150);
    });

    it("should handle zero color multiplier", () => {
      const result = AccessoryCalculator.calculateAccessoryCost(
        new Money(100),
        0
      );
      expect(result.toNumber()).toBe(0);
    });
  });

  describe("business rules validation", () => {
    it("should verify color is applied to accessory price", () => {
      const accessoryPrice = new Money(75);
      const colorMultiplier = 1.2; // 20% surcharge

      const result = AccessoryCalculator.calculateAccessoryCost(
        accessoryPrice,
        colorMultiplier
      );

      // 75 × 1.2 = 90
      expect(result.toNumber()).toBe(90);
    });

    it("should work consistently with ProfileCalculator color logic", () => {
      // Both should use same color multiplier approach
      const colorMultiplier = 1.15; // 15% surcharge

      const accessoryCost = AccessoryCalculator.calculateAccessoryCost(
        new Money(50),
        colorMultiplier
      );

      // Verify multiplication approach
      // 50 × 1.15 = 57.5
      expect(accessoryCost.toNumber()).toBe(57.5);
    });
  });
});
