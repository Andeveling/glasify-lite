/**
 * Profile Supplier Router - Thin Composition
 *
 * Admin CRUD operations for Profile Supplier catalog management.
 * Follows Clean Architecture + SOLID principles.
 *
 * Three-tier deletion strategy:
 * - Prevent deletion if used in quotes (hard constraint) [NOT IMPLEMENTED YET]
 * - Soft delete if used in models (isActive = false)
 * - Hard delete if no references exist
 *
 * @module server/api/routers/admin/profile-supplier
 */
import { createTRPCRouter } from "@/server/api/trpc";
import { profileSupplierMutations } from "./profile-supplier.mutations";
import { profileSupplierQueries } from "./profile-supplier.queries";

export const profileSupplierRouter = createTRPCRouter({
  ...profileSupplierQueries._def.procedures,
  ...profileSupplierMutations._def.procedures,
});

// Export schemas for form validation
export * from "./profile-supplier.schemas";
