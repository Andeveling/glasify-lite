/**
 * @file ProfileSupplier Seeder
 * @description Persists ProfileSupplier data using Drizzle ORM
 * Implements BaseSeeder<T> contract for dependency injection
 */

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { profileSuppliers } from "@/server/db/schemas/profile-supplier.schema";
import { BaseSeeder, ConsoleSeederLogger } from "../contracts/seeder.interface";
import type { ProfileSupplierCreateInput } from "../schemas/profile-supplier.schema";
import type {
  ISeederLogger,
  SeederOptions,
  SeederResult,
} from "../types/base.types";

/**
 * ProfileSupplierSeeder
 * Handles persistence of ProfileSupplier entities using Drizzle
 *
 * @example
 * ```typescript
 * import { db } from '@/server/db';
 *
 * const seeder = new ProfileSupplierSeeder(db);
 * const result = await seeder.seed(data);
 * console.log(`Inserted: ${result.inserted}, Failed: ${result.failed}`);
 * ```
 */
export class ProfileSupplierSeeder extends BaseSeeder<ProfileSupplierCreateInput> {
  /**
   * Drizzle database client (type-safe)
   * @internal
   */
  private readonly drizzle: NodePgDatabase;

  /**
   * Constructor
   * @param db - Drizzle database client
   * @param logger - Logger instance (optional, defaults to ConsoleSeederLogger)
   */
  constructor(
    db: NodePgDatabase,
    logger: ISeederLogger = new ConsoleSeederLogger()
  ) {
    super(db, logger, "ProfileSupplier");
    this.drizzle = db;
  }

  /**
   * Insert a batch of ProfileSuppliers
   * Implements BaseSeeder abstract method
   *
   * @param batch - Array of ProfileSupplier data to insert
   * @returns Number of inserted records
   * @internal
   */
  protected async insertBatch(
    batch: ProfileSupplierCreateInput[]
  ): Promise<number> {
    // Transform data to match Drizzle schema expectations
    const drizzleData = batch.map((item) => ({
      ...item,
      // Convert boolean to string for Drizzle (isActive is stored as text)
      isActive: item.isActive ? "true" : "false",
      // Ensure notes is undefined (not null) if not provided
      notes: item.notes ?? undefined,
    }));

    const result = await this.drizzle
      .insert(profileSuppliers)
      .values(drizzleData)
      .returning({ id: profileSuppliers.id });

    return result.length;
  }

  /**
   * Clear all ProfileSuppliers from database
   * WARNING: This deletes ALL records. Use with caution.
   *
   * @returns Number of deleted records
   */
  async clear(): Promise<number> {
    const deleted = await this.drizzle
      .delete(profileSuppliers)
      .returning({ id: profileSuppliers.id });

    this.logger.info(`🗑️  Cleared ${deleted.length} ProfileSupplier records`);

    return deleted.length;
  }

  /**
   * Clear only inactive ProfileSuppliers
   * Safer alternative to clear() - keeps active suppliers
   *
   * @returns Number of deleted records
   */
  async clearInactive(): Promise<number> {
    const { eq } = await import("drizzle-orm");

    const deleted = await this.drizzle
      .delete(profileSuppliers)
      .where(eq(profileSuppliers.isActive, "false"))
      .returning({ id: profileSuppliers.id });

    this.logger.info(
      `🗑️  Cleared ${deleted.length} inactive ProfileSupplier records`
    );

    return deleted.length;
  }

  /**
   * Upsert (insert or update) ProfileSuppliers by unique name
   * Ensures idempotent seeding across runs
   */
  async upsert(
    data: ProfileSupplierCreateInput[],
    options?: SeederOptions
  ): Promise<SeederResult> {
    const DEFAULT_BATCH_SIZE = 100;
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
   * Process a batch sequentially with error handling
   * @private
   */
  private async processBatch(
    batch: ProfileSupplierCreateInput[],
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
   * Upsert a single item by name
   * @private
   */
  private async processItem(
    item: ProfileSupplierCreateInput,
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
    item: ProfileSupplierCreateInput
  ): Promise<{ inserted: boolean; updated: boolean }> {
    const insertData = {
      ...item,
      isActive: item.isActive ? "true" : "false",
      notes: item.notes ?? undefined,
    };

    const result = await this.drizzle
      .insert(profileSuppliers)
      .values(insertData)
      .onConflictDoUpdate({
        target: profileSuppliers.name,
        set: {
          materialType: insertData.materialType,
          isActive: insertData.isActive,
          notes: insertData.notes,
          updatedAt: new Date().toISOString(),
        },
      })
      .returning({
        createdAt: profileSuppliers.createdAt,
        updatedAt: profileSuppliers.updatedAt,
      });

    if (result.length > 0) {
      const rec = result[0];
      const isNew = rec.createdAt === rec.updatedAt;
      return { inserted: isNew, updated: !isNew };
    }
    return { inserted: false, updated: false };
  }
}
