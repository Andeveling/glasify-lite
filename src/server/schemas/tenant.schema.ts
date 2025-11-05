/**
 * Zod Validation Schemas for TenantConfig
 *
 * @see /plan/refactor-manufacturer-to-tenant-config-1.md
 */

import { z } from "zod";

// Validation constants
const CURRENCY_CODE_LENGTH = 3;
const MAX_TIMEZONE_LENGTH = 50;
const MAX_BUSINESS_NAME_LENGTH = 100;
const MAX_QUOTE_VALIDITY_DAYS = 365;
const DEFAULT_QUOTE_VALIDITY_DAYS = 15;
const MAX_PHONE_LENGTH = 20;
const MAX_ADDRESS_LENGTH = 500;

/**
 * ISO 4217 Currency Code Schema
 * Common currencies: COP, USD, EUR, MXN, ARS, CLP
 */
export const currencyCodeSchema = z
  .string()
  .length(CURRENCY_CODE_LENGTH, "Currency code must be exactly 3 characters")
  .regex(/^[A-Z]{3}$/, "Currency code must be 3 uppercase letters (ISO 4217)")
  .describe("ISO 4217 currency code (e.g., COP, USD, EUR)");

/**
 * Locale Schema
 * Format: language-COUNTRY (e.g., es-CO, en-US)
 */
export const localeSchema = z
  .string()
  .regex(
    /^[a-z]{2}-[A-Z]{2}$/,
    "Locale must follow format: language-COUNTRY (e.g., es-CO)"
  )
  .describe("Locale in format language-COUNTRY");

/**
 * IANA Timezone Schema
 */
export const timezoneSchema = z
  .string()
  .min(1, { error: "Timezone cannot be empty" })
  .max(MAX_TIMEZONE_LENGTH, { error: "Timezone cannot exceed 50 characters" })
  .describe("IANA timezone identifier (e.g., America/Bogota)");

/**
 * Create TenantConfig Schema
 */
export const createTenantConfigSchema = z.object({
  businessAddress: z
    .string()
    .max(MAX_ADDRESS_LENGTH, { error: "Address cannot exceed 500 characters" })
    .optional()
    .nullable(),
  businessName: z
    .string()
    .min(1, { error: "Business name is required" })
    .max(MAX_BUSINESS_NAME_LENGTH, {
      error: "Business name cannot exceed 100 characters",
    }),
  contactEmail: z
    .string()
    .email({ error: "Invalid email format" })
    .optional()
    .nullable(),
  contactPhone: z
    .string()
    .max(MAX_PHONE_LENGTH, {
      error: "Phone number cannot exceed 20 characters",
    })
    .optional()
    .nullable(),
  currency: currencyCodeSchema,
  locale: localeSchema.default("es-CO"),
  quoteValidityDays: z
    .number()
    .int({ error: "Quote validity must be a whole number" })
    .min(1, { error: "Quote validity must be at least 1 day" })
    .max(MAX_QUOTE_VALIDITY_DAYS, {
      error: "Quote validity cannot exceed 365 days",
    })
    .default(DEFAULT_QUOTE_VALIDITY_DAYS),
  timezone: timezoneSchema.default("America/Bogota"),
});

/**
 * Update TenantConfig Schema
 * All fields are optional for updates
 */
export const updateTenantConfigSchema = createTenantConfigSchema.partial();

/**
 * TenantConfig Response Schema
 */
export const tenantConfigResponseSchema = createTenantConfigSchema.extend({
  createdAt: z.date(),
  id: z.string().cuid(),
  updatedAt: z.date(),
});

// Type exports for TypeScript inference
export type CreateTenantConfigInput = z.infer<typeof createTenantConfigSchema>;
export type UpdateTenantConfigInput = z.infer<typeof updateTenantConfigSchema>;
export type TenantConfigResponse = z.infer<typeof tenantConfigResponseSchema>;
