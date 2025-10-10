/**
 * Unit Tests: useCart Hook
 *
 * Tests cart state management, add/update/remove operations.
 * Follows TDD approach - tests written before implementation.
 *
 * @module tests/unit/hooks/use-cart
 */
/** biome-ignore-all lint/style/noNonNullAssertion: <explanation> */

import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { useCart } from '../../../src/app/(public)/cart/_hooks/use-cart';
import type { CartItem } from '../../../src/types/cart.types';

// ============================================================================
// Mocks
// ============================================================================

// Mock use-cart-storage hook
vi.mock('../../../src/app/(public)/cart/_hooks/use-cart-storage', () => ({
  useCartStorage: vi.fn(() => ({
    clearStorage: vi.fn(),
    hydrated: true,
    items: [],
    saveToStorage: vi.fn(),
  })),
}));

// Mock generate-item-name utility
vi.mock('../../../src/lib/utils/generate-item-name', () => ({
  generateItemName: vi.fn((modelName: string) => `${modelName.split(' ')[0].toUpperCase()}-001`),
  isNameUnique: vi.fn(() => true),
}));

// Mock logger
vi.mock('../../../src/lib/logger', () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

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

const createMockItemInput = (overrides = {}) => ({
  additionalServiceIds: [],
  glassTypeId: 'glass-1',
  glassTypeName: 'Templado',
  heightMm: 100,
  modelId: 'model-1',
  modelName: 'VEKA Premium',
  quantity: 1,
  unitPrice: 10_000,
  widthMm: 100,
  ...overrides,
});

// ============================================================================
// Hook Tests
// ============================================================================

describe('useCart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // Initialization Tests
  // ==========================================================================

  describe('initialization', () => {
    it('should initialize with empty cart', () => {
      const { result } = renderHook(() => useCart());

      expect(result.current.items).toEqual([]);
      expect(result.current.summary.isEmpty).toBe(true);
      expect(result.current.summary.total).toBe(0);
      expect(result.current.summary.itemCount).toBe(0);
    });

    it('should show not hydrated initially', () => {
      const { result } = renderHook(() => useCart());
      expect(result.current.hydrated).toBe(true);
    });

    it('should load items from storage on mount', async () => {
      const mockItems = [createMockCartItem()];
      const useCartStorage = await import('../../../src/app/(public)/cart/_hooks/use-cart-storage');
      (useCartStorage.useCartStorage as Mock).mockReturnValue({
        clearStorage: vi.fn(),
        hydrated: true,
        items: mockItems,
        saveToStorage: vi.fn(),
      });

      const { result } = renderHook(() => useCart());

      await waitFor(() => {
        expect(result.current.items).toEqual(mockItems);
        expect(result.current.summary.isEmpty).toBe(false);
      });
    });
  });

  // ==========================================================================
  // addItem Tests
  // ==========================================================================

  describe('addItem', () => {
    it('should add item to empty cart', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(createMockItemInput());
      });

      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]?.name).toBe('VEKA-001');
    });

    it('should generate unique ID for new item', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(createMockItemInput());
      });

      expect(result.current.items[0]?.id).toBeDefined();
      expect(typeof result.current.items[0]?.id).toBe('string');
    });

    it('should auto-generate item name from model', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(createMockItemInput({ modelName: 'Guardian Premium' }));
      });

      expect(result.current.items[0]?.name).toBe('GUARDIAN-001');
    });

    it('should add multiple items with sequential names', () => {
      const { result } = renderHook(() => useCart());
      const generateItemName = vi.fn().mockReturnValueOnce('VEKA-001').mockReturnValueOnce('VEKA-002');

      vi.doMock('@/lib/utils/generate-item-name', () => ({
        generateItemName,
        isNameUnique: vi.fn(() => true),
      }));

      act(() => {
        result.current.addItem(createMockItemInput());
        result.current.addItem(createMockItemInput());
      });

      expect(result.current.items).toHaveLength(2);
    });

    it('should update cart summary after adding item', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(createMockItemInput({ quantity: 2, unitPrice: 15_000 }));
      });

      expect(result.current.summary.isEmpty).toBe(false);
      expect(result.current.summary.itemCount).toBe(2);
      expect(result.current.summary.total).toBe(30_000);
    });

    it('should reject item when cart is at limit', () => {
      const { result } = renderHook(() => useCart());

      // Add 20 items (max limit)
      act(() => {
        for (let i = 0; i < 20; i++) {
          result.current.addItem(createMockItemInput());
        }
      });

      // Try to add 21st item
      expect(() => {
        act(() => {
          result.current.addItem(createMockItemInput());
        });
      }).toThrow(/no puedes agregar más/i);
    });

    it('should save to storage after adding item', async () => {
      const mockSave = vi.fn();
      const useCartStorage = await import('../../../src/app/(public)/cart/_hooks/use-cart-storage');
      (useCartStorage.useCartStorage as Mock).mockReturnValue({
        clearStorage: vi.fn(),
        hydrated: true,
        items: [],
        saveToStorage: mockSave,
      });

      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(createMockItemInput());
      });

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalled();
      });
    });
  });

  // ==========================================================================
  // updateItem Tests
  // ==========================================================================

  describe('updateItem', () => {
    it('should update item quantity', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(createMockItemInput({ unitPrice: 10_000 }));
      });

      const itemId = result.current.items[0]?.id;

      act(() => {
        result.current.updateItem(itemId!, { quantity: 5 });
      });

      expect(result.current.items[0]?.quantity).toBe(5);
      expect(result.current.items[0]?.subtotal).toBe(50_000);
    });

    it('should update item name', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(createMockItemInput());
      });

      const itemId = result.current.items[0]?.id;

      act(() => {
        result.current.updateItem(itemId!, { name: 'Mi Ventana Personalizada' });
      });

      expect(result.current.items[0]?.name).toBe('Mi Ventana Personalizada');
    });

    it('should update multiple fields at once', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(createMockItemInput({ unitPrice: 10_000 }));
      });

      const itemId = result.current.items[0]?.id;

      act(() => {
        result.current.updateItem(itemId!, {
          name: 'Nueva Ventana',
          quantity: 3,
          selectedServiceIds: ['service-1'],
        });
      });

      expect(result.current.items[0]?.name).toBe('Nueva Ventana');
      expect(result.current.items[0]?.quantity).toBe(3);
      expect(result.current.items[0]?.selectedServiceIds).toEqual(['service-1']);
    });

    it('should throw error for non-existent item', () => {
      const { result } = renderHook(() => useCart());

      expect(() => {
        act(() => {
          result.current.updateItem('non-existent-id', { quantity: 5 });
        });
      }).toThrow(/no encontrado/i);
    });

    it('should update cart summary after update', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(createMockItemInput({ quantity: 1, unitPrice: 10_000 }));
      });

      const itemId = result.current.items[0]?.id;

      act(() => {
        result.current.updateItem(itemId!, { quantity: 5 });
      });

      expect(result.current.summary.itemCount).toBe(5);
      expect(result.current.summary.total).toBe(50_000);
    });

    it('should save to storage after update', async () => {
      const mockSave = vi.fn();
      const useCartStorage = await import('../../../src/app/(public)/cart/_hooks/use-cart-storage');
      (useCartStorage.useCartStorage as Mock).mockReturnValue({
        clearStorage: vi.fn(),
        hydrated: true,
        items: [],
        saveToStorage: mockSave,
      });

      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(createMockItemInput());
      });

      const itemId = result.current.items[0]?.id;

      act(() => {
        result.current.updateItem(itemId!, { quantity: 5 });
      });

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledTimes(2); // Once for add, once for update
      });
    });
  });

  // ==========================================================================
  // removeItem Tests
  // ==========================================================================

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(createMockItemInput());
      });

      expect(result.current.items).toHaveLength(1);
      const itemId = result.current.items[0]?.id;

      act(() => {
        result.current.removeItem(itemId!);
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should update cart summary after removal', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(createMockItemInput({ quantity: 2, unitPrice: 10_000 }));
      });

      const itemId = result.current.items[0]?.id;

      act(() => {
        result.current.removeItem(itemId!);
      });

      expect(result.current.summary.isEmpty).toBe(true);
      expect(result.current.summary.itemCount).toBe(0);
      expect(result.current.summary.total).toBe(0);
    });

    it('should throw error for non-existent item', () => {
      const { result } = renderHook(() => useCart());

      expect(() => {
        act(() => {
          result.current.removeItem('non-existent-id');
        });
      }).toThrow(/no encontrado/i);
    });

    it('should save to storage after removal', async () => {
      const mockSave = vi.fn();
      const useCartStorage = await import('../../../src/app/(public)/cart/_hooks/use-cart-storage');
      (useCartStorage.useCartStorage as Mock).mockReturnValue({
        clearStorage: vi.fn(),
        hydrated: true,
        items: [],
        saveToStorage: mockSave,
      });

      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(createMockItemInput());
      });

      const itemId = result.current.items[0]?.id;

      act(() => {
        result.current.removeItem(itemId!);
      });

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledTimes(2); // Once for add, once for remove
      });
    });
  });

  // ==========================================================================
  // clearCart Tests
  // ==========================================================================

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(createMockItemInput());
        result.current.addItem(createMockItemInput());
        result.current.addItem(createMockItemInput());
      });

      expect(result.current.items).toHaveLength(3);

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.items).toHaveLength(0);
    });

    it('should reset cart summary', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(createMockItemInput({ quantity: 5, unitPrice: 10_000 }));
      });

      act(() => {
        result.current.clearCart();
      });

      expect(result.current.summary.isEmpty).toBe(true);
      expect(result.current.summary.itemCount).toBe(0);
      expect(result.current.summary.total).toBe(0);
    });

    it('should clear storage', async () => {
      const mockClear = vi.fn();
      const useCartStorage = await import('../../../src/app/(public)/cart/_hooks/use-cart-storage');
      (useCartStorage.useCartStorage as Mock).mockReturnValue({
        clearStorage: mockClear,
        hydrated: true,
        items: [],
        saveToStorage: vi.fn(),
      });

      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.clearCart();
      });

      await waitFor(() => {
        expect(mockClear).toHaveBeenCalled();
      });
    });
  });

  // ==========================================================================
  // getItemById Tests
  // ==========================================================================

  describe('getItemById', () => {
    it('should return item by ID', () => {
      const { result } = renderHook(() => useCart());

      act(() => {
        result.current.addItem(createMockItemInput());
      });

      const itemId = result.current.items[0]?.id;
      const item = result.current.getItemById(itemId!);

      expect(item).toBeDefined();
      expect(item?.id).toBe(itemId);
    });

    it('should return undefined for non-existent item', () => {
      const { result } = renderHook(() => useCart());

      const item = result.current.getItemById('non-existent-id');
      expect(item).toBeUndefined();
    });
  });
});
