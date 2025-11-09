/**
 * Model Schemas - Zod Validation (tRPC Input/Output)
 *
 * Extends drizzle-zod auto-generated schemas from DB layer.
 * Single source of truth: Drizzle table → auto-sync validation
 *
 * @module server/api/routers/admin/model/model.schemas
 */

import { z } from "zod";
import {
  modelInsertSchema,
  modelSelectSchema,
  modelUpdateSchema,
} from "@/server/db/schemas/model.schema";
import {
  modelCostBreakdownInsertSchema,
  modelCostBreakdownSelectSchema,
  modelCostBreakdownUpdateSchema,
} from "@/server/db/schemas/model-cost-breakdown.schema";

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_PAGE_LIMIT = 100;
const DEFAULT_PAGE_LIMIT = 10;

// ============================================================================
// INPUT SCHEMAS (tRPC procedures)
// ============================================================================

/**
 * List models input schema
 */
export const listModelsInput = z.object({
  page: z.number().int().positive().default(1),
  limit: z
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_LIMIT)
    .default(DEFAULT_PAGE_LIMIT),
  search: z.string().optional(),
  status: z.enum(["all", "draft", "published"]).default("all"),
  profileSupplierId: z.string().uuid().optional(),
  sortBy: z
    .enum(["name", "basePrice", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Get model by ID input schema
 */
export const getModelByIdInput = z.object({
  id: z.string().uuid(),
});

/**
 * Create model input schema - reuse from Drizzle insert schema
 */
export const createModelInput = modelInsertSchema.pick({
  name: true,
  profileSupplierId: true,
  basePrice: true,
  costPerMmWidth: true,
  costPerMmHeight: true,
  compatibleGlassTypeIds: true,
  status: true,
  minWidthMm: true,
  maxWidthMm: true,
  minHeightMm: true,
  maxHeightMm: true,
});

/**
 * Update model input schema - reuse from Drizzle update schema
 */
export const updateModelInput = z.object({
  id: z.string().uuid(),
  data: modelUpdateSchema,
});

/**
 * Delete model input schema
 */
export const deleteModelInput = z.object({
  id: z.string().uuid(),
});

/**
 * Add cost breakdown input schema - reuse from Drizzle insert schema
 */
export const addCostBreakdownInput = modelCostBreakdownInsertSchema.pick({
  modelId: true,
  component: true,
  costType: true,
  unitCost: true,
});

/**
 * Update cost breakdown input schema
 */
export const updateCostBreakdownInput = z.object({
  id: z.string().uuid(),
  data: modelCostBreakdownUpdateSchema,
});

/**
 * Delete cost breakdown input schema
 */
export const deleteCostBreakdownInput = z.object({
  id: z.string().uuid(),
});

// ============================================================================
// OUTPUT SCHEMAS (tRPC procedures response types)
// ============================================================================

/**
 * Model output schema - extends drizzle-zod auto-generated SELECT schema
 * Adds relation fields
 */
export const modelOutput = modelSelectSchema.extend({
  profileSupplier: z
    .object({
      id: z.string(),
      name: z.string(),
      materialType: z.string(),
    })
    .nullable(),
});

/**
 * Model detail output schema (with cost breakdowns and price history)
 */
export const modelDetailOutput = modelOutput.extend({
  costBreakdowns: z.array(
    modelCostBreakdownSelectSchema.extend({
      unitCost: z.number(),
    })
  ),
  priceHistory: z.array(
    z.object({
      id: z.string(),
      modelId: z.string(),
      basePrice: z.number(),
      costPerMmWidth: z.number(),
      costPerMmHeight: z.number(),
      reason: z.string().nullable(),
      effectiveFrom: z.date(),
      createdBy: z.string().nullable(),
      createdAt: z.date(),
    })
  ),
});

/**
 * Cost breakdown output schema
 */
export const costBreakdownOutput = modelCostBreakdownSelectSchema.extend({
  unitCost: z.number(),
});

/**
 * List models output schema
 */
export const listModelsOutput = z.object({
  items: z.array(modelOutput),
  total: z.number().int(),
  totalPages: z.number().int(),
});

/**
 * Delete success output schema
 */
export const deleteSuccessOutput = z.object({
  success: z.literal(true),
});

// ============================================================================
// TYPE EXPORTS (for TypeScript)
// ============================================================================

export type ListModelsInput = z.infer<typeof listModelsInput>;
export type GetModelByIdInput = z.infer<typeof getModelByIdInput>;
export type CreateModelInput = z.infer<typeof createModelInput>;
export type UpdateModelInput = z.infer<typeof updateModelInput>;
export type DeleteModelInput = z.infer<typeof deleteModelInput>;
export type AddCostBreakdownInput = z.infer<typeof addCostBreakdownInput>;
export type UpdateCostBreakdownInput = z.infer<typeof updateCostBreakdownInput>;
export type DeleteCostBreakdownInput = z.infer<typeof deleteCostBreakdownInput>;

export type ModelOutput = z.infer<typeof modelOutput>;
export type ModelDetailOutput = z.infer<typeof modelDetailOutput>;
export type ListModelsOutput = z.infer<typeof listModelsOutput>;
export type CostBreakdownOutput = z.infer<typeof costBreakdownOutput>;
