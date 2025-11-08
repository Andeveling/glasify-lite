/**
 * Profile Supplier Schemas - Zod Validation
 *
 * Input/output schemas for tRPC procedures.
 * Re-exports from Drizzle schema with procedure-specific extensions.
 *
 * @module server/api/routers/admin/profile-supplier/profile-supplier.schemas
 */
import { z } from "zod";
import {
  profileSupplierInsertSchema,
  profileSupplierSelectSchema,
  profileSupplierUpdateSchema,
} from "@/server/db/schemas/profile-supplier.schema";

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// ============================================================================
// RE-EXPORT DATABASE SCHEMAS
// ============================================================================

export const ProfileSupplierSelectSchema = profileSupplierSelectSchema;
export const ProfileSupplierInsertSchema = profileSupplierInsertSchema;
export const ProfileSupplierUpdateSchema = profileSupplierUpdateSchema;

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

/**
 * Get single profile supplier by ID
 */
export const getByIdInput = z.object({
  id: z.string().uuid("ID debe ser un UUID válido"),
});

/**
 * List profile suppliers with pagination and filters
 */
export const getListInput = z.object({
  page: z.number().int().positive().default(DEFAULT_PAGE),
  limit: z.number().int().positive().max(MAX_LIMIT).default(DEFAULT_LIMIT),
  search: z.string().optional(),
  materialType: z.enum(["ALUMINIO", "PVC"]).optional(),
  isActive: z.enum(["all", "active", "inactive"]).default("all"),
  sortBy: z.enum(["name", "materialType", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

/**
 * Create new profile supplier
 */
export const createInput = ProfileSupplierInsertSchema;

/**
 * Update existing profile supplier
 */
export const updateInput = ProfileSupplierUpdateSchema.extend({
  id: z.uuid("ID debe ser un UUID válido"),
});

/**
 * Delete profile supplier
 */
export const deleteInput = z.object({
  id: z.uuid("ID debe ser un UUID válido"),
});

/**
 * Check usage statistics
 */
export const checkUsageInput = z.object({
  id: z.uuid("ID debe ser un UUID válido"),
});

// ============================================================================
// OUTPUT SCHEMAS
// ============================================================================

/**
 * Single profile supplier output
 */
export const profileSupplierOutput = ProfileSupplierSelectSchema.extend({
  notes: ProfileSupplierSelectSchema.shape.notes.nullable(),
});

/**
 * Profile supplier with usage statistics
 */
export const profileSupplierWithUsageOutput = profileSupplierOutput.extend({
  modelCount: z.number().int().nonnegative(),
});

/**
 * Paginated profile supplier list output
 */
export const profileSupplierListOutput = z.object({
  items: z.array(profileSupplierWithUsageOutput),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Usage check output
 */
export const usageCheckOutput = z.object({
  modelCount: z.number().int().nonnegative(),
  canDelete: z.boolean(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type GetByIdInput = z.infer<typeof getByIdInput>;
export type GetListInput = z.infer<typeof getListInput>;
export type CreateInput = z.infer<typeof createInput>;
export type UpdateInput = z.infer<typeof updateInput>;
export type DeleteInput = z.infer<typeof deleteInput>;
export type CheckUsageInput = z.infer<typeof checkUsageInput>;

export type ProfileSupplierOutput = z.infer<typeof profileSupplierOutput>;
export type ProfileSupplierWithUsageOutput = z.infer<
  typeof profileSupplierWithUsageOutput
>;
export type ProfileSupplierListOutput = z.infer<
  typeof profileSupplierListOutput
>;
export type UsageCheckOutput = z.infer<typeof usageCheckOutput>;
