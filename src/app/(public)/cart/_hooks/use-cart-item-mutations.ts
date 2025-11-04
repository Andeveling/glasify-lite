"use client";

/**
 * Cart Item Mutations Hook
 *
 * Provides mutation-like interface for cart item operations in sessionStorage.
 * Uses client-side cart + tRPC for price recalculation.
 */

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { TOAST_MESSAGES } from "../_constants/cart-item.constants";
import type { CartItemEditInput } from "../_schemas/cart-item-edit.schema";
import { useCart } from "./use-cart";

/**
 * Hook for cart item mutations
 *
 * Features:
 * - Update item in sessionStorage (client-side)
 * - Recalculate price via tRPC
 * - Update glass type name if changed
 * - Spanish toast notifications
 * - Error handling
 *
 * @returns Mutation functions and state
 *
 * @example
 * ```tsx
 * function CartItem({ item }) {
 *   const { updateItem } = useCartItemMutations();
 *
 *   const handleEdit = (data: CartItemEditInput, newGlassTypeName?: string) => {
 *     updateItem.mutate({ data, newGlassTypeName }, {
 *       onSuccess: () => {
 *         console.log('Item updated');
 *       }
 *     });
 *   };
 * }
 * ```
 */
export function useCartItemMutations() {
	const cart = useCart();
	const [isPending, setIsPending] = useState(false);

	const calculatePriceMutation = api.quote["calculate-item"].useMutation();

	/**
	 * Update cart item (mimics useMutation API for compatibility)
	 */
	const updateItem = {
		mutate: async (
			params: {
				data: CartItemEditInput;
				newGlassTypeName?: string;
			},
			options?: {
				onSuccess?: () => void;
				onError?: (error: Error) => void;
			},
		) => {
			setIsPending(true);

			const { data: input, newGlassTypeName } = params;

			try {
				// Get current item from cart
				const currentItem = cart.getItemById(input.itemId);
				if (!currentItem) {
					throw new Error(`Item ${input.itemId} no encontrado en el carrito`);
				}

				// Step 1: Recalculate price if dimensions or glass type changed
				const needsRecalculation =
					input.widthMm !== currentItem.widthMm ||
					input.heightMm !== currentItem.heightMm ||
					input.glassTypeId !== currentItem.glassTypeId;

				let newUnitPrice = currentItem.unitPrice;
				let newSubtotal = currentItem.subtotal;

				if (needsRecalculation) {
					const priceResult = await calculatePriceMutation.mutateAsync({
						modelId: currentItem.modelId,
						widthMm: input.widthMm,
						heightMm: input.heightMm,
						glassTypeId: input.glassTypeId,
						quantity: input.quantity,
						unit: "unit" as const,
						services: [], // No services in cart items (added at quote generation)
						adjustments: [], // No adjustments in cart items
						colorSurchargePercentage: 0, // TODO: Add color support
					});

					newUnitPrice = priceResult.subtotal;
					newSubtotal = priceResult.subtotal * input.quantity;
				} else if (input.quantity !== currentItem.quantity) {
					// Only quantity changed
					newSubtotal = currentItem.unitPrice * input.quantity;
				}

				// Step 2: Update item in sessionStorage using replaceItem
				cart.replaceItem(input.itemId, {
					...currentItem,
					widthMm: input.widthMm,
					heightMm: input.heightMm,
					glassTypeId: input.glassTypeId,
					glassTypeName: newGlassTypeName ?? currentItem.glassTypeName,
					name: input.name ?? currentItem.name,
					quantity: input.quantity,
					unitPrice: newUnitPrice,
					subtotal: newSubtotal,
					dimensions: {
						widthMm: input.widthMm,
						heightMm: input.heightMm,
					},
				});

				// Show success toast
				toast.success(TOAST_MESSAGES.UPDATE_SUCCESS);

				// Call success callback
				if (options?.onSuccess) {
					options.onSuccess();
				}
			} catch (error) {
				// Show error toast
				const errorMessage =
					error instanceof Error ? error.message : TOAST_MESSAGES.UPDATE_ERROR;
				toast.error(errorMessage);

				// Call error callback
				if (options?.onError && error instanceof Error) {
					options.onError(error);
				}
			} finally {
				setIsPending(false);
			}
		},
		isPending,
	};

	return {
		updateItem,
	};
}
