/**
 * Zod Validation Schemas for TenantConfig (server-side)
 *
 * Field schemas imported from shared lib/schemas/tenant.config.ts
 */

import { z } from 'zod'
import { currencySchema, localeSchema, timezoneSchema } from '@/lib/schemas/tenant.config'

const MAX_TIMEZONE_LENGTH = 50
const MAX_BUSINESS_NAME_LENGTH = 100
const MAX_QUOTE_VALIDITY_DAYS = 365
const DEFAULT_QUOTE_VALIDITY_DAYS = 15
const MAX_PHONE_LENGTH = 20
const MAX_ADDRESS_LENGTH = 500

/**
 * Create TenantConfig Schema
 */
export const createTenantConfigSchema = z.object({
  businessAddress: z
    .string()
    .max(MAX_ADDRESS_LENGTH, { error: 'Address cannot exceed 500 characters' })
    .optional()
    .nullable(),
  businessName: z
    .string()
    .min(1, { error: 'Business name is required' })
    .max(MAX_BUSINESS_NAME_LENGTH, {
      error: 'Business name cannot exceed 100 characters',
    }),
  contactEmail: z.string().email({ error: 'Invalid email format' }).optional().nullable(),
  contactPhone: z
    .string()
    .max(MAX_PHONE_LENGTH, {
      error: 'Phone number cannot exceed 20 characters',
    })
    .optional()
    .nullable(),
  currency: currencySchema,
  locale: localeSchema.default('es-CO'),
  quoteValidityDays: z
    .number()
    .int({ error: 'Quote validity must be a whole number' })
    .min(1, { error: 'Quote validity must be at least 1 day' })
    .max(MAX_QUOTE_VALIDITY_DAYS, {
      error: 'Quote validity cannot exceed 365 days',
    })
    .default(DEFAULT_QUOTE_VALIDITY_DAYS),
  timezone: timezoneSchema.max(MAX_TIMEZONE_LENGTH).default('America/Bogota'),
})

/**
 * Update TenantConfig Schema
 * All fields are optional for updates
 */
export const updateTenantConfigSchema = createTenantConfigSchema.partial()

/**
 * TenantConfig Response Schema
 */
export const tenantConfigResponseSchema = createTenantConfigSchema.extend({
  createdAt: z.date(),
  id: z.string().cuid(),
  updatedAt: z.date(),
})

export type CreateTenantConfigInput = z.infer<typeof createTenantConfigSchema>
export type UpdateTenantConfigInput = z.infer<typeof updateTenantConfigSchema>
export type TenantConfigResponse = z.infer<typeof tenantConfigResponseSchema>
