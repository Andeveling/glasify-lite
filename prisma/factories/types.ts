/**
 * Factory Pattern Type Definitions
 *
 * Provides base types for seed data factories with Zod validation support.
 * These types enable type-safe, validated object creation for database seeding.
 */

import type { z } from "zod";

/**
 * Common options for all factory functions
 */
export type FactoryOptions = {
  /**
   * Whether to skip validation (useful for performance in trusted environments)
   * @default false
   */
  skipValidation?: boolean;

  /**
   * Override default values with partial data
   */
  overrides?: Record<string, unknown>;
};

/**
 * Result of a factory operation with validation
 */
export type FactoryResult<T> = {
  /**
   * Whether validation succeeded
   */
  success: boolean;

  /**
   * The created data (if successful)
   */
  data?: T;

  /**
   * Validation errors (if failed)
   */
  errors?: ValidationError[];
};

/**
 * Structured validation error
 */
export type ValidationError = {
  /**
   * Field path (e.g., "pricePerSqm", "dimensions.minWidth")
   */
  path: string[];

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Error code for programmatic handling
   */
  code: string;

  /**
   * Additional context about the error
   */
  context?: Record<string, unknown>;
};

/**
 * Base factory function type
 */
export type Factory<TInput, TOutput> = (
  input: TInput,
  options?: FactoryOptions
) => FactoryResult<TOutput>;

/**
 * Helper type for Zod schema inference
 * Using ZodType instead of deprecated ZodTypeAny
 */
export type InferSchema<T extends z.ZodType> = z.infer<T>;

/**
 * Factory metadata for documentation
 */
export type FactoryMetadata = {
  /**
   * Factory name
   */
  name: string;

  /**
   * Description of what this factory creates
   */
  description: string;

  /**
   * Version of the factory (for tracking changes)
   */
  version: string;

  /**
   * Data sources used (URLs, documentation references)
   */
  sources?: string[];
};

/**
 * Preset configuration type
 */
export type PresetConfig<T = unknown> = {
  /**
   * Preset name
   */
  name: string;

  /**
   * Preset description
   */
  description: string;

  /**
   * Data to seed
   */
  data: T;
};
