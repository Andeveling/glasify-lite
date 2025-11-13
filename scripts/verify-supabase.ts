#!/usr/bin/env tsx
/**
 * Verify Supabase Configuration
 *
 * This script verifies that Supabase is correctly configured
 * and can connect to the database.
 *
 * Usage:
 *   pnpm supabase:verify
 */

import { config } from "dotenv";
import postgres from "postgres";

// Load environment variables
config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  console.log("\n🔍 Verifying Supabase Configuration\n");

  // Check DATABASE_URL exists
  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in .env.local");
    console.log("\n💡 Run: pnpm supabase:setup-envs");
    process.exit(1);
  }

  console.log("✅ DATABASE_URL found");

  // Check URL format
  if (!DATABASE_URL.startsWith("postgresql://postgres.")) {
    console.error("❌ Invalid Supabase URL format");
    console.log("   Expected: postgresql://postgres.[PROJECT-REF]...");
    console.log(`   Found: ${DATABASE_URL.substring(0, 50)}...`);
    process.exit(1);
  }

  console.log("✅ URL format is correct");

  // Check for transaction pooler (port 6543)
  if (DATABASE_URL.includes("pooler.supabase.com:6543")) {
    console.log("✅ Using transaction pooler (port 6543)");
  } else {
    console.warn(
      "⚠️  Warning: Not using transaction pooler (recommended port 6543)"
    );
    console.log(
      "   Current URL may use session mode which is slower with Drizzle"
    );
  }

  // Check for password placeholder
  if (DATABASE_URL.includes("[YOUR-PASSWORD]")) {
    console.error("❌ Password placeholder not replaced");
    console.log("   Replace [YOUR-PASSWORD] with your actual password");
    process.exit(1);
  }

  console.log("✅ Password is set");

  // Test database connection
  console.log("\n📡 Testing database connection...");

  let client: ReturnType<typeof postgres> | null = null;

  try {
    client = postgres(DATABASE_URL, {
      prepare: false,
      max: 1,
      connect_timeout: 10,
    });

    // Test query
    const result = await client`SELECT version(), current_database()`;

    if (result.length > 0 && result[0]) {
      console.log("\n✅ Connection successful!\n");
      console.log("📊 Database Info:");
      console.log(
        `   PostgreSQL: ${result[0].version?.split(" ")[1] ?? "unknown"}`
      );
      console.log(`   Database: ${result[0].current_database ?? "unknown"}`);

      // Test schema access
      const tables = await client`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;

      console.log(`\n📋 Tables found: ${tables.length}`);
      if (tables.length > 0) {
        console.log("\n   Tables:");
        for (const table of tables.slice(0, 10)) {
          console.log(`   - ${table.table_name}`);
        }
        if (tables.length > 10) {
          console.log(`   ... and ${tables.length - 10} more`);
        }
      } else {
        console.log("\n⚠️  No tables found. Run 'pnpm db:push' to sync schema.");
      }

      console.log("\n✅ Supabase is correctly configured!\n");
      console.log("📋 Next steps:");
      console.log("   1. Run 'pnpm db:push' to sync your schema");
      console.log("   2. Run 'pnpm db:studio' to open Drizzle Studio");
      console.log("   3. Run 'pnpm seed:minimal' to seed initial data\n");
    }
  } catch (error) {
    console.error("\n❌ Connection failed\n");

    if (error instanceof Error) {
      console.error(`Error: ${error.message}\n`);

      // Specific error messages
      if (error.message.includes("password")) {
        console.log("💡 Check that your password is correct");
        console.log("   Get it from: Supabase Dashboard → Settings → Database");
      } else if (error.message.includes("timeout")) {
        console.log("💡 Connection timeout");
        console.log("   1. Check your internet connection");
        console.log("   2. Verify the URL is correct");
        console.log("   3. Check if Supabase project is active");
      } else if (error.message.includes("SSL")) {
        console.log("💡 SSL connection issue");
        console.log("   Supabase requires SSL by default");
      } else {
        console.log("💡 Troubleshooting:");
        console.log("   1. Verify DATABASE_URL in .env.local");
        console.log("   2. Check Supabase Dashboard → Settings → Database");
        console.log(
          "   3. Ensure project is not paused (free tier limitation)"
        );
      }
    }

    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

main().catch((error) => {
  console.error("\n❌ Unexpected error:", error);
  process.exit(1);
});
