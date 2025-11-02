/**
 * Prisma Utilities
 * Helper functions for working with Prisma types in Client/Server boundary
 */

import type { Decimal } from "@prisma/client/runtime/library";

/**
 * Safely convert Prisma Decimal to number
 * Handles both Decimal objects and already-serialized numbers
 *
 * @param value - Decimal object or number
 * @returns number
 *
 * @example
 * // Server Component (Prisma returns Decimal)
 * const price = safeDecimalToNumber(product.price); // Works
 *
 * // Client Component (serialized from server)
 * const price = safeDecimalToNumber(product.price); // Also works
 */
export function safeDecimalToNumber(value: Decimal | number): number {
	// Already a number primitive
	if (typeof value === "number") {
		return value;
	}

	// Decimal object with toNumber() method
	if (value && typeof value === "object" && "toNumber" in value) {
		return value.toNumber();
	}

	// Fallback: Try to parse as string or return 0
	const parsed = Number(value);
	if (Number.isNaN(parsed)) {
		// Value cannot be converted - return 0 as safe fallback
		return 0;
	}
	return parsed;
}

/**
 * Safely convert optional Prisma Decimal to number or null
 *
 * @param value - Decimal object, number, or null/undefined
 * @returns number or null
 *
 * @example
 * const margin = safeDecimalToNumberOrNull(product.profitMargin);
 */
export function safeDecimalToNumberOrNull(
	value: Decimal | number | null | undefined,
): number | null {
	if (value === null || value === undefined) {
		return null;
	}
	return safeDecimalToNumber(value);
}
