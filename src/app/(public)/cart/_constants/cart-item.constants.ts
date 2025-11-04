/**
 * Cart Item Feature Constants
 *
 * Centralized configuration for cart item display and editing.
 * Extracted magic numbers following SOLID principles.
 */

// Image display configuration
export const CART_ITEM_IMAGE_SIZE = 80; // px
export const DEFAULT_MODEL_PLACEHOLDER = "/assets/placeholder-model.png";

// Dimension validation constraints (mm)
export const MIN_DIMENSION = 100;
export const MAX_DIMENSION = 3000;

// UI text constants (Spanish)
export const UI_TEXT = {
	EDIT_BUTTON: "Editar",
	SAVE_BUTTON: "Guardar cambios",
	SAVING_BUTTON: "Guardando...",
	CANCEL_BUTTON: "Cancelar",
	MODAL_TITLE: "Editar Item",
	PRICE_RECALC_NOTE: "El precio se recalculará al confirmar",
	CURRENT_PRICE_LABEL: "Precio actual",
	WIDTH_LABEL: "Ancho (mm)",
	HEIGHT_LABEL: "Alto (mm)",
	GLASS_TYPE_LABEL: "Tipo de Vidrio",
	QUANTITY_LABEL: "Cantidad",
	NAME_LABEL: "Nombre (opcional)",
	ROOM_LOCATION_LABEL: "Ubicación (opcional)",
} as const;

// Toast notification messages (Spanish)
export const TOAST_MESSAGES = {
	UPDATE_SUCCESS: "Item actualizado correctamente",
	UPDATE_ERROR: "Error al actualizar el item",
} as const;
