import type { GlassType, Model, Prisma, ProfileSupplier } from "@prisma/client";
import { z } from "zod";
import logger from "@/lib/logger";
import { galleryRouter } from "@/server/api/routers/admin/gallery";
import { glassSolutionRouter } from "@/server/api/routers/admin/glass-solution";
import { glassSupplierRouter } from "@/server/api/routers/admin/glass-supplier";
import { glassTypeRouter } from "@/server/api/routers/admin/glass-type";
import { modelRouter } from "@/server/api/routers/admin/model";
import { profileSupplierRouter } from "@/server/api/routers/admin/profile-supplier";
import { serviceRouter } from "@/server/api/routers/admin/service";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";

// Helper functions to reduce complexity
async function validateProfileSupplierExists(
  tx: Prisma.TransactionClient,
  profileSupplierId: string
): Promise<ProfileSupplier> {
  const supplier = await tx.profileSupplier.findUnique({
    where: { id: profileSupplierId },
  });

  if (!supplier) {
    throw new Error("Proveedor de perfiles no encontrado");
  }

  return supplier;
}

async function validateGlassTypesExist(
  tx: Prisma.TransactionClient,
  glassTypeIds: string[]
): Promise<GlassType[]> {
  const glassTypes = await tx.glassType.findMany({
    where: {
      id: { in: glassTypeIds },
    },
  });

  if (glassTypes.length !== glassTypeIds.length) {
    throw new Error("Uno o más tipos de vidrio no encontrados");
  }

  return glassTypes;
}

// Input schemas
export const modelUpsertInput = z.object({
  accessoryPrice: z.number().min(0).optional().nullable(),
  basePrice: z.number().min(0, "Precio base debe ser mayor o igual a 0"),
  compatibleGlassTypeIds: z
    .array(z.cuid("ID del tipo de vidrio debe ser válido"))
    .min(1, "Debe seleccionar al menos un tipo de vidrio compatible"),
  costPerMmHeight: z
    .number()
    .min(0, "Costo por mm de alto debe ser mayor o igual a 0"),
  costPerMmWidth: z
    .number()
    .min(0, "Costo por mm de ancho debe ser mayor o igual a 0"),
  id: z.cuid().optional(), // If provided, update; otherwise, create
  maxHeightMm: z.number().int().min(1, "Alto máximo debe ser mayor a 0 mm"),
  maxWidthMm: z.number().int().min(1, "Ancho máximo debe ser mayor a 0 mm"),
  minHeightMm: z.number().int().min(1, "Alto mínimo debe ser mayor a 0 mm"),
  minWidthMm: z.number().int().min(1, "Ancho mínimo debe ser mayor a 0 mm"),
  name: z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : ""),
    z.string().min(1, "Nombre del modelo es requerido")
  ),
  profileSupplierId: z
    .string()
    .cuid("ID del proveedor de perfiles debe ser válido")
    .optional()
    .nullable(),
  status: z.enum(["draft", "published"]).default("draft"),
});

// Output schemas
export const modelUpsertOutput = z.object({
  message: z.string(),
  modelId: z.string(),
  status: z.enum(["draft", "published"]),
});

export const adminRouter = createTRPCRouter({
  gallery: galleryRouter,
  "glass-solution": glassSolutionRouter,
  "glass-supplier": glassSupplierRouter,
  "glass-type": glassTypeRouter,
  model: modelRouter,
  "model-upsert": adminProcedure
    .input(modelUpsertInput)
    .output(modelUpsertOutput)
    .mutation(async ({ ctx, input }) => {
      try {
        logger.info("Starting model upsert", {
          modelId: input.id,
          name: input.name,
          profileSupplierId: input.profileSupplierId,
        });

        // Validate dimension constraints
        if (input.minWidthMm >= input.maxWidthMm) {
          throw new Error("Ancho mínimo debe ser menor al ancho máximo");
        }
        if (input.minHeightMm >= input.maxHeightMm) {
          throw new Error("Alto mínimo debe ser menor al alto máximo");
        }

        const result = await ctx.db.$transaction(async (tx) => {
          // Verify profile supplier exists if provided
          if (input.profileSupplierId) {
            await validateProfileSupplierExists(tx, input.profileSupplierId);
          }

          // Verify all glass types exist
          await validateGlassTypesExist(tx, input.compatibleGlassTypeIds);

          const modelData = {
            accessoryPrice: input.accessoryPrice,
            basePrice: input.basePrice,
            compatibleGlassTypeIds: input.compatibleGlassTypeIds,
            costPerMmHeight: input.costPerMmHeight,
            costPerMmWidth: input.costPerMmWidth,
            maxHeightMm: input.maxHeightMm,
            maxWidthMm: input.maxWidthMm,
            minHeightMm: input.minHeightMm,
            minWidthMm: input.minWidthMm,
            name: input.name,
            profileSupplierId: input.profileSupplierId,
            status: input.status,
          };

          let modelRecord: Model;
          let isCreating = false;

          if (input.id) {
            // Update existing model
            const existingModel = await tx.model.findUnique({
              where: { id: input.id },
            });

            if (!existingModel) {
              throw new Error("Modelo no encontrado");
            }

            modelRecord = await tx.model.update({
              data: modelData,
              where: { id: input.id },
            });
          } else {
            // Create new model
            isCreating = true;

            // Check if model name already exists
            const existingModel = await tx.model.findFirst({
              where: {
                name: input.name,
                ...(input.profileSupplierId && {
                  profileSupplierId: input.profileSupplierId,
                }),
              },
            });

            if (existingModel) {
              throw new Error(
                `Ya existe un modelo con el nombre "${input.name}"`
              );
            }

            modelRecord = await tx.model.create({
              data: modelData,
            });
          }

          return {
            message: isCreating
              ? `Modelo "${input.name}" creado exitosamente`
              : `Modelo "${input.name}" actualizado exitosamente`,
            modelId: modelRecord.id,
            status: modelRecord.status,
          };
        });

        logger.info("Model upsert completed successfully", {
          isUpdate: Boolean(input.id),
          modelId: result.modelId,
          name: input.name,
          profileSupplierId: input.profileSupplierId,
        });

        return result;
      } catch (error) {
        logger.error("Error during model upsert", {
          error: error instanceof Error ? error.message : "Unknown error",
          modelId: input.id,
          name: input.name,
          profileSupplierId: input.profileSupplierId,
        });

        const errorMessage =
          error instanceof Error
            ? error.message
            : "No se pudo guardar el modelo. Intente nuevamente.";
        throw new Error(errorMessage);
      }
    }),
  "profile-supplier": profileSupplierRouter,
  service: serviceRouter,
});
