/** biome-ignore-all lint/suspicious/noConsole: migration script requires console logging */
/**
 * Glass Taxonomy Migration Script
 *
 * Migrates existing tenant-created glass types to static taxonomy:
 * - Preserves legacy types with "Legacy - " prefix
 * - Migrates pricing to TenantGlassTypePrice
 * - Validates quote references integrity
 * - Generates migration report with metrics
 *
 * Usage:
 *   pnpm migrate:glass-taxonomy                  # Standard run
 *   pnpm migrate:glass-taxonomy --dry-run        # Preview changes
 *   pnpm migrate:glass-taxonomy --tenant-id=xxx  # Single tenant (testing)
 *
 * Environment variables:
 *   DATABASE_URL: Connection string for target database
 */

import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import logger from '../src/lib/logger';

// CLI arguments parsing
interface MigrationOptions {
  dryRun: boolean;
  tenantId?: string;
  checkpointDir: string;
}

function parseCLIArgs(): MigrationOptions {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {
    checkpointDir: path.join(process.cwd(), 'logs', 'migration-checkpoints'),
    dryRun: false,
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--tenant-id=')) {
      options.tenantId = arg.split('=')[1];
    }
  }

  return options;
}

/**
 * Migration checkpoint for resumable migrations
 */
interface MigrationCheckpoint {
  completedSteps: string[];
  failedSteps: {
    step: string;
    error: string;
    timestamp: string;
  }[];
  startTime: string;
  stats: {
    typesDiscovered: number;
    typesRenamed: number;
    typesMigrated: number;
    pricingRecords: number;
    quotesVerified: number;
  };
}

/**
 * Migration report for audit trail
 */
interface MigrationReport {
  completedAt: string;
  dryRun: boolean;
  errors: Array<{
    code: string;
    message: string;
    context?: Record<string, unknown>;
  }>;
  executionTimeMs: number;
  metrics: {
    glassTypesAnalyzed: number;
    glassTypesRenamed: number;
    pricingRecordsMigrated: number;
    quotesVerified: number;
    quotesWithBrokenReferences: number;
  };
  startedAt: string;
  status: 'success' | 'failed' | 'partial';
  warnings: string[];
}

/**
 * Initialize migration checkpoint
 */
function initializeCheckpoint(opts: MigrationOptions): MigrationCheckpoint {
  const checkpointFile = path.join(opts.checkpointDir, 'current-migration.json');

  // Create checkpoint directory if needed
  if (!fs.existsSync(opts.checkpointDir)) {
    fs.mkdirSync(opts.checkpointDir, { recursive: true });
  }

  // Check if resuming from previous run
  if (fs.existsSync(checkpointFile)) {
    const existing = JSON.parse(fs.readFileSync(checkpointFile, 'utf-8')) as MigrationCheckpoint;
    console.log(`\n📋 Resuming from checkpoint (${existing.completedSteps.length} steps completed)`);
    logger.info('Resuming migration from checkpoint', {
      completedSteps: existing.completedSteps.length,
      file: checkpointFile,
    });
    return existing;
  }

  // Create new checkpoint
  const checkpoint: MigrationCheckpoint = {
    completedSteps: [],
    failedSteps: [],
    startTime: new Date().toISOString(),
    stats: {
      pricingRecords: 0,
      quotesVerified: 0,
      typesDiscovered: 0,
      typesMigrated: 0,
      typesRenamed: 0,
    },
  };

  fs.writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2));
  return checkpoint;
}

/**
 * Save checkpoint progress
 */
function saveCheckpoint(checkpoint: MigrationCheckpoint, opts: MigrationOptions): void {
  const checkpointFile = path.join(opts.checkpointDir, 'current-migration.json');
  fs.writeFileSync(checkpointFile, JSON.stringify(checkpoint, null, 2));
}

/**
 * Mark step as completed
 */
