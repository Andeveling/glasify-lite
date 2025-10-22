/**
 * Glass Type Validation Schemas
 *
 * Zod schemas for GlassType entity CRUD operations (v2.0 - Static Glass Taxonomy)
 *
 * Entity: GlassType (glass specifications with solutions and characteristics)
 * Fields: code (required), name, manufacturer, series, thicknessMm, uValue,
 *         description, solarFactor, lightTransmission, isActive, lastReviewDate,
 *         isSeeded, seedVersion
 * Relations: solutions (Many-to-Many via GlassTypeSolution),
 *            characteristics (Many-to-Many via GlassTypeCharacteristic),
 *            prices (One-to-Many via TenantGlassTypePrice)
 *
 * Breaking Changes (v2.0):
 * - Removed: purpose (use solutions instead), pricePerSqm (use TenantGlassTypePrice),
 *            sku (use code), glassSupplierId (use manufacturer string)
 * - Added: code (required), series, manufacturer, isSeeded, seedVersion
 */

import { PerformanceRating } from '@prisma/client';
import { z } from 'zod';
import {
  activeFilterSchema,
  longText,
  optionalSpanishText,
  paginationSchema,
  searchQuerySchema,
  sortOrderSchema,
  spanishText,
} from '../shared.schema';

/**
 * Constants
 */
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 100;
export const MIN_CODE_LENGTH = 2;
export const MAX_CODE_LENGTH = 50;
export const MAX_SERIES_LENGTH = 50;
export const MAX_MANUFACTURER_LENGTH = 100;
export const MIN_THICKNESS_MM = 1;
export const MAX_THICKNESS_MM = 50;
export const MIN_SOLAR_FACTOR = 0.0;
export const MAX_SOLAR_FACTOR = 1.0;
export const MIN_LIGHT_TRANSMISSION = 0.0;
export const MAX_LIGHT_TRANSMISSION = 1.0;
export const MIN_U_VALUE = 0.0;
export const MAX_U_VALUE = 10.0;
export const MAX_CERTIFICATION_LENGTH = 100;
export const MAX_CHARACTERISTIC_VALUE_LENGTH = 100;

/**
 * PerformanceRating enum schema (Prisma enum)
 * Used in GlassTypeSolution relationship
 */
const performanceRatingSchema = z.nativeEnum(PerformanceRating, {
  message: 'La calificación debe ser: basic, standard, good, very_good, o excellent',
});

/**
 * Code validation (product code from manufacturer)
 * Required, alphanumeric with hyphens, slashes, spaces
 * Examples: "N70/38", "ClimaGuard 80/70", "6mm-Clear"
 */
const codeSchema = z
  .string()
  .min(MIN_CODE_LENGTH, `El código debe tener al menos ${MIN_CODE_LENGTH} caracteres`)
  .max(MAX_CODE_LENGTH, `El código no puede exceder ${MAX_CODE_LENGTH} caracteres`)
  .describe('Manufacturer product code (e.g., N70/38, ClimaGuard 80/70)');

/**
 * Thickness validation (millimeters)
 * Range: 1-50mm (common glass thicknesses)
 */
const thicknessSchema = z
  .number()
  .int('El espesor debe ser un número entero')
  .min(MIN_THICKNESS_MM, `El espesor mínimo es ${MIN_THICKNESS_MM}mm`)
  .max(MAX_THICKNESS_MM, `El espesor máximo es ${MAX_THICKNESS_MM}mm`);

/**
 * U-Value validation (thermal transmittance in W/m²·K)
 * Range: 0.0-10.0 (optional)
 */
const uValueSchema = z
  .number()
  .min(MIN_U_VALUE, `El valor U mínimo es ${MIN_U_VALUE}`)
  .max(MAX_U_VALUE, `El valor U máximo es ${MAX_U_VALUE}`)
  .optional()
  .nullable();

/**
 * Solar Factor validation (g-value: 0.00-1.00)
 * Optional, 2 decimal places
 */
const solarFactorSchema = z
  .number()
  .min(MIN_SOLAR_FACTOR, `El factor solar mínimo es ${MIN_SOLAR_FACTOR}`)
  .max(MAX_SOLAR_FACTOR, `El factor solar máximo es ${MAX_SOLAR_FACTOR}`)
  .optional()
  .nullable();

/**
 * Light Transmission validation (percentage: 0.00-1.00)
 * Optional, 2 decimal places
 */
const lightTransmissionSchema = z
  .number()
  .min(MIN_LIGHT_TRANSMISSION, `La transmisión de luz mínima es ${MIN_LIGHT_TRANSMISSION}`)
  .max(MAX_LIGHT_TRANSMISSION, `La transmisión de luz máxima es ${MAX_LIGHT_TRANSMISSION}`)
  .optional()
  .nullable();

/**
 * Series validation (optional product line identifier)
 * e.g., "ClimaGuard", "Performance", "Comfort"
 */
