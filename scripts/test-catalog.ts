/**
 * Test catalog procedures
 */

import {
  getModelById,
  getModelsList,
} from "@/server/api/routers/catalog/catalog.service";
import { db } from "@/server/db/drizzle";

async function testCatalog() {
  console.log("🧪 Testing catalog procedures...\n");

  try {
    // 1. Test list-models
    console.log("1️⃣ Testing list-models...");
    const modelsList = await getModelsList(db, {
      limit: 20,
      page: 1,
      sort: "name-asc",
    });

    console.log(
      `   ✅ Found ${modelsList.items.length} models (total: ${modelsList.total})\n`
    );

    if (modelsList.items.length > 0) {
      const firstModel = modelsList.items[0];
      if (!firstModel) {
        console.log("⚠️  First model is undefined");
        process.exit(1);
      }

      console.log(`   First model: ${firstModel.name}`);
      console.log(`   ID: ${firstModel.id}\n`);

      // 2. Test get-model-by-id with first model
      console.log(`2️⃣ Testing get-model-by-id with ID: ${firstModel.id}...`);
      const modelDetail = await getModelById(db, firstModel.id);

      console.log(`   ✅ Model found: ${modelDetail.name}`);
      console.log(`   Status: ${modelDetail.status}`);
      console.log(`   ProfileSupplier: ${modelDetail.profileSupplier?.name}`);
      console.log(`   Base Price: ${modelDetail.basePrice}`);
      console.log(
        `   Min/Max Width: ${modelDetail.minWidthMm} - ${modelDetail.maxWidthMm} mm`
      );
      console.log(
        `   Min/Max Height: ${modelDetail.minHeightMm} - ${modelDetail.maxHeightMm} mm\n`
      );

      console.log("✅ All catalog procedures working correctly!");
      console.log("\nTo test in browser, visit:");
      console.log("   http://localhost:3000/catalog");
      console.log(`   http://localhost:3000/catalog/${firstModel.id}`);
    } else {
      console.log("⚠️  No models found in list");
    }
  } catch (error) {
    console.error("❌ Error testing catalog:", error);
    process.exit(1);
  }

  process.exit(0);
}

testCatalog().catch(console.error);
