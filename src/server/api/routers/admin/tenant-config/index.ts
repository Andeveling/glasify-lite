/**
 * TenantConfig Router - Singleton Configuration Management
 *
 * Combines queries (public) and mutations (admin-only) procedures.
 * Tenant configuration is global and accessible to all users.
 *
 * @module server/api/routers/admin/tenant-config
 * @see /plan/refactor-manufacturer-to-tenant-config-1.md
 * @see /plan/feature-branding-communication-1.md (US-009, US-010)
 */

import { createTRPCRouter } from "@/server/api/trpc";
import { tenantConfigMutations } from "./tenant-config.mutations";
import { tenantConfigQueries } from "./tenant-config.queries";

export const tenantConfigRouter = createTRPCRouter({
  ...tenantConfigQueries._def.procedures,
  ...tenantConfigMutations._def.procedures,
});

// Export schemas for external use (forms, utilities)
export * from "./tenant-config.schemas";
