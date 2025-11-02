/**
 * Glass Type tRPC Router
 *
 * Admin CRUD operations for GlassType entity
 *
 * All procedures use adminProcedure (admin-only access)
 * Includes Winston logging for audit trail
 * Includes referential integrity check for deletions
 * Includes automatic price history creation on updates
 * Handles Many-to-Many relationships: solutions, characteristics
 */

import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import logger from "@/lib/logger";
import {
	createGlassTypeSchema,
	deleteGlassTypeSchema,
	getGlassTypeByIdOutputSchema,
	listGlassTypesSchema,
	updateGlassTypeSchema,
} from "@/lib/validations/admin/glass-type.schema";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { canDeleteGlassType } from "@/server/services/referential-integrity.service";

/**
 * Helper: Build where clause for list query
 */
function buildWhereClause(input: {
	search?: string;
	solutionId?: string;
	isActive?: boolean;
	thicknessMin?: number;
	thicknessMax?: number;
}): Prisma.GlassTypeWhereInput {
	const where: Prisma.GlassTypeWhereInput = {};

	// Search by name, code, or description
	if (input.search) {
		where.OR = [
			{
				name: {
					contains: input.search,
					mode: "insensitive",
				},
			},
			{
				code: {
					contains: input.search,
					mode: "insensitive",
				},
			},
			{
				description: {
					contains: input.search,
					mode: "insensitive",
				},
			},
		];
	}

	// Filter by assigned solution
	if (input.solutionId) {
		where.solutions = {
			some: {
				solutionId: input.solutionId,
			},
		};
	}

	// Filter by active status
	if (input.isActive !== undefined) {
		where.isActive = input.isActive;
	}

	// Filter by thickness range
	if (input.thicknessMin !== undefined || input.thicknessMax !== undefined) {
		where.thicknessMm = {};

		if (input.thicknessMin !== undefined) {
			where.thicknessMm.gte = input.thicknessMin;
		}

		if (input.thicknessMax !== undefined) {
			where.thicknessMm.lte = input.thicknessMax;
		}
	}

	return where;
}

/**
 * Helper: Build orderBy clause for list query
 */
function buildOrderByClause(
	sortBy: string,
	sortOrder: "asc" | "desc",
): Prisma.GlassTypeOrderByWithRelationInput {
	const orderBy: Prisma.GlassTypeOrderByWithRelationInput = {};

	switch (sortBy) {
		case "name":
			orderBy.name = sortOrder;
			break;
		case "code":
			orderBy.code = sortOrder;
			break;
		case "thicknessMm":
			orderBy.thicknessMm = sortOrder;
			break;
		case "manufacturer":
			orderBy.manufacturer = sortOrder;
			break;
		case "createdAt":
			orderBy.createdAt = sortOrder;
			break;
		default:
			orderBy.name = "asc"; // Default sort
	}

	return orderBy;
}

/**
 * Glass Type Router
 */
