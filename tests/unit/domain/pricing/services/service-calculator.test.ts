/** biome-ignore-all lint/style/noMagicNumbers: Test file with expected numeric literal values for assertions */
import { Dimensions } from "@domain/pricing/core/entities/dimensions";
import { Money } from "@domain/pricing/core/entities/money";
import { ServiceCalculator } from "@domain/pricing/core/services/service-calculator";
import { ServiceUnit } from "@domain/pricing/core/types";
import { describe, expect, it } from "vitest";

describe("ServiceCalculator", () => {
  describe("calculateFixedQuantity", () => {
    it("should return 1 when no quantity override", () => {
      const result = ServiceCalculator.calculateFixedQuantity();
      expect(result).toBe(1);
    });

    it("should return quantity override when provided", () => {
      const result = ServiceCalculator.calculateFixedQuantity(5);
      expect(result).toBe(5);
    });

    it("should handle zero quantity override", () => {
      const result = ServiceCalculator.calculateFixedQuantity(0);
      expect(result).toBe(0);
    });
  });

  describe("calculateAreaQuantity", () => {
    it("should calculate area in m² for standard dimensions", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ServiceCalculator.calculateAreaQuantity(dimensions);

      // 1.0m × 2.0m = 2.0 m²
      expect(result).toBe(2.0);
    });

    it("should round area to 2 decimals", () => {
      const dimensions = new Dimensions({
        widthMm: 1234,
        heightMm: 5678,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ServiceCalculator.calculateAreaQuantity(dimensions);

      // 1.234m × 5.678m = 7.006652 m² → rounds to 7.01
      expect(result).toBe(7.01);
    });

    it("should handle minimum dimensions", () => {
      const dimensions = new Dimensions({
        widthMm: 800,
        heightMm: 800,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ServiceCalculator.calculateAreaQuantity(dimensions);

      // 0.8m × 0.8m = 0.64 m²
      expect(result).toBe(0.64);
    });
  });

  describe("calculatePerimeterQuantity", () => {
    it("should calculate perimeter in linear meters", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ServiceCalculator.calculatePerimeterQuantity(dimensions);

      // 2 × (1.0m + 2.0m) = 2 × 3.0 = 6.0 ml
      expect(result).toBe(6.0);
    });

    it("should round perimeter to 2 decimals", () => {
      const dimensions = new Dimensions({
        widthMm: 1234,
        heightMm: 5678,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ServiceCalculator.calculatePerimeterQuantity(dimensions);

      // 2 × (1.234m + 5.678m) = 2 × 6.912 = 13.824 ml → rounds to 13.82
      expect(result).toBe(13.82);
    });

    it("should handle square dimensions", () => {
      const dimensions = new Dimensions({
        widthMm: 1500,
        heightMm: 1500,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ServiceCalculator.calculatePerimeterQuantity(dimensions);

      // 2 × (1.5m + 1.5m) = 2 × 3.0 = 6.0 ml
      expect(result).toBe(6.0);
    });
  });

  describe("applyMinimumBillingUnit", () => {
    it("should return original quantity when above minimum", () => {
      const result = ServiceCalculator.applyMinimumBillingUnit(3.0, 2.0);
      expect(result).toBe(3.0);
    });

    it("should return minimum when quantity below minimum", () => {
      const result = ServiceCalculator.applyMinimumBillingUnit(1.5, 2.0);
      expect(result).toBe(2.0);
    });

    it("should return quantity when equal to minimum", () => {
      const result = ServiceCalculator.applyMinimumBillingUnit(2.0, 2.0);
      expect(result).toBe(2.0);
    });

    it("should return quantity when no minimum provided", () => {
      const result = ServiceCalculator.applyMinimumBillingUnit(1.5);
      expect(result).toBe(1.5);
    });

    it("should handle zero minimum", () => {
      const result = ServiceCalculator.applyMinimumBillingUnit(1.5, 0);
      expect(result).toBe(1.5);
    });
  });

  describe("calculateServiceAmount - Fixed Service", () => {
    it("should calculate amount for fixed service (quantity=1)", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ServiceCalculator.calculateServiceAmount(
        {
          serviceId: "service-1",
          name: "Instalación",
          unit: ServiceUnit.UNIT,
          rate: new Money(100),
        },
        dimensions
      );

      expect(result.serviceId).toBe("service-1");
      expect(result.name).toBe("Instalación");
      expect(result.unit).toBe(ServiceUnit.UNIT);
      expect(result.quantity).toBe(1);
      expect(result.amount).toBe(100);
    });

    it("should calculate amount for fixed service with quantity override", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ServiceCalculator.calculateServiceAmount(
        {
          serviceId: "service-2",
          name: "Tornillos",
          unit: ServiceUnit.UNIT,
          rate: new Money(5),
          quantityOverride: 10,
        },
        dimensions
      );

      expect(result.quantity).toBe(10);
      expect(result.amount).toBe(50); // 5 × 10
    });
  });

  describe("calculateServiceAmount - Area Service", () => {
    it("should calculate amount for area service", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ServiceCalculator.calculateServiceAmount(
        {
          serviceId: "service-3",
          name: "Templado",
          unit: ServiceUnit.SQM,
          rate: new Money(50),
        },
        dimensions
      );

      expect(result.unit).toBe(ServiceUnit.SQM);
      expect(result.quantity).toBe(2.0); // 1.0m × 2.0m
      expect(result.amount).toBe(100); // 50 × 2.0
    });

    it("should apply minimum billing unit for area service", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 1500,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ServiceCalculator.calculateServiceAmount(
        {
          serviceId: "service-4",
          name: "Laminado",
          unit: ServiceUnit.SQM,
          rate: new Money(50),
          minimumBillingUnit: 2.0,
        },
        dimensions
      );

      expect(result.quantity).toBe(2.0); // 1.5 m² < 2.0 minimum → billed at 2.0
      expect(result.amount).toBe(100); // 50 × 2.0
    });
  });

  describe("calculateServiceAmount - Perimeter Service", () => {
    it("should calculate amount for perimeter service", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ServiceCalculator.calculateServiceAmount(
        {
          serviceId: "service-5",
          name: "Pulido de Cantos",
          unit: ServiceUnit.ML,
          rate: new Money(15),
        },
        dimensions
      );

      expect(result.unit).toBe(ServiceUnit.ML);
      expect(result.quantity).toBe(6.0); // 2 × (1.0 + 2.0)
      expect(result.amount).toBe(90); // 15 × 6.0
    });

    it("should apply minimum billing unit for perimeter service", () => {
      const dimensions = new Dimensions({
        widthMm: 500,
        heightMm: 500,
        minWidthMm: 400,
        minHeightMm: 400,
      });

      const result = ServiceCalculator.calculateServiceAmount(
        {
          serviceId: "service-6",
          name: "Marco",
          unit: ServiceUnit.ML,
          rate: new Money(20),
          minimumBillingUnit: 3.0,
        },
        dimensions
      );

      expect(result.quantity).toBe(3.0); // 2.0 ml < 3.0 minimum → billed at 3.0
      expect(result.amount).toBe(60); // 20 × 3.0
    });
  });

  describe("edge cases", () => {
    it("should handle zero rate", () => {
      const dimensions = new Dimensions({
        widthMm: 1000,
        heightMm: 2000,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ServiceCalculator.calculateServiceAmount(
        {
          serviceId: "service-7",
          name: "Free Service",
          unit: ServiceUnit.UNIT,
          rate: new Money(0),
        },
        dimensions
      );

      expect(result.amount).toBe(0);
    });

    it("should handle large dimensions for area service", () => {
      const dimensions = new Dimensions({
        widthMm: 10_000,
        heightMm: 5000,
        minWidthMm: 800,
        minHeightMm: 800,
      });

      const result = ServiceCalculator.calculateServiceAmount(
        {
          serviceId: "service-8",
          name: "Large Area",
          unit: ServiceUnit.SQM,
          rate: new Money(25),
        },
        dimensions
      );

      expect(result.quantity).toBe(50); // 10m × 5m
      expect(result.amount).toBe(1250); // 25 × 50
    });
  });
});
