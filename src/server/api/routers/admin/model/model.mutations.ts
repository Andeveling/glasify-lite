/**
 * Model Mutations - Write Operations
 *
 * tRPC procedures for creating, updating, and deleting models.
 * All procedures use adminProcedure (admin-only access).
 *
 * @module server/api/routers/admin/model/model.mutations
 */

import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { db } from "@/server/db/drizzle";
import {
  addCostBreakdownInput,
  costBreakdownOutput,
  createModelInput,
  deleteCostBreakdownInput,
  deleteModelInput,
  deleteSuccessOutput,
  modelOutput,
  updateCostBreakdownInput,
  updateModelInput,
} from "./model.schemas";
import {
  addCostBreakdown,
  createModel,
  deleteCostBreakdown,
  deleteModel,
  updateCostBreakdown,
  updateModel,
} from "./model.service";

export const modelMutations = createTRPCRouter({
  /**
   * Create new model
   * POST /api/trpc/admin.model.create
   */
  create: adminProcedure
    .input(createModelInput)
    .output(modelOutput)
    .mutation(async ({ input, ctx }) =>
      createModel(db, input, ctx.session.user.id)
    ),

  /**
   * Update model
   * POST /api/trpc/admin.model.update
   */
  update: adminProcedure
    .input(updateModelInput)
    .output(modelOutput)
    .mutation(async ({ input, ctx }) =>
      updateModel(db, input.id, input.data, ctx.session.user.id)
    ),

  /**
   * Delete model
   * POST /api/trpc/admin.model.delete
   */
  delete: adminProcedure
    .input(deleteModelInput)
    .output(deleteSuccessOutput)
    .mutation(async ({ input, ctx }) =>
      deleteModel(db, input.id, ctx.session.user.id)
    ),

  /**
   * Add cost breakdown component
   * POST /api/trpc/admin.model['add-cost-breakdown']
   */
  "add-cost-breakdown": adminProcedure
    .input(addCostBreakdownInput)
    .output(costBreakdownOutput)
    .mutation(async ({ input, ctx }) =>
      addCostBreakdown(db, input.modelId, input, ctx.session.user.id)
    ),

  /**
   * Update cost breakdown component
   * POST /api/trpc/admin.model['update-cost-breakdown']
   */
  "update-cost-breakdown": adminProcedure
    .input(updateCostBreakdownInput)
    .output(costBreakdownOutput)
    .mutation(async ({ input, ctx }) =>
      updateCostBreakdown(db, input.id, input.data, ctx.session.user.id)
    ),

  /**
   * Delete cost breakdown component
   * POST /api/trpc/admin.model['delete-cost-breakdown']
   */
  "delete-cost-breakdown": adminProcedure
    .input(deleteCostBreakdownInput)
    .output(deleteSuccessOutput)
    .mutation(async ({ input, ctx }) =>
      deleteCostBreakdown(db, input.id, ctx.session.user.id)
    ),
});
