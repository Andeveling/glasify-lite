/**
 * useCartItemActions Hook
 *
 * Manages cart item actions with optimistic updates and user feedback.
 * Separates action orchestration from UI concerns (SOLID - SRP).
 *
 * Features:
 * - Optimistic UI updates for instant feedback
 * - Toast notifications for success confirmation
 * - Clear, simple action flow
 *
 * @module app/(public)/cart/_hooks/use-cart-item-actions
 */

"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import type { CartItem } from "@/types/cart.types";

// ============================================================================
// Types
// ============================================================================

type UseCartItemActionsParams = {
	/** Callback to update item in storage */
	onUpdateItem: (itemId: string, updates: Partial<CartItem>) => void;

	/** Callback to remove item from storage */
	onRemoveItem: (itemId: string) => void;
};

type UseCartItemActionsReturn = {
	/** Update item name with validation */
	updateName: (item: CartItem, newName: string) => void;

	/** Update item quantity with validation */
	updateQuantity: (item: CartItem, newQuantity: number) => void;

	/** Remove item (to be called after confirmation) */
	removeItem: (item: CartItem) => void;
};

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Hook for managing cart item actions with optimistic updates
 *
 * Note: Item removal requires external confirmation dialog.
 * This hook only handles the actual removal after user confirms.
 *
 * @example
 * ```tsx
 * function CartPageContent() {
 *   const { updateItem, removeItem } = useCart();
 *   const actions = useCartItemActions({
 *     onUpdateItem: updateItem,
 *     onRemoveItem: removeItem,
 *   });
 *
 *   return (
 *     <CartItem
 *       item={item}
 *       onUpdateName={(id, name) => actions.updateName(item, name)}
 *       onRemove={() => actions.removeItem(item)} // Called after dialog confirmation
 *     />
 *   );
 * }
 * ```
 */
export function useCartItemActions({
	onUpdateItem,
	onRemoveItem,
}: UseCartItemActionsParams): UseCartItemActionsReturn {
	/**
	 * Update item name
	 */
	const updateName = useCallback(
		(item: CartItem, newName: string) => {
			const trimmedName = newName.trim();

			if (trimmedName === item.name) {
				return; // No change
			}

			// Optimistic update
			onUpdateItem(item.id, { name: trimmedName });

			// Success toast
			toast.success("Nombre actualizado", {
				description: `"${item.name}" → "${trimmedName}"`,
				duration: 2000,
			});
		},
		[onUpdateItem],
	);

	/**
	 * Update item quantity
	 */
	const updateQuantity = useCallback(
		(item: CartItem, newQuantity: number) => {
			if (newQuantity === item.quantity) {
				return; // No change
			}

			// Optimistic update
			onUpdateItem(item.id, { quantity: newQuantity });

			// Success toast
			toast.success("Cantidad actualizada", {
				description: `${item.name}: ${item.quantity} → ${newQuantity}`,
				duration: 2000,
			});
		},
		[onUpdateItem],
	);

	/**
	 * Remove item from cart
	 *
	 * This should only be called AFTER user confirmation via AlertDialog.
	 * The confirmation dialog is handled at the component level.
	 */
	const removeItem = useCallback(
		(item: CartItem) => {
			// Remove from storage
			onRemoveItem(item.id);

			// Success toast
			toast.success("Artículo eliminado", {
				description: `"${item.name}" eliminado del carrito`,
				duration: 2000,
			});
		},
		[onRemoveItem],
	);

	return {
		removeItem,
		updateName,
		updateQuantity,
	};
}
