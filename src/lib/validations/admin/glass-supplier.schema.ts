/**
 * Glass Supplier Validation Schemas
 *
 * Zod schemas for GlassSupplier entity CRUD operations
 *
 * Entity: GlassSupplier (glass manufacturers)
 * Fields: name, code, country, website, contactEmail, contactPhone, isActive, notes
 */

import { z } from "zod";
import {
  activeFilterSchema,
  longText,
  optionalSpanishText,
  paginationSchema,
  searchQuerySchema,
  sortOrderSchema,
  spanishText,
} from "../shared.schema";

/**
 * Constants
 */
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 100;
export const MIN_CODE_LENGTH = 2;
export const MAX_CODE_LENGTH = 10;
export const MIN_COUNTRY_LENGTH = 2;
export const MAX_COUNTRY_LENGTH = 100;
export const MIN_PHONE_LENGTH = 7;
export const MAX_PHONE_LENGTH = 20;

/**
 * Email validation (optional, but valid when provided)
 */
const emailSchema = z.string().email("El email no es válido").optional();

/**
 * URL validation (optional, but valid when provided)
 */
const urlSchema = z
  .string()
  .url("La URL no es válida")
  .refine((url) => url.startsWith("http://") || url.startsWith("https://"), {
    message: "La URL debe comenzar con http:// o https://",
  })
  .optional();

/**
 * Phone validation (optional, flexible format)
 */
const phoneSchema = z
  .string()
  .min(
    MIN_PHONE_LENGTH,
    `El teléfono debe tener al menos ${MIN_PHONE_LENGTH} caracteres`
  )
  .max(
    MAX_PHONE_LENGTH,
    `El teléfono no puede exceder ${MAX_PHONE_LENGTH} caracteres`
  )
  .optional();

/**
 * Base GlassSupplier Schema
 * Shared fields for create/update operations
 */
const baseGlassSupplierSchema = z.object({
  code: z
    .string()
    .min(
      MIN_CODE_LENGTH,
      `El código debe tener al menos ${MIN_CODE_LENGTH} caracteres`
    )
    .max(
      MAX_CODE_LENGTH,
      `El código no puede exceder ${MAX_CODE_LENGTH} caracteres`
    )
    .regex(
      /^[A-Z0-9_-]+$/,
      "El código solo puede contener letras mayúsculas, números, guiones y guiones bajos"
    )
    .optional()
    .describe("Short code for the supplier (e.g., GRD, SGB, PLK)"),

  contactEmail: emailSchema.describe("Contact email for orders/inquiries"),

  contactPhone: phoneSchema.describe("Contact phone number"),

  country: z
    .string()
    .min(
      MIN_COUNTRY_LENGTH,
      `El país debe tener al menos ${MIN_COUNTRY_LENGTH} caracteres`
    )
    .max(
      MAX_COUNTRY_LENGTH,
      `El país no puede exceder ${MAX_COUNTRY_LENGTH} caracteres`
    )
    .optional()
    .describe("Country where the supplier is based"),

  isActive: z
    .boolean()
    .default(true)
    .describe("Whether this supplier is active for selection"),

  name: spanishText
    .min(
      MIN_NAME_LENGTH,
      `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`
    )
    .max(
      MAX_NAME_LENGTH,
      `El nombre no puede exceder ${MAX_NAME_LENGTH} caracteres`
    )
    .describe("Supplier name (e.g., Guardian, Saint-Gobain, Pilkington)"),

  notes: optionalSpanishText
    .pipe(longText)
    .describe("Additional notes about the supplier"),

  website: urlSchema.describe("Official website URL"),
});

/**
 * Create Glass Supplier Schema
 * All fields required or with defaults
 */
export const createGlassSupplierSchema = baseGlassSupplierSchema;

export type CreateGlassSupplierInput = z.infer<
  typeof createGlassSupplierSchema
>;

/**
 * Update Glass Supplier Schema
 * Wraps partial data with id
 */
export const updateGlassSupplierSchema = z.object({
  data: baseGlassSupplierSchema.partial(),
  id: z.string().cuid("ID de proveedor inválido"),
});

export type UpdateGlassSupplierInput = z.infer<
  typeof updateGlassSupplierSchema
>;

/**
 * List Glass Suppliers Schema
 * Pagination + search + filters + sorting
 */
export const listGlassSuppliersSchema = paginationSchema.extend({
  country: z.string().optional().describe("Filter by country"),
  isActive: activeFilterSchema.optional().describe("Filter by active status"),
  search: searchQuerySchema.describe("Search by name, code, or country"),
  sortBy: z
    .enum(["name", "code", "country", "createdAt"])
    .default("name")
    .describe("Sort field"),
  sortOrder: sortOrderSchema.describe("Sort order"),
});

export type ListGlassSuppliersInput = z.infer<typeof listGlassSuppliersSchema>;

/**
 * List Glass Suppliers Output Schema
 * Defines the shape of paginated glass supplier list responses
 */
export const listGlassSuppliersOutputSchema = z.object({
  items: z.array(
    z.object({
      code: z.string().nullable(),
      contactEmail: z.string().nullable(),
      contactPhone: z.string().nullable(),
      country: z.string().nullable(),
      createdAt: z.date(),
      id: z.string(),
      isActive: z.boolean(),
      name: z.string(),
      notes: z.string().nullable(),
      updatedAt: z.date(),
      website: z.string().nullable(),
    })
  ),
  limit: z.number().int().positive(),
  page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type GlassSupplierListOutput = z.infer<
  typeof listGlassSuppliersOutputSchema
>;

/**
 * Delete Glass Supplier Schema
 */
export const deleteGlassSupplierSchema = z.object({
  id: z.string().cuid("ID de proveedor inválido"),
});

export type DeleteGlassSupplierInput = z.infer<
  typeof deleteGlassSupplierSchema
>;

/**
 * Get Glass Supplier by ID Schema
 */
export const getGlassSupplierByIdSchema = z.object({
  id: z.string().cuid("ID de proveedor inválido"),
});

export type GetGlassSupplierByIdInput = z.infer<
  typeof getGlassSupplierByIdSchema
>;
