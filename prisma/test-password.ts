/**
 * Password Hash Testing Utility
 * 
 * Purpose: Test Better Auth password hashing implementation.
 * When to use: Verify hashing algorithm works correctly, debug auth issues.
 * Prerequisites: better-auth/crypto must be available.
 * 
 * @ts-nocheck
 */
import { hashPassword } from "better-auth/crypto";

async function test() {
  console.log("Testing Better Auth password hashing...\n");

  const password = "Santa1094++";
  const hash = await hashPassword(password);
  console.log("Hash type:", typeof hash);
  console.log("Hash value:", hash);
}

test();
