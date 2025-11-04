/**
 * Cart Item Edit Utilities
 *
 * Pure functions for cart item editing:
 * - Type definitions
 * - Default value extraction
 * - Form data transformation
 * - Type adapters for client/server data compatibility
 */

import type { CartItem } from "@/types/cart.types";
import type { CartItemEditInput } from "../_schemas/cart-item-edit.schema";

/**
 * Cart item with all required relations for editing
 */
export type CartItemWithRelations = {
	id: string;
	widthMm: number;
	heightMm: number;
	glassTypeId: string;
	name: string | null;
	roomLocation: string | null;
	quantity: number;
	subtotal: number; // Current price of the item
	model: {
		id: string;
		name: string;
		imageUrl: string | null;
	};
	glassType: {
		id: string;
		name: string;
		pricePerM2: string;
	};
};

/**
 * Convert client-side CartItem to CartItemWithRelations format
 *
 * @param item - Client-side cart item from sessionStorage
 * @returns Cart item with relations structure for edit modal
 */
export function adaptCartItemToEditFormat(
	item: CartItem,
): CartItemWithRelations {
	return {
		id: item.id,
		widthMm: item.widthMm,
		heightMm: item.heightMm,
		glassTypeId: item.glassTypeId,
		name: item.name,
		roomLocation: null, // Not available in client-side cart
		quantity: item.quantity,
		subtotal: item.subtotal,
		model: {
			id: item.modelId,
			name: item.modelName,
			imageUrl: item.modelImageUrl ?? null,
		},
		glassType: {
			id: item.glassTypeId,
			name: item.glassTypeName,
			pricePerM2: "0", // Price will be recalculated by backend
		},
	};
}

/**
 * Extract default form values from existing cart item
 *
 * @param item - Cart item with relations
 * @returns Form default values matching schema
 */
export function getDefaultCartItemValues(
	item: CartItemWithRelations,
): Omit<CartItemEditInput, "itemId"> {
	return {
		widthMm: item.widthMm,
		heightMm: item.heightMm,
		glassTypeId: item.glassTypeId,
		name: item.name ?? undefined,
		roomLocation: item.roomLocation ?? undefined,
		quantity: item.quantity,
	};
}

/**
 * Transform form data to mutation input
 *
 * @param itemId - Cart item ID
 * @param formData - Form values from React Hook Form
 * @returns Complete mutation input
 */
export function transformEditData(
	itemId: string,
	formData: Omit<CartItemEditInput, "itemId">,
): CartItemEditInput {
	return {
		itemId,
		widthMm: formData.widthMm,
		heightMm: formData.heightMm,
		glassTypeId: formData.glassTypeId,
		name: formData.name,
		roomLocation: formData.roomLocation,
		quantity: formData.quantity,
	};
}
