import { z } from 'zod';
import logger from '@/lib/logger';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

// Constants
const DEFAULT_PAGE_LIMIT = 20;
const MIN_PAGE_LIMIT = 1;
const MAX_PAGE_LIMIT = 100;

// Input schemas
export const listModelsInput = z.object({
  limit: z.number().min(MIN_PAGE_LIMIT).max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
  manufacturerId: z.cuid('ID del fabricante debe ser válido').optional(),
  page: z.number().min(1).default(1),
  search: z.string().optional(),
});

// Output schemas
export const manufacturerOutput = z.object({
  currency: z.string(),
  id: z.string(),
  name: z.string(),
  quoteValidityDays: z.number(),
});

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

export const listModelsOutput = z.object({
  items: z.array(modelSummaryOutput),
  total: z.number(),
});

export const catalogRouter = createTRPCRouter({
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
        });

        // Build where clause with filters
        const whereClause = {
          ...(input.manufacturerId && {
            manufacturerId: input.manufacturerId,
          }),
          ...(input.search && {
            name: {
              contains: input.search,
              mode: 'insensitive' as const,
            },
          }),
          status: 'published' as const, // Only show published models
        };

        // Get total count for pagination
        const total = await ctx.db.model.count({
          where: whereClause,
        });

        // Calculate skip based on page
        const skip = (input.page - 1) * input.limit;

        // Fetch models with offset-based pagination
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
          skip,
          take: input.limit,
          where: whereClause,
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
          page: input.page,
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