const seriesSchema = z
  .string()
  .max(MAX_SERIES_LENGTH, `La serie no puede exceder ${MAX_SERIES_LENGTH} caracteres`)
  .optional()
  .nullable();

/**
 * Manufacturer validation (optional brand identifier)
 * e.g., "Guardian", "Vitro", "AGC"
 */
const manufacturerSchema = z
  .string()
  .max(MAX_MANUFACTURER_LENGTH, `El fabricante no puede exceder ${MAX_MANUFACTURER_LENGTH} caracteres`)
  .optional()
  .nullable();

/**
 * Glass Type Solution Input Schema
 * For nested create/update of GlassTypeSolution relationships
 */
const glassTypeSolutionInputSchema = z.object({
  isPrimary: z.boolean().default(false).describe('Whether this is the primary solution'),

  notes: optionalSpanishText.pipe(longText).describe('Additional notes about this solution assignment'),

  performanceRating: performanceRatingSchema.describe('Performance rating (1-5 scale)'),

  solutionId: z.string().cuid('ID de solución inválido').describe('Glass solution ID'),
});

export type GlassTypeSolutionInput = z.infer<typeof glassTypeSolutionInputSchema>;

/**
 * Glass Type Characteristic Input Schema
 * For nested create/update of GlassTypeCharacteristic relationships
 */
const glassTypeCharacteristicInputSchema = z.object({
  certification: z
    .string()
    .max(MAX_CERTIFICATION_LENGTH, `La certificación no puede exceder ${MAX_CERTIFICATION_LENGTH} caracteres`)
    .optional()
    .nullable()
    .describe('Certification reference (e.g., EN 12150)'),

  characteristicId: z.string().cuid('ID de característica inválido').describe('Glass characteristic ID'),

  notes: optionalSpanishText.pipe(longText).describe('Additional notes about this characteristic'),

  value: z
    .string()
    .max(MAX_CHARACTERISTIC_VALUE_LENGTH, `El valor no puede exceder ${MAX_CHARACTERISTIC_VALUE_LENGTH} caracteres`)
    .optional()
    .nullable()
    .describe('Optional value for the characteristic (e.g., 6.38mm for laminated thickness)'),
});

export type GlassTypeCharacteristicInput = z.infer<typeof glassTypeCharacteristicInputSchema>;

/**
 * Base Glass Type Schema
 * Shared fields for create/update operations
 */
const baseGlassTypeSchema = z.object({
  code: codeSchema.describe('Unique glass type code (e.g., TEMP6, LAM44)'),

  description: optionalSpanishText.pipe(longText).describe('Detailed description of the glass type'),

  isActive: z.boolean().default(true).describe('Whether this glass type is active for selection'),

  lastReviewDate: z
    .date()
    .optional()
    .nullable()
    .or(
      z
        .string()
        .datetime()
        .transform((str) => new Date(str))
    )
    .describe('Date of last technical review'),

  lightTransmission: lightTransmissionSchema.describe('Light transmission percentage (0.00-1.00)'),

  manufacturer: manufacturerSchema.describe('Optional manufacturer/brand identifier'),

  name: spanishText
    .min(MIN_NAME_LENGTH, `El nombre debe tener al menos ${MIN_NAME_LENGTH} caracteres`)
    .max(MAX_NAME_LENGTH, `El nombre no puede exceder ${MAX_NAME_LENGTH} caracteres`)
    .describe('Glass type name (e.g., Vidrio Templado 6mm)'),

  pricePerSqm: z.number().min(0, 'El precio debe ser mayor o igual a 0').describe('Price per square meter'),

  series: seriesSchema.describe('Optional product series/line identifier'),

  solarFactor: solarFactorSchema.describe('Solar factor g-value (0.00-1.00)'),

  thicknessMm: thicknessSchema.describe('Glass thickness in millimeters'),

  uValue: uValueSchema.describe('Thermal transmittance U-value (W/m²·K)'),
});

/**
 * Create Glass Type Schema
 * Includes nested arrays for solutions and characteristics
 */
export const createGlassTypeSchema = baseGlassTypeSchema.extend({
  characteristics: z.array(glassTypeCharacteristicInputSchema).describe('Glass characteristics to assign'),

  solutions: z
    .array(glassTypeSolutionInputSchema)
    .refine(
      (solutions) => {
        const primaryCount = solutions.filter((s) => s.isPrimary).length;
        return primaryCount <= 1;
      },
      {
        message: 'Solo una solución puede ser marcada como principal',
      }
    )
    .describe('Glass solutions to assign'),
});

export type CreateGlassTypeInput = z.infer<typeof createGlassTypeSchema>;

/**
 * Update Glass Type Schema
 * Wraps partial data with id
 * Solutions and characteristics arrays REPLACE existing relationships (not merge)
 */
