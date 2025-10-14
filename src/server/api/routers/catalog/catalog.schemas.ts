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
  // Services are now global, no longer tied to a specific manufacturer
});

export const listGlassTypesInput = z.object({
  glassTypeIds: z.array(z.cuid('ID del tipo de vidrio debe ser válido')),
});

export const listGlassSolutionsInput = z
  .object({
    modelId: z.cuid('ID del modelo debe ser válido').optional(),
  })
  .optional();

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
  maxHeightMm: z.number(),
  maxWidthMm: z.number(),
  minHeightMm: z.number(),
  minWidthMm: z.number(),
  name: z.string(),
  profileSupplier: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
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
  maxHeightMm: z.number(),
  maxWidthMm: z.number(),
  minHeightMm: z.number(),
  minWidthMm: z.number(),
  name: z.string(),
  profileSupplier: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  status: z.enum([ 'draft', 'published' ]),
  updatedAt: z.date(),
});

export const serviceOutput = z.object({
  createdAt: z.date(),
  id: z.string(),
  name: z.string(),
  rate: z.number(),
  type: z.enum([ 'area', 'perimeter', 'fixed' ]),
  unit: z.enum([ 'unit', 'sqm', 'ml' ]),
  updatedAt: z.date(),
});

export const listServicesOutput = z.array(serviceOutput);

// ========================================
// GLASS SOLUTIONS SCHEMAS
// ========================================

export const performanceRating = z.enum([ 'basic', 'standard', 'good', 'very_good', 'excellent' ]);

export const glassSolutionOutput = z.object({
  createdAt: z.date(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  id: z.string(),
  isActive: z.boolean(),
  key: z.string(),
  name: z.string(),
  nameEs: z.string(),
  sortOrder: z.number(),
  updatedAt: z.date(),
});

export const glassTypeSolutionOutput = z.object({
  createdAt: z.date(),
  glassTypeId: z.string(),
  id: z.string(),
  isPrimary: z.boolean(),
  notes: z.string().nullable(),
  performanceRating,
  solution: glassSolutionOutput,
  solutionId: z.string(),
  updatedAt: z.date(),
});

export const listGlassSolutionsOutput = z.array(glassSolutionOutput);

export const glassTypeOutput = z.object({
  createdAt: z.date(),
  description: z.string().nullable().optional(), // REFACTOR: New field
  glassSupplierId: z.string().nullable().optional(), // REFACTOR: New supplier reference
  id: z.string(),
  isActive: z.boolean().optional(), // REFACTOR: New field
  isLaminated: z.boolean(),
  isLowE: z.boolean(),
  isTempered: z.boolean(),
  isTripleGlazed: z.boolean(),
  name: z.string(),
  pricePerSqm: z.number(),
  purpose: z.enum([ 'general', 'insulation', 'security', 'decorative' ]),
  solutions: z.array(glassTypeSolutionOutput).optional(),
  thicknessMm: z.number(),
  updatedAt: z.date(),
  uValue: z.number().nullable(),
});

export const listGlassTypesOutput = z.array(glassTypeOutput);

// ========================================
// TYPE EXPORTS (para reutilizar en forms)
// ========================================

export type ListModelsInput = z.infer<typeof listModelsInput>;
export type GetModelByIdInput = z.infer<typeof getModelByIdInput>;
export type ListServicesInput = z.infer<typeof listServicesInput>;
export type ListGlassTypesInput = z.infer<typeof listGlassTypesInput>;
export type ModelSummaryOutput = z.infer<typeof modelSummaryOutput>;
export type ModelDetailOutput = z.infer<typeof modelDetailOutput>;
export type ServiceOutput = z.infer<typeof serviceOutput>;
export type ListServicesOutput = z.infer<typeof listServicesOutput>;
export type PerformanceRating = z.infer<typeof performanceRating>;
export type GlassSolutionOutput = z.infer<typeof glassSolutionOutput>;
export type GlassTypeSolutionOutput = z.infer<typeof glassTypeSolutionOutput>;
export type ListGlassSolutionsOutput = z.infer<typeof listGlassSolutionsOutput>;
export type GlassTypeOutput = z.infer<typeof glassTypeOutput>;
export type ListGlassTypesOutput = z.infer<typeof listGlassTypesOutput>;
