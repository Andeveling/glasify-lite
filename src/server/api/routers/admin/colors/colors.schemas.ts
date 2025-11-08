/**
 * Colors Schemas - Zod Validation
 *
 * Input/output schemas for tRPC procedures.
 * Re-exports from Drizzle schema with procedure-specific extensions.
 *
 * @module server/api/routers/admin/colors/colors.schemas
 */
import { z } from "zod";
import {
  colorInsertSchema,
  colorSelectSchema,
  colorUpdateSchema,
} from "@/server/db/schemas/color.schema";

// ============================================================================
// RE-EXPORT DATABASE SCHEMAS
// ============================================================================

export const ColorSelectSchema = colorSelectSchema;
export const ColorInsertSchema = colorInsertSchema;
export const ColorUpdateSchema = colorUpdateSchema;

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

/**
 * Get single color by ID
 */
export const getByIdInput = z.object({
  id: z.uuid("ID debe ser un UUID válido"),
});

/**
 * List colors with pagination and filters
 */
export const getListInput = z.object({
  page: z.number().int().positive().default(DEFAULT_PAGE),
  limit: z.number().int().positive().max(MAX_LIMIT).default(DEFAULT_LIMIT),
  search: z.string().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(["name", "createdAt"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

/**
 * Create new color (uses drizzle-zod insert schema)
 */
export const createInput = ColorInsertSchema;

/**
 * Update existing color
 */
export const updateInput = ColorUpdateSchema.extend({
  id: z.string().uuid("ID debe ser un UUID válido"),
});

/**
 * Delete color
 */
export const deleteInput = z.object({
  id: z.string().uuid("ID debe ser un UUID válido"),
});

/**
 * Check color usage statistics
 */
export const checkUsageInput = z.object({
  id: z.string().uuid("ID debe ser un UUID válido"),
});

// ============================================================================
// OUTPUT SCHEMAS
// ============================================================================

/**
 * Single color output (basic fields)
 */
export const colorOutput = ColorSelectSchema.extend({
  ralCode: ColorSelectSchema.shape.ralCode.nullable(), // Accept null from Drizzle
});

/**
 * Color output with usage statistics
 */
export const colorWithUsageOutput = colorOutput.extend({
  modelCount: z.number().int().nonnegative(),
  quoteItemCount: z.number().int().nonnegative(),
});

/**
 * Color output with related models (for detail view)
 */
export const colorDetailOutput = colorOutput.extend({
  modelCount: z.number().int().nonnegative(),
  quoteItemCount: z.number().int().nonnegative(),
  relatedModels: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      surchargePercentage: z.number(),
      isDefault: z.boolean(),
    })
  ),
});

/**
 * Paginated color list output
 */
export const colorListOutput = z.object({
  items: z.array(colorWithUsageOutput),
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
  quoteItemCount: z.number().int().nonnegative(),
  canDelete: z.boolean(),
  canHardDelete: z.boolean(),
});

/**
 * Delete operation result
 */
export const deleteResultOutput = z.discriminatedUnion("action", [
  z.object({
    success: z.literal(true),
    action: z.literal("soft_delete"),
    message: z.string(),
    color: colorOutput,
  }),
  z.object({
    success: z.literal(true),
    action: z.literal("hard_delete"),
    message: z.string(),
    color: z.null(),
  }),
]);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type GetByIdInput = z.infer<typeof getByIdInput>;
export type GetListInput = z.infer<typeof getListInput>;
export type CreateInput = z.infer<typeof createInput>;
export type UpdateInput = z.infer<typeof updateInput>;
export type DeleteInput = z.infer<typeof deleteInput>;
export type CheckUsageInput = z.infer<typeof checkUsageInput>;

export type ColorOutput = z.infer<typeof colorOutput>;
export type ColorWithUsageOutput = z.infer<typeof colorWithUsageOutput>;
export type ColorDetailOutput = z.infer<typeof colorDetailOutput>;
export type ColorListOutput = z.infer<typeof colorListOutput>;
export type UsageCheckOutput = z.infer<typeof usageCheckOutput>;
export type DeleteResultOutput = z.infer<typeof deleteResultOutput>;
