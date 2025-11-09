/**
 * Glass Solution Mutations - Write tRPC Procedures
 *
 * Admin-only tRPC procedures for modifying glass solution data.
 * Thin wrapper around service layer functions.
 *
 * @module server/api/routers/admin/glass-solution/glass-solution.mutations
 */
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  createProcedureInputSchema,
  createProcedureOutputSchema,
  deleteInputSchema,
  deleteOutputSchema,
  updateInputSchema,
  updateOutputSchema,
} from "./glass-solution.schemas";
import {
  createGlassSolutionService,
  deleteGlassSolutionService,
  updateGlassSolutionService,
} from "./glass-solution.service";

/**
 * Glass Solution Mutations Router
 *
 * Write procedures (create, update, delete)
 * All procedures require admin authentication
 */
export const glassSolutionMutations = createTRPCRouter({
  /**
   * Create glass solution
   *
   * @procedure create
   * @access Admin only
   * @input CreateInput - All required fields for new glass solution
   * @output CreateOutput - Created glass solution
   */
  create: adminProcedure
    .input(createProcedureInputSchema)
    .output(createProcedureOutputSchema)
    .mutation(async ({ ctx, input }) =>
      createGlassSolutionService(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Update glass solution
   *
   * @procedure update
   * @access Admin only
   * @input UpdateInput - Glass solution ID + partial update data
   * @output UpdateOutput - Updated glass solution
   */
  update: adminProcedure
    .input(updateInputSchema)
    .output(updateOutputSchema)
    .mutation(async ({ ctx, input }) =>
      updateGlassSolutionService(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Delete glass solution
   *
   * @procedure delete
   * @access Admin only
   * @input DeleteInput - Glass solution ID
   * @output DeleteOutput - Deleted glass solution
   */
  delete: adminProcedure
    .input(deleteInputSchema)
    .output(deleteOutputSchema)
    .mutation(async ({ ctx, input }) =>
      deleteGlassSolutionService(ctx.db, ctx.session.user.id, input)
    ),
});
