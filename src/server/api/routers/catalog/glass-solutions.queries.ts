/**
 * Glass Solutions Public Queries
 *
 * Public read-only endpoints for accessing glass solution information
 * Used by public pages: /glasses/solutions and /glasses/solutions/[slug]
 *
 * All procedures are public (no authentication required)
 * ISR cached at 3600 seconds (1 hour)
 */

import { z } from "zod";
import logger from "@/lib/logger";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

/**
 * Input schema: Get glass solution by slug
 */
const getGlassSolutionBySlugInput = z.object({
  slug: z.string().describe("URL-friendly slug (kebab-case)"),
});

/**
 * Output schema: Glass type summary for solution detail pages
 */
const glassTypeSummaryForSolution = z.object({
  code: z.string().nullable(),
  id: z.string(),
  isPrimary: z.boolean(),
  name: z.string(),
  notes: z.string().nullable(),
  performanceRating: z.enum([
    "basic",
    "standard",
    "good",
    "very_good",
    "excellent",
  ]),
  pricePerSqm: z.string().describe("Decimal as string for precision"),
  thicknessMm: z.number(),
});

const getGlassSolutionBySlugOutput = z.object({
  description: z.string().nullable(),
  glassTypes: z.array(glassTypeSummaryForSolution),
  icon: z.string().nullable(),
  id: z.string(),
  isActive: z.boolean(),
  key: z.string(),
  name: z.string(),
  nameEs: z.string(),
  slug: z.string(),
  sortOrder: z.number(),
});

/**
 * Input schema: List glass solutions with pagination
 */
const listSolutionsInput = z.object({
  limit: z.number().int().positive().default(10),
  page: z.number().int().positive().default(1),
  search: z.string().optional(),
});

/**
 * Output schema: List glass solutions response
 */
const listSolutionsOutput = z.object({
  items: z.array(
    z.object({
      description: z.string().nullable(),
      icon: z.string().nullable(),
      id: z.string(),
      isActive: z.boolean(),
      key: z.string(),
      name: z.string(),
      nameEs: z.string(),
      slug: z.string(),
      sortOrder: z.number(),
    })
  ),
});

export const glassolutionsPublicQueries = createTRPCRouter({
  /**
   * Get glass solution details by slug
   *
   * Includes all assigned glass types with performance ratings and notes
   *
   * @public
   * @param slug - URL-friendly slug (e.g., 'solar-control', 'energy-efficiency')
   * @returns Glass solution with assigned glass types
   */
  "get-by-slug": publicProcedure
    .input(getGlassSolutionBySlugInput)
    .output(getGlassSolutionBySlugOutput)
    .query(async ({ ctx, input }) => {
      try {
        logger.info("Fetching glass solution by slug", { slug: input.slug });

        const solution = await ctx.db.glassSolution.findUnique({
          select: {
            description: true,
            glassTypes: {
              orderBy: { performanceRating: "desc" as const },
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
            },
            icon: true,
            id: true,
            isActive: true,
            key: true,
            name: true,
            nameEs: true,
            slug: true,
            sortOrder: true,
          },
          where: { isActive: true, slug: input.slug },
        });

        if (!solution) {
          logger.warn("Glass solution not found by slug", { slug: input.slug });
          throw new Error("La solución de vidrio solicitada no existe.");
        }

        // Transform the related glass types
        const glassTypes = solution.glassTypes.map((assignment) => ({
          code: assignment.glassType.code,
          id: assignment.glassType.id,
          isPrimary: assignment.isPrimary,
          name: assignment.glassType.name,
          notes: assignment.notes,
          performanceRating: assignment.performanceRating,
          pricePerSqm: assignment.glassType.pricePerSqm.toString(),
          thicknessMm: assignment.glassType.thicknessMm,
        }));

        logger.info("Successfully retrieved glass solution by slug", {
          glassTypeCount: glassTypes.length,
          slug: input.slug,
          solutionName: solution.nameEs,
        });

        return {
          description: solution.description,
          glassTypes,
          icon: solution.icon,
          id: solution.id,
          isActive: solution.isActive,
          key: solution.key,
          name: solution.name,
          nameEs: solution.nameEs,
          slug: solution.slug,
          sortOrder: solution.sortOrder,
        };
      } catch (error) {
        logger.error("Error fetching glass solution by slug", {
          error: error instanceof Error ? error.message : "Unknown error",
          slug: input.slug,
        });
        throw error;
      }
    }),
  /**
   * List all active glass solutions
   *
   * @public
   * @returns Array of active glass solutions sorted by sortOrder
   */
  "list-solutions": publicProcedure
    .input(listSolutionsInput)
    .output(listSolutionsOutput)
    .query(async ({ ctx, input }) => {
      try {
        logger.info("Fetching glass solutions list", {
          limit: input.limit,
          page: input.page,
          search: input.search,
        });

        const where = {
          isActive: true,
          ...(input.search && {
            OR: [
              { key: { contains: input.search, mode: "insensitive" as const } },
              {
                name: { contains: input.search, mode: "insensitive" as const },
              },
              {
                nameEs: {
                  contains: input.search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }),
        };

        const items = await ctx.db.glassSolution.findMany({
          orderBy: { sortOrder: "asc" },
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
          skip: (input.page - 1) * input.limit,
          take: input.limit,
          where,
        });

        logger.info("Successfully retrieved glass solutions list", {
          count: items.length,
          page: input.page,
        });

        return { items };
      } catch (error) {
        logger.error("Error fetching glass solutions list", {
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    }),
});
