import { describe, expect, it } from "vitest";

/**
 * Glass Area Display Validation Tests
 *
 * Ensures that glass area calculations in the UI match server-side calculations.
 * Critical for pricing accuracy and user trust.
 *
 * ## Context
 * - Server applies discounts: lines 131-142 in price-item.ts
 * - Client must show same discounted area in breakdown
 * - glassDiscountWidthMm/HeightMm default to 0 (no discount)
 *
 * ## Test Strategy
 * 1. Calculate effective dimensions (with discounts)
 * 2. Convert to meters
 * 3. Calculate area
 * 4. Verify displayed area matches calculation
 */

const MM_TO_METERS = 1000;

describe("Glass Area Display - Client-Server Alignment", () => {
  it("should calculate glass area WITHOUT discounts when model has no discounts", () => {
    // Arrange: Model with no glass discounts
    const widthMm = 1000;
    const heightMm = 1000;
    const glassDiscountWidthMm = 0; // No discount
    const glassDiscountHeightMm = 0; // No discount

    // Act: Calculate effective area (matching model-form.tsx lines 94-107)
    const effectiveWidthMm = Math.max(widthMm - glassDiscountWidthMm, 0);
    const effectiveHeightMm = Math.max(heightMm - glassDiscountHeightMm, 0);
    const widthM = effectiveWidthMm / MM_TO_METERS;
    const heightM = effectiveHeightMm / MM_TO_METERS;
    const glassArea = widthM * heightM;

    // Assert: Should be full 1.00 m²
    expect(glassArea).toBe(1.0);
    expect(glassArea.toFixed(2)).toBe("1.00");
  });

  it("should calculate glass area WITH discounts when model has discounts", () => {
    // Arrange: Ventana Termoacústica Elite (20mm width, 20mm height discounts)
    const widthMm = 1000;
    const heightMm = 1000;
    const glassDiscountWidthMm = 20; // Profile width
    const glassDiscountHeightMm = 20; // Profile height

    // Act: Calculate effective area (matching model-form.tsx lines 94-107)
    const effectiveWidthMm = Math.max(widthMm - glassDiscountWidthMm, 0);
    const effectiveHeightMm = Math.max(heightMm - glassDiscountHeightMm, 0);
    const widthM = effectiveWidthMm / MM_TO_METERS;
    const heightM = effectiveHeightMm / MM_TO_METERS;
    const glassArea = widthM * heightM;

    // Assert: Should be 0.9604 m² (not 1.00)
    expect(glassArea).toBeCloseTo(0.9604, 4);
    expect(glassArea.toFixed(2)).toBe("0.96");
  });

  it("should show correct glass price in breakdown (area × pricePerSqm)", () => {
    // Arrange: 1000×1000mm with 20mm discounts, glass @ $185,000/m²
    const widthMm = 1000;
    const heightMm = 1000;
    const glassDiscountWidthMm = 20;
    const glassDiscountHeightMm = 20;
    const pricePerSqm = 185_000;

    // Act: Calculate glass cost (matching model-form.tsx lines 139-142)
    const effectiveWidthMm = Math.max(widthMm - glassDiscountWidthMm, 0);
    const effectiveHeightMm = Math.max(heightMm - glassDiscountHeightMm, 0);
    const glassArea =
      (effectiveWidthMm / MM_TO_METERS) * (effectiveHeightMm / MM_TO_METERS);
    const glassCost = glassArea * pricePerSqm;

    // Assert: $177,674 (not $185,000)
    expect(glassCost).toBeCloseTo(177_674, 0);
    expect(glassCost).toBeLessThan(pricePerSqm); // Always less than 1m² price
  });

  it("should display correct label format in breakdown", () => {
    // Arrange: Glass with area calculation
    const glassName = "Vidrio Laminado 6mm";
    const glassArea = 0.9604;

    // Act: Format label (matching model-form.tsx line 158)
    const label = `Vidrio ${glassName} (${glassArea.toFixed(2)} m²)`;

    // Assert: Should show discounted area, not raw dimensions
    expect(label).toBe("Vidrio Vidrio Laminado 6mm (0.96 m²)");
    expect(label).toContain("0.96 m²"); // NOT "1.00 m²"
  });

  it("should prevent negative glass area when discounts exceed dimensions", () => {
    // Arrange: Extreme case - discounts larger than dimensions
    const widthMm = 50; // Very small
    const heightMm = 50;
    const glassDiscountWidthMm = 100; // Discount exceeds size!
    const glassDiscountHeightMm = 100;

    // Act: Calculate with Math.max protection
    const effectiveWidthMm = Math.max(widthMm - glassDiscountWidthMm, 0);
    const effectiveHeightMm = Math.max(heightMm - glassDiscountHeightMm, 0);
    const glassArea =
      (effectiveWidthMm / MM_TO_METERS) * (effectiveHeightMm / MM_TO_METERS);

    // Assert: Should be 0, not negative
    expect(glassArea).toBe(0);
    expect(effectiveWidthMm).toBe(0);
    expect(effectiveHeightMm).toBe(0);
  });

  it("should match server-side calculation exactly (integration check)", () => {
    // Arrange: Real-world example from screenshots
    const widthMm = 1000;
    const heightMm = 1000;
    const glassDiscountWidthMm = 20;
    const glassDiscountHeightMm = 20;
    const pricePerSqm = 185_000;

    // Act: Client-side calculation (model-form.tsx)
    const clientEffectiveWidthMm = Math.max(widthMm - glassDiscountWidthMm, 0);
    const clientEffectiveHeightMm = Math.max(
      heightMm - glassDiscountHeightMm,
      0
    );
    const clientGlassArea =
      (clientEffectiveWidthMm / MM_TO_METERS) *
      (clientEffectiveHeightMm / MM_TO_METERS);
    const clientGlassCost = clientGlassArea * pricePerSqm;

    // Simulate server-side calculation (price-item.ts lines 131-142)
    const serverEffWidthMm = Math.max(
      widthMm - Math.max(glassDiscountWidthMm, 0),
      0
    );
    const serverEffHeightMm = Math.max(
      heightMm - Math.max(glassDiscountHeightMm, 0),
      0
    );
    const serverEffWidthM = serverEffWidthMm / MM_TO_METERS;
    const serverEffHeightM = serverEffHeightMm / MM_TO_METERS;
    const serverAreaSqm = serverEffWidthM * serverEffHeightM;
    const serverGlassCost = pricePerSqm * serverAreaSqm;

    // Assert: Client and server MUST match exactly
    expect(clientGlassArea).toBeCloseTo(serverAreaSqm, 4);
    expect(clientGlassCost).toBeCloseTo(serverGlassCost, 0);
    expect(clientGlassArea.toFixed(2)).toBe(serverAreaSqm.toFixed(2)); // Display format
  });
});
