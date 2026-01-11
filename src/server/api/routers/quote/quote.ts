/** biome-ignore-all lint/complexity/noExcessiveCognitiveComplexity: TODO: Refactorizar */

import type { Prisma } from "@prisma/generated/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import logger from "@/lib/logger";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  sellerOrAdminProcedure,
} from "@/server/api/trpc";
import { sendQuoteNotification } from "@/server/services/email";
import { getTenantConfigSelect } from "@/server/utils/tenant";
import {
  getQuoteByIdInput,
  getQuoteByIdOutput,
  listUserQuotesInput,
  listUserQuotesOutput,
  sendToVendorInput,
  sendToVendorOutput,
} from "./quote.schemas";

// Constants for percentage calculations
const _PERCENTAGE_DIVISOR = 100;
const MIN_SURCHARGE_PERCENTAGE = 0;
const MAX_SURCHARGE_PERCENTAGE = 100;

// Constants for pagination
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

// Constants for room location field
const MAX_ROOM_LOCATION_LENGTH = 100;

// Input schemas
export const calculateItemServiceInput = z.object({
  quantity: z.number().optional(),
  serviceId: z.string().cuid({ error: "ID del servicio debe ser válido" }),
});

export const calculateItemAdjustmentInput = z.object({
  concept: z.string().min(1, { error: "El concepto del ajuste es requerido" }),
  sign: z.enum(["positive", "negative"]),
  unit: z.enum(["unit", "sqm", "ml"]),
  value: z.number().min(0, { error: "El valor debe ser mayor o igual a 0" }),
});

export const calculateItemInput = z.object({
  adjustments: z.array(calculateItemAdjustmentInput),
  glassTypeId: z.cuid({ error: "ID del tipo de vidrio debe ser válido" }),
  heightMm: z.number().int().min(1, { error: "Alto debe ser mayor a 0 mm" }),
  modelId: z.string().cuid({ error: "ID del modelo debe ser válido" }),
  quantity: z.number(),
  services: z.array(calculateItemServiceInput),
  unit: z.enum(["unit", "sqm", "ml"]),
  widthMm: z.number().int().min(1, { error: "Ancho debe ser mayor a 0 mm" }),
  /**
   * Optional color surcharge percentage (0-100)
   * Applied to profile costs only (basePrice + dimensions + accessories)
   */
  colorSurchargePercentage: z
    .number()
    .min(MIN_SURCHARGE_PERCENTAGE, {
      error: "Recargo debe ser mayor o igual a 0%",
    })
    .max(MAX_SURCHARGE_PERCENTAGE, {
      error: "Recargo debe ser menor o igual a 100%",
    })
    .optional(),
});

// Output schemas
export const calculateItemServiceOutput = z.object({
  amount: z.number(),
  quantity: z.number(),
  serviceId: z.string(),
  unit: z.enum(["unit", "sqm", "ml"]),
});

export const calculateItemAdjustmentOutput = z.object({
  amount: z.number(),
  concept: z.string(),
});

export const calculateItemOutput = z.object({
  accPrice: z.number(),
  adjustments: z.array(calculateItemAdjustmentOutput),
  colorSurchargeAmount: z.number().optional(),
  colorSurchargePercentage: z.number().optional(),
  dimPrice: z.number(),
  services: z.array(calculateItemServiceOutput),
  subtotal: z.number(),
});

export const addItemInput = calculateItemInput.extend({
  colorId: z.cuid({ error: "ID del color debe ser válido" }).optional(), // T045: Color selection optional
  quoteId: z.cuid({ error: "ID de la cotización debe ser válido" }).optional(),
  roomLocation: z.string().max(MAX_ROOM_LOCATION_LENGTH).optional(), // T008: Window location (wizard feature)
});

export const addItemOutput = z.object({
  itemId: z.string(),
  quoteId: z.string(),
  subtotal: z.number(),
});

export const submitInput = z.object({
  contact: z.object({
    address: z.string().min(1, { error: "Dirección es requerida" }),
    phone: z.string().min(1, { error: "Teléfono es requerido" }),
  }),
  quoteId: z.string().cuid({ error: "ID de la cotización debe ser válido" }),
});

export const submitOutput = z.object({
  quoteId: z.string(),
  status: z.literal("sent"),
});

