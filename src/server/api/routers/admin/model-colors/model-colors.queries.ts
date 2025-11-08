/**
 * Model Colors Queries
 *
 * Read-only tRPC procedures for model-color assignments
 *
 * All procedures use adminProcedure (admin-only access)
 *
 * Queries:
 * - listByModel: Get all colors assigned to a model
 * - getAvailableColors: Get colors not yet assigned to a model
 */

import { TRPCError } from "@trpc/server";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { modelIdSchema } from "./model-colors.schemas";
import {
  findAvailableColorsForModel,
  findModelColorsByModelId,
} from "./repositories/model-colors-repository";
import {
  logAvailableColorsError,
  logAvailableColorsSuccess,
  logModelColorsListError,
  logModelColorsListSuccess,
} from "./utils/model-colors-logger";

export const modelColorsQueries = createTRPCRouter({
  /**
   * List all colors assigned to a specific model
   * Returns colors with assignment details, ordered by default first
   */
  listByModel: adminProcedure
    .input(modelIdSchema)
    .query(async ({ ctx, input }) => {
      try {
        const modelColorsList = await findModelColorsByModelId(
          ctx.db,
          input.modelId
        );

        // Convert decimal surchargePercentage to number
        const normalizedData = modelColorsList.map((mc) => ({
          ...mc,
          surchargePercentage: Number.parseFloat(mc.surchargePercentage),
        }));

        logModelColorsListSuccess(
          ctx.session?.user.id ?? "",
          input.modelId,
          normalizedData.length
        );

        return normalizedData;
      } catch (error) {
        logModelColorsListError(
          error,
          ctx.session?.user.id ?? "",
          input.modelId
        );
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
        const availableColors = await findAvailableColorsForModel(
          ctx.db,
          input.modelId
        );

        logAvailableColorsSuccess(
          ctx.session?.user.id ?? "",
          input.modelId,
          availableColors.length
        );

        return availableColors;
      } catch (error) {
        logAvailableColorsError(
          error,
          ctx.session?.user.id ?? "",
          input.modelId
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al obtener colores disponibles",
        });
      }
    }),
});
