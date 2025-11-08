// src/server/api/routers/catalog/index.ts
import { createTRPCRouter } from "@/server/api/trpc";
import { catalogQueries } from "./catalog.queries";
import { glassSolutionsPublicQueries } from "./glass-solutions.queries";

/**
 * Catalog Router
 *
 * Handles all catalog-related READ operations:
 * - Listing and searching models
 * - Fetching model details for parametrization
 * - Managing manufacturers list
 * - Accessing glass solutions (public, static content)
 *
 * Note: Model creation/editing is handled by admin router.
 * Users interact with catalog only to configure items for quotes.
 */
export const catalogRouter = createTRPCRouter({
  ...catalogQueries._def.procedures,
  ...glassSolutionsPublicQueries._def.procedures,
});

// Export schemas for form validation (quote parametrization)
export * from "./catalog.schemas";
