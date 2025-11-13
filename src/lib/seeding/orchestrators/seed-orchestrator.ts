/**
 * Seed Orchestrator - Drizzle Implementation
 *
 * Coordinates the seeding process using Drizzle ORM and ORM-agnostic factories.
 * Handles entity relationships, validation, and logging.
 *
 * @version 2.0.0 - Drizzle Migration
 * @date 2025-11-09
 */

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { glassSolutions } from "../../../server/db/schemas/glass-solution.schema";
import { glassSuppliers } from "../../../server/db/schemas/glass-supplier.schema";
import { profileSuppliers } from "../../../server/db/schemas/profile-supplier.schema";
import { tenantConfigs } from "../../../server/db/schemas/tenant-config.schema";
import { GlassSolutionSeeder } from "../seeders/glass-solution.seeder";
import { GlassSupplierSeeder } from "../seeders/glass-supplier.seeder";
import { ProfileSupplierSeeder } from "../seeders/profile-supplier.seeder";
import type { ISeederLogger } from "../types/base.types";

/**
 * CLI Logger for orchestrator
 */
export class OrchestratorLogger implements ISeederLogger {
  private readonly isVerbose: boolean;

  constructor(isVerbose = false) {
    this.isVerbose = isVerbose;
  }

  info(message: string): void {
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI seed scripts
    console.log(message);
  }

  warn(message: string): void {
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI seed scripts
    console.warn(`⚠️  ${message}`);
  }

  error(message: string, error?: Error): void {
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI seed scripts
    console.error(`❌ ${message}`);
    if (error && this.isVerbose) {
      // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI seed scripts
      console.error(error);
    }
  }

  debug(message: string): void {
    if (this.isVerbose) {
      // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI seed scripts
      console.debug(`🔍 ${message}`);
    }
  }

  section(title: string): void {
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI seed scripts
    console.log(`\n━━━ ${title} ━━━\n`);
  }

  success(message: string): void {
    // biome-ignore lint/suspicious/noConsole: Console is allowed in CLI seed scripts
    console.log(`✅ ${message}`);
  }
}

/**
 * Preset configuration interface
 */
export type SeedPreset = {
  name: string;
  description: string;
  glassSolutions?: Array<{
    key: string;
    name: string;
    nameEs: string;
    description?: string;
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
    isSeeded?: boolean;
    seedVersion?: string;
  }>;
  profileSuppliers?: Array<{
    name: string;
    materialType: "ALUMINUM" | "PVC" | "WOOD" | "MIXED";
    isActive: boolean;
    notes?: string | null;
  }>;
  glassSuppliers?: Array<{
    name: string;
    code?: string;
    country?: string;
    website?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive: boolean;
    notes?: string | null;
  }>;
};

/**
 * Seed statistics
 */
export type SeedStats = {
  glassSolutions: { created: number; updated: number; failed: number };
  profileSuppliers: { created: number; updated: number; failed: number };
  glassSuppliers: { created: number; updated: number; failed: number };
  totalCreated: number;
  totalUpdated: number;
  totalFailed: number;
  durationMs: number;
};

/**
 * Seed options
 */
export type SeedOptions = {
  verbose?: boolean;
  continueOnError?: boolean;
};

/**
 * Seed Orchestrator (Drizzle)
 */
export class DrizzleSeedOrchestrator {
  private readonly logger: ISeederLogger;
  private readonly stats: SeedStats;
  private readonly startTime: number;
  private readonly db: NodePgDatabase;
  private readonly options: SeedOptions;

  constructor(db: NodePgDatabase, options: SeedOptions = {}) {
    this.db = db;
    this.options = options;
    this.logger = new OrchestratorLogger(options.verbose);
    this.stats = {
      glassSolutions: { created: 0, updated: 0, failed: 0 },
      profileSuppliers: { created: 0, updated: 0, failed: 0 },
      glassSuppliers: { created: 0, updated: 0, failed: 0 },
      totalCreated: 0,
      totalUpdated: 0,
      totalFailed: 0,
      durationMs: 0,
    };
    this.startTime = Date.now();
  }

