/**
 * Model (Window/Door Product) tRPC Router
 *
 * Admin CRUD operations for Model entity
 *
 * All procedures use adminProcedure (admin-only access)
 * Includes Winston logging for audit trail
 * Includes referential integrity check for deletions
 * Includes automatic price history creation on updates
 * Validates compatible glass types exist and are active
 */

import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import logger from "@/lib/logger";
import {
  addCostBreakdownSchema,
  createModelSchema,
  deleteCostBreakdownSchema,
  deleteModelSchema,
  getModelByIdSchema,
  listModelsSchema,
  updateCostBreakdownSchema,
  updateModelSchema,
} from "@/lib/validations/admin/model.schema";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { createModelPriceHistory } from "@/server/services/model-price-history.service";
import { canDeleteModel } from "@/server/services/referential-integrity.service";

/**
 * Helper: Build where clause for list query
 */
function buildWhereClause(input: {
  search?: string;
  status?: "all" | "draft" | "published";
  profileSupplierId?: string;
}): Prisma.ModelWhereInput {
  const where: Prisma.ModelWhereInput = {};

  // Search by name
  if (input.search) {
    where.name = {
      contains: input.search,
      mode: "insensitive",
    };
  }

  // Filter by status
  if (input.status && input.status !== "all") {
    where.status = input.status;
  }

  // Filter by profile supplier
  if (input.profileSupplierId) {
    where.profileSupplierId = input.profileSupplierId;
  }

  return where;
}

/**
 * Helper: Build orderBy clause for list query
 */
function buildOrderByClause(
  sortBy: string,
  sortOrder: "asc" | "desc"
): Prisma.ModelOrderByWithRelationInput {
  const orderBy: Prisma.ModelOrderByWithRelationInput = {};

  switch (sortBy) {
    case "name":
      orderBy.name = sortOrder;
      break;
    case "basePrice":
      orderBy.basePrice = sortOrder;
      break;
    case "updatedAt":
      orderBy.updatedAt = sortOrder;
      break;
    default:
      orderBy.createdAt = sortOrder;
  }

  return orderBy;
}

/**
 * Model Router
 */
