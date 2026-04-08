#!/usr/bin/env tsx
/**
 * Seed Admin User Script
 *
 * Creates an admin user with email+password authentication.
 * Run: pnpm seed:admin
 *
 * Usage:
 *   pnpm seed:admin                              # Uses defaults
 *   pnpm seed:admin --email=tu@email.com --name="Tu Nombre"
 *
 * @module prisma/seed-admin.ts
 */
// @ts-nocheck

/* biome-ignore-all lint/suspicious/noConsole: seed script requires console logging */

import { parseArgs } from "node:util";
import { authClient } from "../src/lib/auth-client";
import { db } from "../src/server/db";

type SeedAdminOptions = {
  email: string;
  name: string;
  password: string;
};

/**
 * Parse command-line arguments
 */
function parseCliArgs(): SeedAdminOptions {
  const { values } = parseArgs({
    options: {
      email: {
        default: "andeveling@gmail.com",
        type: "string",
      },
      name: {
        default: "Andres",
        type: "string",
      },
      password: {
        default: "Santa1094++",
        type: "string",
      },
    },
    strict: true,
  });

  return {
    email: values.email ?? "andeveling@gmail.com",
    name: values.name ?? "Andres",
    password: values.password ?? "Santa1094++",
  };
}

/**
 * Create admin user with email+password
 */
async function seedAdminUser(options: SeedAdminOptions) {
  console.log("\n🔐 Seeding admin user...");
  console.log(`   Email: ${options.email}`);
  console.log(`   Name: ${options.name}`);
  console.log(`   ⚠️  Password: ${options.password.replace(/./g, "*")}`);

  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: options.email },
    });

    if (existingUser) {
      // Update role to admin if not already
      if (existingUser.role !== "admin") {
        await db.user.update({
          where: { id: existingUser.id },
          data: { role: "admin", name: options.name },
        });
        console.log(`✅ Updated existing user to admin: ${existingUser.email}`);
      } else {
        console.log(
          `ℹ️  User already exists and is admin: ${existingUser.email}`
        );
      }
    } else {
      // Create new user with email+password via Better Auth
      // Cast to any to bypass TypeScript strictness for internal API
      type SignUpEmailFn = (opts: {
        email: string;
        password: string;
        name: string;
      }) => Promise<{ error: { message: string } | null }>;

      const signUpEmail = authClient.signUp.email as SignUpEmailFn;
      const { error } = await signUpEmail({
        email: options.email,
        password: options.password,
        name: options.name,
      });

      if (error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }

      // Fetch the newly created user
      const newUser = await db.user.findUnique({
        where: { email: options.email },
      });

      if (!newUser) {
        throw new Error("User was created but not found in database");
      }

      // Update role to admin
      await db.user.update({
        where: { id: newUser.id },
        data: { role: "admin" },
      });

      console.log(`✅ Created admin user: ${options.email}`);
      console.log(`   User ID: ${newUser.id}`);
    }

    console.log("\n✨ Admin user ready!");
    console.log("   Login at /sign-in with email+password");
  } catch (error) {
    console.error("\n❌ Failed to seed admin user:");
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

// Run
const options = parseCliArgs();
seedAdminUser(options);
