/**
 * Glass Supplier Schemas - Zod Validation
 *
 * Input/output schemas for tRPC procedures.
 * Re-exports from Drizzle schema with procedure-specific extensions.
 *
 * @module server/api/routers/admin/glass-supplier/glass-supplier.schemas
 */
import { z } from "zod";
import {
  glassSupplierInsertSchema,
  glassSupplierSelectSchema,
  glassSupplierUpdateSchema,
} from "@/server/db/schemas/glass-supplier.schema";

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// ============================================================================
// RE-EXPORT DATABASE SCHEMAS
// ============================================================================

export const GlassSupplierSelectSchema = glassSupplierSelectSchema;
export const GlassSupplierInsertSchema = glassSupplierInsertSchema;
export const GlassSupplierUpdateSchema = glassSupplierUpdateSchema;

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

/**
 * Get single glass supplier by ID
 */
export const getByIdInput = z.object({
  id: z.uuid("ID debe ser un UUID válido"),
});

/**
 * List glass suppliers with pagination and filters
 */
export const getListInput = z.object({
  page: z.number().int().positive().default(DEFAULT_PAGE),
  limit: z.number().int().positive().max(MAX_LIMIT).default(DEFAULT_LIMIT),
  search: z.string().optional(),
  country: z.string().optional(),
  isActive: z.enum(["all", "active", "inactive"]).default("all"),
  sortBy: z.enum(["name", "code", "country", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

/**
 * Create new glass supplier
 */
export const createInput = GlassSupplierInsertSchema;

/**
 * Update existing glass supplier
 */
export const updateInput = GlassSupplierUpdateSchema.extend({
  id: z.uuid("ID debe ser un UUID válido"),
});

/**
 * Delete glass supplier
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
 * Single glass supplier output
 */
export const glassSupplierOutput = GlassSupplierSelectSchema.extend({
  notes: GlassSupplierSelectSchema.shape.notes.nullable(),
});

/**
 * Glass supplier with usage statistics
 */
export const glassSupplierWithUsageOutput = glassSupplierOutput.extend({
  glassTypeCount: z.number().int().nonnegative(),
});

/**
 * Paginated glass supplier list output
 */
export const glassSupplierListOutput = z.object({
  items: z.array(glassSupplierWithUsageOutput),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

/**
 * Usage check output
 */
export const usageCheckOutput = z.object({
  glassTypeCount: z.number().int().nonnegative(),
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
export type GlassSupplierOutput = z.infer<typeof glassSupplierOutput>;
export type GlassSupplierWithUsageOutput = z.infer<
  typeof glassSupplierWithUsageOutput
>;
export type GlassSupplierListOutput = z.infer<typeof glassSupplierListOutput>;
export type UsageCheckOutput = z.infer<typeof usageCheckOutput>;
