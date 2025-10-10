/**
 * Data Migration Script: Manufacturer to TenantConfig + ProfileSupplier
 *
 * This script migrates data from the deprecated Manufacturer model to:
 * - TenantConfig (singleton for business configuration)
 * - ProfileSupplier (profile manufacturers like Rehau, Deceuninck, etc.)
 *
 * @see /plan/refactor-manufacturer-to-tenant-config-1.md
 */

import { MaterialType, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simple console logger for migration
const logger = {
  error: (msg: string, meta?: unknown) => console.error(`[ERROR] ${msg}`, meta ?? ''),
  info: (msg: string, meta?: unknown) => console.log(`[INFO] ${msg}`, meta ?? ''),
  warn: (msg: string, meta?: unknown) => console.warn(`[WARN] ${msg}`, meta ?? ''),
};

interface MigrationStats {
  manufacturersFound: number;
  tenantConfigCreated: boolean;
  profileSuppliersCreated: number;
  modelsUpdated: number;
  glassTypesUpdated: number;
  servicesUpdated: number;
  quotesUpdated: number;
}

/**
 * Infer material type from supplier name
 */
function inferMaterialType(name: string): MaterialType {
  const nameLower = name.toLowerCase();

  // PVC suppliers
  if (
    nameLower.includes('rehau') ||
    nameLower.includes('deceuninck') ||
    nameLower.includes('veka') ||
    nameLower.includes('kommerling')
  ) {
    return MaterialType.PVC;
  }

  // Aluminum suppliers
  if (
    nameLower.includes('azembla') ||
    nameLower.includes('aluflex') ||
    nameLower.includes('aluminio') ||
    nameLower.includes('aluminum')
  ) {
    return MaterialType.ALUMINUM;
  }

  // Wood suppliers
  if (nameLower.includes('madera') || nameLower.includes('wood')) {
    return MaterialType.WOOD;
  }

  // Default to MIXED if uncertain
  return MaterialType.MIXED;
}

/**
 * Main migration function
 */
async function migrate(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    glassTypesUpdated: 0,
    manufacturersFound: 0,
    modelsUpdated: 0,
    profileSuppliersCreated: 0,
    quotesUpdated: 0,
    servicesUpdated: 0,
    tenantConfigCreated: false,
  };

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Fetch all existing manufacturers
      const manufacturers = await tx.manufacturer.findMany({
        orderBy: { createdAt: 'asc' },
      });

      stats.manufacturersFound = manufacturers.length;
      logger.info(`Found ${manufacturers.length} manufacturers to migrate`);

      if (manufacturers.length === 0) {
        logger.warn('No manufacturers found. Creating default tenant config...');

        // Create default tenant config
        await tx.tenantConfig.create({
          data: {
            businessName: 'Mi Carpintería',
            currency: 'COP',
            locale: 'es-CO',
            quoteValidityDays: 15,
            timezone: 'America/Bogota',
          },
        });

        stats.tenantConfigCreated = true;
        return;
      }

      // 2. Create TenantConfig from first manufacturer (assumes it's the business owner)
      const firstManufacturer = manufacturers[ 0 ];
      if (!firstManufacturer) {
        throw new Error('No manufacturers found to migrate');
      }

      logger.info(`Creating TenantConfig from: ${firstManufacturer.name}`);

      await tx.tenantConfig.create({
        data: {
          businessName: firstManufacturer.name,
          currency: firstManufacturer.currency,
          locale: 'es-CO', // Default
          quoteValidityDays: firstManufacturer.quoteValidityDays,
          timezone: 'America/Bogota', // Default
        },
      });

      stats.tenantConfigCreated = true;
      logger.info('✅ TenantConfig created successfully');

      // 3. Create ProfileSuppliers from remaining manufacturers
      const supplierManufacturers = manufacturers.slice(1);

      if (supplierManufacturers.length > 0) {
        logger.info(`Creating ${supplierManufacturers.length} ProfileSuppliers...`);

        for (const mfg of supplierManufacturers) {
          const materialType = inferMaterialType(mfg.name);

          await tx.profileSupplier.create({
            data: {
              isActive: true,
              materialType,
              name: mfg.name,
            },
          });

          stats.profileSuppliersCreated++;
          logger.info(`✅ Created ProfileSupplier: ${mfg.name} (${materialType})`);
        }
      }

      // 4. Also create ProfileSupplier for the first manufacturer (it can be both tenant and supplier)
      const firstMfgMaterialType = inferMaterialType(firstManufacturer.name);
      await tx.profileSupplier.create({
        data: {
          isActive: true,
          materialType: firstMfgMaterialType,
          name: firstManufacturer.name,
        },
      });
      stats.profileSuppliersCreated++;
      logger.info(`✅ Created ProfileSupplier for tenant: ${firstManufacturer.name}`);

      // 5. Update Model references
      logger.info('Updating Model references...');

      for (const mfg of manufacturers) {
        const profileSupplier = await tx.profileSupplier.findUnique({
          where: { name: mfg.name },
        });

        if (profileSupplier) {
          const result = await tx.model.updateMany({
            data: { profileSupplierId: profileSupplier.id },
            where: { manufacturerId: mfg.id },
          });

          stats.modelsUpdated += result.count;
          logger.info(`✅ Updated ${result.count} models for ${mfg.name}`);
        }
      }

      // 6. Note: GlassType, Service, Quote no longer need manufacturerId
      // They will use TenantConfig for global settings
      logger.info('Migration completed successfully! 🎉');
    });

    return stats;
  } catch (error) {
    logger.error('Migration failed:', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * Rollback function (if needed)
 */
async function rollback(): Promise<void> {
  logger.warn('Rolling back migration...');

  try {
    await prisma.$transaction(async (tx) => {
      // Delete ProfileSuppliers
      await tx.profileSupplier.deleteMany();
      logger.info('✅ Deleted all ProfileSuppliers');

      // Delete TenantConfig
      await tx.tenantConfig.deleteMany();
      logger.info('✅ Deleted TenantConfig');

      // Reset Model.profileSupplierId
      await tx.model.updateMany({
        data: { profileSupplierId: null },
      });
      logger.info('✅ Reset Model.profileSupplierId to null');

      logger.info('Rollback completed successfully! 🔄');
    });
  } catch (error) {
    logger.error('Rollback failed:', { error: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

/**
 * CLI execution
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[ 0 ] ?? 'migrate';

  try {
    if (command === 'rollback') {
      await rollback();
    } else {
      const stats = await migrate();

      console.log('\n📊 Migration Statistics:');
      console.log('========================');
      console.log(`Manufacturers found: ${stats.manufacturersFound}`);
      console.log(`TenantConfig created: ${stats.tenantConfigCreated ? 'Yes ✅' : 'No ❌'}`);
      console.log(`ProfileSuppliers created: ${stats.profileSuppliersCreated}`);
      console.log(`Models updated: ${stats.modelsUpdated}`);
      console.log(`GlassTypes updated: ${stats.glassTypesUpdated}`);
      console.log(`Services updated: ${stats.servicesUpdated}`);
      console.log(`Quotes updated: ${stats.quotesUpdated}`);
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if executed directly (ES module compatible)
const isMainModule = process.argv[ 1 ]?.endsWith('migrate-manufacturer-to-tenant.ts') ?? false;

if (isMainModule) {
  main();
}

export { migrate, rollback };
