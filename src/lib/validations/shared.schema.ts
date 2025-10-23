import { z } from 'zod';

/**
 * Shared Zod validation utilities for admin catalog management
 * Used across multiple entity schemas to ensure consistency
 */

// Validation constants
const DECIMAL_PRECISION = 0.01;
const MAX_KEY_LENGTH = 50;
const MAX_TEXT_LENGTH = 500;
const MAX_LONG_TEXT_LENGTH = 2000;
const MAX_SEARCH_LENGTH = 100;
const MAX_PAGE_LIMIT = 100;
const DEFAULT_PAGE_LIMIT = 20;

/**
 * Positive integer validator
 * Used for IDs, counts, sort orders, etc.
 */
export const positiveInt = z.number().int().positive({
  message: 'Debe ser un número entero positivo',
});

/**
 * Non-negative integer validator
 * Used for optional counts, zero-allowed values
 */
export const nonNegativeInt = z.number().int().min(0, {
  message: 'Debe ser un número entero mayor o igual a cero',
});

/**
 * Positive decimal validator
 * Used for prices, rates, dimensions
 */
export const positiveDecimal = z.number().positive({
  message: 'Debe ser un número positivo',
});

/**
 * Non-negative decimal validator
 * Used for optional measurements, zero-allowed prices
 */
export const nonNegativeDecimal = z.number().min(0, {
  message: 'Debe ser un número mayor o igual a cero',
});

/**
 * Price validator (2 decimal places)
 * Used for Colombian pesos (COP)
 */
export const priceValidator = z
  .number()
  .positive({ message: 'El precio debe ser mayor a cero' })
  .multipleOf(DECIMAL_PRECISION, { message: 'El precio debe tener máximo 2 decimales' });

/**
 * Dimension validator with min/max refinement
 * Used for width, height constraints in models
 */
export const dimensionSchema = z.object({
  max: positiveInt,
  min: positiveInt,
});

/**
 * Dimension refinement: validates that min < max
 */
export const dimensionRefinement = <T extends { min: number; max: number }>(
  data: T,
  ctx: z.RefinementCtx,
  field: string
) => {
  if (data.min >= data.max) {
    ctx.addIssue({
      code: 'custom',
      message: `El valor mínimo de ${field} debe ser menor que el máximo`,
      path: ['min'],
    });
  }
};

/**
 * URL validator (optional, but must be valid if provided)
 */
export const optionalUrl = z.url({ message: 'Debe ser una URL válida' }).optional().or(z.literal(''));

/**
 * Email validator
 */
export const emailValidator = z.email({ message: 'Debe ser un correo electrónico válido' });

/**
 * Snake case key validator (for solution keys, characteristic keys)
 * Only allows lowercase letters, numbers, and underscores
 */
export const snakeCaseKey = z
  .string()
  .regex(/^[a-z0-9_]+$/, {
    message: 'Solo se permiten letras minúsculas, números y guiones bajos',
  })
  .min(2, { message: 'Debe tener al menos 2 caracteres' })
  .max(MAX_KEY_LENGTH, { message: 'Debe tener máximo 50 caracteres' });

/**
 * Spanish text validator (required)
 */
export const spanishText = z
  .string()
  .min(1, { message: 'Este campo es obligatorio' })
  .max(MAX_TEXT_LENGTH, { message: 'Debe tener máximo 500 caracteres' });

/**
 * Spanish text validator (optional)
 */
export const optionalSpanishText = z
  .string()
  .max(MAX_TEXT_LENGTH, { message: 'Debe tener máximo 255 caracteres' })
  .optional();

/**
 * Long text validator (for descriptions, notes)
 */
export const longText = z
  .string()
  .max(MAX_LONG_TEXT_LENGTH, { message: 'Debe tener máximo 2000 caracteres' })
  .optional();

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  limit: positiveInt.max(MAX_PAGE_LIMIT).default(DEFAULT_PAGE_LIMIT),
  page: positiveInt.default(1),
});

/**
 * Sort order schema
 */
export const sortOrderSchema = z.enum(['asc', 'desc']).default('asc');

/**
 * Active status filter
 */
export const activeFilterSchema = z.enum(['all', 'active', 'inactive']).default('all');

/**
 * Search query validator
 */
export const searchQuerySchema = z
  .string()
  .max(MAX_SEARCH_LENGTH, { message: 'La búsqueda debe tener máximo 100 caracteres' })
  .optional();
