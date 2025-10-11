/**
 * Unit Tests: Cart Utility Functions
 *
 * Tests total calculation, item validation functions.
 * Follows TDD approach - tests written before implementation.
 *
 * @module tests/unit/lib/cart-utils
 */

import { describe, expect, it } from 'vitest';
import {
  calculateCartTotal,
  calculateItemCount,
  calculateItemSubtotal,
  generateCartSummary,
  updateCartItem,
  validateCartItem,
  validateCartLimit,
  validateQuantity,
} from '../../../src/lib/utils/cart.utils';
import type { CartItem } from '../../../src/types/cart.types';
import { CART_CONSTANTS } from '../../../src/types/cart.types';

// ============================================================================
// Test Fixtures
// ============================================================================

const createMockCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
  additionalServiceIds: [],
  createdAt: new Date().toISOString(),
  dimensions: { heightMm: 100, widthMm: 100 },
  glassTypeId: 'glass-1',
  glassTypeName: 'Templado',
  heightMm: 100,
  id: 'item-1',
  modelId: 'model-1',
  modelName: 'VEKA Premium',
  name: 'VEKA-001',
  quantity: 1,
  subtotal: 10_000,
  unitPrice: 10_000,
  widthMm: 100,
  ...overrides,
});

// ============================================================================
// calculateCartTotal Tests
// ============================================================================

describe('calculateCartTotal', () => {
  it('should return 0 for empty cart', () => {
    expect(calculateCartTotal([])).toBe(0);
  });

  it('should calculate total for single item', () => {
    const items = [createMockCartItem({ subtotal: 15_000 })];
    expect(calculateCartTotal(items)).toBe(15_000);
  });

  it('should calculate total for multiple items', () => {
    const items = [
      createMockCartItem({ subtotal: 10_000 }),
      createMockCartItem({ subtotal: 20_000 }),
      createMockCartItem({ subtotal: 30_000 }),
    ];
    expect(calculateCartTotal(items)).toBe(60_000);
  });

  it('should handle decimal prices correctly', () => {
    const items = [createMockCartItem({ subtotal: 10_000.5 }), createMockCartItem({ subtotal: 20_000.25 })];
    expect(calculateCartTotal(items)).toBeCloseTo(30_000.75, 2);
  });

  it('should handle invalid inputs', () => {
    // @ts-expect-error Testing invalid input
    expect(calculateCartTotal(null)).toBe(0);
    // @ts-expect-error Testing invalid input
    expect(calculateCartTotal(undefined)).toBe(0);
  });
});

// ============================================================================
// calculateItemCount Tests
// ============================================================================

describe('calculateItemCount', () => {
  it('should return 0 for empty cart', () => {
    expect(calculateItemCount([])).toBe(0);
  });

  it('should count single item with quantity 1', () => {
    const items = [createMockCartItem({ quantity: 1 })];
    expect(calculateItemCount(items)).toBe(1);
  });

  it('should sum quantities for multiple items', () => {
    const items = [
      createMockCartItem({ quantity: 2 }),
      createMockCartItem({ quantity: 3 }),
      createMockCartItem({ quantity: 5 }),
    ];
    expect(calculateItemCount(items)).toBe(10);
  });

  it('should handle single item with large quantity', () => {
    const items = [createMockCartItem({ quantity: 50 })];
    expect(calculateItemCount(items)).toBe(50);
  });

  it('should handle invalid inputs', () => {
    // @ts-expect-error Testing invalid input
    expect(calculateItemCount(null)).toBe(0);
    // @ts-expect-error Testing invalid input
    expect(calculateItemCount(undefined)).toBe(0);
  });
});

// ============================================================================
// calculateItemSubtotal Tests
// ============================================================================

describe('calculateItemSubtotal', () => {
  it('should calculate subtotal correctly', () => {
    expect(calculateItemSubtotal(10_000, 1)).toBe(10_000);
    expect(calculateItemSubtotal(10_000, 5)).toBe(50_000);
    expect(calculateItemSubtotal(15_500, 3)).toBe(46_500);
  });

  it('should handle decimal prices', () => {
    expect(calculateItemSubtotal(10_000.5, 2)).toBeCloseTo(20_001, 2);
    expect(calculateItemSubtotal(15_999.99, 3)).toBeCloseTo(47_999.97, 2);
  });

  it('should return 0 for negative prices', () => {
    expect(calculateItemSubtotal(-100, 5)).toBe(0);
  });

  it('should return 0 for negative quantities', () => {
    expect(calculateItemSubtotal(10_000, -5)).toBe(0);
  });

  it('should return 0 for zero price', () => {
    expect(calculateItemSubtotal(0, 5)).toBe(0);
  });

  it('should return 0 for zero quantity', () => {
    expect(calculateItemSubtotal(10_000, 0)).toBe(0);
  });
});

