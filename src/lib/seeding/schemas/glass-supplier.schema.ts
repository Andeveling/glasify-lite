/**
 * @file GlassSupplier Schema
 * @description Zod schema for GlassSupplier seeding
 * Derived from Drizzle schema (glass-supplier.schema.ts)
 */

import { z } from "zod";
import { GLASS_SUPPLIER_FIELD_LENGTHS } from "@/server/db/schemas/constants/glass-supplier.constants";
import { glassSupplierInsertSchema } from "@/server/db/schemas/glass-supplier.schema";

/**
 * GlassSupplier creation input schema
 * Validates data before persistence (runtime + compile-time)
 *
 * Fields:
 * - name: Supplier name (required, 1-100 chars, unique)
 * - code: Supplier code (optional, max 50 chars, unique)
 * - country: Country of origin (optional, max 100 chars)
 * - website: Supplier website URL (optional, max 255 chars)
 * - contactEmail: Contact email (optional, valid email format)
 * - contactPhone: Contact phone (optional, max 20 chars)
 * - isActive: Active status (defaults to "true")
 * - notes: Additional notes (optional, max 500 chars)
 *
 * @example
 * ```typescript
 * const data: GlassSupplierCreateInput = {
 *   name: "Vidrios Lux",
 *   code: "VLUX",
 *   country: "Colombia",
 *   website: "https://vidrioslux.com",
 *   contactEmail: "info@vidrioslux.com",
 *   contactPhone: "3001234567",
 *   isActive: "true",
 * };
 * ```
 */
export const glassSupplierSchema = glassSupplierInsertSchema
  .extend({
    // Override name validation - no leading/trailing whitespace
    name: z.string().min(1).max(GLASS_SUPPLIER_FIELD_LENGTHS.NAME).trim(),

    // Override code validation - uppercase alphanumeric
    code: z
      .string()
      .max(GLASS_SUPPLIER_FIELD_LENGTHS.CODE)
      .regex(/^[A-Z0-9-]+$/, "Code must be uppercase alphanumeric with hyphens")
      .optional(),

    // Override country validation
    country: z.string().max(GLASS_SUPPLIER_FIELD_LENGTHS.COUNTRY).optional(),

    // Override website validation - must be valid URL
    website: z
      .string()
      .url("Must be a valid URL")
      .max(GLASS_SUPPLIER_FIELD_LENGTHS.WEBSITE)
      .optional(),

    // Override contact email validation
    contactEmail: z
      .string()
      .email("Must be a valid email")
      .max(GLASS_SUPPLIER_FIELD_LENGTHS.CONTACT_EMAIL)
      .optional(),

    // Override contact phone validation - Colombian format
    contactPhone: z
      .string()
      .max(GLASS_SUPPLIER_FIELD_LENGTHS.CONTACT_PHONE)
      .optional(),

    // Override isActive - ensure string type for Drizzle
    isActive: z
      .preprocess(
        (val) => (val === true || val === "true" ? "true" : "false"),
        z.string()
      )
      .optional(),

    // Override notes validation
    notes: z.string().max(GLASS_SUPPLIER_FIELD_LENGTHS.NOTES).optional(),
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    tenantConfigId: true, // Managed by seeder
  });

/**
 * TypeScript type inferred from Zod schema
 * Guaranteed to match validation rules at compile-time AND runtime
 */
export type GlassSupplierCreateInput = z.infer<typeof glassSupplierSchema>;

/**
 * Preset glass supplier names (real Colombian and international brands)
 */
export const GLASS_SUPPLIER_PRESETS = [
  // Colombian suppliers
  "Vidrios Lux",
  "Vidriería Nacional",
  "Cristales de Colombia",
  "Industria de Vidrios SA",
  "Vidriera del Pacífico",
  "Vidrios del Norte",
  "Cristalería Colombiana",
  "Vidrios Andinos",

  // International suppliers
  "Saint-Gobain",
  "Guardian Glass",
  "AGC Glass",
  "Pilkington",
  "Vitro Glass",
  "Fuyao Glass",
  "Central Glass",
  "PPG Industries",
  "Schott AG",
  "Corning Glass",

  // Regional suppliers
  "Vidrios de Centroamérica",
  "Cristales del Caribe",
  "Industria Vidriera Latinoamericana",
  "Vidrios del Sur",
  "Cristalería Panamericana",
] as const;

/**
 * Common supplier codes mapping
 */
export const SUPPLIER_CODES: Record<string, string> = {
  "Vidrios Lux": "VLUX",
  "Vidriería Nacional": "VNAC",
  "Saint-Gobain": "SGB",
  "Guardian Glass": "GGC",
  "AGC Glass": "AGC",
  Pilkington: "PIL",
  "Vitro Glass": "VIT",
  "Fuyao Glass": "FUY",
  "PPG Industries": "PPG",
};

/**
 * Default countries for suppliers
 */
export const SUPPLIER_COUNTRIES: Record<string, string> = {
  "Vidrios Lux": "Colombia",
  "Vidriería Nacional": "Colombia",
  "Cristales de Colombia": "Colombia",
  "Saint-Gobain": "Francia",
  "Guardian Glass": "Estados Unidos",
  "AGC Glass": "Japón",
  Pilkington: "Reino Unido",
  "Vitro Glass": "México",
  "Fuyao Glass": "China",
  "PPG Industries": "Estados Unidos",
};
