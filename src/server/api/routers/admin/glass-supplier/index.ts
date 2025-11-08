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

// Temporary empty router - will be completed with queries and mutations
export const glassSupplierRouter = createTRPCRouter({
  // TODO: Add queries and mutations
});

// Export schemas for form validation
export * from "./glass-supplier.schemas";
