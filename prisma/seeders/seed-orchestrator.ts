/**
 * Seed Orchestrator - Centralized Seeding Logic
 *
 * Coordinates the seeding process using factories and presets.
 * Handles entity relationships, validation, and logging.
 *
 * NO BARREL FILES - Direct imports only
 *
 * @version 1.0.0
 */

import type { PrismaClient } from '@prisma/client';
import type { GlassSolutionInput } from '../factories/glass-solution.factory';
import { createGlassSolution } from '../factories/glass-solution.factory';
import type { GlassTypeInput } from '../factories/glass-type.factory';
import { createGlassType } from '../factories/glass-type.factory';
import { calculateGlassSolutions, createGlassTypeSolution } from '../factories/glass-type-solution.factory';
import type { ModelInput } from '../factories/model.factory';
import { createModel } from '../factories/model.factory';
import type { ProfileSupplierInput } from '../factories/profile-supplier.factory';
import { createProfileSupplier } from '../factories/profile-supplier.factory';
import type { ServiceInput } from '../factories/service.factory';
import { createService } from '../factories/service.factory';

/**
 * Preset configuration interface
 */
export interface SeedPreset {
  name: string;
  description: string;
  glassTypes: GlassTypeInput[];
  profileSuppliers: ProfileSupplierInput[];
  models: ModelInput[];
  services: ServiceInput[];
  glassSolutions: GlassSolutionInput[];
}

/**
 * Seed statistics
 */
export interface SeedStats {
  glassTypes: { created: number; failed: number };
  profileSuppliers: { created: number; failed: number };
  models: { created: number; failed: number };
  services: { created: number; failed: number };
  glassSolutions: { created: number; failed: number };
  glassTypeSolutions: { created: number; failed: number };
  totalCreated: number;
  totalFailed: number;
  durationMs: number;
}

/**
 * Seed options
 */
export interface SeedOptions {
  verbose?: boolean;
  skipValidation?: boolean;
  continueOnError?: boolean;
}

/**
 * Logger helper
 */
class SeedLogger {
  private readonly verbose: boolean;

  constructor(verbose = false) {
    this.verbose = verbose;
  }

  info(message: string): void {
    console.log(`ℹ️  ${message}`);
  }

  success(message: string): void {
    console.log(`✅ ${message}`);
  }

  error(message: string, error?: unknown): void {
    console.error(`❌ ${message}`);
    if (error && this.verbose) {
      console.error(error);
    }
  }

  warn(message: string): void {
    console.warn(`⚠️  ${message}`);
  }

  debug(message: string): void {
    if (this.verbose) {
      console.log(`🔍 ${message}`);
    }
  }

  section(title: string): void {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`  ${title}`);
    console.log(`${'='.repeat(50)}`);
  }
}

/**
 * Seed orchestrator class
 */
export class SeedOrchestrator {
  private readonly logger: SeedLogger;
  private readonly stats: SeedStats;
  private readonly startTime: number;
  private readonly prisma: PrismaClient;
  private readonly options: SeedOptions;

  constructor(prisma: PrismaClient, options: SeedOptions = {}) {
    this.prisma = prisma;
    this.options = options;
    this.logger = new SeedLogger(options.verbose);
    this.stats = {
      durationMs: 0,
      glassSolutions: { created: 0, failed: 0 },
      glassTypeSolutions: { created: 0, failed: 0 },
      glassTypes: { created: 0, failed: 0 },
      models: { created: 0, failed: 0 },
      profileSuppliers: { created: 0, failed: 0 },
      services: { created: 0, failed: 0 },
      totalCreated: 0,
      totalFailed: 0,
    };
    this.startTime = Date.now();
  }

  /**
   * Seed database with preset configuration
   */
  async seedWithPreset(preset: SeedPreset): Promise<SeedStats> {
    this.logger.section(`Seeding with preset: ${preset.name}`);
    this.logger.info(preset.description);

    try {
      // Step 1: Seed profile suppliers (no dependencies)
      this.logger.section('Step 1/6: Profile Suppliers');
      const suppliers = await this.seedProfileSuppliers(preset.profileSuppliers);

      // Step 2: Seed glass types (no dependencies)
      this.logger.section('Step 2/6: Glass Types');
      const glassTypes = await this.seedGlassTypes(preset.glassTypes);

      // Step 3: Seed models (depends on suppliers and glass types)
      this.logger.section('Step 3/6: Window/Door Models');
      await this.seedModels(preset.models, suppliers, glassTypes);

      // Step 4: Seed services (no dependencies)
      this.logger.section('Step 4/6: Services');
      await this.seedServices(preset.services);

      // Step 5: Seed glass solutions (no dependencies)
      this.logger.section('Step 5/6: Glass Solutions');
      const solutions = await this.seedGlassSolutions(preset.glassSolutions);

      // Step 6: Assign solutions to glass types (depends on glass types and solutions)
      this.logger.section('Step 6/6: Assign Solutions to Glass Types');
      await this.assignSolutionsToGlassTypes(glassTypes, solutions);

      // Calculate final stats
      this.stats.durationMs = Date.now() - this.startTime;
      this.stats.totalCreated =
        this.stats.glassTypes.created +
        this.stats.profileSuppliers.created +
        this.stats.models.created +
        this.stats.services.created +
        this.stats.glassSolutions.created +
        this.stats.glassTypeSolutions.created;
      this.stats.totalFailed =
        this.stats.glassTypes.failed +
        this.stats.profileSuppliers.failed +
        this.stats.models.failed +
        this.stats.services.failed +
        this.stats.glassSolutions.failed +
        this.stats.glassTypeSolutions.failed;

      // Print summary
      this.printSummary();

      return this.stats;
    } catch (error) {
      this.logger.error('Seed orchestration failed', error);
      throw error;
    }
  }

