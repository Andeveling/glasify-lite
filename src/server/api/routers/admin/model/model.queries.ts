/**
 * Model Queries - Read Operations
 *
 * tRPC procedures for fetching model data.
 * All procedures use adminProcedure (admin-only access).
 *
 * @module server/api/routers/admin/model/model.queries
 */

import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { db } from "@/server/db/drizzle";
import {
  getModelByIdInput,
  listModelsInput,
  listModelsOutput,
  modelDetailOutput,
} from "./model.schemas";
import { getModelById, listModels } from "./model.service";

export const modelQueries = createTRPCRouter({
  /**
   * List models with pagination, filtering, and sorting
   * GET /api/trpc/admin.model.list
   */
  list: adminProcedure
    .input(listModelsInput)
    .output(listModelsOutput)
    .query(async ({ input, ctx }) =>
      listModels(db, input, ctx.session.user.id)
    ),

  /**
   * Get model by ID with relations (cost breakdown and price history)
   * GET /api/trpc/admin.model['get-by-id']
   */
  "get-by-id": adminProcedure
    .input(getModelByIdInput)
    .output(modelDetailOutput)
    .query(async ({ input, ctx }) =>
      getModelById(db, input.id, ctx.session.user.id)
    ),
});
