/**
 * Glass Solution Router - tRPC Router Composition
 *
 * Composes queries and mutations into a single router for tRPC.
 *
 * @module server/api/routers/admin/glass-solution/index
 */
import { createTRPCRouter } from "@/server/api/trpc";
import { glassSolutionMutations } from "./glass-solution.mutations";
import { glassSolutionQueries } from "./glass-solution.queries";

/**
 * Glass Solution Router
 *
 * Merges all glass solution procedures (queries + mutations)
 * Exported for integration in admin router
 */
export const glassSolutionRouter = createTRPCRouter({
  ...glassSolutionQueries._def.procedures,
  ...glassSolutionMutations._def.procedures,
});

export type GlassSolutionRouter = typeof glassSolutionRouter;
