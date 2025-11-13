/**
 * @file GlassSolution Seeder
 * @description Persists GlassSolution data using Drizzle ORM
 * Implements BaseSeeder<T> contract for dependency injection
 */

import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import {
  glassSolutions,
  type NewGlassSolution,
} from "@/server/db/schemas/glass-solution.schema";
import { BaseSeeder, ConsoleSeederLogger } from "../contracts/seeder.interface";
import type {
  ISeederLogger,
  SeederOptions,
  SeederResult,
} from "../types/base.types";

const DEFAULT_BATCH_SIZE = 100;

/**
 * Helper: Generate slug from key (snake_case → kebab-case)
 */
function generateSlug(key: string): string {
  return key.replace(/_/g, "-");
}

/**
 * GlassSolutionSeeder
 * Handles persistence of GlassSolution entities using Drizzle
 *
 * @example
 * ```typescript
 * import { db } from '@/server/db';
 *
 * const seeder = new GlassSolutionSeeder(db);
 * const result = await seeder.upsert(data);
 * console.log(`Inserted: ${result.inserted}, Updated: ${result.updated}`);
 * ```
 */
export class GlassSolutionSeeder extends BaseSeeder<NewGlassSolution> {
  private readonly drizzle: NodePgDatabase;

  constructor(
    db: NodePgDatabase,
    logger: ISeederLogger = new ConsoleSeederLogger()
  ) {
    super(db, logger, "GlassSolution");
    this.drizzle = db;
  }

  /**
   * Insert a batch of GlassSolutions
   * Implements BaseSeeder abstract method
   */
  protected async insertBatch(batch: NewGlassSolution[]): Promise<number> {
    const batchWithSlug = batch.map((item) => ({
      ...item,
      slug: generateSlug(item.key),
    }));

    const result = await this.drizzle
      .insert(glassSolutions)
      .values(batchWithSlug)
      .onConflictDoNothing({ target: glassSolutions.key })
      .returning({ id: glassSolutions.id });

    return result.length;
  }

  /**
   * Upsert glass solutions (insert or update by key)
   */
  async upsert(
    data: NewGlassSolution[],
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
    batch: NewGlassSolution[],
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
    item: NewGlassSolution,
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
        this.logger?.debug?.(`✓ Inserted: ${item.key}`);
        return { inserted: 1, updated: 0, failed: 0 };
      }
      if (updated) {
        this.logger?.debug?.(`✓ Updated: ${item.key}`);
        return { inserted: 0, updated: 1, failed: 0 };
      }
      this.logger?.error?.(`✗ Failed (no insert/update): ${item.key}`);
      return { inserted: 0, updated: 0, failed: 1 };
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      this.logger?.error?.(`✗ Failed to upsert "${item.key}": ${errMsg}`);
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
    item: NewGlassSolution
  ): Promise<{ inserted: boolean; updated: boolean }> {
    const insertData = {
      ...item,
      slug: generateSlug(item.key),
    };

    const result = await this.drizzle
      .insert(glassSolutions)
      .values(insertData)
      .onConflictDoUpdate({
        target: glassSolutions.key,
        set: {
          name: insertData.name,
          nameEs: insertData.nameEs,
          description: insertData.description,
          icon: insertData.icon,
          sortOrder: insertData.sortOrder,
          isActive: insertData.isActive,
          isSeeded: insertData.isSeeded,
          seedVersion: insertData.seedVersion,
          slug: insertData.slug,
          updatedAt: new Date(),
        },
      })
      .returning({
        createdAt: glassSolutions.createdAt,
        updatedAt: glassSolutions.updatedAt,
      });

    if (result.length > 0) {
      const rec = result[0];
      if (rec) {
        const isNew = rec.createdAt.getTime() === rec.updatedAt.getTime();
        return { inserted: isNew, updated: !isNew };
      }
    }

    return { inserted: false, updated: false };
  }

  /**
   * Clear all GlassSolutions
   */
  async clear(): Promise<number> {
    const result = await this.drizzle.delete(glassSolutions).returning();
    return result.length;
  }

  /**
   * Clear only inactive GlassSolutions
   */
  async clearInactive(): Promise<number> {
    const result = await this.drizzle
      .delete(glassSolutions)
      .where(eq(glassSolutions.isActive, false))
      .returning();

    return result.length;
  }
}
