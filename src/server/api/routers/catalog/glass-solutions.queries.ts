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
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import {
  getGlassSolutionBySlug,
  getGlassSolutionsList,
} from "./catalog.service";

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

export const glassSolutionsPublicQueries = createTRPCRouter({
  /**
   * Get glass solution details by slug
   *
   * Includes all assigned glass types with performance ratings
   *
   * @public
   * @param slug - URL-friendly slug (e.g., 'solar-control', 'energy-efficiency')
   * @returns Glass solution with assigned glass types
   */
  "get-by-slug": publicProcedure
    .input(getGlassSolutionBySlugInput)
    .output(getGlassSolutionBySlugOutput)
    .query(async ({ ctx, input }) =>
      getGlassSolutionBySlug(ctx.db, input.slug)
    ),

  /**
   * List all active glass solutions
   *
   * @public
   * @returns Array of active glass solutions sorted by sortOrder
   */
  "list-solutions": publicProcedure
    .input(listSolutionsInput)
    .output(listSolutionsOutput)
    .query(async ({ ctx, input }) =>
      getGlassSolutionsList(ctx.db, {
        limit: input.limit,
        page: input.page,
        search: input.search,
      })
    ),
});
