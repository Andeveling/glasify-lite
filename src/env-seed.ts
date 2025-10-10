/**
 * Seed Environment Variables Validation
 *
 * This file validates environment variables specifically used by the seed scripts.
 * It ensures that all required tenant configuration data is present before seeding.
 *
 * Uses @t3-oss/env-nextjs for runtime validation with Zod schemas.
 *
 * @see https://env.t3.gg/docs/core
 */

import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Constants for validation
const CURRENCY_CODE_LENGTH = 3;
const DEFAULT_QUOTE_VALIDITY_DAYS = 15;

export const envSeed = createEnv({
  /**
   * Client-side environment variables (not used in seed)
   * We specify an empty object since seed scripts are server-only
   */
  client: {},

  /**
   * Treat empty strings as undefined
   * This makes optional fields work correctly when empty in .env
   */
  emptyStringAsUndefined: true,

  /**
   * Environment variables present in process.env
   * Only include variables that should be validated
   */
  runtimeEnv: {
    TENANT_BUSINESS_ADDRESS: process.env.TENANT_BUSINESS_ADDRESS,
    TENANT_BUSINESS_NAME: process.env.TENANT_BUSINESS_NAME,
    TENANT_CONTACT_EMAIL: process.env.TENANT_CONTACT_EMAIL,
    TENANT_CONTACT_PHONE: process.env.TENANT_CONTACT_PHONE,
    TENANT_CURRENCY: process.env.TENANT_CURRENCY,
    TENANT_LOCALE: process.env.TENANT_LOCALE,
    TENANT_QUOTE_VALIDITY_DAYS: process.env.TENANT_QUOTE_VALIDITY_DAYS,
    TENANT_TIMEZONE: process.env.TENANT_TIMEZONE,
  },
  /**
   * Server-side environment variables for seed scripts
   * These are only available in Node.js environment (seed scripts)
   */
  server: {
    /**
     * Business physical address
     * @example "Calle 123 #45-67, Bogotá, Colombia"
     * @optional
     */
    TENANT_BUSINESS_ADDRESS: z.string().optional().or(z.literal('')),
    // ============================================================
    // TENANT CONFIGURATION (Required for TenantConfig seed)
    // ============================================================

    /**
     * Business name that appears in quotes and invoices
     * @example "Glasify Solutions S.A.S."
     * @required
     */
    TENANT_BUSINESS_NAME: z.string().min(1, {
      message: 'TENANT_BUSINESS_NAME is required for seed scripts',
    }),

    // ============================================================
    // TENANT CONTACT INFO (Optional)
    // ============================================================

    /**
     * Business contact email
     * @example "ventas@glasify.com"
     * @optional
     */
    TENANT_CONTACT_EMAIL: z.string().email().optional().or(z.literal('')),

    /**
     * Business contact phone number (any format)
     * @example "+57 300 123 4567", "(601) 234-5678"
     * @optional
     */
    TENANT_CONTACT_PHONE: z.string().optional().or(z.literal('')),

    /**
     * ISO 4217 currency code (3 characters)
     * @example "COP" (Colombian Peso), "USD" (US Dollar), "EUR" (Euro)
     * @default "COP"
     * @required
     */
    TENANT_CURRENCY: z
      .string()
      .length(CURRENCY_CODE_LENGTH, 'Currency must be a 3-character ISO code')
      .toUpperCase()
      .default('COP'),

    /**
     * Locale for date/number formatting (IETF BCP 47 language tag)
     * @example "es-CO" (Spanish Colombia), "en-US" (English US), "es-MX" (Spanish Mexico)
     * @default "es-CO"
     * @required
     */
    TENANT_LOCALE: z
      .string()
      .regex(/^[a-z]{2}-[A-Z]{2}$/, 'Locale must be in format: xx-XX (e.g., es-CO)')
      .default('es-CO'),

    /**
     * Number of days a quote is valid before expiring
     * @example "15", "30", "7"
     * @default "15"
     * @required
     */
    TENANT_QUOTE_VALIDITY_DAYS: z.coerce
      .number()
      .int()
      .positive()
      .default(DEFAULT_QUOTE_VALIDITY_DAYS)
      .transform((val) => Number(val)),

    /**
     * IANA timezone identifier
     * @example "America/Bogota", "America/New_York", "America/Mexico_City"
     * @default "America/Bogota"
     * @required
     */
    TENANT_TIMEZONE: z.string().min(1).default('America/Bogota'),
  },

  /**
   * Skip validation during build (seed runs separately)
   * This prevents errors during Next.js build when seed vars aren't needed
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
