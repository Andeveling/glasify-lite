/**
 * Cart Utility Functions
 *
 * Pure functions for cart calculations, validations, and transformations.
 * These utilities are used by the useCart hook and cart components.
 *
 * @module lib/utils/cart.utils
 */

import type { CartItem, CartState, CartSummary } from '@/types/cart.types';
import { CART_CONSTANTS } from '@/types/cart.types';

// ============================================================================
// Constants
// ============================================================================

const PRICE_TOLERANCE = 0.01; // Tolerance for floating-point comparison

// ============================================================================
// Cart Calculations
// ============================================================================

/**
 * Calculate total price for all cart items
 *
 * @param items - Cart items
 * @returns Total price (sum of all subtotals)
 */
export function calculateCartTotal(items: CartItem[]): number {
  if (!items || items.length === 0) {
    return 0;
  }

  return items.reduce((total, item) => total + item.subtotal, 0);
}

/**
 * Calculate total number of items (sum of quantities)
 *
 * @param items - Cart items
 * @returns Total item count
 */
export function calculateItemCount(items: CartItem[]): number {
  if (!items || items.length === 0) {
    return 0;
  }

  return items.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Calculate subtotal for a single cart item
 *
 * @param unitPrice - Price per unit
 * @param quantity - Number of units
 * @returns Subtotal (unitPrice * quantity)
 */
export function calculateItemSubtotal(unitPrice: number, quantity: number): number {
  if (unitPrice < 0 || quantity < 0) {
    return 0;
  }

  return unitPrice * quantity;
}

/**
 * Generate cart summary for display
 *
 * @param items - Cart items
 * @param currency - Currency code (default: CLP)
 * @returns Cart summary with totals and metadata
 */
export function generateCartSummary(items: CartItem[], currency = 'CLP'): CartSummary {
  const itemCount = calculateItemCount(items);
  const total = calculateCartTotal(items);

  return {
    currency,
    isEmpty: items.length === 0,
    itemCount,
    total,
  };
}

// ============================================================================
// Cart Validations
// ============================================================================

/**
 * Validate cart item quantity
 *
 * @param quantity - Quantity to validate
 * @returns Validation result with error message if invalid
 */
export function validateQuantity(quantity: number): { valid: boolean; error?: string } {
  if (!Number.isInteger(quantity)) {
    return { error: 'La cantidad debe ser un número entero', valid: false };
  }

  if (quantity < CART_CONSTANTS.MIN_QUANTITY) {
    return { error: `La cantidad mínima es ${CART_CONSTANTS.MIN_QUANTITY}`, valid: false };
  }

  if (quantity > CART_CONSTANTS.MAX_QUANTITY) {
    return { error: `La cantidad máxima es ${CART_CONSTANTS.MAX_QUANTITY}`, valid: false };
  }

  return { valid: true };
}

/**
 * Validate if cart can accept new item
 *
 * @param currentItemCount - Number of items currently in cart
 * @returns Validation result with error message if limit reached
 */
export function validateCartLimit(currentItemCount: number): { valid: boolean; error?: string } {
  if (currentItemCount >= CART_CONSTANTS.MAX_ITEMS) {
    return {
      error: `No puedes agregar más de ${CART_CONSTANTS.MAX_ITEMS} items al carrito`,
      valid: false,
    };
  }

  return { valid: true };
}

/**
 * Validate cart item structure
 *
 * Ensures item has all required fields and valid values
 *
 * @param item - Cart item to validate
 * @returns Validation result with error message if invalid
 */
export function validateCartItem(item: unknown): { valid: boolean; error?: string } {
  if (!item || typeof item !== 'object') {
    return { error: 'Item inválido', valid: false };
  }

  const cartItem = item as Partial<CartItem>;

  // Required string fields
  const requiredStringFields: Array<keyof CartItem> = [
    'id',
    'modelId',
    'modelName',
    'glassTypeId',
    'glassTypeName',
    'name',
    'createdAt',
  ];

  for (const field of requiredStringFields) {
    if (!cartItem[ field ] || typeof cartItem[ field ] !== 'string') {
      return { error: `Campo requerido: ${field}`, valid: false };
    }
  }

  // Required number fields
  const requiredNumberFields: Array<keyof CartItem> = [ 'widthMm', 'heightMm', 'quantity', 'unitPrice', 'subtotal' ];

  for (const field of requiredNumberFields) {
    if (typeof cartItem[ field ] !== 'number' || cartItem[ field ] === undefined) {
      return { error: `Campo numérico requerido: ${field}`, valid: false };
    }
  }

  // Validate additionalServiceIds array
  if (!Array.isArray(cartItem.additionalServiceIds)) {
    return { error: 'additionalServiceIds debe ser un array', valid: false };
  }

  // Validate dimensions object
  if (!cartItem.dimensions || typeof cartItem.dimensions !== 'object') {
    return { error: 'Dimensiones requeridas', valid: false };
  }

  if (cartItem.dimensions.widthMm !== undefined && cartItem.dimensions.widthMm <= 0) {
    return { error: 'El ancho debe ser positivo', valid: false };
  }

  if (cartItem.dimensions.heightMm !== undefined && cartItem.dimensions.heightMm <= 0) {
    return { error: 'El alto debe ser positivo', valid: false };
  }

  // Validate quantity
  const quantityValidation = validateQuantity(cartItem.quantity ?? 0);
  if (!quantityValidation.valid) {
    return quantityValidation;
  }

  // Validate prices
  if (cartItem.unitPrice !== undefined && cartItem.unitPrice < 0) {
    return { error: 'El precio unitario no puede ser negativo', valid: false };
  }

  if (cartItem.subtotal !== undefined && cartItem.subtotal < 0) {
    return { error: 'El subtotal no puede ser negativo', valid: false };
  }

  // Validate subtotal calculation
  if (cartItem.unitPrice !== undefined && cartItem.quantity !== undefined && cartItem.subtotal !== undefined) {
    const expectedSubtotal = calculateItemSubtotal(cartItem.unitPrice, cartItem.quantity);
    // Allow small floating-point difference
    if (Math.abs(cartItem.subtotal - expectedSubtotal) > PRICE_TOLERANCE) {
      return { error: 'El subtotal no coincide con precio × cantidad', valid: false };
    }
  }

  return { valid: true };
}

// ============================================================================
// Cart Item Transformations
// ============================================================================

/**
 * Update cart item with new values
 *
 * @param item - Original cart item
 * @param updates - Fields to update
 * @returns New cart item with updates applied
 */
export function updateCartItem(item: CartItem, updates: Partial<Pick<CartItem, 'name' | 'quantity'>>): CartItem {
  const updatedItem: CartItem = { ...item };

  if (updates.name !== undefined) {
    updatedItem.name = updates.name;
  }

  if (updates.quantity !== undefined) {
    updatedItem.quantity = updates.quantity;
    // Recalculate subtotal when quantity changes
    updatedItem.subtotal = calculateItemSubtotal(updatedItem.unitPrice, updates.quantity);
  }

  return updatedItem;
}

/**
 * Find cart item by ID
 *
 * @param items - Cart items
 * @param itemId - Item ID to find
 * @returns Cart item if found, undefined otherwise
 */
export function findCartItem(items: CartItem[], itemId: string): CartItem | undefined {
  return items.find((item) => item.id === itemId);
}

/**
 * Remove cart item by ID
 *
 * @param items - Cart items
 * @param itemId - Item ID to remove
 * @returns New cart items array without the removed item
 */
export function removeCartItem(items: CartItem[], itemId: string): CartItem[] {
  return items.filter((item) => item.id !== itemId);
}

/**
 * Check if cart has items from multiple manufacturers
 *
 * Cart should only contain items from a single manufacturer
 *
 * @param items - Cart items
 * @returns True if all items are from same manufacturer, false otherwise
 */
export function hasConsistentManufacturer(items: CartItem[]): boolean {
  if (items.length === 0) {
    return true;
  }

  // Extract manufacturer ID from first item's modelId
  // Assuming modelId contains manufacturer reference
  // This is a placeholder - actual implementation depends on data structure
  return true; // TODO: Implement when manufacturer validation is needed
}

// ============================================================================
// Cart State Helpers
// ============================================================================

/**
 * Create initial cart state
 *
 * @returns Empty cart state
 */
export function createEmptyCartState(): CartState {
  return {
    isLoading: false,
    itemCount: 0,
    items: [],
    lastUpdated: new Date().toISOString(),
    total: 0,
  };
}

/**
 * Update cart state with new items
 *
 * @param state - Current cart state
 * @param items - New cart items
 * @returns Updated cart state
 */
export function updateCartState(state: CartState, items: CartItem[]): CartState {
  return {
    ...state,
    itemCount: calculateItemCount(items),
    items,
    lastUpdated: new Date().toISOString(),
    total: calculateCartTotal(items),
  };
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if value is a valid CartItem
 *
 * @param value - Value to check
 * @returns True if value is CartItem
 */
export function isCartItem(value: unknown): value is CartItem {
  const validation = validateCartItem(value);
  return validation.valid;
}

/**
 * Type guard to check if array contains valid CartItems
 *
 * @param value - Value to check
 * @returns True if value is CartItem[]
 */
export function isCartItemArray(value: unknown): value is CartItem[] {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every(isCartItem);
}
