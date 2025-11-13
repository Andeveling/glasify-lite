/**
 * @file Service Seeder
 * @description Persists Service data using Drizzle ORM
 * Implements BaseSeeder<T> contract for dependency injection
 */

import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { type NewService, services } from "@/server/db/schemas/service.schema";
import { BaseSeeder, ConsoleSeederLogger } from "../contracts/seeder.interface";
import type {
  ISeederLogger,
  SeederOptions,
  SeederResult,
} from "../types/base.types";

const DEFAULT_BATCH_SIZE = 100;

/**
 * ServiceSeeder
 * Handles persistence of Service entities using Drizzle
 *
 * @example
 * ```typescript
 * import { db } from '@/server/db';
 *
 * const seeder = new ServiceSeeder(db);
 * const result = await seeder.upsert(data);
 * console.log(`Inserted: ${result.inserted}, Updated: ${result.updated}`);
 * ```
 */
export class ServiceSeeder extends BaseSeeder<NewService> {
  private readonly drizzle: NodePgDatabase;

  constructor(
    db: NodePgDatabase,
    logger: ISeederLogger = new ConsoleSeederLogger()
  ) {
    super(db, logger, "Service");
    this.drizzle = db;
  }

  /**
   * Insert a batch of Services
   * Implements BaseSeeder abstract method
   */
  protected async insertBatch(batch: NewService[]): Promise<number> {
    const result = await this.drizzle
      .insert(services)
      .values(batch)
      .onConflictDoNothing({ target: services.name })
      .returning({ id: services.id });

    return result.length;
  }

  /**
   * Upsert services (insert or update by name)
   */
  async upsert(
    data: NewService[],
    options?: SeederOptions
  ): Promise<SeederResult> {
    const batchSize = options?.batchSize ?? DEFAULT_BATCH_SIZE;
    let inserted = 0;
    let updated = 0;
    let failed = 0;
    const errors: Array<{ index: number; error: unknown }> = [];

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      const batchResult = await this.processBatch(batch, i, options);

      inserted += batchResult.inserted;
      updated += batchResult.updated;
      failed += batchResult.failed;
      errors.push(...batchResult.errors);

      if (batchResult.shouldStop) {
        break;
      }
    }

    return {
      success: failed === 0,
      inserted,
      updated,
      failed,
      errors: errors.map((e) => ({
        index: e.index,
        error: { code: "UPSERT_ERROR", message: String(e.error), path: [] },
      })),
    };
  }

  /**
   * Process a batch sequentially
   * @private
   */
  private async processBatch(
    batch: NewService[],
    startIndex: number,
    options?: SeederOptions
  ): Promise<{
    inserted: number;
    updated: number;
    failed: number;
    errors: Array<{ index: number; error: unknown }>;
    shouldStop: boolean;
  }> {
    let inserted = 0;
    let updated = 0;
    let failed = 0;
    const errors: Array<{ index: number; error: unknown }> = [];

    for (let j = 0; j < batch.length; j++) {
      const item = batch[j];
      if (!item) {
        continue;
      }

      const globalIndex = startIndex + j;
      const result = await this.processItem(item, globalIndex);

      inserted += result.inserted;
      updated += result.updated;
      failed += result.failed;

      if (result.error) {
        errors.push(result.error);
        if (!options?.continueOnError) {
          return { inserted, updated, failed, errors, shouldStop: true };
        }
      }
    }

    return { inserted, updated, failed, errors, shouldStop: false };
  }

  /**
   * Process a single item with error handling
   * @private
   */
  private async processItem(
    item: NewService,
    globalIndex: number
  ): Promise<{
    inserted: number;
    updated: number;
    failed: number;
    error?: { index: number; error: unknown };
  }> {
    try {
      const { inserted, updated } = await this.upsertItem(item);
      if (inserted) {
        this.logger?.debug?.(`✓ Inserted: ${item.name}`);
        return { inserted: 1, updated: 0, failed: 0 };
      }
      if (updated) {
        this.logger?.debug?.(`✓ Updated: ${item.name}`);
        return { inserted: 0, updated: 1, failed: 0 };
      }
      this.logger?.error?.(`✗ Failed (no insert/update): ${item.name}`);
      return { inserted: 0, updated: 0, failed: 1 };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger?.error?.(`✗ Failed to upsert "${item.name}": ${errMsg}`);
      return {
        inserted: 0,
        updated: 0,
        failed: 1,
        error: { index: globalIndex, error },
      };
    }
  }

  /**
   * Execute the actual upsert statement
   * @private
   */
  private async upsertItem(
    item: NewService
  ): Promise<{ inserted: boolean; updated: boolean }> {
    try {
      // Check if service exists by name (no unique constraint on name, so we can't use onConflict)
      const existing = await this.drizzle
        .select({ id: services.id, createdAt: services.createdAt })
        .from(services)
        .where(sql`${services.name} = ${item.name}`)
        .limit(1);

      if (existing.length > 0 && existing[0]) {
        // Update existing service
        await this.drizzle
          .update(services)
          .set({
            type: item.type,
            unit: item.unit,
            rate: item.rate,
            minimumBillingUnit: item.minimumBillingUnit,
            isActive: item.isActive,
            updatedAt: new Date(),
          })
          .where(sql`${services.id} = ${existing[0].id}`);

        return { inserted: false, updated: true };
      }

      // Insert new service
      await this.drizzle.insert(services).values(item);

      return { inserted: true, updated: false };
    } catch (error) {
      throw new Error(
        `Failed to upsert service "${item.name}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Clear all Services
   */
  async clear(): Promise<number> {
    const result = await this.drizzle.delete(services).returning();
    return result.length;
  }
}
