import type { Prisma, Quote } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import logger from "@/lib/logger";
import {
  createTRPCRouter,
  getQuoteFilter,
  protectedProcedure,
  publicProcedure,
  sellerOrAdminProcedure,
} from "@/server/api/trpc";
import {
  calculatePriceItem,
  type PriceAdjustmentInput,
  type PriceServiceInput,
} from "@/server/price/price-item";
import { sendQuoteNotification } from "@/server/services/email";
import {
  getQuoteValidityDays,
  getTenantConfigSelect,
  getTenantCurrency,
} from "@/server/utils/tenant";
import {
  getQuoteByIdInput,
  getQuoteByIdOutput,
  listUserQuotesInput,
  listUserQuotesOutput,
  sendToVendorInput,
  sendToVendorOutput,
} from "./quote.schemas";
import { sendQuoteToVendor } from "./quote.service";

// Constants for percentage calculations
const PERCENTAGE_DIVISOR = 100;
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

        // First, calculate the item to get the subtotal
        // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex business logic for quote item creation with multiple validations, pricing calculations, and database operations in a transaction. This complexity is necessary and justified.
        const calculation = await ctx.db.$transaction(async (tx) => {
          // Get model data (profileSupplier is the new relation)
          const model = await tx.model.findUnique({
            include: { profileSupplier: true },
            where: { id: input.modelId },
          });

          if (!model || model.status !== "published") {
            throw new Error("Modelo no encontrado o no disponible");
          }

          // Validate glass type compatibility
          if (!model.compatibleGlassTypeIds.includes(input.glassTypeId)) {
            throw new Error("Tipo de vidrio no compatible con este modelo");
          }

          // Validate dimensions
          if (
            input.widthMm < model.minWidthMm ||
            input.widthMm > model.maxWidthMm
          ) {
            throw new Error(
              `Ancho debe estar entre ${model.minWidthMm}mm y ${model.maxWidthMm}mm`
            );
          }
          if (
            input.heightMm < model.minHeightMm ||
            input.heightMm > model.maxHeightMm
          ) {
            throw new Error(
              `Alto debe estar entre ${model.minHeightMm}mm y ${model.maxHeightMm}mm`
            );
          }

          // Get or create quote
          let quote: Quote | null = null;
          if (input.quoteId) {
            quote = await tx.quote.findUnique({
              where: { id: input.quoteId },
            });
            if (!quote) {
              throw new Error("Cotización no encontrada");
            }
            if (quote.status !== "draft") {
              throw new Error(
                "No se pueden agregar ítems a una cotización enviada o cancelada"
              );
            }
          } else {
            // Create new quote using TenantConfig for currency and validity
            const validityDays = await getQuoteValidityDays(tx);
            const currency = await getTenantCurrency(tx);

            const validUntil = new Date();
            validUntil.setDate(validUntil.getDate() + validityDays);

            quote = await tx.quote.create({
              data: {
                currency,
                status: "draft",
                validUntil,
              },
            });
          } // Get services data
          const serviceInputs: PriceServiceInput[] = [];
          if (input.services.length > 0) {
            const serviceIds = input.services.map((s) => s.serviceId);
            const services = await tx.service.findMany({
              where: {
                id: { in: serviceIds },
              },
            });

            for (const serviceInput of input.services) {
              const service = services.find(
                (s) => s.id === serviceInput.serviceId
              );
              if (!service) {
                throw new Error(
                  `Servicio ${serviceInput.serviceId} no encontrado`
                );
              }
              serviceInputs.push({
                quantityOverride: serviceInput.quantity,
                rate: service.rate,
                serviceId: service.id,
                type: service.type,
                unit: service.unit,
              });
            }
          }

          // Convert adjustments
          const adjustmentInputs: PriceAdjustmentInput[] =
            input.adjustments.map((adj) => ({
              concept: adj.concept,
              sign: adj.sign,
              unit: adj.unit,
              value: adj.value,
            }));

          // Fetch glass type for validation
          const glassType = await tx.glassType.findUnique({
            where: { id: input.glassTypeId },
          });
          if (!glassType) {
            throw new Error("Tipo de vidrio no encontrado");
          }

          // Calculate price including glass area pricing (using direct pricePerSqm from GlassType)
          const itemCalculation = calculatePriceItem({
            adjustments: adjustmentInputs,
            glass: {
              discountHeightMm: model.glassDiscountHeightMm,
              discountWidthMm: model.glassDiscountWidthMm,
              pricePerSqm: glassType.pricePerSqm,
            },
            heightMm: input.heightMm,
            includeAccessory: Boolean(model.accessoryPrice),
            model: {
              accessoryPrice: model.accessoryPrice,
              basePrice: model.basePrice,
              costPerMmHeight: model.costPerMmHeight,
              costPerMmWidth: model.costPerMmWidth,
            },
            services: serviceInputs,
            widthMm: input.widthMm,
          });

          // T045: Fetch color snapshot if colorId provided
          let colorSnapshot: {
            colorId: string;
            colorName: string;
            colorHexCode: string;
            colorSurchargePercentage: number;
          } | null = null;

          let colorSurcharge = 0;

          if (input.colorId) {
            const modelColor = await tx.modelColor.findFirst({
              include: {
                color: true,
              },
              where: {
                colorId: input.colorId,
                modelId: model.id,
              },
            });

            if (!modelColor) {
              throw new Error("Color no asignado a este modelo");
            }

            if (!modelColor.color.isActive) {
              throw new Error("Color no disponible");
            }

            colorSnapshot = {
              colorHexCode: modelColor.color.hexCode,
              colorId: modelColor.colorId,
              colorName: modelColor.color.name,
              colorSurchargePercentage:
                modelColor.surchargePercentage.toNumber(),
            };

            // Calculate color surcharge (applied to dimPrice only)
            colorSurcharge =
              itemCalculation.dimPrice *
              (colorSnapshot.colorSurchargePercentage / PERCENTAGE_DIVISOR);
          }

          // Calculate final subtotal including color surcharge
          const finalSubtotal = itemCalculation.subtotal + colorSurcharge;

          // Create quote item
          const quoteItem = await tx.quoteItem.create({
            data: {
              accessoryApplied: Boolean(model.accessoryPrice),
              // T045: Color snapshot fields
              colorHexCode: colorSnapshot?.colorHexCode,
              colorId: colorSnapshot?.colorId,
              colorName: colorSnapshot?.colorName,
              colorSurchargePercentage: colorSnapshot?.colorSurchargePercentage,
              glassTypeId: input.glassTypeId,
              heightMm: input.heightMm,
              modelId: model.id,
              name: model.name, // Add the required name property
              quoteId: quote.id,
              roomLocation: input.roomLocation, // T008: Save window location from wizard
              subtotal: finalSubtotal,
              widthMm: input.widthMm,
            },
          });

          // Create quote item services
          for (const service of itemCalculation.services) {
            await tx.quoteItemService.create({
              data: {
                amount: service.amount,
                quantity: service.quantity,
                quoteItemId: quoteItem.id,
                serviceId: service.serviceId,
                unit: service.unit,
              },
            });
          }

          // Create adjustments
          for (const adjustment of itemCalculation.adjustments) {
            await tx.adjustment.create({
              data: {
                amount: adjustment.amount,
                concept: adjustment.concept,
                quoteItemId: quoteItem.id,
                scope: "item",
                sign: adjustment.amount >= 0 ? "positive" : "negative",
                unit: "unit", // Default unit for item adjustments
                value: 1, // Value is already calculated in amount
              },
            });
          }

          // Update quote total
          const quoteItems = await tx.quoteItem.findMany({
            where: { quoteId: quote.id },
          });
          const newTotal = quoteItems.reduce(
            (sum: number, item) => sum + item.subtotal.toNumber(),
            0
          );

          await tx.quote.update({
            data: { total: newTotal },
            where: { id: quote.id },
          });

          return {
            itemId: quoteItem.id,
            quoteId: quote.id,
            subtotal: itemCalculation.subtotal,
          };
        });

        logger.info("Item added to quote successfully", {
          itemId: calculation.itemId,
          quoteId: calculation.quoteId,
          subtotal: calculation.subtotal,
        });

        return calculation;
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
  "calculate-item": publicProcedure
    .input(calculateItemInput)
    .output(calculateItemOutput)
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex price calculation logic with multiple validations for models, glass types, services, and adjustments. Complexity is necessary for comprehensive business logic.
    .mutation(async ({ ctx, input }) => {
      try {
        logger.info("Starting item price calculation", {
          dimensions: { heightMm: input.heightMm, widthMm: input.widthMm },
          glassTypeId: input.glassTypeId,
          modelId: input.modelId,
        });

        // Get model data (needed for ranges, pricing and discounts)
        const model = await ctx.db.model.findUnique({
          include: { profileSupplier: true },
          where: { id: input.modelId },
        });

        if (!model || model.status !== "published") {
          throw new Error("Modelo no encontrado o no disponible");
        }

        // Validate glass type compatibility
        if (!model.compatibleGlassTypeIds.includes(input.glassTypeId)) {
          throw new Error("Tipo de vidrio no compatible con este modelo");
        }

        // Validate dimensions
        if (
          input.widthMm < model.minWidthMm ||
          input.widthMm > model.maxWidthMm
        ) {
          throw new Error(
            `Ancho debe estar entre ${model.minWidthMm}mm y ${model.maxWidthMm}mm`
          );
        }
        if (
          input.heightMm < model.minHeightMm ||
          input.heightMm > model.maxHeightMm
        ) {
          throw new Error(
            `Alto debe estar entre ${model.minHeightMm}mm y ${model.maxHeightMm}mm`
          );
        }

        // Get services data
        const serviceInputs: PriceServiceInput[] = [];
        if (input.services.length > 0) {
          const serviceIds = input.services.map((s) => s.serviceId);
          const services = await ctx.db.service.findMany({
            where: {
              id: { in: serviceIds },
            },
          });

          for (const serviceInput of input.services) {
            const service = services.find(
              (s) => s.id === serviceInput.serviceId
            );
            if (!service) {
              throw new Error(
                `Servicio ${serviceInput.serviceId} no encontrado`
              );
            }
            serviceInputs.push({
              quantityOverride: serviceInput.quantity,
              rate: service.rate,
              serviceId: service.id,
              type: service.type,
              unit: service.unit,
            });
          }
        }

        // Convert adjustments
        const adjustmentInputs: PriceAdjustmentInput[] = input.adjustments.map(
          (adj) => ({
            concept: adj.concept,
            sign: adj.sign,
            unit: adj.unit,
            value: adj.value,
          })
        );

        // Fetch glass type for validation
        const glassType = await ctx.db.glassType.findUnique({
          where: { id: input.glassTypeId },
        });
        if (!glassType) {
          throw new Error("Tipo de vidrio no encontrado");
        }

        // Calculate price including glass area pricing (using direct pricePerSqm from GlassType)
        const itemCalculation = calculatePriceItem({
          adjustments: adjustmentInputs,
          colorSurchargePercentage: input.colorSurchargePercentage,
          glass: {
            discountHeightMm: model.glassDiscountHeightMm,
            discountWidthMm: model.glassDiscountWidthMm,
            pricePerSqm: glassType.pricePerSqm,
          },
          heightMm: input.heightMm,
          includeAccessory: Boolean(model.accessoryPrice),
          model: {
            accessoryPrice: model.accessoryPrice,
            basePrice: model.basePrice,
            costPerMmHeight: model.costPerMmHeight,
            costPerMmWidth: model.costPerMmWidth,
          },
          services: serviceInputs,
          widthMm: input.widthMm,
        });

        logger.info("Item price calculation completed", {
          colorSurchargeAmount: itemCalculation.colorSurchargeAmount,
          colorSurchargePercentage: itemCalculation.colorSurchargePercentage,
          modelId: input.modelId,
          subtotal: itemCalculation.subtotal,
        });

        return itemCalculation;
      } catch (error) {
        logger.error("Error calculating item price", {
          error: error instanceof Error ? error.message : "Unknown error",
          modelId: input.modelId,
        });

        const errorMessage =
          error instanceof Error
            ? error.message
            : "No se pudo calcular el precio del ítem. Intente nuevamente.";
        throw new Error(errorMessage);
      }
    }),

  /**
   * Get quote by ID with full details
   * Task: T068 [P] [US5]
   * Updated: T025 [US2] - Add ownership check (admin can view any quote)
   */
  "get-by-id": protectedProcedure
    .input(getQuoteByIdInput)
    .output(getQuoteByIdOutput)
    .query(async ({ ctx, input }) => {
      try {
        logger.info("[US5] Fetching quote by ID", {
          quoteId: input.id,
          userId: ctx.session.user.id,
          userRole: ctx.session.user.role,
        });

        // First, fetch the quote without userId filter
        const quote = await ctx.db.quote.findUnique({
          include: {
            items: {
              include: {
                glassType: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                model: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                services: {
                  include: {
                    service: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
            // REFACTOR: No longer include manufacturer, use TenantConfig instead
          },
          where: {
            id: input.id,
          },
        });

        if (!quote) {
          logger.warn("[US5] Quote not found", {
            quoteId: input.id,
            userId: ctx.session.user.id,
          });

          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cotización no encontrada",
          });
        }

        // Ownership check: user can only access quote if they own it OR they are admin
        const isOwner = quote.userId === ctx.session.user.id;
        const isAdmin = ctx.session.user.role === "admin";

        if (!(isOwner || isAdmin)) {
          logger.warn("[US2] Unauthorized quote access attempt", {
            quoteId: input.id,
            quoteOwnerId: quote.userId,
            requestUserId: ctx.session.user.id,
            userRole: ctx.session.user.role,
          });

          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes permiso para acceder a esta cotización",
          });
        }

        // Get tenant business name and contact for display (US3)
        const tenant = await getTenantConfigSelect(
          { businessName: true, contactPhone: true },
          ctx.db
        );

        const result = {
          contactPhone: quote.contactPhone,
          createdAt: quote.createdAt,
          currency: quote.currency,
          id: quote.id,
          isExpired: quote.validUntil ? quote.validUntil < new Date() : false,
          itemCount: quote.items.length,
          items: quote.items.map((item) => ({
            glassTypeName: item.glassType.name,
            heightMm: item.heightMm,
            id: item.id,
            modelName: item.model.name,
            name: item.name,
            quantity: item.quantity,
            serviceNames: item.services.map((s) => s.service.name),
            solutionName: undefined, // TODO: Add solution support
            subtotal: Number(item.subtotal),
            unitPrice: Number(item.subtotal) / item.quantity,
            widthMm: item.widthMm,
          })),
          manufacturerName: tenant.businessName, // REFACTOR: Now from TenantConfig
          projectAddress: {
            projectCity: quote.projectCity ?? "",
            projectName: quote.projectName ?? "Sin nombre",
            projectPostalCode: quote.projectPostalCode ?? undefined,
            projectState: quote.projectState ?? "",
            projectStreet: quote.projectStreet ?? "",
          },
          sentAt: quote.sentAt,
          status: quote.status,
          total: Number(quote.total),
          totalUnits: quote.items.reduce((sum, item) => sum + item.quantity, 0),
          userEmail: undefined,
          validUntil: quote.validUntil,
          vendorContactPhone: tenant.contactPhone, // US3: Vendor contact for confirmation message
        };

        logger.info("[US5] Quote fetched successfully", {
          itemCount: quote.items.length,
          quoteId: input.id,
          userId: ctx.session.user.id,
        });

        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logger.error("[US5] Error fetching quote", {
          error: error instanceof Error ? error.message : "Unknown error",
          quoteId: input.id,
          userId: ctx.session.user.id,
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
   * Updated: T024 [US2] - Role-based filtering (admin sees all, others see own)
   */
  "list-user-quotes": protectedProcedure
    .input(listUserQuotesInput)
    .output(listUserQuotesOutput)
    .query(async ({ ctx, input }) => {
      try {
        logger.info("[US5] Fetching user quotes", {
          includeExpired: input.includeExpired,
          limit: input.limit,
          page: input.page,
          search: input.search,
          sortBy: input.sortBy,
          sortOrder: input.sortOrder,
          status: input.status,
          userId: ctx.session.user.id,
          userRole: ctx.session.user.role,
        });

        const skip = (input.page - 1) * input.limit;

        // Build where clause with role-based filtering
        const roleFilter = getQuoteFilter(ctx.session);

        const baseWhere = {
          ...roleFilter, // Apply role-based filtering (admin sees all, others see own)
          status: input.status,
        };

        // Combine filters using AND
        const andConditions: Prisma.QuoteWhereInput[] = [];

        // Filter expired quotes if not including them
        if (!input.includeExpired) {
          andConditions.push({
            OR: [{ validUntil: null }, { validUntil: { gte: new Date() } }],
          });
        }

        // Search filter for project name, address, or items
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

        // Execute query with pagination
        const [quotes, total] = await Promise.all([
          ctx.db.quote.findMany({
            include: {
              _count: {
                select: { items: true },
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
            validUntil: quote.validUntil,
          })),
          total,
          totalPages,
        };

        logger.info("[US5] User quotes fetched successfully", {
          count: quotes.length,
          page: input.page,
          total,
          userId: ctx.session.user.id,
        });

        return result;
      } catch (error) {
        logger.error("[US5] Error fetching user quotes", {
          error: error instanceof Error ? error.message : "Unknown error",
          input,
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
   *
   * **Protected**: Requires authentication
   * **Status Transition**: draft → sent (immutable, no rollback)
   * **Validation**: Quote must exist, belong to user, be in 'draft' status, and have items
   *
   * @example
   * ```typescript
   * // Client call
   * const result = await trpc.quote['send-to-vendor'].mutate({
   *   quoteId: 'cuid123',
   *   contactPhone: '+573001234567',
   *   contactEmail: 'user@example.com' // optional
   * });
   * ```
   */
  "send-to-vendor": protectedProcedure
    .input(sendToVendorInput)
    .output(sendToVendorOutput)
    .mutation(async ({ ctx, input }) => {
      // Delegate to service layer for business logic
      const result = await sendQuoteToVendor(ctx.db, {
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        quoteId: input.quoteId,
        userId: ctx.session.user.id,
      });

      return result;
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

        // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex quote submission logic with status validation, item verification, contact updates, and email notification handling. Complexity is inherent to the business requirements.
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
  "get-model-colors-for-quote": publicProcedure
    .input(
      z.object({
        modelId: z.string().cuid({ error: "ID del modelo debe ser válido" }),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const modelColors = await ctx.db.modelColor.findMany({
          include: {
            color: true,
          },
          orderBy: [
            { isDefault: "desc" }, // Default first
            { color: { name: "asc" } }, // Then alphabetically
          ],
          where: {
            color: {
              isActive: true,
            },
            modelId: input.modelId,
          },
        });

        const defaultColor = modelColors.find((mc) => mc.isDefault);

        logger.info("Model colors fetched for quote", {
          colorCount: modelColors.length,
          defaultColorId: defaultColor?.colorId,
          modelId: input.modelId,
        });

        return {
          colors: modelColors.map((mc) => ({
            color: {
              hexCode: mc.color.hexCode,
              id: mc.color.id,
              name: mc.color.name,
              ralCode: mc.color.ralCode,
            },
            id: mc.id,
            isDefault: mc.isDefault,
            surchargePercentage: mc.surchargePercentage.toNumber(),
          })),
          defaultColorId: defaultColor?.colorId ?? null,
          hasColors: modelColors.length > 0,
          modelId: input.modelId,
        };
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
   * Server-side price calculation with color surcharge
   * Prevents client-side tampering
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
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex price calculation query with model validation, service processing, glass type lookup, and color surcharge calculations. Necessary for complete pricing logic.
    .query(async ({ ctx, input }) => {
      try {
        // Calculate base price without color
        const model = await ctx.db.model.findUnique({
          include: { profileSupplier: true },
          where: { id: input.modelId },
        });

        if (!model) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Modelo no encontrado",
          });
        }

        // Get services data
        const serviceInputs: PriceServiceInput[] = [];
        if (input.services.length > 0) {
          const serviceIds = input.services.map((s) => s.serviceId);
          const services = await ctx.db.service.findMany({
            where: {
              id: { in: serviceIds },
            },
          });

          for (const serviceInput of input.services) {
            const service = services.find(
              (s) => s.id === serviceInput.serviceId
            );
            if (!service) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: `Servicio ${serviceInput.serviceId} no encontrado`,
              });
            }
            serviceInputs.push({
              quantityOverride: serviceInput.quantity,
              rate: service.rate,
              serviceId: service.id,
              type: service.type,
              unit: service.unit,
            });
          }
        }

        // Convert adjustments
        const adjustmentInputs: PriceAdjustmentInput[] = input.adjustments.map(
          (adj) => ({
            concept: adj.concept,
            sign: adj.sign,
            unit: adj.unit,
            value: adj.value,
          })
        );

        // Fetch glass type for validation
        const glassType = await ctx.db.glassType.findUnique({
          where: { id: input.glassTypeId },
        });
        if (!glassType) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Tipo de vidrio no encontrado",
          });
        }

        // Calculate base price
        const calculation = calculatePriceItem({
          adjustments: adjustmentInputs,
          glass: {
            discountHeightMm: model.glassDiscountHeightMm,
            discountWidthMm: model.glassDiscountWidthMm,
            pricePerSqm: glassType.pricePerSqm,
          },
          heightMm: input.heightMm,
          includeAccessory: Boolean(model.accessoryPrice),
          model: {
            accessoryPrice: model.accessoryPrice,
            basePrice: model.basePrice,
            costPerMmHeight: model.costPerMmHeight,
            costPerMmWidth: model.costPerMmWidth,
          },
          services: serviceInputs,
          widthMm: input.widthMm,
        });

        // Calculate color surcharge if colorId provided
        let colorSurcharge = 0;
        let colorSurchargePercentage = 0;

        if (input.colorId) {
          const modelColor = await ctx.db.modelColor.findFirst({
            include: {
              color: true,
            },
            where: {
              colorId: input.colorId,
              modelId: input.modelId,
            },
          });

          if (!modelColor) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Color no asignado a este modelo",
            });
          }

          if (!modelColor.color.isActive) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Color no disponible",
            });
          }

          colorSurchargePercentage = modelColor.surchargePercentage.toNumber();
          // Apply surcharge ONLY to model base price (dimPrice in calculation)
          colorSurcharge =
            calculation.dimPrice *
            (colorSurchargePercentage / PERCENTAGE_DIVISOR);
        }

        const totalWithColor = calculation.subtotal + colorSurcharge;

        logger.info("Price calculated with color", {
          colorId: input.colorId,
          colorSurcharge,
          colorSurchargePercentage,
          modelId: input.modelId,
          totalWithColor,
        });

        return {
          basePrice: calculation.subtotal,
          breakdown: {
            accPrice: calculation.accPrice,
            adjustments: calculation.adjustments.map((adj) => ({
              amount: adj.amount,
              concept: adj.concept,
            })),
            color: colorSurcharge,
            dimPrice: calculation.dimPrice,
            services: calculation.services.map((svc) => ({
              amount: svc.amount,
              quantity: svc.quantity,
              serviceId: svc.serviceId,
              unit: svc.unit,
            })),
          },
          colorSurcharge,
          totalWithColor,
        };
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
