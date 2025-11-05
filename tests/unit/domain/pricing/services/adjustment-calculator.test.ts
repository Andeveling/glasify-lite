/** biome-ignore-all lint/style/noMagicNumbers: Test file with expected numeric literal values for assertions */
import { Dimensions } from "@domain/pricing/core/entities/dimensions";
import { AdjustmentCalculator } from "@domain/pricing/core/services/adjustment-calculator";
import { describe, expect, it } from "vitest";

describe("AdjustmentCalculator", () => {
  it("should calculate positive adjustment based on area", () => {
    const dimensions = new Dimensions({
      widthMm: 1000,
      heightMm: 2000,
      minWidthMm: 800,
      minHeightMm: 800,
    });

    const adjustments = [
      {
        adjustmentId: "adj-1",
        concept: "Recargo por seguro",
        unit: "sqm" as const,
        value: 10,
        isPositive: true,
      },
    ];

    const result = AdjustmentCalculator.calculateAdjustments(adjustments, dimensions);
  expect(result).toHaveLength(1);
    const first = result[0];
    expect(first).toBeDefined();
    if (first) {
      expect(first.adjustmentId).toBe("adj-1");
      // area = 1.0 * 2.0 = 2.0 → amount = 2 * 10 = 20
      expect(first.amount).toBe(20);
    }
  });

  it("should calculate negative adjustment based on perimeter", () => {
    const dimensions = new Dimensions({
      widthMm: 1000,
      heightMm: 2000,
      minWidthMm: 800,
      minHeightMm: 800,
    });

    const adjustments = [
      {
        adjustmentId: "adj-2",
        concept: "Descuento promocional",
        unit: "ml" as const,
        value: 5,
        isPositive: false,
      },
    ];

  const result = AdjustmentCalculator.calculateAdjustments(adjustments, dimensions);
  expect(result).toHaveLength(1);
    const firstNeg = result[0];
    expect(firstNeg).toBeDefined();
    if (firstNeg) {
      // perimeter = 2 * (1 + 2) = 6 → amount = - (6 * 5) = -30
      expect(firstNeg.amount).toBe(-30);
    }
  });

  it("should return empty array when no adjustments", () => {
    const dimensions = new Dimensions({
      widthMm: 1000,
      heightMm: 2000,
      minWidthMm: 800,
      minHeightMm: 800,
    });

    const result = AdjustmentCalculator.calculateAdjustments([], dimensions);
    expect(result).toHaveLength(0);
  });
});
