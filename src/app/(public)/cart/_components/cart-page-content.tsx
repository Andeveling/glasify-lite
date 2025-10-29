/**
 * CartPageContent Component
 *
 * Client component that handles all cart interactions.
 * Manages cart state, item operations, and navigation.
 *
 * @module app/(public)/cart/_components/cart-page-content
 */

"use client";

import { Suspense, useId } from "react";
import { useCart } from "../_hooks/use-cart";
import { useCartItemActions } from "../_hooks/use-cart-item-actions";
import { CartItem } from "./cart-item";
import { CartSummary } from "./cart-summary";
import { EmptyCartState } from "./empty-cart-state";

// ============================================================================
// Constants
// ============================================================================

const SKELETON_ITEMS_COUNT = 3;

// ============================================================================
// Component
// ============================================================================

/**
 * Cart page content with client-side interactivity
 *
 * Handles all cart operations and state management
 */
export function CartPageContent() {
  const { items, summary, updateItem, removeItem, hydrated } = useCart();
  const skeletonId = useId();

  // Initialize cart item actions hook (SOLID - SRP)
  const actions = useCartItemActions({
    onRemoveItem: removeItem,
    onUpdateItem: updateItem,
  });

  // Show loading skeleton while hydrating
  if (!hydrated) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {Array.from({ length: SKELETON_ITEMS_COUNT }).map(() => {
                const id = `${skeletonId}-${crypto.randomUUID()}`;
                return (
                  <div
                    className="h-32 animate-pulse rounded-lg border bg-muted"
                    key={id}
                  />
                );
              })}
            </div>
          </div>
          <div className="h-64 animate-pulse rounded-lg border bg-muted" />
        </div>
      </div>
    );
  }

  // Empty cart state
  if (summary.isEmpty) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 font-bold text-3xl">Carrito de presupuesto</h1>
        <EmptyCartState />
      </div>
    );
  }

  /**
   * Handle name update
   */
  const handleUpdateName = (itemId: string, newName: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      actions.updateName(item, newName);
    }
  };

  /**
   * Handle quantity update
   */
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      actions.updateQuantity(item, newQuantity);
    }
  };

  /**
   * Handle item removal
   * Note: Confirmation is handled by the CartItem component's dialog
   */
  const handleRemoveItem = (itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (item) {
      actions.removeItem(item);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="font-bold text-3xl">Carrito de presupuesto</h1>
        <p className="mt-2 text-muted-foreground">
          Revisa y ajusta tus configuraciones antes de generar una cotización
          formal
        </p>
      </div>

      {/* Main content: Cart items + Summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart items list (2/3 width on desktop) */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => (
              <Suspense
                fallback={
                  <div className="h-32 animate-pulse rounded-lg border bg-muted" />
                }
                key={item.id}
              >
                <CartItem
                  currency={summary.currency}
                  item={item}
                  onRemove={handleRemoveItem}
                  onUpdateName={handleUpdateName}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              </Suspense>
            ))}
          </div>
        </div>

        {/* Cart summary (1/3 width on desktop, sticky) */}
        <div>
          <CartSummary summary={summary} />
        </div>
      </div>
    </div>
  );
}
