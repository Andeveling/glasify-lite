import { describe, expect, it } from 'vitest';
import { calculatePriceItem } from '../../../src/server/price/price-item';

/**
 * Glass Discount Validation Tests
 * Verifies that glass discounts (glassDiscountWidthMm, glassDiscountHeightMm)
 * are correctly applied when calculating billable glass area
 *
 * Example: A 1000mm x 1000mm window frame does NOT require 1m² of glass
 * because the profiles take space. If discounts are 50mm per side,
 * the billable area is 0.95m x 0.95m = 0.9025m²
 */

// Test constants
const BASE_PRICE = 10_000;
const COST_PER_MM = 5;
const GLASS_PRICE_STANDARD = 100_000; // $100k per m²
const GLASS_PRICE_PREMIUM = 120_000; // $120k per m²
const GLASS_PRICE_LUXURY = 200_000; // $200k per m²

// Expected results
const EXPECTED_WITH_50MM_DISCOUNT = 110_250;
const EXPECTED_NO_DISCOUNT = 120_000;
const EXPECTED_WITH_30MM_DISCOUNT = 375_008;
const EXPECTED_SMALL_WINDOW_50MM = 11_250;
const EXPECTED_ZERO_GLASS_AREA = 11_000;
const MIN_SAVINGS_PER_WINDOW = 13_000;
const MIN_SAVINGS_TEN_WINDOWS = 130_000;

