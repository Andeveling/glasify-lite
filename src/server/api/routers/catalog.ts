import { z } from 'zod';
import logger from '@/lib/logger';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

// Input schemas
export const listModelsInput = z.object({
  manufacturerId: z.string().cuid('ID del fabricante debe ser válido'),
});

// Output schemas
export const modelSummaryOutput = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['draft', 'published']),
  minWidthMm: z.number(),
  maxWidthMm: z.number(),
  minHeightMm: z.number(),
  maxHeightMm: z.number(),
  basePrice: z.number(),
  costPerMmWidth: z.number(),
  costPerMmHeight: z.number(),
  accessoryPrice: z.number().nullable(),
  compatibleGlassTypeIds: z.array(z.string()),
  createdAt: z.date(),
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
          where: {
            manufacturerId: input.manufacturerId,
            status: 'published', // Only show published models
          },
          select: {
            id: true,
            name: true,
            status: true,
            minWidthMm: true,
            maxWidthMm: true,
            minHeightMm: true,
            maxHeightMm: true,
            basePrice: true,
            costPerMmWidth: true,
            costPerMmHeight: true,
            accessoryPrice: true,
            compatibleGlassTypeIds: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            name: 'asc',
          },
        });

        // Convert Decimal fields to numbers for JSON serialization
        const serializedModels = models.map((model) => ({
          ...model,
          basePrice: model.basePrice.toNumber(),
          costPerMmWidth: model.costPerMmWidth.toNumber(),
          costPerMmHeight: model.costPerMmHeight.toNumber(),
          accessoryPrice: model.accessoryPrice?.toNumber() ?? null,
        }));

        logger.info('Successfully retrieved models', {
          manufacturerId: input.manufacturerId,
          count: serializedModels.length,
        });

        return serializedModels;
      } catch (error) {
        logger.error('Error listing models', {
          manufacturerId: input.manufacturerId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        throw new Error('No se pudieron cargar los modelos. Intente nuevamente.');
      }
    }),
});
