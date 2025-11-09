/**
 * Address Router - Thin composition
 *
 * Composes queries and mutations into a single tRPC router.
 * No business logic, pure composition.
 *
 * @module server/api/routers/admin/address
 */
import { createTRPCRouter } from "@/server/api/trpc";
import { addressMutations } from "./address.mutations";
import { addressQueries } from "./address.queries";

/**
 * Address Router
 *
 * Composition of queries and mutations
 */
export const addressRouter = createTRPCRouter({
  ...addressQueries._def.procedures,
  ...addressMutations._def.procedures,
});

// Export schemas for form validation
export * from "./address.schemas";
