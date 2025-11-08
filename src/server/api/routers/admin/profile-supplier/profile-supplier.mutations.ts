/**
 * Profile Supplier Mutations - Write Operations
 *
 * Admin-only tRPC procedures for creating, updating, and deleting profile suppliers.
 *
 * @module server/api/routers/admin/profile-supplier/profile-supplier.mutations
 */
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  createInput,
  deleteInput,
  profileSupplierWithUsageOutput,
  updateInput,
} from "./profile-supplier.schemas";
import {
  createProfileSupplier,
  deleteProfileSupplier,
  updateProfileSupplier,
} from "./profile-supplier.service";

export const profileSupplierMutations = createTRPCRouter({
  /**
   * Create new profile supplier
   * Validates duplicate name+materialType combination
   */
  create: adminProcedure
    .input(createInput)
    .output(profileSupplierWithUsageOutput)
    .mutation(async ({ ctx, input }) =>
      createProfileSupplier(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Update existing profile supplier
   * Validates duplicate name+materialType if changed
   */
  update: adminProcedure
    .input(updateInput)
    .output(profileSupplierWithUsageOutput)
    .mutation(async ({ ctx, input }) =>
      updateProfileSupplier(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Delete profile supplier (three-tier strategy)
   * - If used in quotes: Prevent deletion (error) [NOT IMPLEMENTED YET]
   * - If used in models: Soft delete (isActive = false)
   * - If no references: Hard delete
   */
  delete: adminProcedure
    .input(deleteInput)
    .mutation(async ({ ctx, input }) =>
      deleteProfileSupplier(ctx.db, ctx.session.user.id, input.id)
    ),
});
