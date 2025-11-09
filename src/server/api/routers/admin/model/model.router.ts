/**
 * Model Router - Thin Composition Layer
 *
 * Merges queries and mutations into single router.
 * No business logic - delegates everything to service layer.
 *
 * @module server/api/routers/admin/model/model.router
 */

import { createTRPCRouter } from "@/server/api/trpc";
import { modelMutations } from "./model.mutations";
import { modelQueries } from "./model.queries";

export const modelRouter = createTRPCRouter({
  ...modelQueries._def.procedures,
  ...modelMutations._def.procedures,
});

// Export schemas for external use (forms, validation)
export * from "./model.schemas";