function markStepCompleted(checkpoint: MigrationCheckpoint, stepName: string, opts: MigrationOptions): void {
  if (!checkpoint.completedSteps.includes(stepName)) {
    checkpoint.completedSteps.push(stepName);
    console.log(`✅ Step completed: ${stepName}`);
    logger.info('Migration step completed', { step: stepName });
  }
  saveCheckpoint(checkpoint, opts);
}

/**
 * Step 1: Discover tenant glass types
 * Queries legacy GlassType records (isSeeded=false) and groups them by tenant
 */
async function discoverTenantGlassTypes(
  prisma: PrismaClient,
  tenantId?: string
): Promise<{
  legacyTypes: typeof legacyTypes;
  seededTypes: typeof seededTypes;
  stats: { discovered: number; grouped: number };
}> {
  console.log('\n📍 Step 1: Discovering tenant glass types...');

  // Query legacy (non-seeded) glass types
  const legacyTypes = await prisma.glassType.findMany({
    include: {
      glassSupplier: true,
      quoteItems: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    where: {
      isSeeded: false,
      ...(tenantId && { glassSupplier: { tenantConfigId: tenantId } }),
    },
  });

  // Query all seeded types for matching
  const seededTypes = await prisma.glassType.findMany({
    select: {
      code: true,
      id: true,
      name: true,
      series: true,
    },
    where: { isSeeded: true },
  });

  console.log(`  ✓ Found ${legacyTypes.length} legacy types`);
  console.log(`  ✓ Found ${seededTypes.length} seeded types for matching`);

  // Group by tenant
  const groupedByTenant = new Map<string, typeof legacyTypes>();
  for (const type of legacyTypes) {
    const tid = type.glassSupplier?.tenantConfigId || 'unknown';
    if (!groupedByTenant.has(tid)) {
      groupedByTenant.set(tid, []);
    }
    const group = groupedByTenant.get(tid);
    if (group) {
      group.push(type);
    }
  }

  console.log(`  ✓ Grouped into ${groupedByTenant.size} tenant(s)`);

  return {
    legacyTypes,
    seededTypes,
    stats: {
      discovered: legacyTypes.length,
      grouped: groupedByTenant.size,
    },
  };
}

/**
 * Step 2: Rename legacy types with "Legacy - " prefix
 */
async function renameLegacyTypes(
  prisma: PrismaClient,
  legacyTypes: Awaited<ReturnType<typeof discoverTenantGlassTypes>>['legacyTypes'],
  dryRun: boolean
): Promise<{ renamed: number; failed: number }> {
  console.log('\n📍 Step 2: Renaming legacy types...');

  let renamed = 0;
  let failed = 0;

  for (const type of legacyTypes) {
    try {
      const newName = `Legacy - ${type.name}`;

      if (!dryRun) {
        await prisma.glassType.update({
          data: {
            isActive: false,
            name: newName,
          },
          where: { id: type.id },
        });
      }

      renamed++;
      console.log(`  ✓ ${type.name} → ${newName}`);
    } catch (error) {
      failed++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ Failed to rename ${type.name}: ${errorMsg}`);
    }
  }

  console.log(`  ✓ Renamed: ${renamed}, Failed: ${failed}`);
  return { failed, renamed };
}

/**
 * Step 3: Verify quote references integrity
 */
async function verifyQuoteReferences(
  prisma: PrismaClient,
  legacyTypes: Awaited<ReturnType<typeof discoverTenantGlassTypes>>['legacyTypes']
): Promise<{ verified: number; orphaned: number; errors: string[] }> {
  console.log('\n📍 Step 3: Verifying quote references...');

  const errors: string[] = [];
  let verified = 0;
  let orphaned = 0;

  for (const type of legacyTypes) {
    const quoteItemCount = await prisma.quoteItem.count({
      where: { glassTypeId: type.id },
    });

    if (quoteItemCount > 0) {
      verified += quoteItemCount;
      console.log(`  ✓ Type "${type.name}" referenced in ${quoteItemCount} quote item(s)`);
    }
  }

  // Check for orphaned glassTypeId references (should not exist)
  const allGlassTypeIds = new Set(legacyTypes.map((t) => t.id));
  const quoteItemsWithInvalidRef = await prisma.quoteItem.findMany({
    select: { glassTypeId: true, id: true, quoteId: true },
    where: {
      glassTypeId: {
        notIn: Array.from(allGlassTypeIds),
      },
    },
  });

  if (quoteItemsWithInvalidRef.length > 0) {
    orphaned = quoteItemsWithInvalidRef.length;
    const orphanedIds = quoteItemsWithInvalidRef.map((q) => q.glassTypeId).join(', ');
    const errorMsg = `Found ${orphaned} orphaned quote references: glassTypeIds [${orphanedIds}]`;
    errors.push(errorMsg);
    console.error(`  ✗ ${errorMsg}`);
  } else {
    console.log('  ✓ No orphaned references found');
  }

  console.log(`  ✓ Verified: ${verified}, Orphaned: ${orphaned}`);
  return { errors, orphaned, verified };
}

/**
 * Helper: Migrate single glass type pricing
 */
async function migrateSingleTypePricing(
  prisma: PrismaClient,
  type: Awaited<ReturnType<typeof discoverTenantGlassTypes>>['legacyTypes'][number],
  effectiveDate: Date,
  dryRun: boolean
): Promise<boolean> {
  if (!type.pricePerSqm || Number.parseFloat(type.pricePerSqm.toString()) <= 0) {
    return false; // No pricing to migrate
  }

  if (!dryRun) {
    const existingPrice = await prisma.tenantGlassTypePrice.findFirst({
      where: {
        glassTypeId: type.id,
        supplierId: null,
        tenantConfigId: type.glassSupplier?.tenantConfigId || '1',
      },
    });

    if (existingPrice) {
      await prisma.tenantGlassTypePrice.update({
        data: {
          effectiveDate,
          price: type.pricePerSqm,
          updatedAt: new Date(),
        },
        where: { id: existingPrice.id },
      });
    } else {
      await prisma.tenantGlassTypePrice.create({
        data: {
          effectiveDate,
          glassTypeId: type.id,
          price: type.pricePerSqm,
          tenantConfigId: type.glassSupplier?.tenantConfigId || '1',
        },
      });
    }
  }

  return true;
}

/**
 * Step 4: Migrate pricing data to TenantGlassTypePrice
 */
async function migratePricingData(
  prisma: PrismaClient,
  legacyTypes: Awaited<ReturnType<typeof discoverTenantGlassTypes>>['legacyTypes'],
  dryRun: boolean
): Promise<{ migrated: number; failed: number }> {
  console.log('\n📍 Step 4: Migrating pricing data...');

  let migrated = 0;
  let failed = 0;
  const effectiveDate = new Date();

  for (const type of legacyTypes) {
    try {
      const pricePrice = Number.parseFloat(type.pricePerSqm.toString());
      const priceLog = `$${pricePrice.toFixed(2)} COP`;
      const migratedStatus = await migrateSingleTypePricing(prisma, type, effectiveDate, dryRun);

      if (migratedStatus) {
        migrated++;
        console.log(`  ✓ Migrated price for "${type.name}": ${priceLog}`);
      }
    } catch (error) {
      failed++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ Failed to migrate pricing for ${type.name}: ${errorMsg}`);
    }
  }

  console.log(`  ✓ Migrated: ${migrated}, Failed: ${failed}`);
  return { failed, migrated };
}

