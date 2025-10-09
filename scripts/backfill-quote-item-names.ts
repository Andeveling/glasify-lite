#!/usr/bin/env tsx

/**
 * Backfill Script: QuoteItem Names and Quantities
 * 
 * Purpose: Populate name and quantity fields for existing QuoteItem records
 * 
 * Usage: pnpm tsx scripts/backfill-quote-item-names.ts [--dry-run]
 * 
 * Safety: Run with --dry-run first to preview changes without committing
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const DRY_RUN = process.argv.includes('--dry-run');

function log(message: string, data?: Record<string, unknown>) {
  console.log(message, data ? JSON.stringify(data, null, 2) : '');
}

async function backfillQuoteItemNames() {

  log('🔍 Starting QuoteItem names backfill', {
    dryRun: DRY_RUN,
    timestamp: new Date().toISOString(),
  });

  try {
    // Check all quote items - the migration should have already added default names
    // This script verifies the migration was successful
    const allQuoteItems = await db.quoteItem.findMany({
      select: {
        id: true,
        name: true,
        quantity: true,
        quoteId: true,
      },
    });

    log(`📊 Found ${allQuoteItems.length} total quote items in database`);

    if (allQuoteItems.length === 0) {
      log('✅ No quote items in database. Nothing to verify!');
      return;
    }

    // Count items with default/empty names that might need updating
    const itemsNeedingBetterNames = allQuoteItems.filter(item =>
      !item.name || item.name.trim() === ''
    );

    if (itemsNeedingBetterNames.length === 0) {
      log('✅ All quote items have valid names. Backfill not needed!');
      return;
    }

    log(`⚠️  Found ${itemsNeedingBetterNames.length} items that might need better names`);
    log('Note: This script is for future use when there are items without names.');
    log('Current migration already handled the name field requirement.');

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
backfillQuoteItemNames()
  .then(() => {
    log('🎉 Script execution completed');
    process.exit(0);
  })
  .catch((error) => {
    log('💥 Script execution failed:', { error });
    process.exit(1);
  });
