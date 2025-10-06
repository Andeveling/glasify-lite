// src/server/api/routers/catalog/catalog.schemas.ts
import { z } from 'zod';

// Constants
export const DEFAULT_PAGE_LIMIT = 20;
export const MIN_PAGE_LIMIT = 1;
export const MAX_PAGE_LIMIT = 100;

// ========================================
// INPUT SCHEMAS
// ========================================

export const listModelsInput = z.object({
  limit: z.number().min(MIN_PAGE_LIMIT).max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
  manufacturerId: z.cuid('ID del fabricante debe ser válido').optional(),
  page: z.number().min(1).default(1),
  search: z.string().optional(),
  sort: z.enum([ 'name-asc', 'name-desc', 'price-asc', 'price-desc' ]).default('name-asc'),
});

export const getModelByIdInput = z.object({
  modelId: z.cuid('ID del modelo debe ser válido'),
});

export const listServicesInput = z.object({
  manufacturerId: z.cuid('ID del fabricante debe ser válido'),
});

// ========================================
// OUTPUT SCHEMAS
// ========================================

export const manufacturerOutput = z.object({
  currency: z.string(),
  id: z.string(),
  name: z.string(),
  quoteValidityDays: z.number(),
});

export const modelSummaryOutput = z.object({
  accessoryPrice: z.number().nullable(),
  basePrice: z.number(),
  compatibleGlassTypeIds: z.array(z.string()),
  costPerMmHeight: z.number(),
  costPerMmWidth: z.number(),
  createdAt: z.date(),
  id: z.string(),
  manufacturer: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  maxHeightMm: z.number(),
  maxWidthMm: z.number(),
  minHeightMm: z.number(),
  minWidthMm: z.number(),
  name: z.string(),
  status: z.enum([ 'draft', 'published' ]),
  updatedAt: z.date(),
});

export const listModelsOutput = z.object({
  items: z.array(modelSummaryOutput),
  total: z.number(),
});

export const modelDetailOutput = z.object({
  accessoryPrice: z.number().nullable(),
  basePrice: z.number(),
  compatibleGlassTypeIds: z.array(z.string()),
  costPerMmHeight: z.number(),
  costPerMmWidth: z.number(),
  createdAt: z.date(),
  id: z.string(),
  manufacturer: z
    .object({
      currency: z.string(),
      id: z.string(),
      name: z.string(),
      quoteValidityDays: z.number(),
    })
    .nullable(),
  maxHeightMm: z.number(),
  maxWidthMm: z.number(),
  minHeightMm: z.number(),
  minWidthMm: z.number(),
  name: z.string(),
  status: z.enum([ 'draft', 'published' ]),
  updatedAt: z.date(),
});

export const serviceOutput = z.object({
  createdAt: z.date(),
  id: z.string(),
  manufacturerId: z.string(),
  name: z.string(),
  rate: z.number(),
  type: z.enum([ 'area', 'perimeter', 'fixed' ]),
  unit: z.enum([ 'unit', 'sqm', 'ml' ]),
  updatedAt: z.date(),
});

export const listServicesOutput = z.array(serviceOutput);

// ========================================
// TYPE EXPORTS (para reutilizar en forms)
// ========================================

export type ListModelsInput = z.infer<typeof listModelsInput>;
export type GetModelByIdInput = z.infer<typeof getModelByIdInput>;
export type ListServicesInput = z.infer<typeof listServicesInput>;
export type ModelSummaryOutput = z.infer<typeof modelSummaryOutput>;
export type ModelDetailOutput = z.infer<typeof modelDetailOutput>;
export type ServiceOutput = z.infer<typeof serviceOutput>;
export type ListServicesOutput = z.infer<typeof listServicesOutput>;
