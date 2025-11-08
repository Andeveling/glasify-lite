/**
 * Profile Supplier Queries - Read-Only tRPC Procedures
 *
 * Admin-only tRPC procedures for retrieving profile supplier data.
 *
 * @module server/api/routers/admin/profile-supplier/profile-supplier.queries
 */
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  checkUsageInput,
  getByIdInput,
  getListInput,
  profileSupplierListOutput,
  profileSupplierWithUsageOutput,
  usageCheckOutput,
} from "./profile-supplier.schemas";
import {
  checkProfileSupplierUsage,
  getProfileSupplierById,
  getProfileSuppliersList,
} from "./profile-supplier.service";

export const profileSupplierQueries = createTRPCRouter({
  /**
   * List profile suppliers with pagination and filters
   *
   * @procedure list
   * @access Admin only
   * @input GetListInput - Pagination, filters, sorting
   * @output ProfileSupplierListOutput - Paginated profile suppliers with usage
   */
  list: adminProcedure
    .input(getListInput)
    .output(profileSupplierListOutput)
    .query(async ({ ctx, input }) =>
      getProfileSuppliersList(ctx.db, ctx.session.user.id, input)
    ),

  /**
   * Get single profile supplier by ID with usage statistics
   *
   * @procedure getById
   * @access Admin only
   * @input GetByIdInput - Profile supplier ID
   * @output ProfileSupplierWithUsageOutput - Profile supplier with model count
   */
  getById: adminProcedure
    .input(getByIdInput)
    .output(profileSupplierWithUsageOutput)
    .query(async ({ ctx, input }) =>
      getProfileSupplierById(ctx.db, ctx.session.user.id, input.id)
    ),

  /**
   * Check profile supplier usage in models
   *
   * @procedure checkUsage
   * @access Admin only
   * @input CheckUsageInput - Profile supplier ID
   * @output UsageCheckOutput - Usage statistics with deletion eligibility
   */
  checkUsage: adminProcedure
    .input(checkUsageInput)
    .output(usageCheckOutput)
    .query(async ({ ctx, input }) =>
      checkProfileSupplierUsage(ctx.db, ctx.session.user.id, input.id)
    ),
});
