/**
 * @file Base Types for ORM-Agnostic Seeding Architecture
 * @description Core types that are independent of any ORM (Prisma, Drizzle, etc.)
 * These types define the contract for factories and seeders.
 */

/**
 * Validation error with structured information
 * @property code - Error code (e.g., 'INVALID_FORMAT', 'OUT_OF_RANGE')
 * @property message - Human-readable error message
 * @property path - Dot-notation path to the failing field (e.g., 'profile.email')
 * @property context - Additional context about the error
 */
export type ValidationError = {
  code: string;
  message: string;
  path: string[];
  context?: {
    expected?: unknown;
    received?: unknown;
    [key: string]: unknown;
  };
};

/**
 * Generic result type for factory operations
 * Implements Result Pattern (Success | Failure)
 *
 * @template T - The type of data on success
 * @example
 * ```typescript
 * const result: FactoryResult<User> = createUser({ email: 'user@example.com' });
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.errors);
 * }
 * ```
 */
export type FactoryResult<T> = {
  /** Whether the factory operation succeeded */
  success: boolean;
  /** The created data (only present if success is true) */
  data?: T;
  /** Validation errors (only present if success is false) */
  errors?: ValidationError[];
};

/**
 * Options for factory operations
 * @property skipValidation - Skip Zod validation (dangerous, use only for trusted data)
 * @property overrides - Partial data to override defaults
 */
export type FactoryOptions<T = Record<string, unknown>> = {
  skipValidation?: boolean;
  overrides?: Partial<T>;
};

/**
 * Factory function type
 * Pure function that creates and validates data without side effects
 *
 * @template T - The type of data being created
 * @param options - Factory options with overrides and validation settings
 * @returns FactoryResult with validation outcome
 */
export type FactoryFunction<T> = (
  options?: FactoryOptions<T>
) => FactoryResult<T>;

/**
 * Batch factory function type
 * Creates multiple entities efficiently
 *
 * @template T - The type of data being created
 * @param count - Number of entities to create
 * @param options - Factory options
 * @returns Array of FactoryResult
 */
export type BatchFactoryFunction<T> = (
  count: number,
  options?: FactoryOptions<T>
) => FactoryResult<T>[];

/**
 * Options for seeder operations
 * @property skipValidation - Skip validation before insertion
 * @property batchSize - Number of records to insert per batch (default: 100)
 * @property continueOnError - Continue inserting even if a batch fails
 * @property transaction - Use database transaction (default: true)
 */
export type SeederOptions = {
  skipValidation?: boolean;
  batchSize?: number;
  continueOnError?: boolean;
  transaction?: boolean;
};

/**
 * Result of a seeder operation
 * @property success - Whether seeding succeeded
 * @property inserted - Number of records inserted
 * @property updated - Number of records updated
 * @property failed - Number of records that failed
 * @property errors - Array of errors that occurred
 */
export type SeederResult = {
  success: boolean;
  inserted: number;
  updated: number;
  failed: number;
  errors: Array<{
    index: number;
    error: ValidationError;
  }>;
};

/**
 * Generic seeder interface for dependency injection
 * All seeders implement this contract
 */
export type ISeeder<T> = {
  /**
   * Seed data into the database
   * @param data - Array of data to seed
   * @param options - Seeder options
   * @returns Promise with seeding result
   */
  seed(data: T[], options?: SeederOptions): Promise<SeederResult>;

  /**
   * Upsert data (insert or update)
   * @param data - Array of data to upsert
   * @param options - Seeder options
   * @returns Promise with seeding result
   */
  upsert(data: T[], options?: SeederOptions): Promise<SeederResult>;

  /**
   * Clear all existing data
   * @returns Promise with number of records deleted
   */
  clear(): Promise<number>;
};

/**
 * Orchestrator interface for coordinating multiple seeders
 */
export type IOrchestrator = {
  /**
   * Run seeding with a preset
   * @param preset - Preset configuration with all entities to seed
   * @param options - Seeding options
   * @returns Promise with total seeding stats
   */
  seedWithPreset(
    preset: SeedPreset,
    options?: SeederOptions
  ): Promise<OrchestrationResult>;

  /**
   * Reset all seeded data
   * @returns Promise with stats about cleared data
   */
  reset(): Promise<OrchestrationResult>;
};

/**
 * Preset configuration for seeding
 * Defines all data to seed in a single run
 */
export type SeedPreset = {
  name: string;
  description: string;
  /** Entities should be ordered by dependency (profiles before models) */
  entities: Record<string, unknown[]>;
};

/**
 * Result of orchestration (multiple seeders)
 * @property success - Whether all seeding succeeded
 * @property totalInserted - Total records inserted across all entities
 * @property totalUpdated - Total records updated across all entities
 * @property totalFailed - Total records that failed across all entities
 * @property results - Per-entity results
 * @property duration - Total seeding duration in milliseconds
 */
export type OrchestrationResult = {
  success: boolean;
  totalInserted: number;
  totalUpdated: number;
  totalFailed: number;
  results: Record<string, SeederResult>;
  duration: number;
};

/**
 * Logging interface for seeders
 */
export type ISeederLogger = {
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: Error): void;
  debug(message: string): void;
  section(title: string): void;
  success(message: string): void;
};
