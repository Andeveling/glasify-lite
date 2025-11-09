/**
 * Glass Solution Queries - Read-Only tRPC Procedures
 *
 * Admin-only tRPC procedures for retrieving glass solution data.
 * Thin wrapper around service layer functions.
 *
 * @module server/api/routers/admin/glass-solution/glass-solution.queries
 */
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  listInputSchema,
  listOutputSchema,
  readByIdInputSchema,
  readByIdOutputSchema,
} from "./glass-solution.schemas";
import {
  getGlassSolutionByIdService,
  listGlassSolutionsService,
} from "./glass-solution.service";

/**
 * Glass Solution Queries Router
 *
 * Read-only procedures (no mutations)
 * All procedures require admin authentication
 */
export const glassSolutionQueries = createTRPCRouter({
  /**
   * List glass solutions with pagination, search, and filters
   *
   * @procedure list
   * @access Admin only
   * @input ListInput - Pagination (page, limit), search, isActive filter
   * @output ListOutput - Paginated glass solutions
   */
  list: adminProcedure
    .input(listInputSchema)
    .output(listOutputSchema)
    .query(async ({ ctx, input }) =>
      listGlassSolutionsService(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Get glass solution by ID
   *
   * @procedure getById
   * @access Admin only
   * @input ReadByIdInput - Glass solution ID
   * @output ReadByIdOutput - Glass solution or null if not found
   */
  "get-by-id": adminProcedure
    .input(readByIdInputSchema)
    .output(readByIdOutputSchema)
    .query(async ({ ctx, input }) =>
      getGlassSolutionByIdService(ctx.db, ctx.session.user.id, input)
    ),
});
