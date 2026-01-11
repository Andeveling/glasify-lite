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

const CUID_REGEX = /^c[0-9a-z]{24}$/i;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidGlassTypeId = (id: string) =>
  CUID_REGEX.test(id) || UUID_REGEX.test(id);

const isValidItemId = (id: string) => CUID_REGEX.test(id);

// Name/room length limits used by zod schema
const MAX_NAME_LENGTH = 50;
const MAX_ROOM_LOCATION_LENGTH = 100;

/**
 *
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
    .max(MAX_NAME_LENGTH, {
      message: `El nombre no puede exceder ${MAX_NAME_LENGTH} caracteres`,
    })
    .optional(),
  roomLocation: z
    .string()
    .max(MAX_ROOM_LOCATION_LENGTH, {
      message: `La ubicación no puede exceder ${MAX_ROOM_LOCATION_LENGTH} caracteres`,
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
