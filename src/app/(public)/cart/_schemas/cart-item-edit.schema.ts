/**
 * Cart Item Edit Validation Schema
 *
 * Zod schema for validating cart item edit form inputs.
 * Server-side validation will also check model-specific dimension constraints.
 */

import { z } from "zod";
import {
  MAX_DIMENSION,
  MIN_DIMENSION,
} from "../_constants/cart-item.constants";

const isValidGlassTypeId = (id: string) =>
  z.string().uuid().safeParse(id).success;

const isValidItemId = (id: string) => CUID_REGEX.test(id);

/**
 * Cart item edit input schema
 *
 * Validates user input before submission to tRPC mutation.
 * Spanish error messages for user-facing feedback.
 */
export const cartItemEditSchema = z.object({
  itemId: z.string({ message: "ID de item inválido" }).refine(isValidItemId, {
    message: "ID de item inválido",
  }),
  widthMm: z
    .number({
      message: "El ancho es requerido",
    })
    .int({
      message: "El ancho debe ser un número entero",
    })
    .min(MIN_DIMENSION, {
      message: `El ancho mínimo es ${MIN_DIMENSION}mm`,
    })
    .max(MAX_DIMENSION, {
      message: `El ancho máximo es ${MAX_DIMENSION}mm`,
    }),
  heightMm: z
    .number({
      message: "El alto es requerido",
    })
    .int({
      message: "El alto debe ser un número entero",
    })
    .min(MIN_DIMENSION, {
      message: `El alto mínimo es ${MIN_DIMENSION}mm`,
    })
    .max(MAX_DIMENSION, {
      message: `El alto máximo es ${MAX_DIMENSION}mm`,
    }),
  glassTypeId: z
    .string({
      message: "El tipo de vidrio es requerido",
    })
    .refine(isValidGlassTypeId, {
      message: "ID de tipo de vidrio inválido",
    }),
  name: z
    .string()
    .max(50, {
      message: "El nombre no puede exceder 50 caracteres",
    })
    .optional(),
  roomLocation: z
    .string()
    .max(100, {
      message: "La ubicación no puede exceder 100 caracteres",
    })
    .optional(),
  quantity: z
    .number({
      message: "La cantidad debe ser un número",
    })
    .int({
      message: "La cantidad debe ser un número entero",
    })
    .min(1, {
      message: "La cantidad mínima es 1",
    })
    .default(1),
});

/**
 * TypeScript type inferred from schema
 */
export type CartItemEditInput = z.infer<typeof cartItemEditSchema>;
