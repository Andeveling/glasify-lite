/**
 * Address tRPC Schemas - Input/Output validation
 *
 * Utiliza drizzle-zod para generar automáticamente schemas desde tablas Drizzle.
 * Reutiliza schemas de la capa de validaciones para inputs.
 *
 * @module server/api/routers/admin/address/address.schemas
 */
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { projectAddressSchema as projectAddressValidationSchema } from "@/app/(dashboard)/admin/quotes/_schemas/project-address.schema";
import { projectAddresses } from "@/server/db/schema";

/**
 * CREATE Procedure Input
 * Reutiliza schema de validaciones
 */
export const createInputSchema = projectAddressValidationSchema;
export type CreateInput = z.infer<typeof createInputSchema>;

/**
 * CREATE Procedure Output
 * Automáticamente generado desde tabla Drizzle via drizzle-zod
 */
export const createOutputSchema = createSelectSchema(projectAddresses);
export type CreateOutput = z.infer<typeof createOutputSchema>;

/**
 * READ (by ID) Procedure Input
 */
export const readByIdInputSchema = z.object({
  id: z.string().cuid({
    message: "ID de dirección inválido",
  }),
});
export type ReadByIdInput = z.infer<typeof readByIdInputSchema>;

/**
 * READ (by ID) Procedure Output
 * Single Address record or null
 * Automáticamente generado desde tabla Drizzle via drizzle-zod
 */
export const readByIdOutputSchema =
  createSelectSchema(projectAddresses).nullable();
export type ReadByIdOutput = z.infer<typeof readByIdOutputSchema>;

/**
 * LIST (by Quote) Procedure Input
 */
export const listByQuoteInputSchema = z.object({
  quoteId: z.string().cuid({
    message: "ID de cotización inválido",
  }),
});
export type ListByQuoteInput = z.infer<typeof listByQuoteInputSchema>;

/**
 * LIST (by Quote) Procedure Output
 * Array de Address records
 * Automáticamente generado desde tabla Drizzle via drizzle-zod
 */
export const listByQuoteOutputSchema = z.array(
  createSelectSchema(projectAddresses)
);
export type ListByQuoteOutput = z.infer<typeof listByQuoteOutputSchema>;

/**
 * UPDATE Procedure Input
 */
export const updateInputSchema = z.object({
  id: z.string().cuid({
    message: "ID de dirección inválido",
  }),
  data: projectAddressValidationSchema.partial(),
});
export type UpdateInput = z.infer<typeof updateInputSchema>;

/**
 * UPDATE Procedure Output
 * Automáticamente generado desde tabla Drizzle via drizzle-zod
 */
export const updateOutputSchema = createSelectSchema(projectAddresses);
export type UpdateOutput = z.infer<typeof updateOutputSchema>;

/**
 * DELETE Procedure Input
 */
export const deleteInputSchema = z.object({
  id: z.string().cuid({
    message: "ID de dirección inválido",
  }),
});
export type DeleteInput = z.infer<typeof deleteInputSchema>;

/**
 * DELETE Procedure Output
 * Single Address record (the deleted record)
 * Automáticamente generado desde tabla Drizzle via drizzle-zod
 */
export const deleteOutputSchema = createSelectSchema(projectAddresses);
export type DeleteOutput = z.infer<typeof deleteOutputSchema>;