// ============================================================================
// generateCartSummary Tests
// ============================================================================

describe('generateCartSummary', () => {
  it('should generate summary for empty cart', () => {
    const summary = generateCartSummary([], 'COP');
    expect(summary).toEqual({
      currency: 'COP',
      isEmpty: true,
      itemCount: 0,
      total: 0,
    });
  });

  it('should generate summary for cart with items', () => {
    const items = [
      createMockCartItem({ quantity: 2, subtotal: 20_000 }),
      createMockCartItem({ quantity: 3, subtotal: 30_000 }),
    ];
    const summary = generateCartSummary(items, 'COP');
    expect(summary).toEqual({
      currency: 'COP',
      isEmpty: false,
      itemCount: 5,
      total: 50_000,
    });
  });

  it('should use provided currency from TenantConfig', () => {
    const summary = generateCartSummary([], 'COP');
    expect(summary.currency).toBe('COP');
  });

  it('should accept custom currency', () => {
    const summary = generateCartSummary([], 'USD');
    expect(summary.currency).toBe('USD');
  });

  it('should mark isEmpty as false when items exist', () => {
    const items = [createMockCartItem()];
    expect(generateCartSummary(items, 'COP').isEmpty).toBe(false);
  });
});

// ============================================================================
// validateQuantity Tests
// ============================================================================

describe('validateQuantity', () => {
  it('should accept valid quantities', () => {
    expect(validateQuantity(1)).toEqual({ valid: true });
    expect(validateQuantity(10)).toEqual({ valid: true });
    expect(validateQuantity(100)).toEqual({ valid: true });
  });

  it('should reject negative quantities', () => {
    const result = validateQuantity(-1);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/mínima/i);
  });

  it('should reject zero quantity', () => {
    const result = validateQuantity(0);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/mínima/i);
  });

  it('should reject quantities below minimum', () => {
    const result = validateQuantity(CART_CONSTANTS.MIN_QUANTITY - 1);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/mínima/i);
  });

  it('should reject quantities above maximum', () => {
    const result = validateQuantity(CART_CONSTANTS.MAX_QUANTITY + 1);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/máxima/i);
  });

  it('should accept minimum quantity', () => {
    expect(validateQuantity(CART_CONSTANTS.MIN_QUANTITY)).toEqual({ valid: true });
  });

  it('should accept maximum quantity', () => {
    expect(validateQuantity(CART_CONSTANTS.MAX_QUANTITY)).toEqual({ valid: true });
  });

  it('should reject decimal quantities', () => {
    const result = validateQuantity(1.5);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/entero/i);
  });

  it('should reject non-numeric quantities', () => {
    // @ts-expect-error Testing invalid input
    const result = validateQuantity('5');
    expect(result.valid).toBe(false);
  });
});

// ============================================================================
// validateCartLimit Tests
// ============================================================================

describe('validateCartLimit', () => {
  it('should accept cart below limit', () => {
    expect(validateCartLimit(0)).toEqual({ valid: true });
    expect(validateCartLimit(10)).toEqual({ valid: true });
    expect(validateCartLimit(CART_CONSTANTS.MAX_ITEMS - 1)).toEqual({ valid: true });
  });

  it('should reject cart at limit', () => {
    const result = validateCartLimit(CART_CONSTANTS.MAX_ITEMS);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/no puedes agregar más/i);
  });

  it('should reject cart above limit', () => {
    const result = validateCartLimit(CART_CONSTANTS.MAX_ITEMS + 1);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/no puedes agregar más/i);
  });

  it('should handle edge case at limit - 1', () => {
    expect(validateCartLimit(CART_CONSTANTS.MAX_ITEMS - 1)).toEqual({ valid: true });
  });
});

// ============================================================================
// validateCartItem Tests
// ============================================================================

