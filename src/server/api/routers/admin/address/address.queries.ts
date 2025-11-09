/**
 * Address Queries - Read tRPC Procedures
 *
 * Admin-only tRPC procedures for fetching address data.
 * Thin wrapper around service layer functions.
 *
 * @module server/api/routers/admin/address/address.queries
 */
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  listByQuoteInputSchema,
  listByQuoteOutputSchema,
  readByIdInputSchema,
  readByIdOutputSchema,
} from "./address.schemas";
import {
  getAddressByIdService,
  listAddressesByQuoteService,
} from "./address.service";

/**
 * Address Queries Router
 *
 * Read procedures (getById, listByQuote)
 * All procedures require admin authentication
 */
export const addressQueries = createTRPCRouter({
  /**
   * Get address by ID
   *
   * @procedure getById
   * @access Admin only
   * @input ReadByIdInput - Address ID
   * @output ReadByIdOutput - Address or null
   */
  getById: adminProcedure
    .input(readByIdInputSchema)
    .output(readByIdOutputSchema)
    .query(async ({ ctx, input }) =>
      getAddressByIdService(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * List addresses by quote ID
   *
   * @procedure listByQuote
   * @access Admin only
   * @input ListByQuoteInput - Quote ID
   * @output ListByQuoteOutput - Array of addresses
   */
  listByQuote: adminProcedure
    .input(listByQuoteInputSchema)
    .output(listByQuoteOutputSchema)
    .query(async ({ ctx, input }) =>
      listAddressesByQuoteService(ctx.db, ctx.session.user.id, input)
    ),
});
