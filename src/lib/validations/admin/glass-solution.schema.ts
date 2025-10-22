/**
 * Glass Solution Validation Schemas
 *
 * Zod schemas for validating glass solution CRUD operations in admin panel.
 * Based on GlassSolution entity from prisma/schema.prisma
 *
 * @see specs/011-admin-catalog-management/data-model.md - Section 6
 */

import { z } from 'zod';
import {
  activeFilterSchema,
  longText,
  optionalSpanishText,
  paginationSchema,
  searchQuerySchema,
  sortOrderSchema as sharedSortOrderSchema,
  spanishText,
} from '../shared.schema';

/**
 * Constants
 */
export const MIN_KEY_LENGTH = 2;
export const MAX_KEY_LENGTH = 50;
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 50;
export const MIN_SORT_ORDER = 0;
export const MAX_SORT_ORDER = 100;

/**
 * Validates solution key (snake_case, alphanumeric with underscores)
 * - Required, unique, lowercase
 * - Format: snake_case (e.g., "thermal_insulation", "security", "acoustic_comfort")
 */
const keySchema = z
  .string()
  .min(MIN_KEY_LENGTH, `La clave debe tener al menos ${MIN_KEY_LENGTH} caracteres`)
  .max(MAX_KEY_LENGTH, `La clave no puede exceder ${MAX_KEY_LENGTH} caracteres`)
  .regex(/^[a-z0-9_]+$/, 'La clave debe estar en formato snake_case (solo letras minúsculas, números y guiones bajos)')
  .transform((val) => val.toLowerCase());

/**
 * Validates icon name (Lucide React icon)
 * - Optional
 * - Must be a valid Lucide icon name (PascalCase)
 */
const iconSchema = z
  .string()
  .regex(/^[A-Z][a-zA-Z0-9]*$/, 'El icono debe ser un nombre válido de Lucide React (PascalCase)')
  .optional()
  .nullable();

/**
 * Validates sort order
 * - Default: 0
 * - Range: 0-100 (lower = higher priority)
 */
const sortOrderSchema = z
  .number()
  .int('El orden debe ser un número entero')
  .min(MIN_SORT_ORDER, `El orden debe ser al menos ${MIN_SORT_ORDER}`)
  .max(MAX_SORT_ORDER, `El orden no puede exceder ${MAX_SORT_ORDER}`)
  .default(0);

/**
 * Base Glass Solution Schema
 * Shared fields for create/update operations
 */
const baseGlassSolutionSchema = z.object({
  description: optionalSpanishText.pipe(longText).describe('Description of the solution'),

  icon: iconSchema.describe('Lucide React icon name (e.g., Shield, Snowflake, Volume2)'),

  isActive: z.boolean().default(true).describe('Whether solution is active for assignment'),
  key: keySchema.describe('Unique snake_case key (e.g., thermal_insulation, security)'),

  name: z
    .string()
    .min(MIN_NAME_LENGTH, `El nombre en inglés debe tener al menos ${MIN_NAME_LENGTH} caracteres`)
    .max(MAX_NAME_LENGTH, `El nombre en inglés no puede exceder ${MAX_NAME_LENGTH} caracteres`)
    .describe('Technical name in English (e.g., Thermal Insulation)'),

  nameEs: spanishText
    .min(MIN_NAME_LENGTH, `El nombre en español debe tener al menos ${MIN_NAME_LENGTH} caracteres`)
    .max(MAX_NAME_LENGTH, `El nombre en español no puede exceder ${MAX_NAME_LENGTH} caracteres`)
    .describe('Commercial name in Spanish (e.g., Aislamiento Térmico)'),

  sortOrder: sortOrderSchema.describe('Display order (lower = higher priority)'),
});

/**
 * Create Glass Solution Schema
 * All fields required or with defaults
 */
export const createGlassSolutionSchema = baseGlassSolutionSchema;

export type CreateGlassSolutionInput = z.infer<typeof createGlassSolutionSchema>;

/**
 * Update Glass Solution Schema
 * Wraps partial data with id
 */
export const updateGlassSolutionSchema = z.object({
  data: baseGlassSolutionSchema.partial(),
  id: z.string().cuid('ID de solución inválido'),
});

export type UpdateGlassSolutionInput = z.infer<typeof updateGlassSolutionSchema>;

/**
 * List Glass Solutions Schema
 * Pagination + search + filters + sorting
 */
export const listGlassSolutionsSchema = paginationSchema.extend({
  isActive: activeFilterSchema.optional().describe('Filter by active status'),
  search: searchQuerySchema.describe('Search by key, name, or nameEs'),
  sortBy: z.enum(['key', 'name', 'sortOrder', 'createdAt']).default('sortOrder').describe('Sort field'),
  sortOrder: sharedSortOrderSchema.describe('Sort order'),
});

export type ListGlassSolutionsInput = z.infer<typeof listGlassSolutionsSchema>;

/**
 * List Glass Solutions Output Schema
 * Defines the shape of paginated glass solution list responses
 */
export const listGlassSolutionsOutputSchema = z.object({
  items: z.array(
    z.object({
      // biome-ignore lint/style/useNamingConvention: Prisma generated field
      _count: z.object({
        glassTypes: z.number(),
      }),
      createdAt: z.date(),
      description: z.string().nullable(),
      icon: z.string().nullable(),
      id: z.string(),
      isActive: z.boolean(),
      isSeeded: z.boolean(),
      key: z.string(),
      name: z.string(),
      nameEs: z.string(),
      seedVersion: z.string().nullable(),
      sortOrder: z.number(),
      updatedAt: z.date(),
    })
  ),
  limit: z.number().int().positive(),
  page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type GlassSolutionListOutput = z.infer<typeof listGlassSolutionsOutputSchema>;

/**
 * Delete Glass Solution Schema
 */
export const deleteGlassSolutionSchema = z.object({
  id: z.string().cuid('ID de solución inválido'),
});

export type DeleteGlassSolutionInput = z.infer<typeof deleteGlassSolutionSchema>;

/**
 * Get Glass Solution by ID Schema
 */
export const getGlassSolutionByIdSchema = z.object({
  id: z.string().cuid('ID de solución inválido'),
});

export type GetGlassSolutionByIdInput = z.infer<typeof getGlassSolutionByIdSchema>;
