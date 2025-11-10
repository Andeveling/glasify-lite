/**
 * Diagnose models in database
 */

import { db } from "@/server/db/drizzle";
import { models } from "@/server/db/schemas/model.schema";
import { profileSuppliers } from "@/server/db/schemas/profile-supplier.schema";

async function diagnoseModels() {
  console.log("🔍 Diagnosing models in database...\n");

  try {
    // 1. Check all models
    const allModels = await db
      .select({
        id: models.id,
        name: models.name,
        status: models.status,
        profileSupplierId: models.profileSupplierId,
      })
      .from(models);

    console.log(`Total models in database: ${allModels.length}\n`);

    if (allModels.length === 0) {
      console.log("❌ No models found in database!");
      process.exit(1);
    }

    // 2. Show details
    for (const model of allModels) {
      console.log(`📋 ${model.name}`);
      console.log(`   ID: ${model.id}`);
      console.log(`   Status: ${model.status}`);
      console.log(`   ProfileSupplierId: ${model.profileSupplierId ?? "NULL"}`);
      console.log("");
    }

    // 3. Check published models
    const publishedCount = allModels.filter(
      (m) => m.status === "published"
    ).length;
    console.log(`✅ Published models: ${publishedCount}/${allModels.length}`);

    // 4. Check models with profileSupplierId
    const withSupplier = allModels.filter(
      (m) => m.profileSupplierId !== null
    ).length;
    console.log(
      `✅ Models with ProfileSupplier: ${withSupplier}/${allModels.length}`
    );

    // 5. Check if profileSuppliers exist
    const suppliers = await db.select().from(profileSuppliers);
    console.log(`\n📦 Total ProfileSuppliers: ${suppliers.length}`);

    if (suppliers.length > 0) {
      console.log("\nAvailable ProfileSuppliers:");
      for (const supplier of suppliers) {
        console.log(`   - ${supplier.name} (${supplier.id})`);
      }
    }

    // 6. Check catalog-ready models (published + has supplier)
    const catalogReady = allModels.filter(
      (m) => m.status === "published" && m.profileSupplierId !== null
    ).length;

    console.log(
      `\n🎯 Catalog-ready models: ${catalogReady}/${allModels.length}`
    );

    if (catalogReady === 0) {
      console.log("\n⚠️  WARNING: No models are ready for catalog!");
      console.log("   Models need:");
      console.log("   - status = 'published'");
      console.log("   - profileSupplierId != NULL");
    } else {
      console.log("\n✅ Models are ready for catalog!");
    }
  } catch (error) {
    console.error("❌ Error diagnosing models:", error);
    process.exit(1);
  }

  process.exit(0);
}

void diagnoseModels();
