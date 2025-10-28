/**
 * Contract Tests: Cart Queries
 *
 * Tests tRPC query schemas for cart operations.
 * Validates input/output contracts without implementation.
 *
 * @module tests/contract/api/cart-queries
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";
import type { CartItem, CartSummary } from "@/types/cart.types";

// ============================================================================
// Schema Definitions (Contract)
// ============================================================================

/**
 * Schema for cart.listItems query output
 *
 * Contract: Returns array of cart items
 */
const listItemsOutputSchema = z.array(
  z.object({
    additionalServiceIds: z.array(z.string().cuid()),
    createdAt: z.string().datetime(),
    glassTypeId: z.string().cuid(),
    glassTypeName: z.string().min(1),
    heightMm: z.number().int().positive(),
    id: z.string().cuid(),
    modelId: z.string().cuid(),
    modelName: z.string().min(1),
    name: z.string().min(1).max(50),
    quantity: z.number().int().positive(),
    solutionId: z.string().cuid().optional(),
    solutionName: z.string().optional(),
    subtotal: z.number().nonnegative(),
    unitPrice: z.number().nonnegative(),
    widthMm: z.number().int().positive(),
  })
);

/**
 * Schema for cart.getTotals query output
 *
 * Contract: Returns cart summary with totals
 */
const getTotalsOutputSchema = z.object({
  currency: z.string().length(3), // ISO 4217 currency code
  isEmpty: z.boolean(),
  itemCount: z.number().int().nonnegative(),
  total: z.number().nonnegative(),
});

// ============================================================================
// Contract Tests
// ============================================================================

