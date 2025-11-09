/**
 * @file ProfileSupplier Seeder
 * @description Persists ProfileSupplier data using Drizzle ORM
 * Implements BaseSeeder<T> contract for dependency injection
 */

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { profileSuppliers } from "@/server/db/schemas/profile-supplier.schema";
import { BaseSeeder, ConsoleSeederLogger } from "../contracts/seeder.interface";
import type { ProfileSupplierCreateInput } from "../schemas/profile-supplier.schema";
import type { ISeederLogger } from "../types/base.types";

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
}
