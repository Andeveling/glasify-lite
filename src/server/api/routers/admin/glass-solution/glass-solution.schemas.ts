/**
 * Glass Solution tRPC Schemas - Input/Output validation
 *
 * Utiliza drizzle-zod para generar automáticamente schemas desde tablas Drizzle.
 * Reutiliza schemas de la capa de validaciones para inputs.
 *
 * @module server/api/routers/admin/glass-solution/glass-solution.schemas
 */
import { z } from "zod";
import {
  type CreateGlassSolutionInput,
  createGlassSolutionSchema,
  type DeleteGlassSolutionInput,
  deleteGlassSolutionSchema,
  type GetGlassSolutionByIdInput,
  getGlassSolutionByIdSchema,
  type ListGlassSolutionsInput,
  listGlassSolutionsSchema,
  type UpdateGlassSolutionInput,
  updateGlassSolutionSchema,
} from "@/lib/validations/admin/glass-solution.schema";
import { glassSolutionSelectSchema } from "@/server/db/schemas/glass-solution.schema";

/**
 * CREATE Procedure Input
 * Reutiliza schema de validaciones
 */
export const createProcedureInputSchema = createGlassSolutionSchema;
export type CreateProcedureInput = CreateGlassSolutionInput;

/**
 * CREATE Procedure Output
 * Automáticamente generado desde tabla Drizzle via drizzle-zod
 */
export const createProcedureOutputSchema = glassSolutionSelectSchema;
export type CreateProcedureOutput = z.infer<typeof createProcedureOutputSchema>;

/**
 * READ (by ID) Procedure Input
 * Reutiliza schema de validaciones
 */
export const readByIdInputSchema = getGlassSolutionByIdSchema;
export type ReadByIdInput = GetGlassSolutionByIdInput;

/**
 * READ (by ID) Procedure Output
 * Single GlassSolution record or null
 * Automáticamente generado desde tabla Drizzle via drizzle-zod
 */
export const readByIdOutputSchema = glassSolutionSelectSchema.nullable();
export type ReadByIdOutput = z.infer<typeof readByIdOutputSchema>;

/**
 * LIST Procedure Input
 * Reutiliza schema de validaciones (con paginación, búsqueda, filtros)
 */
export const listInputSchema = listGlassSolutionsSchema;
export type ListInput = ListGlassSolutionsInput;

/**
 * LIST Procedure Output
 * Paginated array de GlassSolution records
 * Automáticamente generado desde tabla Drizzle via drizzle-zod
 */
export const listOutputSchema = z.object({
  items: z.array(glassSolutionSelectSchema),
  limit: z.number().int().positive(),
  page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});
export type ListOutput = z.infer<typeof listOutputSchema>;

/**
 * UPDATE Procedure Input
 * Reutiliza schema de validaciones
 */
export const updateInputSchema = updateGlassSolutionSchema;
export type UpdateInput = UpdateGlassSolutionInput;

/**
 * UPDATE Procedure Output
 * Automáticamente generado desde tabla Drizzle via drizzle-zod
 */
export const updateOutputSchema = glassSolutionSelectSchema;
export type UpdateOutput = z.infer<typeof updateOutputSchema>;

/**
 * DELETE Procedure Input
 * Reutiliza schema de validaciones
 */
export const deleteInputSchema = deleteGlassSolutionSchema;
export type DeleteInput = DeleteGlassSolutionInput;

/**
 * DELETE Procedure Output
 * Single GlassSolution record (the deleted record)
 * Automáticamente generado desde tabla Drizzle via drizzle-zod
 */
export const deleteOutputSchema = glassSolutionSelectSchema;
export type DeleteOutput = z.infer<typeof deleteOutputSchema>;
