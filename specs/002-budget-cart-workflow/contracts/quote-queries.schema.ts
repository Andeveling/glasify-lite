/**
 * Quote Queries & Mutations - tRPC Schemas
 *
 * These schemas define the contracts for quote-related operations.
 * Queries use traditional tRPC procedures for React Query caching.
 * Mutations use Server Actions via experimental_caller.
 *
 * Locations:
 * - Queries: server/api/routers/quote.ts
 * - Mutations: app/_actions/quote.actions.ts
 */

import { z } from "zod";

// ============================================================================
// Constants
// ============================================================================

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PROJECT_NAME_LENGTH = 100;
const MAX_PROJECT_ADDRESS_LENGTH = 200;
const MAX_ITEM_NAME_LENGTH = 50;
const MAX_PHONE_LENGTH = 20;
const MAX_POSTAL_CODE_LENGTH = 20;

// ============================================================================
// Quote Query Schemas
// ============================================================================

/**
 * List user quotes (paginated, filterable)
 *
 * tRPC Query: quote.listUserQuotes
 * Location: server/api/routers/quote.ts
 */
export const listUserQuotesInput = z.object({
	limit: z
		.number()
		.int()
		.positive()
		.max(MAX_PAGE_SIZE)
		.default(DEFAULT_PAGE_SIZE),
	page: z.number().int().positive().default(1),
	search: z.string().min(1).max(MAX_PROJECT_NAME_LENGTH).optional(),
	sortBy: z.enum(["createdAt", "total", "projectName"]).default("createdAt"),
	sortOrder: z.enum(["asc", "desc"]).default("desc"),
	status: z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED"]).optional(),
});

export type ListUserQuotesInput = z.infer<typeof listUserQuotesInput>;

/**
 * Quote item in list response
 */
const quoteListItemSchema = z.object({
	createdAt: z.date(),
	id: z.string().cuid(),
	itemCount: z.number().int().nonnegative(),
	projectAddress: z.string().nullable(),
	projectName: z.string(),
	status: z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED"]),
	total: z.number().nonnegative(),
	validUntil: z.date(),
});

export type QuoteListItem = z.infer<typeof quoteListItemSchema>;

/**
 * List user quotes response
 */
export const listUserQuotesOutput = z.object({
	items: z.array(quoteListItemSchema),
	pagination: z.object({
		hasMore: z.boolean(),
		limit: z.number().int().positive(),
		page: z.number().int().positive(),
		total: z.number().int().nonnegative(),
		totalPages: z.number().int().nonnegative(),
	}),
});

export type ListUserQuotesOutput = z.infer<typeof listUserQuotesOutput>;

/**
 * Get single quote by ID (full details with items)
 *
 * tRPC Query: quote.getQuoteById
 * Location: server/api/routers/quote.ts
 */
export const getQuoteByIdInput = z.object({
	id: z.string().cuid("ID de cotización debe ser válido"),
});

export type GetQuoteByIdInput = z.infer<typeof getQuoteByIdInput>;

/**
 * Quote item details (nested in quote)
 */
const quoteItemDetailSchema = z.object({
	accessories: z.array(
		z.object({
			id: z.string().cuid(),
			name: z.string(),
			price: z.number().nonnegative(),
		}),
	),
	glassTypeName: z.string(),
	heightMm: z.number().int().positive(),
	id: z.string().cuid(),
	modelName: z.string(),
	name: z.string(),
	quantity: z.number().int().positive(),
	solutionName: z.string().nullable(),
	subtotal: z.number().nonnegative(),
	unitPrice: z.number().nonnegative(),
	widthMm: z.number().int().positive(),
});

export type QuoteItemDetail = z.infer<typeof quoteItemDetailSchema>;

/**
 * Full quote details response
 */
export const getQuoteByIdOutput = z.object({
	contactAddress: z.string().nullable(),
	contactPhone: z.string().nullable(),
	createdAt: z.date(),
	id: z.string().cuid(),
	items: z.array(quoteItemDetailSchema),
	projectCity: z.string().nullable(),
	projectName: z.string(),
	projectPostalCode: z.string().nullable(),
	projectState: z.string().nullable(),
	projectStreet: z.string().nullable(),
	status: z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED"]),
	total: z.number().nonnegative(),
	updatedAt: z.date(),
	user: z.object({
		email: z.string().email().nullable(),
		id: z.string(),
		name: z.string().nullable(),
	}),
	validUntil: z.date(),
});

export type GetQuoteByIdOutput = z.infer<typeof getQuoteByIdOutput>;

// ============================================================================
// Quote Mutation Schemas (Server Actions)
// ============================================================================

/**
 * Generate quote from cart
 *
 * Server Action: generateQuoteFromCartAction
 * Location: app/_actions/quote.actions.ts
 */
