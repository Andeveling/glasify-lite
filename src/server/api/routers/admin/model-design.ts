/**
 * Admin Model Design Router
 *
 * Provides admin-only endpoints for managing design gallery.
 * Used in admin UI for design selection when creating/editing models.
 *
 * Procedures:
 * - list: Get all active designs with optional type filter
 * - get-by-id: Get single design by ID with full config
 * - get-by-ids: Get multiple designs by IDs (bulk fetch)
 * - toggle-active: Activate/deactivate design (soft delete)
 *
 * Security: All procedures use adminProcedure (RBAC enforced)
 */

import { z } from 'zod';
import { validateDesignConfig } from '@/lib/design/validation';
import logger from '@/lib/logger';
import { adminProcedure, createTRPCRouter } from '@/server/api/trpc';

/**
 * Input schema for listing designs
 */
const listDesignsInput = z
  .object({
    isActive: z.boolean().optional(),
    type: z
      .enum([
        'fixed_window',
        'sliding_window_horizontal',
        'sliding_window_vertical',
        'casement_window',
        'awning_window',
        'single_door',
        'double_door',
        'sliding_door',
        'other',
      ])
      .optional(),
  })
  .optional();

/**
 * Input schema for getting design by ID
 */
const getDesignByIdInput = z.object({
  id: z.string().cuid('ID del diseño debe ser válido'),
});

/**
 * Input schema for getting multiple designs
 */
const getDesignsByIdsInput = z.object({
  ids: z.array(z.string().cuid('IDs de diseños deben ser válidos')),
});

/**
 * Input schema for toggling design active status
 */
const toggleActiveInput = z.object({
  id: z.string().cuid('ID del diseño debe ser válido'),
  isActive: z.boolean(),
});

/**
 * Output schema for design summary (list view)
 */
const designSummaryOutput = z.object({
  displayOrder: z.number(),
  id: z.string(),
  isActive: z.boolean(),
  name: z.string(),
  nameEs: z.string(),
  thumbnailUrl: z.string().nullable(),
  type: z.enum([
    'fixed_window',
    'sliding_window_horizontal',
    'sliding_window_vertical',
    'casement_window',
    'awning_window',
    'single_door',
    'double_door',
    'sliding_door',
    'other',
  ]),
});

/**
 * Output schema for design detail (with config)
 */
const designDetailOutput = designSummaryOutput.extend({
  config: z.unknown(), // Will be validated with validateDesignConfig
  createdAt: z.date(),
  description: z.string().nullable(),
  updatedAt: z.date(),
});

/**
 * Output schema for design with config (for gallery selector)
 */
const designWithConfigOutput = designSummaryOutput.extend({
  config: z.unknown(), // Will be validated with validateDesignConfig
});

export const modelDesignRouter = createTRPCRouter({
  /**
   * Get design by ID with full config
   * @admin
   */
  'get-by-id': adminProcedure
    .input(getDesignByIdInput)
    .output(designDetailOutput)
    .query(async ({ ctx, input }) => {
      try {
        logger.info('Getting model design by ID', { designId: input.id });

        const design = await ctx.db.modelDesign.findUnique({
          where: { id: input.id },
        });

        if (!design) {
          logger.warn('Model design not found', { designId: input.id });
          throw new Error('El diseño solicitado no existe.');
        }

        // Validate config
        const validatedConfig = validateDesignConfig(design.config);

        logger.info('Successfully retrieved model design', {
          designId: input.id,
          designName: design.name,
        });

        return {
          ...design,
          config: validatedConfig,
        };
      } catch (error) {
        logger.error('Error getting model design', {
          designId: input.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        if (error instanceof Error && error.message.includes('no existe')) {
          throw error;
        }

        throw new Error('No se pudo cargar el diseño. Intente nuevamente.');
      }
    }),

  /**
   * Get multiple designs by IDs (bulk fetch)
   * @admin
   */
  'get-by-ids': adminProcedure
    .input(getDesignsByIdsInput)
    .output(z.array(designSummaryOutput))
    .query(async ({ ctx, input }) => {
      try {
        logger.info('Getting model designs by IDs', {
          count: input.ids.length,
          ids: input.ids,
        });

        const designs = await ctx.db.modelDesign.findMany({
          select: {
            displayOrder: true,
            id: true,
            isActive: true,
            name: true,
            nameEs: true,
            thumbnailUrl: true,
            type: true,
          },
          where: {
            id: { in: input.ids },
          },
        });

        logger.info('Successfully retrieved model designs', {
          count: designs.length,
          requestedCount: input.ids.length,
        });

        return designs;
      } catch (error) {
        logger.error('Error getting model designs by IDs', {
          error: error instanceof Error ? error.message : 'Unknown error',
          ids: input.ids,
        });

        throw new Error('No se pudieron cargar los diseños. Intente nuevamente.');
      }
    }),
  /**
   * List all designs with optional filters
   * @admin
   */
  list: adminProcedure
    .input(listDesignsInput)
    .output(z.array(designWithConfigOutput))
    .query(async ({ ctx, input }) => {
      const params = input ?? {};

      try {
        logger.info('Listing model designs', {
          isActive: params.isActive,
          type: params.type,
        });

        const designs = await ctx.db.modelDesign.findMany({
          orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
          select: {
            config: true,
            displayOrder: true,
            id: true,
            isActive: true,
            name: true,
            nameEs: true,
            thumbnailUrl: true,
            type: true,
          },
          where: {
            ...(params.isActive !== undefined && { isActive: params.isActive }),
            ...(params.type && { type: params.type }),
          },
        });

        // Validate configs
        const validatedDesigns = designs.map((design) => ({
          ...design,
          config: validateDesignConfig(design.config),
        }));

        logger.info('Successfully retrieved model designs', {
          count: validatedDesigns.length,
          isActive: params.isActive,
          type: params.type,
        });

        return validatedDesigns;
      } catch (error) {
        logger.error('Error listing model designs', {
          error: error instanceof Error ? error.message : 'Unknown error',
          isActive: params.isActive,
          type: params.type,
        });

        throw new Error('No se pudieron cargar los diseños. Intente nuevamente.');
      }
    }),

  /**
   * Toggle design active status (soft delete)
   * @admin
   */
  'toggle-active': adminProcedure
    .input(toggleActiveInput)
    .output(z.object({ success: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      try {
        logger.info('Toggling model design active status', {
          designId: input.id,
          isActive: input.isActive,
        });

        await ctx.db.modelDesign.update({
          data: { isActive: input.isActive },
          where: { id: input.id },
        });

        logger.info('Successfully toggled model design status', {
          designId: input.id,
          isActive: input.isActive,
        });

        return { success: true };
      } catch (error) {
        logger.error('Error toggling model design status', {
          designId: input.id,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        throw new Error('No se pudo actualizar el estado del diseño. Intente nuevamente.');
      }
    }),
});
