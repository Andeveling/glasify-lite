/**
 * Colors Router - Thin Composition
 *
 * Admin CRUD operations for Color catalog management.
 * Follows Clean Architecture + SOLID principles.
 *
 * Three-tier deletion strategy:
 * - Prevent deletion if used in quotes (hard constraint)
 * - Soft delete if used in models (isActive = false)
 * - Hard delete if no references exist
 *
 * @module server/api/routers/admin/colors
 */
import { createTRPCRouter } from "@/server/api/trpc";
import { colorsMutations } from "./colors.mutations";
import { colorsQueries } from "./colors.queries";

export const colorsRouter = createTRPCRouter({
  ...colorsQueries._def.procedures,
  ...colorsMutations._def.procedures,
});

// Export schemas for form validation
export * from "./colors.schemas";
