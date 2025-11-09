/**
 * Cart Router - Thin composition of cart queries and mutations
 *
 * Delegates all business logic to service layer.
 *
 * @module server/api/routers/cart
 */

import { createTRPCRouter } from "@/server/api/trpc";
import { cartMutations } from "./cart.mutations";
import { cartQueries } from "./cart.queries";

/**
 * Combined cart router
 *
 * Merges read and write operations into a single tRPC router.
 */
export const cartRouter = createTRPCRouter({
  ...cartQueries._def.procedures,
  ...cartMutations._def.procedures,
});

// Export schemas for form validation
export * from "./cart.schemas";
