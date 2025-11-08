/**
 * Colors Queries - Read Operations
 *
 * Admin-only tRPC procedures for retrieving color data.
 *
 * @module server/api/routers/admin/colors/colors.queries
 */
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  checkUsageInput,
  colorDetailOutput,
  colorListOutput,
  colorWithUsageOutput,
  getByIdInput,
  getListInput,
  usageCheckOutput,
} from "./colors.schemas";
import {
  checkColorUsage,
  getColorById,
  getColorDetail,
  getColorsList,
} from "./colors.service";

export const colorsQueries = createTRPCRouter({
  /**
   * List colors with optional filtering and pagination
   * Returns paginated colors with usage statistics
   */
  list: adminProcedure
    .input(getListInput)
    .output(colorListOutput)
    .query(async ({ ctx, input }) =>
      getColorsList(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Get single color by ID with usage statistics
   */
  getById: adminProcedure
    .input(getByIdInput)
    .output(colorWithUsageOutput)
    .query(async ({ ctx, input }) =>
      getColorById(ctx.db, ctx.session.user.id, input.id)
    ),

  /**
   * Get color detail with related models
   */
  getDetail: adminProcedure
    .input(getByIdInput)
    .output(colorDetailOutput)
    .query(async ({ ctx, input }) =>
      getColorDetail(ctx.db, ctx.session.user.id, input.id)
    ),

  /**
   * Check color usage statistics
   * Used to determine deletion strategy before attempting delete
   */
  checkUsage: adminProcedure
    .input(checkUsageInput)
    .output(usageCheckOutput)
    .query(async ({ ctx, input }) =>
      checkColorUsage(ctx.db, ctx.session.user.id, input.id)
    ),
});
