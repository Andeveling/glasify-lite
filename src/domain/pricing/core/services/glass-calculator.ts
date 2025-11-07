import { MM_PER_METER } from "../constants";
import type { Dimensions } from "../entities/dimensions";
import type { Money } from "../entities/money";

/**
 * Input for glass cost calculation
 */
export type GlassCostInput = {
  /**
   * Price per square meter of glass
   */
  pricePerM2: Money;

  /**
   * Dimensions including width and height in millimeters
   */
  dimensions: Dimensions;

  /**
   * Profile discount to subtract from width (mm)
   * Typically the profile width that overlaps the glass
   */
  profileDiscountWidthMm: number;

  /**
   * Profile discount to subtract from height (mm)
   * Typically the profile height that overlaps the glass
   */
  profileDiscountHeightMm: number;
};

/**
 * Calculate billable glass area in square meters
 *
 * Formula (US3):
 * area = ((width - profileDiscountWidth) × (height - profileDiscountHeight)) / 1,000,000 m²
 *
 * The profile discounts account for the portion of glass covered by the profile frame.
 * Result is in square meters (m²) for price calculation.
 *
 * @param dimensions - Glass dimensions (uses actual width/height, not effective)
 * @param profileDiscountWidthMm - Profile width to subtract (mm)
 * @param profileDiscountHeightMm - Profile height to subtract (mm)
 * @returns Billable area in square meters (m²)
 */
function calculateBillableArea(
  dimensions: Dimensions,
  profileDiscountWidthMm: number,
  profileDiscountHeightMm: number
): number {
  // Use actual dimensions (not effective - glass doesn't care about minimums)
  const billableWidthMm = dimensions.widthMm - profileDiscountWidthMm;
  const billableHeightMm = dimensions.heightMm - profileDiscountHeightMm;

  // Calculate area in mm² then convert to m²
  const areaInMm2 = billableWidthMm * billableHeightMm;
  const areaInM2 = areaInMm2 / (MM_PER_METER * MM_PER_METER);

  return areaInM2;
}

/**
 * Calculate total glass cost
 *
 * Applies the glass pricing formula:
 * 1. Calculate billable area (after profile discounts)
 * 2. Multiply by price per m²
 *
 * The result is rounded to 2 decimals by Money.multiply()
 *
 * @param input - Glass cost calculation input
 * @returns Total glass cost
 */
function calculateGlassCost(input: GlassCostInput): Money {
  const {
    pricePerM2,
    dimensions,
    profileDiscountWidthMm,
    profileDiscountHeightMm,
  } = input;

  // Calculate billable area
  const areaInM2 = calculateBillableArea(
    dimensions,
    profileDiscountWidthMm,
    profileDiscountHeightMm
  );

  // Multiply price by area
  return pricePerM2.multiply(areaInM2);
}

/**
 * GlassCalculator - Pure functions for glass cost calculations
 *
 * Provides methods to calculate glass costs based on billable area.
 * All functions are pure (no side effects) and use Money value objects.
 *
 * Key concepts:
 * - Glass area uses ACTUAL dimensions (not effective dimensions with minimums)
 * - Profile discounts reduce the billable area (glass covered by frame)
 * - Area is converted to m² before price multiplication
 */
export const GlassCalculator = {
  calculateBillableArea,
  calculateGlassCost,
} as const;
