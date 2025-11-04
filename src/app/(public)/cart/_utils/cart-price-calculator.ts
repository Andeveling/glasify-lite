/**
 * Cart Item Price Calculator
 *
 * Pure function for calculating cart item prices with Decimal precision.
 * Formula: (width * height / 1,000,000) * pricePerM2 * quantity + colorSurcharge
 */

import { Decimal } from "@prisma/client/runtime/library";

/**
 * Parameters for price calculation
 */
export interface PriceCalculationParams {
	/**
	 * Width in millimeters
	 */
	widthMm: number;
	/**
	 * Height in millimeters
	 */
	heightMm: number;
	/**
	 * Glass type price per square meter (can be Decimal or string)
	 */
	pricePerM2: Decimal | string | number;
	/**
	 * Item quantity (default: 1)
	 */
	quantity?: number;
	/**
	 * Color surcharge percentage (e.g., 10 for 10%)
	 * Optional - only applied if color is selected
	 */
	colorSurchargePercentage?: Decimal | string | number | null;
}

/**
 * Calculate cart item price with Decimal precision
 *
 * Prevents floating-point rounding errors by using Prisma's Decimal type.
 *
 * @param params - Calculation parameters
 * @returns Calculated subtotal as Decimal
 *
 * @example
 * // Basic calculation: 1000x1000mm at $100/m2 = $100
 * calculateItemPrice({
 *   widthMm: 1000,
 *   heightMm: 1000,
 *   pricePerM2: new Decimal(100),
 * }); // Decimal(100)
 *
 * @example
 * // With quantity: 1000x1000mm at $100/m2 * 2 = $200
 * calculateItemPrice({
 *   widthMm: 1000,
 *   heightMm: 1000,
 *   pricePerM2: new Decimal(100),
 *   quantity: 2,
 * }); // Decimal(200)
 *
 * @example
 * // With color surcharge: $100 base + 10% = $110
 * calculateItemPrice({
 *   widthMm: 1000,
 *   heightMm: 1000,
 *   pricePerM2: new Decimal(100),
 *   colorSurchargePercentage: new Decimal(10),
 * }); // Decimal(110)
 */
export function calculateItemPrice(params: PriceCalculationParams): Decimal {
	const {
		widthMm,
		heightMm,
		pricePerM2,
		quantity = 1,
		colorSurchargePercentage,
	} = params;

	// Convert to Decimal for precision
	const widthM = new Decimal(widthMm).div(1000);
	const heightM = new Decimal(heightMm).div(1000);
	const pricePerM2Decimal = new Decimal(pricePerM2);
	const quantityDecimal = new Decimal(quantity);

	// Calculate area in square meters
	const areaM2 = widthM.mul(heightM);

	// Calculate base price
	let subtotal = areaM2.mul(pricePerM2Decimal).mul(quantityDecimal);

	// Apply color surcharge if present
	if (
		colorSurchargePercentage !== null &&
		colorSurchargePercentage !== undefined
	) {
		const surchargeDecimal = new Decimal(colorSurchargePercentage);
		const surchargeMultiplier = surchargeDecimal.div(100).add(1);
		subtotal = subtotal.mul(surchargeMultiplier);
	}

	return subtotal;
}
