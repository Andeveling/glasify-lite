/**
 * useCartPriceSync Hook
 *
 * Handles real-time price recalculation when cart item quantities change.
 * Uses the quote.calculate-item tRPC procedure to get updated prices.
 *
 * Features:
 * - Automatic price recalculation on quantity changes
 * - Debounced API calls to prevent excessive requests
 * - Loading states during recalculation
 * - Error handling with fallback to cached prices
 *
 * @module app/(public)/cart/_hooks/use-cart-price-sync
 */

'use client';

import { useCallback, useEffect, useRef } from 'react';
import { api } from '@/trpc/react';
import type { CartItem } from '@/types/cart.types';

// ============================================================================
// Types
// ============================================================================

type PriceRecalculationResult = {
  itemId: string;
  newUnitPrice: number;
  newSubtotal: number;
  priceChanged: boolean;
};

type UseCartPriceSyncOptions = {
  /** Items to sync prices for */
  items: CartItem[];

  /** Callback when price is recalculated */
  onPriceUpdate?: (result: PriceRecalculationResult) => void;

  /** Debounce delay in milliseconds (default: 500) */
  debounceMs?: number;

  /** Whether to enable auto-sync (default: true) */
  enabled?: boolean;
};

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Cart price synchronization hook
 *
 * Recalculates prices when quantities change
 *
 * @example
 * ```tsx
 * function Cart() {
 *   const { items, updateItem } = useCart();
 *   const { syncPrices, isSyncing } = useCartPriceSync({
 *     items,
 *     onPriceUpdate: (result) => {
 *       if (result.priceChanged) {
 *         updateItem(result.itemId, {
 *           quantity: items.find(i => i.id === result.itemId)?.quantity,
 *         });
 *       }
 *     },
 *   });
 *
 *   return <div>{isSyncing ? 'Updating prices...' : 'Prices current'}</div>;
 * }
 * ```
 */
export function useCartPriceSync({ items, onPriceUpdate, debounceMs = 500, enabled = true }: UseCartPriceSyncOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousQuantitiesRef = useRef<Map<string, number>>(new Map());

  // tRPC mutation for price calculation using quote.calculate-item
  const calculatePriceMutation = api.quote[ 'calculate-item' ].useMutation();

  // Track items in a ref to avoid dependency issues
  const itemsRef = useRef(items);
  itemsRef.current = items;

  /**
   * Recalculate price for a single item
   */
  const recalculateItemPrice = useCallback(
    async (item: CartItem): Promise<PriceRecalculationResult> => {
      try {
        // Call quote.calculate-item tRPC procedure
        const priceResult = await calculatePriceMutation.mutateAsync({
          adjustments: [], // No adjustments for cart items
          glassTypeId: item.glassTypeId,
          heightMm: item.heightMm,
          modelId: item.modelId,
          services: item.additionalServiceIds.map((serviceId) => ({
            quantity: item.quantity, // Apply service to entire quantity
            serviceId,
          })),
          widthMm: item.widthMm,
        });

        const newUnitPrice = priceResult.subtotal;
        const newSubtotal = newUnitPrice * item.quantity;
        const priceChanged = newUnitPrice !== item.unitPrice;

        return {
          itemId: item.id,
          newSubtotal,
          newUnitPrice,
          priceChanged,
        };
      } catch {
        // Fallback: use cached price, just recalculate subtotal
        return {
          itemId: item.id,
          newSubtotal: item.unitPrice * item.quantity,
          newUnitPrice: item.unitPrice,
          priceChanged: false,
        };
      }
    },
    [ calculatePriceMutation ]
  );

  /**
   * Sync prices for all items (debounced)
   */
  const syncPrices = useCallback(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce price sync
    timeoutRef.current = setTimeout(() => {
      for (const item of itemsRef.current) {
        const previousQuantity = previousQuantitiesRef.current.get(item.id);

        // Only recalculate if quantity changed
        if (previousQuantity !== undefined && previousQuantity !== item.quantity) {
          recalculateItemPrice(item).then((result) => {
            if (onPriceUpdate) {
              onPriceUpdate(result);
            }
          });
        }

        // Update tracked quantity
        previousQuantitiesRef.current.set(item.id, item.quantity);
      }
    }, debounceMs);
  }, [ enabled, debounceMs, recalculateItemPrice, onPriceUpdate ]);

  /**
   * Auto-sync on items change
   */
  useEffect(() => {
    if (enabled) {
      syncPrices();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [ enabled, syncPrices ]); // Only depend on enabled and syncPrices, use ref for items

  /**
   * Initialize quantity tracking on mount and when items change
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const currentItemIds = new Set(itemsRef.current.map((item) => item.id));
    const trackedIds = Array.from(previousQuantitiesRef.current.keys());

    // Add new items to tracking
    for (const item of itemsRef.current) {
      if (!previousQuantitiesRef.current.has(item.id)) {
        previousQuantitiesRef.current.set(item.id, item.quantity);
      }
    }

    // Remove tracking for items no longer in the cart
    for (const trackedId of trackedIds) {
      if (!currentItemIds.has(trackedId)) {
        previousQuantitiesRef.current.delete(trackedId);
      }
    }
  }, [ items ]); // items dependency needed to detect cart changes for tracking

  return {
    isSyncing: calculatePriceMutation.isPending,
    syncPrices,
  };
}