export const glassTypeRouter = createTRPCRouter({
	/**
	 * Create Glass Type
	 * POST /api/trpc/admin/glassType.create
	 *
	 * Creates a new glass type with solutions and characteristics
	 */
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex CRUD with multiple validation steps required
	create: adminProcedure
		.input(createGlassTypeSchema)
		.mutation(async ({ ctx, input }) => {
			// Check for duplicate name
			const existingByName = await ctx.db.glassType.findFirst({
				where: { name: input.name },
			});

			if (existingByName) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Ya existe un tipo de vidrio con este nombre",
				});
			}

			// Validate all solution IDs exist and are active
			if (input.solutions.length > 0) {
				const solutionIds = input.solutions.map((s) => s.solutionId);
				const foundSolutions = await ctx.db.glassSolution.findMany({
					where: { id: { in: solutionIds } },
				});

				if (foundSolutions.length !== solutionIds.length) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Una o más soluciones no fueron encontradas",
					});
				}

				const inactiveSolution = foundSolutions.find((s) => !s.isActive);
				if (inactiveSolution) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `La solución "${inactiveSolution.nameEs}" está inactiva`,
					});
				}
			}

			// Validate all characteristic IDs exist and are active
			if (input.characteristics.length > 0) {
				const characteristicIds = input.characteristics.map(
					(c) => c.characteristicId,
				);
				const foundCharacteristics = await ctx.db.glassCharacteristic.findMany({
					where: { id: { in: characteristicIds } },
				});

				if (foundCharacteristics.length !== characteristicIds.length) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Una o más características no fueron encontradas",
					});
				}

				const inactiveCharacteristic = foundCharacteristics.find(
					(c) => !c.isActive,
				);
				if (inactiveCharacteristic) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `La característica "${inactiveCharacteristic.nameEs}" está inactiva`,
					});
				}
			}

			// Create glass type with nested creates
			const { solutions, characteristics, ...baseData } = input;

			const glassType = await ctx.db.glassType.create({
				data: {
					...baseData,
					characteristics: {
						create: characteristics.map((char) => ({
							certification: char.certification,
							characteristicId: char.characteristicId,
							notes: char.notes,
							value: char.value,
						})),
					},
					solutions: {
						create: solutions.map((sol) => ({
							isPrimary: sol.isPrimary,
							notes: sol.notes,
							performanceRating: sol.performanceRating,
							solutionId: sol.solutionId,
						})),
					},
				},
				include: {
					characteristics: {
						include: {
							characteristic: true,
						},
					},
					solutions: {
						include: {
							solution: true,
						},
					},
				},
			});

			logger.info("Glass type created", {
				characteristicsCount: characteristics.length,
				glassTypeId: glassType.id,
				glassTypeName: glassType.name,
				solutionsCount: solutions.length,
				userId: ctx.session.user.id,
			});

			return glassType;
		}),

	/**
	 * Delete Glass Type
	 * DELETE /api/trpc/admin/glassType.delete
	 *
	 * Deletes a glass type if no quote items are associated
	 * Uses referential integrity service to check dependencies
	 * Cascades to solutions and characteristics (handled by Prisma)
	 */
	delete: adminProcedure
		.input(deleteGlassTypeSchema)
		.mutation(async ({ ctx, input }) => {
			// Check if exists
			const existing = await ctx.db.glassType.findUnique({
				where: { id: input.id },
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Tipo de vidrio no encontrado",
				});
			}

			// Check referential integrity
			const integrityCheck = await canDeleteGlassType(input.id);

			if (!integrityCheck.canDelete) {
				throw new TRPCError({
					code: "CONFLICT",
					message: integrityCheck.message,
				});
			}

			// Delete glass type (cascades to solutions, characteristics, price history)
			await ctx.db.glassType.delete({
				where: { id: input.id },
			});

			logger.warn("Glass type deleted", {
				glassTypeId: input.id,
				glassTypeName: existing.name,
				userId: ctx.session.user.id,
			});

			return { success: true };
		}),

	/**
	 * Get Glass Type by ID
	 * GET /api/trpc/admin/glassType.getById
	 *
	 * Returns full glass type details with solutions, characteristics, and supplier
	 */
	getById: adminProcedure
		.input(deleteGlassTypeSchema)
		.output(getGlassTypeByIdOutputSchema)
		.query(async ({ ctx, input }) => {
			const glassType = await ctx.db.glassType.findUnique({
				include: {
					// biome-ignore lint/style/useNamingConvention: Prisma special _count field
					_count: {
						select: {
							characteristics: true,
							quoteItems: true,
							solutions: true,
						},
					},
					characteristics: {
						include: {
							characteristic: {
								select: {
									category: true,
									id: true,
									key: true,
									name: true,
									nameEs: true,
								},
							},
						},
						orderBy: {
							characteristic: {
								sortOrder: "asc",
							},
						},
					},
					solutions: {
						include: {
							solution: {
								select: {
									icon: true,
									id: true,
									key: true,
									name: true,
									nameEs: true,
								},
							},
						},
						orderBy: [
							{
								isPrimary: "desc",
							},
							{
								solution: {
									sortOrder: "asc",
								},
							},
						],
					},
				},
				where: { id: input.id },
			});

			if (!glassType) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Tipo de vidrio no encontrado",
				});
			}

			// Serialize Prisma Decimal fields to numbers to match the output schema
			const serializedGlassType = {
				...glassType,
				lightTransmission: glassType.lightTransmission?.toNumber() ?? null,
				solarFactor: glassType.solarFactor?.toNumber() ?? null,
				uValue: glassType.uValue?.toNumber() ?? null,
			};

			logger.info("Glass type retrieved", {
				glassTypeId: input.id,
				glassTypeName: glassType.name,
				userId: ctx.session.user.id,
			});

			return serializedGlassType;
		}),

	/**
	 * List Glass Types
	 * GET /api/trpc/admin/glassType.list
	 *
	 * Supports pagination, search, filtering, and sorting
	 * Includes solution and supplier info in results
	 */
	list: adminProcedure
		.input(listGlassTypesSchema)
		.query(async ({ ctx, input }) => {
			const { page, limit, sortBy, sortOrder, isActive, ...restFilters } =
				input;

			const where = buildWhereClause({
				...restFilters,
				isActive: isActive
					? isActive === "all"
						? undefined
						: isActive === "active"
					: undefined,
			});
			const orderBy = buildOrderByClause(sortBy, sortOrder);

			// Get total count
			const total = await ctx.db.glassType.count({ where });

			// Get paginated items with related data
			const items = await ctx.db.glassType.findMany({
				include: {
					// biome-ignore lint/style/useNamingConvention: Prisma special _count field
					_count: {
						select: {
							characteristics: true,
							quoteItems: true,
							solutions: true,
						},
					},
					solutions: {
						include: {
							solution: {
								select: {
									id: true,
									key: true,
									nameEs: true,
								},
							},
						},
						orderBy: [
							{
								isPrimary: "desc",
							},
							{
								solution: {
									sortOrder: "asc",
								},
							},
						],
					},
				},
				orderBy,
				skip: (page - 1) * limit,
				take: limit,
				where,
			});

			const totalPages = Math.ceil(total / limit);

			logger.info("Glass types listed", {
				itemCount: items.length,
				page,
				total,
				userId: ctx.session.user.id,
			});

			return {
				items,
				limit,
				page,
				total,
				totalPages,
			};
		}),

	/**
	 * Update Glass Type
	 * PUT /api/trpc/admin/glassType.update
	 *
	 * Updates glass type with optional solutions/characteristics replacement
	 * Creates price history record if pricePerSqm changes
	 */
	// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Complex CRUD with multiple validation steps required
	update: adminProcedure
		.input(updateGlassTypeSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, data } = input;

			// Check if exists
			const existing = await ctx.db.glassType.findUnique({
				where: { id },
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Tipo de vidrio no encontrado",
				});
			}

			// Check for duplicate name (excluding current)
			if (data.name) {
				const existingByName = await ctx.db.glassType.findFirst({
					where: {
						AND: [{ name: data.name }, { NOT: { id } }],
					},
				});

				if (existingByName) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Ya existe un tipo de vidrio con este nombre",
					});
				}
			}

			// Validate solutions (if provided)
			if (data.solutions && data.solutions.length > 0) {
				const solutionIds = data.solutions.map((s) => s.solutionId);
				const updatedSolutions = await ctx.db.glassSolution.findMany({
					where: { id: { in: solutionIds } },
				});

				if (updatedSolutions.length !== solutionIds.length) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Una o más soluciones no fueron encontradas",
					});
				}

				const inactiveSolution = updatedSolutions.find((s) => !s.isActive);
				if (inactiveSolution) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `La solución "${inactiveSolution.nameEs}" está inactiva`,
					});
				}
			}

			// Validate characteristics (if provided)
			if (data.characteristics && data.characteristics.length > 0) {
				const characteristicIds = data.characteristics.map(
					(c) => c.characteristicId,
				);
				const updatedCharacteristics =
					await ctx.db.glassCharacteristic.findMany({
						where: { id: { in: characteristicIds } },
					});

				if (updatedCharacteristics.length !== characteristicIds.length) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Una o más características no fueron encontradas",
					});
				}

				const inactiveCharacteristic = updatedCharacteristics.find(
					(c) => !c.isActive,
				);
				if (inactiveCharacteristic) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: `La característica "${inactiveCharacteristic.nameEs}" está inactiva`,
					});
				}
			}

			// Extract solutions and characteristics from data
			const { solutions, characteristics, ...baseData } = data;

			// Prepare update data
			const updateData: Prisma.GlassTypeUpdateInput = { ...baseData };

			// Replace solutions (delete all, create new)
			if (solutions !== undefined) {
				updateData.solutions = {
					create: solutions.map((sol) => ({
						isPrimary: sol.isPrimary,
						notes: sol.notes,
						performanceRating: sol.performanceRating,
						solutionId: sol.solutionId,
					})),
					deleteMany: {},
				};
			}

			// Replace characteristics (delete all, create new)
			if (characteristics !== undefined) {
				updateData.characteristics = {
					create: characteristics.map((char) => ({
						certification: char.certification,
						characteristicId: char.characteristicId,
						notes: char.notes,
						value: char.value,
					})),
					deleteMany: {},
				};
			}

			// Update glass type
			const glassType = await ctx.db.glassType.update({
				data: updateData,
				include: {
					characteristics: {
						include: {
							characteristic: true,
						},
					},
					solutions: {
						include: {
							solution: true,
						},
					},
				},
				where: { id },
			});

			logger.info("Glass type updated", {
				characteristicsReplaced: characteristics !== undefined,
				glassTypeId: glassType.id,
				glassTypeName: glassType.name,
				solutionsReplaced: solutions !== undefined,
				userId: ctx.session.user.id,
			});

			return glassType;
		}),
});
