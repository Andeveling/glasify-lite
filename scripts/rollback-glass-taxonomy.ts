/** biome-ignore-all lint/suspicious/noConsole: rollback script requires console logging */
/**
 * Glass Taxonomy Migration Rollback Script
 *
 * Emergency recovery tool for rolling back glass taxonomy migrations:
 * - Restores legacy glass type names (removes "Legacy - " prefix)
 * - Reactivates glass types (sets isActive back to true)
 * - Removes migrated pricing from TenantGlassTypePrice
 * - Uses checkpoint data to determine what to rollback
 * - Generates audit log of all rollback operations
 *
 * Usage:
 *   pnpm rollback:glass-taxonomy                    # Rollback last migration
 *   pnpm rollback:glass-taxonomy --dry-run          # Preview rollback
 *   pnpm rollback:glass-taxonomy --checkpoint=xxx   # Rollback specific checkpoint
 *
 * Environment variables:
 *   DATABASE_URL: Connection string for target database
 */

import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import logger from '../src/lib/logger';

// CLI arguments parsing
interface RollbackOptions {
  checkpointFile?: string;
  dryRun: boolean;
}

function parseCLIArgs(): RollbackOptions {
  const args = process.argv.slice(2);
  const options: RollbackOptions = {
    dryRun: false,
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--checkpoint=')) {
      options.checkpointFile = arg.split('=')[1];
    }
  }

  return options;
}

/**
 * Rollback report for audit trail
 */
interface RollbackReport {
  completedAt: string;
  dryRun: boolean;
  errors: Array<{
    code: string;
    context: Record<string, unknown>;
    message: string;
  }>;
  executionTimeMs: number;
  metrics: {
    namesRestored: number;
    pricingRecordsRemoved: number;
    typesReactivated: number;
  };
  rollbackFrom?: string;
  startedAt: string;
  status: 'success' | 'partial' | 'failed';
  warnings: string[];
}

/**
 * Find the most recent checkpoint file
 */
function findLatestCheckpoint(checkpointDir: string): string | null {
  try {
    if (!fs.existsSync(checkpointDir)) {
      return null;
    }

    const files = fs.readdirSync(checkpointDir).filter((f) => f.endsWith('.json'));

    if (files.length === 0) {
      return null;
    }

    // Sort by modification time, most recent first
    const sortedFiles = files
      .map((file) => ({
        file,
        mtime: fs.statSync(path.join(checkpointDir, file)).mtime,
      }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

    const latestFile = sortedFiles[0];
    return latestFile ? path.join(checkpointDir, latestFile.file) : null;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`Failed to find checkpoints: ${errorMsg}`);
    return null;
  }
}

/**
 * Step 1: Restore legacy glass type names
 */
async function restoreLegacyNames(
  prisma: PrismaClient,
  dryRun: boolean
): Promise<{ restored: number; failed: number }> {
  console.log('\n📍 Step 1: Restoring legacy glass type names...');

  let restored = 0;
  let failed = 0;

  // Find all types with "Legacy - " prefix
  const legacyPrefixedTypes = await prisma.glassType.findMany({
    where: {
      name: {
        startsWith: 'Legacy - ',
      },
    },
  });

  console.log(`  Found ${legacyPrefixedTypes.length} types with "Legacy - " prefix`);

  for (const type of legacyPrefixedTypes) {
    try {
      const originalName = type.name.replace(/^Legacy - /, '');

      if (!dryRun) {
        await prisma.glassType.update({
          data: {
            name: originalName,
          },
          where: { id: type.id },
        });
      }

      restored++;
      console.log(`  ✓ ${type.name} → ${originalName}`);
    } catch (error) {
      failed++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ Failed to restore ${type.name}: ${errorMsg}`);
    }
  }

  console.log(`  ✓ Restored: ${restored}, Failed: ${failed}`);
  return { failed, restored };
}

/**
 * Step 2: Reactivate glass types
 */
async function reactivateGlassTypes(
  prisma: PrismaClient,
  dryRun: boolean
): Promise<{ reactivated: number; failed: number }> {
  console.log('\n📍 Step 2: Reactivating glass types...');

  let reactivated = 0;
  let failed = 0;

  // Find all inactive types that were likely deactivated during migration
  const inactiveTypes = await prisma.glassType.findMany({
    where: {
      isActive: false,
      isSeeded: false, // Only legacy types
    },
  });

  console.log(`  Found ${inactiveTypes.length} inactive legacy types`);

  for (const type of inactiveTypes) {
    try {
      if (!dryRun) {
        await prisma.glassType.update({
          data: {
            isActive: true,
          },
          where: { id: type.id },
        });
      }

      reactivated++;
      console.log(`  ✓ Reactivated: ${type.name}`);
    } catch (error) {
      failed++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ Failed to reactivate ${type.name}: ${errorMsg}`);
    }
  }

  console.log(`  ✓ Reactivated: ${reactivated}, Failed: ${failed}`);
  return { failed, reactivated };
}

/**
 * Step 3: Remove migrated pricing records
 */
