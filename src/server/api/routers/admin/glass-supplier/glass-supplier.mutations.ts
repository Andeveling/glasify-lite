/**
 * Glass Supplier Mutations - Write Operations
 *
 * Admin-only tRPC procedures for creating, updating, and deleting glass suppliers.
 *
 * @module server/api/routers/admin/glass-supplier/glass-supplier.mutations
 */
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  createInput,
  deleteInput,
  glassSupplierWithUsageOutput,
  updateInput,
} from "./glass-supplier.schemas";
import {
  createGlassSupplier,
  deleteGlassSupplier,
  updateGlassSupplier,
} from "./glass-supplier.service";

export const glassSupplierMutations = createTRPCRouter({
  /**
   * Create new glass supplier
   * Validates duplicate name
   */
  create: adminProcedure
    .input(createInput)
    .output(glassSupplierWithUsageOutput)
    .mutation(async ({ ctx, input }) =>
      createGlassSupplier(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Update existing glass supplier
   * Validates duplicate name if changed
   */
  update: adminProcedure
    .input(updateInput)
    .output(glassSupplierWithUsageOutput)
    .mutation(async ({ ctx, input }) =>
      updateGlassSupplier(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Delete glass supplier (three-tier strategy)
   * - If used in glass types: Soft delete (isActive = false)
   * - If no references: Hard delete
   */
  delete: adminProcedure
    .input(deleteInput)
    .mutation(async ({ ctx, input }) =>
      deleteGlassSupplier(ctx.db, ctx.session.user.id, input.id)
    ),
});