  /**
   * Seed profile suppliers
   */
  private async seedProfileSuppliers(suppliers: ProfileSupplierInput[]): Promise<Map<string, string>> {
    const supplierIdMap = new Map<string, string>();

    this.logger.info(`Seeding ${suppliers.length} profile suppliers...`);

    for (const supplierInput of suppliers) {
      try {
        const result = createProfileSupplier(supplierInput, {
          skipValidation: this.options.skipValidation,
        });

        if (!(result.success && result.data)) {
          this.handleValidationErrors(supplierInput.name, result.errors);
          this.stats.profileSuppliers.failed++;
          if (!this.options.continueOnError) throw new Error('Validation failed');
          continue;
        }

        // Check if supplier already exists
        const existing = await this.prisma.profileSupplier.findUnique({
          where: { name: result.data.name },
        });

        // Create or update
        const supplier = existing
          ? await this.prisma.profileSupplier.update({
            data: result.data,
            where: { id: existing.id },
          })
          : await this.prisma.profileSupplier.create({
            data: result.data,
          });

        supplierIdMap.set(supplier.name, supplier.id);
        this.stats.profileSuppliers.created++;
        this.logger.debug(`Created: ${supplier.name} (${supplier.id})`);
      } catch (error) {
        this.logger.error(`Failed to create supplier: ${supplierInput.name}`, error);
        this.stats.profileSuppliers.failed++;
        if (!this.options.continueOnError) throw error;
      }
    }

    this.logger.success(
      `Profile suppliers: ${this.stats.profileSuppliers.created} created, ${this.stats.profileSuppliers.failed} failed`
    );

    return supplierIdMap;
  }

  /**
   * Seed glass types
   */
  private async seedGlassTypes(glassTypes: GlassTypeInput[]): Promise<Map<string, string>> {
    const glassTypeIdMap = new Map<string, string>();

    this.logger.info(`Seeding ${glassTypes.length} glass types...`);

    for (const glassTypeInput of glassTypes) {
      try {
        const result = createGlassType(glassTypeInput, {
          skipValidation: this.options.skipValidation,
        });

        if (!(result.success && result.data)) {
          this.handleValidationErrors(glassTypeInput.name, result.errors);
          this.stats.glassTypes.failed++;
          if (!this.options.continueOnError) throw new Error('Validation failed');
          continue;
        }

        // Check if glass type already exists by name
        const existing = await this.prisma.glassType.findFirst({
          where: { name: result.data.name },
        });

        // Create or update
        const glassType = existing
          ? await this.prisma.glassType.update({
            data: result.data,
            where: { id: existing.id },
          })
          : await this.prisma.glassType.create({
            data: result.data,
          });

        glassTypeIdMap.set(glassType.name, glassType.id);
        this.stats.glassTypes.created++;
        this.logger.debug(`Created: ${glassType.name} (${glassType.id})`);
      } catch (error) {
        this.logger.error(`Failed to create glass type: ${glassTypeInput.name}`, error);
        this.stats.glassTypes.failed++;
        if (!this.options.continueOnError) throw error;
      }
    }

    this.logger.success(
      `Glass types: ${this.stats.glassTypes.created} created, ${this.stats.glassTypes.failed} failed`
    );

    return glassTypeIdMap;
  }