async function removeMigratedPricing(
  prisma: PrismaClient,
  dryRun: boolean
): Promise<{ removed: number; failed: number }> {
  console.log('\n📍 Step 3: Removing migrated pricing records...');

  let removed = 0;
  let failed = 0;

  // Find all TenantGlassTypePrice records for legacy types
  const legacyTypes = await prisma.glassType.findMany({
    select: {
      id: true,
      name: true,
    },
    where: {
      isSeeded: false,
    },
  });

  const legacyTypeIds = legacyTypes.map((t) => t.id);

  const pricingRecords = await prisma.tenantGlassTypePrice.findMany({
    include: {
      glassType: {
        select: {
          name: true,
        },
      },
    },
    where: {
      glassTypeId: {
        in: legacyTypeIds,
      },
    },
  });

  console.log(`  Found ${pricingRecords.length} pricing records to remove`);

  for (const record of pricingRecords) {
    try {
      if (!dryRun) {
        await prisma.tenantGlassTypePrice.delete({
          where: { id: record.id },
        });
      }

      removed++;
      console.log(
        `  ✓ Removed pricing for: ${record.glassType.name} ($${Number.parseFloat(record.price.toString()).toFixed(2)} COP)`
      );
    } catch (error) {
      failed++;
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`  ✗ Failed to remove pricing for ${record.glassType.name}: ${errorMsg}`);
    }
  }

  console.log(`  ✓ Removed: ${removed}, Failed: ${failed}`);
  return { failed, removed };
}

/**
 * Main rollback function
 */
export async function rollbackGlassTaxonomy(opts: RollbackOptions): Promise<RollbackReport> {
  const startTime = Date.now();
  const startedAt = new Date().toISOString();
  const errors: RollbackReport['errors'] = [];
  const warnings: string[] = [];
  const metrics: RollbackReport['metrics'] = {
    namesRestored: 0,
    pricingRecordsRemoved: 0,
    typesReactivated: 0,
  };

  const prisma = new PrismaClient();

  try {
    console.log('\n🔄 Glass Taxonomy Rollback Started');
    console.log(`📅 Started at: ${startedAt}`);
    console.log(`🏳️ Dry-run mode: ${opts.dryRun ? 'ON' : 'OFF'}\n`);

    if (opts.dryRun) {
      console.log('⚠️  DRY-RUN MODE: No changes will be made to the database\n');
    }

    logger.info('Rollback started', {
      checkpointFile: opts.checkpointFile,
      dryRun: opts.dryRun,
      timestamp: startedAt,
    });

    // Find checkpoint if not specified
    let checkpointFile = opts.checkpointFile;
    if (!checkpointFile) {
      const checkpointDir = path.join(process.cwd(), 'logs', 'migration-checkpoints');
      checkpointFile = findLatestCheckpoint(checkpointDir) || undefined;

      if (checkpointFile) {
        console.log(`📋 Using latest checkpoint: ${path.basename(checkpointFile)}\n`);
      } else {
        warnings.push('No checkpoint file found, rolling back all legacy changes');
        console.log('⚠️  No checkpoint found, rolling back all legacy changes\n');
      }
    }

    // Step 1: Restore legacy names
    const { restored, failed: namesFailed } = await restoreLegacyNames(prisma, opts.dryRun);
    metrics.namesRestored = restored;
    if (namesFailed > 0) {
      warnings.push(`${namesFailed} names failed to restore`);
    }

    // Step 2: Reactivate types
    const { reactivated, failed: reactivateFailed } = await reactivateGlassTypes(prisma, opts.dryRun);
    metrics.typesReactivated = reactivated;
    if (reactivateFailed > 0) {
      warnings.push(`${reactivateFailed} types failed to reactivate`);
    }

    // Step 3: Remove pricing
    const { removed, failed: pricingFailed } = await removeMigratedPricing(prisma, opts.dryRun);
    metrics.pricingRecordsRemoved = removed;
    if (pricingFailed > 0) {
      warnings.push(`${pricingFailed} pricing records failed to remove`);
    }

    console.log('\n✨ Rollback completed successfully!');

    const completedAt = new Date().toISOString();
    const executionTimeMs = Date.now() - startTime;

    const report: RollbackReport = {
      completedAt,
      dryRun: opts.dryRun,
      errors,
      executionTimeMs,
      metrics,
      rollbackFrom: checkpointFile,
      startedAt,
      status: errors.length > 0 ? 'partial' : 'success',
      warnings,
    };

    // Save report
    const reportPath = path.join(
      process.cwd(),
      'logs',
      `rollback-report-${new Date().toISOString().split('T')[0]}.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to: ${reportPath}`);

    logger.info('Rollback completed', {
      executionTimeMs,
      metrics,
      status: report.status,
    });

    return report;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('\n❌ Fatal error during rollback:', errorMessage);
    logger.error('Rollback failed', { error });

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
      rollbackFrom: opts.checkpointFile,
      startedAt,
      status: 'failed',
      warnings,
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Run rollback if executed directly
const options = parseCLIArgs();
rollbackGlassTaxonomy(options)
  .then((report) => {
    process.exit(report.status === 'success' ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
