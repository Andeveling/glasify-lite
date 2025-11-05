/**
 * Glass Area Calculator
 * Pure utility for calculating billable glass area with profile discounts
 * Matches server-side calculation in price-item.ts
 */

/** Conversion factor from millimeters to meters */
const MM_TO_METERS = 1000;

export type GlassDiscounts = {
  heightMm: number;
  widthMm: number;
};

/**
 * Calculate billable glass area in m² applying profile discounts
 *
 * @param widthMm - Total width in millimeters
 * @param heightMm - Total height in millimeters
 * @param discounts - Profile discounts to subtract from dimensions
 * @returns Billable area in square meters (0 if dimensions invalid)
 *
 * @example
 * calculateGlassArea(1000, 2000, { widthMm: 50, heightMm: 50 })
 * // Returns: (950/1000) * (1950/1000) = 1.8525 m²
 */
export function calculateGlassArea(
  widthMm: number,
  heightMm: number,
  discounts: GlassDiscounts
): number {
  // Apply glass discounts (profiles take space)
  const effectiveWidthMm = Math.max(widthMm - discounts.widthMm, 0);
  const effectiveHeightMm = Math.max(heightMm - discounts.heightMm, 0);

  const widthM = effectiveWidthMm / MM_TO_METERS;
  const heightM = effectiveHeightMm / MM_TO_METERS;

  if (widthM > 0 && heightM > 0) {
    return widthM * heightM;
  }
  return 0;
}
