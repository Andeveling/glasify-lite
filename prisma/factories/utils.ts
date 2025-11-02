/**
 * Factory Utility Functions
 *
 * Common utilities for validation, formatting, and data transformation
 * used across all seed factories.
 */

import type { ZodError, ZodType } from "zod";
import type { FactoryResult, ValidationError } from "./types";

// Constants
const MM_TO_M_CONVERSION = 1000;
const COLOMBIAN_MOBILE_REGEX = /^3\d{9}$/;
const COLOMBIAN_LANDLINE_REGEX = /^[1-8]\d{6,9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates data against a Zod schema and returns a FactoryResult
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns FactoryResult with validation outcome
 */
export function validateWithSchema<T>(
	schema: ZodType<T>,
	data: unknown,
): FactoryResult<T> {
	try {
		const validated = schema.parse(data);
		return {
			data: validated,
			success: true,
		};
	} catch (error) {
		if (isZodError(error)) {
			return {
				errors: mapZodErrors(error),
				success: false,
			};
		}

		return {
			errors: [
				{
					code: "VALIDATION_ERROR",
					message:
						error instanceof Error ? error.message : "Unknown validation error",
					path: [],
				},
			],
			success: false,
		};
	}
}

/**
 * Type guard for ZodError
 */
function isZodError(error: unknown): error is ZodError {
	return (
		typeof error === "object" &&
		error !== null &&
		"issues" in error &&
		Array.isArray((error as { issues: unknown }).issues)
	);
}

/**
 * Maps Zod errors to our ValidationError format
 */
function mapZodErrors(error: ZodError): ValidationError[] {
	return error.issues.map((issue) => ({
		code: issue.code,
		context: {
			expected: "expected" in issue ? issue.expected : undefined,
			received: "received" in issue ? issue.received : undefined,
		},
		message: issue.message,
		path: issue.path.map(String),
	}));
}

/**
 * Validates that a number is within a range (inclusive)
 *
 * @param value - Number to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @param fieldName - Field name for error messages
 * @returns Validation error or null if valid
 */
export function validateRange(
	value: number,
	min: number,
	max: number,
	fieldName: string,
): ValidationError | null {
	if (value < min || value > max) {
		return {
			code: "OUT_OF_RANGE",
			context: { max, min, value },
			message: `${fieldName} must be between ${min} and ${max}, got ${value}`,
			path: [fieldName],
		};
	}
	return null;
}

/**
 * Validates that min < max for dimension constraints
 *
 * @param min - Minimum value
 * @param max - Maximum value
 * @param fieldPrefix - Field name prefix (e.g., "width", "height")
 * @returns Validation error or null if valid
 */
export function validateMinMax(
	min: number,
	max: number,
	fieldPrefix: string,
): ValidationError | null {
	if (min >= max) {
		return {
			code: "INVALID_RANGE",
			context: { max, min },
			message: `${fieldPrefix} min (${min}) must be less than max (${max})`,
			path: [fieldPrefix],
		};
	}
	return null;
}

/**
 * Formats a price for Colombian market (COP)
 *
 * @param price - Price in COP
 * @returns Formatted price string
 */
export function formatPriceCOP(price: number): string {
	return new Intl.NumberFormat("es-CO", {
		currency: "COP",
		maximumFractionDigits: 0,
		minimumFractionDigits: 0,
		style: "currency",
	}).format(price);
}

/**
 * Validates that a price is positive and reasonable
 *
 * @param price - Price to validate
 * @param fieldName - Field name for error messages
 * @param maxPrice - Maximum reasonable price (default: 100M COP)
 * @returns Validation error or null if valid
 */
export function validatePrice(
	price: number,
	fieldName: string,
	maxPrice = 100_000_000, // 100M COP
): ValidationError | null {
	if (price <= 0) {
		return {
			code: "INVALID_PRICE",
			context: { price },
			message: `${fieldName} must be positive, got ${price}`,
			path: [fieldName],
		};
	}

	if (price > maxPrice) {
		return {
			code: "PRICE_TOO_HIGH",
			context: { maxPrice, price },
			message: `${fieldName} seems unreasonably high: ${formatPriceCOP(price)}`,
			path: [fieldName],
		};
	}

	return null;
}

/**
 * Validates an array is not empty
 *
 * @param array - Array to validate
 * @param fieldName - Field name for error messages
 * @returns Validation error or null if valid
 */
export function validateNonEmpty<T>(
	array: T[],
	fieldName: string,
): ValidationError | null {
	if (array.length === 0) {
		return {
			code: "EMPTY_ARRAY",
			message: `${fieldName} must not be empty`,
			path: [fieldName],
		};
	}
	return null;
}

/**
 * Merges override values with defaults, preserving type safety
 *
 * @param defaults - Default values
 * @param overrides - Override values (optional)
 * @returns Merged object
 */
export function mergeOverrides<T extends Record<string, unknown>>(
	defaults: T,
	overrides?: Record<string, unknown>,
): T {
	if (!overrides) {
		return defaults;
	}

	return {
		...defaults,
		...overrides,
	} as T;
}

/**
 * Converts millimeters to meters
 *
 * @param mm - Millimeters
 * @returns Meters
 */
export function mmToMeters(mm: number): number {
	return mm / MM_TO_M_CONVERSION;
}

/**
 * Calculates area in square meters from dimensions in millimeters
 *
 * @param widthMm - Width in millimeters
 * @param heightMm - Height in millimeters
 * @returns Area in square meters
 */
export function calculateAreaSqm(widthMm: number, heightMm: number): number {
	return mmToMeters(widthMm) * mmToMeters(heightMm);
}

/**
 * Generates a slug from a name (kebab-case)
 *
 * @param name - Name to slugify
 * @returns Slug (lowercase, hyphenated)
 */
export function slugify(name: string): string {
	return name
		.toLowerCase()
		.normalize("NFD") // Normalize accents
		.replace(/[\u0300-\u036f]/g, "") // Remove diacritics
		.replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
		.replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Creates a unique identifier combining prefix and name
 *
 * @param prefix - Prefix (e.g., "glass", "model")
 * @param name - Name to include
 * @returns Unique identifier
 */
export function createIdentifier(prefix: string, name: string): string {
	return `${prefix}-${slugify(name)}`;
}

/**
 * Validates Colombian phone number format
 *
 * @param phone - Phone number to validate
 * @returns Whether phone is valid
 */
export function isValidColombianPhone(phone: string): boolean {
	// Colombian phones: 10 digits, starts with 3 (mobile) or fixed line
	const cleanPhone = phone.replace(/\D/g, "");
	return (
		COLOMBIAN_MOBILE_REGEX.test(cleanPhone) ||
		COLOMBIAN_LANDLINE_REGEX.test(cleanPhone)
	);
}

/**
 * Validates email format
 *
 * @param email - Email to validate
 * @returns Whether email is valid
 */
export function isValidEmail(email: string): boolean {
	return EMAIL_REGEX.test(email);
}
