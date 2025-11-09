/**
 * @file Decimal Handling Utilities
 * @description Type-safe decimal utilities using decimal.js
 * No dependency on Prisma Decimal - fully ORM-agnostic
 */

import Decimal from "decimal.js";
import type { ValidationError } from "../types/base.types";

/**
 * Configuration for Decimal.js
 * @internal
 */
Decimal.set({
  precision: 18,
  rounding: Decimal.ROUND_HALF_UP,
});

/**
 * Decimal input types (compatible with database Decimal columns)
 */
export type DecimalInput = string | number | Decimal;

/**
 * Safely converts any decimal input to Decimal instance
 *
 * @param value - String, number, or Decimal instance
 * @returns Decimal instance or null if value is null/undefined
 *
 * @example
 * ```typescript
 * const price1 = toDecimal('100.50'); // Works
 * const price2 = toDecimal(100.50);   // Works
 * const price3 = toDecimal(new Decimal('100.50')); // Works
 * const price4 = toDecimal(null);     // Returns null
 * ```
 */
export function toDecimal(
  value: DecimalInput | null | undefined
): Decimal | null {
  if (value === null || value === undefined) {
    return null;
  }

  try {
    if (value instanceof Decimal) {
      return value;
    }
    return new Decimal(value);
  } catch {
    return null;
  }
}

/**
 * Safely converts a Decimal to number for client-side usage
 * Warning: May lose precision for very large numbers
 *
 * @param value - Decimal instance, string, or number
 * @param decimals - Number of decimal places to round to (default: 2)
 * @returns Number value or 0 if conversion fails
 *
 * @example
 * ```typescript
 * toNumber(new Decimal('100.5555'), 2);    // 100.56
 * toNumber('100.50');                      // 100.5
 * toNumber(100);                           // 100
 * toNumber(null);                          // 0
 * ```
 */
export function toNumber(
  value: DecimalInput | null | undefined,
  decimals?: number
): number {
  const decimal = toDecimal(value);
  if (decimal === null) {
    return 0;
  }

  return Number(decimal.toFixed(decimals ?? 2));
}

/**
 * Safely converts a Decimal to string preserving precision
 *
 * @param value - Decimal instance or string
 * @returns String representation or '0' if conversion fails
 *
 * @example
 * ```typescript
 * decimalToString(new Decimal('100.5555')); // '100.5555'
 * decimalToString('100.50');                // '100.50'
 * decimalToString(null);                    // '0'
 * ```
 */
export function decimalToString(
  value: DecimalInput | null | undefined
): string {
  const decimal = toDecimal(value);
  return decimal === null ? "0" : decimal.toString();
}

/**
 * Validates that a value can be converted to Decimal
 *
 * @param value - Value to validate
 * @param fieldName - Field name for error messages
 * @returns ValidationError or null if valid
 *
 * @example
 * ```typescript
 * const error = validateDecimal('not-a-number', 'price');
 * if (error) {
 *   console.error(error.message); // 'price must be a valid decimal number'
 * }
 * ```
 */
export function validateDecimal(
  value: unknown,
  fieldName: string
): ValidationError | null {
  const decimal = toDecimal(value as DecimalInput);
  if (decimal === null && value !== null && value !== undefined) {
    return {
      code: "INVALID_DECIMAL",
      context: {
        received: value,
      },
      message: `${fieldName} must be a valid decimal number`,
      path: [fieldName],
    };
  }

  return null;
}

/**
 * Validates that a Decimal is positive
 *
 * @param value - Decimal value to validate
 * @param fieldName - Field name for error messages
 * @returns ValidationError or null if valid
 */
export function validatePositiveDecimal(
  value: DecimalInput | null | undefined,
  fieldName: string
): ValidationError | null {
  const decimal = toDecimal(value);
  if (decimal === null) {
    return {
      code: "NULL_VALUE",
      message: `${fieldName} cannot be null or undefined`,
      path: [fieldName],
    };
  }

  if (decimal.isNegative() || decimal.isZero()) {
    return {
      code: "NOT_POSITIVE",
      context: {
        received: decimal.toString(),
      },
      message: `${fieldName} must be a positive number, got ${decimal}`,
      path: [fieldName],
    };
  }

  return null;
}