  /**
   * Seed TenantConfig singleton (required by GlassSupplier and ProfileSupplier foreign keys)
   * Creates a default tenant with id="1" if it doesn't exist
   */
  private async seedTenantConfig(): Promise<void> {
    try {
      this.logger.info("Seeding TenantConfig singleton...");

      const defaultTenant = {
        id: "1",
        businessName: process.env.TENANT_BUSINESS_NAME ?? "Glasify",
        currency: "USD",
        locale: "es-PA",
        timezone: "America/Panama",
        quoteValidityDays: 15,
      };

      await this.db
        .insert(tenantConfigs)
        .values(defaultTenant)
        .onConflictDoNothing({ target: tenantConfigs.id });

      this.logger.success("✅ TenantConfig ready");
    } catch (error) {
      const errorObj = error instanceof Error ? error : undefined;
      this.logger.error?.("Failed to seed TenantConfig", errorObj);
      throw error;
    }
  }

  /**
   * Clean database (delete all data)
   * Used with --fresh flag
   */
  private async cleanDatabase(): Promise<void> {
    try {
      this.logger.info("Deleting all data from database...");

      // Delete in reverse order of dependencies
      await this.db.delete(glassSolutions);
      this.logger.info("✓ Deleted glass solutions");

      await this.db.delete(glassSuppliers);
      this.logger.info("✓ Deleted glass suppliers");

      await this.db.delete(profileSuppliers);
      this.logger.info("✓ Deleted profile suppliers");

      this.logger.success("Database cleaned successfully");
    } catch (error) {
      const errorObj = error instanceof Error ? error : undefined;
      this.logger.error?.("Failed to clean database", errorObj);
      throw error;
    }
  }

  /**
   * Seed database with a preset configuration
   */
  async seedWithPreset(
    preset: SeedPreset,
    options?: { fresh?: boolean }
  ): Promise<SeedStats> {
    this.logger.section(`Seeding with preset: ${preset.name}`);
    this.logger.info(preset.description);

    try {
      // Step 0: Clean database if fresh flag is set
      if (options?.fresh) {
        this.logger.section("Step 0: Cleaning Database (--fresh)");
        await this.cleanDatabase();
      }

      // Step 0.5: Seed TenantConfig singleton (REQUIRED by foreign keys)
      this.logger.section("Step 0.5/3: TenantConfig Singleton");
      await this.seedTenantConfig();

      // Step 1: Seed glass solutions (independent entity)
      if (preset.glassSolutions && preset.glassSolutions.length > 0) {
        this.logger.section("Step 1/3: Glass Solutions");
        await this.seedGlassSolutions(preset.glassSolutions);
      }

      // Step 2: Seed profile suppliers (independent entity)
      if (preset.profileSuppliers && preset.profileSuppliers.length > 0) {
        this.logger.section("Step 2/3: Profile Suppliers");
        await this.seedProfileSuppliers(preset.profileSuppliers);
      }

      // Step 3: Seed glass suppliers (has TenantConfig FK)
      if (preset.glassSuppliers && preset.glassSuppliers.length > 0) {
        this.logger.section("Step 3/3: Glass Suppliers");
        await this.seedGlassSuppliers(preset.glassSuppliers);
      }

      // Calculate final stats
      this.stats.durationMs = Date.now() - this.startTime;
      this.stats.totalCreated =
        this.stats.glassSolutions.created +
        this.stats.profileSuppliers.created +
        this.stats.glassSuppliers.created;
      this.stats.totalUpdated =
        this.stats.glassSolutions.updated +
        this.stats.profileSuppliers.updated +
        this.stats.glassSuppliers.updated;
      this.stats.totalFailed =
        this.stats.glassSolutions.failed +
        this.stats.profileSuppliers.failed +
        this.stats.glassSuppliers.failed;

      // Print summary
      this.printSummary();

      return this.stats;
    } catch (error) {
      const errorObj = error instanceof Error ? error : undefined;
      this.logger.error?.("Seed orchestration failed", errorObj);
      throw error;
    }
  }