export const generateQuoteFromCartInput = z.object({
	cartItems: z
		.array(
			z.object({
				additionalServiceIds: z.array(z.string().cuid()),
				glassTypeId: z.string().cuid(),
				heightMm: z.number().int().positive(),
				id: z.string().cuid(),
				modelId: z.string().cuid(),
				name: z.string().min(1).max(MAX_ITEM_NAME_LENGTH),
				quantity: z.number().int().positive(),
				solutionId: z.string().cuid().optional(),
				widthMm: z.number().int().positive(),
			}),
		)
		.min(1, "El carrito debe tener al menos un item"),
	contactAddress: z.string().min(1).max(MAX_PROJECT_ADDRESS_LENGTH).optional(),
	contactPhone: z.string().min(1).max(MAX_PHONE_LENGTH).optional(),
	projectCity: z.string().min(1).max(MAX_PROJECT_ADDRESS_LENGTH).optional(),
	projectName: z
		.string()
		.min(1, "Nombre del proyecto es requerido")
		.max(MAX_PROJECT_NAME_LENGTH, "Nombre muy largo"),
	projectPostalCode: z.string().min(1).max(MAX_POSTAL_CODE_LENGTH).optional(),
	projectState: z.string().min(1).max(MAX_PROJECT_ADDRESS_LENGTH).optional(),
	projectStreet: z.string().min(1).max(MAX_PROJECT_ADDRESS_LENGTH).optional(),
});

export type GenerateQuoteFromCartInput = z.infer<
	typeof generateQuoteFromCartInput
>;

/**
 * Quote generation response
 */
export const generateQuoteFromCartOutput = z.discriminatedUnion("success", [
	z.object({
		data: z.object({
			itemCount: z.number().int().positive(),
			quoteId: z.string().cuid(),
			total: z.number().nonnegative(),
			validUntil: z.date(),
		}),
		success: z.literal(true),
	}),
	z.object({
		error: z.object({
			code: z.enum([
				"VALIDATION_ERROR",
				"UNAUTHORIZED",
				"CART_EMPTY",
				"PRICE_CHANGED",
				"UNKNOWN",
			]),
			details: z.record(z.string(), z.unknown()).optional(),
			message: z.string(),
		}),
		success: z.literal(false),
	}),
]);

export type GenerateQuoteFromCartOutput = z.infer<
	typeof generateQuoteFromCartOutput
>;

/**
 * Update quote status
 *
 * Server Action: updateQuoteStatusAction
 * Location: app/_actions/quote.actions.ts
 */
export const updateQuoteStatusInput = z.object({
	id: z.string().cuid("ID de cotización debe ser válido"),
	status: z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED"]),
});

export type UpdateQuoteStatusInput = z.infer<typeof updateQuoteStatusInput>;

export const updateQuoteStatusOutput = z.discriminatedUnion("success", [
	z.object({
		data: z.object({
			id: z.string().cuid(),
			status: z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED"]),
		}),
		success: z.literal(true),
	}),
	z.object({
		error: z.object({
			code: z.enum([
				"VALIDATION_ERROR",
				"NOT_FOUND",
				"UNAUTHORIZED",
				"UNKNOWN",
			]),
			message: z.string(),
		}),
		success: z.literal(false),
	}),
]);

export type UpdateQuoteStatusOutput = z.infer<typeof updateQuoteStatusOutput>;

// ============================================================================
// Server Action Metadata (for observability)
// ============================================================================

export const quoteActionMeta = {
	generateFromCart: { span: "quote.generate-from-cart" },
	updateStatus: { span: "quote.update-status" },
} as const;

// ============================================================================
// Usage Examples (for documentation)
// ============================================================================

