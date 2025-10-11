/**
 * useCart Hook
 *
 * Manages cart state with sessionStorage persistence.
 * Provides methods to add, update, remove items with auto-generated names.
 *
 * @module app/(public)/cart/_hooks/use-cart
 */

'use client';

import { createId } from '@paralleldrive/cuid2';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  calculateItemSubtotal,
  findCartItem,
  generateCartSummary,
  removeCartItem,
  updateCartItem,
  validateCartLimit,
} from '@/lib/utils/cart.utils';
import { generateItemName } from '@/lib/utils/generate-item-name';
import { useTenantConfig } from '@/providers/tenant-config-provider';
import type { CartItem, CartSummary, CreateCartItemInput, UpdateCartItemInput } from '@/types/cart.types';
import { useCartStorage } from './use-cart-storage';

// ============================================================================
// Types
// ============================================================================

type UseCartReturn = {
  /** All cart items */
  items: CartItem[];

  /** Cart summary with totals */
  summary: CartSummary;

  /** Whether storage is hydrated */
  hydrated: boolean;

  /** Add new item to cart */
  addItem: (input: CreateCartItemInput & { unitPrice: number }) => void;

  /** Update existing item */
  updateItem: (id: string, updates: Omit<UpdateCartItemInput, 'id'>) => void;

  /** Remove item from cart */
  removeItem: (id: string) => void;

  /** Restore a previously removed item */
  restoreItem: (item: CartItem) => void;

  /** Clear all items */
  clearCart: () => void;

  /** Get item by ID */
  getItemById: (id: string) => CartItem | undefined;
};

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Cart state management hook
 *
 * Provides complete cart functionality with persistence
 *
 * @example
 * ```tsx
 * function ProductForm() {
 *   const { addItem, items, summary } = useCart();
 *
 *   const handleAddToCart = () => {
 *     addItem({
 *       modelId: 'model-1',
 *       modelName: 'VEKA Premium',
 *       glassTypeId: 'glass-1',
 *       glassTypeName: 'Templado',
 *       widthMm: 1000,
 *       heightMm: 1500,
 *       quantity: 2,
 *       unitPrice: 50000,
 *       additionalServiceIds: ['service-1'],
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleAddToCart}>Add to Cart</button>
 *       <CartBadge count={summary.itemCount} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useCart(): UseCartReturn {
  const { items: storedItems, saveItems, clearItems, isHydrated } = useCartStorage();
  const { currency } = useTenantConfig();
  const [items, setItems] = useState<CartItem[]>([]);

  // Sync with storage on hydration
  useEffect(() => {
    if (isHydrated) {
      setItems(storedItems);
    }
  }, [isHydrated, storedItems]);

  /**
   * Add item to cart with auto-generated name
   */
  const addItem = useCallback(
    (input: CreateCartItemInput & { unitPrice: number }) => {
      // Validate cart limit
      const limitValidation = validateCartLimit(items.length);
      if (!limitValidation.valid) {
        const error = new Error(limitValidation.error);
        throw error;
      }

      // Generate unique ID
      const itemId = createId();

      // Generate unique name
      const itemName = generateItemName(input.modelName, items);

      // Calculate subtotal
      const quantity = input.quantity ?? 1;
      const subtotal = calculateItemSubtotal(input.unitPrice, quantity);

      // Create new cart item
      const newItem: CartItem = {
        additionalServiceIds: input.additionalServiceIds ?? [],
        createdAt: new Date().toISOString(),
        dimensions: {
          heightMm: input.heightMm,
          widthMm: input.widthMm,
        },
        glassTypeId: input.glassTypeId,
        glassTypeName: input.glassTypeName,
        heightMm: input.heightMm,
        id: itemId,
        modelId: input.modelId,
        modelName: input.modelName,
        name: itemName,
        quantity,
        solutionId: input.solutionId,
        solutionName: input.solutionName,
        subtotal,
        unitPrice: input.unitPrice,
        widthMm: input.widthMm,
      };

      // Update state
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      saveItems(updatedItems);
    },
    [items, saveItems]
  );

  /**
   * Update existing cart item
   */
  const updateItem = useCallback(
    (id: string, updates: Omit<UpdateCartItemInput, 'id'>) => {
      const item = findCartItem(items, id);

      if (!item) {
        const error = new Error(`Item ${id} no encontrado en el carrito`);
        throw error;
      }

      // Apply updates
      const updatedItem = updateCartItem(item, updates);

      // Update items array
      const updatedItems = items.map((i) => (i.id === id ? updatedItem : i));
      setItems(updatedItems);
      saveItems(updatedItems);
    },
    [items, saveItems]
  );

  /**
   * Remove item from cart
   */
  const removeItem = useCallback(
    (id: string) => {
      const item = findCartItem(items, id);

      if (!item) {
        const error = new Error(`Item ${id} no encontrado en el carrito`);
        throw error;
      }

      const updatedItems = removeCartItem(items, id);
      setItems(updatedItems);
      saveItems(updatedItems);
    },
    [items, saveItems]
  );

  /**
   * Restore a previously removed item
   * Used for undo functionality after deletion
   */
  const restoreItem = useCallback(
    (item: CartItem) => {
      // Check if item already exists
      const existingItem = findCartItem(items, item.id);
      if (existingItem) {
        // Item already in cart, just update it
        const updatedItem = updateCartItem(existingItem, item);
        const updatedItems = items.map((i) => (i.id === item.id ? updatedItem : i));
        setItems(updatedItems);
        saveItems(updatedItems);
        return;
      }

      // Validate cart limit
      const limitValidation = validateCartLimit(items.length);
      if (!limitValidation.valid) {
        const error = new Error(limitValidation.error);
        throw error;
      }

      // Add item back to cart at the end
      const updatedItems = [...items, item];
      setItems(updatedItems);
      saveItems(updatedItems);
    },
    [items, saveItems]
  );

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(() => {
    setItems([]);
    clearItems();
  }, [clearItems]);

  /**
   * Get item by ID
   */
  const getItemById = useCallback((id: string): CartItem | undefined => findCartItem(items, id), [items]);

  /**
   * Cart summary (memoized)
   * Uses tenant currency from config (single source of truth)
   */
  const summary = useMemo((): CartSummary => generateCartSummary(items, currency), [items, currency]);

  return {
    addItem,
    clearCart,
    getItemById,
    hydrated: isHydrated,
    items,
    removeItem,
    restoreItem,
    summary,
    updateItem,
  };
}
