import type { Prisma, Quote } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import logger from '@/lib/logger';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '@/server/api/trpc';
import { calculatePriceItem, type PriceAdjustmentInput, type PriceServiceInput } from '@/server/price/price-item';
import { sendQuoteNotification } from '@/server/services/email';
import { getQuoteValidityDays, getTenantConfigSelect, getTenantCurrency } from '@/server/utils/tenant';
import {
  getQuoteByIdInput,
  getQuoteByIdOutput,
  listUserQuotesInput,
  listUserQuotesOutput,
  sendToVendorInput,
  sendToVendorOutput,
} from './quote.schemas';
import { sendQuoteToVendor } from './quote.service';

// Input schemas
export const calculateItemServiceInput = z.object({
  quantity: z.number().optional(),
  serviceId: z.string().cuid('ID del servicio debe ser válido'),
});

export const calculateItemAdjustmentInput = z.object({
  concept: z.string().min(1, 'El concepto del ajuste es requerido'),
  sign: z.enum(['positive', 'negative']),
  unit: z.enum(['unit', 'sqm', 'ml']),
  value: z.number().min(0, 'El valor debe ser mayor o igual a 0'),
});

export const calculateItemInput = z.object({
  adjustments: z.array(calculateItemAdjustmentInput).default([]),
  glassTypeId: z.string().cuid('ID del tipo de vidrio debe ser válido'),
  heightMm: z.number().int().min(1, 'Alto debe ser mayor a 0 mm'),
  modelId: z.string().cuid('ID del modelo debe ser válido'),
  services: z.array(calculateItemServiceInput).default([]),
  widthMm: z.number().int().min(1, 'Ancho debe ser mayor a 0 mm'),
});

// Output schemas
export const calculateItemServiceOutput = z.object({
  amount: z.number(),
  quantity: z.number(),
  serviceId: z.string(),
  unit: z.enum(['unit', 'sqm', 'ml']),
});

export const calculateItemAdjustmentOutput = z.object({
  amount: z.number(),
  concept: z.string(),
});

export const calculateItemOutput = z.object({
  accPrice: z.number(),
  adjustments: z.array(calculateItemAdjustmentOutput),
  dimPrice: z.number(),
  services: z.array(calculateItemServiceOutput),
  subtotal: z.number(),
});

export const addItemInput = calculateItemInput.extend({
  quoteId: z.string().cuid('ID de la cotización debe ser válido').optional(),
});

export const addItemOutput = z.object({
  itemId: z.string(),
  quoteId: z.string(),
  subtotal: z.number(),
});

export const submitInput = z.object({
  contact: z.object({
    address: z.string().min(1, 'Dirección es requerida'),
    phone: z.string().min(1, 'Teléfono es requerido'),
  }),
  quoteId: z.string().cuid('ID de la cotización debe ser válido'),
});

export const submitOutput = z.object({
  quoteId: z.string(),
  status: z.literal('sent'),
});

