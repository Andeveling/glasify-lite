/**
 * Model Colors Mutations
 *
 * Write operations for model-color assignments
 *
 * All procedures use adminProcedure (admin-only access)
 *
 * Mutations:
 * - assign: Assign a color to a model with custom surcharge
 * - updateSurcharge: Update surcharge percentage for existing assignment
 * - setDefault: Set a color as the default for a model
 * - unassign: Remove color assignment from model
 * - bulkAssign: Assign multiple colors to a model at once
 */

import { TRPCError } from "@trpc/server";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  bulkAssignSchema,
  modelColorAssignSchema,
  modelColorIdSchema,
  modelColorUpdateSurchargeSchema,
} from "./model-colors.schemas";
import {
  countModelColors,
  createManyModelColors,
  createModelColor,
  deleteModelColor,
  findColorById,
  findFirstModelColorByModelId,
  findModelById,
  findModelColorByIdWithDetails,
  hasDefaultColor,
  setModelColorAsDefault,
  unsetAllDefaultsForModel,
  updateModelColorSurcharge,
} from "./repositories/model-colors-repository";
import {
  logBulkAssignError,
  logBulkAssignSuccess,
  logColorAssignError,
  logColorAssignedSuccess,
  logColorUnassignError,
  logColorUnassignedSuccess,
  logSetDefaultError,
  logSetDefaultSuccess,
  logSurchargeUpdateError,
  logSurchargeUpdateSuccess,
} from "./utils/model-colors-logger";

