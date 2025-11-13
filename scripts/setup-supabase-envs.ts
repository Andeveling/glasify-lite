#!/usr/bin/env tsx
/**
 * Interactive Supabase Multi-Environment Setup
 *
 * This script helps you configure multiple Supabase environments:
 * - Development: Local development (Supabase Cloud)
 * - Staging: Testing/preview environment (Supabase Cloud)
 *
 * Usage:
 *   pnpm supabase:setup-envs
 *
 * What it does:
 * 1. Guides you through creating Supabase projects
 * 2. Collects connection strings for each environment
 * 3. Updates .env.local (dev) and .env.staging (staging)
 * 4. Validates configuration
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Regex patterns defined at top level for performance
const DATABASE_URL_REGEX = /^DATABASE_URL=.*$/m;
const DIRECT_URL_REGEX = /^DIRECT_URL=.*$\n?/m;
const SUPABASE_URL_REGEX = /^NEXT_PUBLIC_SUPABASE_URL=.*$/m;
const SUPABASE_ANON_KEY_REGEX = /^NEXT_PUBLIC_SUPABASE_ANON_KEY=.*$/m;
const DATABASE_COMMENT_REGEX = /# DATABASE \(PostgreSQL.*?\)/;

type EnvironmentConfig = {
  name: string;
  fileName: string;
  databaseUrl: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

async function collectEnvironmentData(
  envName: string
): Promise<EnvironmentConfig> {
  console.log(`\n📝 Configuring ${envName} environment\n`);

  console.log("Follow these steps to get your connection string:");
  console.log("1. Go to https://supabase.com/dashboard");
  console.log(`2. Select your ${envName} project (or create a new one)`);
  console.log("3. Go to Settings → Database");
  console.log("4. Find 'Connection string' section");
  console.log("5. Select 'URI' tab (NOT 'Session mode')");
  console.log("6. Copy the URL and replace [YOUR-PASSWORD]\n");

  const databaseUrl = await rl.question(
    `🔗 Paste Supabase connection string for ${envName}: `
  );

  // Validate URL
  if (!databaseUrl.startsWith("postgresql://postgres.")) {
    throw new Error(
      "Invalid Supabase URL. It should start with 'postgresql://postgres.'"
    );
  }

  if (databaseUrl.includes("[YOUR-PASSWORD]")) {
    throw new Error("Please replace [YOUR-PASSWORD] with your actual password");
  }

  // Optional: Collect Supabase public keys (for auth/storage features)
  const needsSupabaseKeys = await rl.question(
    "\n❓ Do you want to configure Supabase Auth/Storage? (y/N): "
  );

  let supabaseUrl: string | undefined;
  let supabaseAnonKey: string | undefined;

  if (needsSupabaseKeys.toLowerCase() === "y") {
    console.log("\nGet these from: Supabase Dashboard → Settings → API");
    supabaseUrl = await rl.question("📍 Supabase Project URL: ");
    supabaseAnonKey = await rl.question("🔑 Supabase Anon Key: ");
  }

  return {
    name: envName,
    fileName:
      envName.toLowerCase() === "development"
        ? ".env.local"
        : `.env.${envName.toLowerCase()}`,
    databaseUrl,
    supabaseUrl,
    supabaseAnonKey,
  };
}

function updateEnvFile(config: EnvironmentConfig): void {
  const envPath = resolve(process.cwd(), config.fileName);
  let envContent: string;

  // Read existing file or create from template
  if (existsSync(envPath)) {
    envContent = readFileSync(envPath, "utf-8");
  } else {
    const templatePath = resolve(process.cwd(), `${config.fileName}.template`);
    if (existsSync(templatePath)) {
      envContent = readFileSync(templatePath, "utf-8");
    } else {
      throw new Error(`Neither ${config.fileName} nor template exists`);
    }
  }

  // Update DATABASE_URL
  if (DATABASE_URL_REGEX.test(envContent)) {
    envContent = envContent.replace(
      DATABASE_URL_REGEX,
      `DATABASE_URL="${config.databaseUrl}"`
    );
  } else {
    envContent += `\nDATABASE_URL="${config.databaseUrl}"\n`;
  }

  // Remove DIRECT_URL if present (not needed with Supabase)
  if (DIRECT_URL_REGEX.test(envContent)) {
    envContent = envContent.replace(DIRECT_URL_REGEX, "");
  }

  // Update Supabase public keys if provided
  if (config.supabaseUrl) {
    envContent = updateSupabaseUrl(envContent, config.supabaseUrl);
  }

  if (config.supabaseAnonKey) {
    envContent = updateSupabaseAnonKey(envContent, config.supabaseAnonKey);
  }

  // Update comment to mention Supabase
  if (!envContent.includes("Supabase")) {
    envContent = envContent.replace(
      DATABASE_COMMENT_REGEX,
      `# DATABASE (PostgreSQL - Supabase Cloud - ${config.name})`
    );
  }

  writeFileSync(envPath, envContent, "utf-8");
  console.log(`\n✅ Updated ${config.fileName}`);
}

function updateSupabaseUrl(content: string, url: string): string {
  if (SUPABASE_URL_REGEX.test(content)) {
    return content.replace(
      SUPABASE_URL_REGEX,
      `NEXT_PUBLIC_SUPABASE_URL="${url}"`
    );
  }
  return `${content}\nNEXT_PUBLIC_SUPABASE_URL="${url}"\n`;
}

function updateSupabaseAnonKey(content: string, key: string): string {
  if (SUPABASE_ANON_KEY_REGEX.test(content)) {
    return content.replace(
      SUPABASE_ANON_KEY_REGEX,
      `NEXT_PUBLIC_SUPABASE_ANON_KEY="${key}"`
    );
  }
  return `${content}\nNEXT_PUBLIC_SUPABASE_ANON_KEY="${key}"\n`;
}

async function main() {
  console.log("\n🚀 Supabase Multi-Environment Setup\n");
  console.log("This script will help you configure multiple environments:");
  console.log("  • Development (for local development)");
  console.log("  • Staging (for testing/preview)\n");

  const environments: EnvironmentConfig[] = [];

  // Collect Development environment
  const devConfig = await collectEnvironmentData("Development");
  environments.push(devConfig);

  // Ask if they want to configure Staging
  const configureStaging = await rl.question(
    "\n❓ Do you want to configure Staging environment now? (y/N): "
  );

  if (configureStaging.toLowerCase() === "y") {
    const stagingConfig = await collectEnvironmentData("Staging");
    environments.push(stagingConfig);
  }

  // Update env files
  console.log("\n📝 Updating environment files...\n");
  for (const config of environments) {
    try {
      updateEnvFile(config);
    } catch (error) {
      console.error(`❌ Error updating ${config.fileName}:`, error);
    }
  }

  console.log("\n✅ Configuration completed!\n");
  console.log("📋 Next steps:\n");
  console.log("1. Run 'pnpm db:push' to sync schema to Supabase");
  console.log("2. Run 'pnpm db:studio' to open Drizzle Studio");
  console.log("3. Run 'pnpm seed:minimal' to seed initial data");
  console.log("\n💡 To switch environments:");
  console.log("  • Development: pnpm dev (uses .env.local)");
  console.log("  • Staging: NODE_ENV=staging pnpm dev (uses .env.staging)\n");

  rl.close();
}

main().catch((error) => {
  console.error("\n❌ Error:", error);
  process.exit(1);
});
