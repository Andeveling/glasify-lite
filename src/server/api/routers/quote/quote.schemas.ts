/**
 * Quote Schemas - Zod validation schemas for quote operations
 *
 * These schemas define the contracts for quote-related tRPC procedures.
 * Extends and reuses DB schemas from @/server/db/schemas
 *
 * @module server/api/routers/quote/quote.schemas
 */

import { z } from "zod";
import { QUOTE_FIELD_LENGTHS } from "@/server/db/schemas/constants/quote.constants";
import { QUOTE_STATUS_VALUES } from "@/server/db/schemas/enums.schema";

// ============================================================================
// Constants - tRPC-specific (pagination, business rules)
// ============================================================================

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;
const MAX_CART_ITEMS = 20;

// ============================================================================
// Input Schemas - Queries
// ============================================================================

/**
 * List user quotes input
 *
 * tRPC Query: quote['list-user-quotes']
 */
export const listUserQuotesInput = z.object({
  includeExpired: z.boolean().default(false),
  limit: z
    .number()
    .int()
    .positive()
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
  page: z.number().int().positive().default(1),
  search: z.string().optional(),
  sortBy: z
    .enum(["createdAt", "sentAt", "validUntil", "total"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  status: z.enum(QUOTE_STATUS_VALUES).optional(),
});

export type ListUserQuotesInput = z.infer<typeof listUserQuotesInput>;

/**
 * Get single quote by ID
 *
 * tRPC Query: quote['get-by-id']
 */
export const getQuoteByIdInput = z.object({
  id: z.cuid("ID de cotización debe ser válido"),
});

export type GetQuoteByIdInput = z.infer<typeof getQuoteByIdInput>;

// ============================================================================
// Input Schemas - Mutations
// ============================================================================

/**
 * Project address schema for INPUT (quote generation)
 * All fields are required when creating a new quote
 * Reuses QUOTE_FIELD_LENGTHS from DB constants
 */
export const projectAddressSchema = z.object({
  projectCity: z
    .string()
    .min(1, "Ciudad es requerida")
    .max(QUOTE_FIELD_LENGTHS.PROJECT_CITY),
  projectName: z
    .string()
    .min(1, "Nombre del proyecto es requerido")
    .max(QUOTE_FIELD_LENGTHS.PROJECT_NAME),
  projectState: z
    .string()
    .min(1, "Estado/región es requerido")
    .max(QUOTE_FIELD_LENGTHS.PROJECT_STATE),
  projectStreet: z
    .string()
    .min(1, "Dirección es requerida")
    .max(QUOTE_FIELD_LENGTHS.PROJECT_STREET),
});

export type ProjectAddressSchema = z.infer<typeof projectAddressSchema>;

/**
 * Project address schema for OUTPUT (reading quotes)
 * Fields can be empty strings for backward compatibility with old quotes
 */
export const projectAddressOutputSchema = z.object({
  projectCity: z.string(),
  projectName: z.string(),
  projectPostalCode: z.string().optional(),
  projectState: z.string(),
  projectStreet: z.string(),
});

export type ProjectAddressOutputSchema = z.infer<
  typeof projectAddressOutputSchema
>;

/**
 * Cart item for quote generation
 */
export const cartItemForQuoteSchema = z.object({
  additionalServiceIds: z.array(z.cuid()),
  glassTypeId: z.cuid(),
  glassTypeName: z.string(),
  heightMm: z.number().int().positive(),
  modelId: z.cuid(),
  modelName: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  solutionId: z.cuid().optional(),
  solutionName: z.string().optional(),
  unitPrice: z.number().nonnegative(),
  widthMm: z.number().int().positive(),
});

export type CartItemForQuoteSchema = z.infer<typeof cartItemForQuoteSchema>;

/**
 * Generate quote from cart
 *
 * Server Action: generateQuoteFromCartAction
 */
export const generateQuoteFromCartInput = z.object({
  cartItems: z
    .array(cartItemForQuoteSchema)
    .min(1, "El carrito debe contener al menos un item")
    .max(MAX_CART_ITEMS, "El carrito no puede tener más de 20 items"),
  contactPhone: z.string().optional(), // No max length constraint - flexible for international formats
  manufacturerId: z.string().cuid("ID del fabricante debe ser válido"),
  projectAddress: projectAddressSchema,
});

export type GenerateQuoteFromCartInput = z.infer<
  typeof generateQuoteFromCartInput
>;

// ============================================================================
// Output Schemas
// ============================================================================

/**
 * Quote list item (lightweight for list view)
 */
export const quoteListItemSchema = z.object({
  createdAt: z.date(),
  currency: z.string().length(QUOTE_FIELD_LENGTHS.CURRENCY), // ISO 4217 (e.g., "COP", "USD")
  id: z.cuid(),
  isExpired: z.boolean(),
  itemCount: z.number().int().nonnegative(),
  projectName: z.string(),
  sentAt: z.date().nullable(),
  status: z.enum(QUOTE_STATUS_VALUES), // Reuse DB enum values
  total: z.number().nonnegative(),
  validUntil: z.date().nullable(),
});

export type QuoteListItemSchema = z.infer<typeof quoteListItemSchema>;

/**
 * Paginated quotes list response
 */
export const listUserQuotesOutput = z.object({
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
  limit: z.number().int().positive(),
  page: z.number().int().positive(),
  quotes: z.array(quoteListItemSchema),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type ListUserQuotesOutput = z.infer<typeof listUserQuotesOutput>;

/**
 * Quote item detail (for quote detail view)
 */
export const quoteItemDetailSchema = z.object({
  glassTypeName: z.string(),
  heightMm: z.number().int().positive(),
  id: z.cuid(),
  modelImageUrl: z.string().nullable(),
  modelName: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  serviceNames: z.array(z.string()),
  solutionName: z.string().optional(),
  subtotal: z.number().nonnegative(),
  unitPrice: z.number().nonnegative(),
  widthMm: z.number().int().positive(),
});

export type QuoteItemDetailSchema = z.infer<typeof quoteItemDetailSchema>;

/**
 * Full quote detail
 */
export const quoteDetailSchema = z.object({
  contactPhone: z.string().nullable(),
  createdAt: z.date(),
  currency: z.string().length(QUOTE_FIELD_LENGTHS.CURRENCY), // ISO 4217
  id: z.cuid(),
  isExpired: z.boolean(),
  itemCount: z.number().int().nonnegative(),
  items: z.array(quoteItemDetailSchema),
  manufacturerName: z.string(),
  projectAddress: projectAddressOutputSchema, // Use output schema (allows empty strings)
  projectName: z.string(), // T030 [US7]: For admin detail page
  sentAt: z.date().nullable(),
  status: z.enum(QUOTE_STATUS_VALUES), // Reuse DB enum values
  total: z.number().nonnegative(),
  totalUnits: z.number().int().nonnegative(),
  user: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      email: z.string().nullable(),
      role: z.enum(["admin", "seller", "user"]),
    })
    .nullable(), // T030 [US7]: User contact info for admin dashboard
  userEmail: z.string().optional(),
  validUntil: z.date().nullable(),
  vendorContactPhone: z.string().nullable(), // Tenant contact for US3
});

export type QuoteDetailSchema = z.infer<typeof quoteDetailSchema>;

/**
 * Get quote by ID output
 */
export const getQuoteByIdOutput = quoteDetailSchema;

export type GetQuoteByIdOutput = z.infer<typeof getQuoteByIdOutput>;

/**
 * Generate quote response
 */
export const generateQuoteFromCartOutput = z.discriminatedUnion("success", [
  z.object({
    data: z.object({
      quoteId: z.string().cuid(),
    }),
    success: z.literal(true),
  }),
  z.object({
    error: z.object({
      code: z.enum([
        "EMPTY_CART",
        "INVALID_ADDRESS",
        "PRICE_CALCULATION_FAILED",
        "TRANSACTION_FAILED",
        "UNAUTHORIZED",
        "UNKNOWN",
      ]),
      message: z.string(),
    }),
    success: z.literal(false),
  }),
]);

export type GenerateQuoteFromCartOutput = z.infer<
  typeof generateQuoteFromCartOutput
>;

// ============================================================================
// Feature 005: Send Quote to Vendor
// ============================================================================

/**
 * Send quote to vendor input
 *
 * tRPC Mutation: quote['send-to-vendor']
 *
 * Validates contact information before sending quote.
 * Phone must be in international format (E.164 compliant).
 *
 * @example
 * ```typescript
 * // Valid Colombian phone
 * { quoteId: 'cuid123', contactPhone: '+573001234567' }
 *
 * // Valid US phone
 * { quoteId: 'cuid123', contactPhone: '+12025551234', contactEmail: 'user@example.com' }
 * ```
 */
export const sendToVendorInput = z.object({
  contactEmail: z.email("Correo electrónico inválido").optional(),
  contactPhone: z
    .string()
    .regex(
      /^\+?[1-9]\d{9,14}$/,
      "Formato de teléfono inválido. Debe incluir código de país (ej: +57 300 123 4567)"
    ),
  quoteId: z.cuid("ID de cotización inválido"),
});

export type SendToVendorInput = z.infer<typeof sendToVendorInput>;

/**
 * Send quote to vendor output
 *
 * Returns updated quote with 'sent' status and submission timestamp.
 *
 * @example
 * ```typescript
 * {
 *   id: 'cuid123',
 *   status: 'sent',
 *   sentAt: new Date('2025-10-13T12:00:00Z'),
 *   contactPhone: '+573001234567',
 *   contactEmail: 'user@example.com',
 *   total: 1500000,
 *   currency: 'COP'
 * }
 * ```
 */
export const sendToVendorOutput = z.object({
  contactEmail: z.string().optional(),
  currency: z.string().length(QUOTE_FIELD_LENGTHS.CURRENCY), // Reuse DB constant (ISO 4217)
  id: z.cuid(),
  sentAt: z.date(),
  status: z.literal("sent"),
  total: z.number().nonnegative(),
});

export type SendToVendorOutput = z.infer<typeof sendToVendorOutput>;
