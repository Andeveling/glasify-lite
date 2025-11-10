// src/server/api/routers/catalog/catalog.queries.ts
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getAvailableGlassTypesInput,
  getModelByIdInput,
  getModelColorsInput,
  glassCompatibilityOutput,
  listAvailableGlassTypesOutput,
  listGlassSolutionsInput,
  listGlassSolutionsOutput,
  listGlassTypesInput,
  listGlassTypesOutput,
  listModelColorsOutput,
  listModelsInput,
  listModelsOutput,
  listServicesInput,
  listServicesOutput,
  modelDetailOutput,
  validateGlassCompatibilityInput,
} from "./catalog.schemas";
import {
  getAllGlassSolutions,
  getCompatibleGlassTypes,
  getGlassTypesList,
  getModelById,
  getModelColors,
  getModelsList,
  getProfileSuppliersList,
  getServicesList,
  validateGlassCompatibility,
} from "./catalog.service";

export const catalogQueries = createTRPCRouter({
  /**
   * Get a single model by ID
   * @public
   */
  "get-model-by-id": publicProcedure
    .input(getModelByIdInput)
    .output(modelDetailOutput)
    .query(async ({ ctx, input }) => await getModelById(ctx.db, input.modelId)),

  /**
   * List all active glass solutions
   * Used for solution selector UI
   * @public
   */
  "list-glass-solutions": publicProcedure
    .input(listGlassSolutionsInput)
    .output(listGlassSolutionsOutput)
    .query(
      async ({ ctx, input }) =>
        await getAllGlassSolutions(ctx.db, input?.modelId)
    ),

  /**
   * List glass types by IDs
   * Used to fetch glass type details for models
   * @public
   */
  "list-glass-types": publicProcedure
    .input(listGlassTypesInput)
    .output(listGlassTypesOutput)
    .query(
      async ({ ctx, input }) =>
        await getGlassTypesList(ctx.db, input.glassTypeIds)
    ),

  /**
   * List manufacturers for filter dropdown
   * Only returns suppliers that have at least one published model
   * @public
   */
  "list-manufacturers": publicProcedure.query(
    async ({ ctx }) => await getProfileSuppliersList(ctx.db)
  ),

  /**
   * List models with pagination, filtering, and sorting
   * @public
   */
  "list-models": publicProcedure
    .input(listModelsInput)
    .output(listModelsOutput)
    .query(
      async ({ ctx, input }) =>
        await getModelsList(ctx.db, {
          limit: input.limit,
          page: input.page,
          profileSupplierId: input.manufacturerId,
          search: input.search,
          sort: input.sort,
        })
    ),

  /**
   * List services by manufacturer for parametrization form
   * @public
   */
  "list-services": publicProcedure
    .input(listServicesInput)
    .output(listServicesOutput)
    .query(async ({ ctx }) => await getServicesList(ctx.db)),

  /**
   * Get available glass types for a model
   * @public
   */
  "get-available-glass-types": publicProcedure
    .input(getAvailableGlassTypesInput)
    .output(listAvailableGlassTypesOutput)
    .query(
      async ({ ctx, input }) =>
        await getCompatibleGlassTypes(ctx.db, input.modelId)
    ),

  /**
   * Validate if a glass type is compatible with a model
   * @public
   */
  "validate-glass-compatibility": publicProcedure
    .input(validateGlassCompatibilityInput)
    .output(glassCompatibilityOutput)
    .query(
      async ({ ctx, input }) =>
        await validateGlassCompatibility(
          ctx.db,
          input.modelId,
          input.glassTypeId
        )
    ),

  /**
   * Get colors available for a model
   * @public
   */
  "get-model-colors-for-quote": publicProcedure
    .input(getModelColorsInput)
    .output(listModelColorsOutput)
    .query(
      async ({ ctx, input }) => await getModelColors(ctx.db, input.modelId)
    ),
});
