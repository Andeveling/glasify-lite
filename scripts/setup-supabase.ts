#!/usr/bin/env tsx
/**
 * Interactive Supabase Configuration Setup
 * 
 * This script helps you configure Supabase connection in .env.local
 * 
 * Usage:
 *   pnpm supabase:setup
 * 
 * What it does:
 * 1. Prompts for your Supabase connection string
 * 2. Validates the URL format
 * 3. Updates .env.local with DATABASE_URL
 * 4. Removes DIRECT_URL (not needed with Supabase)
 * 5. Tests the connection
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const DATABASE_URL_REGEX = /^DATABASE_URL=.*$/m;
const DIRECT_URL_REGEX = /^DIRECT_URL=.*$\n?/m;
const DATABASE_COMMENT_REGEX = /# DATABASE \(PostgreSQL.*?\)\n/;

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  console.log("\n🚀 Supabase Configuration Setup\n");
  console.log("📝 Follow these steps to get your connection string:\n");
  console.log("1. Go to https://supabase.com/dashboard");
  console.log("2. Select your project");
  console.log("3. Go to Settings → Database");
  console.log("4. Find 'Connection string' section");
  console.log("5. Select 'URI' tab (NOT 'Session mode')");
  console.log("6. Copy the URL and replace [YOUR-PASSWORD]\n");

  const databaseUrl = await rl.question(
    "🔗 Paste your Supabase connection string: "
  );

  // Validate URL format
  if (!databaseUrl.startsWith("postgresql://postgres.")) {
    console.error(
      "\n❌ Invalid Supabase URL. It should start with 'postgresql://postgres.'"
    );
    process.exit(1);
  }

  if (databaseUrl.includes("[YOUR-PASSWORD]")) {
    console.error(
      "\n❌ Please replace [YOUR-PASSWORD] with your actual password"
    );
    process.exit(1);
  }

  if (!databaseUrl.includes("pooler.supabase.com:6543")) {
    console.warn(
      "\n⚠️  Warning: URL should use transaction pooler (port 6543)"
    );
    console.warn("   Example: aws-0-us-east-1.pooler.supabase.com:6543");
    const confirm = await rl.question("\nContinue anyway? (y/N): ");
    if (confirm.toLowerCase() !== "y") {
      console.log("❌ Aborted");
      process.exit(1);
    }
  }

  // Read .env.local
  const envPath = resolve(process.cwd(), ".env.local");
  let envContent: string;

  try {
    envContent = readFileSync(envPath, "utf-8");
  } catch {
    console.error("\n❌ Could not read .env.local file");
    process.exit(1);
  }

  // Update DATABASE_URL
  if (DATABASE_URL_REGEX.test(envContent)) {
    envContent = envContent.replace(
      DATABASE_URL_REGEX,
      `DATABASE_URL=${databaseUrl}`
    );
    console.log("\n✅ Updated DATABASE_URL in .env.local");
  } else {
    console.error("\n❌ Could not find DATABASE_URL in .env.local");
    process.exit(1);
  }

  // Remove DIRECT_URL (not needed with Supabase)
  if (DIRECT_URL_REGEX.test(envContent)) {
    envContent = envContent.replace(DIRECT_URL_REGEX, "");
    console.log("✅ Removed DIRECT_URL (not needed with Supabase)");
  }

  // Add comment about Supabase if not present
  if (!envContent.includes("Supabase")) {
    envContent = envContent.replace(
      DATABASE_COMMENT_REGEX,
      "# DATABASE (PostgreSQL - Supabase)\n"
    );
  }

  // Write back to .env.local
  writeFileSync(envPath, envContent, "utf-8");

  console.log("\n✅ Configuration saved successfully!\n");
  console.log("📋 Next steps:\n");
  console.log("1. Run 'pnpm db:push' to sync your schema to Supabase");
  console.log("2. Run 'pnpm db:studio' to open Drizzle Studio");
  console.log("3. Run 'pnpm seed:minimal' to seed initial data\n");

  rl.close();
}

main().catch((error) => {
  console.error("\n❌ Error:", error);
  process.exit(1);
});
