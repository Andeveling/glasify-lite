/**
 * Cart Mutations - Write Operations
 *
 * tRPC procedures for modifying cart data.
 *
 * @module server/api/routers/cart/cart.mutations
 */

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  addToCartInput,
  CartItemOutput,
  clearCartInput,
  removeFromCartInput,
  updateCartItemInput,
} from "./cart.schemas";
import {
  addItemToCart,
  clearUserCart,
  removeItemFromCart,
  updateCartItemById,
} from "./cart.service";

export const cartMutations = createTRPCRouter({
  /**
   * Add a new item to the cart
   *
   * @protected - Requires authentication
   * @input AddToCartInput
   * @returns Created cart item with price calculation
   */
  addItem: protectedProcedure
    .input(addToCartInput)
    .output(CartItemOutput)
    .mutation(async ({ ctx, input }) =>
      addItemToCart(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Update an existing cart item (name and/or quantity)
   *
   * @protected - Requires authentication
   * @input UpdateCartItemInput
   * @returns Updated cart item with recalculated price
   */
  updateItem: protectedProcedure
    .input(updateCartItemInput)
    .output(CartItemOutput)
    .mutation(async ({ ctx, input }) =>
      updateCartItemById(ctx.db, input.id, {
        name: input.name,
        quantity: input.quantity,
      })
    ),

  /**
   * Remove a single item from the cart
   *
   * @protected - Requires authentication
   * @input RemoveFromCartInput
   * @returns Void on success
   */
  removeItem: protectedProcedure
    .input(removeFromCartInput)
    .output(z.void())
    .mutation(async ({ ctx, input }) => removeItemFromCart(ctx.db, input.id)),

  /**
   * Clear all items from the user's cart
   *
   * @protected - Requires authentication
   * @input ClearCartInput (empty object)
   * @returns Number of deleted items
   */
  clearCart: protectedProcedure
    .input(clearCartInput)
    .output(z.number().int().nonnegative())
    .mutation(async ({ ctx }) => clearUserCart(ctx.db, ctx.session.user.id)),
});
