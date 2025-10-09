#!/usr/bin/env tsx
/**
 * Script to check existing GlassType records with purpose field
 * Used for Phase 7 migration planning
 */

import { db } from '../src/server/db';

type GlassPurposeStats = {
  purpose: string;
  count: number;
  glassTypes: Array<{
    id: string;
    name: string;
    purpose: string;
    hasSolutions: boolean;
    solutionCount: number;
  }>;
};

async function checkGlassPurposeData() {
  console.log('🔍 Checking GlassType purpose field data...\n');

  try {
    // 1. Get all glass types with their solutions
    const glassTypes = await db.glassType.findMany({
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        purpose: true,
        solutions: {
          select: {
            id: true,
            solution: {
              select: {
                key: true,
                nameEs: true,
              },
            },
          },
        },
      },
    });

    console.log(`📊 Total GlassTypes: ${glassTypes.length}\n`);

    // 2. Group by purpose
    const purposeStats: Map<string, GlassPurposeStats> = new Map();

    for (const glass of glassTypes) {
      if (!purposeStats.has(glass.purpose)) {
        purposeStats.set(glass.purpose, {
          count: 0,
          glassTypes: [],
          purpose: glass.purpose,
        });
      }

      const stats = purposeStats.get(glass.purpose);
      if (!stats) continue;

      stats.count++;
      stats.glassTypes.push({
        hasSolutions: glass.solutions.length > 0,
        id: glass.id,
        name: glass.name,
        purpose: glass.purpose,
        solutionCount: glass.solutions.length,
      });
    }

    // 3. Display stats by purpose
    console.log('📈 Distribution by Purpose:\n');
    for (const [purpose, stats] of purposeStats.entries()) {
      console.log(`  ${purpose}: ${stats.count} glasses`);

      const withSolutions = stats.glassTypes.filter((g) => g.hasSolutions).length;
      const withoutSolutions = stats.count - withSolutions;

      console.log(`    ✅ With solutions: ${withSolutions}`);
      console.log(`    ⚠️  Without solutions: ${withoutSolutions}\n`);
    }

    // 4. Identify glasses without solutions
    const glassesWithoutSolutions = glassTypes.filter((g) => g.solutions.length === 0);

    console.log(`\n🚨 Glasses WITHOUT solutions: ${glassesWithoutSolutions.length}\n`);

    if (glassesWithoutSolutions.length > 0) {
      console.log('These glasses need migration from purpose → GlassTypeSolution:\n');
      for (const glass of glassesWithoutSolutions) {
        console.log(`  - ${glass.name} (purpose: ${glass.purpose})`);
      }
      console.log('\n');
    }

    // 5. Migration decision
    console.log('💡 Migration Decision:\n');

    if (glassesWithoutSolutions.length === 0) {
      console.log('  ✅ All glasses have solutions assigned!');
      console.log('  ✅ No data migration needed.');
      console.log('  ✅ Can proceed directly to deprecation (TASK-050).\n');
    } else {
      console.log(`  ⚠️  Found ${glassesWithoutSolutions.length} glasses without solutions.`);
      console.log('  📝 Data migration script needed (TASK-051).');
      console.log('  📝 Fallback logic recommended (TASK-052).\n');
    }

    // 6. Purpose → Solution mapping reference
    console.log('📋 Purpose → Solution Mapping Reference:\n');
    console.log('  general       → general (Solution key)');
    console.log('  insulation    → thermal_insulation (Solution key)');
    console.log('  security      → security (Solution key)');
    console.log('  decorative    → decorative (Solution key)\n');

    await db.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking glass purpose data:', error);
    await db.$disconnect();
    process.exit(1);
  }
}

checkGlassPurposeData();