/**
 * Example: Define tRPC query for listing user quotes
 *
 * ```typescript
 * // server/api/routers/quote.ts
 * import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
 * import { listUserQuotesInput, listUserQuotesOutput } from './contracts/quote-queries.schema';
 *
 * export const quoteRouter = createTRPCRouter({
 *   listUserQuotes: protectedProcedure
 *     .input(listUserQuotesInput)
 *     .output(listUserQuotesOutput)
 *     .query(async ({ ctx, input }) => {
 *       const { page, limit, status, search, sortBy, sortOrder } = input;
 *
 *       const where = {
 *         userId: ctx.session.user.id,
 *         ...(status && { status }),
 *         ...(search && {
 *           OR: [
 *             { projectName: { contains: search, mode: 'insensitive' } },
 *             { projectAddress: { contains: search, mode: 'insensitive' } },
 *           ],
 *         }),
 *       };
 *
 *       const [total, quotes] = await Promise.all([
 *         ctx.db.quote.count({ where }),
 *         ctx.db.quote.findMany({
 *           where,
 *           skip: (page - 1) * limit,
 *           take: limit,
 *           orderBy: { [sortBy]: sortOrder },
 *           include: {
 *             _count: { select: { items: true } },
 *           },
 *         }),
 *       ]);
 *
 *       return {
 *         items: quotes.map(q => ({
 *           id: q.id,
 *           projectName: q.projectName,
 *           projectAddress: [q.projectStreet, q.projectCity].filter(Boolean).join(', ') || null,
 *           total: q.total,
 *           status: q.status,
 *           itemCount: q._count.items,
 *           validUntil: q.validUntil,
 *           createdAt: q.createdAt,
 *         })),
 *         pagination: {
 *           page,
 *           limit,
 *           total,
 *           totalPages: Math.ceil(total / limit),
 *           hasMore: page * limit < total,
 *         },
 *       };
 *     }),
 * });
 * ```
 *
 * Example: Define Server Action for generating quote from cart
 *
 * ```typescript
 * // app/_actions/quote.actions.ts
 * 'use server';
 *
 * import { serverActionProcedure } from '@/server/api/trpc';
 * import { generateQuoteFromCartInput, generateQuoteFromCartOutput, quoteActionMeta } from './contracts/quote-queries.schema';
 * import { redirect } from 'next/navigation';
 *
 * export const generateQuoteFromCartAction = serverActionProcedure
 *   .meta(quoteActionMeta.generateFromCart)
 *   .input(generateQuoteFromCartInput)
 *   .output(generateQuoteFromCartOutput)
 *   .mutation(async ({ ctx, input }) => {
 *     try {
 *       // Validate session
 *       if (!ctx.session?.user?.id) {
 *         return {
 *           success: false,
 *           error: {
 *             message: 'Debe iniciar sesión para generar cotización',
 *             code: 'UNAUTHORIZED',
 *           },
 *         };
 *       }
 *
 *       // Calculate prices and create quote in transaction
 *       const quote = await ctx.db.$transaction(async (tx) => {
 *         const quoteItems = await Promise.all(
 *           input.cartItems.map(async (item) => {
 *             const price = await api.catalog['calculate-price']({
 *               modelId: item.modelId,
 *               glassTypeId: item.glassTypeId,
 *               widthMm: item.widthMm,
 *               heightMm: item.heightMm,
 *               additionalServices: item.additionalServiceIds,
 *             });
 *
 *             return {
 *               name: item.name,
 *               modelId: item.modelId,
 *               glassTypeId: item.glassTypeId,
 *               solutionId: item.solutionId,
 *               widthMm: item.widthMm,
 *               heightMm: item.heightMm,
 *               quantity: item.quantity,
 *               unitPrice: price.total,
 *               subtotal: price.total * item.quantity,
 *               additionalServices: {
 *                 connect: item.additionalServiceIds.map(id => ({ id })),
 *               },
 *             };
 *           })
 *         );
 *
 *         const total = quoteItems.reduce((sum, item) => sum + item.subtotal, 0);
 *         const validUntil = new Date();
 *         validUntil.setDate(validUntil.getDate() + 30); // 30 days validity
 *
 *         return tx.quote.create({
 *           data: {
 *             userId: ctx.session.user.id,
 *             projectName: input.projectName,
 *             projectStreet: input.projectStreet,
 *             projectCity: input.projectCity,
 *             projectState: input.projectState,
 *             projectPostalCode: input.projectPostalCode,
 *             contactPhone: input.contactPhone,
 *             contactAddress: input.contactAddress,
 *             total,
 *             validUntil,
 *             status: 'PENDING',
 *             items: { create: quoteItems },
 *           },
 *         });
 *       });
 *
 *       // Redirect to quote detail page
 *       redirect(`/quotes/${quote.id}`);
 *     } catch (error) {
 *       return {
 *         success: false,
 *         error: {
 *           message: error.message || 'Error al generar cotización',
 *           code: 'UNKNOWN',
 *         },
 *       };
 *     }
 *   });
 * ```
 *
 * Example: Use in React component with React Query
 *
 * ```tsx
 * 'use client';
 *
 * import { api } from '@/trpc/react';
 *
 * function QuotesListPage() {
 *   const [page, setPage] = useState(1);
 *   const { data, isLoading } = api.quote.listUserQuotes.useQuery({
 *     page,
 *     limit: 10,
 *     sortBy: 'createdAt',
 *     sortOrder: 'desc',
 *   });
 *
 *   if (isLoading) return <QuotesSkeleton />;
 *
 *   return (
 *     <div>
 *       <QuotesTable quotes={data.items} />
 *       <Pagination
 *         page={data.pagination.page}
 *         totalPages={data.pagination.totalPages}
 *         onPageChange={setPage}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
