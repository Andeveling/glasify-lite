// src/server/api/routers/catalog/catalog.queries.ts
import logger from '@/lib/logger';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import {
  getModelByIdInput,
  listGlassSolutionsInput,
  listGlassSolutionsOutput,
  listGlassTypesInput,
  listGlassTypesOutput,
  listModelsInput,
  listModelsOutput,
  listServicesInput,
  listServicesOutput,
  modelDetailOutput,
} from './catalog.schemas';
import { serializeDecimalFields } from './catalog.utils';

export const catalogQueries = createTRPCRouter({
  /**
   * Get a single model by ID
   * @public
   */
  'get-model-by-id': publicProcedure
    .input(getModelByIdInput)
    .output(modelDetailOutput)
    .query(async ({ ctx, input }) => {
      try {
        logger.info('Getting model by ID', { modelId: input.modelId });

        const model = await ctx.db.model.findUnique({
          select: {
            accessoryPrice: true,
            basePrice: true,
            compatibleGlassTypeIds: true,
            costPerMmHeight: true,
            costPerMmWidth: true,
            createdAt: true,
            id: true,
            maxHeightMm: true,
            maxWidthMm: true,
            minHeightMm: true,
            minWidthMm: true,
            name: true,
            profileSupplier: {
              select: {
                id: true,
                name: true,
              },
            },
            status: true,
            updatedAt: true,
          },
          where: {
            id: input.modelId,
            status: 'published',
          },
        });

        if (!model) {
          logger.warn('Model not found or not published', { modelId: input.modelId });
          throw new Error('El modelo solicitado no existe o no está disponible.');
        }

        const serializedModel = serializeDecimalFields(model);

        logger.info('Successfully retrieved model', {
          modelId: input.modelId,
          modelName: model.name,
        });

        return serializedModel;
      } catch (error) {
        logger.error('Error getting model by ID', {
          error: error instanceof Error ? error.message : 'Unknown error',
          modelId: input.modelId,
        });

        if (error instanceof Error && error.message.includes('no existe o no está disponible')) {
          throw error;
        }

        throw new Error('No se pudo cargar el modelo. Intente nuevamente.');
      }
    }),

  /**
   * List all active glass solutions
   * Used for solution selector UI
   * @public
   */
  'list-glass-solutions': publicProcedure
    .input(listGlassSolutionsInput)
    .output(listGlassSolutionsOutput)
    .query(async ({ ctx, input }) => {
      try {
        const params = input ?? {};
        logger.info('Listing glass solutions', { modelId: params.modelId });

        // If modelId is provided, filter solutions by compatible glass types
        if (params.modelId) {
          // First, get the model's compatible glass type IDs
          const model = await ctx.db.model.findUnique({
            select: { compatibleGlassTypeIds: true },
            where: { id: params.modelId },
          });

          if (!model) {
            throw new Error('Modelo no encontrado');
          }

          // Get solutions that have at least one glass type compatible with this model
          const solutions = await ctx.db.glassSolution.findMany({
            orderBy: { sortOrder: 'asc' },
            where: {
              AND: [
                { isActive: true },
                {
                  glassTypes: {
                    some: {
                      glassTypeId: {
                        in: model.compatibleGlassTypeIds,
                      },
                    },
                  },
                },
              ],
            },
          });

          logger.info('Successfully retrieved filtered glass solutions', {
            count: solutions.length,
            modelId: params.modelId,
          });

          return solutions;
        }

        // No filter: return all active solutions
        const solutions = await ctx.db.glassSolution.findMany({
          orderBy: { sortOrder: 'asc' },
          where: { isActive: true },
        });

        logger.info('Successfully retrieved glass solutions', {
          count: solutions.length,
        });

        return solutions;
      } catch (error) {
        logger.error('Error listing glass solutions', {
          error: error instanceof Error ? error.message : 'Unknown error',
          modelId: input?.modelId,
        });

        throw new Error('No se pudieron cargar las soluciones de vidrio. Intente nuevamente.');
      }
    }),

  /**
   * List glass types by IDs
   * Used to fetch glass type details for models
   *
   * NOTE: All glass types currently have solutions assigned from seed data.
   * The fallback logic (ensureGlassHasSolutions) is available but not actively used.
   * See catalog.migration-utils.ts for backward compatibility helpers.
   *
   * @public
   */
  'list-glass-types': publicProcedure
    .input(listGlassTypesInput)
    .output(listGlassTypesOutput)
    .query(async ({ ctx, input }) => {
      try {
        logger.info('Listing glass types by IDs', {
          count: input.glassTypeIds.length,
        });

        const glassTypes = await ctx.db.glassType.findMany({
          orderBy: { name: 'asc' },
          select: {
            characteristics: {
              include: {
                characteristic: true,
              },
              orderBy: { characteristic: { name: 'asc' } },
            },
            createdAt: true,
            description: true,
            glassSupplierId: true,
            id: true,
            isActive: true,
            isLaminated: true,
            isLowE: true,
            isTempered: true,
            isTripleGlazed: true,
            name: true,
            pricePerSqm: true,
            purpose: true,
            solutions: {
              include: {
                solution: true,
              },
              orderBy: [ { isPrimary: 'desc' }, { solution: { sortOrder: 'asc' } } ],
            },
            thicknessMm: true,
            updatedAt: true,
            uValue: true,
          },
          where: {
            id: { in: input.glassTypeIds },
          },
        });

        // Serialize Decimal fields (pricePerSqm, uValue) and nested solution relations
        const serializedGlassTypes = glassTypes.map((glassType) => ({
          ...glassType,
          pricePerSqm: glassType.pricePerSqm.toNumber(),
          solutions: glassType.solutions?.map((sol) => ({
            ...sol,
            solution: {
              ...sol.solution,
            },
          })),
          uValue: glassType.uValue?.toNumber() ?? null,
        }));

        logger.info('Successfully retrieved glass types', {
          count: serializedGlassTypes.length,
        });

        return serializedGlassTypes;
      } catch (error) {
        logger.error('Error listing glass types', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        throw new Error('No se pudieron cargar los tipos de vidrio. Intente nuevamente.');
      }
    }),

  /**
   * List manufacturers for filter dropdown
   * Only returns suppliers that have at least one published model
   * Following "Don't Make Me Think" principle - avoid showing empty options
   * @public
   */
  'list-manufacturers': publicProcedure.query(async ({ ctx }) => {
    try {
      logger.info('Listing profile suppliers with published models for filter');

      const profileSuppliers = await ctx.db.profileSupplier.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
        },
        where: {
          AND: [
            { isActive: true },
            {
              models: {
                some: {
                  status: 'published',
                },
              },
            },
          ],
        },
      });

      logger.info('Successfully retrieved profile suppliers with published models', {
        count: profileSuppliers.length,
      });

      return profileSuppliers;
    } catch (error) {
      logger.error('Error listing profile suppliers', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new Error('No se pudieron cargar los proveedores de perfiles. Intente nuevamente.');
    }
  }),

  /**
   * List models with pagination, filtering, and sorting
   * @public
   */
  'list-models': publicProcedure
    .input(listModelsInput)
    .output(listModelsOutput)
    .query(async ({ ctx, input }) => {
      try {
        logger.info('Listing models', {
          limit: input.limit,
          page: input.page,
          profileSupplierId: input.manufacturerId,
          search: input.search,
          sort: input.sort,
        });

        // Build where clause
        const whereClause = {
          ...(input.manufacturerId && { profileSupplierId: input.manufacturerId }),
          ...(input.search && {
            name: {
              contains: input.search,
              mode: 'insensitive' as const,
            },
          }),
          status: 'published' as const,
        };

        // Build orderBy clause
        const orderByClause = (() => {
          switch (input.sort) {
            case 'name-asc':
              return { name: 'asc' as const };
            case 'name-desc':
              return { name: 'desc' as const };
            case 'price-asc':
              return { basePrice: 'asc' as const };
            case 'price-desc':
              return { basePrice: 'desc' as const };
            default:
              return { name: 'asc' as const };
          }
        })();

        // Get total count
        const total = await ctx.db.model.count({ where: whereClause });

        // Calculate skip
        const skip = (input.page - 1) * input.limit;

        // Fetch models
        const models = await ctx.db.model.findMany({
          orderBy: orderByClause,
          select: {
            accessoryPrice: true,
            basePrice: true,
            compatibleGlassTypeIds: true,
            costPerMmHeight: true,
            costPerMmWidth: true,
            createdAt: true,
            id: true,
            maxHeightMm: true,
            maxWidthMm: true,
            minHeightMm: true,
            minWidthMm: true,
            name: true,
            profileSupplier: {
              select: {
                id: true,
                name: true,
              },
            },
            status: true,
            updatedAt: true,
          },
          skip,
          take: input.limit,
          where: whereClause,
        });

        // Serialize Decimal fields
        const serializedModels = models.map(serializeDecimalFields);

        logger.info('Successfully retrieved models', {
          count: serializedModels.length,
          manufacturerId: input.manufacturerId,
          page: input.page,
          sort: input.sort,
          total,
        });

        return {
          items: serializedModels,
          total,
        };
      } catch (error) {
        logger.error('Error listing models', {
          error: error instanceof Error ? error.message : 'Unknown error',
          manufacturerId: input.manufacturerId,
        });

        throw new Error('No se pudieron cargar los modelos. Intente nuevamente.');
      }
    }),

  /**
   * List services by manufacturer for parametrization form
   * @public
   */
  'list-services': publicProcedure
    .input(listServicesInput)
    .output(listServicesOutput)
    .query(async ({ ctx, input }) => {
      try {
        logger.info('Listing services');

        const services = await ctx.db.service.findMany({
          orderBy: { name: 'asc' },
          select: {
            createdAt: true,
            id: true,
            name: true,
            rate: true,
            type: true,
            unit: true,
            updatedAt: true,
          },
        });

        // Serialize Decimal fields (rate)
        const serializedServices = services.map((service) => ({
          ...service,
          rate: service.rate.toNumber(),
        }));

        logger.info('Successfully retrieved services', {
          count: serializedServices.length,
        });

        return serializedServices;
      } catch (error) {
        logger.error('Error listing services', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        throw new Error('No se pudieron cargar los servicios. Intente nuevamente.');
      }
    }),
});
