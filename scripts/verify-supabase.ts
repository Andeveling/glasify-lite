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
const PREVIEW_LEN = 80;

type Mode = "transaction" | "session" | "direct" | "unknown";

function detectMode(url: URL): { mode: Mode; details: string } {
  const host = url.hostname;
  const port = url.port;
  const user = url.username;

  if (
    host.startsWith("db.") &&
    host.endsWith(".supabase.co") &&
    port === "6543" &&
    user === "postgres"
  ) {
    return {
      mode: "transaction",
      details: `user=${user} host=${host} port=${port}`,
    };
  }
  if (
    host.includes("pooler.supabase.com") &&
    port === "5432" &&
    user.includes("postgres.")
  ) {
    return {
      mode: "session",
      details: `user=${user} host=${host} port=${port}`,
    };
  }
  if (
    host.startsWith("db.") &&
    host.endsWith(".supabase.co") &&
    port === "5432" &&
    user === "postgres"
  ) {
    return {
      mode: "direct",
      details: `user=${user} host=${host} port=${port}`,
    };
  }
  return { mode: "unknown", details: `user=${user} host=${host} port=${port}` };
}

function validateScheme(url: URL) {
  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    console.error("❌ URL must start with postgresql:// or postgres://");
    console.log(`   Found: ${url.protocol}//`);
    process.exit(1);
  }
}

function printMode(mode: Mode, details: string) {
  switch (mode) {
    case "transaction":
      console.log("✅ Using Transaction Pooler (recommended for Drizzle)");
      break;
    case "session":
      console.log("✅ Using Session Pooler (IPv4 proxy)");
      console.log(
        "   Tip: For serverless/short-lived tasks prefer Transaction mode on port 6543"
      );
      break;
    case "direct":
      console.log("✅ Using Direct Connection (IPv6)");
      console.log(
        "   Tip: Prefer Transaction Pooler (6543) for Drizzle Kit and broader compatibility"
      );
      break;
    default:
      console.warn("⚠️  Unrecognized Supabase connection format");
      console.log(`   ${details}`);
      console.log("   Refer to: Dashboard → Connect to copy an official URI");
  }
}

function recommendMode(mode: Mode) {
  if (mode !== "transaction") {
    console.warn("⚠️  Warning: Not using Transaction Pooler (port 6543)");
    console.log(
      "   Drizzle recommends Transaction mode for migrations and serverless"
    );
  }
}

async function testConnection(url: string) {
  console.log("\n📡 Testing database connection...");
  let client: ReturnType<typeof postgres> | null = null;
  try {
    client = postgres(url, {
      prepare: false,
      max: 1,
      connect_timeout: 10,
    });

    const result = await client`SELECT version(), current_database()`;
    if (!(result.length > 0 && result[0])) {
      return;
    }

    console.log("\n✅ Connection successful!\n");
    console.log("📊 Database Info:");
    console.log(
      `   PostgreSQL: ${result[0].version?.split(" ")[1] ?? "unknown"}`
    );
    console.log(`   Database: ${result[0].current_database ?? "unknown"}`);

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
  } finally {
    if (client) {
      await client.end();
    }
  }
}

function getUrlOrExit(): { url: URL; raw: string } {
  // Check DATABASE_URL exists
  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in .env.local");
    console.log("\n💡 Run: pnpm supabase:setup-envs");
    process.exit(1);
  }

  // Parse URL and validate format
  try {
    return { url: new URL(DATABASE_URL), raw: DATABASE_URL };
  } catch {
    console.error("❌ DATABASE_URL is not a valid URL");
    console.log(`   Found: ${DATABASE_URL.substring(0, PREVIEW_LEN)}...`);
    process.exit(1);
  }
}

async function main() {
  console.log("\n🔍 Verifying Supabase Configuration\n");

  const { url, raw } = getUrlOrExit();
  console.log("✅ DATABASE_URL found");

  validateScheme(url);

  const { mode, details } = detectMode(url);
  printMode(mode, details);

  // Recommend Transaction Pooler
  recommendMode(mode);

  // Check for password placeholder
  if (raw.includes("[YOUR-PASSWORD]")) {
    console.error("❌ Password placeholder not replaced");
    console.log("   Replace [YOUR-PASSWORD] with your actual password");
    process.exit(1);
  }

  console.log("✅ Password is set");

  try {
    await testConnection(raw);
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
  }
}

main().catch((error) => {
  console.error("\n❌ Unexpected error:", error);
  process.exit(1);
});
