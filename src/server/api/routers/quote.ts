import { z } from "zod";
import logger from "@/lib/logger";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  calculatePriceItem,
  type PriceAdjustmentInput,
  type PriceServiceInput,
} from "@/server/price/price-item";
import { sendQuoteNotification } from "@/server/services/email";

// Input schemas
export const calculateItemServiceInput = z.object({
  serviceId: z.string().cuid("ID del servicio debe ser válido"),
  quantity: z.number().optional(),
});

export const calculateItemAdjustmentInput = z.object({
  concept: z.string().min(1, "El concepto del ajuste es requerido"),
  unit: z.enum(["unit", "sqm", "ml"]),
  sign: z.enum(["positive", "negative"]),
  value: z.number().min(0, "El valor debe ser mayor o igual a 0"),
});

export const calculateItemInput = z.object({
  modelId: z.string().cuid("ID del modelo debe ser válido"),
  widthMm: z.number().int().min(1, "Ancho debe ser mayor a 0 mm"),
  heightMm: z.number().int().min(1, "Alto debe ser mayor a 0 mm"),
  glassTypeId: z.string().cuid("ID del tipo de vidrio debe ser válido"),
  services: z.array(calculateItemServiceInput).default([]),
  adjustments: z.array(calculateItemAdjustmentInput).default([]),
});

// Output schemas
export const calculateItemServiceOutput = z.object({
  serviceId: z.string(),
  unit: z.enum(["unit", "sqm", "ml"]),
  quantity: z.number(),
  amount: z.number(),
});

export const calculateItemAdjustmentOutput = z.object({
  concept: z.string(),
  amount: z.number(),
});

export const calculateItemOutput = z.object({
  dimPrice: z.number(),
  accPrice: z.number(),
  services: z.array(calculateItemServiceOutput),
  adjustments: z.array(calculateItemAdjustmentOutput),
  subtotal: z.number(),
});

export const addItemInput = calculateItemInput.extend({
  quoteId: z.string().cuid().optional(),
});

export const addItemOutput = z.object({
  quoteId: z.string(),
  itemId: z.string(),
  subtotal: z.number(),
});

export const submitInput = z.object({
  quoteId: z.string().cuid("ID de cotización debe ser válido"),
  contact: z.object({
    phone: z.string().min(1, "Teléfono es requerido"),
    address: z.string().min(1, "Dirección es requerida"),
  }),
});

export const submitOutput = z.object({
  quoteId: z.string(),
  status: z.literal("sent"),
});