export const quoteRouter = createTRPCRouter({
  /**
   * Add item to quote
   * TASK-D01: Refactored to use addItemWithColorUseCase (placeholder)
   */
  "add-item": publicProcedure
    .input(addItemInput)
    .output(addItemOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        logger.info("Adding item to quote", {
          dimensions: { heightMm: input.heightMm, widthMm: input.widthMm },
          modelId: input.modelId,
          quoteId: input.quoteId,
        });

        // TODO Phase D: Implement full use-case after extending QuoteRepository
        // For now, use legacy transaction logic
        const { addItemWithColorUseCase } = await import(
          "@domain/quotes/use-cases/add-item-with-color"
        );
        const { createAddItemWithColorDeps } = await import(
          "@domain/quotes/di/quote.container"
        );

        const deps = createAddItemWithColorDeps(ctx.db);

        const result = await addItemWithColorUseCase(input, deps);

        logger.info("Item added to quote successfully", {
          itemId: result.itemId,
          quoteId: result.quoteId,
          subtotal: result.subtotal,
        });

        return result;
      } catch (error) {
        logger.error("Error adding item to quote", {
          error: error instanceof Error ? error.message : "Unknown error",
          modelId: input.modelId,
          quoteId: input.quoteId,
        });

        const errorMessage =
          error instanceof Error
            ? error.message
            : "No se pudo agregar el ítem a la cotización. Intente nuevamente.";
        throw new Error(errorMessage);
      }
    }),

  /**
   * Calculate item price
   * TASK-C02: Refactored to use calculateItemPriceUseCase
   */
  "calculate-item": publicProcedure
    .input(calculateItemInput)
    .output(calculateItemOutput)
    .mutation(async ({ ctx, input }) => {
      const { calculateItemPriceUseCase } = await import(
        "@domain/quotes/use-cases/calculate-item-price"
      );
      const { createCalculateItemPriceDeps } = await import(
        "@domain/quotes/di/quote.container"
      );

      try {
        logger.info("Starting item price calculation", {
          dimensions: { heightMm: input.heightMm, widthMm: input.widthMm },
          modelId: input.modelId,
        });

        const deps = createCalculateItemPriceDeps(ctx.db);
        const result = await calculateItemPriceUseCase(input, deps);

        logger.info("Item price calculation completed", {
          modelId: input.modelId,
          subtotal: result.subtotal,
        });

        return result;
      } catch (error) {
        logger.error("Error calculating item price", {
          error: error instanceof Error ? error.message : "Unknown error",
          modelId: input.modelId,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "No se pudo calcular el precio del ítem.",
        });
      }
    }),

  /**
   * Get quote by ID with full details
   * Task: T068 [P] [US5]
   * TASK-C03: Refactored to use getQuoteByIdUseCase
   */
  "get-by-id": protectedProcedure
    .input(getQuoteByIdInput)
    .output(getQuoteByIdOutput)
    .query(async ({ ctx, input }) => {
      const { getQuoteByIdUseCase, AuthorizationError } = await import(
        "@domain/quotes/use-cases/get-quote-by-id"
      );
      const { createGetQuoteByIdDeps } = await import(
        "@domain/quotes/di/quote.container"
      );

      try {
        logger.info("[US5] Fetching quote by ID", {
          quoteId: input.id,
          userId: ctx.session.user.id,
          userRole: ctx.session.user.role,
        });

        const deps = createGetQuoteByIdDeps(ctx.db);
        const result = await getQuoteByIdUseCase(
          {
            quoteId: input.id,
            userId: ctx.session.user.id,
            userRole: ctx.session.user.role as "admin" | "seller" | "user",
          },
          deps
        );

        logger.info("[US5] Quote fetched successfully", {
          itemCount: result.itemCount,
          quoteId: input.id,
        });

        return result;
      } catch (error) {
        if (error instanceof AuthorizationError) {
          throw new TRPCError({
            code: error.code,
            message: error.message,
          });
        }

        logger.error("[US5] Error fetching quote", {
          error: error instanceof Error ? error.message : "Unknown error",
          quoteId: input.id,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No se pudo cargar la cotización. Intente nuevamente.",
        });
      }
    }),

  /**
   * List ALL quotes with user information (Admin and Seller)
   * Task: T020 [US1] - Updated for seller access
   * Allows admins and sellers to view all quotes across all users
   */
  "list-all": sellerOrAdminProcedure
    .input(
      z.object({
        includeExpired: z.boolean().default(false),
        limit: z.number().int().min(1).max(MAX_LIMIT).default(DEFAULT_LIMIT),
        page: z.number().int().min(1).default(1),
        search: z.string().optional(),
        sortBy: z
          .enum(["createdAt", "total", "validUntil"])
          .default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        status: z.enum(["draft", "sent", "canceled"]).optional(),
        userId: z.string().cuid().optional(), // Filter by specific user
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        logger.info("[US1/US2] Admin/Seller fetching all quotes", {
          includeExpired: input.includeExpired,
          limit: input.limit,
          page: input.page,
          role: ctx.session.user.role,
          search: input.search,
          sortBy: input.sortBy,
          sortOrder: input.sortOrder,
          status: input.status,
          userId: input.userId,
          viewerId: ctx.session.user.id,
        });

        const skip = (input.page - 1) * input.limit;

        // Build where clause for admin filtering
        const baseWhere: Prisma.QuoteWhereInput = {
          ...(input.status && { status: input.status }),
          ...(input.userId && { userId: input.userId }), // Optional filter by specific user
        };

        // Combine filters using AND
        const andConditions: Prisma.QuoteWhereInput[] = [];

        // Filter expired quotes if not including them
        if (!input.includeExpired) {
          andConditions.push({
            OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
          });
        }

        // Search filter
        if (input.search) {
          andConditions.push({
            OR: [
              {
                projectName: {
                  contains: input.search,
                  mode: "insensitive" as const,
                },
              },
              {
                projectStreet: {
                  contains: input.search,
                  mode: "insensitive" as const,
                },
              },
              {
                user: {
                  OR: [
                    {
                      name: {
                        contains: input.search,
                        mode: "insensitive" as const,
                      },
                    },
                    {
                      email: {
                        contains: input.search,
                        mode: "insensitive" as const,
                      },
                    },
                  ],
                },
              },
              {
                items: {
                  some: {
                    name: {
                      contains: input.search,
                      mode: "insensitive" as const,
                    },
                  },
                },
              },
            ],
          });
        }

        const where = {
          ...baseWhere,
          ...(andConditions.length > 0 ? { AND: andConditions } : {}),
        };

        // Execute query with pagination and user information
        const [quotes, total] = await Promise.all([
          ctx.db.quote.findMany({
            include: {
              _count: {
                select: { items: true },
              },
              user: {
                select: {
                  email: true,
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
            orderBy: {
              [input.sortBy]: input.sortOrder,
            },
            skip,
            take: input.limit,
            where,
          }),
          ctx.db.quote.count({ where }),
        ]);

        const totalPages = Math.ceil(total / input.limit);

        const result = {
          hasNextPage: input.page < totalPages,
          hasPreviousPage: input.page > 1,
          limit: input.limit,
          page: input.page,
          quotes: quotes.map((quote) => ({
            createdAt: quote.createdAt,
            currency: quote.currency,
            id: quote.id,
            isExpired: quote.validUntil ? quote.validUntil < new Date() : false,
            itemCount: quote._count.items,
            projectName: quote.projectName ?? "Sin nombre",
            sentAt: quote.sentAt,
            status: quote.status,
            total: Number(quote.total),
            user: quote.user
              ? {
                  email: quote.user.email,
                  id: quote.user.id,
                  name: quote.user.name,
                  role: quote.user.role,
                }
              : null,
            validUntil: quote.validUntil,
          })),
          total,
          totalPages,
        };

        logger.info("[US1] Admin quotes fetched successfully", {
          adminId: ctx.session.user.id,
          count: quotes.length,
          page: input.page,
          total,
        });

        return result;
      } catch (error) {
        logger.error("[US1] Error fetching all quotes", {
          adminId: ctx.session.user.id,
          error: error instanceof Error ? error.message : "Unknown error",
          input,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "No se pudieron cargar las cotizaciones. Intente nuevamente.",
        });
      }
    }),

  // =============================================================================
  // Query Procedures (User Story 5 - Quote History)
  // =============================================================================

  /**
   * List user quotes with pagination and filtering
   * Task: T068 [P] [US5]
   * TASK-C04: Refactored to use listUserQuotesUseCase
   */
  "list-user-quotes": protectedProcedure
    .input(listUserQuotesInput)
    .output(listUserQuotesOutput)
    .query(async ({ ctx, input }) => {
      const { listUserQuotesUseCase } = await import(
        "@domain/quotes/use-cases/list-user-quotes"
      );
      const { createListUserQuotesDeps } = await import(
        "@domain/quotes/di/quote.container"
      );

      try {
        logger.info("[US5] Fetching user quotes", {
          includeExpired: input.includeExpired,
          limit: input.limit,
          page: input.page,
          userId: ctx.session.user.id,
          userRole: ctx.session.user.role,
        });

        const deps = createListUserQuotesDeps(ctx.db);
        const result = await listUserQuotesUseCase(
          {
            userId: ctx.session.user.id,
            userRole: ctx.session.user.role as "admin" | "seller" | "user",
            page: input.page,
            limit: input.limit,
            sortBy: input.sortBy,
            sortOrder: input.sortOrder,
            status: input.status,
            search: input.search,
            includeExpired: input.includeExpired,
          },
          deps
        );

        logger.info("[US5] User quotes fetched successfully", {
          count: result.quotes.length,
          page: result.page,
          total: result.total,
        });

        return result;
      } catch (error) {
        logger.error("[US5] Error fetching user quotes", {
          error: error instanceof Error ? error.message : "Unknown error",
          userId: ctx.session.user.id,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "No se pudieron cargar las cotizaciones. Intente nuevamente.",
        });
      }
    }),

  // ============================================================================
  // Feature 005: Send Quote to Vendor
  // ============================================================================

  /**
   * Send draft quote to vendor for professional review
   * TASK-C05: Refactored to use sendQuoteToVendorUseCase
   */
  "send-to-vendor": protectedProcedure
    .input(sendToVendorInput)
    .output(sendToVendorOutput)
    .mutation(async ({ ctx, input }) => {
      const {
        sendQuoteToVendorUseCase,
        QuoteNotFoundError,
        QuoteUnauthorizedError,
        QuoteAlreadySentError,
        QuoteEmptyError,
      } = await import("@domain/quotes/use-cases/send-quote-to-vendor");
      const { createSendQuoteToVendorDeps } = await import(
        "@domain/quotes/di/quote.container"
      );

      try {
        logger.info("Sending quote to vendor", {
          quoteId: input.quoteId,
          userId: ctx.session.user.id,
        });

        const deps = createSendQuoteToVendorDeps(ctx.db);
        const result = await sendQuoteToVendorUseCase(
          {
            quoteId: input.quoteId,
            userId: ctx.session.user.id,
            contactPhone: input.contactPhone,
            contactEmail: input.contactEmail,
          },
          deps
        );

        logger.info("Quote sent to vendor successfully", {
          quoteId: result.id,
          sentAt: result.sentAt,
        });

        return result;
      } catch (error) {
        logger.error("Error sending quote to vendor", {
          error: error instanceof Error ? error.message : "Unknown error",
          quoteId: input.quoteId,
        });

        // Map domain errors to tRPC errors
        if (error instanceof QuoteNotFoundError) {
          throw new TRPCError({ code: "NOT_FOUND", message: error.message });
        }
        if (error instanceof QuoteUnauthorizedError) {
          throw new TRPCError({ code: "FORBIDDEN", message: error.message });
        }
        if (error instanceof QuoteAlreadySentError) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
        if (error instanceof QuoteEmptyError) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Error inesperado",
        });
      }
    }),

  submit: publicProcedure
    .input(submitInput)
    .output(submitOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        logger.info("Submitting quote", {
          contact: input.contact,
          quoteId: input.quoteId,
        });

        const result = await ctx.db.$transaction(async (tx) => {
          // Get quote with all related data
          const quote = await tx.quote.findUnique({
            include: {
              items: {
                select: {
                  subtotal: true,
                },
              },
              // REFACTOR: No longer include manufacturer
            },
            where: { id: input.quoteId },
          });

          if (!quote) {
            throw new Error("Cotización no encontrada");
          }

          if (quote.status !== "draft") {
            throw new Error(
              "Solo se pueden enviar cotizaciones en estado borrador"
            );
          }

          if (quote.items.length === 0) {
            throw new Error("La cotización debe tener al menos un ítem");
          }

          // Update quote status and contact info
          const updatedQuote = await tx.quote.update({
            data: {
              contactAddress: input.contact.address,
              contactPhone: input.contact.phone,
              status: "sent",
            },
            include: {
              items: {
                select: {
                  subtotal: true,
                },
              },
              // REFACTOR: No longer include manufacturer
            },
            where: { id: input.quoteId },
          });

          // Get tenant config for email notification
          const tenant = await getTenantConfigSelect(
            { businessName: true, currency: true },
            tx
          );

          // TODO: REFACTOR - Get admin email from User table with admin role
          // For now, email notification is disabled until we implement proper admin user lookup
          const manufacturerEmail: string | undefined = undefined;

          if (manufacturerEmail) {
            try {
              await sendQuoteNotification(
                {
                  contactAddress: input.contact.address,
                  contactPhone: input.contact.phone,
                  quote: {
                    ...updatedQuote,
                    items: updatedQuote.items.map((item) => ({
                      subtotal: item.subtotal.toNumber(),
                    })),
                    manufacturer: {
                      currency: tenant.currency,
                      name: tenant.businessName,
                    },
                  },
                },
                manufacturerEmail
              );
              logger.info("Quote notification sent successfully", {
                quoteId: input.quoteId,
                recipientEmail: manufacturerEmail,
              });
            } catch (emailError) {
              logger.warn("Failed to send quote notification email", {
                error:
                  emailError instanceof Error
                    ? emailError.message
                    : "Unknown error",
                quoteId: input.quoteId,
                recipientEmail: manufacturerEmail,
              });
              // Don't fail the transaction if email fails - quote is still submitted
            }
          } else {
            logger.warn("No manufacturer email found for quote notification", {
              quoteId: input.quoteId,
            });
          }

          return {
            quoteId: input.quoteId,
            status: "sent" as const,
          };
        });

        logger.info("Quote submitted successfully", {
          quoteId: input.quoteId,
        });

        return result;
      } catch (error) {
        logger.error("Error submitting quote", {
          error: error instanceof Error ? error.message : "Unknown error",
          quoteId: input.quoteId,
        });

        const errorMessage =
          error instanceof Error
            ? error.message
            : "No se pudo enviar la cotización. Intente nuevamente.";
        throw new Error(errorMessage);
      }
    }),

  /**
   * T043: Get Model Colors for Quote
   * Returns available colors for a model with default color marked
   * Public procedure - accessible in catalog without authentication
   * Cached for 5 minutes (colors rarely change)
   */
  /**
   * Get model colors for quote
   * TASK-D02: Refactored to use getModelColorsForQuoteUseCase (placeholder)
   */
  "get-model-colors-for-quote": publicProcedure
    .input(
      z.object({
        modelId: z.string().cuid({ error: "ID del modelo debe ser válido" }),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        logger.info("Fetching model colors for quote", {
          modelId: input.modelId,
        });

        // TODO Phase D: Implement full use-case after extending QuoteRepository
        // For now, use legacy query logic
        const { getModelColorsForQuoteUseCase } = await import(
          "@domain/quotes/use-cases/get-model-colors-for-quote"
        );
        const { createGetModelColorsForQuoteDeps } = await import(
          "@domain/quotes/di/quote.container"
        );

        const deps = createGetModelColorsForQuoteDeps(ctx.db);

        const result = await getModelColorsForQuoteUseCase(input, deps);

        logger.info("Model colors fetched for quote", {
          colorCount: result.colors.length,
          defaultColorId: result.defaultColorId,
          modelId: input.modelId,
        });

        return result;
      } catch (error) {
        logger.error("Error fetching model colors for quote", {
          error: error instanceof Error ? error.message : "Unknown error",
          modelId: input.modelId,
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener los colores del modelo",
        });
      }
    }),

  /**
   * T044: Calculate Price with Color
   * TASK-C06: Refactored to use calculatePriceWithColorUseCase
   */
  "calculate-price-with-color": publicProcedure
    .input(
      calculateItemInput.extend({
        colorId: z
          .string()
          .cuid({ error: "ID del color debe ser válido" })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { calculatePriceWithColorUseCase } = await import(
        "@domain/quotes/use-cases/calculate-price-with-color"
      );
      const { createCalculatePriceWithColorDeps } = await import(
        "@domain/quotes/di/quote.container"
      );

      try {
        logger.info("Calculating price with color", {
          colorId: input.colorId,
          modelId: input.modelId,
        });

        const deps = createCalculatePriceWithColorDeps(ctx.db);
        const result = await calculatePriceWithColorUseCase(input, deps);

        logger.info("Price calculated with color", {
          colorId: input.colorId,
          colorSurcharge: result.colorSurcharge,
          modelId: input.modelId,
          totalWithColor: result.totalWithColor,
        });

        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        logger.error("Error calculating price with color", {
          error: error instanceof Error ? error.message : "Unknown error",
          modelId: input.modelId,
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al calcular el precio con color",
        });
      }
    }),
});
