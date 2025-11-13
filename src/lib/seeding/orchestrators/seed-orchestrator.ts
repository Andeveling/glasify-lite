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
import {
  glassCharacteristics,
  type NewGlassCharacteristic,
} from "../../../server/db/schemas/glass-characteristic.schema";
import { glassSolutions } from "../../../server/db/schemas/glass-solution.schema";
import { glassSuppliers } from "../../../server/db/schemas/glass-supplier.schema";
import {
  glassTypes,
  type NewGlassType,
} from "../../../server/db/schemas/glass-type.schema";
import {
  glassTypeSolutions,
  type NewGlassTypeSolution,
} from "../../../server/db/schemas/glass-type-solution.schema";
import { models, type NewModel } from "../../../server/db/schemas/model.schema";
import { profileSuppliers } from "../../../server/db/schemas/profile-supplier.schema";
import { services } from "../../../server/db/schemas/service.schema";
import { tenantConfigs } from "../../../server/db/schemas/tenant-config.schema";
import { GlassCharacteristicSeeder } from "../seeders/glass-characteristic.seeder";
import { GlassSolutionSeeder } from "../seeders/glass-solution.seeder";
import { GlassSupplierSeeder } from "../seeders/glass-supplier.seeder";
import { GlassTypeSeeder } from "../seeders/glass-type.seeder";
import { GlassTypeSolutionSeeder } from "../seeders/glass-type-solution.seeder";
import { ModelSeeder } from "../seeders/model.seeder";
import { ProfileSupplierSeeder } from "../seeders/profile-supplier.seeder";
import { ServiceSeeder } from "../seeders/service.seeder";
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
  glassCharacteristics?: NewGlassCharacteristic[];
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
  glassTypes?: NewGlassType[];
  models?: NewModel[];
  glassTypeSolutions?: NewGlassTypeSolution[];
  services?: Array<{
    name: string;
    type: "area" | "perimeter" | "fixed";
    unit: "unit" | "sqm" | "ml";
    rate: number;
    minimumBillingUnit?: number;
    isActive?: "true" | "false" | boolean;
  }>;
};

/**
 * Seed statistics
 */
