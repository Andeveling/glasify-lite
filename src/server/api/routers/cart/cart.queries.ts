/**
 * Cart Queries - Read Operations
 *
 * Public tRPC procedures for fetching cart data.
 *
 * @module server/api/routers/cart/cart.queries
 */

import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { CartItemOutput } from "./cart.schemas";
import { getUserCartItems } from "./cart.service";

export const cartQueries = createTRPCRouter({
  /**
   * Get all items in the user's cart
   *
   * @public
   * @returns Array of cart items with model and glass type data
   */
  getCart: publicProcedure
    .output(z.array(CartItemOutput))
    .query(async ({ ctx }) => getUserCartItems(ctx.db, ctx.session?.user?.id)),
});