describe('validateCartItem', () => {
  it('should accept valid cart item', () => {
    const item = createMockCartItem();
    expect(validateCartItem(item)).toEqual({ valid: true });
  });

  it('should reject null item', () => {
    const result = validateCartItem(null);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/inválido/i);
  });

  it('should reject undefined item', () => {
    const result = validateCartItem(undefined);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/inválido/i);
  });

  it('should reject non-object item', () => {
    const result = validateCartItem('not an object');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/inválido/i);
  });

  it('should reject item with missing required string fields', () => {
    const requiredFields = ['id', 'modelId', 'modelName', 'glassTypeId', 'glassTypeName', 'name'];

    for (const field of requiredFields) {
      const item = createMockCartItem({ [field]: '' });
      const result = validateCartItem(item);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(new RegExp(field, 'i'));
    }
  });

  it('should reject item with non-string required fields', () => {
    // @ts-expect-error Testing invalid input
    const item = createMockCartItem({ id: 123 });
    const result = validateCartItem(item);
    expect(result.valid).toBe(false);
  });

  it('should reject item with invalid quantity', () => {
    const item = createMockCartItem({ quantity: -1 });
    const result = validateCartItem(item);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/cantidad/i);
  });

  it('should reject item with invalid unitPrice', () => {
    const item = createMockCartItem({ unitPrice: -100 });
    const result = validateCartItem(item);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/precio unitario/i);
  });

  it('should reject item with invalid subtotal', () => {
    const item = createMockCartItem({ subtotal: -100 });
    const result = validateCartItem(item);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/subtotal/i);
  });

  it('should reject item with missing dimensions', () => {
    const item = createMockCartItem();
    // @ts-expect-error Testing invalid input
    item.dimensions = null;
    const result = validateCartItem(item);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/dimensiones/i);
  });

  it('should reject item with invalid dimensions', () => {
    const item = createMockCartItem();
    item.dimensions = { heightMm: -100, widthMm: 100 };
    const result = validateCartItem(item);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/alto debe ser positivo/i);
  });

  it('should accept item with empty selectedServiceIds array', () => {
    const item = createMockCartItem({ additionalServiceIds: [] });
    expect(validateCartItem(item)).toEqual({ valid: true });
  });

  it('should accept item with populated selectedServiceIds', () => {
    const item = createMockCartItem({ additionalServiceIds: ['service-1', 'service-2'] });
    expect(validateCartItem(item)).toEqual({ valid: true });
  });

  it('should reject item with non-array selectedServiceIds', () => {
    const item = createMockCartItem();
    // @ts-expect-error Testing invalid input
    item.additionalServiceIds = 'not-an-array';
    const result = validateCartItem(item);
    expect(result.valid).toBe(false);
  });
});

// ============================================================================
// updateCartItem Tests
// ============================================================================

describe('updateCartItem', () => {
  it('should update item quantity and recalculate subtotal', () => {
    const item = createMockCartItem({ quantity: 1, subtotal: 10_000, unitPrice: 10_000 });
    const updated = updateCartItem(item, { quantity: 5 });

    expect(updated.quantity).toBe(5);
    expect(updated.subtotal).toBe(50_000);
  });

  it('should update item name', () => {
    const item = createMockCartItem({ name: 'VEKA-001' });
    const updated = updateCartItem(item, { name: 'Mi Ventana Personalizada' });

    expect(updated.name).toBe('Mi Ventana Personalizada');
  });

  it('should update multiple fields at once', () => {
    const item = createMockCartItem({
      name: 'VEKA-001',
      quantity: 1,
      subtotal: 10_000,
      unitPrice: 10_000,
    });

    const updated = updateCartItem(item, {
      name: 'Nueva Ventana',
      quantity: 3,
    });

    expect(updated.name).toBe('Nueva Ventana');
    expect(updated.quantity).toBe(3);
    expect(updated.subtotal).toBe(30_000);
  });

  it('should not mutate original item', () => {
    const item = createMockCartItem({ quantity: 1, subtotal: 10_000, unitPrice: 10_000 });
    const original = { ...item };

    updateCartItem(item, { quantity: 5 });

    expect(item).toEqual(original);
  });

  it('should preserve unchanged fields', () => {
    const item = createMockCartItem({
      dimensions: { heightMm: 150, widthMm: 200 },
      glassTypeId: 'glass-1',
      id: 'item-123',
      modelId: 'model-456',
    });

    const updated = updateCartItem(item, { quantity: 5 });

    expect(updated.id).toBe('item-123');
    expect(updated.modelId).toBe('model-456');
    expect(updated.glassTypeId).toBe('glass-1');
    expect(updated.dimensions).toEqual({ heightMm: 150, widthMm: 200 });
  });

  it('should handle empty updates object', () => {
    const item = createMockCartItem({ quantity: 1, subtotal: 10_000 });
    const updated = updateCartItem(item, {});

    expect(updated).toEqual(item);
    expect(updated).not.toBe(item); // Should return new object
  });
});
