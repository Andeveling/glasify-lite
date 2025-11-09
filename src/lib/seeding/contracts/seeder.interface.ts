/**
 * @file Seeder Contracts (Interfaces)
 * @description Contract definitions for seeders with dependency injection support
 */

import type {
  ISeeder,
  ISeederLogger,
  SeederOptions,
  SeederResult,
} from "../types/base.types";

/**
 * Base seeder class implementing ISeeder interface
 * Provides common functionality for all seeders
 *
 * @template T - The entity type being seeded
 *
 * @example
 * ```typescript
 * class UserSeeder extends BaseSeeder<User> {
 *   constructor(db: Database, logger: ISeederLogger) {
 *     super(db, logger, 'User');
 *   }
 *
 *   protected async insertBatch(data: User[]): Promise<number> {
 *     const result = await this.db.insert(userTable).values(data);
 *     return result.rowCount;
 *   }
 * }
 * ```
 */
export abstract class BaseSeeder<T> implements ISeeder<T> {
  /**
   * Default batch size for inserts
   * @internal
   */
  protected readonly DEFAULT_BATCH_SIZE = 100;

  /**
   * Entity name for logging
   * @internal
   */
  protected entityName: string;

  /**
   * Database client (any ORM client)
   * @internal
   */
  protected db: unknown;

  /**
   * Logger instance
   * @internal
   */
  protected logger: ISeederLogger;

  /**
   * Constructor
   * @param dbClient - Database client (any ORM client)
   * @param loggerInstance - Logger instance
   * @param entityName - Human-readable entity name
   */
  constructor(
    dbClient: unknown,
    loggerInstance: ISeederLogger,
    entityName: string
  ) {
    this.db = dbClient;
    this.logger = loggerInstance;
    this.entityName = entityName;
  }

  /**
   * Seed data into the database
   * Override insertBatch() in subclass for actual insertion
   */
  async seed(data: T[], options?: SeederOptions): Promise<SeederResult> {
    try {
      const batchSize = options?.batchSize ?? this.DEFAULT_BATCH_SIZE;
      let inserted = 0;
      let failed = 0;
      const errors: Array<{ index: number; error: Error | unknown }> = [];

      // Process in batches
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);

        try {
          const count = await this.insertBatch(batch);
          inserted += count;
        } catch (error) {
          failed += batch.length;
          if (!options?.continueOnError) {
            throw error;
          }
          errors.push({
            error,
            index: i,
          });
        }
      }

      this.logger.info(
        `✅ Seeded ${inserted}/${data.length} ${this.entityName} records`
      );

      return {
        errors: errors.map((e) => ({
          error: {
            code: "SEED_ERROR",
            message:
              e.error instanceof Error ? e.error.message : String(e.error),
            path: [this.entityName],
          },
          index: e.index,
        })),
        failed,
        inserted,
        success: failed === 0,
        updated: 0,
      };
    } catch (error) {
      this.logger.error(
        `❌ Failed to seed ${this.entityName}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      );

      return {
        errors: [
          {
            error: {
              code: "SEED_FAILED",
              message: error instanceof Error ? error.message : "Unknown error",
              path: [this.entityName],
            },
            index: 0,
          },
        ],
        failed: data.length,
        inserted: 0,
        success: false,
        updated: 0,
      };
    }
  }

  /**
   * Upsert data (insert or update)
   * Default implementation - override for database-specific upsert logic
   */
  upsert(data: T[], options?: SeederOptions): Promise<SeederResult> {
    // Default: just insert
    return this.seed(data, options);
  }

  /**
   * Clear all existing data
   * Must be implemented by subclass
   */
  abstract clear(): Promise<number>;

  /**
   * Insert a batch of records
   * Must be implemented by subclass
   *
   * @param batch - Data to insert
   * @returns Number of inserted records
   * @internal
   */
  protected abstract insertBatch(batch: T[]): Promise<number>;
}

/**
 * Logger implementation for seeders
 * Provides a no-op logger that suppresses output (avoids console usage)
 * Can be replaced with Winston, Pino, or any other logger
 */
export class ConsoleSeederLogger implements ISeederLogger {
  /**
   * Log info message
   */
  info(): void {
    // No-op: seeders should use server-side logging only
  }

  /**
   * Log warning message
   */
  warn(): void {
    // No-op: seeders should use server-side logging only
  }

  /**
   * Log error message
   */
  error(): void {
    // No-op: seeders should use server-side logging only
  }

  /**
   * Log debug message
   */
  debug(): void {
    // No-op: seeders should use server-side logging only
  }

  /**
   * Log section title
   */
  section(): void {
    // No-op: seeders should use server-side logging only
  }

  /**
   * Log success message
   */
  success(): void {
    // No-op: seeders should use server-side logging only
  }
}
