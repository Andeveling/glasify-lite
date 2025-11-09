/**
 * @file GlassSupplier Seeder
 * @description Persists GlassSupplier data using Drizzle ORM
 * Implements BaseSeeder<T> contract for dependency injection
 */

import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { glassSuppliers } from "@/server/db/schemas/glass-supplier.schema";
import { BaseSeeder, ConsoleSeederLogger } from "../contracts/seeder.interface";
import type { GlassSupplierCreateInput } from "../schemas/glass-supplier.schema";
import type {
  ISeederLogger,
  SeederOptions,
  SeederResult,
} from "../types/base.types";

const DEFAULT_BATCH_SIZE = 100;

/**
 * GlassSupplierSeeder
 * Handles persistence of GlassSupplier entities using Drizzle
 *
 * @example
 * ```typescript
 * import { db } from '@/server/db';
 *
 * const seeder = new GlassSupplierSeeder(db);
 * const result = await seeder.seed(data);
 * console.log(`Inserted: ${result.inserted}, Failed: ${result.failed}`);
 * ```
 */
export class GlassSupplierSeeder extends BaseSeeder<GlassSupplierCreateInput> {
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
    super(db, logger, "GlassSupplier");
    this.drizzle = db;
  }

  /**
   * Insert a batch of GlassSuppliers
   * Implements BaseSeeder abstract method
   *
   * @param batch - Array of GlassSupplier data to insert
   * @returns Promise with number of inserted records
   */
  protected async insertBatch(
    batch: GlassSupplierCreateInput[]
  ): Promise<number> {
    // Add default tenantConfigId for all items
    const batchWithTenant = batch.map((item) => ({
      ...item,
      tenantConfigId: "1", // Default tenant
    }));

    const inserted = await this.drizzle
      .insert(glassSuppliers)
      .values(batchWithTenant)
      .onConflictDoNothing({ target: glassSuppliers.name })
      .returning();

    return inserted.length;
  }

  /**
   * Process a single item upsert
   * @private
   */
  private async upsertItem(
    item: GlassSupplierCreateInput
  ): Promise<{ inserted: boolean; updated: boolean }> {
    // Add default tenantConfigId for multi-tenant support
    const insertData = {
      ...item,
      tenantConfigId: "1", // Default tenant
    };

    const result = await this.drizzle
      .insert(glassSuppliers)
      .values(insertData)
      .onConflictDoUpdate({
        target: glassSuppliers.name,
        set: {
          code: insertData.code,
          country: insertData.country,
          website: insertData.website,
          contactEmail: insertData.contactEmail,
          contactPhone: insertData.contactPhone,
          isActive: insertData.isActive,
          notes: insertData.notes,
          updatedAt: new Date(),
        },
      })
      .returning();

    if (result.length > 0) {
      const record = result[0];
      const isNewRecord = Boolean(
        record && record.createdAt.getTime() === record.updatedAt.getTime()
      );

      return { inserted: isNewRecord, updated: !isNewRecord };
    }

    return { inserted: false, updated: false };
  }

  /**
   * Process single item with error handling
   * @private
   */
  private async processItem(
    item: GlassSupplierCreateInput,
    globalIndex: number
  ): Promise<{
    inserted: number;
    updated: number;
    failed: number;
    error?: { index: number; error: unknown };
  }> {
    try {
      const result = await this.upsertItem(item);
      if (result.inserted) {
        this.logger?.debug?.(`✓ Inserted: ${item.name}`);
        return { inserted: 1, updated: 0, failed: 0 };
      }
      if (result.updated) {
        this.logger?.debug?.(`✓ Updated: ${item.name}`);
        return { inserted: 0, updated: 1, failed: 0 };
      }
      this.logger?.error?.(`✗ Failed (no insert/update): ${item.name}`);
      return { inserted: 0, updated: 0, failed: 1 };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger?.error?.(
        `✗ Failed to upsert "${item.name}": ${errorMessage}`,
        error instanceof Error ? error : undefined
      );
      return {
        inserted: 0,
        updated: 0,
        failed: 1,
        error: { index: globalIndex, error },
      };
    }
  }

  /**
   * Process batch with early exit on error
   * @private
   */
  private async processBatch(
    batch: GlassSupplierCreateInput[],
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
   * Upsert glass suppliers (insert or update by name)
   * Updates existing records or creates new ones
   *
   * @param data - Array of GlassSupplier data to upsert
   * @param options - Seeder options
   * @returns Promise with seeding result
   *
   * @example
   * ```typescript
   * const result = await seeder.upsert(data);
   * console.log(`Updated: ${result.updated}, Inserted: ${result.inserted}`);
   * ```
   */
  async upsert(
    data: GlassSupplierCreateInput[],
    options?: SeederOptions
  ): Promise<SeederResult> {
    const batchSize = options?.batchSize ?? DEFAULT_BATCH_SIZE;
    let updated = 0;
    let inserted = 0;
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
  } /**
   * Clear all GlassSuppliers from database
   *
   * @returns Promise with number of deleted records
   *
   * @example
   * ```typescript
   * const deleted = await seeder.clear();
   * console.log(`Deleted ${deleted} glass suppliers`);
   * ```
   */
  async clear(): Promise<number> {
    const result = await this.drizzle.delete(glassSuppliers).returning();
    return result.length;
  }

  /**
   * Clear only inactive GlassSuppliers
   * Useful for cleaning up test data while preserving active suppliers
   *
   * @returns Promise with number of deleted records
   *
   * @example
   * ```typescript
   * const deleted = await seeder.clearInactive();
   * console.log(`Deleted ${deleted} inactive suppliers`);
   * ```
   */
  async clearInactive(): Promise<number> {
    const result = await this.drizzle
      .delete(glassSuppliers)
      .where(eq(glassSuppliers.isActive, "false"))
      .returning();

    return result.length;
  }
}
