/**
 * Model Colors Router Index
 *
 * Composes queries and mutations into a unified tRPC router
 *
 * Structure:
 * - Queries: listByModel, getAvailableColors
 * - Mutations: assign, updateSurcharge, setDefault, unassign, bulkAssign
 *
 * All procedures use adminProcedure (admin-only access)
 *
 * Business Rules:
 * - Each model can have multiple colors
 * - Only one color can be marked as default per model
 * - First assigned color automatically becomes default
 * - Surcharge percentage: 0-100% applied to model base price only
 * - Removing default color auto-promotes next available color
 */

import { createTRPCRouter } from "@/server/api/trpc";
import { modelColorsMutations } from "./model-colors.mutations";
import { modelColorsQueries } from "./model-colors.queries";

/**
 * Model Colors unified router
 * Exports all model-color assignment operations
 */
export const modelColorsRouter = createTRPCRouter({
  ...modelColorsQueries._def.procedures,
  ...modelColorsMutations._def.procedures,
});

// Export schemas for external use
export * from "./model-colors.schemas";
