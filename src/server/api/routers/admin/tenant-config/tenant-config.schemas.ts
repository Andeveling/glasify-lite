/**
 * TenantConfig Schemas - Zod Validation (tRPC Input/Output)
 *
 * Uses drizzle-zod auto-generated schemas from DB layer.
 * Single source of truth: Drizzle table → auto-sync validation
 *
 * @module server/api/routers/admin/tenant-config/tenant-config.schemas
 */

import { z } from "zod";
import {
  tenantConfigSelectSchema,
  tenantConfigUpdateSchema,
} from "@/server/db/schemas/tenant-config.schema";

// ============================================================================
// INPUT SCHEMAS (tRPC procedures)
// ============================================================================

/**
 * Update tenant config input schema - reuse from Drizzle update schema
 */
export const updateTenantConfigInput = tenantConfigUpdateSchema;

/**
 * Update branding input schema - subset of tenant config
 */
export const updateBrandingInput = tenantConfigUpdateSchema.pick({
  facebookUrl: true,
  instagramUrl: true,
  linkedinUrl: true,
  logoUrl: true,
  primaryColor: true,
  secondaryColor: true,
  whatsappEnabled: true,
  whatsappNumber: true,
});

// ============================================================================
// OUTPUT SCHEMAS (tRPC procedures response types)
// ============================================================================

/**
 * Tenant config output schema - extends drizzle-zod auto-generated SELECT schema
 * Converts Drizzle types (text/decimal) to proper API types (number/boolean)
 */
export const tenantConfigOutput = tenantConfigSelectSchema.extend({
  quoteValidityDays: z.number().int().positive(),
  whatsappEnabled: z.boolean(),
  warehouseLatitude: z.number().optional(),
  warehouseLongitude: z.number().optional(),
  transportBaseRate: z.number().optional(),
  transportPerKmRate: z.number().optional(),
});

/**
 * Branding output schema - subset for public queries
 */
export const brandingOutput = tenantConfigOutput.pick({
  businessName: true,
  facebookUrl: true,
  instagramUrl: true,
  linkedinUrl: true,
  logoUrl: true,
  primaryColor: true,
  secondaryColor: true,
  whatsappEnabled: true,
  whatsappNumber: true,
});

// ============================================================================
// TYPE EXPORTS (for TypeScript)
// ============================================================================

export type UpdateTenantConfigInput = z.infer<typeof updateTenantConfigInput>;
export type UpdateBrandingInput = z.infer<typeof updateBrandingInput>;
export type TenantConfigOutput = z.infer<typeof tenantConfigOutput>;
export type BrandingOutput = z.infer<typeof brandingOutput>;
