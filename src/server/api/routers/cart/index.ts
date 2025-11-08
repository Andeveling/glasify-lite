/**
 * Cart tRPC Router
 *
 * This router handles all cart-related operations, including adding, updating,
 * and removing items from the cart. It uses Drizzle ORM for database
 * interactions and Zod for schema validation.
 *
 * @module server/api/routers/cart/cart
 */
import { TRPCError } from "@trpc/server";
import { and, eq, inArray } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  quoteItems,
  quotes,
  models,
  glassTypes,
  services,
} from "@/server/db/schema";
import {
  addToCartInput,
  updateCartItemInput,
  removeFromCartInput,
  clearCartInput,
  CartItemOutput,
} from "./cart.schemas";
import logger from "@/lib/logger";

export const cartRouter = createTRPCRouter({
  /**
   * Add an item to the cart.
   * If a cart doesn't exist for the user, a new one is created.
   */
  addItem: publicProcedure
    .input(addToCartInput)
    .output(CartItemOutput)
    .mutation(async ({ ctx, input }) => {
      const { db, session } = ctx;
      const {
        modelId,
        glassTypeId,
        heightMm,
        widthMm,
        quantity,
        name,
        colorId,
        additionalServiceIds,
      } = input;

      const userId = session?.user?.id;

      try {
        let cart = await db
          .select()
          .from(quotes)
          .where(and(eq(quotes.userId, userId), eq(quotes.status, "draft")))
          .then((res) => res[0]);

        if (!cart) {
          cart = await db
            .insert(quotes)
            .values({
              id: createId(),
              userId,
              status: "draft",
              total: "0",
              currency: "USD",
            })
            .returning()
            .then((res) => res[0]);
        }

        if (!cart) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Could not create or find a cart for the user.",
          });
        }

        const model = await db
          .select()
          .from(models)
          .where(eq(models.id, modelId))
          .then((res) => res[0]);
        if (!model) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Model not found.",
          });
        }

        const glassType = await db
          .select()
          .from(glassTypes)
          .where(eq(glassTypes.id, glassTypeId))
          .then((res) => res[0]);
        if (!glassType) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Glass type not found.",
          });
        }

        const price =
          (Number(model.basePrice) +
            Number(model.costPerMmHeight) * heightMm +
            Number(model.costPerMmWidth) * widthMm) *
          quantity;

        const newItem = await db
          .insert(quoteItems)
          .values({
            id: createId(),
            quoteId: cart.id,
            modelId,
            glassTypeId,
            heightMm,
            widthMm,
            quantity,
            name,
            colorId,
            subtotal: price.toString(),
          })
          .returning()
          .then((res) => res[0]);

        if (!newItem) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to add item to cart.",
          });
        }

        return {
          ...newItem,
          subtotal: Number(newItem.subtotal),
          unitPrice: Number(newItem.subtotal) / newItem.quantity,
          modelName: model.name,
          glassTypeName: glassType.name,
          solutionName: undefined,
        };
      } catch (error) {
        logger.error("Failed to add item to cart:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while adding the item.",
        });
      }
    }),

  /**
   * Update an item in the cart.
   */
  updateItem: protectedProcedure
    .input(updateCartItemInput)
    .output(CartItemOutput)
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { id, ...updateData } = input;

      try {
        const updatedItem = await db
          .update(quoteItems)
          .set(updateData)
          .where(eq(quoteItems.id, id))
          .returning()
          .then((res) => res[0]);

        if (!updatedItem) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cart item not found.",
          });
        }

        const model = await db
          .select()
          .from(models)
          .where(eq(models.id, updatedItem.modelId))
          .then((res) => res[0]);

        const glassType = await db
          .select()
          .from(glassTypes)
          .where(eq(glassTypes.id, updatedItem.glassTypeId))
          .then((res) => res[0]);

        return {
          ...updatedItem,
          subtotal: Number(updatedItem.subtotal),
          unitPrice: Number(updatedItem.subtotal) / updatedItem.quantity,
          modelName: model?.name ?? "Unknown Model",
          glassTypeName: glassType?.name ?? "Unknown Glass Type",
          solutionName: undefined,
        };
      } catch (error) {
        logger.error("Failed to update cart item:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while updating the item.",
        });
      }
    }),

  /**
   * Remove an item from the cart.
   */
  removeItem: protectedProcedure
    .input(removeFromCartInput)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { id } = input;

      try {
        await db.delete(quoteItems).where(eq(quoteItems.id, id));
        return { success: true };
      } catch (error) {
        logger.error("Failed to remove cart item:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while removing the item.",
        });
      }
    }),

  /**
   * Clear all items from the cart.
   */
  clearCart: protectedProcedure
    .input(clearCartInput)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx }) => {
      const { db, session } = ctx;
      const userId = session.user.id;

      try {
        const cart = await db
          .select()
          .from(quotes)
          .where(and(eq(quotes.userId, userId), eq(quotes.status, "draft")))
          .then((res) => res[0]);

        if (cart) {
          await db.delete(quoteItems).where(eq(quoteItems.quoteId, cart.id));
        }

        return { success: true };
      } catch (error) {
        logger.error("Failed to clear cart:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while clearing the cart.",
        });
      }
    }),

  /**
   * Get all items in the user's cart.
   */
  getCart: publicProcedure
    .output(z.array(CartItemOutput))
    .query(async ({ ctx }) => {
      const { db, session } = ctx;
      const userId = session?.user?.id;

      if (!userId) {
        return [];
      }

      try {
        const cart = await db
          .select()
          .from(quotes)
          .where(and(eq(quotes.userId, userId), eq(quotes.status, "draft")))
          .then((res) => res[0]);

        if (!cart) {
          return [];
        }

        const items = await db
          .select()
          .from(quoteItems)
          .where(eq(quoteItems.quoteId, cart.id))
          .leftJoin(models, eq(quoteItems.modelId, models.id))
          .leftJoin(glassTypes, eq(quoteItems.glassTypeId, glassTypes.id));

        return items.map(({ quoteItems, models, glassTypes }) => ({
          ...quoteItems,
          subtotal: Number(quoteItems.subtotal),
          unitPrice: Number(quoteItems.subtotal) / quoteItems.quantity,
          modelName: models?.name ?? "Unknown Model",
          glassTypeName: glassTypes?.name ?? "Unknown Glass Type",
          solutionName: undefined,
        }));
      } catch (error) {
        logger.error("Failed to get cart:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while fetching the cart.",
        });
      }
    }),
});
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
          
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        -
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
-
        
        
        
        
        
        
        -
        
        
        
        
        
-
        
        
        
        
        
        
        
        
-
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        -
        
-
        
        e.g.
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        -
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        -
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
-
        
-
        
-
        
        
-
        
        
-
        
        
-
        -
        
-
        
        
-
        
        
-
        
        -T-
-
-
        
        -
        
        
        -
        
        
        
-
        
        
        
-
        
        
        
        
        
        
        
        
        
-
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        gots) => ({
      ...quoteItems,
-
      subtotal: Number(quoteItems.subtotal),
-
-
      unitPrice: Number(AquoteItems.subtotal) / quoteItems.quantity,
-
-
      modelName: models?.name ?? "Unknown Model",
-
      glassTypeName: glassTypes?.name ?? "Unknown Glass Type",
-
      solutionName: undefined,
-
    }));
-
-
      } catch (error) {
-
        logger.error("Failed to get cart:", error);
-
        throw new TRPCError({
-
          code: "INTERNAL_SERVER_ERROR",
-
          message: "An unexpected error occurred while fetching the cart.",
-
        });
-
      }
-
    }),
-
});
-
