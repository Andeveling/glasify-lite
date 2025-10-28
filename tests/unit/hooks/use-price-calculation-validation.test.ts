import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { usePriceCalculation } from "../../../src/app/(public)/catalog/[modelId]/_hooks/use-price-calculation";

// Mock tRPC
vi.mock("@/trpc/react", () => ({
  api: {
    quote: {
      "calculate-item": {
        useMutation: vi.fn(() => ({
          mutate: vi.fn(),
        })),
      },
    },
  },
}));

/**
 * Client-Side Dimension Validation Tests
 * Verifies that usePriceCalculation does NOT call the API when dimensions are out of range
 */
describe("usePriceCalculation - Client-Side Validation", () => {
  const baseParams = {
    additionalServices: [],
    glassTypeId: "glass-123",
    modelId: "model-123",
  };

  const modelConstraints = {
    maxHeightMm: 2100,
    maxWidthMm: 2000,
    minHeightMm: 500,
    minWidthMm: 600,
  };

  it("should NOT calculate when width is below minimum", () => {
    const { result } = renderHook(() =>
      usePriceCalculation({
        ...baseParams,
        ...modelConstraints,
        heightMm: 1000, // Valid
        widthMm: 500, // ❌ Below minWidthMm (600)
      })
    );

    expect(result.current.calculatedPrice).toBeUndefined();
    expect(result.current.error).toBe("Dimensiones fuera del rango permitido");
    expect(result.current.isCalculating).toBe(false);
  });

  it("should NOT calculate when width is above maximum", () => {
    const { result } = renderHook(() =>
      usePriceCalculation({
        ...baseParams,
        ...modelConstraints,
        heightMm: 1000, // Valid
        widthMm: 2500, // ❌ Above maxWidthMm (2000)
      })
    );

    expect(result.current.calculatedPrice).toBeUndefined();
    expect(result.current.error).toBe("Dimensiones fuera del rango permitido");
    expect(result.current.isCalculating).toBe(false);
  });

  it("should NOT calculate when height is below minimum", () => {
    const { result } = renderHook(() =>
      usePriceCalculation({
        ...baseParams,
        ...modelConstraints,
        heightMm: 400, // ❌ Below minHeightMm (500)
        widthMm: 1000, // Valid
      })
    );

    expect(result.current.calculatedPrice).toBeUndefined();
    expect(result.current.error).toBe("Dimensiones fuera del rango permitido");
    expect(result.current.isCalculating).toBe(false);
  });

  it("should NOT calculate when height is above maximum", () => {
    const { result } = renderHook(() =>
      usePriceCalculation({
        ...baseParams,
        ...modelConstraints,
        heightMm: 2500, // ❌ Above maxHeightMm (2100)
        widthMm: 1000, // Valid
      })
    );

    expect(result.current.calculatedPrice).toBeUndefined();
    expect(result.current.error).toBe("Dimensiones fuera del rango permitido");
    expect(result.current.isCalculating).toBe(false);
  });

  it("should NOT calculate when both dimensions are out of range", () => {
    const { result } = renderHook(() =>
      usePriceCalculation({
        ...baseParams,
        ...modelConstraints,
        heightMm: 5000, // ❌ Way above max
        widthMm: 1, // ❌ Way below min
      })
    );

    expect(result.current.calculatedPrice).toBeUndefined();
    expect(result.current.error).toBe("Dimensiones fuera del rango permitido");
    expect(result.current.isCalculating).toBe(false);
  });

  it("should allow calculation when dimensions are at minimum boundary", async () => {
    const { result } = renderHook(() =>
      usePriceCalculation({
        ...baseParams,
        ...modelConstraints,
        heightMm: 500, // ✅ Exactly at minHeightMm
        widthMm: 600, // ✅ Exactly at minWidthMm
      })
    );

    // Should not show error for valid dimensions
    await waitFor(() => {
      expect(result.current.error).not.toBe(
        "Dimensiones fuera del rango permitido"
      );
    });
  });

  it("should allow calculation when dimensions are at maximum boundary", async () => {
    const { result } = renderHook(() =>
      usePriceCalculation({
        ...baseParams,
        ...modelConstraints,
        heightMm: 2100, // ✅ Exactly at maxHeightMm
        widthMm: 2000, // ✅ Exactly at maxWidthMm
      })
    );

    // Should not show error for valid dimensions
    await waitFor(() => {
      expect(result.current.error).not.toBe(
        "Dimensiones fuera del rango permitido"
      );
    });
  });

  it("should allow calculation when dimensions are within range", async () => {
    const { result } = renderHook(() =>
      usePriceCalculation({
        ...baseParams,
        ...modelConstraints,
        heightMm: 1500, // ✅ Within range
        widthMm: 1200, // ✅ Within range
      })
    );

    // Should not show error for valid dimensions
    await waitFor(() => {
      expect(result.current.error).not.toBe(
        "Dimensiones fuera del rango permitido"
      );
    });
  });

  it("should work without dimension constraints (backward compatibility)", async () => {
    const { result } = renderHook(() =>
      usePriceCalculation({
        ...baseParams,
        // ✅ No min/max constraints provided
        heightMm: 9999,
        widthMm: 9999,
      })
    );

    // Should not show error when no constraints are provided
    await waitFor(() => {
      expect(result.current.error).not.toBe(
        "Dimensiones fuera del rango permitido"
      );
    });
  });
});
