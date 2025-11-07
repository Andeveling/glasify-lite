/** biome-ignore-all lint/style/noMagicNumbers: Test file with expected numeric literal values for assertions */

import { ROUND_SCALE } from "@domain/pricing/core/constants";
import { Money } from "@domain/pricing/core/entities/money";
import { Decimal } from "decimal.js";
// biome-ignore lint/performance/noNamespaceImport: fast-check requires namespace import for property-based testing
import * as fc from "fast-check";
import { describe, expect, it } from "vitest";

describe("Money", () => {
  describe("creation", () => {
    it("should create Money from Decimal", () => {
      const money = new Money(new Decimal("100.50"));
      expect(money.toNumber()).toBe(100.5);
    });

    it("should create Money from number", () => {
      const money = new Money(100.5);
      expect(money.toNumber()).toBe(100.5);
    });

    it("should create Money from string", () => {
      const money = new Money("100.50");
      expect(money.toNumber()).toBe(100.5);
    });

    it("should handle zero value", () => {
      const money = new Money(0);
      expect(money.toNumber()).toBe(0);
    });

    it("should handle negative values", () => {
      const money = new Money(-50.25);
      expect(money.toNumber()).toBe(-50.25);
    });
  });

  describe("arithmetic operations", () => {
    it("should add two Money instances", () => {
      const money1 = new Money(100.5);
      const money2 = new Money(50.25);
      const result = money1.add(money2);
      expect(result.toNumber()).toBe(150.75);
    });

    it("should multiply Money by a factor", () => {
      const money = new Money(100);
      const result = money.multiply(1.1);
      expect(result.toNumber()).toBe(110);
    });

    it("should multiply Money by Decimal factor", () => {
      const money = new Money(100);
      const result = money.multiply(new Decimal("1.10"));
      expect(result.toNumber()).toBe(110);
    });

    it("should divide Money by a divisor", () => {
      const money = new Money(100);
      const result = money.divide(4);
      expect(result.toNumber()).toBe(25);
    });

    it("should divide Money by Decimal divisor", () => {
      const money = new Money(100);
      const result = money.divide(new Decimal("4"));
      expect(result.toNumber()).toBe(25);
    });
  });

  describe("rounding", () => {
    it(`should round to ${ROUND_SCALE} decimal places using ROUND_HALF_UP`, () => {
      const money = new Money("100.126"); // Should round to 100.13
      expect(money.toNumber()).toBe(100.13);
    });

    it("should round 0.125 up to 0.13 (ROUND_HALF_UP)", () => {
      const money = new Money("0.125");
      expect(money.toNumber()).toBe(0.13);
    });

    it("should round 0.124 down to 0.12", () => {
      const money = new Money("0.124");
      expect(money.toNumber()).toBe(0.12);
    });

    it("should preserve exact 2-decimal values", () => {
      const money = new Money("100.50");
      expect(money.toNumber()).toBe(100.5);
    });
  });

  describe("immutability", () => {
    it("should return new instance on add", () => {
      const original = new Money(100);
      const result = original.add(new Money(50));
      expect(result).not.toBe(original);
      expect(original.toNumber()).toBe(100);
      expect(result.toNumber()).toBe(150);
    });

    it("should return new instance on multiply", () => {
      const original = new Money(100);
      const result = original.multiply(2);
      expect(result).not.toBe(original);
      expect(original.toNumber()).toBe(100);
      expect(result.toNumber()).toBe(200);
    });

    it("should return new instance on divide", () => {
      const original = new Money(100);
      const result = original.divide(2);
      expect(result).not.toBe(original);
      expect(original.toNumber()).toBe(100);
      expect(result.toNumber()).toBe(50);
    });
  });

  describe("decimal precision", () => {
    it("should handle 0.1 + 0.2 = 0.3 correctly (no floating-point error)", () => {
      const money1 = new Money(0.1);
      const money2 = new Money(0.2);
      const result = money1.add(money2);
      expect(result.toNumber()).toBe(0.3); // Not 0.30000000000000004
    });

    it("should handle multiple decimal operations without accumulating errors", () => {
      let money = new Money(0.1);
      for (let i = 0; i < 10; i++) {
        money = money.add(new Money(0.1));
      }
      expect(money.toNumber()).toBe(1.1);
    });

    it("should handle division that produces repeating decimals", () => {
      const money = new Money(10);
      const result = money.divide(3);
      // 10 / 3 = 3.333... → rounds to 3.33
      expect(result.toNumber()).toBe(3.33);
    });
  });

  describe("property-based tests", () => {
    it("should satisfy commutativity: a + b = b + a", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 10_000, noNaN: true }),
          fc.float({ min: 0, max: 10_000, noNaN: true }),
          (a, b) => {
            const money1 = new Money(a);
            const money2 = new Money(b);
            const result1 = money1.add(money2).toNumber();
            const result2 = money2.add(money1).toNumber();
            expect(result1).toBe(result2);
          }
        )
      );
    });

    it("should satisfy associativity: (a + b) + c = a + (b + c)", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 1000, noNaN: true }),
          fc.float({ min: 0, max: 1000, noNaN: true }),
          fc.float({ min: 0, max: 1000, noNaN: true }),
          (a, b, c) => {
            const moneyA = new Money(a);
            const moneyB = new Money(b);
            const moneyC = new Money(c);
            const result1 = moneyA.add(moneyB).add(moneyC).toNumber();
            const result2 = moneyA.add(moneyB.add(moneyC)).toNumber();
            // Allow small rounding differences due to order of operations
            expect(Math.abs(result1 - result2)).toBeLessThan(0.01);
          }
        )
      );
    });

    it("should satisfy distributivity: a × (b + c) ≈ (a × b) + (a × c)", () => {
      fc.assert(
        fc.property(
          fc.float({ min: 1, max: 100, noNaN: true }),
          fc.float({ min: 1, max: 100, noNaN: true }),
          fc.float({ min: 1, max: 100, noNaN: true }),
          (a, b, c) => {
            const moneyB = new Money(b);
            const moneyC = new Money(c);
            const result1 = moneyB.add(moneyC).multiply(a).toNumber();
            const result2 = moneyB
              .multiply(a)
              .add(moneyC.multiply(a))
              .toNumber();
            // Allow rounding differences due to 2-decimal precision
            // With ROUND_SCALE=2, differences can accumulate
            expect(Math.abs(result1 - result2)).toBeLessThan(0.02);
          }
        )
      );
    });
  });
});
