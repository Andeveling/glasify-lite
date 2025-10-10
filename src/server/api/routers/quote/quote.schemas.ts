/**
 * Quote Schemas - Zod validation schemas for quote operations
 *
 * These schemas define the contracts for quote-related tRPC procedures.
 * Follows the same pattern as catalog.schemas.ts
 *
 * @module server/api/routers/quote/quote.schemas
 */

import { z } from 'zod';

// ============================================================================
// Constants
// ============================================================================

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PROJECT_NAME_LENGTH = 100;
const MAX_ADDRESS_LENGTH = 200;
const MAX_PHONE_LENGTH = 20;
const MAX_POSTAL_CODE_LENGTH = 20;
const MAX_CART_ITEMS = 20;

// ============================================================================
// Input Schemas - Queries
// ============================================================================

/**
 * List user quotes (paginated, filterable)
 *
 * tRPC Query: quote['list-user-quotes']
 */
export const listUserQuotesInput = z.object({
  includeExpired: z.boolean().default(false),
  limit: z.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  page: z.number().int().positive().default(1),
  sortBy: z.enum([ 'createdAt', 'validUntil', 'total' ]).default('createdAt'),
  sortOrder: z.enum([ 'asc', 'desc' ]).default('desc'),
  status: z.enum([ 'draft', 'sent', 'canceled' ]).optional(),
});

export type ListUserQuotesInput = z.infer<typeof listUserQuotesInput>;

/**
 * Get single quote by ID
 *
 * tRPC Query: quote['get-by-id']
 */
export const getQuoteByIdInput = z.object({
  id: z.string().cuid('ID de cotización debe ser válido'),
});

export type GetQuoteByIdInput = z.infer<typeof getQuoteByIdInput>;

// ============================================================================
// Input Schemas - Mutations
// ============================================================================

/**
 * Project address for quote generation
 */
export const projectAddressSchema = z.object({
  projectCity: z.string().min(1, 'Ciudad es requerida').max(MAX_ADDRESS_LENGTH),
  projectName: z.string().min(1, 'Nombre del proyecto es requerido').max(MAX_PROJECT_NAME_LENGTH),
  projectPostalCode: z.string().min(1, 'Código postal es requerido').max(MAX_POSTAL_CODE_LENGTH),
  projectState: z.string().min(1, 'Estado/región es requerido').max(MAX_ADDRESS_LENGTH),
  projectStreet: z.string().min(1, 'Dirección es requerida').max(MAX_ADDRESS_LENGTH),
});

export type ProjectAddressSchema = z.infer<typeof projectAddressSchema>;

/**
 * Cart item for quote generation
 */
export const cartItemForQuoteSchema = z.object({
  additionalServiceIds: z.array(z.string().cuid()),
  glassTypeId: z.string().cuid(),
  glassTypeName: z.string(),
  heightMm: z.number().int().positive(),
  modelId: z.string().cuid(),
  modelName: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  solutionId: z.string().cuid().optional(),
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
    .min(1, 'El carrito debe contener al menos un item')
    .max(MAX_CART_ITEMS, 'El carrito no puede tener más de 20 items'),
  contactPhone: z.string().max(MAX_PHONE_LENGTH).optional(),
  manufacturerId: z.string().cuid('ID del fabricante debe ser válido'),
  projectAddress: projectAddressSchema,
});

export type GenerateQuoteFromCartInput = z.infer<typeof generateQuoteFromCartInput>;

// ============================================================================
// Output Schemas
// ============================================================================

/**
 * Quote list item (lightweight for list view)
 */
export const quoteListItemSchema = z.object({
  createdAt: z.date(),
  currency: z.string(),
  id: z.string().cuid(),
  isExpired: z.boolean(),
  itemCount: z.number().int().nonnegative(),
  projectName: z.string(),
  status: z.enum([ 'draft', 'sent', 'canceled' ]),
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
  id: z.string().cuid(),
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
  contactPhone: z.string().optional(),
  createdAt: z.date(),
  currency: z.string(),
  id: z.string().cuid(),
  isExpired: z.boolean(),
  itemCount: z.number().int().nonnegative(),
  items: z.array(quoteItemDetailSchema),
  manufacturerName: z.string(),
  projectAddress: projectAddressSchema,
  status: z.enum([ 'draft', 'sent', 'canceled' ]),
  total: z.number().nonnegative(),
  totalUnits: z.number().int().nonnegative(),
  userEmail: z.string().optional(),
  validUntil: z.date().nullable(),
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
export const generateQuoteFromCartOutput = z.discriminatedUnion('success', [
  z.object({
    data: z.object({
      quoteId: z.string().cuid(),
    }),
    success: z.literal(true),
  }),
  z.object({
    error: z.object({
      code: z.enum([
        'EMPTY_CART',
        'INVALID_ADDRESS',
        'PRICE_CALCULATION_FAILED',
        'TRANSACTION_FAILED',
        'UNAUTHORIZED',
        'UNKNOWN',
      ]),
      message: z.string(),
    }),
    success: z.literal(false),
  }),
]);

export type GenerateQuoteFromCartOutput = z.infer<typeof generateQuoteFromCartOutput>;