export type SeedStats = {
  glassCharacteristics: { created: number; updated: number; failed: number };
  glassSolutions: { created: number; updated: number; failed: number };
  profileSuppliers: { created: number; updated: number; failed: number };
  glassSuppliers: { created: number; updated: number; failed: number };
  glassTypes: { created: number; updated: number; failed: number };
  models: { created: number; updated: number; failed: number };
  glassTypeSolutions: { created: number; updated: number; failed: number };
  services: { created: number; updated: number; failed: number };
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

  // ID maps for FK resolution
  private readonly profileSupplierIdMap = new Map<string, string>();
  private readonly glassSupplierIdMap = new Map<string, string>();
  private readonly glassTypeIdMap = new Map<string, string>();
  private readonly glassSolutionIdMap = new Map<string, string>();

  constructor(db: NodePgDatabase, options: SeedOptions = {}) {
    this.db = db;
    this.options = options;
    this.logger = new OrchestratorLogger(options.verbose);
    this.stats = {
      glassCharacteristics: { created: 0, updated: 0, failed: 0 },
      glassSolutions: { created: 0, updated: 0, failed: 0 },
      profileSuppliers: { created: 0, updated: 0, failed: 0 },
      glassSuppliers: { created: 0, updated: 0, failed: 0 },
      glassTypes: { created: 0, updated: 0, failed: 0 },
      models: { created: 0, updated: 0, failed: 0 },
      glassTypeSolutions: { created: 0, updated: 0, failed: 0 },
      services: { created: 0, updated: 0, failed: 0 },
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
      await this.db.delete(services);
      this.logger.info("✓ Deleted services");

      await this.db.delete(glassTypeSolutions);
      this.logger.info("✓ Deleted glass type solutions");

      await this.db.delete(models);
      this.logger.info("✓ Deleted models");

      await this.db.delete(glassTypes);
      this.logger.info("✓ Deleted glass types");

      await this.db.delete(glassSolutions);
      this.logger.info("✓ Deleted glass solutions");

      await this.db.delete(glassCharacteristics);
      this.logger.info("✓ Deleted glass characteristics");

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
  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Orchestrator coordinates multiple seeders sequentially
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
      this.logger.section("Step 0.5/8: TenantConfig Singleton");
      await this.seedTenantConfig();

      // Step 1: Seed glass characteristics (independent entity)
      if (
        preset.glassCharacteristics &&
        preset.glassCharacteristics.length > 0
      ) {
        this.logger.section("Step 1/8: Glass Characteristics");
        await this.seedGlassCharacteristics(preset.glassCharacteristics);
      }

      // Step 2: Seed glass solutions (independent entity)
      if (preset.glassSolutions && preset.glassSolutions.length > 0) {
        this.logger.section("Step 2/8: Glass Solutions");
        await this.seedGlassSolutions(preset.glassSolutions);
      }

      // Step 3: Seed profile suppliers (independent entity)
      if (preset.profileSuppliers && preset.profileSuppliers.length > 0) {
        this.logger.section("Step 3/8: Profile Suppliers");
        await this.seedProfileSuppliers(preset.profileSuppliers);
      }

      // Step 4: Seed glass suppliers (has TenantConfig FK)
      if (preset.glassSuppliers && preset.glassSuppliers.length > 0) {
        this.logger.section("Step 4/8: Glass Suppliers");
        await this.seedGlassSuppliers(preset.glassSuppliers);
      }

      // Step 5: Seed glass types (depends on glass suppliers)
      if (preset.glassTypes && preset.glassTypes.length > 0) {
        this.logger.section("Step 5/8: Glass Types");
        await this.seedGlassTypes(preset.glassTypes);
      }

      // Step 6: Seed models (depends on profile suppliers)
      if (preset.models && preset.models.length > 0) {
        this.logger.section("Step 6/8: Models");
        await this.seedModels(preset.models);
      }

      // Step 7: Seed glass type solutions (depends on glass types + glass solutions)
      if (preset.glassTypeSolutions && preset.glassTypeSolutions.length > 0) {
        this.logger.section("Step 7/8: Glass Type Solutions");
        await this.seedGlassTypeSolutions(preset.glassTypeSolutions);
      }

      // Step 8: Seed services (independent entity)
      if (preset.services && preset.services.length > 0) {
        this.logger.section("Step 8/8: Services");
        await this.seedServices(preset.services);
      }

      // Calculate final stats
      this.stats.durationMs = Date.now() - this.startTime;
      this.stats.totalCreated =
        this.stats.glassCharacteristics.created +
        this.stats.glassSolutions.created +
        this.stats.profileSuppliers.created +
        this.stats.glassSuppliers.created +
        this.stats.glassTypes.created +
        this.stats.models.created +
        this.stats.glassTypeSolutions.created +
        this.stats.services.created;
      this.stats.totalUpdated =
        this.stats.glassCharacteristics.updated +
        this.stats.glassSolutions.updated +
        this.stats.profileSuppliers.updated +
        this.stats.glassSuppliers.updated +
        this.stats.glassTypes.updated +
        this.stats.models.updated +
        this.stats.glassTypeSolutions.updated +
        this.stats.services.updated;
      this.stats.totalFailed =
        this.stats.glassCharacteristics.failed +
        this.stats.glassSolutions.failed +
        this.stats.profileSuppliers.failed +
        this.stats.glassSuppliers.failed +
        this.stats.glassTypes.failed +
        this.stats.models.failed +
        this.stats.glassTypeSolutions.failed +
        this.stats.services.failed;

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
   * Seed glass characteristics using Drizzle seeder
   */
  private async seedGlassCharacteristics(
    characteristics: NewGlassCharacteristic[]
  ): Promise<void> {
    if (!characteristics) {
      return;
    }

    const seeder = new GlassCharacteristicSeeder(this.db, this.logger);

    this.logger.info(
      `Seeding ${characteristics.length} glass characteristics...`
    );

    try {
      const result = await seeder.upsert(characteristics, {
        continueOnError: this.options.continueOnError,
      });

      this.stats.glassCharacteristics.created = result.inserted;
      this.stats.glassCharacteristics.updated = result.updated;
      this.stats.glassCharacteristics.failed = result.failed;

      this.logger.success(
        `Glass characteristics: ${result.inserted} inserted, ${result.updated} updated, ${result.failed} failed`
      );
    } catch (error) {
      const errorObj = error instanceof Error ? error : undefined;
      this.logger.error("Failed to seed glass characteristics", errorObj);
      if (!this.options.continueOnError) {
        throw error;
      }
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
      // Transform to include slug (kebab-case version of key)
      const transformedSolutions = solutions.map((s) => ({
        ...s,
        slug: s.key.toLowerCase().replace(/_/g, "-"),
      }));

      const result = await seeder.upsert(transformedSolutions, {
        continueOnError: this.options.continueOnError,
      });

      this.stats.glassSolutions.created = result.inserted;
      this.stats.glassSolutions.updated = result.updated;
      this.stats.glassSolutions.failed = result.failed;

      // Capture IDs for FK resolution (by key)
      const insertedSolutions = await this.db.select().from(glassSolutions);
      for (const solution of insertedSolutions) {
        this.glassSolutionIdMap.set(solution.key, solution.id);
      }
      this.logger.debug(
        `Captured ${this.glassSolutionIdMap.size} glass solution IDs for FK resolution`
      );

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

      // Capture IDs for FK resolution
      const insertedSuppliers = await this.db.select().from(profileSuppliers);
      for (const supplier of insertedSuppliers) {
        this.profileSupplierIdMap.set(supplier.name, supplier.id);
      }
      this.logger.debug(
        `Captured ${this.profileSupplierIdMap.size} profile supplier IDs for FK resolution`
      );

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

      // Capture IDs for FK resolution (by code)
      const insertedSuppliers = await this.db.select().from(glassSuppliers);
      for (const supplier of insertedSuppliers) {
        if (supplier.code) {
          this.glassSupplierIdMap.set(supplier.code, supplier.id);
        }
      }
      this.logger.debug(
        `Captured ${this.glassSupplierIdMap.size} glass supplier IDs for FK resolution`
      );

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
   * Seed glass types using Drizzle seeder
   * Resolves glassSupplierId FK and captures IDs for glass type solutions
   */
  private async seedGlassTypes(glassTypesList: NewGlassType[]): Promise<void> {
    if (!glassTypesList) {
      return;
    }

    const seeder = new GlassTypeSeeder(this.db, this.logger);

    this.logger.info(`Seeding ${glassTypesList.length} glass types...`);

    try {
      // Resolve glassSupplierId FK if we have glass supplier IDs
      const resolvedGlassTypes = glassTypesList.map((gt) => {
        // Try to resolve FK by matching supplier code in glass type code
        // Example: "GUARD-CLR-6" → supplier code "GUARDIAN"
        let glassSupplierId = gt.glassSupplierId;

        if (!glassSupplierId && this.glassSupplierIdMap.size > 0) {
          // Try to match by code prefix
          const gtCode = gt.code?.toUpperCase() || "";
          for (const [code, id] of this.glassSupplierIdMap.entries()) {
            if (gtCode.startsWith(code)) {
              glassSupplierId = id;
              this.logger.debug(
                `Resolved glassSupplierId for "${gt.name}" using code "${code}"`
              );
              break;
            }
          }
        }

        return { ...gt, glassSupplierId };
      });

      const result = await seeder.upsert(resolvedGlassTypes, {
        continueOnError: this.options.continueOnError,
      });

      this.stats.glassTypes.created = result.inserted;
      this.stats.glassTypes.updated = result.updated;
      this.stats.glassTypes.failed = result.failed;

      // Capture IDs for FK resolution in glass type solutions (by code)
      const insertedGlassTypes = await this.db.select().from(glassTypes);
      for (const glassType of insertedGlassTypes) {
        if (glassType.code) {
          this.glassTypeIdMap.set(glassType.code, glassType.id);
        }
      }
      this.logger.debug(
        `Captured ${this.glassTypeIdMap.size} glass type IDs for FK resolution`
      );

      this.logger.success(
        `Glass types: ${result.inserted} inserted, ${result.updated} updated, ${result.failed} failed`
      );
    } catch (error) {
      const errorObj = error instanceof Error ? error : undefined;
      this.logger.error("Failed to seed glass types", errorObj);
      if (!this.options.continueOnError) {
        throw error;
      }
    }
  }

  /**
   * Seed models using Drizzle seeder
   * Resolves profileSupplierId FK
   */
  private async seedModels(modelsList: NewModel[]): Promise<void> {
    if (!modelsList) {
      return;
    }

    const seeder = new ModelSeeder(this.db, this.logger);

    this.logger.info(`Seeding ${modelsList.length} models...`);

    try {
      // Resolve profileSupplierId FK and ensure compatibleGlassTypeIds is an array
      const resolvedModels = modelsList.map((model) => {
        let profileSupplierId = model.profileSupplierId;

        // If FK is null and we have profile suppliers, try to assign the first one
        if (!profileSupplierId && this.profileSupplierIdMap.size > 0) {
          // Use first active aluminum supplier as default
          const defaultSupplierName = "Aluminios Panamá";
          profileSupplierId =
            this.profileSupplierIdMap.get(defaultSupplierName) ||
            Array.from(this.profileSupplierIdMap.values())[0];

          if (profileSupplierId) {
            this.logger.debug(
              `Assigned default profileSupplierId to model "${model.name}"`
            );
          }
        }

        // Ensure compatibleGlassTypeIds is always an array (fix Drizzle empty array serialization)
        const compatibleGlassTypeIds = Array.isArray(
          model.compatibleGlassTypeIds
        )
          ? model.compatibleGlassTypeIds
          : [];

        return { ...model, profileSupplierId, compatibleGlassTypeIds };
      });

      const result = await seeder.upsert(resolvedModels, {
        continueOnError: this.options.continueOnError,
      });

      this.stats.models.created = result.inserted;
      this.stats.models.updated = result.updated;
      this.stats.models.failed = result.failed;

      this.logger.success(
        `Models: ${result.inserted} inserted, ${result.updated} updated, ${result.failed} failed`
      );
    } catch (error) {
      const errorObj = error instanceof Error ? error : undefined;
      this.logger.error("Failed to seed models", errorObj);
      if (!this.options.continueOnError) {
        throw error;
      }
    }
  }

  /**
   * Seed glass type solutions using Drizzle seeder
   */
  private async seedGlassTypeSolutions(
    glassTypeSolutionsList: NewGlassTypeSolution[]
  ): Promise<void> {
    if (!glassTypeSolutionsList) {
      return;
    }

    const seeder = new GlassTypeSolutionSeeder(this.db, this.logger);

    this.logger.info(
      `Seeding ${glassTypeSolutionsList.length} glass type solutions...`
    );

    try {
      const result = await seeder.upsert(glassTypeSolutionsList, {
        continueOnError: this.options.continueOnError,
      });

      this.stats.glassTypeSolutions.created = result.inserted;
      this.stats.glassTypeSolutions.updated = result.updated;
      this.stats.glassTypeSolutions.failed = result.failed;

      this.logger.success(
        `Glass type solutions: ${result.inserted} inserted, ${result.updated} updated, ${result.failed} failed`
      );
    } catch (error) {
      const errorObj = error instanceof Error ? error : undefined;
      this.logger.error("Failed to seed glass type solutions", errorObj);
      if (!this.options.continueOnError) {
        throw error;
      }
    }
  }

  /**
   * Seed services using Drizzle seeder
   */
  private async seedServices(
    servicesList: SeedPreset["services"]
  ): Promise<void> {
    if (!servicesList) {
      return;
    }

    const seeder = new ServiceSeeder(this.db, this.logger);

    this.logger.info(`Seeding ${servicesList.length} services...`);

    try {
      // Transform data to match Drizzle schema expectations
      // - rate and minimumBillingUnit: string (Zod schema for decimal fields)
      // - isActive: boolean (Drizzle schema uses boolean())
      const transformedServices = servicesList.map((s) => {
        // Convert isActive to boolean if it's a string
        let isActive = true;
        if (typeof s.isActive === "boolean") {
          isActive = s.isActive;
        } else if (s.isActive === "false") {
          isActive = false;
        }

        return {
          ...s,
          rate: String(s.rate),
          minimumBillingUnit: s.minimumBillingUnit
            ? String(s.minimumBillingUnit)
            : undefined,
          isActive,
        };
      });

      const result = await seeder.upsert(transformedServices, {
        continueOnError: this.options.continueOnError,
      });

      this.stats.services.created = result.inserted;
      this.stats.services.updated = result.updated;
      this.stats.services.failed = result.failed;

      this.logger.success(
        `Services: ${result.inserted} inserted, ${result.updated} updated, ${result.failed} failed`
      );
    } catch (error) {
      const errorObj = error instanceof Error ? error : undefined;
      this.logger.error("Failed to seed services", errorObj);
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
