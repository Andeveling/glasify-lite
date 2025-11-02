/**
 * Cart Operations Hook
 * Handles cart mutations with toast notifications
 */

import { useCallback } from "react";
import { toast } from "sonner";
import { useCart } from "@/app/(public)/cart/_hooks/use-cart";
import type { CartItemInputWithPrice } from "../_utils/cart-item-mapper";

type UseCartOperationsReturn = {
	addToCart: (item: CartItemInputWithPrice, modelName: string) => boolean;
};

/**
 * Handle cart operations with user feedback
 *
 * @returns Cart operation handlers
 *
 * @example
 * const { addToCart } = useCartOperations();
 *
 * const success = addToCart(cartItem, "Ventana Corrediza");
 * if (success) {
 *   // Handle success state
 * }
 */
export function useCartOperations(): UseCartOperationsReturn {
	const { addItem } = useCart();

	const addToCart = useCallback(
		(item: CartItemInputWithPrice, modelName: string): boolean => {
			try {
				addItem(item);

				toast.success("Item agregado al carrito", {
					description: `${modelName} ha sido agregado exitosamente`,
				});

				return true;
			} catch (err) {
				const errorMessage =
					err instanceof Error && err.message.includes("no puedes agregar más")
						? "Has alcanzado el límite de 20 items en el carrito"
						: "No se pudo agregar el item al carrito";

				toast.error("Error al agregar", {
					description: errorMessage,
				});

				return false;
			}
		},
		[addItem],
	);

	return {
		addToCart,
	};
}