  /**
   * Seed models with supplier and glass type relationships
   */
  private async seedModels(
    models: ModelInput[],
    supplierIdMap: Map<string, string>,
    glassTypeIdMap: Map<string, string>
  ): Promise<void> {
    this.logger.info(`Seeding ${models.length} window/door models...`);

    for (const modelInput of models) {
      try {
        // Resolve supplier ID
        const supplierId = supplierIdMap.get(modelInput.profileSupplierName);
        if (!supplierId) {
          this.logger.error(`Supplier not found: ${modelInput.profileSupplierName} for model ${modelInput.name}`);
          this.stats.models.failed++;
          if (!this.options.continueOnError) {
            throw new Error(`Supplier not found: ${modelInput.profileSupplierName}`);
          }
          continue;
        }

        // Validate with factory
        const result = createModel(modelInput, {
          skipValidation: this.options.skipValidation,
        });

        if (!(result.success && result.data)) {
          this.handleValidationErrors(modelInput.name, result.errors);
          this.stats.models.failed++;
          if (!this.options.continueOnError) throw new Error('Validation failed');
          continue;
        }

        // Replace PLACEHOLDER glass type IDs with actual IDs
        const compatibleGlassTypeIds = Array.from(glassTypeIdMap.values());

        // Remove profileSupplierName and manufacturer (factory artifact) and add profileSupplierId
        const { profileSupplierName: _unused, manufacturer: _unusedManufacturer, ...modelData } = result.data;

        // Check if model already exists by name
        const existingModel = await this.prisma.model.findFirst({
          where: { name: modelData.name },
        });

        // Create or update
        const model = existingModel
          ? await this.prisma.model.update({
            data: {
              ...modelData,
              compatibleGlassTypeIds,
              profileSupplierId: supplierId,
            },
            where: { id: existingModel.id },
          })
          : await this.prisma.model.create({
            data: {
              ...modelData,
              compatibleGlassTypeIds,
              profileSupplierId: supplierId,
            },
          });

        this.stats.models.created++;
        this.logger.debug(`Created: ${model.name} (${model.id})`);
      } catch (error) {
        this.logger.error(`Failed to create model: ${modelInput.name}`, error);
        this.stats.models.failed++;
        if (!this.options.continueOnError) throw error;
      }
    }

    this.logger.success(`Models: ${this.stats.models.created} created, ${this.stats.models.failed} failed`);
  }

  /**
   * Seed services
   */
  private async seedServices(services: ServiceInput[]): Promise<void> {
    this.logger.info(`Seeding ${services.length} services...`);

    for (const serviceInput of services) {
      try {
        const result = createService(serviceInput, {
          skipValidation: this.options.skipValidation,
        });

        if (!(result.success && result.data)) {
          this.handleValidationErrors(serviceInput.name, result.errors);
          this.stats.services.failed++;
          if (!this.options.continueOnError) throw new Error('Validation failed');
          continue;
        }

        // Check if service already exists by name
        const existingService = await this.prisma.service.findFirst({
          where: { name: result.data.name },
        });

        // Create or update
        const service = existingService
          ? await this.prisma.service.update({
            data: result.data,
            where: { id: existingService.id },
          })
          : await this.prisma.service.create({
            data: result.data,
          });

        this.stats.services.created++;
        this.logger.debug(`Created: ${service.name} (${service.id})`);
      } catch (error) {
        this.logger.error(`Failed to create service: ${serviceInput.name}`, error);
        this.stats.services.failed++;
        if (!this.options.continueOnError) throw error;
      }
    }

    this.logger.success(`Services: ${this.stats.services.created} created, ${this.stats.services.failed} failed`);
  }

  /**
   * Seed glass solutions
   */
  private async seedGlassSolutions(solutions: GlassSolutionInput[]): Promise<Map<string, string>> {
    const solutionIdMap = new Map<string, string>();

    this.logger.info(`Seeding ${solutions.length} glass solutions...`);

    for (const solutionInput of solutions) {
      try {
        const result = createGlassSolution(solutionInput, {
          skipValidation: this.options.skipValidation,
        });

        if (!(result.success && result.data)) {
          this.handleValidationErrors(solutionInput.key, result.errors);
          this.stats.glassSolutions.failed++;
          if (!this.options.continueOnError) throw new Error('Validation failed');
          continue;
        }

        // Check if solution already exists
        const existing = await this.prisma.glassSolution.findUnique({
          where: { key: result.data.key },
        });

        // Create or update
        const solution = existing
          ? await this.prisma.glassSolution.update({
            data: result.data,
            where: { id: existing.id },
          })
          : await this.prisma.glassSolution.create({
            data: result.data,
          });

        // Store ID mapping for relationship resolution
        solutionIdMap.set(solution.key, solution.id);

        this.stats.glassSolutions.created++;
        this.logger.debug(`Created: ${solution.nameEs} (${solution.id})`);
      } catch (error) {
        this.logger.error(`Failed to create glass solution: ${solutionInput.key}`, error);
        this.stats.glassSolutions.failed++;
        if (!this.options.continueOnError) throw error;
      }
    }

    this.logger.success(
      `Glass solutions: ${this.stats.glassSolutions.created} created, ${this.stats.glassSolutions.failed} failed`
    );

    return solutionIdMap;
  }

