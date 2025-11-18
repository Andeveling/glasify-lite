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
const DEFAULT_EXPORT_MAX_ITEMS = 100;

// Unified environment variables extraction
const {
  // Client-side variables
  NEXT_PUBLIC_BASE_URL,
  NEXT_PUBLIC_COMPANY_LOGO_URL,
  NEXT_PUBLIC_COMPANY_NAME,
  NEXT_PUBLIC_TENANT_BUSINESS_NAME,
  NEXT_PUBLIC_TENANT_CONTACT_EMAIL,
  NEXT_PUBLIC_TENANT_CONTACT_PHONE,
  NEXT_PUBLIC_TENANT_BUSINESS_ADDRESS,
  NEXT_PUBLIC_TENANT_CURRENCY,
  NEXT_PUBLIC_TENANT_LOCALE,
  NEXT_PUBLIC_TENANT_QUOTE_VALIDITY_DAYS,
  NEXT_PUBLIC_TENANT_TIMEZONE,
  NEXT_PUBLIC_VERCEL_ENV,
  NEXT_PUBLIC_VERCEL_URL,
  NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
  // Server-side variables
  ADMIN_EMAIL,
  AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET,
  BASE_URL,
  BETTER_AUTH_SECRET,
  DATABASE_URL,
  PRISMA_CONNECTION_LIMIT,
  NODE_ENV,
  RESEND_API_KEY,
  FROM_EMAIL,
  EXPORT_PDF_PAGE_SIZE,
  EXPORT_MAX_ITEMS,
  SKIP_ENV_VALIDATION,
} = process.env;

export const env = createEnv({
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_COMPANY_LOGO_URL: z.url().optional().or(z.literal("")),
    NEXT_PUBLIC_COMPANY_NAME: z.string().optional(),
    NEXT_PUBLIC_TENANT_BUSINESS_NAME: z.string().min(1),
    NEXT_PUBLIC_TENANT_CONTACT_EMAIL: z.email().optional().or(z.literal("")),
    NEXT_PUBLIC_TENANT_CONTACT_PHONE: z.string().optional().or(z.literal("")),
    NEXT_PUBLIC_TENANT_BUSINESS_ADDRESS: z
      .string()
      .optional()
      .or(z.literal("")),
    NEXT_PUBLIC_TENANT_CURRENCY: z.string().length(CURRENCY_CODE_LENGTH),
    NEXT_PUBLIC_TENANT_LOCALE: z.string().min(2),
    NEXT_PUBLIC_TENANT_QUOTE_VALIDITY_DAYS: z.coerce
      .number()
      .int()
      .positive()
      .default(DEFAULT_QUOTE_VALIDITY_DAYS),
    NEXT_PUBLIC_TENANT_TIMEZONE: z.string().min(1),
    NEXT_PUBLIC_VERCEL_ENV: z
      .enum(["production", "preview", "development"])
      .optional(),
    NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    // Client-side variables
    NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_COMPANY_LOGO_URL,
    NEXT_PUBLIC_COMPANY_NAME,
    NEXT_PUBLIC_TENANT_BUSINESS_NAME,
    NEXT_PUBLIC_TENANT_CONTACT_EMAIL,
    NEXT_PUBLIC_TENANT_CONTACT_PHONE,
    NEXT_PUBLIC_TENANT_BUSINESS_ADDRESS,
    NEXT_PUBLIC_TENANT_CURRENCY,
    NEXT_PUBLIC_TENANT_LOCALE,
    NEXT_PUBLIC_TENANT_QUOTE_VALIDITY_DAYS,
    NEXT_PUBLIC_TENANT_TIMEZONE,
    NEXT_PUBLIC_VERCEL_ENV,
    NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    // Server-side variables
    ADMIN_EMAIL,
    AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET,
    BASE_URL,
    BETTER_AUTH_SECRET,
    DATABASE_URL,
    PRISMA_CONNECTION_LIMIT,
    NODE_ENV,
    TENANT_BUSINESS_ADDRESS: NEXT_PUBLIC_TENANT_BUSINESS_ADDRESS,
    TENANT_BUSINESS_NAME: NEXT_PUBLIC_TENANT_BUSINESS_NAME,
    TENANT_CONTACT_EMAIL: NEXT_PUBLIC_TENANT_CONTACT_EMAIL,
    TENANT_CONTACT_PHONE: NEXT_PUBLIC_TENANT_CONTACT_PHONE,
    TENANT_CURRENCY: NEXT_PUBLIC_TENANT_CURRENCY,
    TENANT_LOCALE: NEXT_PUBLIC_TENANT_LOCALE,
    TENANT_QUOTE_VALIDITY_DAYS: NEXT_PUBLIC_TENANT_QUOTE_VALIDITY_DAYS,
    TENANT_TIMEZONE: NEXT_PUBLIC_TENANT_TIMEZONE,
    RESEND_API_KEY,
    FROM_EMAIL,
    EXPORT_PDF_PAGE_SIZE,
    EXPORT_MAX_ITEMS,
  },
  server: {
    ADMIN_EMAIL: z.email().optional(),
    AUTH_GOOGLE_ID: z.string(),
    AUTH_GOOGLE_SECRET: z.string(),
    BASE_URL: z.url().optional(),
    BETTER_AUTH_SECRET:
      NODE_ENV === "production" ? z.string() : z.string().optional(),
    DATABASE_URL: z.url(),
    PRISMA_CONNECTION_LIMIT: z
      .string()
      .regex(/^\d+$/, "Must be a positive integer")
      .transform((val) => Number.parseInt(val, 10))
      .optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    TENANT_BUSINESS_ADDRESS: z.string().optional().or(z.literal("")),
    TENANT_BUSINESS_NAME: z.string().optional(),
    TENANT_CONTACT_EMAIL: z.string().email().optional().or(z.literal("")),
    TENANT_CONTACT_PHONE: z.string().optional().or(z.literal("")),
    TENANT_CURRENCY: z
      .string()
      .length(CURRENCY_CODE_LENGTH, "Must be 3-character ISO code")
      .toUpperCase()
      .optional(),
    TENANT_LOCALE: z
      .string()
      .regex(/^[a-z]{2}-[A-Z]{2}$/, "Format: xx-XX (e.g., es-CO)")
      .optional(),
    TENANT_QUOTE_VALIDITY_DAYS: z
      .string()
      .regex(/^\d+$/, "Must be a positive integer")
      .transform((val) => Number.parseInt(val, 10))
      .optional(),
    TENANT_TIMEZONE: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    FROM_EMAIL: z.email().optional().or(z.literal("")),
    EXPORT_PDF_PAGE_SIZE: z
      .enum(["A4", "LETTER", "LEGAL"])
      .optional()
      .default("A4"),
    EXPORT_MAX_ITEMS: z
      .string()
      .regex(/^\d+$/, "Must be a positive integer")
      .transform((val) => Number.parseInt(val, 10))
      .optional()
      .default(DEFAULT_EXPORT_MAX_ITEMS),
  },
  skipValidation: !!SKIP_ENV_VALIDATION,
});
