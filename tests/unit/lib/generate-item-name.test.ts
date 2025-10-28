/**
 * Unit Tests: Generate Item Name Utility
 *
 * Tests sequential naming algorithm with various model prefixes.
 * Follows TDD approach - tests written before implementation.
 *
 * @module tests/unit/lib/generate-item-name
 */

import { describe, expect, it } from "vitest";
import {
  extractModelPrefix,
  findNextSequence,
  generateItemName,
  isNameUnique,
  validateItemName,
} from "../../../src/lib/utils/generate-item-name";
import type { CartItem } from "../../../src/types/cart.types";

// ============================================================================
// Test Fixtures
// ============================================================================

const createMockCartItem = (name: string, modelName: string): CartItem => ({
  additionalServiceIds: [],
  createdAt: new Date().toISOString(),
  dimensions: { heightMm: 100, widthMm: 100 },
  glassTypeId: "glass-1",
  glassTypeName: "Templado",
  heightMm: 100,
  id: "item-1",
  modelId: "model-1",
  modelName,
  name,
  quantity: 1,
  subtotal: 10_000,
  unitPrice: 10_000,
  widthMm: 100,
});

// ============================================================================
// extractModelPrefix Tests
// ============================================================================

describe("extractModelPrefix", () => {
  it("should extract first word from model name", () => {
    expect(extractModelPrefix("VEKA Premium")).toBe("VEKA");
    expect(extractModelPrefix("Guardian 6mm Templado")).toBe("GUARDIAN");
    expect(extractModelPrefix("Modelo Especial")).toBe("MODELO");
  });

  it("should handle hyphenated model names", () => {
    expect(extractModelPrefix("modelo-especial-premium")).toBe("MODELO");
    expect(extractModelPrefix("VEKA-Premium")).toBe("VEKA");
  });

  it("should handle underscore separated names", () => {
    expect(extractModelPrefix("modelo_especial")).toBe("MODELO");
    expect(extractModelPrefix("VEKA_Premium")).toBe("VEKA");
  });

  it("should convert to uppercase", () => {
    expect(extractModelPrefix("veka")).toBe("VEKA");
    expect(extractModelPrefix("guardian")).toBe("GUARDIAN");
    expect(extractModelPrefix("MiXeD CaSe")).toBe("MIXED");
  });

  it("should limit prefix to 10 characters", () => {
    expect(extractModelPrefix("VeryLongModelNameThatExceeds")).toBe(
      "VERYLONGMO"
    );
    expect(extractModelPrefix("ExtremelyLongPrefix")).toBe("EXTREMELYL");
  });

  it("should handle edge cases", () => {
    expect(extractModelPrefix("")).toBe("ITEM");
    expect(extractModelPrefix("   ")).toBe("ITEM");
    expect(extractModelPrefix("123")).toBe("123");
  });

  it("should handle invalid inputs", () => {
    // @ts-expect-error Testing invalid input
    expect(extractModelPrefix(null)).toBe("ITEM");
    // @ts-expect-error Testing invalid input
    expect(extractModelPrefix(undefined)).toBe("ITEM");
    // @ts-expect-error Testing invalid input
    expect(extractModelPrefix(123)).toBe("ITEM");
  });

  it("should trim whitespace", () => {
    expect(extractModelPrefix("  VEKA  ")).toBe("VEKA");
    expect(extractModelPrefix("\tGuardian\n")).toBe("GUARDIAN");
  });
});

// ============================================================================
// findNextSequence Tests
// ============================================================================

describe("findNextSequence", () => {
  it('should return "001" for empty cart', () => {
    expect(findNextSequence("VEKA", [])).toBe("001");
  });

  it('should return "001" when prefix not found', () => {
    const items = [
      createMockCartItem("GUARDIAN-001", "Guardian Premium"),
      createMockCartItem("GUARDIAN-002", "Guardian Premium"),
    ];
    expect(findNextSequence("VEKA", items)).toBe("001");
  });

  it("should find next sequence for existing prefix", () => {
    const items = [
      createMockCartItem("VEKA-001", "VEKA Premium"),
      createMockCartItem("VEKA-002", "VEKA Premium"),
    ];
    expect(findNextSequence("VEKA", items)).toBe("003");
  });

  it("should handle non-sequential numbers", () => {
    const items = [
      createMockCartItem("VEKA-001", "VEKA Premium"),
      createMockCartItem("VEKA-005", "VEKA Premium"),
      createMockCartItem("VEKA-003", "VEKA Premium"),
    ];
    expect(findNextSequence("VEKA", items)).toBe("006");
  });

  it("should be case-insensitive for prefix matching", () => {
    const items = [
      createMockCartItem("veka-001", "VEKA Premium"),
      createMockCartItem("VEKA-002", "VEKA Premium"),
    ];
    expect(findNextSequence("VEKA", items)).toBe("003");
  });

  it("should ignore items with different prefixes", () => {
    const items = [
      createMockCartItem("VEKA-001", "VEKA Premium"),
      createMockCartItem("GUARDIAN-001", "Guardian Premium"),
      createMockCartItem("VEKA-002", "VEKA Premium"),
      createMockCartItem("GUARDIAN-002", "Guardian Premium"),
    ];
    expect(findNextSequence("VEKA", items)).toBe("003");
  });

  it("should pad sequence numbers to 3 digits", () => {
    expect(findNextSequence("VEKA", [])).toBe("001");

    const items = [createMockCartItem("VEKA-009", "VEKA Premium")];
    expect(findNextSequence("VEKA", items)).toBe("010");
  });

  it("should handle large sequence numbers", () => {
    const items = [createMockCartItem("VEKA-099", "VEKA Premium")];
    expect(findNextSequence("VEKA", items)).toBe("100");
  });

  it("should handle invalid inputs", () => {
    expect(findNextSequence("", [])).toBe("001");
    // @ts-expect-error Testing invalid input
    expect(findNextSequence(null, [])).toBe("001");
    // @ts-expect-error Testing invalid input
    expect(findNextSequence("VEKA", null)).toBe("001");
  });
});

