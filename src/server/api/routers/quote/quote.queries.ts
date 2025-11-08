/**
 * Quote Queries - Read Operations
 *
 * tRPC procedures for fetching quote data.
 * All queries require authentication (protectedProcedure).
 *
 * @module server/api/routers/quote/quote.queries
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { listUserQuotesInput } from "./quote.schemas";
import { findQuoteByIdWithItems } from "./repositories/quote-repository";

export const quoteQueries = createTRPCRouter({
  /**
   * Get quote by ID with all items
   *
   * Returns complete quote details including all line items.
   * Users can only access their own quotes.
   */
  "get-by-id": protectedProcedure
    .input(z.object({ quoteId: z.cuid() }))
    .query(async ({ ctx, input }) => {
      const quote = await findQuoteByIdWithItems(ctx.db, input.quoteId);

      if (!quote) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cotización no encontrada",
        });
      }

      // Verify ownership
      if (quote.userId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No tienes permiso para ver esta cotización",
        });
      }

      return quote;
    }),

  /**
   * List user quotes with pagination and filters
   *
   * Returns paginated list of user's quotes with optional filters.
   * Includes summary data only (no items).
   */
  "list-user-quotes": protectedProcedure
    .input(listUserQuotesInput)
    .query(({ input }) => {
      // TODO: Implement list functionality when repository function is available
      // For now, return empty list
      return {
        items: [],
        pagination: {
          page: input.page,
          limit: input.limit,
          total: 0,
          totalPages: 0,
        },
      };
    }),
});
