#!/usr/bin/env tsx

/**
 * ROLLBACK SCRIPT: GlassTypeSolution → purpose field
 *
 * This script reverts the Many-to-Many solution system back to the single purpose field.
 * Use this ONLY in emergency situations where you need to roll back to the old system.
 *
 * ⚠️  WARNING: This is a DESTRUCTIVE operation!
 * - Deletes all GlassTypeSolution relationships
 * - Sets purpose field based on PRIMARY solution only
 * - Loses multi-dimensional classification data
 *
 * PREREQUISITES:
 * 1. Database backup created
 * 2. All stakeholders notified
 * 3. Rollback approved by technical lead
 *
 * USAGE:
 *   pnpm tsx scripts/rollback-solutions-to-purpose.ts
 */

import type { GlassPurpose } from '@prisma/client';
import { db } from '../src/server/db';

const ROLLBACK_DELAY_MS = 5000;

// Mapping from solution keys to purpose enum values
const SOLUTION_TO_PURPOSE_MAP: Record<string, GlassPurpose> = {
  decorative: 'decorative',
  energy_efficiency: 'insulation', // Fallback to insulation
  general: 'general',
  security: 'security',
  sound_insulation: 'insulation',
  thermal_insulation: 'insulation',
};

async function rollbackSolutionsToPurpose() {
  console.log('🚨 ROLLBACK SCRIPT: GlassTypeSolution → purpose field\n');
  console.log('⚠️  WARNING: This will DELETE all solution relationships!\n');

  // Safety check
  console.log('Checking current state...\n');

  const glassTypesCount = await db.glassType.count();
  const solutionsCount = await db.glassTypeSolution.count();

  console.log('📊 Current State:');
  console.log(`   - GlassTypes: ${glassTypesCount}`);
  console.log(`   - GlassTypeSolution relationships: ${solutionsCount}\n`);

  if (solutionsCount === 0) {
    console.log('✅ No solutions to rollback. Exiting.');
    await db.$disconnect();
    process.exit(0);
  }

  // Confirm user intent
  console.log('⏳ Waiting 5 seconds before proceeding...');
  console.log('   Press Ctrl+C to cancel\n');
  await new Promise((resolve) => {
    setTimeout(resolve, ROLLBACK_DELAY_MS);
  });

  try {
    console.log('🔄 Starting rollback process...\n');

    // Step 1: Get all glass types with their PRIMARY solution
    const glassTypes = await db.glassType.findMany({
      select: {
        id: true,
        name: true,
        purpose: true,
        solutions: {
          select: {
            solution: {
              select: {
                key: true,
                nameEs: true,
              },
            },
          },
          where: {
            isPrimary: true,
          },
        },
      },
    });

    console.log(`📝 Processing ${glassTypes.length} glass types...\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const glass of glassTypes) {
      const primarySolution = glass.solutions[ 0 ];

      if (!primarySolution) {
        console.log(`  ⚠️  ${glass.name}: No primary solution found, keeping current purpose (${glass.purpose})`);
        skipCount++;
        continue;
      }

      const newPurpose = SOLUTION_TO_PURPOSE_MAP[ primarySolution.solution.key ];

      if (!newPurpose) {
        console.log(
          `  ❌ ${glass.name}: Unknown solution key '${primarySolution.solution.key}', keeping current purpose`
        );
        errorCount++;
        continue;
      }

      // Update purpose if different
      if (glass.purpose !== newPurpose) {
        await db.glassType.update({
          data: { purpose: newPurpose },
          where: { id: glass.id },
        });

        console.log(`  ✅ ${glass.name}: ${primarySolution.solution.nameEs} → ${newPurpose}`);
        successCount++;
      } else {
        console.log(`  ⏭️  ${glass.name}: Already has correct purpose (${newPurpose})`);
        skipCount++;
      }
    }

    // Step 2: DELETE all GlassTypeSolution relationships
    console.log(`\n🗑️  Deleting all ${solutionsCount} GlassTypeSolution relationships...`);

    const deleteResult = await db.glassTypeSolution.deleteMany({});

    console.log(`   ✅ Deleted ${deleteResult.count} relationships\n`);

    // Step 3: Summary
    console.log('📊 Rollback Summary:');
    console.log(`   ✅ Updated: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   🗑️  Deleted solutions: ${deleteResult.count}\n`);

    console.log('✅ Rollback completed successfully!\n');
    console.log('📋 Next Steps:');
    console.log('   1. Verify data integrity with: pnpm tsx scripts/check-glass-purpose.ts');
    console.log('   2. Test application functionality');
    console.log('   3. Update frontend to remove solution selector');
    console.log('   4. Remove GlassSolution models from schema (optional)\n');

    await db.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Rollback failed:', error);
    console.error('\n⚠️  Database may be in inconsistent state!');
    console.error('   → Restore from backup immediately\n');

    await db.$disconnect();
    process.exit(1);
  }
}

// Execute rollback
rollbackSolutionsToPurpose();
