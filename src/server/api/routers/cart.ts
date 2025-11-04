/**
 * Cart Router
 *
 * tRPC procedures for cart (draft quote) management.
 * Cart items are QuoteItem records in draft status quotes.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { calculateItemPrice } from "@/app/(public)/cart/_utils/cart-price-calculator";
import logger from "@/lib/logger";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

const CUID_REGEX = /^c[0-9a-z]{24}$/i;
const UUID_REGEX =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidGlassTypeId = (id: string) =>
	CUID_REGEX.test(id) || UUID_REGEX.test(id);

const isValidItemId = (id: string) => CUID_REGEX.test(id);

/**
 * Update cart item schema
 */
const updateItemSchema = z.object({
	itemId: z.string({ message: "ID de item inválido" }).refine(isValidItemId, {
		message: "ID de item inválido",
	}),
	widthMm: z
		.number({ message: "El ancho es requerido" })
		.int({ message: "El ancho debe ser un número entero" })
		.min(100, { message: "El ancho mínimo es 100mm" })
		.max(3000, { message: "El ancho máximo es 3000mm" }),
	heightMm: z
		.number({ message: "El alto es requerido" })
		.int({ message: "El alto debe ser un número entero" })
		.min(100, { message: "El alto mínimo es 100mm" })
		.max(3000, { message: "El alto máximo es 3000mm" }),
	glassTypeId: z
		.string({ message: "El tipo de vidrio es requerido" })
		.refine(isValidGlassTypeId, {
			message: "ID de tipo de vidrio inválido",
		}),
	name: z.string().max(50, { message: "Máximo 50 caracteres" }).optional(),
	roomLocation: z
		.string()
		.max(100, { message: "Máximo 100 caracteres" })
		.optional(),
	quantity: z
		.number({ message: "La cantidad debe ser un número" })
		.int({ message: "La cantidad debe ser un número entero" })
		.min(1, { message: "La cantidad mínima es 1" })
		.default(1),
});

