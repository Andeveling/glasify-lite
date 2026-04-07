// @ts-nocheck
import { hashPassword } from "better-auth/crypto";

async function test() {
  console.log("Testing Better Auth password hashing...\n");

  const password = "Santa1094++";
  const hash = await hashPassword(password);
  console.log("Hash type:", typeof hash);
  console.log("Hash value:", hash);
}

test();