export const modelRouter = createTRPCRouter({
  /**
   * Add Cost Breakdown Component
   * POST /api/trpc/admin.model['add-cost-breakdown']
   *
   * Adds a new cost component to a model's cost breakdown
   */
  "add-cost-breakdown": adminProcedure
    .input(addCostBreakdownSchema)
    .mutation(async ({ ctx, input }) => {
      const { modelId, data } = input;

      // Verify model exists
      const model = await ctx.db.model.findUnique({
        select: { id: true, name: true },
        where: { id: modelId },
      });

      if (!model) {
        logger.warn("Model not found for cost breakdown addition", {
          modelId,
          userId: ctx.session.user.id,
        });
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Modelo no encontrado",
        });
      }

      // Create cost breakdown component
      const costBreakdown = await ctx.db.modelCostBreakdown.create({
        data: {
          ...data,
          modelId,
        },
      });

      logger.info("Cost breakdown component added", {
        component: costBreakdown.component,
        costBreakdownId: costBreakdown.id,
        costType: costBreakdown.costType,
        modelId: model.id,
        modelName: model.name,
        userId: ctx.session.user.id,
      });

      return costBreakdown;
    }),
  /**
   * Create Model
   * POST /api/trpc/admin.model.create
   *
   * Creates a new model and validates compatible glass types
   */
  create: adminProcedure
    .input(createModelSchema)
    .mutation(async ({ ctx, input }) => {
      // Validate all compatible glass types exist and are active
      const glassTypes = await ctx.db.glassType.findMany({
        select: {
          id: true,
          isActive: true,
        },
        where: {
          id: {
            in: input.compatibleGlassTypeIds,
          },
        },
      });

      // Check if all IDs were found
      if (glassTypes.length !== input.compatibleGlassTypeIds.length) {
        const foundIds = glassTypes.map((gt) => gt.id);
        const missingIds = input.compatibleGlassTypeIds.filter(
          (id) => !foundIds.includes(id)
        );

        logger.warn("Invalid glass type IDs in model creation", {
          missingIds,
          userId: ctx.session.user.id,
        });

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Tipos de vidrio no encontrados: ${missingIds.join(", ")}`,
        });
      }

      // Check if all are active
      const inactiveGlassTypes = glassTypes.filter((gt) => !gt.isActive);
      if (inactiveGlassTypes.length > 0) {
        const inactiveIds = inactiveGlassTypes.map((gt) => gt.id);

        logger.warn("Inactive glass types in model creation", {
          inactiveIds,
          userId: ctx.session.user.id,
        });

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Los siguientes tipos de vidrio están inactivos: ${inactiveIds.join(", ")}`,
        });
      }

      // Create model
      const model = await ctx.db.model.create({
        data: input,
        include: {
          profileSupplier: true,
        },
      });

      logger.info("Model created", {
        compatibleGlassTypeIds: input.compatibleGlassTypeIds,
        modelId: model.id,
        modelName: model.name,
        userId: ctx.session.user.id,
      });

      return model;
    }),

  /**
   * Delete Model
   * DELETE /api/trpc/admin.model.delete
   *
   * Deletes model after checking referential integrity
   */
  delete: adminProcedure
    .input(deleteModelSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if model exists
      const existingModel = await ctx.db.model.findUnique({
        select: { id: true, name: true },
        where: { id: input.id },
      });

      if (!existingModel) {
        logger.warn("Model not found for deletion", {
          modelId: input.id,
          userId: ctx.session.user.id,
        });

        throw new TRPCError({
          code: "NOT_FOUND",
          message: "El modelo no existe o ya fue eliminado",
        });
      }

      // Check referential integrity
      const integrityCheck = await canDeleteModel(input.id);

      if (!integrityCheck.canDelete) {
        logger.warn("Model deletion blocked - referential integrity", {
          dependencies: integrityCheck.dependencies,
          modelId: input.id,
          userId: ctx.session.user.id,
        });

        throw new TRPCError({
          code: "CONFLICT",
          message: integrityCheck.message,
        });
      }

      // Delete model (cascade deletes costBreakdown and priceHistory)
      const deletedModel = await ctx.db.model.delete({
        where: { id: input.id },
      });

      logger.info("Model deleted", {
        modelId: deletedModel.id,
        modelName: deletedModel.name,
        userId: ctx.session.user.id,
      });

      return { success: true };
    }),

  /**
   * Delete Cost Breakdown Component
   * DELETE /api/trpc/admin.model['delete-cost-breakdown']
   *
   * Removes a cost component from a model's cost breakdown
   */
  "delete-cost-breakdown": adminProcedure
    .input(deleteCostBreakdownSchema)
    .mutation(async ({ ctx, input }) => {
      const costBreakdown = await ctx.db.modelCostBreakdown.findUnique({
        include: {
          model: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        where: { id: input.id },
      });

      if (!costBreakdown) {
        logger.warn("Cost breakdown component not found for deletion", {
          costBreakdownId: input.id,
          userId: ctx.session.user.id,
        });
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Componente de costo no encontrado",
        });
      }

      await ctx.db.modelCostBreakdown.delete({
        where: { id: input.id },
      });

      logger.info("Cost breakdown component deleted", {
        component: costBreakdown.component,
        costBreakdownId: costBreakdown.id,
        modelId: costBreakdown.model.id,
        modelName: costBreakdown.model.name,
        userId: ctx.session.user.id,
      });

      return { success: true };
    }),

  /**
   * Get Model by ID
   * GET /api/trpc/admin.model['get-by-id']
   *
   * Returns detailed model information including cost breakdown and price history
   */
  "get-by-id": adminProcedure
    .input(getModelByIdSchema)
    .query(async ({ ctx, input }) => {
      const model = await ctx.db.model.findUnique({
        include: {
          costBreakdown: {
            orderBy: {
              createdAt: "asc",
            },
          },
          priceHistory: {
            orderBy: {
              createdAt: "desc",
            },
            take: 10, // Last 10 price changes
          },
          profileSupplier: {
            select: {
              id: true,
              materialType: true,
              name: true,
            },
          },
        },
        where: { id: input.id },
      });

      if (!model) {
        logger.warn("Model not found", {
          modelId: input.id,
          userId: ctx.session.user.id,
        });
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Modelo no encontrado",
        });
      }

      logger.info("Model retrieved", {
        modelId: model.id,
        userId: ctx.session.user.id,
      });

      return model;
    }),
  /**
   * List Models
   * GET /api/trpc/admin.model.list
   *
   * Returns paginated list of models with filtering and sorting
   */
  list: adminProcedure.input(listModelsSchema).query(async ({ ctx, input }) => {
    const {
      limit,
      page,
      search,
      sortBy,
      sortOrder,
      status,
      profileSupplierId,
    } = input;

    const where = buildWhereClause({ profileSupplierId, search, status });
    const orderBy = buildOrderByClause(sortBy, sortOrder);

    // Execute count and find queries in parallel
    const [total, items] = await Promise.all([
      ctx.db.model.count({ where }),
      ctx.db.model.findMany({
        include: {
          profileSupplier: {
            select: {
              id: true,
              materialType: true,
              name: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        where,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    logger.info("Models listed", {
      count: items.length,
      filters: { profileSupplierId, search, status },
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
   * Update Model
   * PATCH /api/trpc/admin.model.update
   *
   * Updates model and creates price history if pricing changes
   */
  update: adminProcedure
    .input(updateModelSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, id } = input;

      // Fetch current model to check for price changes
      const currentModel = await ctx.db.model.findUnique({
        select: {
          basePrice: true,
          costPerMmHeight: true,
          costPerMmWidth: true,
          id: true,
        },
        where: { id },
      });

      if (!currentModel) {
        logger.warn("Model not found for update", {
          modelId: id,
          userId: ctx.session.user.id,
        });
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Modelo no encontrado",
        });
      }

      // Validate compatible glass types if provided
      if (
        data.compatibleGlassTypeIds &&
        data.compatibleGlassTypeIds.length > 0
      ) {
        const glassTypes = await ctx.db.glassType.findMany({
          select: {
            id: true,
            isActive: true,
          },
          where: {
            id: {
              in: data.compatibleGlassTypeIds,
            },
          },
        });

        if (glassTypes.length !== data.compatibleGlassTypeIds.length) {
          const foundIds = glassTypes.map((gt) => gt.id);
          const missingGlassTypeIds = data.compatibleGlassTypeIds.filter(
            (glassTypeId) => !foundIds.includes(glassTypeId)
          );

          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Tipos de vidrio no encontrados: ${missingGlassTypeIds.join(", ")}`,
          });
        }

        const inactiveGlassTypes = glassTypes.filter((gt) => !gt.isActive);
        if (inactiveGlassTypes.length > 0) {
          const inactiveIds = inactiveGlassTypes.map((gt) => gt.id);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Los siguientes tipos de vidrio están inactivos: ${inactiveIds.join(", ")}`,
          });
        }
      }

      // Check if pricing fields changed (compare Decimal values)
      const priceChanged =
        (data.basePrice !== undefined &&
          data.basePrice.toString() !== currentModel.basePrice.toString()) ||
        (data.costPerMmWidth !== undefined &&
          data.costPerMmWidth.toString() !==
            currentModel.costPerMmWidth.toString()) ||
        (data.costPerMmHeight !== undefined &&
          data.costPerMmHeight.toString() !==
            currentModel.costPerMmHeight.toString());

      // Update model
      const updatedModel = await ctx.db.model.update({
        data,
        include: {
          profileSupplier: true,
        },
        where: { id },
      });

      // Create price history entry if price changed
      if (priceChanged) {
        await createModelPriceHistory({
          basePrice: updatedModel.basePrice.toNumber(),
          costPerMmHeight: updatedModel.costPerMmHeight.toNumber(),
          costPerMmWidth: updatedModel.costPerMmWidth.toNumber(),
          createdBy: ctx.session.user.id,
          modelId: updatedModel.id,
          reason: "Actualización manual desde panel de administración",
        });

        logger.info("Model price history created", {
          modelId: updatedModel.id,
          newBasePrice: updatedModel.basePrice.toString(),
          userId: ctx.session.user.id,
        });
      }

      logger.info("Model updated", {
        modelId: updatedModel.id,
        priceChanged,
        userId: ctx.session.user.id,
      });

      return updatedModel;
    }),

  /**
   * Update Cost Breakdown Component
   * PATCH /api/trpc/admin.model['update-cost-breakdown']
   *
   * Updates an existing cost component in a model's cost breakdown
   */
  "update-cost-breakdown": adminProcedure
    .input(updateCostBreakdownSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      // Verify cost breakdown exists
      const existingCostBreakdown = await ctx.db.modelCostBreakdown.findUnique({
        include: {
          model: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        where: { id },
      });

      if (!existingCostBreakdown) {
        logger.warn("Cost breakdown component not found for update", {
          costBreakdownId: id,
          userId: ctx.session.user.id,
        });
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Componente de costo no encontrado",
        });
      }

      // Update cost breakdown
      const updatedCostBreakdown = await ctx.db.modelCostBreakdown.update({
        data,
        where: { id },
      });

      logger.info("Cost breakdown component updated", {
        component: updatedCostBreakdown.component,
        costBreakdownId: updatedCostBreakdown.id,
        modelId: existingCostBreakdown.model.id,
        modelName: existingCostBreakdown.model.name,
        userId: ctx.session.user.id,
      });

      return updatedCostBreakdown;
    }),
});
