/**
 * Glass Solutions Public Queries
 *
 * Public read-only endpoints for accessing glass solution information
 * Used by public pages: /glasses/solutions and /glasses/solutions/[slug]
 *
 * All procedures are public (no authentication required)
 * ISR cached at 3600 seconds (1 hour)
 */

import logger from '@/lib/logger';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { z } from 'zod';

/**
 * Input schema: Get glass solution by slug
 */
const getGlassSolutionBySlugInput = z.object({
  slug: z.string().describe('URL-friendly slug (kebab-case)'),
});

/**
 * Output schema: Glass type summary for solution detail pages
 */
const glassTypeSummaryForSolution = z.object({
  id: z.string(),
  code: z.string().nullable(),
  name: z.string(),
  thicknessMm: z.number(),
  pricePerSqm: z.string().describe('Decimal as string for precision'),
  performanceRating: z.enum(['basic', 'standard', 'good', 'very_good', 'excellent']),
  isPrimary: z.boolean(),
  notes: z.string().nullable(),
});

const getGlassSolutionBySlugOutput = z.object({
  id: z.string(),
  slug: z.string(),
  key: z.string(),
  name: z.string(),
  nameEs: z.string(),
  description: z.string().nullable(),
  icon: z.string().nullable(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  glassTypes: z.array(glassTypeSummaryForSolution),
});

/**
 * Input schema: List glass solutions with pagination
 */
const listSolutionsInput = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(10),
  search: z.string().optional(),
});

/**
 * Output schema: List glass solutions response
 */
const listSolutionsOutput = z.object({
  items: z.array(z.object({
    id: z.string(),
    slug: z.string(),
    key: z.string(),
    name: z.string(),
    nameEs: z.string(),
    description: z.string().nullable(),
    icon: z.string().nullable(),
    sortOrder: z.number(),
    isActive: z.boolean(),
  })),
});

export const glassolutionsPublicQueries = createTRPCRouter({
  /**
   * List all active glass solutions
   *
   * @public
   * @returns Array of active glass solutions sorted by sortOrder
   */
  'list-solutions': publicProcedure
    .input(listSolutionsInput)
    .output(listSolutionsOutput)
    .query(async ({ ctx, input }) => {
      try {
        logger.info('Fetching glass solutions list', {
          page: input.page,
          limit: input.limit,
          search: input.search,
        });

        const where = {
          isActive: true,
          ...(input.search && {
            OR: [
              { key: { contains: input.search, mode: 'insensitive' as const } },
              { name: { contains: input.search, mode: 'insensitive' as const } },
              { nameEs: { contains: input.search, mode: 'insensitive' as const } },
            ],
          }),
        };

        const items = await ctx.db.glassSolution.findMany({
          select: {
            description: true,
            icon: true,
            id: true,
            isActive: true,
            key: true,
            name: true,
            nameEs: true,
            slug: true,
            sortOrder: true,
          },
          where,
          orderBy: { sortOrder: 'asc' },
          skip: (input.page - 1) * input.limit,
          take: input.limit,
        });

        logger.info('Successfully retrieved glass solutions list', {
          count: items.length,
          page: input.page,
        });

        return { items };
      } catch (error) {
        logger.error('Error fetching glass solutions list', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }
    }),

  /**
   * Get glass solution details by slug
   *
   * Includes all assigned glass types with performance ratings and notes
   *
   * @public
   * @param slug - URL-friendly slug (e.g., 'solar-control', 'energy-efficiency')
   * @returns Glass solution with assigned glass types
   */
  'get-by-slug': publicProcedure
    .input(getGlassSolutionBySlugInput)
    .output(getGlassSolutionBySlugOutput)
    .query(async ({ ctx, input }) => {
      try {
        logger.info('Fetching glass solution by slug', { slug: input.slug });

        const solution = await ctx.db.glassSolution.findUnique({
          select: {
            description: true,
            icon: true,
            id: true,
            isActive: true,
            key: true,
            name: true,
            nameEs: true,
            slug: true,
            sortOrder: true,
            glassTypes: {
              select: {
                glassType: {
                  select: {
                    code: true,
                    id: true,
                    name: true,
                    pricePerSqm: true,
                    thicknessMm: true,
                  },
                },
                isPrimary: true,
                notes: true,
                performanceRating: true,
              },
              orderBy: { performanceRating: 'desc' as const },
            },
          },
          where: { slug: input.slug, isActive: true },
        });

        if (!solution) {
          logger.warn('Glass solution not found by slug', { slug: input.slug });
          throw new Error('La solución de vidrio solicitada no existe.');
        }

        // Transform the related glass types
        const glassTypes = solution.glassTypes.map((assignment) => ({
          id: assignment.glassType.id,
          code: assignment.glassType.code,
          name: assignment.glassType.name,
          thicknessMm: assignment.glassType.thicknessMm,
          pricePerSqm: assignment.glassType.pricePerSqm.toString(),
          performanceRating: assignment.performanceRating,
          isPrimary: assignment.isPrimary,
          notes: assignment.notes,
        }));

        logger.info('Successfully retrieved glass solution by slug', {
          slug: input.slug,
          solutionName: solution.nameEs,
          glassTypeCount: glassTypes.length,
        });

        return {
          id: solution.id,
          slug: solution.slug,
          key: solution.key,
          name: solution.name,
          nameEs: solution.nameEs,
          description: solution.description,
          icon: solution.icon,
          sortOrder: solution.sortOrder,
          isActive: solution.isActive,
          glassTypes,
        };
      } catch (error) {
        logger.error('Error fetching glass solution by slug', {
          error: error instanceof Error ? error.message : 'Unknown error',
          slug: input.slug,
        });
        throw error;
      }
    }),
});
