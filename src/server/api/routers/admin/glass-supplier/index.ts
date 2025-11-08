/**
 * Glass Supplier Router - Thin Composition
 *
 * Admin CRUD operations for Glass Supplier catalog management.
 * Follows Clean Architecture + SOLID principles.
 *
 * Three-tier deletion strategy:
 * - Prevent deletion if used in glass types (hard constraint via FK)
 * - Soft delete if used in glass types (isActive = false)
 * - Hard delete if no references exist
 *
 * @module server/api/routers/admin/glass-supplier
 */
import { createTRPCRouter } from "@/server/api/trpc";
import { glassSupplierMutations } from "./glass-supplier.mutations";
import { glassSupplierQueries } from "./glass-supplier.queries";

export const glassSupplierRouter = createTRPCRouter({
  ...glassSupplierQueries._def.procedures,
  ...glassSupplierMutations._def.procedures,
});

// Export schemas for form validation
export * from "./glass-supplier.schemas";
