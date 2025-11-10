/**
 * Cart Server Actions - tRPC Schemas
 *
 * These schemas define the contracts for cart-related Server Actions.
 * All actions use tRPC v11 experimental_caller for type-safe server actions.
 *
 * Location: app/_actions/cart.actions.ts
 */

import { z } from "zod";

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
 * Server Action: addToCartAction
 * Progressive enhancement: Works via form submission or programmatic call
 */
export const addToCartInput = z.object({
  additionalServiceIds: z.array(z.string().uuid()).default([]),
  glassTypeId: z.string().uuid("ID del tipo de vidrio debe ser válido"),
  glassTypeName: z.string().min(1, "Nombre del tipo de vidrio es requerido"),
  heightMm: z.number().int().positive("Alto debe ser positivo"),
  modelId: z.string().uuid("ID del modelo debe ser válido"),
  modelName: z.string().min(1, "Nombre del modelo es requerido"),
  quantity: z.number().int().positive("Cantidad debe ser positiva").default(1),
  solutionId: z.string().uuid().optional(),
  solutionName: z.string().optional(),
  widthMm: z.number().int().positive("Ancho debe ser positivo"),
});

export type AddToCartInput = z.infer<typeof addToCartInput>;

/**
 * Update cart item (name or quantity)
 *
 * Server Action: updateCartItemAction
 */
export const updateCartItemInput = z
  .object({
    itemId: z.string().uuid("ID del item debe ser válido"),
    name: z
      .string()
      .min(1, "Nombre es requerido")
      .max(MAX_ITEM_NAME_LENGTH, "Nombre muy largo")
      .optional(),
    quantity: z
      .number()
      .int()
      .positive("Cantidad debe ser positiva")
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.quantity !== undefined, {
    message: "Debe proporcionar nombre o cantidad para actualizar",
  });

export type UpdateCartItemInput = z.infer<typeof updateCartItemInput>;

/**
 * Remove item from cart
 *
 * Server Action: removeFromCartAction
 */
export const removeFromCartInput = z.object({
  itemId: z.string().uuid("ID del item debe ser válido"),
});

export type RemoveFromCartInput = z.infer<typeof removeFromCartInput>;

/**
 * Clear entire cart
 *
 * Server Action: clearCartAction
 */
export const clearCartInput = z.object({
  confirm: z.literal(true).refine((val) => val === true, {
    message: "Debe confirmar antes de vaciar el carrito",
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
  additionalServiceIds: z.array(z.string().uuid()),
  createdAt: z.string().datetime(),
  glassTypeId: z.string().uuid(),
  glassTypeName: z.string(),
  heightMm: z.number().int().positive(),
  id: z.string().uuid(),
  modelId: z.string().uuid(),
  modelName: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  solutionId: z.string().uuid().optional(),
  solutionName: z.string().optional(),
  subtotal: z.number().nonnegative(),
  unitPrice: z.number().nonnegative(),
  widthMm: z.number().int().positive(),
});

export type CartItemSchema = z.infer<typeof cartItemSchema>;

/**
 * Standard Server Action response
 * Uses discriminated union for success/error states
 */
export const cartActionResponse = z.discriminatedUnion("success", [
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
      code: z.enum([
        "VALIDATION_ERROR",
        "NOT_FOUND",
        "LIMIT_EXCEEDED",
        "UNKNOWN",
      ]),
      message: z.string(),
    }),
    success: z.literal(false),
  }),
]);

export type CartActionResponse = z.infer<typeof cartActionResponse>;

// ============================================================================
// Server Action Metadata (for observability)
// ============================================================================

export const cartActionMeta = {
  addToCart: { span: "cart.add-to-cart" },
  clearCart: { span: "cart.clear" },
  removeFromCart: { span: "cart.remove-item" },
  updateCartItem: { span: "cart.update-item" },
} as const;

// ============================================================================
// Usage Example (for documentation)
// ============================================================================

/**
 * Example: Define a tRPC Server Action for adding to cart
 *
 * ```typescript
 * // app/_actions/cart.actions.ts
 * 'use server';
 *
 * import { serverActionProcedure } from '@/server/api/trpc';
 * import { addToCartInput, cartActionResponse, cartActionMeta } from './contracts/cart-actions.schema';
 * import {.uuid } from '@paralleldrive.uuid2';
 *
 * export const addToCartAction = serverActionProcedure
 *   .meta(cartActionMeta.addToCart)
 *   .input(addToCartInput)
 *   .output(cartActionResponse)
 *   .mutation(async ({ input }) => {
 *     try {
 *       // Calculate price via tRPC
 *       const price = await api.catalog['calculate-price']({
 *         modelId: input.modelId,
 *         glassTypeId: input.glassTypeId,
 *         widthMm: input.widthMm,
 *         heightMm: input.heightMm,
 *         additionalServices: input.additionalServiceIds,
 *       });
 *
 *       // Generate item name
 *       const prefix = input.modelName.split(' ')[0].toUpperCase();
 *       const name = `${prefix}-001`; // Simplified (actual logic in useCart)
 *
 *       const item = {
 *         id:.uuid(),
 *         ...input,
 *         name,
 *         unitPrice: price.total,
 *         subtotal: price.total * input.quantity,
 *         createdAt: new Date().toISOString(),
 *       };
 *
 *       return { success: true, data: { item } };
 *     } catch (error) {
 *       return {
 *         success: false,
 *         error: {
 *           message: error.message,
 *           code: 'UNKNOWN',
 *         },
 *       };
 *     }
 *   });
 * ```
 *
 * Example: Use in a React component with useActionState
 *
 * ```tsx
 * 'use client';
 *
 * import { useActionState } from 'react';
 * import { addToCartAction } from '@/app/_actions/cart.actions';
 *
 * function AddToCartButton({ model, formData }) {
 *   const [state, action, isPending] = useActionState(
 *     addToCartAction,
 *     { success: false }
 *   );
 *
 *   return (
 *     <form action={action}>
 *       {// Hidden inputs with formData}
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? 'Agregando...' : 'Agregar al Carrito'}
 *       </button>
 *       {state.success === false && (
 *         <p className="text-red-600">{state.error.message}</p>
 *       )}
 *     </form>
 *   );
 * }
 * ```
 */
