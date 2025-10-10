/**
 * Rollback Script: Revert TenantConfig + ProfileSupplier to Manufacturer
 *
 * This script reverts the migration from TenantConfig/ProfileSupplier back to Manufacturer
 * USE WITH CAUTION - This will delete data
 *
 * @see /plan/refactor-manufacturer-to-tenant-config-1.md
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple console logger for rollback
const logger = {
  error: (msg: string, meta?: unknown) => console.error(`[ERROR] ${msg}`, meta ?? ''),
  info: (msg: string, meta?: unknown) => console.log(`[INFO] ${msg}`, meta ?? ''),
  warn: (msg: string, meta?: unknown) => console.warn(`[WARN] ${msg}`, meta ?? ''),
};

async function rollback(): Promise<void> {
  logger.warn('⚠️  Rolling back migration...');
  logger.warn('⚠️  This will delete TenantConfig and ProfileSupplier data!');

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Reset Model.profileSupplierId to null
      const modelsReset = await tx.model.updateMany({
        data: { profileSupplierId: null },
      });
      logger.info(`✅ Reset ${modelsReset.count} models (profileSupplierId → null)`);

      // 2. Delete all ProfileSuppliers
      const suppliersDeleted = await tx.profileSupplier.deleteMany();
      logger.info(`✅ Deleted ${suppliersDeleted.count} ProfileSuppliers`);

      // 3. Delete TenantConfig
      const tenantDeleted = await tx.tenantConfig.deleteMany();
      logger.info(`✅ Deleted ${tenantDeleted.count} TenantConfig records`);

      logger.info('🔄 Rollback completed successfully!');
      logger.warn('⚠️  Remember to restore manufacturerId values manually if needed');
    });
  } catch (error) {
    logger.error('❌ Rollback failed:', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if executed directly (ES module compatible)
const isMainModule = process.argv[1]?.endsWith('rollback-tenant-config.ts') ?? false;

if (isMainModule) {
  rollback()
    .then(() => {
      console.log('\n✅ Rollback completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Rollback error:', error);
      process.exit(1);
    });
}

export { rollback };
