/**
 * Migrate Glass Characteristics
 *
 * This script migrates legacy boolean characteristics (isTempered, isLaminated, isLowE, isTripleGlazed)
 * from GlassType to the new flexible GlassTypeCharacteristic Many-to-Many relationship.
 *
 * Usage:
 *   pnpm migrate:glass-chars:dry    # Dry run
 *   pnpm migrate:glass-chars         # Live migration
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CHARACTERISTIC_MAPPING = {
  isLaminated: 'laminated',
  isLowE: 'low_e',
  isTempered: 'tempered',
  isTripleGlazed: 'triple_glazed',
} as const;

type BooleanField = keyof typeof CHARACTERISTIC_MAPPING;

async function migrateGlassCharacteristics(dryRun = false) {
  const mode = dryRun ? 'DRY RUN' : 'LIVE';
  console.log(`\n�� Starting Glass Characteristics Migration (${mode} MODE)\n`);

  try {
    console.log('📚 Loading glass characteristics...');
    const characteristics = await prisma.glassCharacteristic.findMany({
      select: { id: true, key: true, nameEs: true },
      where: { key: { in: Object.values(CHARACTERISTIC_MAPPING) } },
    });

    console.log(`   ✓ Found ${characteristics.length} characteristics`);
    const characteristicMap = new Map(characteristics.map((c) => [ c.key, c ]));

    console.log('\n🔍 Analyzing glass types...');
    const glassTypes = await prisma.glassType.findMany({
      select: {
        id: true,
        isLaminated: true,
        isLowE: true,
        isTempered: true,
        isTripleGlazed: true,
        name: true,
      },
    });

    console.log(`   ✓ Found ${glassTypes.length} glass types\n`);

    let totalCreated = 0;
    let totalSkipped = 0;
    const errors: string[] = [];

    for (const glassType of glassTypes) {
      const booleanFields = Object.keys(CHARACTERISTIC_MAPPING) as BooleanField[];

      for (const field of booleanFields) {
        if (glassType[ field ]) {
          const characteristicKey = CHARACTERISTIC_MAPPING[ field ];
          const characteristic = characteristicMap.get(characteristicKey);

          if (!characteristic) {
            const error = `   ⚠️  Characteristic not found: ${characteristicKey} for "${glassType.name}"`;
            console.log(error);
            errors.push(error);
            continue;
          }

          const existing = await prisma.glassTypeCharacteristic.findUnique({
            where: {
              glassTypeId_characteristicId: {
                characteristicId: characteristic.id,
                glassTypeId: glassType.id,
              },
            },
          });

          if (existing) {
            console.log(`   ↷ Skipped: ${glassType.name} → ${characteristic.nameEs} (already exists)`);
            totalSkipped++;
            continue;
          }

          if (dryRun) {
            console.log(`   ✓ Would create: ${glassType.name} → ${characteristic.nameEs}`);
            totalCreated++;
          } else {
            await prisma.glassTypeCharacteristic.create({
              data: {
                characteristicId: characteristic.id,
                glassTypeId: glassType.id,
              },
            });

            console.log(`   ✓ Created: ${glassType.name} → ${characteristic.nameEs}`);
            totalCreated++;
          }
        }
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Migration Summary');
    console.log(`${'='.repeat(60)}`);
    console.log(`Glass Types Analyzed: ${glassTypes.length}`);
    console.log(`Characteristics Created: ${totalCreated}`);
    console.log(`Links Skipped (already exist): ${totalSkipped}`);
    console.log(`Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      for (const error of errors) {
        console.log(error);
      }
    }

    if (dryRun) {
      console.log('\n🔒 DRY RUN: No changes were made to the database');
      console.log('   Run without --dry-run to apply changes');
    } else {
      console.log('\n✅ Migration completed successfully!');
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

const isDryRun = process.argv.includes('--dry-run');
migrateGlassCharacteristics(isDryRun).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
