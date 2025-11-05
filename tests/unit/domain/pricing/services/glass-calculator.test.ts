/** biome-ignore-all lint/style/noMagicNumbers: Test file with expected numeric literal values for assertions */
import { Dimensions } from "@domain/pricing/core/entities/dimensions";
import { Money } from "@domain/pricing/core/entities/money";
import { GlassCalculator } from "@domain/pricing/core/services/glass-calculator";
import { describe, expect, it } from "vitest";

describe("GlassCalculator", () => {
  describe("calculateBillableArea", () => {
    it("should calculate billable area with profile discounts", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 1200,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = GlassCalculator.calculateBillableArea(dimensions, 40, 40);

      // (1000 - 40) × (1200 - 40) = 960 × 1160 = 1,113,600 mm²
      // 1,113,600 ÷ 1,000,000 = 1.1136 m²
      expect(result).toBe(1.1136);
    });

    it("should calculate billable area without profile discounts", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 1200,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = GlassCalculator.calculateBillableArea(dimensions, 0, 0);

      // 1000 × 1200 = 1,200,000 mm²
      // 1,200,000 ÷ 1,000,000 = 1.2 m²
      expect(result).toBe(1.2);
    });

    it("should handle minimum dimensions", () => {
      const dimensions = new Dimensions({
        widthMm: 800,
        heightMm: 800,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = GlassCalculator.calculateBillableArea(dimensions, 40, 40);

      // (800 - 40) × (800 - 40) = 760 × 760 = 577,600 mm²
      // 577,600 ÷ 1,000,000 = 0.5776 m²
      expect(result).toBe(0.5776);
    });

    it("should handle asymmetric profile discounts", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 1200,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = GlassCalculator.calculateBillableArea(dimensions, 20, 50);

      // (1000 - 20) × (1200 - 50) = 980 × 1150 = 1,127,000 mm²
      // 1,127,000 ÷ 1,000,000 = 1.127 m²
      expect(result).toBe(1.127);
    });
  });

  describe("calculateGlassCost - Scenario 1: Standard glass with discounts", () => {
    it("should calculate glass cost for 1000x1200mm with 40mm profile discounts", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 1200,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = GlassCalculator.calculateGlassCost({
        pricePerM2: new Money(50),
        dimensions,
        profileDiscountWidthMm: 40,
        profileDiscountHeightMm: 40,
      });

      // Area: 1.1136 m²
      // Cost: 1.1136 × 50 = 55.68
      expect(result.toNumber()).toBe(55.68);
    });
  });

  describe("calculateGlassCost - Scenario 2: No profile discounts", () => {
    it("should calculate glass cost without profile discounts", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 1200,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = GlassCalculator.calculateGlassCost({
        pricePerM2: new Money(50),
        dimensions,
        profileDiscountWidthMm: 0,
        profileDiscountHeightMm: 0,
      });

      // Area: 1.2 m²
      // Cost: 1.2 × 50 = 60
      expect(result.toNumber()).toBe(60);
    });
  });

  describe("calculateGlassCost - Scenario 3: Minimum dimensions", () => {
    it("should calculate glass cost for minimum dimensions with discounts", () => {
      const dimensions = new Dimensions({
        widthMm: 800,
        heightMm: 800,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = GlassCalculator.calculateGlassCost({
        pricePerM2: new Money(50),
        dimensions,
        profileDiscountWidthMm: 40,
        profileDiscountHeightMm: 40,
      });

      // Area: 0.5776 m²
      // Cost: 0.5776 × 50 = 28.88
      expect(result.toNumber()).toBe(28.88);
    });
  });

  describe("edge cases", () => {
    it("should handle zero price per m²", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 1200,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = GlassCalculator.calculateGlassCost({
        pricePerM2: new Money(0),
        dimensions,
        profileDiscountWidthMm: 40,
        profileDiscountHeightMm: 40,
      });

      expect(result.toNumber()).toBe(0);
    });

    it("should handle large dimensions", () => {
      const dimensions = new Dimensions({
        widthMm: 3000,
        heightMm: 2500,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = GlassCalculator.calculateGlassCost({
        pricePerM2: new Money(50),
        dimensions,
        profileDiscountWidthMm: 40,
        profileDiscountHeightMm: 40,
      });

      // (3000 - 40) × (2500 - 40) = 2960 × 2460 = 7,281,600 mm²
      // 7,281,600 ÷ 1,000,000 = 7.2816 m²
      // Cost: 7.2816 × 50 = 364.08
      expect(result.toNumber()).toBe(364.08);
    });

    it("should handle very small billable area after discounts", () => {
      const dimensions = new Dimensions({
        widthMm: 100,
        heightMm: 100,
        minWidthMm: 50,
        minHeightMm: 50,
      });

      const result = GlassCalculator.calculateGlassCost({
        pricePerM2: new Money(50),
        dimensions,
        profileDiscountWidthMm: 40,
        profileDiscountHeightMm: 40,
      });

      // (100 - 40) × (100 - 40) = 60 × 60 = 3,600 mm²
      // 3,600 ÷ 1,000,000 = 0.0036 m²
      // Cost: 0.0036 × 50 = 0.18
      expect(result.toNumber()).toBe(0.18);
    });
  });
});