export const cartRouter = createTRPCRouter({
	/**
	 * Get current user's draft quote (cart)
	 */
	get: publicProcedure.query(async ({ ctx }) => {
		// Require authentication for cart access
		if (!ctx.session?.user) {
			return {
				items: [],
				total: "0",
				isEmpty: true,
			};
		}

		// Find draft quote for current user
		const quote = await ctx.db.quote.findFirst({
			where: {
				status: "draft",
				userId: ctx.session.user.id,
			},
			include: {
				items: {
					include: {
						model: {
							select: {
								id: true,
								name: true,
								imageUrl: true,
								minWidthMm: true,
								maxWidthMm: true,
								minHeightMm: true,
								maxHeightMm: true,
							},
						},
						glassType: {
							select: {
								id: true,
								name: true,
								pricePerSqm: true,
							},
						},
					},
				},
			},
		});

		if (!quote) {
			return {
				items: [],
				total: "0",
				isEmpty: true,
			};
		}

		return {
			id: quote.id,
			items: quote.items,
			total: quote.total.toString(),
			isEmpty: quote.items.length === 0,
		};
	}),

	/**
	 * Update cart item (dimensions, glass type, etc.)
	 */
	updateItem: publicProcedure
		.input(updateItemSchema)
		.mutation(async ({ ctx, input }) => {
			logger.info("Updating cart item", {
				itemId: input.itemId,
				widthMm: input.widthMm,
				heightMm: input.heightMm,
			});

			try {
				// Fetch item with relations in transaction
				const result = await ctx.db.$transaction(async (tx) => {
					// 1. Fetch QuoteItem with model and quote
					const item = await tx.quoteItem.findUnique({
						where: { id: input.itemId },
						include: {
							model: true,
							quote: true,
							glassType: true,
							color: true,
						},
					});

					if (!item) {
						throw new TRPCError({
							code: "NOT_FOUND",
							message: "Item no encontrado",
						});
					}

					// 2. Verify quote is draft
					if (item.quote.status !== "draft") {
						throw new TRPCError({
							code: "BAD_REQUEST",
							message:
								"Solo se pueden editar items de cotizaciones en borrador",
						});
					}

					// 3. Verify ownership (user only - no session support yet)
					const isOwner =
						ctx.session?.user && item.quote.userId === ctx.session.user.id;

					if (!isOwner) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "No tienes permiso para editar este item",
						});
					}

					// 4. Validate dimensions against model constraints
					if (
						input.widthMm < item.model.minWidthMm ||
						input.widthMm > item.model.maxWidthMm
					) {
						throw new TRPCError({
							code: "BAD_REQUEST",
							message: `Ancho debe estar entre ${item.model.minWidthMm}mm y ${item.model.maxWidthMm}mm`,
						});
					}

					if (
						input.heightMm < item.model.minHeightMm ||
						input.heightMm > item.model.maxHeightMm
					) {
						throw new TRPCError({
							code: "BAD_REQUEST",
							message: `Alto debe estar entre ${item.model.minHeightMm}mm y ${item.model.maxHeightMm}mm`,
						});
					}

					// 5. Validate glass type compatibility (if changed)
					if (input.glassTypeId !== item.glassTypeId) {
						const isCompatible = item.model.compatibleGlassTypeIds.includes(
							input.glassTypeId,
						);

						if (!isCompatible) {
							throw new TRPCError({
								code: "BAD_REQUEST",
								message:
									"El vidrio seleccionado no es compatible con el modelo",
							});
						}

						// Fetch new glass type for price recalculation
						const newGlassType = await tx.glassType.findUnique({
							where: { id: input.glassTypeId },
						});

						if (!newGlassType) {
							throw new TRPCError({
								code: "NOT_FOUND",
								message: "Tipo de vidrio no encontrado",
							});
						}
					}

					// 6. Fetch glass type for recalculation
					const glassType = await tx.glassType.findUnique({
						where: { id: input.glassTypeId },
						select: { pricePerSqm: true },
					});

					if (!glassType) {
						throw new TRPCError({
							code: "NOT_FOUND",
							message: "Tipo de vidrio no encontrado",
						});
					}

					// 7. Recalculate subtotal
					const newSubtotal = calculateItemPrice({
						widthMm: input.widthMm,
						heightMm: input.heightMm,
						pricePerM2: glassType.pricePerSqm,
						quantity: input.quantity,
						colorSurchargePercentage: item.colorSurchargePercentage,
					});

					// 8. Update QuoteItem
					const updatedItem = await tx.quoteItem.update({
						where: { id: input.itemId },
						data: {
							widthMm: input.widthMm,
							heightMm: input.heightMm,
							glassTypeId: input.glassTypeId,
							name: input.name ?? item.name,
							roomLocation: input.roomLocation,
							quantity: input.quantity,
							subtotal: newSubtotal,
						},
						include: {
							model: {
								select: {
									id: true,
									name: true,
									imageUrl: true,
								},
							},
							glassType: {
								select: {
									id: true,
									name: true,
									pricePerSqm: true,
								},
							},
						},
					}); // 9. Recalculate quote total
					const allItems = await tx.quoteItem.findMany({
						where: { quoteId: item.quoteId },
						select: { subtotal: true },
					});

					const newTotal = allItems.reduce(
						(sum, item) => sum.add(item.subtotal),
						newSubtotal.mul(0), // Start with Decimal(0)
					);

					// 10. Update Quote total
					await tx.quote.update({
						where: { id: item.quoteId },
						data: { total: newTotal },
					});

					logger.info("Cart item updated successfully", {
						itemId: input.itemId,
						newSubtotal: newSubtotal.toString(),
						newTotal: newTotal.toString(),
					});

					return {
						item: updatedItem,
						quoteTotal: newTotal.toString(),
					};
				});

				return {
					success: true,
					item: result.item,
					quoteTotal: result.quoteTotal,
				};
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}

				logger.error("Failed to update cart item", {
					error,
					itemId: input.itemId,
				});

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error al actualizar el item",
				});
			}
		}),
});