export const quoteRouter = createTRPCRouter({
  'add-item': publicProcedure
    .input(addItemInput)
    .output(addItemOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        logger.info('Adding item to quote', {
          dimensions: { heightMm: input.heightMm, widthMm: input.widthMm },
          modelId: input.modelId,
          quoteId: input.quoteId,
        });

        // First, calculate the item to get the subtotal
        const calculation = await ctx.db.$transaction(async (tx) => {
          // Get model data
          const model = await tx.model.findUnique({
            include: { manufacturer: true },
            where: { id: input.modelId },
          });

          if (!model || model.status !== 'published') {
            throw new Error('Modelo no encontrado o no disponible');
          }

          // Validate glass type compatibility
          if (!model.compatibleGlassTypeIds.includes(input.glassTypeId)) {
            throw new Error('Tipo de vidrio no compatible con este modelo');
          }

          // Validate dimensions
          if (input.widthMm < model.minWidthMm || input.widthMm > model.maxWidthMm) {
            throw new Error(`Ancho debe estar entre ${model.minWidthMm}mm y ${model.maxWidthMm}mm`);
          }
          if (input.heightMm < model.minHeightMm || input.heightMm > model.maxHeightMm) {
            throw new Error(`Alto debe estar entre ${model.minHeightMm}mm y ${model.maxHeightMm}mm`);
          }

          // Get or create quote
          let quote: Quote | null = null;
          if (input.quoteId) {
            quote = await tx.quote.findUnique({
              where: { id: input.quoteId },
            });
            if (!quote) {
              throw new Error('Cotización no encontrada');
            }
            if (quote.status !== 'draft') {
              throw new Error('No se pueden agregar ítems a una cotización enviada o cancelada');
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
                manufacturerId: model.manufacturerId, // REFACTOR: Deprecated field, will be removed
                status: 'draft',
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
                manufacturerId: model.manufacturerId,
              },
            });

            for (const serviceInput of input.services) {
              const service = services.find((s) => s.id === serviceInput.serviceId);
              if (!service) {
                throw new Error(`Servicio ${serviceInput.serviceId} no encontrado`);
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
          const adjustmentInputs: PriceAdjustmentInput[] = input.adjustments.map((adj) => ({
            concept: adj.concept,
            sign: adj.sign,
            unit: adj.unit,
            value: adj.value,
          }));

          // Fetch glass type for price per m²
          const glassType = await tx.glassType.findUnique({
            where: { id: input.glassTypeId },
          });
          if (!glassType) {
            throw new Error('Tipo de vidrio no encontrado');
          }

          // Calculate price including glass area pricing
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

          // Create quote item
          const quoteItem = await tx.quoteItem.create({
            data: {
              accessoryApplied: Boolean(model.accessoryPrice),
              glassTypeId: input.glassTypeId,
              heightMm: input.heightMm,
              modelId: model.id,
              name: model.name, // Add the required name property
              quoteId: quote.id,
              subtotal: itemCalculation.subtotal,
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
                scope: 'item',
                sign: adjustment.amount >= 0 ? 'positive' : 'negative',
                unit: 'unit', // Default unit for item adjustments
                value: 1, // Value is already calculated in amount
              },
            });
          }

          // Update quote total
          const quoteItems = await tx.quoteItem.findMany({
            where: { quoteId: quote.id },
          });
          const newTotal = quoteItems.reduce((sum: number, item) => sum + item.subtotal.toNumber(), 0);

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

        logger.info('Item added to quote successfully', {
          itemId: calculation.itemId,
          quoteId: calculation.quoteId,
          subtotal: calculation.subtotal,
        });

        return calculation;
      } catch (error) {
        logger.error('Error adding item to quote', {
          error: error instanceof Error ? error.message : 'Unknown error',
          modelId: input.modelId,
          quoteId: input.quoteId,
        });

        const errorMessage =
          error instanceof Error ? error.message : 'No se pudo agregar el ítem a la cotización. Intente nuevamente.';
        throw new Error(errorMessage);
      }
    }),
  'calculate-item': publicProcedure
    .input(calculateItemInput)
    .output(calculateItemOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        logger.info('Starting item price calculation', {
          dimensions: { heightMm: input.heightMm, widthMm: input.widthMm },
          glassTypeId: input.glassTypeId,
          modelId: input.modelId,
        });

        // Get model data (needed for ranges, pricing and discounts)
        const model = await ctx.db.model.findUnique({
          include: { manufacturer: true },
          where: { id: input.modelId },
        });

        if (!model || model.status !== 'published') {
          throw new Error('Modelo no encontrado o no disponible');
        }

        // Validate glass type compatibility
        if (!model.compatibleGlassTypeIds.includes(input.glassTypeId)) {
          throw new Error('Tipo de vidrio no compatible con este modelo');
        }

        // Validate dimensions
        if (input.widthMm < model.minWidthMm || input.widthMm > model.maxWidthMm) {
          throw new Error(`Ancho debe estar entre ${model.minWidthMm}mm y ${model.maxWidthMm}mm`);
        }
        if (input.heightMm < model.minHeightMm || input.heightMm > model.maxHeightMm) {
          throw new Error(`Alto debe estar entre ${model.minHeightMm}mm y ${model.maxHeightMm}mm`);
        }

        // Get services data
        const serviceInputs: PriceServiceInput[] = [];
        if (input.services.length > 0) {
          const serviceIds = input.services.map((s) => s.serviceId);
          const services = await ctx.db.service.findMany({
            where: {
              id: { in: serviceIds },
              manufacturerId: model.manufacturerId,
            },
          });

          for (const serviceInput of input.services) {
            const service = services.find((s) => s.id === serviceInput.serviceId);
            if (!service) {
              throw new Error(`Servicio ${serviceInput.serviceId} no encontrado`);
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
        const adjustmentInputs: PriceAdjustmentInput[] = input.adjustments.map((adj) => ({
          concept: adj.concept,
          sign: adj.sign,
          unit: adj.unit,
          value: adj.value,
        }));

        // Fetch glass type for price per m²
        const glassType = await ctx.db.glassType.findUnique({
          where: { id: input.glassTypeId },
        });
        if (!glassType) {
          throw new Error('Tipo de vidrio no encontrado');
        }

        // Calculate price including glass area pricing
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

        logger.info('Item price calculation completed', {
          modelId: input.modelId,
          subtotal: itemCalculation.subtotal,
        });

        return itemCalculation;
      } catch (error) {
        logger.error('Error calculating item price', {
          error: error instanceof Error ? error.message : 'Unknown error',
          modelId: input.modelId,
        });

        const errorMessage =
          error instanceof Error ? error.message : 'No se pudo calcular el precio del ítem. Intente nuevamente.';
        throw new Error(errorMessage);
      }
    }),

  /**
   * Get quote by ID with full details
   * Task: T068 [P] [US5]
   */
  'get-by-id': protectedProcedure
    .input(getQuoteByIdInput)
    .output(getQuoteByIdOutput)
    .query(async ({ ctx, input }) => {
      try {
        logger.info('[US5] Fetching quote by ID', {
          quoteId: input.id,
          userId: ctx.session.user.id,
        });

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
            userId: ctx.session.user.id, // Ensure user owns the quote
          },
        });

        if (!quote) {
          logger.warn('[US5] Quote not found or unauthorized', {
            quoteId: input.id,
            userId: ctx.session.user.id,
          });

          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Cotización no encontrada',
          });
        }

        // Get tenant business name and contact for display (US3)
        const tenant = await getTenantConfigSelect({ businessName: true, contactPhone: true }, ctx.db);

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
            // solutionName omitted (optional field) - TODO: Add solution support
            subtotal: Number(item.subtotal),
            unitPrice: Number(item.subtotal) / item.quantity,
            widthMm: item.widthMm,
          })),
          manufacturerName: tenant.businessName, // REFACTOR: Now from TenantConfig
          projectAddress: {
            projectCity: quote.projectCity ?? '',
            projectName: quote.projectName ?? 'Sin nombre',
            projectPostalCode: quote.projectPostalCode ?? '',
            projectState: quote.projectState ?? '',
            projectStreet: quote.projectStreet ?? '',
          },
          sentAt: quote.sentAt,
          status: quote.status,
          total: Number(quote.total),
          totalUnits: quote.items.reduce((sum, item) => sum + item.quantity, 0),
          // userEmail omitted (optional field)
          validUntil: quote.validUntil,
          vendorContactPhone: tenant.contactPhone, // US3: Vendor contact for confirmation message
        };

        logger.info('[US5] Quote fetched successfully', {
          itemCount: quote.items.length,
          quoteId: input.id,
          userId: ctx.session.user.id,
        });

        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logger.error('[US5] Error fetching quote', {
          error: error instanceof Error ? error.message : 'Unknown error',
          quoteId: input.id,
          userId: ctx.session.user.id,
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No se pudo cargar la cotización. Intente nuevamente.',
        });
      }
    }),

  // =============================================================================
  // Query Procedures (User Story 5 - Quote History)
  // =============================================================================

  /**
   * List user quotes with pagination and filtering
   * Task: T068 [P] [US5]
   */
  'list-user-quotes': protectedProcedure
    .input(listUserQuotesInput)
    .output(listUserQuotesOutput)
    .query(async ({ ctx, input }) => {
      try {
        logger.info('[US5] Fetching user quotes', {
          includeExpired: input.includeExpired,
          limit: input.limit,
          page: input.page,
          search: input.search,
          sortBy: input.sortBy,
          sortOrder: input.sortOrder,
          status: input.status,
          userId: ctx.session.user.id,
        });

        const skip = (input.page - 1) * input.limit;

        // Build where clause with proper AND/OR logic
        const baseWhere = {
          status: input.status,
          userId: ctx.session.user.id,
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
                  mode: 'insensitive' as const,
                },
              },
              {
                projectStreet: {
                  contains: input.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                items: {
                  some: {
                    name: {
                      contains: input.search,
                      mode: 'insensitive' as const,
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
              // biome-ignore lint/style/useNamingConvention: Prisma's _count is a special field
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
            projectName: quote.projectName ?? 'Sin nombre',
            sentAt: quote.sentAt,
            status: quote.status,
            total: Number(quote.total),
            validUntil: quote.validUntil,
          })),
          total,
          totalPages,
        };

        logger.info('[US5] User quotes fetched successfully', {
          count: quotes.length,
          page: input.page,
          total,
          userId: ctx.session.user.id,
        });

        return result;
      } catch (error) {
        logger.error('[US5] Error fetching user quotes', {
          error: error instanceof Error ? error.message : 'Unknown error',
          input,
          userId: ctx.session.user.id,
        });

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'No se pudieron cargar las cotizaciones. Intente nuevamente.',
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
  'send-to-vendor': protectedProcedure
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
        logger.info('Submitting quote', {
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
            throw new Error('Cotización no encontrada');
          }

          if (quote.status !== 'draft') {
            throw new Error('Solo se pueden enviar cotizaciones en estado borrador');
          }

          if (quote.items.length === 0) {
            throw new Error('La cotización debe tener al menos un ítem');
          }

          // Update quote status and contact info
          const updatedQuote = await tx.quote.update({
            data: {
              contactAddress: input.contact.address,
              contactPhone: input.contact.phone,
              status: 'sent',
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
          const tenant = await getTenantConfigSelect({ businessName: true, currency: true }, tx);

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
              logger.info('Quote notification sent successfully', {
                quoteId: input.quoteId,
                recipientEmail: manufacturerEmail,
              });
            } catch (emailError) {
              logger.warn('Failed to send quote notification email', {
                error: emailError instanceof Error ? emailError.message : 'Unknown error',
                quoteId: input.quoteId,
                recipientEmail: manufacturerEmail,
              });
              // Don't fail the transaction if email fails - quote is still submitted
            }
          } else {
            logger.warn('No manufacturer email found for quote notification', {
              quoteId: input.quoteId,
            });
          }

          return {
            quoteId: input.quoteId,
            status: 'sent' as const,
          };
        });

        logger.info('Quote submitted successfully', {
          quoteId: input.quoteId,
        });

        return result;
      } catch (error) {
        logger.error('Error submitting quote', {
          error: error instanceof Error ? error.message : 'Unknown error',
          quoteId: input.quoteId,
        });

        const errorMessage =
          error instanceof Error ? error.message : 'No se pudo enviar la cotización. Intente nuevamente.';
        throw new Error(errorMessage);
      }
    }),
});
