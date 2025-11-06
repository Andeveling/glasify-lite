/** biome-ignore-all lint/style/noMagicNumbers: Test file with expected numeric literal values for assertions */
import { Money } from "@domain/pricing/core/entities/money";
import { MarginCalculator } from "@domain/pricing/core/services/margin-calculator";
import { describe, expect, it } from "vitest";

describe("MarginCalculator", () => {
  describe("calculateSalesPrice", () => {
    it("should calculate sales price with profit margin", () => {
      const result = MarginCalculator.calculateSalesPrice(new Money(100), 20);

      // salesPrice = cost / (1 - margin/100)
      // salesPrice = 100 / (1 - 20/100) = 100 / 0.8 = 125
      expect(result.toNumber()).toBe(125);
    });

    it("should handle zero margin (cost equals sales price)", () => {
      const result = MarginCalculator.calculateSalesPrice(new Money(100), 0);

      // salesPrice = 100 / (1 - 0/100) = 100 / 1 = 100
      expect(result.toNumber()).toBe(100);
    });

    it("should handle high margin percentage", () => {
      const result = MarginCalculator.calculateSalesPrice(new Money(100), 50);

      // salesPrice = 100 / (1 - 50/100) = 100 / 0.5 = 200
      expect(result.toNumber()).toBe(200);
    });

    it("should handle low margin percentage", () => {
      const result = MarginCalculator.calculateSalesPrice(new Money(100), 5);

      // salesPrice = 100 / (1 - 5/100) = 100 / 0.95 = 105.26 (rounded)
      expect(result.toNumber()).toBe(105.26);
    });

    it("should handle zero cost", () => {
      const result = MarginCalculator.calculateSalesPrice(new Money(0), 20);

      // salesPrice = 0 / 0.8 = 0
      expect(result.toNumber()).toBe(0);
    });
  });

  describe("calculateModelSalesPrice - Scenario 1: Standard margin", () => {
    it("should apply margin to model cost (profile + glass)", () => {
      const result = MarginCalculator.calculateModelSalesPrice({
        modelCost: new Money(160), // profile: 100, glass: 60
        marginPercentage: 20,
      });

      // salesPrice = 160 / (1 - 20/100) = 160 / 0.8 = 200
      expect(result.toNumber()).toBe(200);
    });
  });

  describe("calculateModelSalesPrice - Scenario 2: High-end product", () => {
    it("should apply high margin to expensive model", () => {
      const result = MarginCalculator.calculateModelSalesPrice({
        modelCost: new Money(500),
        marginPercentage: 40,
      });

      // salesPrice = 500 / (1 - 40/100) = 500 / 0.6 = 833.33
      expect(result.toNumber()).toBe(833.33);
    });
  });

  describe("calculateModelSalesPrice - Scenario 3: Budget product", () => {
    it("should apply low margin to basic model", () => {
      const result = MarginCalculator.calculateModelSalesPrice({
        modelCost: new Money(80),
        marginPercentage: 15,
      });

      // salesPrice = 80 / (1 - 15/100) = 80 / 0.85 = 94.12
      expect(result.toNumber()).toBe(94.12);
    });
  });

  describe("edge cases", () => {
    it("should calculate margin on sales price (not on cost)", () => {
      // This test demonstrates the CORRECT formula vs the WRONG formula

      const cost = new Money(100);
      const margin = 20; // 20% margin on SALES price

      const result = MarginCalculator.calculateSalesPrice(cost, margin);

      // ✅ CORRECT (margin on sales):
      // salesPrice = cost / (1 - margin%) = 100 / 0.80 = $125
      // Verification: (125 - 100) / 125 = 25/125 = 0.20 = 20% ✓
      expect(result.toNumber()).toBe(125);

      // ❌ WRONG formula would be:
      // salesPrice = cost * (1 + margin%) = 100 * 1.20 = $120
      // This gives: (120 - 100) / 120 = 20/120 = 0.1667 = 16.67% ✗
      expect(result.toNumber()).not.toBe(120);
    });

    it("should handle margin close to 100% (very high profit)", () => {
      const result = MarginCalculator.calculateModelSalesPrice({
        modelCost: new Money(100),
        marginPercentage: 90,
      });

      // salesPrice = 100 / (1 - 90/100) = 100 / 0.1 = 1000
      expect(result.toNumber()).toBe(1000);
    });

    it("should handle fractional costs", () => {
      const result = MarginCalculator.calculateModelSalesPrice({
        modelCost: new Money(123.45),
        marginPercentage: 25,
      });

      // salesPrice = 123.45 / (1 - 25/100) = 123.45 / 0.75 = 164.6
      expect(result.toNumber()).toBe(164.6);
    });

    it("should handle very small margin", () => {
      const result = MarginCalculator.calculateModelSalesPrice({
        modelCost: new Money(100),
        marginPercentage: 1,
      });

      // salesPrice = 100 / (1 - 1/100) = 100 / 0.99 = 101.01
      expect(result.toNumber()).toBe(101.01);
    });
  });

  describe("business rules validation", () => {
    it("should verify margin is applied ONLY to model costs (not services)", () => {
      // This test documents that services are NOT included in model cost
      // Services are added AFTER margin is calculated
      const modelCost = new Money(200); // profile + glass only
      const serviceCost = new Money(50); // NOT included in margin calculation

      const modelSalesPrice = MarginCalculator.calculateModelSalesPrice({
        modelCost,
        marginPercentage: 20,
      });

      // Model with margin: 200 / 0.8 = 250
      // Final quote: 250 + 50 (services) = 300
      expect(modelSalesPrice.toNumber()).toBe(250);
      expect(modelSalesPrice.add(serviceCost).toNumber()).toBe(300);
    });

    it("should verify margin does not compound with color surcharge", () => {
      // Color is applied BEFORE margin (in profile/glass calculation)
      // Margin is applied to total model cost (which already includes color)
      const profileWithColor = new Money(110); // base 100 + 10% color
      const glassWithoutColor = new Money(60); // no color surcharge
      const totalModelCost = profileWithColor.add(glassWithoutColor);

      const result = MarginCalculator.calculateModelSalesPrice({
        modelCost: totalModelCost, // 170
        marginPercentage: 20,
      });

      // salesPrice = 170 / 0.8 = 212.5
      expect(result.toNumber()).toBe(212.5);
    });
  });
});