export const modelColorsMutations = createTRPCRouter({
  /**
   * Assign a color to a model with custom surcharge percentage
   * Handles default color logic and tenant validation
   */
  assign: adminProcedure
    .input(modelColorAssignSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify model exists and user has access (tenant validation)
        const model = await findModelById(ctx.db, input.modelId);

        if (!model) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Modelo no encontrado",
          });
        }

        // Verify color exists and is active
        const color = await findColorById(ctx.db, input.colorId);

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
        const existingCount = await countModelColors(ctx.db, input.modelId);

        const shouldBeDefault = existingCount === 0 || input.isDefault;

        // If setting as default, unset all other defaults for this model
        if (shouldBeDefault) {
          await unsetAllDefaultsForModel(ctx.db, input.modelId);
        }

        // Create the assignment
        const modelColor = await createModelColor(ctx.db, {
          modelId: input.modelId,
          colorId: input.colorId,
          surchargePercentage: input.surchargePercentage,
          isDefault: shouldBeDefault,
        });

        if (!modelColor) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al crear la asignación de color",
          });
        }

        // Fetch with relations for response
        const modelColorWithDetails = await findModelColorByIdWithDetails(
          ctx.db,
          modelColor.id
        );

        logColorAssignedSuccess(ctx.session?.user.id ?? "", {
          modelId: input.modelId,
          colorId: input.colorId,
          colorName: color.name,
          surchargePercentage: input.surchargePercentage,
          isDefault: shouldBeDefault,
        });

        return {
          ...modelColorWithDetails,
          surchargePercentage: Number.parseFloat(
            modelColorWithDetails?.surchargePercentage ?? "0"
          ),
        };
      } catch (error) {
        // Handle unique constraint violation (color already assigned)
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "23505"
        ) {
          // PostgreSQL unique violation
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este color ya está asignado al modelo",
          });
        }

        // Re-throw TRPCErrors
        if (error instanceof TRPCError) {
          throw error;
        }

        logColorAssignError(error, ctx.session?.user.id ?? "", input);

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
        // First, get current data for logging
        const current = await findModelColorByIdWithDetails(ctx.db, input.id);

        if (!current) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Asignación de color no encontrada",
          });
        }

        const updated = await updateModelColorSurcharge(
          ctx.db,
          input.id,
          input.surchargePercentage
        );

        if (!updated) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al actualizar el recargo",
          });
        }

        // Fetch with relations for response
        const updatedWithDetails = await findModelColorByIdWithDetails(
          ctx.db,
          updated.id
        );

        logSurchargeUpdateSuccess(ctx.session?.user.id ?? "", {
          modelColorId: input.id,
          modelName: current.model.name,
          colorName: current.color.name,
          newSurcharge: input.surchargePercentage,
        });

        return {
          ...updatedWithDetails,
          surchargePercentage: Number.parseFloat(
            updatedWithDetails?.surchargePercentage ?? "0"
          ),
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logSurchargeUpdateError(error, ctx.session?.user.id ?? "", input);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al actualizar recargo de color",
        });
      }
    }),

  /**
   * Set a color as the default for a model
   * Unsets all other defaults for the same model
   */
  setDefault: adminProcedure
    .input(modelColorIdSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the ModelColor to find its modelId
        const modelColor = await findModelColorByIdWithDetails(
          ctx.db,
          input.id
        );

        if (!modelColor) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Asignación de color no encontrada",
          });
        }

        // Unset all defaults for this model
        await unsetAllDefaultsForModel(ctx.db, modelColor.modelId);

        // Set the target as default
        const updated = await setModelColorAsDefault(ctx.db, input.id);

        if (!updated) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Error al establecer color por defecto",
          });
        }

        // Fetch with relations for response
        const updatedWithDetails = await findModelColorByIdWithDetails(
          ctx.db,
          updated.id
        );

        logSetDefaultSuccess(ctx.session?.user.id ?? "", {
          modelColorId: input.id,
          modelId: modelColor.modelId,
          colorName: modelColor.color.name,
        });

        return {
          ...updatedWithDetails,
          surchargePercentage: Number.parseFloat(
            updatedWithDetails?.surchargePercentage ?? "0"
          ),
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logSetDefaultError(error, ctx.session?.user.id ?? "", input);

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
        const modelColor = await findModelColorByIdWithDetails(
          ctx.db,
          input.id
        );

        if (!modelColor) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Asignación de color no encontrada",
          });
        }

        const wasDefault = modelColor.isDefault;
        const modelId = modelColor.modelId;

        // Delete the assignment (CASCADE handles related data)
        await deleteModelColor(ctx.db, input.id);

        // If we deleted the default, promote the next available color
        if (wasDefault) {
          const nextColor = await findFirstModelColorByModelId(ctx.db, modelId);

          if (nextColor) {
            await setModelColorAsDefault(ctx.db, nextColor.id);
          }
        }

        logColorUnassignedSuccess(ctx.session?.user.id ?? "", {
          modelColorId: input.id,
          modelId,
          colorName: modelColor.color.name,
          wasDefault,
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logColorUnassignError(error, ctx.session?.user.id ?? "", input);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al desasignar color del modelo",
        });
      }
    }),

  /**
   * Bulk assign multiple colors to a model
   * First color in array becomes default if no default exists
   */
  bulkAssign: adminProcedure
    .input(bulkAssignSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify model exists
        const model = await findModelById(ctx.db, input.modelId);

        if (!model) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Modelo no encontrado",
          });
        }

        // Check if model already has a default color
        const defaultExists = await hasDefaultColor(ctx.db, input.modelId);

        // Create all assignments
        const created = await createManyModelColors(
          ctx.db,
          input.assignments.map((assignment, index) => ({
            modelId: input.modelId,
            colorId: assignment.colorId,
            surchargePercentage: assignment.surchargePercentage,
            // First color becomes default only if no default exists
            isDefault: !defaultExists && index === 0,
          }))
        );

        logBulkAssignSuccess(ctx.session?.user.id ?? "", {
          modelId: input.modelId,
          assignedCount: created.length,
          totalRequested: input.assignments.length,
        });

        return { count: created.length };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        logBulkAssignError(error, ctx.session?.user.id ?? "", input);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al asignar colores en lote",
        });
      }
    }),
});
