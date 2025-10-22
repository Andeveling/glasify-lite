#!/usr/bin/env tsx
/** biome-ignore-all lint/suspicious/noConsole: migration script requires console logging */
/**
 * Clean Slate Migration Script
 *
 * Executes the static glass taxonomy migration with clean slate approach:
 * 1. Applies database migration (removes deprecated fields)
 * 2. Seeds glass characteristics (15 standard characteristics)
 * 3. Seeds glass solutions (6 standard solutions)
 * 4. Seeds glass types (30 Tecnoglass types)
 *
 * ⚠️ WARNING: This migration will DELETE all existing GlassType data
 *
 * Usage:
 *   pnpm tsx scripts/migrate-static-glass-taxonomy.ts
 *
 * Related:
 *   - Migration: prisma/migrations/20251022112016_remove_deprecated_glass_fields
 *   - Spec: specs/015-static-glass-taxonomy/
 *   - Task: TK-015-019
 */

import { execSync } from 'node:child_process';
import process from 'node:process';
import { seedGlassCharacteristicsFromFile } from '../prisma/factories/glass-characteristic.factory';
import { seedGlassSolutionsFromFile } from '../prisma/factories/glass-solution.factory';
import { seedGlassTypesFromFile } from '../prisma/factories/glass-type.factory';

interface MigrationStats {
  characteristics: { seeded: number; skipped: number; errors: number };
  solutions: { seeded: number; skipped: number; errors: number };
  glassTypes: { seeded: number; skipped: number; errors: number };
  durationMs: number;
}

// Display constants
const SECTION_SEPARATOR_LENGTH = 70;
const MS_TO_SECONDS = 1000;
const DURATION_DECIMAL_PLACES = 2;

class MigrationLogger {
  info(message: string): void {
    console.log(`ℹ️  ${message}`);
  }

  success(message: string): void {
    console.log(`✅ ${message}`);
  }

  error(message: string, error?: unknown): void {
    console.error(`❌ ${message}`);
    if (error) {
      console.error(error);
    }
  }

  warn(message: string): void {
    console.warn(`⚠️  ${message}`);
  }

  section(title: string): void {
    console.log(`\n${'='.repeat(SECTION_SEPARATOR_LENGTH)}`);
    console.log(`  ${title}`);
    console.log(`${'='.repeat(SECTION_SEPARATOR_LENGTH)}`);
  }
}

async function runMigration(): Promise<MigrationStats> {
  const logger = new MigrationLogger();
  const stats: MigrationStats = {
    characteristics: { errors: 0, seeded: 0, skipped: 0 },
    durationMs: 0,
    glassTypes: { errors: 0, seeded: 0, skipped: 0 },
    solutions: { errors: 0, seeded: 0, skipped: 0 },
  };
  const startTime = Date.now();

  try {
    logger.section('Static Glass Taxonomy Migration - Clean Slate Approach');

    // Confirmation prompt
    logger.warn('This migration will:');
    logger.warn('  1. Remove deprecated fields from GlassType model');
    logger.warn('  2. Delete ALL existing GlassType records');
    logger.warn('  3. Delete GlassTypePriceHistory table and data');
    logger.warn('  4. Seed 15 glass characteristics');
    logger.warn('  5. Seed 6 glass solutions');
    logger.warn('  6. Seed 30 Tecnoglass glass types');
    logger.warn('');
    logger.warn('⚠️  EXISTING DATA WILL BE LOST - This is a breaking change!');
    logger.warn('');

    // In production, we'd ask for confirmation here
    // For now, we just log the warning and proceed

    // Step 1: Apply database migration
    logger.section('Step 1/4: Applying Database Migration');
    logger.info('Running: pnpm prisma migrate deploy');

    try {
      execSync('pnpm prisma migrate deploy', {
        cwd: process.cwd(),
        encoding: 'utf-8',
        stdio: 'inherit',
      });
      logger.success('Migration applied successfully');
    } catch (error) {
      logger.error('Failed to apply migration', error);
      throw error;
    }

    // Step 2: Seed glass characteristics
    logger.section('Step 2/4: Seeding Glass Characteristics');
    logger.info('Loading: prisma/data/glass-characteristics.json');

    const charResult = await seedGlassCharacteristicsFromFile('glass-characteristics.json');
    stats.characteristics.seeded = charResult.seeded;
    stats.characteristics.skipped = charResult.skipped;
    stats.characteristics.errors = charResult.errors.length;

    logger.success(`Seeded: ${charResult.seeded} characteristics`);
    logger.info(`Skipped: ${charResult.skipped} (already up-to-date)`);

    if (charResult.errors.length > 0) {
      logger.error(`Errors: ${charResult.errors.length}`);
      for (const error of charResult.errors) {
        logger.error(`  - ${error.message}`);
      }
      throw new Error('Characteristic seeding failed');
    }

    // Step 3: Seed glass solutions
    logger.section('Step 3/4: Seeding Glass Solutions');
    logger.info('Loading: prisma/data/glass-solutions.json');

    const solResult = await seedGlassSolutionsFromFile('glass-solutions.json');
    stats.solutions.seeded = solResult.seeded;
    stats.solutions.skipped = solResult.skipped;
    stats.solutions.errors = solResult.errors.length;

    logger.success(`Seeded: ${solResult.seeded} solutions`);
    logger.info(`Skipped: ${solResult.skipped} (already up-to-date)`);

    if (solResult.errors.length > 0) {
      logger.error(`Errors: ${solResult.errors.length}`);
      for (const error of solResult.errors) {
        logger.error(`  - ${error.message}`);
      }
      throw new Error('Solution seeding failed');
    }

    // Step 4: Seed glass types
    logger.section('Step 4/4: Seeding Glass Types');
    logger.info('Loading: prisma/data/glass-types-tecnoglass.json');

    const typeResult = await seedGlassTypesFromFile('glass-types-tecnoglass.json');
    stats.glassTypes.seeded = typeResult.seeded;
    stats.glassTypes.skipped = typeResult.skipped;
    stats.glassTypes.errors = typeResult.errors.length;

    logger.success(`Seeded: ${typeResult.seeded} glass types`);
    logger.info(`Skipped: ${typeResult.skipped} (already up-to-date)`);

    if (typeResult.errors.length > 0) {
      logger.error(`Errors: ${typeResult.errors.length}`);
      for (const error of typeResult.errors) {
        logger.error(`  - ${error.message}`);
      }
      throw new Error('Glass type seeding failed');
    }

    // Calculate duration
    stats.durationMs = Date.now() - startTime;

    // Summary
    logger.section('Migration Summary');
    logger.success(
      `Glass Characteristics: ${stats.characteristics.seeded} seeded, ${stats.characteristics.skipped} skipped`
    );
    logger.success(`Glass Solutions: ${stats.solutions.seeded} seeded, ${stats.solutions.skipped} skipped`);
    logger.success(`Glass Types: ${stats.glassTypes.seeded} seeded, ${stats.glassTypes.skipped} skipped`);
    logger.info(`Total Duration: ${(stats.durationMs / MS_TO_SECONDS).toFixed(DURATION_DECIMAL_PLACES)}s`);
    logger.success('✨ Migration completed successfully!');

    return stats;
  } catch (error) {
    logger.error('Migration failed', error);
    throw error;
  }
}

// Execute migration
runMigration()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