export const updateGlassTypeSchema = z.object({
  data: baseGlassTypeSchema.partial().extend({
    characteristics: z.array(glassTypeCharacteristicInputSchema).optional().describe('Replace all characteristics'),

    solutions: z
      .array(glassTypeSolutionInputSchema)
      .optional()
      .refine(
        (solutions) => {
          if (!solutions) return true;
          const primaryCount = solutions.filter((s) => s.isPrimary).length;
          return primaryCount <= 1;
        },
        {
          message: 'Solo una solución puede ser marcada como principal',
        }
      )
      .describe('Replace all solutions'),
  }),
  id: z.string().cuid('ID de tipo de vidrio inválido'),
});

export type UpdateGlassTypeInput = z.infer<typeof updateGlassTypeSchema>;

/**
 * List Glass Types Schema
 * Pagination + search + filters + sorting
 */
export const listGlassTypesSchema = paginationSchema.extend({
  isActive: activeFilterSchema.optional().describe('Filter by active status'),

  search: searchQuerySchema.describe('Search by name, code, or description'),

  solutionId: z.string().cuid('ID de solución inválido').optional().describe('Filter by assigned solution'),

  sortBy: z.enum(['name', 'thicknessMm', 'pricePerSqm', 'createdAt', 'purpose']).default('name').describe('Sort field'),

  sortOrder: sortOrderSchema.describe('Sort order'),

  thicknessMax: z.number().int().positive().optional().describe('Filter by maximum thickness'),

  thicknessMin: z.number().int().positive().optional().describe('Filter by minimum thickness'),
});

export type ListGlassTypesInput = z.infer<typeof listGlassTypesSchema>;

/**
 * List Glass Types Output Schema
 * Defines the shape of paginated glass type list responses
 */
export const listGlassTypesOutputSchema = z.object({
  items: z.array(
    z.object({
      // biome-ignore lint/style/useNamingConvention: Prisma generated field
      _count: z.object({
        characteristics: z.number(),
        quoteItems: z.number(),
        solutions: z.number(),
      }),
      code: z.string(),
      createdAt: z.date(),
      description: z.string().nullable(),
      id: z.string(),
      isActive: z.boolean(),
      isSeeded: z.boolean(),
      lastReviewDate: z.date().nullable(),
      lightTransmission: z.number().nullable(),
      manufacturer: z.string().nullable(),
      name: z.string(),
      seedVersion: z.string().nullable(),
      series: z.string().nullable(),
      solarFactor: z.number().nullable(),
      // Primary solution (if any)
      solutions: z.array(
        z.object({
          isPrimary: z.boolean(),
          solution: z.object({
            id: z.string(),
            key: z.string(),
            nameEs: z.string(),
          }),
        })
      ),
      thicknessMm: z.number(),
      updatedAt: z.date(),
      uValue: z.number().nullable(),
    })
  ),
  limit: z.number().int().positive(),
  page: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type ListGlassTypesOutput = z.infer<typeof listGlassTypesOutputSchema>;

/**
 * Get Glass Type by ID Output Schema
 * Includes full relations (solutions, characteristics)
 */
export const getGlassTypeByIdOutputSchema = z.object({
  // biome-ignore lint/style/useNamingConvention: Prisma generated field
  _count: z.object({
    characteristics: z.number(),
    quoteItems: z.number(),
    solutions: z.number(),
  }),
  characteristics: z.array(
    z.object({
      certification: z.string().nullable(),
      characteristic: z.object({
        category: z.string(),
        id: z.string(),
        key: z.string(),
        name: z.string(),
        nameEs: z.string(),
      }),
      characteristicId: z.string(),
      id: z.string(),
      notes: z.string().nullable(),
      value: z.string().nullable(),
    })
  ),
  code: z.string(),
  createdAt: z.date(),
  description: z.string().nullable(),
  id: z.string(),
  isActive: z.boolean(),
  isSeeded: z.boolean(),
  lastReviewDate: z.date().nullable(),
  lightTransmission: z.number().nullable(),
  manufacturer: z.string().nullable(),
  name: z.string(),
  seedVersion: z.string().nullable(),
  series: z.string().nullable(),
  solarFactor: z.number().nullable(),
  solutions: z.array(
    z.object({
      id: z.string(),
      isPrimary: z.boolean(),
      notes: z.string().nullable(),
      performanceRating: performanceRatingSchema,
      solution: z.object({
        icon: z.string().nullable(),
        id: z.string(),
        key: z.string(),
        name: z.string(),
        nameEs: z.string(),
      }),
      solutionId: z.string(),
    })
  ),
  thicknessMm: z.number(),
  updatedAt: z.date(),
  uValue: z.number().nullable(),
});

export type GetGlassTypeByIdOutput = z.infer<typeof getGlassTypeByIdOutputSchema>;

/**
 * Delete Glass Type Schema
 * Requires ID only
 */
export const deleteGlassTypeSchema = z.object({
  id: z.string().cuid('ID de tipo de vidrio inválido'),
});

export type DeleteGlassTypeInput = z.infer<typeof deleteGlassTypeSchema>;
