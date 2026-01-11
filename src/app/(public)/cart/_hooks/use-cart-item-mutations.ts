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
import type { CartItem } from "@/types/cart.types";
import { TOAST_MESSAGES } from "../_constants/cart-item.constants";
import type { CartItemEditInput } from "../_schemas/cart-item-edit.schema";
import { useCart } from "./use-cart";

// Helper: Build services array for price calculation
function buildServicesForCalculation(currentItem: CartItem) {
  return (
    currentItem.additionalServiceIds?.map((serviceId: string) => ({
      serviceId,
    })) ?? []
  );
}

// Helper: Check if recalculation is needed
function needsRecalculation(input: CartItemEditInput, currentItem: CartItem) {
  return (
    input.widthMm !== currentItem.widthMm ||
    input.heightMm !== currentItem.heightMm ||
    input.glassTypeId !== currentItem.glassTypeId
  );
}

// Helper: Calculate new prices for quantity changes only
function calculatePricesForQuantityChange(
  currentItem: CartItem,
  newQuantity: number
) {
  return {
    unitPrice: currentItem.unitPrice,
    subtotal: currentItem.unitPrice * newQuantity,
  };
}

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
 *         // Handle success
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
   * Recalculate prices if dimensions/glass type changed, or just update quantity
   */
  const recalculateIfNeeded = async (
    input: CartItemEditInput,
    currentItem: CartItem
  ) => {
    // If no dimension or glass type changes, just update quantity
    if (!needsRecalculation(input, currentItem)) {
      if (input.quantity !== currentItem.quantity) {
        return calculatePricesForQuantityChange(currentItem, input.quantity);
      }

      return {
        unitPrice: currentItem.unitPrice,
        subtotal: currentItem.subtotal,
      };
    }

    // Full recalculation needed
    const servicesForCalculation = buildServicesForCalculation(currentItem);

    const priceResult = await calculatePriceMutation.mutateAsync({
      modelId: currentItem.modelId,
      widthMm: input.widthMm,
      heightMm: input.heightMm,
      glassTypeId: input.glassTypeId,
      quantity: input.quantity,
      unit: "unit" as const,
      services: servicesForCalculation,
      adjustments: [],
      colorSurchargePercentage: currentItem.colorSurchargePercentage ?? 0,
    });

    return {
      unitPrice: priceResult.subtotal,
      subtotal: priceResult.subtotal * input.quantity,
    };
  };

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
      }
    ) => {
      setIsPending(true);

      const { data: input, newGlassTypeName } = params;

      try {
        // Get current item from cart
        const currentItem = cart.getItemById(input.itemId);
        if (!currentItem) {
          throw new Error(`Item ${input.itemId} no encontrado en el carrito`);
        }

        const { unitPrice: newUnitPrice, subtotal: newSubtotal } =
          await recalculateIfNeeded(input, currentItem);

        // Update item in sessionStorage using replaceItem
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

        toast.success(TOAST_MESSAGES.UPDATE_SUCCESS);
        options?.onSuccess?.();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : TOAST_MESSAGES.UPDATE_ERROR;
        toast.error(errorMessage);

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
