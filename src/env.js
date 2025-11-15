/**
 * Environment Variables Validation
 *
 * Validates all environment variables used by the application at build time.
 * Uses @t3-oss/env-nextjs for type-safe runtime validation with Zod schemas.
 *
 * @see https://env.t3.gg/docs/nextjs
 * @see https://create.t3.gg/en/usage/env-variables
 */

import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

// Constants for validation
const CURRENCY_CODE_LENGTH = 3;
const DEFAULT_QUOTE_VALIDITY_DAYS = 15;

export const env = createEnv({
  // ============================================================
  // CLIENT-SIDE VARIABLES (Exposed to Browser)
  // ============================================================
  // Prefix with NEXT_PUBLIC_* to expose to client-side code
  // These are INLINED at build time into the JavaScript bundle
  client: {
    /**
     * Company logo URL for UI display
     * @example "/logo.png", "https://cdn.example.com/logo.svg"
     */
    NEXT_PUBLIC_COMPANY_LOGO_URL: z.url().optional().or(z.literal("")),

    /**
     * Company name displayed in UI components
     * @example "Vitro Rojas", "Glasify Solutions"
     */
    NEXT_PUBLIC_COMPANY_NAME: z.string().optional(),

    /**
     * Tenant business name (build-time config)
     * @example "Vitro Rojas S.A.S."
     */
    NEXT_PUBLIC_TENANT_BUSINESS_NAME: z.string().min(1),

    /**
     * Tenant currency code (ISO 4217)
     * @example "COP", "USD", "EUR"
     */
    NEXT_PUBLIC_TENANT_CURRENCY: z.string().length(CURRENCY_CODE_LENGTH),

    /**
     * Tenant locale (BCP 47 language tag)
     * @example "es-CO", "en-US"
     */
    NEXT_PUBLIC_TENANT_LOCALE: z.string().min(2),

    /**
     * Quote validity in days
     * @default 15
     */
    NEXT_PUBLIC_TENANT_QUOTE_VALIDITY_DAYS: z.coerce
      .number()
      .int()
      .positive()
      .default(DEFAULT_QUOTE_VALIDITY_DAYS),

    /**
     * Tenant timezone (IANA timezone identifier)
     * @example "America/Bogota", "America/New_York"
     */
    NEXT_PUBLIC_TENANT_TIMEZONE: z.string().min(1),

    /**
     * Vercel environment name
     * Auto-set by Vercel to: "production", "preview", "development"
     */
    NEXT_PUBLIC_VERCEL_ENV: z
      .enum(["production", "preview", "development"])
      .optional(),

    /**
     * Vercel deployment URL (branch deployments)
     * Auto-set by Vercel
     * @example "my-app-abc123.vercel.app"
     */
    NEXT_PUBLIC_VERCEL_URL: z.string().optional(),

    /**
     * Vercel production URL (main branch)
     * Auto-set by Vercel
     * @example "my-app.com"
     */
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  },

  /**
   * Treat empty strings as undefined
   * Makes optional fields work correctly when empty in .env
   */
  emptyStringAsUndefined: true,

  /**
   * Runtime environment object
   * Must manually destructure process.env for Edge Runtime compatibility
   */
  runtimeEnv: {
    // Auth
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
    BASE_URL: process.env.BASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,

    // Database
    DATABASE_URL: process.env.DATABASE_URL,
    PRISMA_CONNECTION_LIMIT: process.env.PRISMA_CONNECTION_LIMIT,

    // Client-side (public)
    NEXT_PUBLIC_COMPANY_LOGO_URL: process.env.NEXT_PUBLIC_COMPANY_LOGO_URL,
    NEXT_PUBLIC_COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME,
    NEXT_PUBLIC_TENANT_BUSINESS_NAME:
      process.env.NEXT_PUBLIC_TENANT_BUSINESS_NAME,
    NEXT_PUBLIC_TENANT_CURRENCY: process.env.NEXT_PUBLIC_TENANT_CURRENCY,
    NEXT_PUBLIC_TENANT_LOCALE: process.env.NEXT_PUBLIC_TENANT_LOCALE,
    NEXT_PUBLIC_TENANT_QUOTE_VALIDITY_DAYS:
      process.env.NEXT_PUBLIC_TENANT_QUOTE_VALIDITY_DAYS,
    NEXT_PUBLIC_TENANT_TIMEZONE: process.env.NEXT_PUBLIC_TENANT_TIMEZONE,
    NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL:
      process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,

    // System
    NODE_ENV: process.env.NODE_ENV,

    // Tenant (for seed scripts - optional at runtime)
    TENANT_BUSINESS_ADDRESS: process.env.TENANT_BUSINESS_ADDRESS,
    TENANT_BUSINESS_NAME: process.env.TENANT_BUSINESS_NAME,
    TENANT_CONTACT_EMAIL: process.env.TENANT_CONTACT_EMAIL,
    TENANT_CONTACT_PHONE: process.env.TENANT_CONTACT_PHONE,
    TENANT_CURRENCY: process.env.TENANT_CURRENCY,
    TENANT_LOCALE: process.env.TENANT_LOCALE,
    TENANT_QUOTE_VALIDITY_DAYS: process.env.TENANT_QUOTE_VALIDITY_DAYS,
    TENANT_TIMEZONE: process.env.TENANT_TIMEZONE,

    // Email Service (optional)
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FROM_EMAIL: process.env.FROM_EMAIL,

    // Export Configuration (optional)
    EXPORT_PDF_PAGE_SIZE: process.env.EXPORT_PDF_PAGE_SIZE,
    EXPORT_MAX_ITEMS: process.env.EXPORT_MAX_ITEMS,
  },
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    // ============================================================
    // AUTHENTICATION
    // ============================================================

    /**
     * Admin user email (optional)
     * User with this email gets admin role and dashboard access
     */
    ADMIN_EMAIL: z.string().email().optional(),

    /**
     * Google OAuth Client ID
     * Get from: https://console.cloud.google.com/
     */
    AUTH_GOOGLE_ID: z.string(),

    /**
     * Google OAuth Client Secret
     * Get from: https://console.cloud.google.com/
     */
    AUTH_GOOGLE_SECRET: z.string(),

    /**
     * Base URL for auth callbacks
     * @example "http://localhost:3000", "https://app.example.com"
     */
    BASE_URL: z.string().url().optional(),

    /**
     * Better Auth secret key
     * Generate with: npx auth secret
     * REQUIRED in production, optional in dev
     */
    BETTER_AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),

    // ============================================================
    // DATABASE
    // ============================================================

    /**
     * Pooled database connection string (Neon)
     * Use for: App queries (Server Components, API Routes, tRPC)
     * Format: postgresql://user:pass@host-pooler.region.aws.neon.tech/db
     */
    DATABASE_URL: z.string().url(),

    /**
     * Prisma connection limit during build/migrations
     * Prevents "too many connections" on Neon Free Tier
     * @example "1" for Free Tier, "5" for Pro, omit for unlimited
     */
    PRISMA_CONNECTION_LIMIT: z
      .string()
      .regex(/^\d+$/, "Must be a positive integer")
      .transform((val) => Number.parseInt(val, 10))
      .optional(),

    // ============================================================
    // SYSTEM
    // ============================================================

    /**
     * Node environment
     * Auto-set by Next.js, rarely needs manual override
     */
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    // ============================================================
    // TENANT CONFIGURATION (For Seed Scripts)
    // ============================================================
    // These variables configure the TenantConfig singleton record
    // Required by: prisma/seed-tenant.ts
    // Validated by: src/env-seed.ts (stricter validation)
    // Optional at runtime (only needed for seeding)

    /**
     * Business physical address (optional)
     * @example "Calle 123 #45-67, Bogotá, Colombia"
     */
    TENANT_BUSINESS_ADDRESS: z.string().optional().or(z.literal("")),

    /**
     * Business name for quotes/invoices (required for seed)
     * @example "Glasify Solutions S.A.S.", "Vitro Rojas"
     */
    TENANT_BUSINESS_NAME: z.string().optional(),

    /**
     * Business contact email (optional)
     * @example "ventas@glasify.com"
     */
    TENANT_CONTACT_EMAIL: z.string().email().optional().or(z.literal("")),

    /**
     * Business contact phone (optional, any format)
     * @example "+57 300 123 4567", "(601) 234-5678"
     */
    TENANT_CONTACT_PHONE: z.string().optional().or(z.literal("")),

    /**
     * ISO 4217 currency code (optional, defaults in seed)
     * @example "COP", "USD", "EUR", "MXN"
     */
    TENANT_CURRENCY: z
      .string()
      .length(CURRENCY_CODE_LENGTH, "Must be 3-character ISO code")
      .toUpperCase()
      .optional(),

    /**
     * IETF BCP 47 locale (optional, defaults in seed)
     * @example "es-CO", "en-US", "es-MX", "es-PA"
     */
    TENANT_LOCALE: z
      .string()
      .regex(/^[a-z]{2}-[A-Z]{2}$/, "Format: xx-XX (e.g., es-CO)")
      .optional(),

    /**
     * Quote validity in days (optional, defaults in seed)
     * @example "15", "30", "7"
     */
    TENANT_QUOTE_VALIDITY_DAYS: z
      .string()
      .regex(/^\d+$/, "Must be a positive integer")
      .transform((val) => Number.parseInt(val, 10))
      .optional(),

    /**
     * IANA timezone identifier (optional, defaults in seed)
     * @example "America/Bogota", "America/Panama", "America/New_York"
     */
    TENANT_TIMEZONE: z.string().optional(),

    // ============================================================
    // EMAIL SERVICE (Optional - Resend)
    // ============================================================

    /**
     * Resend API key for sending emails
     * Get from: https://resend.com/
     * Optional: only if using email features
     */
    RESEND_API_KEY: z.string().optional(),

    /**
     * Email sender address for Resend
     * @example "noreply@glasify-lite.vercel.app"
     */
    FROM_EMAIL: z.string().email().optional().or(z.literal("")),

    // ============================================================
    // EXPORT CONFIGURATION (Optional)
    // ============================================================

    /**
     * PDF page size for quote exports
     * @example "A4", "LETTER", "LEGAL"
     */
    EXPORT_PDF_PAGE_SIZE: z
      .enum(["A4", "LETTER", "LEGAL"])
      .optional()
      .default("A4"),

    /**
     * Maximum items per quote export
     * @example "100", "200"
     */
    EXPORT_MAX_ITEMS: z
      .string()
      .regex(/^\d+$/, "Must be a positive integer")
      .transform((val) => Number.parseInt(val, 10))
      .optional()
      // biome-ignore lint/style/noMagicNumbers: Not necessary to create constant
      .default(100),
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