/**
 * Validates that a Decimal is non-negative
 *
 * @param value - Decimal value to validate
 * @param fieldName - Field name for error messages
 * @returns ValidationError or null if valid
 */
export function validateNonNegativeDecimal(
  value: DecimalInput | null | undefined,
  fieldName: string
): ValidationError | null {
  const decimal = toDecimal(value);
  if (decimal === null) {
    return {
      code: "NULL_VALUE",
      message: `${fieldName} cannot be null or undefined`,
      path: [fieldName],
    };
  }

  if (decimal.isNegative()) {
    return {
      code: "NEGATIVE_VALUE",
      context: {
        received: decimal.toString(),
      },
      message: `${fieldName} must be non-negative, got ${decimal}`,
      path: [fieldName],
    };
  }

  return null;
}

/**
 * Validates that a Decimal is within a range
 *
 * @param value - Decimal value to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @param fieldName - Field name for error messages
 * @returns ValidationError or null if valid
 */
export function validateDecimalRange(
  value: DecimalInput | null | undefined,
  min: DecimalInput,
  max: DecimalInput,
  fieldName: string
): ValidationError | null {
  const decimal = toDecimal(value);
  const minDecimal = toDecimal(min);
  const maxDecimal = toDecimal(max);

  if (decimal === null) {
    return {
      code: "NULL_VALUE",
      message: `${fieldName} cannot be null or undefined`,
      path: [fieldName],
    };
  }

  if (minDecimal === null || maxDecimal === null) {
    return {
      code: "INVALID_RANGE",
      message: "Invalid range parameters",
      path: [fieldName],
    };
  }

  if (decimal.lessThan(minDecimal) || decimal.greaterThan(maxDecimal)) {
    return {
      code: "OUT_OF_RANGE",
      context: {
        max: maxDecimal.toString(),
        min: minDecimal.toString(),
        received: decimal.toString(),
      },
      message: `${fieldName} must be between ${minDecimal} and ${maxDecimal}, got ${decimal}`,
      path: [fieldName],
    };
  }

  return null;
}

/**
 * Safely multiply two Decimals
 *
 * @param a - First decimal
 * @param b - Second decimal
 * @returns Result of multiplication or null if inputs are invalid
 *
 * @example
 * ```typescript
 * multiply('100', '0.5');     // Decimal('50')
 * multiply(new Decimal('10'), '2.5'); // Decimal('25')
 * ```
 */
export function multiply(
  a: DecimalInput | null | undefined,
  b: DecimalInput | null | undefined
): Decimal | null {
  const decimalA = toDecimal(a);
  const decimalB = toDecimal(b);

  if (decimalA === null || decimalB === null) {
    return null;
  }

  return decimalA.times(decimalB);
}

/**
 * Safely divide two Decimals
 *
 * @param a - Dividend
 * @param b - Divisor
 * @returns Result of division or null if inputs are invalid or division by zero
 *
 * @example
 * ```typescript
 * divide('100', '2');    // Decimal('50')
 * divide('100', '0');    // null (division by zero)
 * ```
 */
export function divide(
  a: DecimalInput | null | undefined,
  b: DecimalInput | null | undefined
): Decimal | null {
  const decimalA = toDecimal(a);
  const decimalB = toDecimal(b);

  if (decimalA === null || decimalB === null || decimalB.isZero()) {
    return null;
  }

  return decimalA.dividedBy(decimalB);
}

/**
 * Safely add two Decimals
 *
 * @param a - First decimal
 * @param b - Second decimal
 * @returns Result of addition or null if inputs are invalid
 */
export function add(
  a: DecimalInput | null | undefined,
  b: DecimalInput | null | undefined
): Decimal | null {
  const decimalA = toDecimal(a);
  const decimalB = toDecimal(b);

  if (decimalA === null || decimalB === null) {
    return null;
  }

  return decimalA.plus(decimalB);
}

