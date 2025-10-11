/**
 * Cart Schemas - Zod validation schemas for cart operations
 *
 * These schemas define the contracts for cart-related tRPC procedures.
 * Follows the same pattern as catalog.schemas.ts
 *
 * @module server/api/routers/cart/cart.schemas
 */

import { z } from 'zod';

// ============================================================================
// Constants
// ============================================================================

const MAX_ITEM_NAME_LENGTH = 50;

// ============================================================================
// Input Schemas
// ============================================================================

/**
 * Add item to cart
 *
 * Used for cart add operations
 */
export const addToCartInput = z.object({
  additionalServiceIds: z.array(z.string().cuid()).default([]),
  glassTypeId: z.string().cuid('ID del tipo de vidrio debe ser válido'),
  glassTypeName: z.string().min(1, 'Nombre del tipo de vidrio es requerido'),
  heightMm: z.number().int().positive('Alto debe ser positivo'),
  modelId: z.string().cuid('ID del modelo debe ser válido'),
  modelName: z.string().min(1, 'Nombre del modelo es requerido'),
  quantity: z.number().int().positive('Cantidad debe ser positiva').default(1),
  solutionId: z.string().cuid().optional(),
  solutionName: z.string().optional(),
  widthMm: z.number().int().positive('Ancho debe ser positivo'),
});

export type AddToCartInput = z.infer<typeof addToCartInput>;

/**
 * Update cart item (name or quantity)
 */
export const updateCartItemInput = z
  .object({
    itemId: z.string().cuid('ID del item debe ser válido'),
    name: z.string().min(1, 'Nombre es requerido').max(MAX_ITEM_NAME_LENGTH, 'Nombre muy largo').optional(),
    quantity: z.number().int().positive('Cantidad debe ser positiva').optional(),
  })
  .refine((data) => data.name !== undefined || data.quantity !== undefined, {
    message: 'Debe proporcionar nombre o cantidad para actualizar',
  });

export type UpdateCartItemInput = z.infer<typeof updateCartItemInput>;

/**
 * Remove item from cart
 */
export const removeFromCartInput = z.object({
  itemId: z.string().cuid('ID del item debe ser válido'),
});

export type RemoveFromCartInput = z.infer<typeof removeFromCartInput>;

/**
 * Clear entire cart
 */
export const clearCartInput = z.object({
  confirm: z.literal(true).refine((val) => val === true, {
    message: 'Debe confirmar antes de vaciar el carrito',
  }),
});

export type ClearCartInput = z.infer<typeof clearCartInput>;

// ============================================================================
// Output Schemas
// ============================================================================

/**
 * Cart item structure (matches client-side CartItem interface)
 */
export const cartItemSchema = z.object({
  additionalServiceIds: z.array(z.string().cuid()),
  createdAt: z.string().datetime(),
  glassTypeId: z.string().cuid(),
  glassTypeName: z.string(),
  heightMm: z.number().int().positive(),
  id: z.string().cuid(),
  modelId: z.string().cuid(),
  modelName: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  solutionId: z.string().cuid().optional(),
  solutionName: z.string().optional(),
  subtotal: z.number().nonnegative(),
  unitPrice: z.number().nonnegative(),
  widthMm: z.number().int().positive(),
});

export type CartItemSchema = z.infer<typeof cartItemSchema>;

/**
 * Cart operation response
 * Uses discriminated union for success/error states
 */
export const cartActionResponse = z.discriminatedUnion('success', [
  z.object({
    data: z.object({
      item: cartItemSchema.optional(),
      itemCount: z.number().int().nonnegative().optional(),
      items: z.array(cartItemSchema).optional(),
      total: z.number().nonnegative().optional(),
    }),
    success: z.literal(true),
  }),
  z.object({
    error: z.object({
      code: z.enum(['VALIDATION_ERROR', 'NOT_FOUND', 'LIMIT_EXCEEDED', 'UNKNOWN']),
      message: z.string(),
    }),
    success: z.literal(false),
  }),
]);

export type CartActionResponse = z.infer<typeof cartActionResponse>;
