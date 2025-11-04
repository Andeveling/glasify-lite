/**
 * Unit Tests: Cart Price Calculator
 *
 * Tests for calculateItemPrice() function to ensure correct price calculations
 * with Decimal precision and no rounding errors.
 */

import {
	calculateItemPrice,
	type PriceCalculationParams,
} from "@app/(public)/cart/_utils/cart-price-calculator";
import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it } from "vitest";

describe("calculateItemPrice", () => {
	it("should calculate basic price correctly (1000x1000mm at $100/m2 = $100)", () => {
		const params: PriceCalculationParams = {
			widthMm: 1000,
			heightMm: 1000,
			pricePerM2: new Decimal(100),
		};

		const result = calculateItemPrice(params);

		expect(result.toNumber()).toBe(100);
	});

	it("should multiply price by quantity", () => {
		const params: PriceCalculationParams = {
			widthMm: 1000,
			heightMm: 1000,
			pricePerM2: new Decimal(100),
			quantity: 3,
		};

		const result = calculateItemPrice(params);

		expect(result.toNumber()).toBe(300); // $100 * 3
	});

	it("should apply color surcharge percentage correctly (10% on $100 = $110)", () => {
		const params: PriceCalculationParams = {
			widthMm: 1000,
			heightMm: 1000,
			pricePerM2: new Decimal(100),
			colorSurchargePercentage: new Decimal(10),
		};

		const result = calculateItemPrice(params);

		expect(result.toNumber()).toBe(110); // $100 + 10%
	});

	it("should handle decimal precision without rounding errors", () => {
		const params: PriceCalculationParams = {
			widthMm: 1234,
			heightMm: 5678,
			pricePerM2: new Decimal("123.456789"),
		};

		const result = calculateItemPrice(params);

		// Expected: (1.234 * 5.678) * 123.456789 = 865.024394...
		expect(result.toFixed(2)).toBe("865.02");
	});

	it("should calculate price for minimum dimensions (100x100mm)", () => {
		const params: PriceCalculationParams = {
			widthMm: 100,
			heightMm: 100,
			pricePerM2: new Decimal(100),
		};

		const result = calculateItemPrice(params);

		// Expected: (0.1 * 0.1) * 100 = 1
		expect(result.toNumber()).toBe(1);
	});

	it("should calculate price for maximum dimensions (3000x3000mm)", () => {
		const params: PriceCalculationParams = {
			widthMm: 3000,
			heightMm: 3000,
			pricePerM2: new Decimal(100),
		};

		const result = calculateItemPrice(params);

		// Expected: (3 * 3) * 100 = 900
		expect(result.toNumber()).toBe(900);
	});

	it("should combine quantity and color surcharge correctly", () => {
		const params: PriceCalculationParams = {
			widthMm: 1000,
			heightMm: 1000,
			pricePerM2: new Decimal(100),
			quantity: 2,
			colorSurchargePercentage: new Decimal(10),
		};

		const result = calculateItemPrice(params);

		// Expected: ($100 * 2) + 10% = $220
		expect(result.toNumber()).toBe(220);
	});

	it("should handle zero color surcharge (null/undefined)", () => {
		const params: PriceCalculationParams = {
			widthMm: 1000,
			heightMm: 1000,
			pricePerM2: new Decimal(100),
			colorSurchargePercentage: null,
		};

		const result = calculateItemPrice(params);

		expect(result.toNumber()).toBe(100); // No surcharge applied
	});

	it("should accept pricePerM2 as string", () => {
		const params: PriceCalculationParams = {
			widthMm: 1000,
			heightMm: 1000,
			pricePerM2: "100.50",
		};

		const result = calculateItemPrice(params);

		expect(result.toNumber()).toBe(100.5);
	});

	it("should accept pricePerM2 as number", () => {
		const params: PriceCalculationParams = {
			widthMm: 1000,
			heightMm: 1000,
			pricePerM2: 100.75,
		};

		const result = calculateItemPrice(params);

		expect(result.toNumber()).toBe(100.75);
	});

	it("should handle real-world scenario: 1500x2000mm Templado 6mm at $85/m2 with 15% color surcharge", () => {
		const params: PriceCalculationParams = {
			widthMm: 1500,
			heightMm: 2000,
			pricePerM2: new Decimal(85),
			quantity: 1,
			colorSurchargePercentage: new Decimal(15),
		};

		const result = calculateItemPrice(params);

		// Expected: (1.5 * 2) * 85 * 1.15 = 3 * 85 * 1.15 = 293.25
		expect(result.toNumber()).toBe(293.25);
	});
});