describe("Cart Queries Contract Tests", () => {
  describe("cart.listItems", () => {
    it("should accept empty array output", () => {
      const output: CartItem[] = [];
      const result = listItemsOutputSchema.safeParse(output);

      expect(result.success).toBe(true);
    });

    it("should accept valid cart items array", () => {
      const output: CartItem[] = [
        {
          additionalServiceIds: ["clx_service_111", "clx_service_222"],
          createdAt: "2025-01-15T10:30:00.000Z",
          glassTypeId: "clx_glass_456",
          glassTypeName: "Templado",
          heightMm: 1500,
          id: "clx1234567890abcdef",
          modelId: "clx_model_123",
          modelName: "VEKA Slide 82",
          name: "VEKA-001",
          quantity: 2,
          solutionId: "clx_solution_789",
          solutionName: "DVH",
          subtotal: 30_001.0,
          unitPrice: 15_000.5,
          widthMm: 1200,
        },
        {
          additionalServiceIds: [],
          createdAt: "2025-01-15T10:35:00.000Z",
          glassTypeId: "clx_glass_789",
          glassTypeName: "Laminado",
          heightMm: 1200,
          id: "clx9876543210fedcba",
          modelId: "clx_model_456",
          modelName: "Guardian Plus",
          name: "GUARDIAN-001",
          quantity: 1,
          subtotal: 12_000.0,
          unitPrice: 12_000.0,
          widthMm: 1000,
        },
      ];

      const result = listItemsOutputSchema.safeParse(output);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(2);
        expect(result.data[0]?.name).toBe("VEKA-001");
        expect(result.data[1]?.name).toBe("GUARDIAN-001");
      }
    });

    it("should reject invalid item (missing required fields)", () => {
      const output = [
        {
          id: "clx1234567890abcdef",
          modelName: "VEKA Slide 82",
          // Missing modelId, glassTypeId, etc.
        },
      ];

      const result = listItemsOutputSchema.safeParse(output);

      expect(result.success).toBe(false);
    });

    it("should reject invalid item (negative quantity)", () => {
      const output = [
        {
          additionalServiceIds: [],
          createdAt: "2025-01-15T10:30:00.000Z",
          glassTypeId: "clx_glass_456",
          glassTypeName: "Templado",
          heightMm: 1500,
          id: "clx1234567890abcdef",
          modelId: "clx_model_123",
          modelName: "VEKA Slide 82",
          name: "VEKA-001",
          quantity: -1, // Invalid: negative quantity
          subtotal: 30_000.0,
          unitPrice: 15_000.0,
          widthMm: 1200,
        },
      ];

      const result = listItemsOutputSchema.safeParse(output);

      expect(result.success).toBe(false);
    });

    it("should reject invalid item (name too long)", () => {
      const output = [
        {
          additionalServiceIds: [],
          createdAt: "2025-01-15T10:30:00.000Z",
          glassTypeId: "clx_glass_456",
          glassTypeName: "Templado",
          heightMm: 1500,
          id: "clx1234567890abcdef",
          modelId: "clx_model_123",
          modelName: "VEKA Slide 82",
          name: "A".repeat(51), // Invalid: exceeds 50 char limit
          quantity: 1,
          subtotal: 15_000.0,
          unitPrice: 15_000.0,
          widthMm: 1200,
        },
      ];

      const result = listItemsOutputSchema.safeParse(output);

      expect(result.success).toBe(false);
    });

    it("should accept optional fields as undefined", () => {
      const output: CartItem[] = [
        {
          additionalServiceIds: [],
          createdAt: "2025-01-15T10:30:00.000Z",
          glassTypeId: "clx_glass_456",
          glassTypeName: "Templado",
          heightMm: 1500,
          id: "clx1234567890abcdef",
          modelId: "clx_model_123",
          modelName: "VEKA Slide 82",
          name: "VEKA-001",
          quantity: 1,
          subtotal: 15_000.0,
          unitPrice: 15_000.0,
          // solutionId and solutionName are optional
          widthMm: 1200,
        },
      ];

      const result = listItemsOutputSchema.safeParse(output);

      expect(result.success).toBe(true);
    });
  });

  describe("cart.getTotals", () => {
    it("should accept valid cart summary (empty cart)", () => {
      const output: CartSummary = {
        currency: "MXN",
        isEmpty: true,
        itemCount: 0,
        total: 0,
      };

      const result = getTotalsOutputSchema.safeParse(output);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isEmpty).toBe(true);
        expect(result.data.itemCount).toBe(0);
      }
    });

    it("should accept valid cart summary (with items)", () => {
      const output: CartSummary = {
        currency: "USD",
        isEmpty: false,
        itemCount: 5,
        total: 75_000.5,
      };

      const result = getTotalsOutputSchema.safeParse(output);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isEmpty).toBe(false);
        expect(result.data.itemCount).toBe(5);
        expect(result.data.total).toBe(75_000.5);
      }
    });

    it("should reject invalid currency code (not 3 chars)", () => {
      const output = {
        currency: "US", // Invalid: must be 3 chars
        isEmpty: false,
        itemCount: 5,
        total: 75_000.5,
      };

      const result = getTotalsOutputSchema.safeParse(output);

      expect(result.success).toBe(false);
    });

    it("should reject negative item count", () => {
      const output = {
        currency: "MXN",
        isEmpty: true,
        itemCount: -1, // Invalid: cannot be negative
        total: 0,
      };

      const result = getTotalsOutputSchema.safeParse(output);

      expect(result.success).toBe(false);
    });

    it("should reject negative total", () => {
      const output = {
        currency: "MXN",
        isEmpty: false,
        itemCount: 5,
        total: -100.0, // Invalid: cannot be negative
      };

      const result = getTotalsOutputSchema.safeParse(output);

      expect(result.success).toBe(false);
    });

    it("should accept zero total with items (edge case: free items)", () => {
      const output: CartSummary = {
        currency: "MXN",
        isEmpty: false,
        itemCount: 2,
        total: 0,
      };

      const result = getTotalsOutputSchema.safeParse(output);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.total).toBe(0);
        expect(result.data.itemCount).toBeGreaterThan(0);
      }
    });

    it("should require all fields (no partial objects)", () => {
      const output = {
        itemCount: 5,
        total: 75_000.5,
        // Missing currency and isEmpty
      };

      const result = getTotalsOutputSchema.safeParse(output);

      expect(result.success).toBe(false);
    });
  });

  describe("Contract Consistency", () => {
    it("should have consistent subtotal calculation (unitPrice * quantity)", () => {
      const item: CartItem = {
        additionalServiceIds: [],
        createdAt: "2025-01-15T10:30:00.000Z",
        glassTypeId: "clx_glass_456",
        glassTypeName: "Templado",
        heightMm: 1500,
        id: "clx1234567890abcdef",
        modelId: "clx_model_123",
        modelName: "VEKA Slide 82",
        name: "VEKA-001",
        quantity: 3,
        subtotal: 30_000.0, // Must equal unitPrice * quantity
        unitPrice: 10_000.0,
        widthMm: 1200,
      };

      const result = listItemsOutputSchema.element.safeParse(item);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.subtotal).toBe(
          result.data.unitPrice * result.data.quantity
        );
      }
    });

    it("should have consistent isEmpty flag with itemCount", () => {
      const emptyCart: CartSummary = {
        currency: "MXN",
        isEmpty: true, // Must be true when itemCount is 0
        itemCount: 0,
        total: 0,
      };

      const nonEmptyCart: CartSummary = {
        currency: "MXN",
        isEmpty: false, // Must be false when itemCount > 0
        itemCount: 3,
        total: 45_000.0,
      };

      expect(getTotalsOutputSchema.safeParse(emptyCart).success).toBe(true);
      expect(getTotalsOutputSchema.safeParse(nonEmptyCart).success).toBe(true);
    });
  });
});
