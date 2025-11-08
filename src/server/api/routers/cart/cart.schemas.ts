/**
 * Cart Schemas - Zod validation schemas for cart operations
 *
 * These schemas define the contracts for cart-related tRPC procedures.
 * Follows the same pattern as catalog.schemas.ts
 *
 * @module server/api/routers/cart/cart.schemas
 */

import { z } from "zod";
import {
  createSelectSchema,
  createInsertSchema,
} from "drizzle-zod";
import { quoteItems } from "@/server/db/schema";

// ============================================================================
// HELPER SCHEMAS
// ============================================================================

const MAX_ITEM_NAME_LENGTH = 50;

// ============================================================================
// DATABASE SCHEMAS
// ============================================================================
export const SelectCartItemSchema = createSelectSchema(quoteItems, {
  id: z.string().cuid2(),
  quoteId: z.string().cuid2(),
  modelId: z.string().cuid2(),
  glassTypeId: z.string().cuid2(),
  colorId: z.string().cuid2().optional().nullable(),
});

export const InsertCartItemSchema = createInsertSchema(quoteItems, {
  id: z.string().cuid2(),
  quoteId: z.string().cuid2(),
  modelId: z.string().cuid2(),
  glassTypeId: z.string().cuid2(),
  colorId: z.string().cuid2().optional().nullable(),
  heightMm: z.number().int().positive("Alto debe ser positivo"),
  widthMm: z.number().int().positive("Ancho debe ser positivo"),
  quantity: z.number().int().positive("Cantidad debe ser positiva").default(1),
  name: z.string().min(1, "Nombre es requerido").max(MAX_ITEM_NAME_LENGTH),
});

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

export const addToCartInput = InsertCartItemSchema.pick({
  modelId: true,
  glassTypeId: true,
  heightMm: true,
  widthMm: true,
  quantity: true,
  name: true,
  colorId: true,
}).extend({
  additionalServiceIds: z.array(z.string().cuid()).default([]),
  solutionId: z.string().cuid().optional(),
});

export const updateCartItemInput = InsertCartItemSchema.pick({
  id: true,
  name: true,
  quantity: true,
}).partial().required({
  id: true,
});

export const removeFromCartInput = InsertCartItemSchema.pick({
  id: true,
});

export const clearCartInput = z.object({});

// ============================================================================
// OUTPUT SCHEMAS
// ============================================================================

export const CartItemOutput = SelectCartItemSchema.extend({
  subtotal: z.number().nonnegative(),
  unitPrice: z.number().nonnegative(),
  modelName: z.string(),
  glassTypeName: z.string(),
  solutionName: z.string().optional(),
});

export const CartActionResponse = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    data: z.object({
      item: CartItemOutput.optional(),
      items: z.array(CartItemOutput).optional(),
      itemCount: z.number().int().nonnegative().optional(),
      total: z.number().nonnegative().optional(),
    }),
  }),
  z.object({
    success: z.literal(false),
    error: z.object({
      code: z.enum([
        "VALIDATION_ERROR",
        "NOT_FOUND",
        "LIMIT_EXCEEDED",
        "UNKNOWN",
      ]),
      message: z.string(),
    }),
  }),
]);

export type AddToCartInput = z.infer<typeof addToCartInput>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemInput>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartInput>;
export type ClearCartInput = z.infer<typeof clearCartInput>;
export type CartItemSchema = z.infer<typeof CartItemOutput>;
export type CartActionResponse = z.infer<typeof CartActionResponse>;
