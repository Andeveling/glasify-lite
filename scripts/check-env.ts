#!/usr/bin/env tsx
/**
 * Environment Variables Checker
 * 
 * Verifies that all required environment variables are set.
 * Useful for debugging Vercel deployments.
 */

const requiredVars = [
  'DATABASE_URL',
  'DIRECT_URL',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'NEXT_PUBLIC_TENANT_BUSINESS_NAME',
  'NEXT_PUBLIC_TENANT_CURRENCY',
  'NEXT_PUBLIC_TENANT_LOCALE',
  'NEXT_PUBLIC_TENANT_QUOTE_VALIDITY_DAYS',
  'NEXT_PUBLIC_TENANT_TIMEZONE',
];

const PREVIEW_MAX_LENGTH = 50;
const missingVars: string[] = [];
const presentVars: string[] = [];

for (const varName of requiredVars) {
  if (process.env[varName]) {
    presentVars.push(varName);
  } else {
    missingVars.push(varName);
  }
}

console.log('🔍 Environment Variables Check\n');

if (presentVars.length > 0) {
  console.log('✅ Present variables:');
  for (const varName of presentVars) {
    const value = process.env[varName];
    const masked = varName.includes('SECRET') 
      ? '***' 
      : value?.substring(0, PREVIEW_MAX_LENGTH) + (value && value.length > PREVIEW_MAX_LENGTH ? '...' : '');
    console.log(`  ${varName}=${masked}`);
  }
  console.log('');
}

if (missingVars.length > 0) {
  console.error('❌ Missing required variables:');
  for (const varName of missingVars) {
    console.error(`  ${varName}`);
  }
  console.error('\nℹ️  For local development, add them to .env.local');
  console.error('ℹ️  For Vercel, add them in Dashboard: Settings > Environment Variables\n');
  process.exit(1);
}

console.log('✅ All required environment variables are set!\n');