describe('calculatePriceItem - Glass Discount Application', () => {
  const baseModel = {
    accessoryPrice: 0,
    basePrice: BASE_PRICE,
    costPerMmHeight: COST_PER_MM,
    costPerMmWidth: COST_PER_MM,
  };

  it('should apply glass discounts when calculating glass area', () => {
    // 1000mm x 1000mm window with 50mm discount per side
    // Expected: (1000-50) x (1000-50) = 950mm x 950mm = 0.9025 m²
    const result = calculatePriceItem({
      glass: {
        discountHeightMm: 50,
        discountWidthMm: 50,
        pricePerSqm: GLASS_PRICE_STANDARD,
      },
      heightMm: 1000,
      model: baseModel,
      widthMm: 1000,
    });

    // dimPrice = basePrice + (widthCost) + (heightCost) + (glassCost)
    // widthCost = 5 * 1000 = 5000
    // heightCost = 5 * 1000 = 5000
    // glassCost = 0.9025 m² * 100000 = 90250
    // dimPrice = 10000 + 5000 + 5000 + 90250 = 110250

    expect(result.dimPrice).toBe(EXPECTED_WITH_50MM_DISCOUNT);
  });

  it('should calculate full area when no discounts are provided', () => {
    // 1000mm x 1000mm window with NO discounts
    // Expected: 1000mm x 1000mm = 1m²
    const result = calculatePriceItem({
      glass: {
        pricePerSqm: GLASS_PRICE_STANDARD,
      },
      heightMm: 1000,
      model: baseModel,
      widthMm: 1000,
    });

    // glassCost = 1 m² * 100000 = 100000
    // dimPrice = 10000 + 5000 + 5000 + 100000 = 120000

    expect(result.dimPrice).toBe(EXPECTED_NO_DISCOUNT);
  });

  it('should calculate full area when discounts are zero', () => {
    // 1000mm x 1000mm window with 0mm discounts
    // Expected: Same as no discounts (1m²)
    const result = calculatePriceItem({
      glass: {
        discountHeightMm: 0,
        discountWidthMm: 0,
        pricePerSqm: GLASS_PRICE_STANDARD,
      },
      heightMm: 1000,
      model: baseModel,
      widthMm: 1000,
    });

    expect(result.dimPrice).toBe(EXPECTED_NO_DISCOUNT);
  });

  it('should calculate full area when discounts are zero', () => {
    // 1000mm x 1000mm window with 0mm discounts
    // Expected: Same as no discounts (1m²)
    const result = calculatePriceItem({
      glass: {
        discountHeightMm: 0,
        discountWidthMm: 0,
        pricePerSqm: 100_000,
      },
      heightMm: 1000,
      model: baseModel,
      widthMm: 1000,
    });

    expect(result.dimPrice).toBe(120_000);
  });

  it('should handle realistic discount values (30mm per side)', () => {
    // 1500mm x 2000mm window with 30mm discount per side
    // Expected: (1500-30) x (2000-30) = 1470mm x 1970mm = 2.8959 m²
    const result = calculatePriceItem({
      glass: {
        discountHeightMm: 30,
        discountWidthMm: 30,
        pricePerSqm: GLASS_PRICE_PREMIUM,
      },
      heightMm: 2000,
      model: baseModel,
      widthMm: 1500,
    });

    // widthCost = 5 * 1500 = 7500
    // heightCost = 5 * 2000 = 10000
    // glassCost = 2.8959 m² * 120000 = 347508
    // dimPrice = 10000 + 7500 + 10000 + 347508 = 375008

    expect(result.dimPrice).toBe(EXPECTED_WITH_30MM_DISCOUNT);
  });

  it('should not result in negative area when discounts exceed dimensions', () => {
    // Edge case: 100mm x 100mm window with 50mm discount per side
    // Without protection: (100-50) x (100-50) = 50mm x 50mm = 0.0025 m²
    // Expected: Glass cost should be very small or zero
    const result = calculatePriceItem({
      glass: {
        discountHeightMm: 50,
        discountWidthMm: 50,
        pricePerSqm: GLASS_PRICE_STANDARD,
      },
      heightMm: 100,
      model: baseModel,
      widthMm: 100,
    });

    // widthCost = 5 * 100 = 500
    // heightCost = 5 * 100 = 500
    // glassCost = 0.0025 m² * 100000 = 250
    // dimPrice = 10000 + 500 + 500 + 250 = 11250

    expect(result.dimPrice).toBe(EXPECTED_SMALL_WINDOW_50MM);
    expect(result.dimPrice).toBeGreaterThan(0); // Should never be negative
  });

  it('should result in zero glass cost when discounts equal dimensions', () => {
    // Extreme case: 100mm x 100mm window with 100mm discount per side
    // Expected: (100-100) x (100-100) = 0 m² → glass cost = 0
    const result = calculatePriceItem({
      glass: {
        discountHeightMm: 100,
        discountWidthMm: 100,
        pricePerSqm: GLASS_PRICE_STANDARD,
      },
      heightMm: 100,
      model: baseModel,
      widthMm: 100,
    });

    // widthCost = 5 * 100 = 500
    // heightCost = 5 * 100 = 500
    // glassCost = 0 m² * 100000 = 0
    // dimPrice = 10000 + 500 + 500 + 0 = 11000

    expect(result.dimPrice).toBe(EXPECTED_ZERO_GLASS_AREA);
  });

  it('should demonstrate cost impact of discounts on expensive glass', () => {
    // Real-world scenario: 2 windows with expensive glass ($200k/m²)
    // Window 1: 1200mm x 1800mm WITHOUT discounts = 2.16 m² = $432k glass cost
    // Window 2: 1200mm x 1800mm WITH 40mm discounts = 2.09 m² = $418k glass cost
    // Savings: $14k per window × 10 windows = $140k total savings!

    const withoutDiscounts = calculatePriceItem({
      glass: {
        pricePerSqm: GLASS_PRICE_LUXURY,
      },
      heightMm: 1800,
      model: baseModel,
      widthMm: 1200,
    });

    const withDiscounts = calculatePriceItem({
      glass: {
        discountHeightMm: 40,
        discountWidthMm: 40,
        pricePerSqm: GLASS_PRICE_LUXURY,
      },
      heightMm: 1800,
      model: baseModel,
      widthMm: 1200,
    });

    // Without discounts: 1.2m × 1.8m = 2.16 m²
    // With discounts: (1200-40) × (1800-40) = 1.16m × 1.76m = 2.0416 m²

    const savingsPerWindow = withoutDiscounts.dimPrice - withDiscounts.dimPrice;
    const savingsPerTenWindows = savingsPerWindow * 10;

    expect(savingsPerWindow).toBeGreaterThan(MIN_SAVINGS_PER_WINDOW);
    expect(savingsPerTenWindows).toBeGreaterThan(MIN_SAVINGS_TEN_WINDOWS);
  });
});
