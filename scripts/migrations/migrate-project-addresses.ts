/**
 * Data Migration Script: Migrate existing Quote addresses to ProjectAddress
 *
 * Feature: 001-delivery-address
 * Created: 2025-11-01
 *
 * Purpose:
 * Migrate existing Quote records with projectCity/projectStreet/projectState/projectPostalCode
 * to new ProjectAddress model without data loss.
 *
 * Strategy:
 * - Read all quotes with any address field populated
 * - Create ProjectAddress record for each quote
 * - Link Quote.projectAddressId to new address
 * - Preserve original fields for rollback capability
 *
 * Usage:
 * pnpm ts-node prisma/migrations-scripts/migrate-project-addresses.ts
 *
 * Rollback:
 * If migration fails, ProjectAddress records can be deleted and Quote.projectAddressId set to null
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateProjectAddresses() {
  try {
    // Step 1: Find all quotes with any address field populated
    const quotesWithAddress = await prisma.quote.findMany({
      where: {
        OR: [
          { projectCity: { not: null } },
          { projectStreet: { not: null } },
          { projectState: { not: null } },
          { projectPostalCode: { not: null } },
        ],
      },
      select: {
        id: true,
        projectCity: true,
        projectStreet: true,
        projectState: true,
        projectPostalCode: true,
      },
    });

    if (quotesWithAddress.length === 0) {
      return;
    }

    // Step 2: Migrate each quote's address
    let migratedCount = 0;
    let _skippedCount = 0;
    const errors: { quoteId: string; error: string }[] = [];

    for (const quote of quotesWithAddress) {
      try {
        // Check if at least one identifier field is present
        const hasIdentifier =
          quote.projectCity || quote.projectStreet || quote.projectState;

        if (!hasIdentifier) {
          _skippedCount++;
          continue;
        }

        // Create ProjectAddress record
        const _projectAddress = await prisma.projectAddress.create({
          data: {
            quoteId: quote.id,
            city: quote.projectCity,
            street: quote.projectStreet,
            region: quote.projectState,
            postalCode: quote.projectPostalCode,
            // Coordinates will be null (geocoding not available for historical data)
            latitude: null,
            longitude: null,
            // Country defaulted to Colombia (can be updated manually if needed)
            country: "Colombia",
          },
        });
        migratedCount++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(
          `❌ Failed to migrate Quote ${quote.id}: ${errorMessage}`
        );
        errors.push({ quoteId: quote.id, error: errorMessage });
      }
    }

    // Step 3: Summary
    console.log("\n📈 Migration Summary:");
    console.log(`   Total quotes with address: ${quotesWithAddress.length}`);
    console.log(`   Successfully migrated: ${migratedCount}`);
    console.log(`   Skipped (no identifiers): ${_skippedCount}`);
    console.log(`   Failed: ${errors.length}`);

    if (errors.length > 0) {
      console.log("\n❌ Errors:");
      for (const { quoteId, error } of errors) {
        console.log(`   Quote ${quoteId}: ${error}`);
      }
    }

    if (migratedCount > 0) {
      console.log("\n✅ Migration completed successfully!");
      console.log(
        "\n📝 Note: Original Quote fields (projectCity, projectStreet, etc.) are preserved for rollback."
      );
      console.log(
        "   You can deprecate and remove them in a future version once data is verified."
      );
    }
  } catch (error) {
    console.error("💥 Fatal migration error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute migration
migrateProjectAddresses()
  .then(() => {
    process.exit(0);
  })
  .catch((_error) => {
    process.exit(1);
  });
