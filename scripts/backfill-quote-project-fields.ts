#!/usr/bin/env tsx

/**
 * Backfill Script: Quote Project Fields
 *
 * Purpose: Migrate existing Quote records from legacy contactAddress field
 * to structured project address fields (projectName, projectStreet, etc.)
 *
 * Usage: pnpm tsx scripts/backfill-quote-project-fields.ts [--dry-run]
 *
 * Safety: Run with --dry-run first to preview changes without committing
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const DRY_RUN = process.argv.includes('--dry-run');
const ID_SUFFIX_LENGTH = 8;

function log(message: string, data?: Record<string, unknown>) {
  console.log(message, data ? JSON.stringify(data, null, 2) : '');
}

async function backfillQuoteProjectFields() {
  const startTime = Date.now();

  log('🔍 Starting Quote project fields backfill', {
    dryRun: DRY_RUN,
    timestamp: new Date().toISOString(),
  });

  try {
    // Find all quotes with contactAddress but no projectStreet
    const quotesToUpdate = await db.quote.findMany({
      select: {
        contactAddress: true,
        id: true,
        manufacturerId: true,
        userId: true,
      },
      where: {
        AND: [{ contactAddress: { not: null } }, { projectStreet: null }],
      },
    });

    log(`📊 Found ${quotesToUpdate.length} quotes to backfill`);

    if (quotesToUpdate.length === 0) {
      log('✅ No quotes need backfilling. All done!');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const quote of quotesToUpdate) {
      try {
        // Simple migration: set projectStreet to contactAddress
        // projectName defaults to "Quote #{id}"
        const projectName = `Cotización ${quote.id.slice(-ID_SUFFIX_LENGTH)}`;

        if (DRY_RUN) {
          log(`[DRY RUN] Would update quote ${quote.id}:`, {
            from: { contactAddress: quote.contactAddress },
            to: {
              projectName,
              projectStreet: quote.contactAddress,
            },
          });
        } else {
          await db.quote.update({
            data: {
              projectName,
              projectStreet: quote.contactAddress,
              // Other fields remain null (city, state, postal code)
              // Can be filled manually later if needed
            },
            where: { id: quote.id },
          });

          log(`✓ Updated quote ${quote.id}`);
        }

        successCount++;
      } catch (error) {
        errorCount++;
        log(`✗ Failed to update quote ${quote.id}:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          quoteId: quote.id,
        });
      }
    }

    const duration = Date.now() - startTime;

    log('✅ Backfill completed', {
      dryRun: DRY_RUN,
      durationMs: duration,
      errors: errorCount,
      success: successCount,
      total: quotesToUpdate.length,
    });

    if (DRY_RUN) {
      log('⚠️  This was a DRY RUN. No changes were made to the database.');
      log('💡 Run without --dry-run to apply changes');
    }
  } catch (error) {
    log('❌ Backfill failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run the backfill
backfillQuoteProjectFields()
  .then(() => {
    log('🎉 Script execution completed');
    process.exit(0);
  })
  .catch((error) => {
    log('💥 Script execution failed:', { error });
    process.exit(1);
  });
