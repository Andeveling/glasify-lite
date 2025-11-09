/**
 * Service Router - Composition Layer
 *
 * Combines queries and mutations, exports schemas for external use.
 *
 * @module server/api/routers/admin/service
 */

import { createTRPCRouter } from "@/server/api/trpc";
import { serviceMutations } from "./service.mutations";
import { serviceQueries } from "./service.queries";

export const serviceRouter = createTRPCRouter({
  ...serviceQueries._def.procedures,
  ...serviceMutations._def.procedures,
});

// Export schemas for external use (forms, validation, etc.)
export * from "./service.schemas";
