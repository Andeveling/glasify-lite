/** biome-ignore-all lint/style/noMagicNumbers: Test file with expected numeric literal values for assertions */
import { Dimensions } from "@domain/pricing/core/entities/dimensions";
import { Money } from "@domain/pricing/core/entities/money";
import { ProfileCalculator } from "@domain/pricing/core/services/profile-calculator";
import { describe, expect, it } from "vitest";

describe("ProfileCalculator", () => {
  describe("calculateBaseCost", () => {
    it("should calculate base cost without color surcharge", () => {
      const result = ProfileCalculator.calculateBaseCost(new Money(100), 1);
      expect(result.toNumber()).toBe(100);
    });

    it("should calculate base cost with color surcharge", () => {
      const result = ProfileCalculator.calculateBaseCost(new Money(100), 1.1);
      expect(result.toNumber()).toBe(110);
    });

    it("should handle zero base price", () => {
      const result = ProfileCalculator.calculateBaseCost(new Money(0), 1.1);
      expect(result.toNumber()).toBe(0);
    });
  });

  describe("calculateWidthCost", () => {
    it("should calculate width cost for extra millimeters", () => {
      const result = ProfileCalculator.calculateWidthCost(
        new Money(0.1),
        200,
        1
      );
      expect(result.toNumber()).toBe(20);
    });

    it("should calculate width cost with color surcharge", () => {
      const result = ProfileCalculator.calculateWidthCost(
        new Money(0.1),
        200,
        1.1
      );
      expect(result.toNumber()).toBe(22);
    });

    it("should return zero when no extra millimeters", () => {
      const result = ProfileCalculator.calculateWidthCost(new Money(0.1), 0, 1);
      expect(result.toNumber()).toBe(0);
    });

    it("should handle zero cost per mm", () => {
      const result = ProfileCalculator.calculateWidthCost(
        new Money(0),
        200,
        1.1
      );
      expect(result.toNumber()).toBe(0);
    });
  });

  describe("calculateHeightCost", () => {
    it("should calculate height cost for extra millimeters", () => {
      const result = ProfileCalculator.calculateHeightCost(
        new Money(0.1),
        400,
        1
      );
      expect(result.toNumber()).toBe(40);
    });

    it("should calculate height cost with color surcharge", () => {
      const result = ProfileCalculator.calculateHeightCost(
        new Money(0.1),
        400,
        1.1
      );
      expect(result.toNumber()).toBe(44);
    });

    it("should return zero when no extra millimeters", () => {
      const result = ProfileCalculator.calculateHeightCost(
        new Money(0.1),
        0,
        1
      );
      expect(result.toNumber()).toBe(0);
    });

    it("should handle zero cost per mm", () => {
      const result = ProfileCalculator.calculateHeightCost(
        new Money(0),
        400,
        1.1
      );
      expect(result.toNumber()).toBe(0);
    });
  });

  describe("calculateProfileCost - Scenario 1: Exact minimum dimensions", () => {
    it("should charge only base price when dimensions equal minimums", () => {
      const dimensions = new Dimensions({
        widthMm: 800,
        heightMm: 800,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ProfileCalculator.calculateProfileCost({
        basePrice: new Money(100),
        costPerMmWidth: new Money(0.1),
        costPerMmHeight: new Money(0.1),
        dimensions,
        colorMultiplier: 1,
      });

      // No extra mm, so only base price
      expect(result.toNumber()).toBe(100);
    });
  });

  describe("calculateProfileCost - Scenario 2: Above minimum dimensions", () => {
    it("should charge base price + extra mm costs (1000x1200mm, min 800x800mm)", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 1200,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ProfileCalculator.calculateProfileCost({
        basePrice: new Money(100),
        costPerMmWidth: new Money(0.1),
        costPerMmHeight: new Money(0.1),
        dimensions,
        colorMultiplier: 1,
      });

      // base: 100, width: 0.1 * 200 = 20, height: 0.1 * 400 = 40
      expect(result.toNumber()).toBe(160);
    });
  });

  describe("calculateProfileCost - Scenario 3: Below minimum dimensions", () => {
    it("should charge only base price when dimensions below minimums (700x900mm, min 800x800mm)", () => {
      const dimensions = new Dimensions({
        widthMm: 700,
        heightMm: 900,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ProfileCalculator.calculateProfileCost({
        basePrice: new Money(100),
        costPerMmWidth: new Money(0.1),
        costPerMmHeight: new Money(0.1),
        dimensions,
        colorMultiplier: 1,
      });

      // Both dimensions clamped to 0 extra mm
      // effectiveWidth = max(700 - 800, 0) = 0
      // effectiveHeight = max(900 - 800, 0) = 100
      // base: 100, width: 0, height: 0.1 * 100 = 10
      expect(result.toNumber()).toBe(110);
    });
  });

  describe("calculateProfileCost - with color surcharge", () => {
    it("should apply color surcharge to all components", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 1200,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ProfileCalculator.calculateProfileCost({
        basePrice: new Money(100),
        costPerMmWidth: new Money(0.1),
        costPerMmHeight: new Money(0.1),
        dimensions,
        colorMultiplier: 1.1, // 10% surcharge
      });

      // base: 100 * 1.1 = 110
      // width: (0.1 * 1.1) * 200 = 0.11 * 200 = 22
      // height: (0.1 * 1.1) * 400 = 0.11 * 400 = 44
      // total: 110 + 22 + 44 = 176
      expect(result.toNumber()).toBe(176);
    });
  });

  describe("edge cases", () => {
    it("should handle zero per-mm costs", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 1200,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ProfileCalculator.calculateProfileCost({
        basePrice: new Money(100),
        costPerMmWidth: new Money(0),
        costPerMmHeight: new Money(0),
        dimensions,
        colorMultiplier: 1,
      });

      expect(result.toNumber()).toBe(100);
    });

    it("should handle zero base price", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 1200,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ProfileCalculator.calculateProfileCost({
        basePrice: new Money(0),
        costPerMmWidth: new Money(0.1),
        costPerMmHeight: new Money(0.1),
        dimensions,
        colorMultiplier: 1,
      });

      // width: 0.1 * 200 = 20, height: 0.1 * 400 = 40
      expect(result.toNumber()).toBe(60);
    });

    it("should handle zero color multiplier", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 1200,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ProfileCalculator.calculateProfileCost({
        basePrice: new Money(100),
        costPerMmWidth: new Money(0.1),
        costPerMmHeight: new Money(0.1),
        dimensions,
        colorMultiplier: 0,
      });

      // All costs zeroed by multiplier
      expect(result.toNumber()).toBe(0);
    });
  });
});
