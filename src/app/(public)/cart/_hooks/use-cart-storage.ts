/**
 * Cart Storage Hook
 *
 * Manages cart data persistence in sessionStorage with hydration support.
 * Handles serialization, deserialization, and storage events.
 *
 * @module app/(public)/cart/_hooks/use-cart-storage
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import logger from '@/lib/logger';
import type { CartItem, CartStorageData } from '@/types/cart.types';
import { CART_CONSTANTS } from '@/types/cart.types';

// ============================================================================
// Constants
// ============================================================================

const STORAGE_VERSION = 1;

// ============================================================================
// Storage Operations
// ============================================================================

/**
 * Load cart items from sessionStorage
 *
 * Handles deserialization and validation
 *
 * @returns Cart items or empty array if storage is empty/invalid
 */
export function loadCartFromStorage(): CartItem[] {
  // Client-side only
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawData = sessionStorage.getItem(CART_CONSTANTS.STORAGE_KEY);

    if (!rawData) {
      return [];
    }

    const storageData: CartStorageData = JSON.parse(rawData) as CartStorageData;

    // Version check (for future migrations)
    if (storageData.version !== STORAGE_VERSION) {
      logger.warn('Cart storage version mismatch', {
        current: storageData.version,
        expected: STORAGE_VERSION,
      });
      // Clear outdated storage
      clearCartStorage();
      return [];
    }

    // Validate items array
    if (!Array.isArray(storageData.items)) {
      logger.error('Invalid cart items in storage');
      clearCartStorage();
      return [];
    }

    return storageData.items;
  } catch (error) {
    logger.error('Failed to load cart from storage', { error });
    // Clear corrupted storage
    clearCartStorage();
    return [];
  }
}

/**
 * Save cart items to sessionStorage
 *
 * Handles serialization and error recovery
 * Emits custom event for cross-component synchronization
 *
 * @param items - Cart items to save
 * @returns True if save succeeded, false otherwise
 */
export function saveCartToStorage(items: CartItem[]): boolean {
  // Client-side only
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const storageData: CartStorageData = {
      items,
      lastModified: new Date().toISOString(),
      version: STORAGE_VERSION,
    };

    const serialized = JSON.stringify(storageData);
    sessionStorage.setItem(CART_CONSTANTS.STORAGE_KEY, serialized);

    // Emit custom event to notify all useCartStorage hooks about the change
    window.dispatchEvent(
      new CustomEvent('cart-updated', {
        detail: { items },
      })
    );

    return true;
  } catch (error) {
    logger.error('Failed to save cart to storage', { error });

    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      logger.error('sessionStorage quota exceeded', { itemCount: items.length });
    }

    return false;
  }
}

/**
 * Clear cart from sessionStorage
 */
export function clearCartStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(CART_CONSTANTS.STORAGE_KEY);

    // Emit event to notify all hooks about cart clear
    window.dispatchEvent(
      new CustomEvent('cart-updated', {
        detail: { items: [] },
      })
    );
  } catch (error) {
    logger.error('Failed to clear cart storage', { error });
  }
}

// ============================================================================
// React Hook
// ============================================================================

/**
 * Cart storage hook with hydration and persistence
 *
 * Provides reactive access to sessionStorage with automatic sync
 *
 * @returns Cart storage operations
 *
 * @example
 * ```tsx
 * function Cart() {
 *   const { items, saveItems, clearItems, isHydrated } = useCartStorage();
 *
 *   if (!isHydrated) {
 *     return <CartSkeleton />;
 *   }
 *
 *   return <CartList items={items} onUpdate={saveItems} />;
 * }
 * ```
 */
export function useCartStorage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    const loadedItems = loadCartFromStorage();
    setItems(loadedItems);
    setIsHydrated(true);

    logger.info('Cart hydrated from storage', { itemCount: loadedItems.length });

    // Listen for cart updates from other components
    const handleCartUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ items: CartItem[] }>;
      setItems(customEvent.detail.items);
      logger.info('Cart updated via event', { itemCount: customEvent.detail.items.length });
    };

    window.addEventListener('cart-updated', handleCartUpdate);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);

  /**
   * Save items to storage and update state
   */
  const saveItems = useCallback((newItems: CartItem[]) => {
    const success = saveCartToStorage(newItems);

    if (success) {
      setItems(newItems);
      logger.info('Cart saved to storage', { itemCount: newItems.length });
    } else {
      logger.error('Failed to save cart items');
    }

    return success;
  }, []);

  /**
   * Clear all items from storage and state
   */
  const clearItems = useCallback(() => {
    clearCartStorage();
    setItems([]);
    logger.info('Cart cleared from storage');
  }, []);

  /**
   * Get current storage size (for debugging/monitoring)
   */
  const getStorageSize = useCallback((): number => {
    if (typeof window === 'undefined') {
      return 0;
    }

    try {
      const rawData = sessionStorage.getItem(CART_CONSTANTS.STORAGE_KEY);
      return rawData ? new Blob([rawData]).size : 0;
    } catch {
      return 0;
    }
  }, []);

  return {
    clearItems,
    getStorageSize,
    isHydrated,
    items,
    saveItems,
  };
}

// ============================================================================
// Storage Event Listener (for multi-tab sync)
// ============================================================================

/**
 * Listen for cart storage changes across tabs
 *
 * Note: sessionStorage doesn't fire storage events like localStorage,
 * so this is a no-op placeholder for future cross-tab sync implementation
 *
 * @param _callback - Function to call when storage changes (unused)
 * @returns Cleanup function
 */
export function useCartStorageListener(_callback: (items: CartItem[]) => void) {
  useEffect(() => {
    // sessionStorage is tab-specific, no cross-tab sync needed
    // This is intentionally empty but kept for API consistency
    // If we switch to localStorage in the future, implement here

    return () => {
      // Cleanup (currently no-op)
    };
  }, []);
}