  /**
   * Assign solutions to glass types based on characteristics
   */
  private async assignSolutionsToGlassTypes(
    glassTypes: Map<string, string>,
    solutions: Map<string, string>
  ): Promise<void> {
    this.logger.info(`Assigning solutions to ${glassTypes.size} glass types...`);

    // Get all glass types from database with characteristics
    const glassTypesData = await this.prisma.glassType.findMany({
      select: {
        id: true,
        isLaminated: true,
        isLowE: true,
        isTempered: true,
        isTripleGlazed: true,
        name: true,
        purpose: true,
        thicknessMm: true,
      },
    });

    for (const glassType of glassTypesData) {
      try {
        // Calculate which solutions apply to this glass type
        const assignments = calculateGlassSolutions({
          isLaminated: glassType.isLaminated,
          isLowE: glassType.isLowE,
          isTempered: glassType.isTempered,
          isTripleGlazed: glassType.isTripleGlazed,
          purpose: glassType.purpose,
          thicknessMm: glassType.thicknessMm,
        });

        // Create each assignment
        for (const assignment of assignments) {
          const solutionId = solutions.get(assignment.solutionKey);
          if (!solutionId) {
            this.logger.warn(`Solution not found: ${assignment.solutionKey}`);
            continue;
          }

          // Check if assignment already exists
          const existing = await this.prisma.glassTypeSolution.findUnique({
            where: {
              // biome-ignore lint/style/useNamingConvention: Prisma generated unique constraint name
              glassTypeId_solutionId: {
                glassTypeId: glassType.id,
                solutionId,
              },
            },
          });

          const assignmentData = {
            glassTypeId: glassType.id,
            isPrimary: assignment.isPrimary,
            performanceRating: assignment.performanceRating,
            solutionId,
          };

          const factoryResult = createGlassTypeSolution(assignmentData, {
            skipValidation: this.options.skipValidation,
          });

          if (!(factoryResult.success && factoryResult.data)) {
            this.handleValidationErrors(`${glassType.name} -> ${assignment.solutionKey}`, factoryResult.errors);
            this.stats.glassTypeSolutions.failed++;
            continue;
          }

          // Create or update
          if (existing) {
            await this.prisma.glassTypeSolution.update({
              data: factoryResult.data,
              where: { id: existing.id },
            });
          } else {
            await this.prisma.glassTypeSolution.create({
              data: factoryResult.data,
            });
          }

          this.stats.glassTypeSolutions.created++;
          this.logger.debug(
            `Assigned: ${glassType.name} -> ${assignment.solutionKey} (${assignment.performanceRating})`
          );
        }
      } catch (error) {
        this.logger.error(`Failed to assign solutions to: ${glassType.name}`, error);
        this.stats.glassTypeSolutions.failed++;
        if (!this.options.continueOnError) throw error;
      }
    }

    this.logger.success(
      `Glass type solutions: ${this.stats.glassTypeSolutions.created} created, ${this.stats.glassTypeSolutions.failed} failed`
    );
  }

  /**
   * Handle validation errors
   */
  private handleValidationErrors(
    entityName: string,
    errors: Array<{ code: string; message: string }> | undefined
  ): void {
    if (!errors || errors.length === 0) return;

    this.logger.error(`Validation failed for: ${entityName}`);
    for (const error of errors) {
      this.logger.error(`  [${error.code}] ${error.message}`);
    }
  }

  /**
   * Print seeding summary
   */
  private printSummary(): void {
    this.logger.section('Seeding Summary');

    console.log('\n📊 Statistics:');
    console.log(
      `   Profile Suppliers: ${this.stats.profileSuppliers.created} created, ${this.stats.profileSuppliers.failed} failed`
    );
    console.log(`   Glass Types: ${this.stats.glassTypes.created} created, ${this.stats.glassTypes.failed} failed`);
    console.log(`   Models: ${this.stats.models.created} created, ${this.stats.models.failed} failed`);
    console.log(`   Services: ${this.stats.services.created} created, ${this.stats.services.failed} failed`);
    console.log(
      `   Glass Solutions: ${this.stats.glassSolutions.created} created, ${this.stats.glassSolutions.failed} failed`
    );
    console.log(
      `   Glass-Solution Assignments: ${this.stats.glassTypeSolutions.created} created, ${this.stats.glassTypeSolutions.failed} failed`
    );

    console.log(`\n✨ Total: ${this.stats.totalCreated} created, ${this.stats.totalFailed} failed`);
    console.log(`⏱️  Duration: ${this.stats.durationMs}ms`);

    if (this.stats.totalFailed > 0) {
      this.logger.warn('Some entities failed to seed. Check logs above for details.');
    } else {
      this.logger.success('All entities seeded successfully! 🎉');
    }
  }
}
