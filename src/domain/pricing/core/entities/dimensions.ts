/**
 * Dimensions value object for width and height calculations
 *
 * This class encapsulates product dimensions in millimeters and provides
 * methods to calculate effective dimensions (accounting for minimums) and
 * convert to meters for area/perimeter calculations.
 *
 * @example
 * ```typescript
 * const dims = new Dimensions({
 *   widthMm: 1000,
 *   heightMm: 2000,
 *   minWidthMm: 800,
 *   minHeightMm: 800,
 * });
 *
 * dims.getEffectiveWidth(); // 200mm (1000 - 800)
 * dims.toMeters(); // { widthM: 1.0, heightM: 2.0 }
 * ```
 */

import { MM_PER_METER } from "../constants";

export type DimensionsInput = {
  /** Width in millimeters */
  widthMm: number;
  /** Height in millimeters */
  heightMm: number;
  /** Minimum width included in base price (mm) */
  minWidthMm: number;
  /** Minimum height included in base price (mm) */
  minHeightMm: number;
};

export class Dimensions {
  readonly widthMm: number;
  readonly heightMm: number;
  readonly minWidthMm: number;
  readonly minHeightMm: number;

  /**
   * Create a Dimensions instance
   *
   * @param input - Dimension values in millimeters
   *
   * @example
   * ```typescript
   * new Dimensions({
   *   widthMm: 1000,
   *   heightMm: 2000,
   *   minWidthMm: 800,
   *   minHeightMm: 800,
   * });
   * ```
   */
  constructor(input: DimensionsInput) {
    this.widthMm = input.widthMm;
    this.heightMm = input.heightMm;
    this.minWidthMm = input.minWidthMm;
    this.minHeightMm = input.minHeightMm;
  }

  /**
   * Get effective width (extra millimeters beyond minimum)
   *
   * If actual width is below minimum, returns 0 (customer is not charged extra).
   * Formula: max(widthMm - minWidthMm, 0)
   *
   * @returns Extra millimeters to charge for width (clamped to 0 minimum)
   *
   * @example
   * ```typescript
   * // Width exceeds minimum
   * dims.widthMm = 1000, dims.minWidthMm = 800
   * dims.getEffectiveWidth(); // 200mm
   *
   * // Width below minimum (treated as minimum)
   * dims.widthMm = 700, dims.minWidthMm = 800
   * dims.getEffectiveWidth(); // 0mm
   * ```
   */
  getEffectiveWidth(): number {
    return Math.max(this.widthMm - this.minWidthMm, 0);
  }

  /**
   * Get effective height (extra millimeters beyond minimum)
   *
   * If actual height is below minimum, returns 0 (customer is not charged extra).
   * Formula: max(heightMm - minHeightMm, 0)
   *
   * @returns Extra millimeters to charge for height (clamped to 0 minimum)
   *
   * @example
   * ```typescript
   * // Height exceeds minimum
   * dims.heightMm = 1200, dims.minHeightMm = 800
   * dims.getEffectiveHeight(); // 400mm
   *
   * // Height below minimum (treated as minimum)
   * dims.heightMm = 700, dims.minHeightMm = 800
   * dims.getEffectiveHeight(); // 0mm
   * ```
   */
  getEffectiveHeight(): number {
    return Math.max(this.heightMm - this.minHeightMm, 0);
  }

  /**
   * Convert dimensions from millimeters to meters
   *
   * Used for glass area and service calculations (perimeter, area).
   * Formula: mm / 1000 = m
   *
   * @returns Dimensions in meters
   *
   * @example
   * ```typescript
   * dims.widthMm = 1000, dims.heightMm = 2000
   * dims.toMeters(); // { widthM: 1.0, heightM: 2.0 }
   * ```
   */
  toMeters(): { widthM: number; heightM: number } {
    return {
      widthM: this.widthMm / MM_PER_METER,
      heightM: this.heightMm / MM_PER_METER,
    };
  }
}
