// @ts-nocheck
import { db } from "../src/server/db";

async function check() {
  const user = await db.user.findUnique({
    where: { email: "andeveling@gmail.com" },
  });

  if (user) {
    console.log("User ID:", user.id);
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Email verified:", user.emailVerified);

    const accounts = await db.account.findMany({ where: { userId: user.id } });
    console.log("Accounts:", accounts.length);
    for (const a of accounts) {
      console.log(
        `  - provider: ${a.providerId}, password: ${a.password ? "SET" : "NULL"}, accountId: ${a.accountId}`
      );
    }
  } else {
    console.log("User not found");
  }

  await db.$disconnect();
}

check();