/**
 * Safely subtract two Decimals
 *
 * @param a - First decimal
 * @param b - Second decimal to subtract
 * @returns Result of subtraction or null if inputs are invalid
 */
export function subtract(
  a: DecimalInput | null | undefined,
  b: DecimalInput | null | undefined
): Decimal | null {
  const decimalA = toDecimal(a);
  const decimalB = toDecimal(b);

  if (decimalA === null || decimalB === null) {
    return null;
  }

  return decimalA.minus(decimalB);
}

/**
 * Round a Decimal to specified number of places
 *
 * @param value - Decimal to round
 * @param places - Number of decimal places
 * @returns Rounded Decimal or null if input is invalid
 *
 * @example
 * ```typescript
 * round('100.5555', 2); // Decimal('100.56')
 * round('100.5', 0);    // Decimal('101')
 * ```
 */
export function round(
  value: DecimalInput | null | undefined,
  places: number
): Decimal | null {
  const decimal = toDecimal(value);
  if (decimal === null) {
    return null;
  }

  return decimal.toDecimalPlaces(places, Decimal.ROUND_HALF_UP);
}

/**
 * Compare two Decimal values
 *
 * @param a - First decimal
 * @param b - Second decimal
 * @returns -1 if a < b, 0 if a == b, 1 if a > b, or null if inputs are invalid
 *
 * @example
 * ```typescript
 * compare('100', '50');  // 1
 * compare('100', '100'); // 0
 * compare('50', '100');  // -1
 * ```
 */
export function compare(
  a: DecimalInput | null | undefined,
  b: DecimalInput | null | undefined
): number | null {
  const decimalA = toDecimal(a);
  const decimalB = toDecimal(b);

  if (decimalA === null || decimalB === null) {
    return null;
  }

  return decimalA.comparedTo(decimalB);
}

/**
 * Calculate percentage of a Decimal
 *
 * @param value - Base value
 * @param pct - Percentage to calculate
 * @returns Percentage amount or null if inputs are invalid
 *
 * @example
 * ```typescript
 * percentage('100', '10'); // Decimal('10') - 10% of 100
 * percentage('200', '2.5'); // Decimal('5') - 2.5% of 200
 * ```
 */
export function percentage(
  value: DecimalInput | null | undefined,
  pct: DecimalInput | null | undefined
): Decimal | null {
  const result = multiply(value, pct);
  if (result === null) {
    return null;
  }

  return divide(result, "100");
}

/**
 * Apply percentage increase to a value
 *
 * @param value - Base value
 * @param pctIncrease - Percentage to increase by
 * @returns New value or null if inputs are invalid
 *
 * @example
 * ```typescript
 * increaseByPercentage('100', '10'); // Decimal('110')
 * increaseByPercentage('200', '5'); // Decimal('210')
 * ```
 */
export function increaseByPercentage(
  value: DecimalInput | null | undefined,
  pctIncrease: DecimalInput | null | undefined
): Decimal | null {
  const baseValue = toDecimal(value);
  const percentAmount = percentage(value, pctIncrease);

  if (baseValue === null || percentAmount === null) {
    return null;
  }

  return baseValue.plus(percentAmount);
}

/**
 * Apply percentage decrease to a value
 *
 * @param value - Base value
 * @param pctDecrease - Percentage to decrease by
 * @returns New value or null if inputs are invalid
 *
 * @example
 * ```typescript
 * decreaseByPercentage('100', '10'); // Decimal('90')
 * decreaseByPercentage('200', '5'); // Decimal('190')
 * ```
 */
export function decreaseByPercentage(
  value: DecimalInput | null | undefined,
  pctDecrease: DecimalInput | null | undefined
): Decimal | null {
  const baseValue = toDecimal(value);
  const percentAmount = percentage(value, pctDecrease);

  if (baseValue === null || percentAmount === null) {
    return null;
  }

  return baseValue.minus(percentAmount);
}
