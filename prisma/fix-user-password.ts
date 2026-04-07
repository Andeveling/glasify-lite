// @ts-nocheck
/* biome-ignore-all lint/suspicious/noConsole: seed script requires console logging */
import { hashPassword } from "better-auth/crypto";
import { db } from "../src/server/db";

async function fixUserPassword() {
  const email = "andeveling@gmail.com";
  const password = "Santa1094++";

  console.log("\n🔐 Fixing user password...\n");

  const user = await db.user.findUnique({ where: { email } });

  if (!user) {
    console.log("❌ User not found:", email);
    process.exit(1);
  }

  console.log("User:", user.email, "| Role:", user.role);

  // Hash the password
  const hashedPassword = await hashPassword(password);
  console.log("Hash generated:", hashedPassword.substring(0, 20) + "...");

  // Check existing accounts
  const accounts = await db.account.findMany({ where: { userId: user.id } });
  console.log("Existing accounts:", accounts.length);
  for (const a of accounts) {
    console.log("  -", a.providerId, "| password:", a.password ? "SET" : "NULL");
  }

  // Find or create email/password account
  let account = accounts.find((a) => a.providerId === "credential");

  if (account) {
    // Update existing credential account
    await db.account.update({
      where: { id: account.id },
      data: { password: hashedPassword },
    });
    console.log("✅ Updated existing credential account with password hash");
  } else {
    // Create new credential account
    await db.account.create({
      data: {
        userId: user.id,
        providerId: "credential",
        accountId: email, // unique identifier for the account
        password: hashedPassword,
      },
    });
    console.log("✅ Created new credential account with password hash");
  }

  console.log("\n✨ Password set! You can now sign in with:");
  console.log("   Email:", email);
  console.log("   Password:", password);

  await db.$disconnect();
}

fixUserPassword();