export const quoteRouter = createTRPCRouter({
  "calculate-item": publicProcedure
    .input(calculateItemInput)
    .output(calculateItemOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        logger.info("Starting item price calculation", {
          modelId: input.modelId,
          dimensions: { widthMm: input.widthMm, heightMm: input.heightMm },
          glassTypeId: input.glassTypeId,
        });

        // Get model data
        const model = await ctx.db.model.findUnique({
          where: { id: input.modelId },
          include: { manufacturer: true },
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
              manufacturerId: model.manufacturerId,
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
              serviceId: service.id,
              type: service.type,
              unit: service.unit,
              rate: service.rate,
              quantityOverride: serviceInput.quantity,
            });
          }
        }

        // Convert adjustments
        const adjustmentInputs: PriceAdjustmentInput[] = input.adjustments.map(
          (adj) => ({
            concept: adj.concept,
            unit: adj.unit,
            sign: adj.sign,
            value: adj.value,
          })
        );

        // Calculate price
        const result = calculatePriceItem({
          widthMm: input.widthMm,
          heightMm: input.heightMm,
          model: {
            basePrice: model.basePrice,
            costPerMmWidth: model.costPerMmWidth,
            costPerMmHeight: model.costPerMmHeight,
            accessoryPrice: model.accessoryPrice,
          },
          includeAccessory: Boolean(model.accessoryPrice),
          services: serviceInputs,
          adjustments: adjustmentInputs,
        });

        logger.info("Item price calculation completed", {
          modelId: input.modelId,
          subtotal: result.subtotal,
        });

        return result;
      } catch (error) {
        logger.error("Error calculating item price", {
          modelId: input.modelId,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        const errorMessage =
          error instanceof Error
            ? error.message
            : "No se pudo calcular el precio del ítem. Intente nuevamente.";
        throw new Error(errorMessage);
      }
    }),

  "add-item": publicProcedure
    .input(addItemInput)
    .output(addItemOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        logger.info("Adding item to quote", {
          modelId: input.modelId,
          quoteId: input.quoteId,
          dimensions: { widthMm: input.widthMm, heightMm: input.heightMm },
        });

        // First, calculate the item to get the subtotal
        const calculation = await ctx.db.$transaction(async (tx) => {
          // Get model data
          const model = await tx.model.findUnique({
            where: { id: input.modelId },
            include: { manufacturer: true },
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
          let quote;
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
            // Create new quote
            const validUntil = new Date();
            validUntil.setDate(
              validUntil.getDate() + model.manufacturer.quoteValidityDays
            );

            quote = await tx.quote.create({
              data: {
                manufacturerId: model.manufacturerId,
                currency: model.manufacturer.currency,
                validUntil,
                status: "draft",
              },
            });
          }

          // Get services data
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
              const service = services.find(
                (s) => s.id === serviceInput.serviceId
              );
              if (!service) {
                throw new Error(
                  `Servicio ${serviceInput.serviceId} no encontrado`
                );
              }
              serviceInputs.push({
                serviceId: service.id,
                type: service.type,
                unit: service.unit,
                rate: service.rate,
                quantityOverride: serviceInput.quantity,
              });
            }
          }

          // Convert adjustments
          const adjustmentInputs: PriceAdjustmentInput[] =
            input.adjustments.map((adj) => ({
              concept: adj.concept,
              unit: adj.unit,
              sign: adj.sign,
              value: adj.value,
            }));

          // Calculate price
          const calculation = calculatePriceItem({
            widthMm: input.widthMm,
            heightMm: input.heightMm,
            model: {
              basePrice: model.basePrice,
              costPerMmWidth: model.costPerMmWidth,
              costPerMmHeight: model.costPerMmHeight,
              accessoryPrice: model.accessoryPrice,
            },
            includeAccessory: Boolean(model.accessoryPrice),
            services: serviceInputs,
            adjustments: adjustmentInputs,
          });

          // Create quote item
          const quoteItem = await tx.quoteItem.create({
            data: {
              quoteId: quote.id,
              modelId: model.id,
              glassTypeId: input.glassTypeId,
              widthMm: input.widthMm,
              heightMm: input.heightMm,
              accessoryApplied: Boolean(model.accessoryPrice),
              subtotal: calculation.subtotal,
            },
          });

          // Create quote item services
          for (const service of calculation.services) {
            await tx.quoteItemService.create({
              data: {
                quoteItemId: quoteItem.id,
                serviceId: service.serviceId,
                unit: service.unit,
                quantity: service.quantity,
                amount: service.amount,
              },
            });
          }

          // Create adjustments
          for (const adjustment of calculation.adjustments) {
            await tx.adjustment.create({
              data: {
                scope: "item",
                concept: adjustment.concept,
                unit: "unit", // Default unit for item adjustments
                value: 1, // Value is already calculated in amount
                sign: adjustment.amount >= 0 ? "positive" : "negative",
                quoteItemId: quoteItem.id,
                amount: adjustment.amount,
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
            where: { id: quote.id },
            data: { total: newTotal },
          });

          return {
            quoteId: quote.id,
            itemId: quoteItem.id,
            subtotal: calculation.subtotal,
          };
        });

        logger.info("Item added to quote successfully", {
          quoteId: calculation.quoteId,
          itemId: calculation.itemId,
          subtotal: calculation.subtotal,
        });

        return calculation;
      } catch (error) {
        logger.error("Error adding item to quote", {
          modelId: input.modelId,
          quoteId: input.quoteId,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        const errorMessage =
          error instanceof Error
            ? error.message
            : "No se pudo agregar el ítem a la cotización. Intente nuevamente.";
        throw new Error(errorMessage);
      }
    }),

  submit: publicProcedure
    .input(submitInput)
    .output(submitOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        logger.info("Submitting quote", {
          quoteId: input.quoteId,
          contact: input.contact,
        });

        const result = await ctx.db.$transaction(async (tx) => {
          // Get quote with all related data
          const quote = await tx.quote.findUnique({
            where: { id: input.quoteId },
            include: {
              manufacturer: {
                select: {
                  name: true,
                  currency: true,
                  users: {
                    select: { email: true },
                    take: 1, // Get first manufacturer user's email
                  },
                },
              },
              items: {
                select: {
                  subtotal: true,
                },
              },
            },
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
            where: { id: input.quoteId },
            data: {
              status: "sent",
              contactPhone: input.contact.phone,
              contactAddress: input.contact.address,
            },
            include: {
              manufacturer: {
                select: {
                  name: true,
                  currency: true,
                  users: {
                    select: { email: true },
                    take: 1,
                  },
                },
              },
              items: {
                select: {
                  subtotal: true,
                },
              },
            },
          });

          // Send email notification if manufacturer has email
          const manufacturerEmail = updatedQuote.manufacturer.users[0]?.email;
          if (manufacturerEmail) {
            try {
              await sendQuoteNotification(
                {
                  quote: {
                    ...updatedQuote,
                    items: updatedQuote.items.map((item) => ({
                      subtotal: item.subtotal.toNumber(),
                    })),
                  },
                  contactPhone: input.contact.phone,
                  contactAddress: input.contact.address,
                },
                manufacturerEmail
              );
              logger.info("Quote notification sent successfully", {
                quoteId: input.quoteId,
                recipientEmail: manufacturerEmail,
              });
            } catch (emailError) {
              logger.warn("Failed to send quote notification email", {
                quoteId: input.quoteId,
                recipientEmail: manufacturerEmail,
                error:
                  emailError instanceof Error
                    ? emailError.message
                    : "Unknown error",
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
          quoteId: input.quoteId,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        const errorMessage =
          error instanceof Error
            ? error.message
            : "No se pudo enviar la cotización. Intente nuevamente.";
        throw new Error(errorMessage);
      }
    }),
});
