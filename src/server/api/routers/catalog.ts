import { z } from 'zod';
import logger from '@/lib/logger';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

// Input schemas
export const listModelsInput = z.object({
  manufacturerId: z.string().cuid('ID del fabricante debe ser válido'),
});

// Output schemas
export const modelSummaryOutput = z.object({
  accessoryPrice: z.number().nullable(),
  basePrice: z.number(),
  compatibleGlassTypeIds: z.array(z.string()),
  costPerMmHeight: z.number(),
  costPerMmWidth: z.number(),
  createdAt: z.date(),
  id: z.string(),
  maxHeightMm: z.number(),
  maxWidthMm: z.number(),
  minHeightMm: z.number(),
  minWidthMm: z.number(),
  name: z.string(),
  status: z.enum(['draft', 'published']),
  updatedAt: z.date(),
});

export const listModelsOutput = z.array(modelSummaryOutput);

export const catalogRouter = createTRPCRouter({
  'list-models': publicProcedure
    .input(listModelsInput)
    .output(listModelsOutput)
    .query(async ({ ctx, input }) => {
      try {
        logger.info('Listing models for manufacturer', {
          manufacturerId: input.manufacturerId,
        });

        const models = await ctx.db.model.findMany({
          orderBy: {
            name: 'asc',
          },
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
            status: true,
            updatedAt: true,
          },
          where: {
            manufacturerId: input.manufacturerId,
            status: 'published', // Only show published models
          },
        });

        // Convert Decimal fields to numbers for JSON serialization
        const serializedModels = models.map((model) => ({
          ...model,
          accessoryPrice: model.accessoryPrice?.toNumber() ?? null,
          basePrice: model.basePrice.toNumber(),
          costPerMmHeight: model.costPerMmHeight.toNumber(),
          costPerMmWidth: model.costPerMmWidth.toNumber(),
        }));

        logger.info('Successfully retrieved models', {
          count: serializedModels.length,
          manufacturerId: input.manufacturerId,
        });

        return serializedModels;
      } catch (error) {
        logger.error('Error listing models', {
          error: error instanceof Error ? error.message : 'Unknown error',
          manufacturerId: input.manufacturerId,
        });

        throw new Error('No se pudieron cargar los modelos. Intente nuevamente.');
      }
    }),
});