  /**
   * Seed glass solutions using Drizzle seeder
   */
  private async seedGlassSolutions(
    solutions: SeedPreset["glassSolutions"]
  ): Promise<void> {
    if (!solutions) {
      return;
    }

    const seeder = new GlassSolutionSeeder(this.db, this.logger);

    this.logger.info(`Seeding ${solutions.length} glass solutions...`);

    try {
      const result = await seeder.upsert(solutions, {
        continueOnError: this.options.continueOnError,
      });

      this.stats.glassSolutions.created = result.inserted;
      this.stats.glassSolutions.updated = result.updated;
      this.stats.glassSolutions.failed = result.failed;

      this.logger.success(
        `Glass solutions: ${result.inserted} inserted, ${result.updated} updated, ${result.failed} failed`
      );
    } catch (error) {
      const errorObj = error instanceof Error ? error : undefined;
      this.logger.error("Failed to seed glass solutions", errorObj);
      if (!this.options.continueOnError) {
        throw error;
      }
    }
  }

  /**
   * Seed profile suppliers using Drizzle seeder
   */
  private async seedProfileSuppliers(
    suppliers: SeedPreset["profileSuppliers"]
  ): Promise<void> {
    if (!suppliers) {
      return;
    }

    const seeder = new ProfileSupplierSeeder(this.db, this.logger);

    this.logger.info(`Seeding ${suppliers.length} profile suppliers...`);

    try {
      // Transform null to undefined for notes (Drizzle schema uses undefined)
      const transformedSuppliers = suppliers.map((s) => ({
        ...s,
        notes: s.notes ?? undefined,
      }));

      const result = await seeder.upsert(transformedSuppliers, {
        continueOnError: this.options.continueOnError,
      });

      this.stats.profileSuppliers.created = result.inserted;
      this.stats.profileSuppliers.updated = result.updated;
      this.stats.profileSuppliers.failed = result.failed;

      this.logger.success(
        `Profile suppliers: ${result.inserted} inserted, ${result.updated} updated, ${result.failed} failed`
      );
    } catch (error) {
      const errorObj = error instanceof Error ? error : undefined;
      this.logger.error("Failed to seed profile suppliers", errorObj);
      if (!this.options.continueOnError) {
        throw error;
      }
    }
  }

  /**
   * Seed glass suppliers using Drizzle seeder
   */
  private async seedGlassSuppliers(
    suppliers: SeedPreset["glassSuppliers"]
  ): Promise<void> {
    if (!suppliers) {
      return;
    }

    const seeder = new GlassSupplierSeeder(this.db, this.logger);

    this.logger.info(`Seeding ${suppliers.length} glass suppliers...`);

    try {
      // Transform boolean to string for isActive (Drizzle schema uses string)
      // Transform null to undefined for notes (Drizzle schema uses undefined)
      const transformedSuppliers = suppliers.map((s) => ({
        ...s,
        isActive: s.isActive ? "true" : "false",
        notes: s.notes ?? undefined,
      }));

      const result = await seeder.upsert(transformedSuppliers, {
        continueOnError: this.options.continueOnError,
      });

      this.stats.glassSuppliers.created = result.inserted;
      this.stats.glassSuppliers.updated = result.updated;
      this.stats.glassSuppliers.failed = result.failed;

      this.logger.success(
        `Glass suppliers: ${result.inserted} inserted, ${result.updated} updated, ${result.failed} failed`
      );
    } catch (error) {
      const errorObj = error instanceof Error ? error : undefined;
      this.logger.error("Failed to seed glass suppliers", errorObj);
      if (!this.options.continueOnError) {
        throw error;
      }
    }
  }

  /**
   * Print summary statistics
   */
  private printSummary(): void {
    this.logger.section("Seeding Summary");
    this.logger.info(
      `Total: ${this.stats.totalCreated} created, ${this.stats.totalUpdated} updated, ${this.stats.totalFailed} failed`
    );
    this.logger.info(`Duration: ${this.stats.durationMs}ms`);

    if (this.stats.totalFailed > 0) {
      this.logger.warn(
        `⚠️  ${this.stats.totalFailed} records failed to seed. Check logs above.`
      );
    } else {
      this.logger.success("✅ All records seeded successfully!");
    }
  }
}
