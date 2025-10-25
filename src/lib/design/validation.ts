import { z } from 'zod';
import type { StoredDesignConfig } from './types';

// Validation constants
const MAX_PERCENT_VALUE = 1;
const MIN_PERCENT_VALUE = 0;
const MAX_OPACITY_VALUE = 1;
const MIN_OPACITY_VALUE = 0;
const MAX_SHAPES_PER_DESIGN = 100;
const MIN_SHAPES_PER_DESIGN = 1;

/**
 * Validates position value (absolute or percentage)
 */
const positionValueSchema = z.union([
  z.number().nonnegative(),
  z.object({
    percent: z.number().min(MIN_PERCENT_VALUE).max(MAX_PERCENT_VALUE),
  }),
]);

/**
 * Validates size value (absolute, percentage, or 'fill')
 */
const sizeValueSchema = z.union([
  z.number().nonnegative(),
  z.object({
    percent: z.number().min(MIN_PERCENT_VALUE).max(MAX_PERCENT_VALUE),
  }),
  z.literal('fill'),
]);

/**
 * Validates individual shape definition
 */
const shapeDefinitionSchema = z.object({
  id: z.string().min(1),
  layer: z.number().int().nonnegative(),

  position: z.object({
    x: positionValueSchema,
    y: positionValueSchema,
  }),
  role: z.enum(['frame', 'glass', 'handle', 'hinge', 'decorative']),

  size: z.object({
    height: sizeValueSchema,
    width: sizeValueSchema,
  }),

  style: z.object({
    cornerRadius: z.number().nonnegative().optional(),
    fill: z.union([z.string(), z.literal('material')]).optional(),
    opacity: z.number().min(MIN_OPACITY_VALUE).max(MAX_OPACITY_VALUE).optional(),
    stroke: z.string().optional(),
    strokeWidth: z.number().nonnegative().optional(),
  }),
  type: z.enum(['rect', 'circle', 'line', 'path']),
});

/**
 * Validates complete stored design configuration
 */
export const storedDesignConfigSchema = z.object({
  constraints: z
    .object({
      frameThicknessMax: z.number().positive(),
      frameThicknessMin: z.number().positive(),
      glassMargin: z.number().nonnegative(),
    })
    .refine((data) => data.frameThicknessMin <= data.frameThicknessMax, {
      message: 'frameThicknessMin must be <= frameThicknessMax',
    }),

  dimensions: z.object({
    baseHeight: z.number().positive(),
    baseWidth: z.number().positive(),
  }),

  metadata: z.object({
    author: z.string().optional(),
    createdAt: z.string().optional(),
    description: z.string().optional(),
    id: z.string().min(1),
    name: z.string().min(1),
    nameEs: z.string().min(1),
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
  }),

  shapes: z.array(shapeDefinitionSchema).min(MIN_SHAPES_PER_DESIGN).max(MAX_SHAPES_PER_DESIGN),
  version: z.literal('1.0'),
});

/**
 * Type-safe validation function
 */
export function validateDesignConfig(config: unknown): StoredDesignConfig {
  return storedDesignConfigSchema.parse(config) as StoredDesignConfig;
}

/**
 * Safe validation with error handling
 */
export function isValidDesignConfig(config: unknown): config is StoredDesignConfig {
  const result = storedDesignConfigSchema.safeParse(config);
  return result.success;
}
