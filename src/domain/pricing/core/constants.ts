/**
 * Domain constants for price calculation
 *
 * These constants define the core mathematical parameters used throughout
 * the pricing domain layer. All calculations must use these values for
 * consistency and accuracy.
 */

import { Decimal } from "decimal.js";

/**
 * Conversion factor from millimeters to meters
 * Used for glass area calculations and service quantities
 */
export const MM_PER_METER = 1000;

/**
 * Decimal places for monetary values
 * All Money instances round to this scale using ROUND_HALF_UP
 */
export const ROUND_SCALE = 2;

/**
 * Rounding mode for monetary calculations
 * ROUND_HALF_UP: 0.5 rounds up, as per standard financial rounding
 * @see https://mikemcl.github.io/decimal.js/#modes
 */
export const ROUND_MODE = Decimal.ROUND_HALF_UP;

/**
 * Decimal places for service quantity calculations
 * Area and perimeter services round to 2 decimals
 */
export const SERVICE_QUANTITY_SCALE = 2;

/**
 * Decimal places for fixed service quantities
 * Fixed services require higher precision (e.g., 1.0000 units)
 */
export const FIXED_SERVICE_QUANTITY_SCALE = 4;

/**
 * Conversion factor from percentage to decimal
 * Used for margin and surcharge calculations (20% → 0.20)
 */
export const PERCENTAGE_TO_DECIMAL = 100;
