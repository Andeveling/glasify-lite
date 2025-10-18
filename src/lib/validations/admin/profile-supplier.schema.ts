/**
 * Profile Supplier Validation Schemas
 *
 * Zod schemas for ProfileSupplier entity CRUD operations
 *
 * Entity: ProfileSupplier (window/door profile manufacturers)
 * Material types: PVC, ALUMINUM, WOOD, MIXED
 */

import { z } from 'zod';
import {
  activeFilterSchema,
  longText,
  optionalSpanishText,
  paginationSchema,
  searchQuerySchema,
  sortOrderSchema,
  spanishText,
} from '../shared.schema';

/**
 * Constants
 */
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 100;

/**
 * Material Type Enum
 * Matches Prisma enum MaterialType
 */
export const materialTypeEnum = z.enum(['PVC', 'ALUMINUM', 'WOOD', 'MIXED']);

export type MaterialType = z.infer<typeof materialTypeEnum>;

/**
 * Base ProfileSupplier Schema
 * Shared fields for create/update operations
 */
const baseProfileSupplierSchema = z.object({
  isActive: z.boolean().default(true).describe('Whether this supplier is active for selection'),

  materialType: materialTypeEnum.describe('Type of material the supplier provides'),
  name: spanishText
    .min(MIN_NAME_LENGTH, `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`)
    .max(MAX_NAME_LENGTH, `El nombre no puede exceder ${MAX_NAME_LENGTH} caracteres`)
    .describe('Supplier name (e.g., Rehau, Deceuninck, Azembla)'),

  notes: optionalSpanishText.pipe(longText).describe('Additional notes about the supplier'),
});

/**
 * Create ProfileSupplier Input Schema
 * Used for POST /api/trpc/admin/profile-supplier.create
 */
export const createProfileSupplierSchema = baseProfileSupplierSchema;

export type CreateProfileSupplierInput = z.infer<typeof createProfileSupplierSchema>;

/**
 * Update ProfileSupplier Input Schema
 * Used for PUT /api/trpc/admin/profile-supplier.update
 */
export const updateProfileSupplierSchema = z.object({
  data: baseProfileSupplierSchema.partial(),
  id: z.string().cuid('ID inválido'),
});

export type UpdateProfileSupplierInput = z.infer<typeof updateProfileSupplierSchema>;

/**
 * List ProfileSuppliers Query Schema
 * Used for GET /api/trpc/admin/profile-supplier.list
 *
 * Supports:
 * - Pagination (page, limit)
 * - Search (name)
 * - Filtering (materialType, isActive)
 * - Sorting (name, materialType, createdAt)
 */
export const listProfileSuppliersSchema = z.object({
  // Pagination
  ...paginationSchema.shape,
  isActive: activeFilterSchema.optional().describe('Filter by active status'),

  // Filters
  materialType: materialTypeEnum.optional().describe('Filter by material type'),

  // Search
  search: searchQuerySchema.optional().describe('Search by supplier name'),

  // Sorting
  sortBy: z.enum(['name', 'materialType', 'createdAt']).default('name'),
  sortOrder: sortOrderSchema,
});

export type ListProfileSuppliersInput = z.infer<typeof listProfileSuppliersSchema>;

/**
 * Get ProfileSupplier by ID Schema
 * Used for GET /api/trpc/admin/profile-supplier.getById
 */
export const getProfileSupplierByIdSchema = z.object({
  id: z.string().cuid('ID inválido'),
});

export type GetProfileSupplierByIdInput = z.infer<typeof getProfileSupplierByIdSchema>;

/**
 * Delete ProfileSupplier Schema
 * Used for DELETE /api/trpc/admin/profile-supplier.delete
 */
export const deleteProfileSupplierSchema = z.object({
  id: z.string().cuid('ID inválido'),
});

export type DeleteProfileSupplierInput = z.infer<typeof deleteProfileSupplierSchema>;

/**
 * ProfileSupplier Output Schema
 * Used for response validation
 */
export const profileSupplierSchema = z
  .object({
    createdAt: z.date(),
    id: z.string().cuid(),
    isActive: z.boolean(),
    materialType: materialTypeEnum,
    name: z.string(),
    notes: z.string().nullable(),
    updatedAt: z.date(),
  })
  .passthrough(); // Allow Prisma's _count field

export type ProfileSupplierOutput = z.infer<typeof profileSupplierSchema>;

/**
 * List ProfileSuppliers Output Schema
 */
export const listProfileSuppliersOutputSchema = z.object({
  items: z.array(profileSupplierSchema),
  limit: z.number().int().positive(),
  page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type ListProfileSuppliersOutput = z.infer<typeof listProfileSuppliersOutputSchema>;
