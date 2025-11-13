/**
 * @file GlassType Seeder
 * @description Persists GlassType data using Drizzle ORM
 * Implements BaseSeeder<T> contract for dependency injection
 */

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
  glassTypes,
  type NewGlassType,
} from "@/server/db/schemas/glass-type.schema";
import { BaseSeeder, ConsoleSeederLogger } from "../contracts/seeder.interface";
import type {
  ISeederLogger,
  SeederOptions,
  SeederResult,
} from "../types/base.types";

const DEFAULT_BATCH_SIZE = 100;

/**
 * GlassTypeSeeder
 * Handles persistence of GlassType entities using Drizzle
 *
 * @example
 * ```typescript
 * import { db } from '@/server/db';
 *
 * const seeder = new GlassTypeSeeder(db);
 * const result = await seeder.upsert(data);
 * console.log(`Inserted: ${result.inserted}, Updated: ${result.updated}`);
 * ```
 */
export class GlassTypeSeeder extends BaseSeeder<NewGlassType> {
  private readonly drizzle: NodePgDatabase;

  constructor(
    db: NodePgDatabase,
    logger: ISeederLogger = new ConsoleSeederLogger()
  ) {
    super(db, logger, "GlassType");
    this.drizzle = db;
  }

  /**
   * Insert a batch of GlassTypes
   * Implements BaseSeeder abstract method
   */
  protected async insertBatch(batch: NewGlassType[]): Promise<number> {
    const result = await this.drizzle
      .insert(glassTypes)
      .values(batch)
      .onConflictDoNothing({ target: glassTypes.code })
      .returning({ id: glassTypes.id });

    return result.length;
  }

  /**
   * Upsert glass types (insert or update by code)
   */
  async upsert(
    data: NewGlassType[],
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
    batch: NewGlassType[],
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
    item: NewGlassType,
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
        this.logger?.debug?.(`✓ Inserted: ${item.code}`);
        return { inserted: 1, updated: 0, failed: 0 };
      }
      if (updated) {
        this.logger?.debug?.(`✓ Updated: ${item.code}`);
        return { inserted: 0, updated: 1, failed: 0 };
      }
      this.logger?.error?.(`✗ Failed (no insert/update): ${item.code}`);
      return { inserted: 0, updated: 0, failed: 1 };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger?.error?.(`✗ Failed to upsert "${item.code}": ${errMsg}`);
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
    item: NewGlassType
  ): Promise<{ inserted: boolean; updated: boolean }> {
    try {
      const result = await this.drizzle
        .insert(glassTypes)
        .values(item)
        .onConflictDoUpdate({
          target: glassTypes.code,
          set: {
            name: item.name,
            series: item.series,
            manufacturer: item.manufacturer,
            glassSupplierId: item.glassSupplierId,
            thicknessMm: item.thicknessMm,
            pricePerSqm: item.pricePerSqm,
            uValue: item.uValue,
            description: item.description,
            solarFactor: item.solarFactor,
            lightTransmission: item.lightTransmission,
            isActive: item.isActive,
            lastReviewDate: item.lastReviewDate,
            isSeeded: item.isSeeded,
            seedVersion: item.seedVersion,
          },
        })
        .returning({
          createdAt: glassTypes.createdAt,
          updatedAt: glassTypes.updatedAt,
        });

      if (result.length > 0) {
        const rec = result[0];
        if (rec?.createdAt && rec?.updatedAt) {
          const isNew = rec.createdAt.getTime() === rec.updatedAt.getTime();
          return { inserted: isNew, updated: !isNew };
        }
      }

      return { inserted: false, updated: false };
    } catch (error) {
      throw new Error(
        `Failed to upsert glass type "${item.code}": ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Clear all GlassTypes
   */
  async clear(): Promise<number> {
    const result = await this.drizzle.delete(glassTypes).returning();
    return result.length;
  }
}
