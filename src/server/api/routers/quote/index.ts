/**
 * Quote Router - Complete Implementation
 *
 * Handles quote generation and management:
 * - Generate quotes from cart items
 * - Send quotes to vendors
 * - List and retrieve user quotes
 *
 * Architecture:
 * - queries: Read operations (list, get-by-id)
 * - mutations: Write operations (generate, send)
 * - service: Business logic orchestration
 * - repositories: Data access layer
 * - validators: Business rules validation
 *
 * @module server/api/routers/quote
 */
import { createTRPCRouter } from "@/server/api/trpc";
import { quoteMutations } from "./quote.mutations";
import { quoteQueries } from "./quote.queries";

export const quoteRouter = createTRPCRouter({
  ...quoteQueries._def.procedures,
  ...quoteMutations._def.procedures,
});

// Export schemas for form validation
export * from "./quote.schemas";
