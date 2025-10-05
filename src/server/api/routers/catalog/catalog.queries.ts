// src/server/api/routers/catalog/catalog.queries.ts
import logger from '@/lib/logger';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { getModelByIdInput, listModelsInput, listModelsOutput, modelDetailOutput } from './catalog.schemas';
import { serializeDecimalFields, serializeModel } from './catalog.utils';

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
            manufacturer: {
              select: {
                currency: true,
                id: true,
                name: true,
                quoteValidityDays: true,
              },
            },
            maxHeightMm: true,
            maxWidthMm: true,
            minHeightMm: true,
            minWidthMm: true,
            name: true,
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

        const serializedModel = serializeModel(model);

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
   * List manufacturers for filter dropdown
   * @public
   */
  'list-manufacturers': publicProcedure.query(async ({ ctx }) => {
    try {
      logger.info('Listing manufacturers for filter');

      const manufacturers = await ctx.db.manufacturer.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
        },
      });

      logger.info('Successfully retrieved manufacturers', {
        count: manufacturers.length,
      });

      return manufacturers;
    } catch (error) {
      logger.error('Error listing manufacturers', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new Error('No se pudieron cargar los fabricantes. Intente nuevamente.');
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
          manufacturerId: input.manufacturerId,
          page: input.page,
          search: input.search,
          sort: input.sort,
        });

        // Build where clause
        const whereClause = {
          ...(input.manufacturerId && { manufacturerId: input.manufacturerId }),
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
            manufacturer: {
              select: {
                id: true,
                name: true,
              },
            },
            maxHeightMm: true,
            maxWidthMm: true,
            minHeightMm: true,
            minWidthMm: true,
            name: true,
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
});
