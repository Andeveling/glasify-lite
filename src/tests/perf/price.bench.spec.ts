import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it } from "vitest";
import type { PriceItemCalculationInput } from "@/server/price/price-item";
import { calculatePriceItem } from "@/server/price/price-item";

describe("Performance Tests: Price Calculation", () => {
  // Base test data for performance tests
  const baseModel = {
    accessoryPrice: 25_000,
    basePrice: 150_000,
    costPerMmHeight: 60,
    costPerMmWidth: 75,
  };

  const baseInput: PriceItemCalculationInput = {
    adjustments: [],
    heightMm: 1000,
    includeAccessory: true,
    model: baseModel,
    services: [],
    widthMm: 1200,
  };

  describe("Basic Price Calculation Performance", () => {
    it("should calculate basic price under 200ms", () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        calculatePriceItem(baseInput);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / 100;

      // Each calculation should be well under 200ms requirement
      expect(averageTime).toBeLessThan(2); // 2ms per calculation is very generous
      expect(totalTime).toBeLessThan(200); // 100 calculations in under 200ms
    });

    it("should handle large dimensions efficiently", () => {
      const startTime = performance.now();

      calculatePriceItem({
        ...baseInput,
        heightMm: 3000,
        widthMm: 5000,
      });

      const endTime = performance.now();
      const calculationTime = endTime - startTime;

      expect(calculationTime).toBeLessThan(5); // Should be very fast
    });

    it("should handle Decimal inputs efficiently", () => {
      const startTime = performance.now();

      calculatePriceItem({
        ...baseInput,
        model: {
          accessoryPrice: new Decimal("25000.00"),
          basePrice: new Decimal("150000.50"),
          costPerMmHeight: new Decimal("60.75"),
          costPerMmWidth: new Decimal("75.25"),
        },
      });

      const endTime = performance.now();
      const calculationTime = endTime - startTime;

      expect(calculationTime).toBeLessThan(10); // Decimal operations might be slightly slower
    });
  });

  describe("Service Calculation Performance", () => {
    it("should calculate with multiple services efficiently", () => {
      const serviceInput: PriceItemCalculationInput = {
        ...baseInput,
        services: [
          {
            rate: 15_000,
            serviceId: "service1",
            type: "area",
            unit: "sqm",
          },
          {
            rate: 3000,
            serviceId: "service2",
            type: "perimeter",
            unit: "ml",
          },
          {
            quantityOverride: 2,
            rate: 12_000,
            serviceId: "service3",
            type: "fixed",
            unit: "unit",
          },
        ],
      };

      const startTime = performance.now();

      for (let i = 0; i < 50; i++) {
        calculatePriceItem(serviceInput);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const averageTime = totalTime / 50;

      expect(averageTime).toBeLessThan(4); // 4ms per calculation with services
      expect(totalTime).toBeLessThan(200); // 50 calculations in under 200ms
    });

    it("should handle many services efficiently", () => {
      const manyServices = Array.from({ length: 10 }, (_, i) => ({
        rate: 10_000 + i * 1000,
        serviceId: `service${i + 1}`,
        type: "area" as const,
        unit: "sqm" as const,
      }));

      const startTime = performance.now();

      calculatePriceItem({
        ...baseInput,
        services: manyServices,
      });

      const endTime = performance.now();
      const calculationTime = endTime - startTime;

      expect(calculationTime).toBeLessThan(20); // Should handle 10 services quickly
    });
  });

  describe("Complex Scenario Performance", () => {
    it("should meet 200ms requirement for complex scenarios", () => {
      const complexInput: PriceItemCalculationInput = {
        adjustments: [
          {
            concept: "Descuento cliente corporativo",
            sign: "negative",
            unit: "unit",
            value: new Decimal("50000.00"),
          },
          {
            concept: "Recargo por tamaño especial",
            sign: "positive",
            unit: "sqm",
            value: new Decimal("8000.00"),
          },
        ],
        heightMm: 2000,
        includeAccessory: true,
        model: {
          accessoryPrice: new Decimal("35000.00"),
          basePrice: new Decimal("200000.00"),
          costPerMmHeight: new Decimal("65.75"),
          costPerMmWidth: new Decimal("80.50"),
        },
        services: [
          {
            rate: new Decimal("4500.00"),
            serviceId: "cutting",
            type: "perimeter",
            unit: "ml",
          },
          {
            rate: new Decimal("18000.00"),
            serviceId: "polishing",
            type: "area",
            unit: "sqm",
          },
          {
            quantityOverride: 1,
            rate: new Decimal("75000.00"),
            serviceId: "installation",
            type: "fixed",
            unit: "unit",
          },
        ],
        widthMm: 2500,
      };

      const startTime = performance.now();

      // Single complex calculation
      const result = calculatePriceItem(complexInput);

      const endTime = performance.now();
      const calculationTime = endTime - startTime;

      // Should be much faster than 200ms requirement
      expect(calculationTime).toBeLessThan(50);
      expect(result.subtotal).toBeGreaterThan(0);
    });

    it("should handle 50 calculations under 200ms total", () => {
      const variations = Array.from({ length: 50 }, (_, i) => ({
        ...baseInput,
        adjustments: [
          {
            concept: `Ajuste ${i}`,
            sign: i % 2 === 0 ? ("positive" as const) : ("negative" as const),
            unit: "unit" as const,
            value: 5000 + i * 200,
          },
        ],
        heightMm: 800 + i * 40,
        services: [
          {
            rate: 15_000 + i * 100,
            serviceId: "service1",
            type: "area" as const,
            unit: "sqm" as const,
          },
        ],
        widthMm: 1000 + i * 50,
      }));

      const startTime = performance.now();
      for (const variation of variations) {
        calculatePriceItem(variation);
      }
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // 50 different calculations should complete well under 200ms
      expect(totalTime).toBeLessThan(200);

      console.log(
        `50 complex calculations completed in ${totalTime.toFixed(2)}ms`
      );
      console.log(
        `Average time per calculation: ${(totalTime / 50).toFixed(2)}ms`
      );
    });
  });

  describe("Real-world Performance Scenarios", () => {
    it("should handle quote with multiple items efficiently", () => {
      // Simulate calculating multiple items for a single quote
      const items = [
        { heightMm: 800, widthMm: 1000 },
        { heightMm: 1000, widthMm: 1200 },
        { heightMm: 600, widthMm: 800 },
        { heightMm: 1200, widthMm: 1500 },
        { heightMm: 700, widthMm: 900 },
      ];

      const startTime = performance.now();

      const results = items.map((item) =>
        calculatePriceItem({
          ...baseInput,
          ...item,
          services: [
            {
              rate: 3000,
              serviceId: "cutting",
              type: "perimeter",
              unit: "ml",
            },
          ],
        })
      );

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(50); // 5 items in under 50ms
      expect(results).toHaveLength(5);
      for (const result of results) {
        expect(result.subtotal).toBeGreaterThan(0);
      }
    });

    it("should maintain consistent performance over time", () => {
      const measurements: number[] = [];

      // Take 10 measurements of 10 calculations each
      for (let batch = 0; batch < 10; batch++) {
        const batchStart = performance.now();

        for (let i = 0; i < 10; i++) {
          calculatePriceItem({
            ...baseInput,
            heightMm: 800 + i * 80,
            widthMm: 1000 + i * 100,
          });
        }

        const batchEnd = performance.now();
        measurements.push(batchEnd - batchStart);
      }

      const averageTime =
        measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
      const maxTime = Math.max(...measurements);
      const minTime = Math.min(...measurements);
      const variance = maxTime - minTime;

      // Performance should be consistent
      expect(averageTime).toBeLessThan(20); // Average batch under 20ms
      expect(maxTime).toBeLessThan(50); // No batch over 50ms
      expect(variance).toBeLessThan(30); // Reasonable variance

      console.log(
        `Performance consistency: avg=${averageTime.toFixed(2)}ms, min=${minTime.toFixed(2)}ms, max=${maxTime.toFixed(2)}ms`
      );
    });
  });
});
