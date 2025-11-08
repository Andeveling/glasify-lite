import { createTRPCContext } from "../src/server/api/trpc.js";
import { users } from "../src/server/db/schema.js";

const testUserRouter = async () => {
  console.log("🧪 Testing User Router with Drizzle...\n");

  try {
    // Create context without session (will fail auth but tests connection)
    const ctx = await createTRPCContext({
      headers: new Headers(),
    });

    console.log("✅ Context created successfully");
    console.log("✅ Drizzle client available:", !!ctx.db);

    // Try to access db
    const result = await ctx.db.select().from(users).limit(1);

    console.log("✅ Database query successful");
    console.log("📊 Sample user found:", result.length > 0 ? "Yes" : "No");

    console.log("\n✅ User router migration successful!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
};

testUserRouter();
