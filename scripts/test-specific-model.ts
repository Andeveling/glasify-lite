/**
 * Test specific model by ID
 */

import { getModelById } from "@/server/api/routers/catalog/catalog.service";
import { db } from "@/server/db/drizzle";

async function testModel() {
  const modelId = "30defbcc-dd48-4cb8-80a1-4052ef5c9c35"; // Puerta Corrediza Doble

  console.log(`🧪 Testing model: ${modelId}\n`);

  try {
    const model = await getModelById(db, modelId);
    console.log("✅ Model found:");
    console.log(JSON.stringify(model, null, 2));
  } catch (error) {
    console.error("❌ Error:", error);

    // Try direct query
    console.log("\n🔍 Trying direct database query...");
    const { models } = await import("@/server/db/schema");
    const { eq } = await import("drizzle-orm");

    const directResult = await db
      .select()
      .from(models)
      .where(eq(models.id, modelId))
      .limit(1);

    console.log("Direct query result:", JSON.stringify(directResult, null, 2));
  }

  process.exit(0);
}

testModel().catch(console.error);
