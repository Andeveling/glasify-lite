/**
 * ModelColors tRPC Router
 *
 * Admin operations for assigning colors to models with custom surcharges
 *
 * All procedures use adminProcedure (admin-only access)
 * Includes Winston logging for audit trail
 * Handles default color logic and tenant validation
 *
 * Business Rules:
 * - Each model can have multiple colors
 * - Only one color can be marked as default per model
 * - First assigned color automatically becomes default
 * - Surcharge percentage: 0-100% applied to model base price only
 * - Removing default color auto-promotes next available color
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import logger from "@/lib/logger";
import {
	modelColorAssignSchema,
	modelColorIdSchema,
	modelColorUpdateSurchargeSchema,
	modelIdSchema,
} from "@/lib/validations/model-color";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";

/**
 * ModelColors Router
 */
export const modelColorsRouter = createTRPCRouter({
	/**
	 * List all colors assigned to a specific model
	 * Returns colors with assignment details, ordered by default first
	 */
	listByModel: adminProcedure
		.input(modelIdSchema)
		.query(async ({ ctx, input }) => {
			try {
				const modelColors = await ctx.db.modelColor.findMany({
					where: {
						modelId: input.modelId,
						color: {
							isActive: true, // Only show active colors
						},
					},
					include: {
						color: true,
					},
					orderBy: [
						{ isDefault: "desc" }, // Default first
						{ color: { name: "asc" } }, // Then alphabetically
					],
				});

				logger.info("Model colors list retrieved", {
					userId: ctx.session?.user.id,
					modelId: input.modelId,
					count: modelColors.length,
				});

				return modelColors;
			} catch (error) {
				logger.error("Failed to list model colors", {
					error,
					userId: ctx.session?.user.id,
					modelId: input.modelId,
				});
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error al obtener los colores del modelo",
				});
			}
		}),

	/**
	 * Get available colors for assignment (not yet assigned to this model)
	 * Used to populate "Add Color" dropdown
	 */
	getAvailableColors: adminProcedure
		.input(modelIdSchema)
		.query(async ({ ctx, input }) => {
			try {
				// Get IDs of colors already assigned to this model
				const assignedColorIds = await ctx.db.modelColor.findMany({
					where: { modelId: input.modelId },
					select: { colorId: true },
				});

				const assignedIds = assignedColorIds.map((mc) => mc.colorId);

				// Find all active colors NOT in the assigned list
				const availableColors = await ctx.db.color.findMany({
					where: {
						isActive: true,
						id: {
							notIn: assignedIds,
						},
					},
					orderBy: { name: "asc" },
				});

				logger.info("Available colors retrieved", {
					userId: ctx.session?.user.id,
					modelId: input.modelId,
					count: availableColors.length,
				});

				return availableColors;
			} catch (error) {
				logger.error("Failed to get available colors", {
					error,
					userId: ctx.session?.user.id,
					modelId: input.modelId,
				});
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error al obtener colores disponibles",
				});
			}
		}),

	/**
	 * Assign a color to a model with custom surcharge percentage
	 * Handles default color logic and tenant validation
	 */
	assign: adminProcedure
		.input(modelColorAssignSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				// Verify model exists and user has access (tenant validation)
				const model = await ctx.db.model.findUnique({
					where: { id: input.modelId },
					select: { id: true },
				});

				if (!model) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Modelo no encontrado",
					});
				}

				// Verify color exists and is active
				const color = await ctx.db.color.findUnique({
					where: { id: input.colorId },
					select: { id: true, isActive: true, name: true },
				});

				if (!color) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Color no encontrado",
					});
				}

				if (!color.isActive) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "No se puede asignar un color inactivo",
					});
				}

				// Check if this is the first color for this model
				const existingCount = await ctx.db.modelColor.count({
					where: { modelId: input.modelId },
				});

				const shouldBeDefault = existingCount === 0 || input.isDefault;

				// Execute assignment in transaction
				const modelColor = await ctx.db.$transaction(async (tx) => {
					// If setting as default, unset all other defaults for this model
					if (shouldBeDefault) {
						await tx.modelColor.updateMany({
							where: { modelId: input.modelId },
							data: { isDefault: false },
						});
					}

					// Create the assignment
					return tx.modelColor.create({
						data: {
							modelId: input.modelId,
							colorId: input.colorId,
							surchargePercentage: input.surchargePercentage,
							isDefault: shouldBeDefault,
						},
						include: {
							color: true,
						},
					});
				});

				logger.info("Color assigned to model", {
					userId: ctx.session?.user.id,
					modelId: input.modelId,
					colorId: input.colorId,
					colorName: color.name,
					surchargePercentage: input.surchargePercentage,
					isDefault: shouldBeDefault,
				});

				return modelColor;
			} catch (error) {
				// Handle unique constraint violation (color already assigned)
				if (
					error instanceof Error &&
					"code" in error &&
					error.code === "P2002"
				) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Este color ya está asignado al modelo",
					});
				}

				// Re-throw TRPCErrors
				if (error instanceof TRPCError) {
					throw error;
				}

				logger.error("Failed to assign color to model", {
					error,
					userId: ctx.session?.user.id,
					input,
				});

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error al asignar color al modelo",
				});
			}
		}),

	/**
	 * Update surcharge percentage for an existing color assignment
	 */
	updateSurcharge: adminProcedure
		.input(modelColorUpdateSurchargeSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				const updated = await ctx.db.modelColor.update({
					where: { id: input.id },
					data: {
						surchargePercentage: input.surchargePercentage,
					},
					include: {
						color: true,
						model: { select: { name: true } },
					},
				});

				logger.info("Model color surcharge updated", {
					userId: ctx.session?.user.id,
					modelColorId: input.id,
					modelName: updated.model.name,
					colorName: updated.color.name,
					newSurcharge: input.surchargePercentage,
				});

				return updated;
			} catch (error) {
				if (
					error instanceof Error &&
					"code" in error &&
					error.code === "P2025"
				) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Asignación de color no encontrada",
					});
				}

				logger.error("Failed to update surcharge", {
					error,
					userId: ctx.session?.user.id,
					input,
				});

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error al actualizar recargo de color",
				});
			}
		}),

	/**
	 * Set a color as the default for a model
	 * Unsets all other defaults for the same model in a transaction
	 */
	setDefault: adminProcedure
		.input(modelColorIdSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				// Get the ModelColor to find its modelId
				const modelColor = await ctx.db.modelColor.findUnique({
					where: { id: input.id },
					select: { modelId: true, color: { select: { name: true } } },
				});

				if (!modelColor) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Asignación de color no encontrada",
					});
				}

				// Execute in transaction: unset all defaults, set new default
				const updated = await ctx.db.$transaction(async (tx) => {
					// Unset all defaults for this model
					await tx.modelColor.updateMany({
						where: { modelId: modelColor.modelId },
						data: { isDefault: false },
					});

					// Set the target as default
					return tx.modelColor.update({
						where: { id: input.id },
						data: { isDefault: true },
						include: {
							color: true,
						},
					});
				});

				logger.info("Default color set for model", {
					userId: ctx.session?.user.id,
					modelColorId: input.id,
					modelId: modelColor.modelId,
					colorName: modelColor.color.name,
				});

				return updated;
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}

				logger.error("Failed to set default color", {
					error,
					userId: ctx.session?.user.id,
					input,
				});

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error al establecer color por defecto",
				});
			}
		}),

	/**
	 * Remove color assignment from model
	 * If removing default, auto-promotes next available color
	 */
	unassign: adminProcedure
		.input(modelColorIdSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				// Get the assignment details before deletion
				const modelColor = await ctx.db.modelColor.findUnique({
					where: { id: input.id },
					select: {
						modelId: true,
						isDefault: true,
						color: { select: { name: true } },
					},
				});

				if (!modelColor) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Asignación de color no encontrada",
					});
				}

				// Execute in transaction
				await ctx.db.$transaction(async (tx) => {
					// Delete the assignment (CASCADE handles related data)
					await tx.modelColor.delete({
						where: { id: input.id },
					});

					// If we deleted the default, promote the next available color
					if (modelColor.isDefault) {
						const nextColor = await tx.modelColor.findFirst({
							where: { modelId: modelColor.modelId },
							orderBy: { createdAt: "asc" },
						});

						if (nextColor) {
							await tx.modelColor.update({
								where: { id: nextColor.id },
								data: { isDefault: true },
							});
						}
					}
				});

				logger.info("Color unassigned from model", {
					userId: ctx.session?.user.id,
					modelColorId: input.id,
					modelId: modelColor.modelId,
					colorName: modelColor.color.name,
					wasDefault: modelColor.isDefault,
				});

				return { success: true };
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}

				logger.error("Failed to unassign color", {
					error,
					userId: ctx.session?.user.id,
					input,
				});

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error al desasignar color del modelo",
				});
			}
		}),

	/**
	 * Bulk assign multiple colors to a model
	 * First color in array becomes default if no default exists
	 * Uses createMany with skipDuplicates for idempotency
	 */
	bulkAssign: adminProcedure
		.input(
			z.object({
				modelId: z.string().cuid(),
				assignments: z.array(
					z.object({
						colorId: z.string().cuid(),
						surchargePercentage: z.number().min(0).max(100),
					}),
				),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				// Verify model exists
				const model = await ctx.db.model.findUnique({
					where: { id: input.modelId },
					select: { id: true },
				});

				if (!model) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Modelo no encontrado",
					});
				}

				// Check if model already has a default color
				const hasDefault = await ctx.db.modelColor.findFirst({
					where: {
						modelId: input.modelId,
						isDefault: true,
					},
				});

				// Execute in transaction
				const result = await ctx.db.$transaction(async (tx) => {
					// Create all assignments
					const created = await tx.modelColor.createMany({
						data: input.assignments.map((assignment, index) => ({
							modelId: input.modelId,
							colorId: assignment.colorId,
							surchargePercentage: assignment.surchargePercentage,
							// First color becomes default only if no default exists
							isDefault: !hasDefault && index === 0,
						})),
						skipDuplicates: true,
					});

					return created;
				});

				logger.info("Bulk color assignment completed", {
					userId: ctx.session?.user.id,
					modelId: input.modelId,
					assignedCount: result.count,
					totalRequested: input.assignments.length,
				});

				return result;
			} catch (error) {
				if (error instanceof TRPCError) {
					throw error;
				}

				logger.error("Failed to bulk assign colors", {
					error,
					userId: ctx.session?.user.id,
					input,
				});

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error al asignar colores en lote",
				});
			}
		}),
});
