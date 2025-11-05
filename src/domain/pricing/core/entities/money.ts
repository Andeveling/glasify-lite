/**
 * Money value object for monetary calculations
 *
 * This class encapsulates monetary values using decimal arithmetic to prevent
 * floating-point errors. All operations return new instances (immutable).
 *
 * @example
 * ```typescript
 * const price = new Money(100.50);
 * const tax = price.multiply(0.19); // 19.10
 * const total = price.add(tax); // 119.60
 * ```
 */

import { Decimal } from "decimal.js";
import { ROUND_MODE, ROUND_SCALE } from "../constants";

export class Money {
  private readonly amount: Decimal;

  /** Decimal places for monetary values */
  static readonly ROUND_SCALE = ROUND_SCALE;
  /** Rounding mode for monetary calculations */
  static readonly ROUND_MODE = ROUND_MODE;

  /**
   * Create a Money instance from various input types
   *
   * @param value - Monetary value as Decimal, number, or string
   * @throws {Error} If value is NaN or Infinity
   *
   * @example
   * ```typescript
   * new Money(100);
   * new Money("100.50");
   * new Money(new Decimal("100.50"));
   * ```
   */
  constructor(value: Decimal | number | string) {
    this.amount = new Decimal(value).toDecimalPlaces(
      Money.ROUND_SCALE,
      Money.ROUND_MODE
    );

    // Validate that the value is a finite number
    if (!this.amount.isFinite()) {
      throw new Error("Money value must be a finite number");
    }
  }

  /**
   * Add another Money instance to this one
   *
   * @param other - Money instance to add
   * @returns New Money instance with the sum
   *
   * @example
   * ```typescript
   * const a = new Money(100);
   * const b = new Money(50);
   * const sum = a.add(b); // 150
   * ```
   */
  add(other: Money): Money {
    return new Money(this.amount.plus(other.amount));
  }

  /**
   * Multiply this Money by a factor
   *
   * @param factor - Multiplication factor (Decimal, number, or string)
   * @returns New Money instance with the product
   *
   * @example
   * ```typescript
   * const price = new Money(100);
   * const withTax = price.multiply(1.19); // 119
   * const colorSurcharge = price.multiply(new Decimal("1.10")); // 110
   * ```
   */
  multiply(factor: Decimal | number | string): Money {
    return new Money(this.amount.times(factor));
  }

  /**
   * Divide this Money by a divisor
   *
   * @param divisor - Division divisor (Decimal, number, or string)
   * @returns New Money instance with the quotient
   * @throws {Error} If divisor is zero
   *
   * @example
   * ```typescript
   * const total = new Money(100);
   * const perItem = total.divide(4); // 25
   * const applyMargin = cost.divide(new Decimal("0.80")); // cost / (1 - 0.20)
   * ```
   */
  divide(divisor: Decimal | number | string): Money {
    const divisorDecimal = new Decimal(divisor);
    if (divisorDecimal.isZero()) {
      throw new Error("Cannot divide Money by zero");
    }
    return new Money(this.amount.dividedBy(divisorDecimal));
  }

  /**
   * Convert Money to a plain number
   *
   * @returns The monetary value as a number (rounded to ROUND_SCALE decimals)
   *
   * @example
   * ```typescript
   * const money = new Money("100.50");
   * money.toNumber(); // 100.5
   * ```
   */
  toNumber(): number {
    return this.amount.toNumber();
  }

  /**
   * Get the internal Decimal representation
   *
   * @returns The Decimal instance
   * @internal For use by other domain services only
   */
  toDecimal(): Decimal {
    return this.amount;
  }
}