/**
 * Main migration function
 */
export async function migrateGlassTaxonomy(opts: MigrationOptions): Promise<MigrationReport> {
  const startTime = Date.now();
  const startedAt = new Date().toISOString();
  const errors: MigrationReport['errors'] = [];
  const warnings: string[] = [];
  const metrics: MigrationReport['metrics'] = {
    glassTypesAnalyzed: 0,
    glassTypesRenamed: 0,
    pricingRecordsMigrated: 0,
    quotesVerified: 0,
    quotesWithBrokenReferences: 0,
  };

  const checkpoint = initializeCheckpoint(opts);
  const prisma = new PrismaClient();

  try {
    console.log('\n🚀 Glass Taxonomy Migration Started');
    console.log(`📅 Started at: ${startedAt}`);
    console.log(`🏳️ Dry-run mode: ${opts.dryRun ? 'ON' : 'OFF'}\n`);

    if (opts.dryRun) {
      console.log('⚠️  DRY-RUN MODE: No changes will be made to the database\n');
    }

    logger.info('Migration started', {
      dryRun: opts.dryRun,
      tenantId: opts.tenantId,
      timestamp: startedAt,
    });

    // Step 1: Discover tenant glass types
    const { legacyTypes, stats: discoveryStats } = await discoverTenantGlassTypes(prisma, opts.tenantId);
    metrics.glassTypesAnalyzed = discoveryStats.discovered;
    markStepCompleted(checkpoint, 'discover-tenant-types', opts);

    if (legacyTypes.length === 0) {
      console.log('ℹ️  No legacy types found. Migration complete.');
      markStepCompleted(checkpoint, 'rename-legacy-types', opts);
      markStepCompleted(checkpoint, 'verify-quote-references', opts);
      markStepCompleted(checkpoint, 'migrate-pricing-data', opts);
    } else {
      // Step 2: Rename legacy types
      const { renamed, failed: renameFailed } = await renameLegacyTypes(prisma, legacyTypes, opts.dryRun);
      metrics.glassTypesRenamed = renamed;
      if (renameFailed > 0) {
        warnings.push(`${renameFailed} legacy types failed to rename`);
      }
      markStepCompleted(checkpoint, 'rename-legacy-types', opts);

      // Step 3: Verify quote references
      const { verified, orphaned, errors: refErrors } = await verifyQuoteReferences(prisma, legacyTypes);
      metrics.quotesVerified = verified;
      metrics.quotesWithBrokenReferences = orphaned;
      if (refErrors.length > 0) {
        errors.push(
          ...refErrors.map((msg) => ({
            code: 'ORPHANED_REFERENCES',
            context: {},
            message: msg,
          }))
        );
      }
      markStepCompleted(checkpoint, 'verify-quote-references', opts);

      // Step 4: Migrate pricing data
      const { migrated: pricingMigrated, failed: pricingFailed } = await migratePricingData(
        prisma,
        legacyTypes,
        opts.dryRun
      );
      metrics.pricingRecordsMigrated = pricingMigrated;
      if (pricingFailed > 0) {
        warnings.push(`${pricingFailed} pricing records failed to migrate`);
      }
      markStepCompleted(checkpoint, 'migrate-pricing-data', opts);
    }

    console.log('\n✨ Migration completed successfully!');

    const completedAt = new Date().toISOString();
    const executionTimeMs = Date.now() - startTime;

    const report: MigrationReport = {
      completedAt,
      dryRun: opts.dryRun,
      errors,
      executionTimeMs,
      metrics,
      startedAt,
      status: errors.length > 0 ? 'partial' : 'success',
      warnings,
    };

    // Save report
    const reportPath = path.join(
      process.cwd(),
      'logs',
      `migration-report-${new Date().toISOString().split('T')[0]}.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to: ${reportPath}`);

    logger.info('Migration completed', {
      executionTimeMs,
      metrics,
      status: report.status,
    });

    return report;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n❌ Fatal error during migration:', errorMessage);
    logger.error('Migration failed', { error });

    errors.push({
      code: 'FATAL_ERROR',
      context: { error },
      message: errorMessage,
    });

    return {
      completedAt: new Date().toISOString(),
      dryRun: opts.dryRun,
      errors,
      executionTimeMs: Date.now() - startTime,
      metrics,
      startedAt,
      status: 'failed',
      warnings,
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if executed directly
const options = parseCLIArgs();
migrateGlassTaxonomy(options)
  .then((report) => {
    process.exit(report.status === 'success' ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
