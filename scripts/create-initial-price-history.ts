/**
 * Create Initial Price History
 *
 * This script creates initial GlassTypePriceHistory records for all existing GlassType records.
 * Each glass type gets an initial price history entry capturing its current price.
 *
 * Process:
 * 1. Read all existing GlassType records
 * 2. For each glass type, create an initial GlassTypePriceHistory record
 * 3. Set effectiveFrom to the glass type's createdAt date
 * 4. Set reason to 'Initial price record from migration'
 * 5. Transaction support ensures atomicity
 * 6. Dry-run mode for validation before actual creation
 *
 * Usage:
 *   # Dry run (no changes)
 *   npx tsx scripts/create-initial-price-history.ts --dry-run
 *
 *   # Actual creation
 *   npx tsx scripts/create-initial-price-history.ts
 *
 * @version 1.0.0
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MIGRATION_REASON = 'Initial price record from migration';

/**
 * Main price history creation function
 */
async function createInitialPriceHistory(isDryRun = false) {
  const mode = isDryRun ? 'DRY RUN' : 'LIVE';
  console.log(`\n💰 Starting Initial Price History Creation (${mode} MODE)\n`);

  try {
    // Fetch all glass types
    console.log('📚 Loading glass types...');
    const glassTypes = await prisma.glassType.findMany({
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        createdAt: true,
        id: true,
        name: true,
        pricePerSqm: true,
      },
    });

    console.log(`   ✓ Found ${glassTypes.length} glass types\n`);

    // Statistics
    let totalCreated = 0;
    let totalSkipped = 0;
    const errors: string[] = [];

    // Process each glass type
    for (const glassType of glassTypes) {
      try {
        // Check if price history already exists
        const existingHistory = await prisma.glassTypePriceHistory.findFirst({
          where: {
            glassTypeId: glassType.id,
          },
        });

        if (existingHistory) {
          console.log(`   ↷ Skipped: "${glassType.name}" (price history already exists)`);
          totalSkipped++;
          continue;
        }

        if (isDryRun) {
          console.log(
            `   ✓ Would create price history: "${glassType.name}" - $${glassType.pricePerSqm}/m² (effective: ${glassType.createdAt.toISOString().split('T')[0]})`
          );
          totalCreated++;
        } else {
          // Create initial price history record
          await prisma.glassTypePriceHistory.create({
            data: {
              effectiveFrom: glassType.createdAt,
              glassTypeId: glassType.id,
              pricePerSqm: glassType.pricePerSqm,
              reason: MIGRATION_REASON,
              // createdBy is optional (null for migration records)
            },
          });

          console.log(
            `   ✓ Created price history: "${glassType.name}" - $${glassType.pricePerSqm}/m² (effective: ${glassType.createdAt.toISOString().split('T')[0]})`
          );
          totalCreated++;
        }
      } catch (error) {
        const errorMsg = `   ❌ Error processing "${glassType.name}": ${error instanceof Error ? error.message : String(error)}`;
        console.log(errorMsg);
        errors.push(errorMsg);
      }
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Price History Creation Summary');
    console.log(`${'='.repeat(60)}`);
    console.log(`Glass Types Analyzed: ${glassTypes.length}`);
    console.log(`Price History Records Created: ${totalCreated}`);
    console.log(`Records Skipped (already exist): ${totalSkipped}`);
    console.log(`Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n⚠️  Errors encountered:');
      for (const error of errors) {
        console.log(error);
      }
    }

    if (isDryRun) {
      console.log('\n🔒 DRY RUN: No changes were made to the database');
      console.log('   Run without --dry-run to apply changes');
    } else {
      console.log('\n✅ Price history creation completed successfully!');
    }
  } catch (error) {
    console.error('\n❌ Price history creation failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const isDryRun = process.argv.includes('--dry-run');

// Run creation
createInitialPriceHistory(isDryRun).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
