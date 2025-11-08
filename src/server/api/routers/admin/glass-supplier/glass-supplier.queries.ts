/**
 * Glass Supplier Queries - Read-Only tRPC Procedures
 *
 * Admin-only tRPC procedures for retrieving glass supplier data.
 *
 * @module server/api/routers/admin/glass-supplier/glass-supplier.queries
 */
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  checkUsageInput,
  getByIdInput,
  getListInput,
  glassSupplierListOutput,
  glassSupplierWithUsageOutput,
  usageCheckOutput,
} from "./glass-supplier.schemas";
import {
  checkGlassSupplierUsage,
  getGlassSupplierById,
  getGlassSuppliersList,
} from "./glass-supplier.service";

export const glassSupplierQueries = createTRPCRouter({
  /**
   * List glass suppliers with pagination and filters
   *
   * @procedure list
   * @access Admin only
   * @input GetListInput - Pagination, filters, sorting
   * @output GlassSupplierListOutput - Paginated glass suppliers with usage
   */
  list: adminProcedure
    .input(getListInput)
    .output(glassSupplierListOutput)
    .query(async ({ ctx, input }) =>
      getGlassSuppliersList(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Get single glass supplier by ID with usage statistics
   *
   * @procedure getById
   * @access Admin only
   * @input GetByIdInput - Glass supplier ID
   * @output GlassSupplierWithUsageOutput - Glass supplier with glass type count
   */
  getById: adminProcedure
    .input(getByIdInput)
    .output(glassSupplierWithUsageOutput)
    .query(async ({ ctx, input }) =>
      getGlassSupplierById(ctx.db, ctx.session.user.id, input.id)
    ),

  /**
   * Check glass supplier usage in glass types
   *
   * @procedure checkUsage
   * @access Admin only
   * @input CheckUsageInput - Glass supplier ID
   * @output UsageCheckOutput - Usage statistics with deletion eligibility
   */
  checkUsage: adminProcedure
    .input(checkUsageInput)
    .output(usageCheckOutput)
    .query(async ({ ctx, input }) =>
      checkGlassSupplierUsage(ctx.db, ctx.session.user.id, input.id)
    ),
});