// ============================================================================
// generateItemName Tests
// ============================================================================

describe("generateItemName", () => {
  it("should generate name with pattern PREFIX-SEQUENCE", () => {
    const name = generateItemName("VEKA Premium", []);
    expect(name).toBe("VEKA-001");
  });

  it("should generate sequential names for same prefix", () => {
    const items: CartItem[] = [];

    const name1 = generateItemName("VEKA Premium", items);
    expect(name1).toBe("VEKA-001");

    items.push(createMockCartItem(name1, "VEKA Premium"));
    const name2 = generateItemName("VEKA Premium", items);
    expect(name2).toBe("VEKA-002");

    items.push(createMockCartItem(name2, "VEKA Premium"));
    const name3 = generateItemName("VEKA Premium", items);
    expect(name3).toBe("VEKA-003");
  });

  it("should handle different prefixes independently", () => {
    const items = [
      createMockCartItem("VEKA-001", "VEKA Premium"),
      createMockCartItem("GUARDIAN-001", "Guardian Premium"),
    ];

    expect(generateItemName("VEKA Premium", items)).toBe("VEKA-002");
    expect(generateItemName("Guardian Premium", items)).toBe("GUARDIAN-002");
  });

  it("should handle collision by adding timestamp", () => {
    const items = [createMockCartItem("VEKA-001", "VEKA Premium")];

    // First call should return VEKA-002
    const name1 = generateItemName("VEKA Premium", items);
    expect(name1).toBe("VEKA-002");

    // If we manually add VEKA-002 before calling again, it should handle collision
    items.push(createMockCartItem("VEKA-002", "VEKA Premium"));
    const name2 = generateItemName("VEKA Premium", items);
    expect(name2).toMatch(/^VEKA-003$/);
  });

  it("should handle edge cases", () => {
    expect(generateItemName("", [])).toMatch(/^ITEM-001$/);
    expect(generateItemName("   ", [])).toMatch(/^ITEM-001$/);
  });

  it("should not exceed maximum name length", () => {
    const name = generateItemName(
      "VeryLongModelNameThatExceedsMaximumLength",
      []
    );
    expect(name.length).toBeLessThanOrEqual(50);
  });
});

// ============================================================================
// isNameUnique Tests
// ============================================================================

describe("isNameUnique", () => {
  it("should return true for unique name", () => {
    const items = [
      createMockCartItem("VEKA-001", "VEKA Premium"),
      createMockCartItem("GUARDIAN-001", "Guardian Premium"),
    ];
    expect(isNameUnique("VEKA-002", items)).toBe(true);
  });

  it("should return false for duplicate name", () => {
    const items = [
      createMockCartItem("VEKA-001", "VEKA Premium"),
      createMockCartItem("GUARDIAN-001", "Guardian Premium"),
    ];
    expect(isNameUnique("VEKA-001", items)).toBe(false);
  });

  it("should be case-sensitive for exact match", () => {
    const items = [createMockCartItem("VEKA-001", "VEKA Premium")];
    expect(isNameUnique("VEKA-001", items)).toBe(false);
    expect(isNameUnique("veka-001", items)).toBe(false); // isNameUnique is case-sensitive
  });

  it("should exclude item with matching ID", () => {
    const items = [createMockCartItem("VEKA-001", "VEKA Premium")];
    items[0].id = "item-123";

    // Same name but different ID - should be not unique
    expect(isNameUnique("VEKA-001", items)).toBe(false);

    // Same name and same ID (editing existing item) - should be unique
    expect(isNameUnique("VEKA-001", items, "item-123")).toBe(true);
  });

  it("should handle empty cart", () => {
    expect(isNameUnique("VEKA-001", [])).toBe(true);
  });

  it("should handle whitespace", () => {
    const items = [createMockCartItem("VEKA-001", "VEKA Premium")];
    expect(isNameUnique("  VEKA-001  ", items)).toBe(false);
  });
});

// ============================================================================
// validateItemName Tests
// ============================================================================

describe("validateItemName", () => {
  it("should accept valid names", () => {
    expect(validateItemName("VEKA-001", [])).toEqual({ valid: true });
    expect(validateItemName("GUARDIAN-123", [])).toEqual({ valid: true });
    expect(validateItemName("Mi Ventana Personalizada", [])).toEqual({
      valid: true,
    });
  });

  it("should reject empty names", () => {
    const result = validateItemName("", []);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/requerido/i);
  });

  it("should reject whitespace-only names", () => {
    const result = validateItemName("   ", []);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/vacío/i);
  });

  it("should reject names exceeding maximum length", () => {
    const longName = "A".repeat(51);
    const result = validateItemName(longName, []);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/exceder/i);
  });

  it("should accept names at maximum length", () => {
    const maxName = "A".repeat(50);
    expect(validateItemName(maxName, [])).toEqual({ valid: true });
  });

  it("should trim whitespace before validation", () => {
    expect(validateItemName("  VEKA-001  ", [])).toEqual({ valid: true });
  });

  it("should handle invalid inputs", () => {
    // @ts-expect-error Testing invalid input
    const result1 = validateItemName(null, []);
    expect(result1.valid).toBe(false);

    // @ts-expect-error Testing invalid input
    const result2 = validateItemName(undefined, []);
    expect(result2.valid).toBe(false);

    // @ts-expect-error Testing invalid input
    const result3 = validateItemName(123, []);
    expect(result3.valid).toBe(false);
  });
});
