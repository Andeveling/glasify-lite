/**
 * Fix models: Update status to "published" and assign profileSupplierId
 */

import { eq } from "drizzle-orm";
import { db } from "@/server/db/drizzle";
import { models } from "@/server/db/schemas/model.schema";
import { profileSuppliers } from "@/server/db/schemas/profile-supplier.schema";

async function fixModels() {
  console.log("🔧 Fixing models...\n");

  try {
    // 1. Get first available ProfileSupplier
    const suppliers = await db
      .select({ id: profileSuppliers.id, name: profileSuppliers.name })
      .from(profileSuppliers)
      .limit(1);

    if (suppliers.length === 0) {
      console.error("❌ No ProfileSuppliers found. Run seeders first.");
      process.exit(1);
    }

    const supplierId = suppliers[0]!.id;
    console.log(
      `✓ Using ProfileSupplier: ${suppliers[0]!.name} (${supplierId})\n`
    );

    // 2. Get all models with draft status
    const draftModels = await db
      .select({ id: models.id, name: models.name })
      .from(models)
      .where(eq(models.status, "draft"));

    console.log(`Found ${draftModels.length} draft models\n`);

    // 3. Update each model
    for (const model of draftModels) {
      await db
        .update(models)
        .set({
          status: "published",
          profileSupplierId: supplierId,
        })
        .where(eq(models.id, model.id));

      console.log(`✓ Fixed: ${model.name}`);
    }

    console.log(`\n✅ Fixed ${draftModels.length} models!`);
    console.log("   - Status changed to 'published'");
    console.log(`   - ProfileSupplierId set to: ${supplierId}`);
  } catch (error) {
    console.error("❌ Error fixing models:", error);
    process.exit(1);
  }

  process.exit(0);
}

void fixModels();
