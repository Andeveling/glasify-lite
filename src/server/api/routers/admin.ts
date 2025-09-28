import type { GlassType, Manufacturer, Model, Prisma } from '@prisma/client';
import { z } from 'zod';
import logger from '@/lib/logger';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

// Helper functions to reduce complexity
async function validateManufacturerExists(tx: Prisma.TransactionClient, manufacturerId: string): Promise<Manufacturer> {
  const manufacturer = await tx.manufacturer.findUnique({
    where: { id: manufacturerId },
  });

  if (!manufacturer) {
    throw new Error('Fabricante no encontrado');
  }

  return manufacturer;
}

async function validateGlassTypesExist(
  tx: Prisma.TransactionClient,
  glassTypeIds: string[],
  manufacturerId: string
): Promise<GlassType[]> {
  const glassTypes = await tx.glassType.findMany({
    where: {
      id: { in: glassTypeIds },
      manufacturerId,
    },
  });

  if (glassTypes.length !== glassTypeIds.length) {
    throw new Error('Uno o más tipos de vidrio no encontrados o no pertenecen al fabricante');
  }

  return glassTypes;
}

// Input schemas
export const modelUpsertInput = z.object({
  id: z.string().cuid().optional(), // If provided, update; otherwise, create
  manufacturerId: z.string().cuid('ID del fabricante debe ser válido'),
  name: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim() : ''),
    z.string().min(1, 'Nombre del modelo es requerido')
  ),
  status: z.enum(['draft', 'published']).default('draft'),
  minWidthMm: z.number().int().min(1, 'Ancho mínimo debe ser mayor a 0 mm'),
  maxWidthMm: z.number().int().min(1, 'Ancho máximo debe ser mayor a 0 mm'),
  minHeightMm: z.number().int().min(1, 'Alto mínimo debe ser mayor a 0 mm'),
  maxHeightMm: z.number().int().min(1, 'Alto máximo debe ser mayor a 0 mm'),
  basePrice: z.number().min(0, 'Precio base debe ser mayor o igual a 0'),
  costPerMmWidth: z.number().min(0, 'Costo por mm de ancho debe ser mayor o igual a 0'),
  costPerMmHeight: z.number().min(0, 'Costo por mm de alto debe ser mayor o igual a 0'),
  accessoryPrice: z.number().min(0).optional().nullable(),
  compatibleGlassTypeIds: z
    .array(z.string().cuid('ID del tipo de vidrio debe ser válido'))
    .min(1, 'Debe seleccionar al menos un tipo de vidrio compatible'),
});

// Output schemas
export const modelUpsertOutput = z.object({
  modelId: z.string(),
  status: z.enum(['draft', 'published']),
  message: z.string(),
});

export const adminRouter = createTRPCRouter({
  'model-upsert': publicProcedure
    .input(modelUpsertInput)
    .output(modelUpsertOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        logger.info('Starting model upsert', {
          modelId: input.id,
          manufacturerId: input.manufacturerId,
          name: input.name,
        });

        // Validate dimension constraints
        if (input.minWidthMm >= input.maxWidthMm) {
          throw new Error('Ancho mínimo debe ser menor al ancho máximo');
        }
        if (input.minHeightMm >= input.maxHeightMm) {
          throw new Error('Alto mínimo debe ser menor al alto máximo');
        }

        const result = await ctx.db.$transaction(async (tx) => {
          // Verify manufacturer exists
          await validateManufacturerExists(tx, input.manufacturerId);

          // Verify all glass types exist and belong to the manufacturer
          await validateGlassTypesExist(tx, input.compatibleGlassTypeIds, input.manufacturerId);

          const modelData = {
            manufacturerId: input.manufacturerId,
            name: input.name,
            status: input.status,
            minWidthMm: input.minWidthMm,
            maxWidthMm: input.maxWidthMm,
            minHeightMm: input.minHeightMm,
            maxHeightMm: input.maxHeightMm,
            basePrice: input.basePrice,
            costPerMmWidth: input.costPerMmWidth,
            costPerMmHeight: input.costPerMmHeight,
            accessoryPrice: input.accessoryPrice,
            compatibleGlassTypeIds: input.compatibleGlassTypeIds,
          };

          let modelRecord: Model;
          let isCreating = false;

          if (input.id) {
            // Update existing model
            const existingModel = await tx.model.findUnique({
              where: { id: input.id },
            });

            if (!existingModel) {
              throw new Error('Modelo no encontrado');
            }

            if (existingModel.manufacturerId !== input.manufacturerId) {
              throw new Error('No puede modificar un modelo de otro fabricante');
            }

            modelRecord = await tx.model.update({
              where: { id: input.id },
              data: modelData,
            });
          } else {
            // Create new model
            isCreating = true;

            // Check if model name already exists for this manufacturer
            const existingModel = await tx.model.findFirst({
              where: {
                manufacturerId: input.manufacturerId,
                name: input.name,
              },
            });

            if (existingModel) {
              throw new Error(`Ya existe un modelo con el nombre "${input.name}" para este fabricante`);
            }

            modelRecord = await tx.model.create({
              data: modelData,
            });
          }

          return {
            modelId: modelRecord.id,
            status: modelRecord.status,
            message: isCreating
              ? `Modelo "${input.name}" creado exitosamente`
              : `Modelo "${input.name}" actualizado exitosamente`,
          };
        });

        logger.info('Model upsert completed successfully', {
          modelId: result.modelId,
          manufacturerId: input.manufacturerId,
          name: input.name,
          isUpdate: Boolean(input.id),
        });

        return result;
      } catch (error) {
        logger.error('Error during model upsert', {
          modelId: input.id,
          manufacturerId: input.manufacturerId,
          name: input.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        const errorMessage =
          error instanceof Error ? error.message : 'No se pudo guardar el modelo. Intente nuevamente.';
        throw new Error(errorMessage);
      }
    }),
});
