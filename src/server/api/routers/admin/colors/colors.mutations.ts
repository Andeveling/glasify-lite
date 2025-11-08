/**
 * Colors Mutations - Write Operations
 *
 * Admin-only tRPC procedures for creating, updating, and deleting colors.
 *
 * @module server/api/routers/admin/colors/colors.mutations
 */
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  colorOutput,
  createInput,
  deleteInput,
  deleteResultOutput,
  updateInput,
} from "./colors.schemas";
import { createColor, deleteColor, updateColor } from "./colors.service";

export const colorsMutations = createTRPCRouter({
  /**
   * Create new color
   * Validates duplicate name+hexCode via unique constraint
   */
  create: adminProcedure
    .input(createInput)
    .output(colorOutput)
    .mutation(async ({ ctx, input }) =>
      createColor(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Update existing color
   * Validates duplicate name+hexCode if changed
   */
  update: adminProcedure
    .input(updateInput)
    .output(colorOutput)
    .mutation(async ({ ctx, input }) =>
      updateColor(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Delete color (three-tier strategy)
   * - If used in quotes: Prevent deletion (error)
   * - If used in models: Soft delete (isActive = false)
   * - If no references: Hard delete
   */
  delete: adminProcedure
    .input(deleteInput)
    .output(deleteResultOutput)
    .mutation(async ({ ctx, input }) =>
      deleteColor(ctx.db, ctx.session.user.id, input.id)
    ),
});
