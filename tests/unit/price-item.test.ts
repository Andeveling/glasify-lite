/**
 * Unit Tests: Price Item Calculation with Minimum Billing Unit
 *
 * Tests for the pricing logic in src/server/price/price-item.ts
 * Focus on minimum billing unit feature for area/perimeter services
 */

import type { ServiceType, ServiceUnit } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it } from "vitest";
import {
	calculatePriceItem,
	type PriceServiceInput,
} from "../../src/server/price/price-item";

describe("calculatePriceItem with minimumBillingUnit", () => {
	const baseModel = {
		accessoryPrice: null,
		basePrice: 1000,
		costPerMmHeight: 0.5,
		costPerMmWidth: 0.5,
	};

	describe("Area service (sqm) with minimum billing unit", () => {
		it("should use calculated quantity when it exceeds minimum", () => {
			const service: PriceServiceInput = {
				minimumBillingUnit: 1.0,
				rate: 50000,
				serviceId: "svc_area_1",
				type: "area" as ServiceType,
				unit: "sqm" as ServiceUnit,
			};

			// 2m x 2m = 4m² (exceeds minimum of 1m²)
			const result = calculatePriceItem({
				adjustments: [],
				heightMm: 2000,
				model: baseModel,
				services: [service],
				widthMm: 2000,
			});

			// Should charge for actual 4m², not minimum 1m²
			const serviceResult = result.services[0];
			expect(serviceResult?.quantity).toBe(4); // 4m²
			expect(serviceResult?.amount).toBe(200000); // 4 * 50000
		});

		it("should use minimum when calculated quantity is lower", () => {
			const service: PriceServiceInput = {
				minimumBillingUnit: 1.0,
				rate: 50000,
				serviceId: "svc_area_2",
				type: "area" as ServiceType,
				unit: "sqm" as ServiceUnit,
			};

			// 0.5m x 0.5m = 0.25m² (less than minimum of 1m²)
			const result = calculatePriceItem({
				adjustments: [],
				heightMm: 500,
				model: baseModel,
				services: [service],
				widthMm: 500,
			});

			// Should charge minimum 1m², not actual 0.25m²
			const serviceResult = result.services[0];
			expect(serviceResult?.quantity).toBe(1); // minimum 1m²
			expect(serviceResult?.amount).toBe(50000); // 1 * 50000
		});

		it("should work without minimumBillingUnit (backward compatibility)", () => {
			const service: PriceServiceInput = {
				minimumBillingUnit: null,
				rate: 50000,
				serviceId: "svc_area_3",
				type: "area" as ServiceType,
				unit: "sqm" as ServiceUnit,
			};

			// 0.5m x 0.5m = 0.25m²
			const result = calculatePriceItem({
				adjustments: [],
				heightMm: 500,
				model: baseModel,
				services: [service],
				widthMm: 500,
			});

			// Should charge actual 0.25m² (no minimum)
			const serviceResult = result.services[0];
			expect(serviceResult?.quantity).toBe(0.25); // actual area
			expect(serviceResult?.amount).toBe(12500); // 0.25 * 50000
		});
	});

	describe("Perimeter service (ml) with minimum billing unit", () => {
		it("should use calculated quantity when it exceeds minimum", () => {
			const service: PriceServiceInput = {
				minimumBillingUnit: 2.0,
				rate: 10000,
				serviceId: "svc_perimeter_1",
				type: "perimeter" as ServiceType,
				unit: "ml" as ServiceUnit,
			};

			// 2m x 2m perimeter = (2+2)*2 = 8ml (exceeds minimum of 2ml)
			const result = calculatePriceItem({
				adjustments: [],
				heightMm: 2000,
				model: baseModel,
				services: [service],
				widthMm: 2000,
			});

			// Should charge for actual 8ml, not minimum 2ml
			const serviceResult = result.services[0];
			expect(serviceResult?.quantity).toBe(8); // 8ml
			expect(serviceResult?.amount).toBe(80000); // 8 * 10000
		});

		it("should use minimum when calculated quantity is lower", () => {
			const service: PriceServiceInput = {
				minimumBillingUnit: 4.0,
				rate: 10000,
				serviceId: "svc_perimeter_2",
				type: "perimeter" as ServiceType,
				unit: "ml" as ServiceUnit,
			};

			// 0.5m x 0.5m perimeter = (0.5+0.5)*2 = 2ml (less than minimum of 4ml)
			const result = calculatePriceItem({
				adjustments: [],
				heightMm: 500,
				model: baseModel,
				services: [service],
				widthMm: 500,
			});

			// Should charge minimum 4ml, not actual 2ml
			const serviceResult = result.services[0];
			expect(serviceResult?.quantity).toBe(4); // minimum 4ml
			expect(serviceResult?.amount).toBe(40000); // 4 * 10000
		});
	});

	describe("Fixed service with minimum (should be ignored)", () => {
		it("should ignore minimumBillingUnit for fixed services", () => {
			const service: PriceServiceInput = {
				minimumBillingUnit: 5.0, // Should be ignored
				rate: 30000,
				serviceId: "svc_fixed_1",
				type: "fixed" as ServiceType,
				unit: "unit" as ServiceUnit,
			};

			const result = calculatePriceItem({
				adjustments: [],
				heightMm: 500,
				model: baseModel,
				services: [service],
				widthMm: 500,
			});

			// Fixed services always charge 1 unit, regardless of minimum
			const serviceResult = result.services[0];
			expect(serviceResult?.quantity).toBe(1); // always 1 for fixed
			expect(serviceResult?.amount).toBe(30000); // 1 * 30000
		});
	});

	describe("Multiple services with different minimums", () => {
		it("should apply minimum correctly to each service independently", () => {
			const services: PriceServiceInput[] = [
				{
					minimumBillingUnit: 1.0,
					rate: 50000,
					serviceId: "svc_area",
					type: "area" as ServiceType,
					unit: "sqm" as ServiceUnit,
				},
				{
					minimumBillingUnit: 4.0,
					rate: 10000,
					serviceId: "svc_perimeter",
					type: "perimeter" as ServiceType,
					unit: "ml" as ServiceUnit,
				},
				{
					minimumBillingUnit: null,
					rate: 30000,
					serviceId: "svc_fixed",
					type: "fixed" as ServiceType,
					unit: "unit" as ServiceUnit,
				},
			];

			// 0.5m x 0.5m
			// Area: 0.25m² < 1m² → charge 1m²
			// Perimeter: 2ml < 4ml → charge 4ml
			// Fixed: always 1 unit
			const result = calculatePriceItem({
				adjustments: [],
				heightMm: 500,
				model: baseModel,
				services,
				widthMm: 500,
			});

			expect(result.services).toHaveLength(3);

			// Area service
			expect(result.services[0]?.quantity).toBe(1); // minimum applied
			expect(result.services[0]?.amount).toBe(50000);

			// Perimeter service
			expect(result.services[1]?.quantity).toBe(4); // minimum applied
			expect(result.services[1]?.amount).toBe(40000);

			// Fixed service
			expect(result.services[2]?.quantity).toBe(1); // always 1
			expect(result.services[2]?.amount).toBe(30000);
		});
	});

	describe("Edge cases", () => {
		it("should handle minimum exactly equal to calculated quantity", () => {
			const service: PriceServiceInput = {
				minimumBillingUnit: 1.0,
				rate: 50000,
				serviceId: "svc_area",
				type: "area" as ServiceType,
				unit: "sqm" as ServiceUnit,
			};

			// 1m x 1m = 1m² (exactly equals minimum)
			const result = calculatePriceItem({
				adjustments: [],
				heightMm: 1000,
				model: baseModel,
				services: [service],
				widthMm: 1000,
			});

			const serviceResult = result.services[0];
			expect(serviceResult?.quantity).toBe(1); // 1m² (both calculated and minimum)
			expect(serviceResult?.amount).toBe(50000);
		});

		it("should handle very small minimumBillingUnit values", () => {
			const service: PriceServiceInput = {
				minimumBillingUnit: 0.1, // Very small minimum
				rate: 50000,
				serviceId: "svc_area",
				type: "area" as ServiceType,
				unit: "sqm" as ServiceUnit,
			};

			// 0.5m x 0.5m = 0.25m² (exceeds minimum of 0.1m²)
			const result = calculatePriceItem({
				adjustments: [],
				heightMm: 500,
				model: baseModel,
				services: [service],
				widthMm: 500,
			});

			const serviceResult = result.services[0];
			expect(serviceResult?.quantity).toBe(0.25); // actual area used
			expect(serviceResult?.amount).toBe(12500);
		});

		it("should handle Decimal type for minimumBillingUnit", () => {
			const service: PriceServiceInput = {
				minimumBillingUnit: new Decimal(1.5), // Decimal type
				rate: 50000,
				serviceId: "svc_area",
				type: "area" as ServiceType,
				unit: "sqm" as ServiceUnit,
			};

			// 0.5m x 0.5m = 0.25m² (less than minimum of 1.5m²)
			const result = calculatePriceItem({
				adjustments: [],
				heightMm: 500,
				model: baseModel,
				services: [service],
				widthMm: 500,
			});

			const serviceResult = result.services[0];
			expect(serviceResult?.quantity).toBe(1.5); // minimum 1.5m²
			expect(serviceResult?.amount).toBe(75000); // 1.5 * 50000
		});
	});
});
