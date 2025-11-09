/**
 * Address Mutations - Write tRPC Procedures
 *
 * Admin-only tRPC procedures for modifying address data.
 * Thin wrapper around service layer functions.
 *
 * @module server/api/routers/admin/address/address.mutations
 */
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  createInputSchema,
  createOutputSchema,
  deleteInputSchema,
  deleteOutputSchema,
  updateInputSchema,
  updateOutputSchema,
} from "./address.schemas";
import {
  createAddressService,
  deleteAddressService,
  updateAddressService,
} from "./address.service";

/**
 * Address Mutations Router
 *
 * Write procedures (create, update, delete)
 * All procedures require admin authentication
 */
export const addressMutations = createTRPCRouter({
  /**
   * Create new address
   *
   * @procedure create
   * @access Admin only
   * @input CreateInput - All required fields for new address
   * @output CreateOutput - Created address
   */
  create: adminProcedure
    .input(createInputSchema)
    .output(createOutputSchema)
    .mutation(async ({ ctx, input }) =>
      createAddressService(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Update address
   *
   * @procedure update
   * @access Admin only
   * @input UpdateInput - Address ID + partial update data
   * @output UpdateOutput - Updated address
   */
  update: adminProcedure
    .input(updateInputSchema)
    .output(updateOutputSchema)
    .mutation(async ({ ctx, input }) =>
      updateAddressService(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Delete address
   *
   * @procedure delete
   * @access Admin only
   * @input DeleteInput - Address ID
   * @output DeleteOutput - Deleted address
   */
  delete: adminProcedure
    .input(deleteInputSchema)
    .output(deleteOutputSchema)
    .mutation(async ({ ctx, input }) =>
      deleteAddressService(ctx.db, ctx.session.user.id, input)
    ),
});
